#!/usr/bin/env node
/**
 * crm.mjs - cienki klient CRM (Comp AI CRM, fork KubaBed/crm) dla agentów.
 *
 * Używany przez Claude Code (skill `crm`), Hermesa (WSL) i hooki sesyjne.
 * Zero zależności: Node >= 18 (fetch). Transport: REST bridge `/rest/*` z nagłówkiem
 * `x-api-key` (Better Auth apiKey plugin; klucz = pełna sesja Kuby, single tenant).
 *
 * Konfiguracja (env):
 *   CRM_API_URL   np. https://api.crm.workshift.pl  (lokalnie http://localhost:3001)
 *   CRM_API_KEY   klucz z Settings -> API keys (nigdy w repo, nigdy w czacie)
 *
 * Komendy:
 *   crm.mjs open [--json]                   otwarte deale, najstarsza aktywność na górze
 *   crm.mjs find "<fraza>" [--json]         firmy + kontakty + deale
 *   crm.mjs company <id> | contact <id> | deal <id>      pełny rekord + ostatnie aktywności
 *   crm.mjs note <deal|company|contact> <id> "<tekst>" [--subject "..."]
 *   crm.mjs stage <dealId> <STAGE> [--reason "..."]     STAGE = DEMO_BOOKED|QUALIFIED_TO_BUY|
 *                                                       DECISION_MAKER_BOUGHT_IN|CONTRACT_SENT|
 *                                                       CLOSED_WON|CLOSED_LOST|UNQUALIFIED_TO_BUY
 *   crm.mjs stale [dni=7] [--json]          otwarte deale bez aktywności >= N dni
 *   crm.mjs raw <METHOD> </rest/path> ['<json body>']   ucieczka: dowolny endpoint z /openapi.json
 *   crm.mjs whoami                          sprawdza klucz (1 zapytanie o firmy)
 *
 * Wszystkie komendy z `--json` drukują surową odpowiedź (dla agentów); bez flagi
 * drukują skrót czytelny dla człowieka. Kod wyjścia != 0 przy błędzie HTTP.
 */

const API_URL = (process.env.CRM_API_URL || 'http://localhost:3001').replace(/\/+$/, '')
const API_KEY = process.env.CRM_API_KEY

const STAGE_LABEL = {
  DEMO_BOOKED: 'Kontakt',
  QUALIFIED_TO_BUY: 'Konsultacja',
  DECISION_MAKER_BOUGHT_IN: 'Decydent na tak',
  CONTRACT_SENT: 'Oferta',
  CLOSED_WON: 'Wygrana',
  CLOSED_LOST: 'Przegrana',
  UNQUALIFIED_TO_BUY: 'Zaparkowany',
}
const OPEN_STAGES = ['DEMO_BOOKED', 'QUALIFIED_TO_BUY', 'DECISION_MAKER_BOUGHT_IN', 'CONTRACT_SENT']

function die(msg, code = 1) {
  console.error(`crm.mjs: ${msg}`)
  process.exit(code)
}

export async function api(method, path, body) {
  if (!API_KEY) die('brak CRM_API_KEY w env')
  const url = `${API_URL}/rest${path.startsWith('/') ? path : '/' + path}`
  const res = await fetch(url, {
    method,
    headers: { 'x-api-key': API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let data = text
  try { data = text ? JSON.parse(text) : null } catch { /* nie-JSON, zostaje tekst */ }
  if (!res.ok) {
    const msg = data && typeof data === 'object' ? (data.message || JSON.stringify(data)) : text
    throw new Error(`${method} ${path} -> HTTP ${res.status}: ${msg}`)
  }
  return data
}

const args = process.argv.slice(2)
const json = args.includes('--json')
const flag = (name) => {
  const i = args.indexOf(name)
  return i === -1 ? undefined : args[i + 1]
}
const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && args[i - 1] !== '--json'))

const fmtDate = (iso) => (iso ? String(iso).slice(0, 10) : '-')
const daysSince = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null)
const money = (d) => (d.amountCents != null ? `${(d.amountCents / 100).toLocaleString('pl-PL')} ${d.currency}` : '-')

function printDeals(rows) {
  if (!rows.length) return console.log('(brak)')
  for (const d of rows) {
    const age = daysSince(d.lastActivityAt ?? d.createdAt)
    const stale = age != null && age >= 7 && OPEN_STAGES.includes(d.stage) ? ` [${age}d bez ruchu]` : ''
    console.log(`${d.id}  ${STAGE_LABEL[d.stage] || d.stage}  ${d.company?.name || '?'}  "${d.name}"  ${money(d)}  ost. aktywność ${fmtDate(d.lastActivityAt)}${stale}`)
  }
}

