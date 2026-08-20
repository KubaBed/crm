// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke test: calls every generated operation once to confirm the SDK can reach each endpoint.
// Run it from this repo with `bun tests/smoke-test.ts`. Each case below calls one SDK method
// exactly the way the SDK exposes it (positional params, request body, pagination, streaming).
//
// Two environment variables tune a run:
//   - SCALAR_SMOKE_FILTER: comma-separated needles; only operations whose name or path contains
//     one of them run, so you can smoke-test a subset without editing this file.
//   - SCALAR_SMOKE_REPORT: a file path; when set, the run writes a JSON report there instead of
//     printing a table. The generator uses this to collect per-operation results.
import { writeFileSync } from 'node:fs';

// The package exports the client class. The client reads auth and the base URL from the
// environment, so it needs no constructor options to point at a server.
import CrmAPI from '@trycomp/crm';

// One shared client runs every case.
const client = new CrmAPI();

// The result of running one case, collected for the JSON report or the printed table.
type SmokeResult = {
  operation: string;
  method: string;
  path: string;
  status: 'passed' | 'failed';
  durationMs: number;
  error?: string;
};

// One entry per generated operation. `run` performs the real SDK call; the other fields are
// metadata used for filtering and reporting. This list is generated, so it stays in sync with
// the SDK surface.
const cases: { operation: string; method: string; path: string; run: () => Promise<unknown> }[] = [
  {
    operation: 'controllerGetMe',
    method: 'GET',
    path: '/auth/me',
    run: async () => {
      await client.auth.controllerGetMe();
    },
  },

  {
    operation: 'controllerGetSession',
    method: 'GET',
    path: '/auth/session',
    run: async () => {
      await client.auth.controllerGetSession();
    },
  },

  {
    operation: 'controllerCheck',
    method: 'GET',
    path: '/health',
    run: async () => {
      const string_ = await client.health.controllerCheck();
    },
  },

  {
    operation: 'ratesControllerRatesViaGet',
    method: 'GET',
    path: '/internal/sync/rates',
    run: async () => {
      await client.internalCron.ratesControllerRatesViaGet({
        authorization: 'authorization',
      });
    },
  },

  {
    operation: 'syncControllerMailboxesViaGet',
    method: 'GET',
    path: '/internal/sync/mailboxes',
    run: async () => {
      await client.internalCron.syncControllerMailboxesViaGet({
        authorization: 'authorization',
      });
    },
  },

  {
    operation: 'syncControllerGoogleViaGet',
    method: 'GET',
    path: '/internal/sync/google',
    run: async () => {
      await client.internalCron.syncControllerGoogleViaGet({
        authorization: 'authorization',
      });
    },
  },

  {
    operation: 'telemetryControllerRollupViaGet',
    method: 'GET',
    path: '/internal/telemetry/rollup',
    run: async () => {
      await client.internalCron.telemetryControllerRollupViaGet({
        authorization: 'authorization',
      });
    },
  },

  {
    operation: 'trackingRetentionControllerViaGet',
    method: 'GET',
    path: '/internal/tracking/retention',
    run: async () => {
      await client.internalCron.trackingRetentionControllerViaGet({
        authorization: 'authorization',
      });
    },
  },

  {
    operation: 'archiveRetentionControllerPruneViaGet',
    method: 'GET',
    path: '/internal/archive/prune',
    run: async () => {
      await client.internalCron.archiveRetentionControllerPruneViaGet({
        authorization: 'authorization',
      });
    },
  },

  {
    operation: 'attachmentsControllerRead',
    method: 'GET',
    path: '/api/conversations/attachments/{id}',
    run: async () => {
      await client.conversations.attachmentsControllerRead('id');
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/conversations',
    run: async () => {
      const list = await client.conversations.list();
    },
  },

  {
    operation: 'save',
    method: 'POST',
    path: '/conversations',
    run: async () => {
      const save = await client.conversations.save({
        sessionId: 'x',
      });
    },
  },

  {
    operation: 'builderResources',
    method: 'GET',
    path: '/conversations/builder-resources',
    run: async () => {
      const builderResources = await client.conversations.builderResources({
        q: '',
      });
    },
  },

  {
    operation: 'events',
    method: 'GET',
    path: '/conversations/{id}/events',
    run: async () => {
      const events = await client.conversations.events('id', {
        limit: 2000,
      });
    },
  },

  {
    operation: 'submitBuilder',
    method: 'POST',
    path: '/conversations/{id}/submit-builder',
    run: async () => {
      const submitBuilder = await client.conversations.submitBuilder('id', {
        clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        commandType: 'CHAT',
        message: 'x',
        resources: [],
        attachments: [],
      });
    },
  },

  {
    operation: 'answerBuilderQuestion',
    method: 'POST',
    path: '/conversations/{id}/answer-builder-question',
    run: async () => {
      const answerBuilderQuestion = await client.conversations.answerBuilderQuestion('id', {
        clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        requestId: 'x',
      });
    },
  },

  {
    operation: 'rateBuilderResponse',
    method: 'POST',
    path: '/conversations/{id}/rate-builder-response',
    run: async () => {
      const rateBuilderResponse = await client.conversations.rateBuilderResponse('id', {
        messageId: 'x',
        rating: 'UP',
      });
    },
  },

  {
    operation: 'markRead',
    method: 'PATCH',
    path: '/conversations/{id}/read',
    run: async () => {
      const markRead = await client.conversations.markRead('id');
    },
  },

  {
    operation: 'shared',
    method: 'GET',
    path: '/conversations/shared/{token}',
    run: async () => {
      const shared = await client.conversations.shared('tokenxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    },
  },

  {
    operation: 'delete',
    method: 'DELETE',
    path: '/conversations/{id}',
    run: async () => {
      const delete_ = await client.conversations.delete('id');
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/conversations/builder',
    run: async () => {
      const list = await client.conversations.builder.list();
    },
  },

  {
    operation: 'create',
    method: 'POST',
    path: '/conversations/builder',
    run: async () => {
      const create = await client.conversations.builder.create({
        clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        commandType: 'CHAT',
        message: 'x',
        resources: [],
        attachments: [],
      });
    },
  },

  {
    operation: 'retrieve',
    method: 'GET',
    path: '/conversations/builder/{id}',
    run: async () => {
      const retrieve = await client.conversations.builder.retrieve('id');
    },
  },

  {
    operation: 'status',
    method: 'GET',
    path: '/conversations/{id}/share',
    run: async () => {
      const status = await client.conversations.share.status('id');
    },
  },

  {
    operation: 'create',
    method: 'POST',
    path: '/conversations/{id}/share',
    run: async () => {
      const create = await client.conversations.share.create('id');
    },
  },

  {
    operation: 'revoke',
    method: 'DELETE',
    path: '/conversations/{id}/share',
    run: async () => {
      const revoke = await client.conversations.share.revoke('id');
    },
  },

  {
    operation: 'controllerPublicConfig',
    method: 'GET',
    path: '/api/t/config/{siteId}',
    run: async () => {
      await client.tracking.controllerPublicConfig('siteId');
    },
  },

  {
    operation: 'controllerCollect',
    method: 'POST',
    path: '/api/t/e',
    run: async () => {
      await client.tracking.controllerCollect({
        origin: 'origin',
        'user-agent': 'userAgent',
      });
    },
  },

  {
    operation: 'settings',
    method: 'GET',
    path: '/tracking/settings',
    run: async () => {
      const settings = await client.tracking.settings();
    },
  },

  {
    operation: 'setFlag',
    method: 'PATCH',
    path: '/tracking/flags',
    run: async () => {
      const unknown_ = await client.tracking.setFlag({
        flag: 'crossDomain',
        enabled: false,
      });
    },
  },

  {
    operation: 'setCookieLifetime',
    method: 'PATCH',
    path: '/tracking/cookie-lifetime',
    run: async () => {
      const unknown_ = await client.tracking.setCookieLifetime({
        days: 0,
      });
    },
  },

  {
    operation: 'rotateSiteId',
    method: 'POST',
    path: '/tracking/site-id/rotate',
    run: async () => {
      const rotateSiteID = await client.tracking.rotateSiteID();
    },
  },

  {
    operation: 'verify',
    method: 'POST',
    path: '/tracking/verify',
    run: async () => {
      const verify = await client.tracking.verify({
        url: 'x',
      });
    },
  },

  {
    operation: 'sources',
    method: 'GET',
    path: '/tracking/sources',
    run: async () => {
      const sources = await client.tracking.sources();
    },
  },

  {
    operation: 'companyActivity',
    method: 'GET',
    path: '/tracking/companies/{companyId}/activity',
    run: async () => {
      const companyActivity = await client.tracking.companyActivity('companyId');
    },
  },

  {
    operation: 'contactActivity',
    method: 'GET',
    path: '/tracking/contacts/{contactId}/activity',
    run: async () => {
      const contactActivity = await client.tracking.contactActivity('contactId');
    },
  },

  {
    operation: 'create',
    method: 'POST',
    path: '/tracking/domains',
    run: async () => {
      const create = await client.tracking.domains.create({
        host: 'x',
        scope: 'EXACT_HOST',
      });
    },
  },

  {
    operation: 'delete',
    method: 'DELETE',
    path: '/tracking/domains/{id}',
    run: async () => {
      const unknown_ = await client.tracking.domains.delete('id');
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/users',
    run: async () => {
      const list = await client.users.list();
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/api-keys',
    run: async () => {
      const list = await client.apiKeys.list({
        q: '',
        sort: '',
        dir: 'asc',
        page: 1,
        pageSize: 25,
      });
    },
  },

  {
    operation: 'create',
    method: 'POST',
    path: '/api-keys',
    run: async () => {
      const create = await client.apiKeys.create({
        name: 'x',
        expiresInDays: 0,
      });
    },
  },

  {
    operation: 'revoke',
    method: 'DELETE',
    path: '/api-keys/{id}',
    run: async () => {
      const revoke = await client.apiKeys.revoke('id');
    },
  },

  {
    operation: 'search',
    method: 'POST',
    path: '/companies/search',
    run: async () => {
      const search = await client.companies.search({
        q: '',
        sort: '',
        dir: 'asc',
        page: 1,
        pageSize: 25,
        owner: [],
        industry: [],
        enrichment: [],
        source: [],
        activity: [],
        fields: {},
        archived: false,
      });
    },
  },

  {
    operation: 'retrieve',
    method: 'GET',
    path: '/companies/{id}',
    run: async () => {
      const retrieve = await client.companies.retrieve('id');
    },
  },

  {
    operation: 'update',
    method: 'PATCH',
    path: '/companies/{id}',
    run: async () => {
      const update = await client.companies.update('id', {
        data: {},
      });
    },
  },

  {
    operation: 'purge',
    method: 'DELETE',
    path: '/companies/{id}',
    run: async () => {
      const purge = await client.companies.purge('id');
    },
  },

  {
    operation: 'options',
    method: 'GET',
    path: '/companies/options',
    run: async () => {
      const options = await client.companies.options({
        q: '',
      });
    },
  },

  {
    operation: 'create',
    method: 'POST',
    path: '/companies',
    run: async () => {
      const create = await client.companies.create({
        name: 'x',
      });
    },
  },

  {
    operation: 'archive',
    method: 'POST',
    path: '/companies/{id}/archive',
    run: async () => {
      const archive = await client.companies.archive('id');
    },
  },

  {
    operation: 'restore',
    method: 'POST',
    path: '/companies/{id}/restore',
    run: async () => {
      const restore = await client.companies.restore('id');
    },
  },

  {
    operation: 'bulkAssignOwner',
    method: 'POST',
    path: '/companies/bulk-assign-owner',
    run: async () => {
      const bulkAssignOwner = await client.companies.bulkAssignOwner({
        ids: [],
        ownerId: '',
      });
    },
  },

  {
    operation: 'bulkEnrich',
    method: 'POST',
    path: '/companies/bulk-enrich',
    run: async () => {
      const bulkEnrich = await client.companies.bulkEnrich({
        ids: [],
      });
    },
  },

  {
    operation: 'bulkArchive',
    method: 'POST',
    path: '/companies/bulk-archive',
    run: async () => {
      const bulkArchive = await client.companies.bulkArchive({
        ids: [],
      });
    },
  },

  {
    operation: 'bulkRestore',
    method: 'POST',
    path: '/companies/bulk-restore',
    run: async () => {
      const bulkRestore = await client.companies.bulkRestore({
        ids: [],
      });
    },
  },

  {
    operation: 'bulkPurge',
    method: 'POST',
    path: '/companies/bulk-purge',
    run: async () => {
      const bulkPurge = await client.companies.bulkPurge({
        ids: [],
      });
    },
  },

  {
    operation: 'enrich',
    method: 'POST',
    path: '/companies/{id}/enrich',
    run: async () => {
      const enrich = await client.companies.enrich('id');
    },
  },

  {
    operation: 'research',
    method: 'POST',
    path: '/companies/{id}/research',
    run: async () => {
      const research = await client.companies.research('id');
    },
  },

  {
    operation: 'setPrimaryContact',
    method: 'POST',
    path: '/companies/{companyId}/set-primary-contact',
    run: async () => {
      const setPrimaryContact = await client.companies.setPrimaryContact('companyId', {
        contactId: '',
      });
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/fields',
    run: async () => {
      const list = await client.fields.list({
        entity: 'COMPANY',
        includeArchived: false,
      });
    },
  },

  {
    operation: 'create',
    method: 'POST',
    path: '/fields',
    run: async () => {
      const create = await client.fields.create({
        entity: 'COMPANY',
        label: 'x',
        type: 'TEXT',
        options: [],
        agentFilled: true,
        agentBrief: null,
        required: false,
        showOnSheet: true,
        showOnTable: false,
        showOnFilter: false,
      });
    },
  },

  {
    operation: 'retrieve',
    method: 'GET',
    path: '/fields/{entity}/{key}',
    run: async () => {
      const retrieve = await client.fields.retrieve('key', {
        entity: 'COMPANY',
      });
    },
  },

  {
    operation: 'filters',
    method: 'GET',
    path: '/fields/{entity}/filterable',
    run: async () => {
      const filters = await client.fields.filters('COMPANY');
    },
  },

  {
    operation: 'coverage',
    method: 'GET',
    path: '/fields/{id}/coverage',
    run: async () => {
      const coverage = await client.fields.coverage('id');
    },
  },

  {
    operation: 'update',
    method: 'PATCH',
    path: '/fields/{id}',
    run: async () => {
      const update = await client.fields.update('id', {
        data: {},
      });
    },
  },

  {
    operation: 'delete',
    method: 'DELETE',
    path: '/fields/{id}',
    run: async () => {
      const delete_ = await client.fields.delete('id');
    },
  },

  {
    operation: 'reorder',
    method: 'POST',
    path: '/fields/reorder',
    run: async () => {
      const reorder = await client.fields.reorder({
        entity: 'COMPANY',
        ids: [],
      });
    },
  },

  {
    operation: 'archive',
    method: 'POST',
    path: '/fields/{id}/archive',
    run: async () => {
      const archive = await client.fields.archive('id');
    },
  },

  {
    operation: 'restore',
    method: 'POST',
    path: '/fields/{id}/restore',
    run: async () => {
      const restore = await client.fields.restore('id');
    },
  },

  {
    operation: 'backfill',
    method: 'POST',
    path: '/fields/{id}/backfill',
    run: async () => {
      const backfill = await client.fields.backfill('id');
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/agents',
    run: async () => {
      const list = await client.agents.list();
    },
  },

  {
    operation: 'revise',
    method: 'POST',
    path: '/agents/{id}/revise',
    run: async () => {
      const revise = await client.agents.revise('id', {
        clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      });
    },
  },

  {
    operation: 'files',
    method: 'GET',
    path: '/agents/{id}/files',
    run: async () => {
      const files = await client.agents.files('id');
    },
  },

  {
    operation: 'saveFile',
    method: 'POST',
    path: '/agents/{id}/save-file',
    run: async () => {
      const saveFile = await client.agents.saveFile('id', {
        clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        path: 'x',
        content: '',
      });
    },
  },

  {
    operation: 'retrieve',
    method: 'GET',
    path: '/agents/{id}',
    run: async () => {
      const retrieve = await client.agents.retrieve('id');
    },
  },

  {
    operation: 'update',
    method: 'PATCH',
    path: '/agents/{id}',
    run: async () => {
      const update = await client.agents.update('id', {
        name: 'x',
        description: '',
      });
    },
  },

  {
    operation: 'delete',
    method: 'DELETE',
    path: '/agents/{id}',
    run: async () => {
      const delete_ = await client.agents.delete('id');
    },
  },

  {
    operation: 'history',
    method: 'GET',
    path: '/agents/{id}/history',
    run: async () => {
      const history = await client.agents.history('id', {
        limit: 50,
      });
    },
  },

  {
    operation: 'activity',
    method: 'GET',
    path: '/agents/{id}/activity',
    run: async () => {
      const activity = await client.agents.activity('id', {
        limit: 50,
      });
    },
  },

  {
    operation: 'deploy',
    method: 'POST',
    path: '/agents/{id}/deploy',
    run: async () => {
      const deploy = await client.agents.deploy('id', {
        versionId: 'x',
        clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      });
    },
  },

  {
    operation: 'pause',
    method: 'POST',
    path: '/agents/{id}/pause',
    run: async () => {
      const pause = await client.agents.pause('id');
    },
  },

  {
    operation: 'resume',
    method: 'POST',
    path: '/agents/{id}/resume',
    run: async () => {
      const resume = await client.agents.resume('id');
    },
  },

  {
    operation: 'archive',
    method: 'POST',
    path: '/agents/{id}/archive',
    run: async () => {
      const archive = await client.agents.archive('id');
    },
  },

  {
    operation: 'restore',
    method: 'POST',
    path: '/agents/{id}/restore',
    run: async () => {
      const restore = await client.agents.restore('id');
    },
  },

  {
    operation: 'runNow',
    method: 'POST',
    path: '/agents/{id}/run',
    run: async () => {
      const runNow = await client.agents.runNow('id', {
        clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      });
    },
  },

  {
    operation: 'retry',
    method: 'POST',
    path: '/agents/{id}/runs/{runId}/retry',
    run: async () => {
      const retry = await client.agents.runs.retry('runId', {
        id: 'id',
        clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      });
    },
  },

  {
    operation: 'cancel',
    method: 'POST',
    path: '/agents/{id}/runs/{runId}/cancel',
    run: async () => {
      const cancel = await client.agents.runs.cancel('runId', {
        id: 'id',
      });
    },
  },

  {
    operation: 'settings',
    method: 'GET',
    path: '/currency/settings',
    run: async () => {
      const settings = await client.currency.settings();
    },
  },

  {
    operation: 'setReporting',
    method: 'PATCH',
    path: '/currency/reporting-currency',
    run: async () => {
      const setReporting = await client.currency.setReporting({
        currency: 'xxx',
      });
    },
  },

  {
    operation: 'setManual',
    method: 'PUT',
    path: '/currency/rates/{currency}',
    run: async () => {
      const setManual = await client.currency.rates.setManual('currency', {
        rate: 0,
      });
    },
  },

  {
    operation: 'deleteManual',
    method: 'DELETE',
    path: '/currency/rates/{currency}',
    run: async () => {
      const deleteManual = await client.currency.rates.deleteManual('currency');
    },
  },

  {
    operation: 'refresh',
    method: 'POST',
    path: '/currency/rates/refresh',
    run: async () => {
      const refresh = await client.currency.rates.refresh();
    },
  },

  {
    operation: 'search',
    method: 'POST',
    path: '/contacts/search',
    run: async () => {
      const search = await client.contacts.search({
        q: '',
        sort: '',
        dir: 'asc',
        page: 1,
        pageSize: 25,
        owner: [],
        company: [],
        source: [],
        title: [],
        seniority: [],
        persona: [],
        activity: [],
        fields: {},
        archived: false,
      });
    },
  },

  {
    operation: 'retrieve',
    method: 'GET',
    path: '/contacts/{id}',
    run: async () => {
      const retrieve = await client.contacts.retrieve('id');
    },
  },

  {
    operation: 'update',
    method: 'PATCH',
    path: '/contacts/{id}',
    run: async () => {
      const update = await client.contacts.update('id', {
        data: {},
      });
    },
  },

  {
    operation: 'purge',
    method: 'DELETE',
    path: '/contacts/{id}',
    run: async () => {
      const purge = await client.contacts.purge('id');
    },
  },

  {
    operation: 'create',
    method: 'POST',
    path: '/contacts',
    run: async () => {
      const create = await client.contacts.create({
        firstName: 'x',
      });
    },
  },

  {
    operation: 'archive',
    method: 'POST',
    path: '/contacts/{id}/archive',
    run: async () => {
      const archive = await client.contacts.archive('id');
    },
  },

  {
    operation: 'restore',
    method: 'POST',
    path: '/contacts/{id}/restore',
    run: async () => {
      const restore = await client.contacts.restore('id');
    },
  },

  {
    operation: 'enrich',
    method: 'POST',
    path: '/contacts/{id}/enrich',
    run: async () => {
      const enrich = await client.contacts.enrich('id');
    },
  },

  {
    operation: 'bulkAssignOwner',
    method: 'POST',
    path: '/contacts/bulk-assign-owner',
    run: async () => {
      const bulkAssignOwner = await client.contacts.bulkAssignOwner({
        ids: [],
        ownerId: '',
      });
    },
  },

  {
    operation: 'bulkSetCompany',
    method: 'POST',
    path: '/contacts/bulk-set-company',
    run: async () => {
      const bulkSetCompany = await client.contacts.bulkSetCompany({
        ids: [],
        companyId: '',
      });
    },
  },

  {
    operation: 'bulkEnrich',
    method: 'POST',
    path: '/contacts/bulk-enrich',
    run: async () => {
      const bulkEnrich = await client.contacts.bulkEnrich({
        ids: [],
      });
    },
  },

  {
    operation: 'bulkArchive',
    method: 'POST',
    path: '/contacts/bulk-archive',
    run: async () => {
      const bulkArchive = await client.contacts.bulkArchive({
        ids: [],
      });
    },
  },

  {
    operation: 'bulkRestore',
    method: 'POST',
    path: '/contacts/bulk-restore',
    run: async () => {
      const bulkRestore = await client.contacts.bulkRestore({
        ids: [],
      });
    },
  },

  {
    operation: 'bulkPurge',
    method: 'POST',
    path: '/contacts/bulk-purge',
    run: async () => {
      const bulkPurge = await client.contacts.bulkPurge({
        ids: [],
      });
    },
  },

  {
    operation: 'decideFact',
    method: 'POST',
    path: '/contacts/decide-fact',
    run: async () => {
      const decideFact = await client.contacts.decideFact({
        factId: '',
        decision: 'accept',
      });
    },
  },

  {
    operation: 'search',
    method: 'POST',
    path: '/deals/search',
    run: async () => {
      const search = await client.deals.search({
        q: '',
        sort: '',
        dir: 'asc',
        page: 1,
        pageSize: 25,
        status: 'all',
        owner: [],
        stage: [],
        closing: [],
        fields: {},
        archived: false,
      });
    },
  },

  {
    operation: 'retrieve',
    method: 'GET',
    path: '/deals/{id}',
    run: async () => {
      const retrieve = await client.deals.retrieve('id');
    },
  },

  {
    operation: 'update',
    method: 'PATCH',
    path: '/deals/{id}',
    run: async () => {
      const update = await client.deals.update('id', {
        data: {},
      });
    },
  },

  {
    operation: 'purge',
    method: 'DELETE',
    path: '/deals/{id}',
    run: async () => {
      const purge = await client.deals.purge('id');
    },
  },

  {
    operation: 'create',
    method: 'POST',
    path: '/deals',
    run: async () => {
      const create = await client.deals.create({
        name: 'x',
        companyId: 'x',
        ownerId: 'x',
      });
    },
  },

  {
    operation: 'archive',
    method: 'POST',
    path: '/deals/{id}/archive',
    run: async () => {
      const archive = await client.deals.archive('id');
    },
  },

  {
    operation: 'restore',
    method: 'POST',
    path: '/deals/{id}/restore',
    run: async () => {
      const restore = await client.deals.restore('id');
    },
  },

  {
    operation: 'setStage',
    method: 'PATCH',
    path: '/deals/{id}/stage',
    run: async () => {
      const setStage = await client.deals.setStage('id', {
        stage: 'DEMO_BOOKED',
      });
    },
  },

  {
    operation: 'contactOptions',
    method: 'GET',
    path: '/deals/{dealId}/contact-options',
    run: async () => {
      const contactOptions = await client.deals.contactOptions('dealId');
    },
  },

  {
    operation: 'bulkAssignOwner',
    method: 'POST',
    path: '/deals/bulk-assign-owner',
    run: async () => {
      const bulkAssignOwner = await client.deals.bulkAssignOwner({
        ids: [],
        ownerId: 'x',
      });
    },
  },

  {
    operation: 'bulkSetStage',
    method: 'POST',
    path: '/deals/bulk-set-stage',
    run: async () => {
      const bulkSetStage = await client.deals.bulkSetStage({
        ids: [],
        stage: 'DEMO_BOOKED',
      });
    },
  },

  {
    operation: 'bulkArchive',
    method: 'POST',
    path: '/deals/bulk-archive',
    run: async () => {
      const bulkArchive = await client.deals.bulkArchive({
        ids: [],
      });
    },
  },

  {
    operation: 'bulkRestore',
    method: 'POST',
    path: '/deals/bulk-restore',
    run: async () => {
      const bulkRestore = await client.deals.bulkRestore({
        ids: [],
      });
    },
  },

  {
    operation: 'bulkPurge',
    method: 'POST',
    path: '/deals/bulk-purge',
    run: async () => {
      const bulkPurge = await client.deals.bulkPurge({
        ids: [],
      });
    },
  },

  {
    operation: 'attach',
    method: 'POST',
    path: '/deals/{dealId}/contacts',
    run: async () => {
      const attach = await client.deals.contacts.attach('dealId', {
        contactId: 'x',
      });
    },
  },

  {
    operation: 'detach',
    method: 'DELETE',
    path: '/deals/{dealId}/contacts/{contactId}',
    run: async () => {
      const detach = await client.deals.contacts.detach('contactId', {
        dealId: 'dealId',
      });
    },
  },

  {
    operation: 'setRole',
    method: 'PATCH',
    path: '/deals/{dealId}/contacts/{contactId}/role',
    run: async () => {
      const setRole = await client.deals.contacts.setRole('contactId', {
        dealId: 'dealId',
        role: '',
      });
    },
  },

  {
    operation: 'timeline',
    method: 'GET',
    path: '/activities',
    run: async () => {
      const timeline = await client.activities.timeline({
        filter: 'all',
        limit: 30,
      });
    },
  },

  {
    operation: 'create',
    method: 'POST',
    path: '/activities',
    run: async () => {
      const create = await client.activities.create({
        type: 'NOTE',
      });
    },
  },

  {
    operation: 'timelineCounts',
    method: 'GET',
    path: '/activities/counts',
    run: async () => {
      const timelineCounts = await client.activities.timelineCounts();
    },
  },

  {
    operation: 'myTasks',
    method: 'GET',
    path: '/activities/my-tasks',
    run: async () => {
      const myTasks = await client.activities.myTasks({
        window: 'all',
        limit: 25,
      });
    },
  },

  {
    operation: 'complete',
    method: 'PATCH',
    path: '/activities/{id}/complete',
    run: async () => {
      const complete = await client.activities.complete('id', {
        completed: true,
      });
    },
  },

  {
    operation: 'queue',
    method: 'GET',
    path: '/enrichment/queue',
    run: async () => {
      const queue = await client.enrichment.queue({
        limit: 20,
      });
    },
  },

  {
    operation: 'summary',
    method: 'GET',
    path: '/dashboard/summary',
    run: async () => {
      const summary = await client.dashboard.summary({
        scope: 'me',
      });
    },
  },

  {
    operation: 'quick',
    method: 'GET',
    path: '/search',
    run: async () => {
      const quick = await client.search.quick({
        q: '',
      });
    },
  },

  {
    operation: 'status',
    method: 'GET',
    path: '/google/status',
    run: async () => {
      const status = await client.google.status();
    },
  },

  {
    operation: 'purgeSyncedData',
    method: 'POST',
    path: '/google/purge-synced-data',
    run: async () => {
      const purgeSyncedData = await client.google.purgeSyncedData();
    },
  },

  {
    operation: 'revokeAccess',
    method: 'POST',
    path: '/google/revoke',
    run: async () => {
      const revokeAccess = await client.google.revokeAccess();
    },
  },

  {
    operation: 'syncNow',
    method: 'POST',
    path: '/google/sync',
    run: async () => {
      const syncNow = await client.google.syncNow();
    },
  },

  {
    operation: 'setAutoCreate',
    method: 'PATCH',
    path: '/google/auto-create',
    run: async () => {
      const setAutoCreate = await client.google.setAutoCreate({
        source: 'calendar',
        enabled: false,
      });
    },
  },

  {
    operation: 'suppressDomain',
    method: 'POST',
    path: '/google/suppress-domain',
    run: async () => {
      const suppressDomain = await client.google.suppressDomain({
        domain: 'x',
        purge: true,
      });
    },
  },

  {
    operation: 'thread',
    method: 'GET',
    path: '/google/threads/{threadId}',
    run: async () => {
      const thread = await client.google.thread('threadId');
    },
  },

  {
    operation: 'event',
    method: 'GET',
    path: '/google/events/{eventId}',
    run: async () => {
      const event = await client.google.event('eventId');
    },
  },

  {
    operation: 'status',
    method: 'GET',
    path: '/microsoft/status',
    run: async () => {
      const status = await client.microsoft.status();
    },
  },

  {
    operation: 'purgeSyncedData',
    method: 'POST',
    path: '/microsoft/purge-synced-data',
    run: async () => {
      const purgeSyncedData = await client.microsoft.purgeSyncedData();
    },
  },

  {
    operation: 'revokeAccess',
    method: 'POST',
    path: '/microsoft/revoke',
    run: async () => {
      const revokeAccess = await client.microsoft.revokeAccess();
    },
  },

  {
    operation: 'syncNow',
    method: 'POST',
    path: '/microsoft/sync',
    run: async () => {
      const syncNow = await client.microsoft.syncNow();
    },
  },

  {
    operation: 'setAutoCreate',
    method: 'PATCH',
    path: '/microsoft/auto-create',
    run: async () => {
      const setAutoCreate = await client.microsoft.setAutoCreate({
        source: 'outlook',
        enabled: false,
      });
    },
  },

  {
    operation: 'modelCatalog',
    method: 'GET',
    path: '/settings/model-catalog',
    run: async () => {
      const modelCatalog = await client.settings.modelCatalog();
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/settings/agent-model',
    run: async () => {
      const list = await client.settings.agentModel.list();
    },
  },

  {
    operation: 'set',
    method: 'PATCH',
    path: '/settings/agent-model',
    run: async () => {
      const set_ = await client.settings.agentModel.set({
        modelId: 'x',
      });
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/settings/research-key',
    run: async () => {
      const list = await client.settings.researchKey.list();
    },
  },

  {
    operation: 'set',
    method: 'PATCH',
    path: '/settings/research-key',
    run: async () => {
      const set_ = await client.settings.researchKey.set({
        apiKey: 'xxxxxxxx',
      });
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/settings/archive-retention',
    run: async () => {
      const list = await client.settings.archiveRetention.list();
    },
  },

  {
    operation: 'set',
    method: 'PATCH',
    path: '/settings/archive-retention',
    run: async () => {
      const set_ = await client.settings.archiveRetention.set({
        days: 0,
      });
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/workspace',
    run: async () => {
      const list = await client.workspace.list();
    },
  },

  {
    operation: 'update',
    method: 'PATCH',
    path: '/workspace',
    run: async () => {
      const update = await client.workspace.update({
        name: 'x',
        website: 'x',
      });
    },
  },

  {
    operation: 'search',
    method: 'POST',
    path: '/workspace/members/search',
    run: async () => {
      const search = await client.workspace.members.search({
        q: '',
        sort: '',
        dir: 'asc',
        page: 1,
        pageSize: 25,
        role: [],
      });
    },
  },

  {
    operation: 'setRole',
    method: 'PATCH',
    path: '/workspace/members/{memberId}/role',
    run: async () => {
      const setRole = await client.workspace.members.setRole('memberId', {
        role: 'owner',
      });
    },
  },

  {
    operation: 'signInOptions',
    method: 'GET',
    path: '/sso/sign-in-options',
    run: async () => {
      const signInOptions = await client.sso.signInOptions();
    },
  },

  {
    operation: 'settings',
    method: 'GET',
    path: '/sso/settings',
    run: async () => {
      const settings = await client.sso.settings();
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/sso',
    run: async () => {
      const list = await client.sso.list({
        q: '',
        sort: '',
        dir: 'asc',
        page: 1,
        pageSize: 25,
      });
    },
  },

  {
    operation: 'register',
    method: 'POST',
    path: '/sso',
    run: async () => {
      const register = await client.sso.register({
        providerId: 'x',
        issuer: 'https://example.com',
        domain: 'x',
        clientId: 'x',
        clientSecret: 'x',
      });
    },
  },

  {
    operation: 'delete',
    method: 'DELETE',
    path: '/sso/{providerId}',
    run: async () => {
      const delete_ = await client.sso.delete('providerId');
    },
  },

  {
    operation: 'status',
    method: 'GET',
    path: '/slack/status',
    run: async () => {
      const status = await client.slack.status();
    },
  },

  {
    operation: 'matches',
    method: 'GET',
    path: '/slack/matches',
    run: async () => {
      const matches = await client.slack.matches();
    },
  },

  {
    operation: 'refreshPeople',
    method: 'POST',
    path: '/slack/people/refresh',
    run: async () => {
      const refreshPeople = await client.slack.refreshPeople();
    },
  },

  {
    operation: 'disconnect',
    method: 'DELETE',
    path: '/slack/connection',
    run: async () => {
      const disconnect = await client.slack.disconnect();
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/slack/channels',
    run: async () => {
      const list = await client.slack.channels.list();
    },
  },

  {
    operation: 'create',
    method: 'POST',
    path: '/slack/channels',
    run: async () => {
      const create = await client.slack.channels.create({
        name: 'x',
        isPrivate: false,
      });
    },
  },

  {
    operation: 'join',
    method: 'POST',
    path: '/slack/channels/{channelId}/join',
    run: async () => {
      const join = await client.slack.channels.join('channelId');
    },
  },

  {
    operation: 'list',
    method: 'GET',
    path: '/saved-views',
    run: async () => {
      const list = await client.savedViews.list({
        entity: 'COMPANY',
      });
    },
  },

  {
    operation: 'create',
    method: 'POST',
    path: '/saved-views',
    run: async () => {
      const create = await client.savedViews.create({
        entity: 'COMPANY',
        name: 'x',
        shared: false,
        filters: {
          q: '',
          sort: '',
          dir: 'asc',
          archived: false,
          filters: {},
        },
      });
    },
  },

  {
    operation: 'update',
    method: 'PATCH',
    path: '/saved-views/{id}',
    run: async () => {
      const update = await client.savedViews.update('id', {
        data: {},
      });
    },
  },

  {
    operation: 'delete',
    method: 'DELETE',
    path: '/saved-views/{id}',
    run: async () => {
      const delete_ = await client.savedViews.delete('id');
    },
  },
];

const main = async (): Promise<void> => {
  // SCALAR_SMOKE_FILTER (comma-separated) keeps only cases whose operation name or path matches
  // one of the needles, so a caller can smoke-test a subset. With no filter, every case runs.
  const filter = process.env['SCALAR_SMOKE_FILTER'];
  const needles = filter
    ? filter
        .split(',')
        .map((needle) => needle.trim())
        .filter(Boolean)
    : [];
  const selected =
    needles.length > 0
      ? cases.filter((testCase) =>
          needles.some((needle) => testCase.operation.includes(needle) || testCase.path.includes(needle)),
        )
      : cases;

  // Run every selected case concurrently. Promise.allSettled means one failing operation never
  // blocks the others, so a single run reports the status of every endpoint.
  const settled = await Promise.allSettled(
    selected.map(async (testCase): Promise<SmokeResult> => {
      const startedAt = Date.now();
      try {
        await testCase.run();
        return {
          operation: testCase.operation,
          method: testCase.method,
          path: testCase.path,
          status: 'passed',
          durationMs: Date.now() - startedAt,
        };
      } catch (error) {
        // Prefer the stack so a failure points at the failing SDK call; fall back to the message.
        const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
        return {
          operation: testCase.operation,
          method: testCase.method,
          path: testCase.path,
          status: 'failed',
          durationMs: Date.now() - startedAt,
          error: message,
        };
      }
    }),
  );

  // allSettled never rejects, but defensively map any rejected slot to a failed result.
  const results: SmokeResult[] = settled.map((result) =>
    result.status === 'fulfilled'
      ? result.value
      : {
          operation: 'unknown',
          method: '',
          path: '',
          status: 'failed',
          durationMs: 0,
          error: String(result.reason),
        },
  );
  const failed = results.filter((result) => result.status === 'failed');

  // With SCALAR_SMOKE_REPORT set, write a machine-readable report; otherwise print a table.
  const reportPath = process.env['SCALAR_SMOKE_REPORT'];
  if (reportPath) {
    writeFileSync(reportPath, JSON.stringify({ total: results.length, failed: failed.length, results }));
  } else {
    for (const result of results) {
      if (result.status === 'passed')
        console.log(`\u2714 ${result.operation} (${result.method} ${result.path}) ${result.durationMs}ms`);
      else
        console.error(`\u2718 ${result.operation} (${result.method} ${result.path})\n${result.error ?? ''}`);
    }
    if (results.length === 0) {
      console.error('No code samples ran (empty SDK or a SCALAR_SMOKE_FILTER that matched nothing).');
    } else {
      console.log(`\n${results.length - failed.length}/${results.length} samples passed`);
    }
  }

  // An empty run (no operations, or a filter that matched nothing) is a failure, not a vacuous pass.
  if (failed.length > 0 || results.length === 0) process.exitCode = 1;
};

void main();
