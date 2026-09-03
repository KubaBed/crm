#!/usr/bin/env node
/**
 * sync-vault-crm.mjs - jednokierunkowy sync leadów z bazy wiedzy (Obsidian vault) do CRM.
 *
 * Następca `SimpleCRM/scripts/sync-vault-leads.mjs`. Te same decyzje projektowe:
 *   - vault = źródło prawdy dla DANYCH o firmie (nazwa, www, branża, źródło, wiedza),
 *     CRM = źródło prawdy dla PIPELINE'U (stage deala, aktywności). Stage ustawiany
 *     wyłącznie przy tworzeniu deala; przy UPDATE nietykany.
 *   - kwalifikacja JAWNA: plik musi mieć `crm-sync: true` albo już `crm:`; `crm-sync: false`
 *     to weto. Reszta ląduje w raporcie jako kandydaci (z komendą --enable).
 *   - własny, tolerancyjny parser frontmattera (pliki bywają ręcznie uszkodzone).
 *   - idempotencja przez `crm:` we frontmatterze (URL firmy w app) i przez domenę firmy.
 *   - dry-run domyślnie; `--apply` wykonuje; `--verbose` pokazuje payloady.
 *
 * Model: 1 plik leada -> Company (+ Contact, gdy znamy osobę) (+ Deal, gdy status
 * oznacza rozmowę). Notatka "Z bazy wiedzy" jako Activity NOTE (jedna, nadpisywana
 * przez usunięcie starej o tym samym subject).
 *
 * Env: CRM_API_URL, CRM_API_KEY (jak crm.mjs), VAULT_CLIENTS_DIR (domyślnie
 * ~/Projekty/baza-wiedzy/wiki/clients), CRM_APP_URL (domyślnie z API_URL: api.crm.x -> crm.x).
 *
 *   node workshift/sync-vault-crm.mjs                 # dry-run
 *   node workshift/sync-vault-crm.mjs --verbose       # dry-run + payloady
 *   node workshift/sync-vault-crm.mjs --apply         # wykonuje
 *   node workshift/sync-vault-crm.mjs --enable <plik...>   # dopisuje crm-sync: true
 *   --no-writeback   nie dopisuje `crm:` do vaulta (automatycznie przy localhost, do testów)
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { homedir } from 'node:os'
import { api } from './crm.mjs'

const VAULT_CLIENTS_DIR = process.env.VAULT_CLIENTS_DIR || join(homedir(), 'Projekty/baza-wiedzy/wiki/clients')
const API_URL = (process.env.CRM_API_URL || 'http://localhost:3001').replace(/\/+$/, '')
const APP_URL = (process.env.CRM_APP_URL || API_URL.replace('://api.', '://').replace(':3001', ':3000')).replace(/\/+$/, '')
const APPLY = process.argv.includes('--apply')
const VERBOSE = process.argv.includes('--verbose')
const NO_WRITEBACK = process.argv.includes('--no-writeback') || /localhost|127\.0\.0\.1/.test(APP_URL)
const ENABLE_IDX = process.argv.indexOf('--enable')
const ENABLE_PATHS = ENABLE_IDX === -1 ? [] : process.argv.slice(ENABLE_IDX + 1).filter((a) => !a.startsWith('--'))

/** Status w vaulcie -> stage deala. `null` = firma bez deala (jeszcze nie rozmawiamy). */
const STATUS_TO_STAGE = {
  nowy: null,
  researched: null,
  'analiza-gotowa-czeka-na-kwalifikacje': null,
  kontakt: 'DEMO_BOOKED',
  active: 'DEMO_BOOKED',
  paused: 'DEMO_BOOKED',
  'pre-discovery': 'DEMO_BOOKED',
  konsultacja: 'QUALIFIED_TO_BUY',
  'referral-channel': 'QUALIFIED_TO_BUY',
  oferta: 'CONTRACT_SENT',
  proposal: 'CONTRACT_SENT',
  wygrana: 'CLOSED_WON',
  klient: 'CLOSED_WON',
  przegrana: 'CLOSED_LOST',
  disqualified: 'CLOSED_LOST',
  odrzucony: 'CLOSED_LOST',
}
const NOTE_SUBJECT = 'Z bazy wiedzy'
const ZRODLO_MAP = [
  [/linkedin/i, 'LinkedIn'],
  [/polecen|referral|znajom/i, 'Polecenie'],
  [/cron|research|digest/i, 'Cron research'],
  [/mail|inbound|zapytanie|formularz/i, 'Email'],
  [/www|strona|web/i, 'Strona WWW'],
]