async function allOpenDeals() {
  const out = []
  for (let page = 1; page < 50; page++) {
    const r = await api('POST', '/deals/search', { page, pageSize: 100, stage: OPEN_STAGES, sort: 'lastActivityAt', dir: 'asc' })
    out.push(...(r.rows || []))
    if (out.length >= (r.total || 0) || !(r.rows || []).length) break
  }
  return out.sort((a, b) => new Date(a.lastActivityAt ?? a.createdAt) - new Date(b.lastActivityAt ?? b.createdAt))
}

const commands = {
  async whoami() {
    // Uwaga: /api-keys odrzuca sesje z klucza API (401) - to zachowanie Better Auth, nie błąd.
    const r = await api('POST', '/companies/search', { page: 1, pageSize: 1 })
    console.log(json ? JSON.stringify(r, null, 2) : `OK: ${API_URL}, klucz ważny, firm w CRM: ${r.total}`)
  },

  async open() {
    const rows = await allOpenDeals()
    json ? console.log(JSON.stringify(rows, null, 2)) : printDeals(rows)
  },

  async stale() {
    const days = Number(positional[1] || 7)
    const rows = (await allOpenDeals()).filter((d) => (daysSince(d.lastActivityAt ?? d.createdAt) ?? 0) >= days)
    json ? console.log(JSON.stringify(rows, null, 2)) : printDeals(rows)
  },

  async find() {
    const q = positional[1]
    if (!q) die('użycie: find "<fraza>"')
    const [c, k, d] = await Promise.all([
      api('POST', '/companies/search', { q, page: 1, pageSize: 10 }),
      api('POST', '/contacts/search', { q, page: 1, pageSize: 10 }),
      api('POST', '/deals/search', { q, page: 1, pageSize: 10 }),
    ])
    if (json) return console.log(JSON.stringify({ companies: c.rows, contacts: k.rows, deals: d.rows }, null, 2))
    console.log(`Firmy (${c.total}):`); for (const x of c.rows || []) console.log(`  ${x.id}  ${x.name}  ${x.domain || ''}`)
    console.log(`Kontakty (${k.total}):`); for (const x of k.rows || []) console.log(`  ${x.id}  ${x.firstName} ${x.lastName || ''}  ${x.email || ''}  ${x.company?.name || ''}`)
    console.log(`Deale (${d.total}):`); printDeals(d.rows || [])
  },

  async company() { await show('companies', 'companyId') },
  async contact() { await show('contacts', 'contactId') },
  async deal() { await show('deals', 'dealId') },

  async note() {
    const [, kind, id, ...rest] = positional
    const text = rest.join(' ')
    const key = { deal: 'dealId', company: 'companyId', contact: 'contactId' }[kind]
    if (!key || !id || !text) die('użycie: note <deal|company|contact> <id> "<tekst>"')
    const r = await api('POST', '/activities', { type: 'NOTE', subject: flag('--subject') || undefined, body: text, [key]: id })
    console.log(json ? JSON.stringify(r, null, 2) : `notatka zapisana: ${r.id}`)
  },

  async stage() {
    const [, id, stage] = positional
    if (!id || !STAGE_LABEL[stage]) die(`użycie: stage <dealId> <${Object.keys(STAGE_LABEL).join('|')}>`)
    const r = await api('PATCH', `/deals/${id}/stage`, { stage, closedReason: flag('--reason') || undefined })
    console.log(json ? JSON.stringify(r, null, 2) : `deal ${id} -> ${STAGE_LABEL[stage]}`)
  },

  async raw() {
    const [, method, path, body] = positional
    if (!method || !path) die('użycie: raw <METHOD> </path> [\'<json>\']')
    const r = await api(method.toUpperCase(), path, body ? JSON.parse(body) : undefined)
    console.log(JSON.stringify(r, null, 2))
  },
}

async function show(resource, key) {
  const id = positional[1]
  if (!id) die(`użycie: ${resource.slice(0, -1)} <id>`)
  const [rec, acts] = await Promise.all([
    api('GET', `/${resource}/${id}`),
    api('GET', `/activities?${key}=${encodeURIComponent(id)}&limit=10`),
  ])
  if (json) return console.log(JSON.stringify({ record: rec, activities: acts }, null, 2))
  const { fields, ...rest } = rec
  console.log(JSON.stringify(rest, null, 2))
  if (fields) console.log('pola własne:', JSON.stringify(fields))
  const items = acts.entries || acts.items || acts.rows || acts
  console.log('--- ostatnie aktywności:')
  for (const a of Array.isArray(items) ? items : []) console.log(`  ${fmtDate(a.occurredAt || a.createdAt)}  ${a.type}  ${a.subject || ''} ${a.body ? '- ' + String(a.body).slice(0, 120).replace(/\n/g, ' ') : ''}`)
}

const cmd = positional[0]
if (!cmd || !commands[cmd]) {
  console.error(`użycie: crm.mjs <${Object.keys(commands).join('|')}> ...  (patrz nagłówek pliku)`)
  process.exit(2)
}
commands[cmd]().catch((e) => die(e.message))