// ─── parsowanie ──────────────────────────────────────────────────────────────
const unquote = (s) => s.trim().replace(/^["'](.*)["']$/, '$1')
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const data = {}
  let listKey = null
  for (const line of match[1].split('\n')) {
    const listItem = line.match(/^\s*-\s+(.*)$/)
    if (listItem && listKey) { data[listKey].push(unquote(listItem[1])); continue }
    const pair = line.match(/^\|?([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!pair) continue
    const [, key, value] = pair
    if (value.trim() === '') { listKey = key; data[key] = [] }
    else if (/^\[.*\]$/.test(value.trim())) { listKey = null; data[key] = value.trim().slice(1, -1).split(',').map(unquote).filter(Boolean) }
    else { listKey = null; data[key] = unquote(value) }
  }
  return data
}
async function findMarkdownFiles(dir) {
  const found = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...(await findMarkdownFiles(path)))
    else if (entry.name.endsWith('.md')) found.push(path)
  }
  return found
}
/**
 * Plik leada = strona główna klienta, nie brief ze spotkania ani oferta. Te ostatnie
 * mają własne notatki i trafią do CRM jako aktywności (osobny krok), nie jako firmy.
 */
function isLeadFile(fm, filePath) {
  const base = filePath.split('/').pop()
  if (/^(brief|oferta|offer|discovery|follow-?up|notatka|spotkanie)/i.test(base)) return false
  const type = String(fm.type || '').toLowerCase()
  const ct = String(fm['client-type'] || '').toLowerCase()
  const tags = (fm.tags || []).map(String)
  return /-lead\.md$/.test(base) || type === 'client lead' || ct === 'lead' || tags.includes('client/lead')
}
function syncDecision(fm) {
  if (String(fm['crm-sync']).toLowerCase() === 'false') return 'opted-out'
  if (fm.crm && /companies\//.test(fm.crm)) return 'linked'
  if (String(fm['crm-sync']).toLowerCase() === 'true') return 'enabled'
  return 'candidate'
}
/** Status z vaulta bywa zdaniem ("pre-discovery - mail ... wyslany"): bierzemy pierwszy token. */
function normalizeStatus(status) {
  if (!status) return null
  const s = String(status).toLowerCase().trim()
  if (STATUS_TO_STAGE[s] !== undefined) return s
  const head = s.split(/[\s:,;(-]+/)[0]
  if (STATUS_TO_STAGE[head] !== undefined) return head
  return null
}
function domainOf(website) {
  try { return new URL(website.startsWith('http') ? website : `https://${website}`).hostname.replace(/^www\./, '') } catch { return null }
}
function companyName(fm) {
  return fm['client-name'] || fm.title?.replace(/^Lead[^:]*:\s*/i, '').split(/\s+[-|]\s+|\s+—\s+/)[0].trim() || 'Bez nazwy'
}
function contactOf(fm) {
  const raw = fm.founder || fm.contact || fm.kontakt || fm['contact-name']
  if (!raw) return null
  const parts = String(raw).trim().split(/\s+/)
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') || undefined, email: fm['contact-email'] || fm.email || undefined }
}
function zrodloOf(fm) {
  const src = String(fm.source || '')
  for (const [re, label] of ZRODLO_MAP) if (re.test(src)) return label
  return 'Baza wiedzy'
}
function buildNote(fm, rel) {
  const lines = [`Źródło: ${rel}`, '']
  if (fm.description) lines.push(String(fm.description).replace(/^>\s*/, ''), '')
  if (fm['lead-score']) lines.push(`Lead score: ${fm['lead-score']}`)
  if (fm['next-action']) lines.push(`Next action: ${fm['next-action']}`)
  if (fm.status) lines.push(`Status w vaulcie: ${fm.status}`)
  if (fm.source) lines.push(`Źródło leada: ${fm.source}`)
  if (fm['date-updated'] || fm.updated) lines.push(`Aktualizacja w vaulcie: ${fm['date-updated'] || fm.updated}`)
  return lines.join('\n').trimEnd()
}
async function addFrontmatterLine(filePath, line) {
  const raw = await readFile(filePath, 'utf8')
  const updated = raw.replace(/^(---\n[\s\S]*?)\n---/, `$1\n${line}\n---`)
  if (updated === raw) throw new Error(`nie udało się wstawić "${line.split(':')[0]}:" do frontmattera`)
  await writeFile(filePath, updated, 'utf8')
}
async function enableFiles(paths) {
  for (const p of paths) {
    const filePath = p.startsWith('/') ? p : join(VAULT_CLIENTS_DIR, p)
    try {
      const fm = parseFrontmatter(await readFile(filePath, 'utf8'))
      if (!fm) throw new Error('brak frontmattera')
      if (syncDecision(fm) !== 'candidate') { console.log(`  = ${p} - już zakwalifikowany`); continue }
      await addFrontmatterLine(filePath, 'crm-sync: true')
      console.log(`  + ${p} - dodano crm-sync: true`)
    } catch (err) { console.log(`  ! ${p} - ${err.message}`) }
  }
}

// ─── CRM ─────────────────────────────────────────────────────────────────────
async function currentUserId() {
  const me = await api('GET', '!/auth/me')
  return me?.user?.id || me?.id
}
async function ensureFields() {
  const wanted = [
    { entity: 'COMPANY', label: 'Vault', type: 'TEXT' },
    { entity: 'DEAL', label: 'Vault', type: 'TEXT' },
    { entity: 'COMPANY', label: 'Zrodlo', type: 'SELECT', options: ['Email', 'LinkedIn', 'Polecenie', 'Strona WWW', 'Cron research', 'Baza wiedzy'].map((label) => ({ label })) },
  ]
  const out = {}
  for (const w of wanted) {
    const existing = await api('GET', `/fields?entity=${w.entity}`)
    const rows = Array.isArray(existing) ? existing : existing.rows || []
    let f = rows.find((r) => r.label === w.label)
    if (!f) {
      if (!APPLY) { out[`${w.entity}.${w.label}`] = { key: w.label.toLowerCase(), options: [], missing: true }; continue }
      f = await api('POST', '/fields', { ...w, agentFilled: false, showOnSheet: true, showOnFilter: w.type === 'SELECT' })
    }
    out[`${w.entity}.${w.label}`] = f
  }
  return out
}
async function findCompanyByDomain(domain) {
  if (!domain) return null
  const r = await api('POST', '/companies/search', { q: domain, page: 1, pageSize: 10 })
  return (r.rows || []).find((c) => c.domain === domain) || null
}
async function findCompanyByName(name) {
  const r = await api('POST', '/companies/search', { q: name, page: 1, pageSize: 5 })
  return (r.rows || []).find((c) => c.name.toLowerCase() === name.toLowerCase()) || null
}
function companyUrl(company) {
  return `${APP_URL}/${WORKSPACE_SLUG}/companies/${company.id}`
}
let WORKSPACE_SLUG = 'crm'

async function upsertNote(companyId, body) {
  const acts = await api('GET', `/activities?companyId=${encodeURIComponent(companyId)}&filter=notes&limit=50`)
  const entries = acts.entries || []
  const old = entries.find((a) => a.subject === NOTE_SUBJECT)
  if (old && old.body === body) return 'unchanged'
  if (APPLY) {
    if (old) await api('DELETE', `/activities/${old.id}`).catch(() => null)
    await api('POST', '/activities', { type: 'NOTE', subject: NOTE_SUBJECT, body, companyId })
  }
  return old ? 'replaced' : 'created'
}

// ─── główna pętla ────────────────────────────────────────────────────────────
async function main() {
  if (ENABLE_IDX !== -1) {
    if (!ENABLE_PATHS.length) { console.error('--enable wymaga ścieżek (względem clients/)'); process.exit(1) }
    console.log('\n=== --enable ==='); await enableFiles(ENABLE_PATHS); return
  }
  const ws = await api('GET', '/workspace')
  WORKSPACE_SLUG = ws?.slug || WORKSPACE_SLUG
  const ownerId = await currentUserId()
  const fields = await ensureFields()
  const zrodloOptions = fields['COMPANY.Zrodlo']?.options || []
  const files = await findMarkdownFiles(VAULT_CLIENTS_DIR)
  const report = { created: [], updated: [], candidates: [], optedOut: [], unknownStatus: [], errors: [] }

  for (const filePath of files) {
    const raw = await readFile(filePath, 'utf8')
    const fm = parseFrontmatter(raw)
    if (!fm || !isLeadFile(fm, filePath)) continue
    const rel = relative(VAULT_CLIENTS_DIR, filePath)
    const decision = syncDecision(fm)
    if (decision === 'candidate') { report.candidates.push({ rel, status: fm.status || '-' }); continue }
    if (decision === 'opted-out') { report.optedOut.push({ rel }); continue }

    const name = companyName(fm)
    const domain = fm.website ? domainOf(fm.website) : null
    const status = normalizeStatus(fm.status)
    if (fm.status && status === null) report.unknownStatus.push({ rel, status: fm.status })
    const stage = status ? STATUS_TO_STAGE[status] : null
    const zrodlo = zrodloOf(fm)
    const zrodloId = zrodloOptions.find((o) => o.label === zrodlo)?.id
    const contact = contactOf(fm)
    const note = buildNote(fm, rel)
    const industry = (fm.tags || []).find((t) => String(t).startsWith('industry/'))?.slice(9)
    const companyPatch = {
      website: fm.website || undefined,
      industry: industry || undefined,
      linkedinUrl: fm.linkedin || undefined,
      fields: { vault: `wiki/clients/${rel}`, ...(zrodloId ? { zrodlo: zrodloId } : {}) },
    }

    if (VERBOSE) {
      console.log(`\n--- ${rel}`)
      console.log(`    firma: ${name}  domena: ${domain || '-'}  status: ${fm.status || '-'} -> ${stage || '(bez deala)'}  źródło: ${zrodlo}`)
      if (contact) console.log(`    kontakt: ${contact.firstName} ${contact.lastName || ''} ${contact.email || ''}`)
      console.log(`    patch: ${JSON.stringify(companyPatch)}`)
    }

    try {
      // 1. firma: po crm: -> po domenie -> po nazwie -> nowa
      let company = null
      const linkedId = fm.crm?.match(/companies\/([A-Za-z0-9_-]+)/)?.[1]
      if (linkedId) company = await api('GET', `/companies/${linkedId}`).catch(() => null)
      if (!company) company = (await findCompanyByDomain(domain)) || (await findCompanyByName(name))
      const isNew = !company
      if (isNew) {
        if (!APPLY) { report.created.push({ rel, name, stage: stage || '(bez deala)', id: '(dry-run)' }); continue }
        company = await api('POST', '/companies', { name, domain: domain || undefined, ownerId })
      }
      if (APPLY) await api('PATCH', `/companies/${company.id}`, { data: companyPatch })

      // 2. kontakt (tylko gdy znamy osobę i jeszcze jej nie ma)
      if (contact && APPLY) {
        const found = await api('POST', '/contacts/search', { q: contact.email || contact.firstName, page: 1, pageSize: 10, company: [company.id] }).catch(() => ({ rows: [] }))
        const exists = (found.rows || []).some((c) => (contact.email && c.email === contact.email) || (c.firstName === contact.firstName && (c.lastName || '') === (contact.lastName || '')))
        if (!exists) await api('POST', '/contacts', { ...contact, companyId: company.id, ownerId })
      }

      // 3. deal: tylko przy tworzeniu (stage należy do CRM)
      if (stage && APPLY) {
        const deals = await api('POST', '/deals/search', { q: name, page: 1, pageSize: 10, archived: false })
        const has = (deals.rows || []).some((d) => d.company?.id === company.id)
        if (!has) {
          const deal = await api('POST', '/deals', { name: `${name} - Workshift`, companyId: company.id, ownerId, stage, currency: 'PLN' })
          await api('PATCH', `/deals/${deal.id}`, { data: { fields: { vault: `wiki/clients/${rel}` } } }).catch(() => null)
        }
      }

      // 4. notatka "Z bazy wiedzy"
      const noteResult = await upsertNote(company.id, note)

      // 5. write-back crm: do vaulta (jedyny zapis do vaulta poza --enable)
      if (isNew || !linkedId) {
        if (APPLY && !NO_WRITEBACK) await addFrontmatterLine(filePath, `crm: "${companyUrl(company)}"`)
      }
      ;(isNew ? report.created : report.updated).push({ rel, name, id: company.id, stage: stage || '(bez deala)', note: noteResult })
    } catch (err) {
      report.errors.push({ rel, message: err.message })
    }
  }

  console.log(`\n=== Raport sync vault -> CRM (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  const sec = (title, rows, fmt) => { console.log(`\n${title} (${rows.length})`); for (const r of rows) console.log('  ' + fmt(r)) }
  sec('Nowe firmy', report.created, (r) => `${r.rel} -> ${r.name} [deal: ${r.stage}] ${r.id}`)
  sec('Zaktualizowane', report.updated, (r) => `${r.rel} -> ${r.name} (${r.id}) notatka: ${r.note}`)
  sec('Nieznany status (firma bez deala)', report.unknownStatus, (r) => `${r.rel}: "${r.status}"`)
  sec('Kandydaci (bez crm-sync: true)', report.candidates, (r) => `${r.rel} [status: ${r.status}]`)
  if (report.candidates.length) console.log(`\n  włącz:  node workshift/sync-vault-crm.mjs --enable ${report.candidates.map((c) => `"${c.rel}"`).join(' ')}`)
  sec('Wyłączone (crm-sync: false)', report.optedOut, (r) => r.rel)
  sec('Błędy', report.errors, (r) => `${r.rel}: ${r.message}`)
  if (!APPLY) console.log('\nDry-run. Nic nie zapisano. Dodaj --apply, żeby wykonać.')
}
main().catch((e) => { console.error(e.message); process.exit(1) })
