# CRM TypeScript API

Complete reference of every operation, grouped by resource. See [the README](./README.md) for usage and configuration.

## Contents

- [`Auth`](#auth)
  - [Get the signed-in user's profile](#get-the-signed-in-users-profile)
  - [Check whether the current request carries a valid session](#check-whether-the-current-request-carries-a-valid-session)
- [`Health`](#health)
  - [Report API and database liveness](#report-api-and-database-liveness)
- [`InternalCron`](#internalcron)
  - [Refresh exchange rates and convert amounts left pending](#refresh-exchange-rates-and-convert-amounts-left-pending)
  - [Run any due Gmail, Outlook or calendar sync](#run-any-due-gmail-outlook-or-calendar-sync)
  - [Alias of `mailboxes`, kept for existing cron deployments](#alias-of-mailboxes-kept-for-existing-cron-deployments)
  - [Roll up raw telemetry events into daily counts](#roll-up-raw-telemetry-events-into-daily-counts)
  - [Roll up and sweep tracking data older than the retention window](#roll-up-and-sweep-tracking-data-older-than-the-retention-window)
  - [Purge companies, contacts and deals past the archive window](#purge-companies-contacts-and-deals-past-the-archive-window)
- [`Conversations`](#conversations)
  - [Download a conversation attachment](#download-a-conversation-attachment)
  - [`list`](#list)
  - [`save`](#save)
  - [`builderResources`](#builderresources)
  - [`events`](#events)
  - [`submitBuilder`](#submitbuilder)
  - [`answerBuilderQuestion`](#answerbuilderquestion)
  - [`rateBuilderResponse`](#ratebuilderresponse)
  - [`markRead`](#markread)
  - [`shared`](#shared)
  - [`delete`](#delete)
  - [`Conversations Builder`](#conversations-builder)
    - [`list`](#list-1)
    - [`create`](#create)
    - [`retrieve`](#retrieve)
  - [`Conversations Share`](#conversations-share)
    - [`status`](#status)
    - [`create`](#create-1)
    - [`revoke`](#revoke)
- [`Tracking`](#tracking)
  - [Fetch a site's compiled tracking config, for the tracking script](#fetch-a-sites-compiled-tracking-config-for-the-tracking-script)
  - [Ingest a batch of events from the tracking script](#ingest-a-batch-of-events-from-the-tracking-script)
  - [`settings`](#settings)
  - [`setFlag`](#setflag)
  - [`setCookieLifetime`](#setcookielifetime)
  - [`rotateSiteId`](#rotatesiteid)
  - [`verify`](#verify)
  - [`sources`](#sources)
  - [`companyActivity`](#companyactivity)
  - [`contactActivity`](#contactactivity)
  - [`Tracking Domains`](#tracking-domains)
    - [`create`](#create-2)
    - [`delete`](#delete-1)
- [`Users`](#users)
  - [`list`](#list-2)
- [`ApiKeys`](#apikeys)
  - [`list`](#list-3)
  - [`create`](#create-3)
  - [`revoke`](#revoke-1)
- [`Companies`](#companies)
  - [`search`](#search)
  - [`retrieve`](#retrieve-1)
  - [`update`](#update)
  - [`purge`](#purge)
  - [`options`](#options)
  - [`create`](#create-4)
  - [`archive`](#archive)
  - [`restore`](#restore)
  - [`bulkAssignOwner`](#bulkassignowner)
  - [`bulkEnrich`](#bulkenrich)
  - [`bulkArchive`](#bulkarchive)
  - [`bulkRestore`](#bulkrestore)
  - [`bulkPurge`](#bulkpurge)
  - [`enrich`](#enrich)
  - [`research`](#research)
  - [`setPrimaryContact`](#setprimarycontact)
- [`Fields`](#fields)
  - [`list`](#list-4)
  - [`create`](#create-5)
  - [`retrieve`](#retrieve-2)
  - [`filters`](#filters)
  - [`coverage`](#coverage)
  - [`update`](#update-1)
  - [`delete`](#delete-2)
  - [`reorder`](#reorder)
  - [`archive`](#archive-1)
  - [`restore`](#restore-1)
  - [`backfill`](#backfill)
- [`Agents`](#agents)
  - [`list`](#list-5)
  - [`revise`](#revise)
  - [`files`](#files)
  - [`saveFile`](#savefile)
  - [`retrieve`](#retrieve-3)
  - [`update`](#update-2)
  - [`delete`](#delete-3)
  - [`history`](#history)
  - [`activity`](#activity)
  - [`deploy`](#deploy)
  - [`pause`](#pause)
  - [`resume`](#resume)
  - [`archive`](#archive-2)
  - [`restore`](#restore-2)
  - [`runNow`](#runnow)
  - [`Agents Runs`](#agents-runs)
    - [`retry`](#retry)
    - [`cancel`](#cancel)
- [`Currency`](#currency)
  - [`settings`](#settings-1)
  - [`setReporting`](#setreporting)
  - [`Currency Rates`](#currency-rates)
    - [`setManual`](#setmanual)
    - [`deleteManual`](#deletemanual)
    - [`refresh`](#refresh)
- [`Contacts`](#contacts)
  - [`search`](#search-1)
  - [`retrieve`](#retrieve-4)
  - [`update`](#update-3)
  - [`purge`](#purge-1)
  - [`create`](#create-6)
  - [`archive`](#archive-3)
  - [`restore`](#restore-3)
  - [`enrich`](#enrich-1)
  - [`bulkAssignOwner`](#bulkassignowner-1)
  - [`bulkSetCompany`](#bulksetcompany)
  - [`bulkEnrich`](#bulkenrich-1)
  - [`bulkArchive`](#bulkarchive-1)
  - [`bulkRestore`](#bulkrestore-1)
  - [`bulkPurge`](#bulkpurge-1)
  - [`decideFact`](#decidefact)
- [`Deals`](#deals)
  - [`search`](#search-2)
  - [`retrieve`](#retrieve-5)
  - [`update`](#update-4)
  - [`purge`](#purge-2)
  - [`create`](#create-7)
  - [`archive`](#archive-4)
  - [`restore`](#restore-4)
  - [`setStage`](#setstage)
  - [`contactOptions`](#contactoptions)
  - [`bulkAssignOwner`](#bulkassignowner-2)
  - [`bulkSetStage`](#bulksetstage)
  - [`bulkArchive`](#bulkarchive-2)
  - [`bulkRestore`](#bulkrestore-2)
  - [`bulkPurge`](#bulkpurge-2)
  - [`Deals Contacts`](#deals-contacts)
    - [`attach`](#attach)
    - [`detach`](#detach)
    - [`setRole`](#setrole)
- [`Activities`](#activities)
  - [`timeline`](#timeline)
  - [`create`](#create-8)
  - [`timelineCounts`](#timelinecounts)
  - [`myTasks`](#mytasks)
  - [`complete`](#complete)
- [`Enrichment`](#enrichment)
  - [`queue`](#queue)
- [`Dashboard`](#dashboard)
  - [`summary`](#summary)
- [`Search`](#search-3)
  - [`quick`](#quick)
- [`Google`](#google)
  - [`status`](#status-1)
  - [`purgeSyncedData`](#purgesynceddata)
  - [`revokeAccess`](#revokeaccess)
  - [`syncNow`](#syncnow)
  - [`setAutoCreate`](#setautocreate)
  - [`suppressDomain`](#suppressdomain)
  - [`thread`](#thread)
  - [`event`](#event)
- [`Microsoft`](#microsoft)
  - [`status`](#status-2)
  - [`purgeSyncedData`](#purgesynceddata-1)
  - [`revokeAccess`](#revokeaccess-1)
  - [`syncNow`](#syncnow-1)
  - [`setAutoCreate`](#setautocreate-1)
- [`Settings`](#settings-2)
  - [`modelCatalog`](#modelcatalog)
  - [`Settings AgentModel`](#settings-agentmodel)
    - [`list`](#list-6)
    - [`set`](#set)
  - [`Settings ResearchKey`](#settings-researchkey)
    - [`list`](#list-7)
    - [`set`](#set-1)
  - [`Settings ArchiveRetention`](#settings-archiveretention)
    - [`list`](#list-8)
    - [`set`](#set-2)
- [`Workspace`](#workspace)
  - [`list`](#list-9)
  - [`update`](#update-5)
  - [`Workspace Members`](#workspace-members)
    - [`search`](#search-4)
    - [`setRole`](#setrole-1)
- [`Sso`](#sso)
  - [`signInOptions`](#signinoptions)
  - [`settings`](#settings-3)
  - [`list`](#list-10)
  - [`register`](#register)
  - [`delete`](#delete-4)
- [`Slack`](#slack)
  - [`status`](#status-3)
  - [`matches`](#matches)
  - [`refreshPeople`](#refreshpeople)
  - [`disconnect`](#disconnect)
  - [`Slack Channels`](#slack-channels)
    - [`list`](#list-11)
    - [`create`](#create-9)
    - [`join`](#join)
- [`SavedViews`](#savedviews)
  - [`list`](#list-12)
  - [`create`](#create-10)
  - [`update`](#update-6)
  - [`delete`](#delete-5)

## Setup

```ts
import CrmAPI from '@trycomp/crm';

const client = new CrmAPI();
```

## `Auth`

### Get the signed-in user's profile

```ts
await client.auth.controllerGetMe();
```

### Check whether the current request carries a valid session

```ts
await client.auth.controllerGetSession();
```

## `Health`

### Report API and database liveness

| Direction | Type |
| --- | --- |
| Response | [`HealthControllerCheckResponse`](./src/resources/health.ts) |

```ts
const string_ = await client.health.controllerCheck();
```

## `InternalCron`

### Refresh exchange rates and convert amounts left pending

| Direction | Type |
| --- | --- |
| Request | [`InternalCronRatesControllerRatesViaGetParams`](./src/resources/internal-cron.ts) |

```ts
await client.internalCron.ratesControllerRatesViaGet({
  authorization: 'authorization',
});
```

### Run any due Gmail, Outlook or calendar sync

| Direction | Type |
| --- | --- |
| Request | [`InternalCronSyncControllerMailboxesViaGetParams`](./src/resources/internal-cron.ts) |

```ts
await client.internalCron.syncControllerMailboxesViaGet({
  authorization: 'authorization',
});
```

### Alias of `mailboxes`, kept for existing cron deployments

| Direction | Type |
| --- | --- |
| Request | [`InternalCronSyncControllerGoogleViaGetParams`](./src/resources/internal-cron.ts) |

```ts
await client.internalCron.syncControllerGoogleViaGet({
  authorization: 'authorization',
});
```

### Roll up raw telemetry events into daily counts

| Direction | Type |
| --- | --- |
| Request | [`InternalCronTelemetryControllerRollupViaGetParams`](./src/resources/internal-cron.ts) |

```ts
await client.internalCron.telemetryControllerRollupViaGet({
  authorization: 'authorization',
});
```

### Roll up and sweep tracking data older than the retention window

| Direction | Type |
| --- | --- |
| Request | [`InternalCronTrackingRetentionControllerViaGetParams`](./src/resources/internal-cron.ts) |

```ts
await client.internalCron.trackingRetentionControllerViaGet({
  authorization: 'authorization',
});
```

### Purge companies, contacts and deals past the archive window

| Direction | Type |
| --- | --- |
| Request | [`InternalCronArchiveRetentionControllerPruneViaGetParams`](./src/resources/internal-cron.ts) |

```ts
await client.internalCron.archiveRetentionControllerPruneViaGet({
  authorization: 'authorization',
});
```

## `Conversations`

### Download a conversation attachment

| Direction | Type |
| --- | --- |
| Request | [`ConversationAttachmentsControllerReadParams`](./src/resources/conversations/conversations.ts) |

```ts
await client.conversations.attachmentsControllerRead('id');
```

### `list`

| Direction | Type |
| --- | --- |
| Request | [`ConversationListParams`](./src/resources/conversations/conversations.ts) |
| Response | [`ConversationListResponse`](./src/resources/conversations/conversations.ts) |

```ts
const list = await client.conversations.list();
```

### `save`

| Direction | Type |
| --- | --- |
| Request | [`ConversationSaveParams`](./src/resources/conversations/conversations.ts) |
| Response | [`ConversationSaveResponse`](./src/resources/conversations/conversations.ts) |

```ts
const save = await client.conversations.save({
  sessionId: 'x',
});
```

### `builderResources`

| Direction | Type |
| --- | --- |
| Request | [`ConversationBuilderResourcesParams`](./src/resources/conversations/conversations.ts) |
| Response | [`ConversationBuilderResourcesResponse`](./src/resources/conversations/conversations.ts) |

```ts
const builderResources = await client.conversations.builderResources({
  q: '',
});
```

### `events`

| Direction | Type |
| --- | --- |
| Request | [`ConversationEventsParams`](./src/resources/conversations/conversations.ts) |
| Response | [`ConversationEventsResponse`](./src/resources/conversations/conversations.ts) |

```ts
const events = await client.conversations.events('id', {
  limit: 2000,
});
```

### `submitBuilder`

| Direction | Type |
| --- | --- |
| Request | [`ConversationSubmitBuilderParams`](./src/resources/conversations/conversations.ts) |
| Response | [`ConversationSubmitBuilderResponse`](./src/resources/conversations/conversations.ts) |

```ts
const submitBuilder = await client.conversations.submitBuilder('id', {
  clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  commandType: 'CHAT',
  message: 'x',
  resources: [],
  attachments: [],
});
```

### `answerBuilderQuestion`

| Direction | Type |
| --- | --- |
| Request | [`ConversationAnswerBuilderQuestionParams`](./src/resources/conversations/conversations.ts) |
| Response | [`ConversationAnswerBuilderQuestionResponse`](./src/resources/conversations/conversations.ts) |

```ts
const answerBuilderQuestion = await client.conversations.answerBuilderQuestion('id', {
  clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  requestId: 'x',
});
```

### `rateBuilderResponse`

| Direction | Type |
| --- | --- |
| Request | [`ConversationRateBuilderResponseParams`](./src/resources/conversations/conversations.ts) |
| Response | [`ConversationRateBuilderResponseResponse`](./src/resources/conversations/conversations.ts) |

```ts
const rateBuilderResponse = await client.conversations.rateBuilderResponse('id', {
  messageId: 'x',
  rating: 'UP',
});
```

### `markRead`

| Direction | Type |
| --- | --- |
| Response | [`ConversationMarkReadResponse`](./src/resources/conversations/conversations.ts) |

```ts
const markRead = await client.conversations.markRead('id');
```

### `shared`

| Direction | Type |
| --- | --- |
| Response | [`ConversationSharedResponse`](./src/resources/conversations/conversations.ts) |

```ts
const shared = await client.conversations.shared('tokenxxxxxxxxxxxxxxxxxxxxxxxxxxx');
```

### `delete`

| Direction | Type |
| --- | --- |
| Response | [`ConversationDeleteResponse`](./src/resources/conversations/conversations.ts) |

```ts
const delete_ = await client.conversations.delete('id');
```

### `Conversations Builder`

#### `list`

| Direction | Type |
| --- | --- |
| Response | [`BuilderListResponse`](./src/resources/conversations/builder.ts) |

```ts
const list = await client.conversations.builder.list();
```

#### `create`

| Direction | Type |
| --- | --- |
| Request | [`BuilderCreateParams`](./src/resources/conversations/builder.ts) |
| Response | [`BuilderCreateResponse`](./src/resources/conversations/builder.ts) |

```ts
const create = await client.conversations.builder.create({
  clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  commandType: 'CHAT',
  message: 'x',
  resources: [],
  attachments: [],
});
```

#### `retrieve`

| Direction | Type |
| --- | --- |
| Response | [`BuilderRetrieveResponse`](./src/resources/conversations/builder.ts) |

```ts
const retrieve = await client.conversations.builder.retrieve('id');
```

### `Conversations Share`

#### `status`

| Direction | Type |
| --- | --- |
| Response | [`ShareStatusResponse`](./src/resources/conversations/share.ts) |

```ts
const status = await client.conversations.share.status('id');
```

#### `create`

| Direction | Type |
| --- | --- |
| Response | [`ShareCreateResponse`](./src/resources/conversations/share.ts) |

```ts
const create = await client.conversations.share.create('id');
```

#### `revoke`

| Direction | Type |
| --- | --- |
| Response | [`ShareRevokeResponse`](./src/resources/conversations/share.ts) |

```ts
const revoke = await client.conversations.share.revoke('id');
```

## `Tracking`

### Fetch a site's compiled tracking config, for the tracking script

```ts
await client.tracking.controllerPublicConfig('siteId');
```

### Ingest a batch of events from the tracking script

| Direction | Type |
| --- | --- |
| Request | [`TrackingControllerCollectParams`](./src/resources/tracking/tracking.ts) |

```ts
await client.tracking.controllerCollect({
  origin: 'origin',
  'user-agent': 'userAgent',
});
```

### `settings`

| Direction | Type |
| --- | --- |
| Response | [`TrackingSettingsResponse`](./src/resources/tracking/tracking.ts) |

```ts
const settings = await client.tracking.settings();
```

### `setFlag`

| Direction | Type |
| --- | --- |
| Request | [`TrackingSetFlagParams`](./src/resources/tracking/tracking.ts) |

```ts
const unknown_ = await client.tracking.setFlag({
  flag: 'crossDomain',
  enabled: false,
});
```

### `setCookieLifetime`

| Direction | Type |
| --- | --- |
| Request | [`TrackingSetCookieLifetimeParams`](./src/resources/tracking/tracking.ts) |

```ts
const unknown_ = await client.tracking.setCookieLifetime({
  days: 0,
});
```

### `rotateSiteId`

| Direction | Type |
| --- | --- |
| Response | [`TrackingRotateSiteIDResponse`](./src/resources/tracking/tracking.ts) |

```ts
const rotateSiteID = await client.tracking.rotateSiteID();
```

### `verify`

| Direction | Type |
| --- | --- |
| Request | [`TrackingVerifyParams`](./src/resources/tracking/tracking.ts) |
| Response | [`TrackingVerifyResponse`](./src/resources/tracking/tracking.ts) |

```ts
const verify = await client.tracking.verify({
  url: 'x',
});
```

### `sources`

| Direction | Type |
| --- | --- |
| Response | [`TrackingSourcesResponse`](./src/resources/tracking/tracking.ts) |

```ts
const sources = await client.tracking.sources();
```

### `companyActivity`

| Direction | Type |
| --- | --- |
| Response | [`TrackingCompanyActivityResponse`](./src/resources/tracking/tracking.ts) |

```ts
const companyActivity = await client.tracking.companyActivity('companyId');
```

### `contactActivity`

| Direction | Type |
| --- | --- |
| Response | [`TrackingContactActivityResponse`](./src/resources/tracking/tracking.ts) |

```ts
const contactActivity = await client.tracking.contactActivity('contactId');
```

### `Tracking Domains`

#### `create`

| Direction | Type |
| --- | --- |
| Request | [`DomainCreateParams`](./src/resources/tracking/domains.ts) |
| Response | [`DomainCreateResponse`](./src/resources/tracking/domains.ts) |

```ts
const create = await client.tracking.domains.create({
  host: 'x',
  scope: 'EXACT_HOST',
});
```

#### `delete`

```ts
const unknown_ = await client.tracking.domains.delete('id');
```

## `Users`

### `list`

| Direction | Type |
| --- | --- |
| Response | [`UserListResponse`](./src/resources/users.ts) |

```ts
const list = await client.users.list();
```

## `ApiKeys`

### `list`

| Direction | Type |
| --- | --- |
| Request | [`APIKeyListParams`](./src/resources/api-keys.ts) |
| Response | [`APIKeyListResponse`](./src/resources/api-keys.ts) |

```ts
const list = await client.apiKeys.list({
  q: '',
  sort: '',
  dir: 'asc',
  page: 1,
  pageSize: 25,
});
```

### `create`

| Direction | Type |
| --- | --- |
| Request | [`APIKeyCreateParams`](./src/resources/api-keys.ts) |
| Response | [`APIKeyCreateResponse`](./src/resources/api-keys.ts) |

```ts
const create = await client.apiKeys.create({
  name: 'x',
  expiresInDays: 0,
});
```

### `revoke`

| Direction | Type |
| --- | --- |
| Response | [`APIKeyRevokeResponse`](./src/resources/api-keys.ts) |

```ts
const revoke = await client.apiKeys.revoke('id');
```

## `Companies`

### `search`

| Direction | Type |
| --- | --- |
| Request | [`CompanySearchParams`](./src/resources/companies.ts) |
| Response | [`CompanySearchResponse`](./src/resources/companies.ts) |

```ts
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
```

### `retrieve`

| Direction | Type |
| --- | --- |
| Response | [`CompanyRetrieveResponse`](./src/resources/companies.ts) |

```ts
const retrieve = await client.companies.retrieve('id');
```

### `update`

| Direction | Type |
| --- | --- |
| Request | [`CompanyUpdateParams`](./src/resources/companies.ts) |
| Response | [`CompanyUpdateResponse`](./src/resources/companies.ts) |

```ts
const update = await client.companies.update('id', {
  data: {},
});
```

### `purge`

| Direction | Type |
| --- | --- |
| Response | [`CompanyPurgeResponse`](./src/resources/companies.ts) |

```ts
const purge = await client.companies.purge('id');
```

### `options`

| Direction | Type |
| --- | --- |
| Request | [`CompanyOptionsParams`](./src/resources/companies.ts) |
| Response | [`CompanyOptionsResponse`](./src/resources/companies.ts) |

```ts
const options = await client.companies.options({
  q: '',
});
```

### `create`

| Direction | Type |
| --- | --- |
| Request | [`CompanyCreateParams`](./src/resources/companies.ts) |
| Response | [`CompanyCreateResponse`](./src/resources/companies.ts) |

```ts
const create = await client.companies.create({
  name: 'x',
});
```

### `archive`

| Direction | Type |
| --- | --- |
| Response | [`CompanyArchiveResponse`](./src/resources/companies.ts) |

```ts
const archive = await client.companies.archive('id');
```

### `restore`

| Direction | Type |
| --- | --- |
| Response | [`CompanyRestoreResponse`](./src/resources/companies.ts) |

```ts
const restore = await client.companies.restore('id');
```

### `bulkAssignOwner`

| Direction | Type |
| --- | --- |
| Request | [`CompanyBulkAssignOwnerParams`](./src/resources/companies.ts) |
| Response | [`CompanyBulkAssignOwnerResponse`](./src/resources/companies.ts) |

```ts
const bulkAssignOwner = await client.companies.bulkAssignOwner({
  ids: [],
  ownerId: '',
});
```

### `bulkEnrich`

| Direction | Type |
| --- | --- |
| Request | [`CompanyBulkEnrichParams`](./src/resources/companies.ts) |
| Response | [`CompanyBulkEnrichResponse`](./src/resources/companies.ts) |

```ts
const bulkEnrich = await client.companies.bulkEnrich({
  ids: [],
});
```

### `bulkArchive`

| Direction | Type |
| --- | --- |
| Request | [`CompanyBulkArchiveParams`](./src/resources/companies.ts) |
| Response | [`CompanyBulkArchiveResponse`](./src/resources/companies.ts) |

```ts
const bulkArchive = await client.companies.bulkArchive({
  ids: [],
});
```

### `bulkRestore`

| Direction | Type |
| --- | --- |
| Request | [`CompanyBulkRestoreParams`](./src/resources/companies.ts) |
| Response | [`CompanyBulkRestoreResponse`](./src/resources/companies.ts) |

```ts
const bulkRestore = await client.companies.bulkRestore({
  ids: [],
});
```

### `bulkPurge`

| Direction | Type |
| --- | --- |
| Request | [`CompanyBulkPurgeParams`](./src/resources/companies.ts) |
| Response | [`CompanyBulkPurgeResponse`](./src/resources/companies.ts) |

```ts
const bulkPurge = await client.companies.bulkPurge({
  ids: [],
});
```

### `enrich`

| Direction | Type |
| --- | --- |
| Response | [`CompanyEnrichResponse`](./src/resources/companies.ts) |

```ts
const enrich = await client.companies.enrich('id');
```

### `research`

| Direction | Type |
| --- | --- |
| Response | [`CompanyResearchResponse`](./src/resources/companies.ts) |

```ts
const research = await client.companies.research('id');
```

### `setPrimaryContact`

| Direction | Type |
| --- | --- |
| Request | [`CompanySetPrimaryContactParams`](./src/resources/companies.ts) |
| Response | [`CompanySetPrimaryContactResponse`](./src/resources/companies.ts) |

```ts
const setPrimaryContact = await client.companies.setPrimaryContact('companyId', {
  contactId: '',
});
```

## `Fields`

### `list`

| Direction | Type |
| --- | --- |
| Request | [`FieldListParams`](./src/resources/fields.ts) |
| Response | [`FieldListResponse`](./src/resources/fields.ts) |

```ts
const list = await client.fields.list({
  entity: 'COMPANY',
  includeArchived: false,
});
```

### `create`

| Direction | Type |
| --- | --- |
| Request | [`FieldCreateParams`](./src/resources/fields.ts) |
| Response | [`FieldCreateResponse`](./src/resources/fields.ts) |

```ts
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
```

### `retrieve`

| Direction | Type |
| --- | --- |
| Request | [`FieldRetrieveParams`](./src/resources/fields.ts) |
| Response | [`FieldRetrieveResponse`](./src/resources/fields.ts) |

```ts
const retrieve = await client.fields.retrieve('key', {
  entity: 'COMPANY',
});
```

### `filters`

| Direction | Type |
| --- | --- |
| Response | [`FieldFiltersResponse`](./src/resources/fields.ts) |

```ts
const filters = await client.fields.filters('COMPANY');
```

### `coverage`

| Direction | Type |
| --- | --- |
| Response | [`FieldCoverageResponse`](./src/resources/fields.ts) |

```ts
const coverage = await client.fields.coverage('id');
```

### `update`

| Direction | Type |
| --- | --- |
| Request | [`FieldUpdateParams`](./src/resources/fields.ts) |
| Response | [`FieldUpdateResponse`](./src/resources/fields.ts) |

```ts
const update = await client.fields.update('id', {
  data: {},
});
```

### `delete`

| Direction | Type |
| --- | --- |
| Response | [`FieldDeleteResponse`](./src/resources/fields.ts) |

```ts
const delete_ = await client.fields.delete('id');
```

### `reorder`

| Direction | Type |
| --- | --- |
| Request | [`FieldReorderParams`](./src/resources/fields.ts) |
| Response | [`FieldReorderResponse`](./src/resources/fields.ts) |

```ts
const reorder = await client.fields.reorder({
  entity: 'COMPANY',
  ids: [],
});
```

### `archive`

| Direction | Type |
| --- | --- |
| Response | [`FieldArchiveResponse`](./src/resources/fields.ts) |

```ts
const archive = await client.fields.archive('id');
```

### `restore`

| Direction | Type |
| --- | --- |
| Response | [`FieldRestoreResponse`](./src/resources/fields.ts) |

```ts
const restore = await client.fields.restore('id');
```

### `backfill`

| Direction | Type |
| --- | --- |
| Response | [`FieldBackfillResponse`](./src/resources/fields.ts) |

```ts
const backfill = await client.fields.backfill('id');
```

## `Agents`

### `list`

| Direction | Type |
| --- | --- |
| Response | [`AgentListResponse`](./src/resources/agents/agents.ts) |

```ts
const list = await client.agents.list();
```

### `revise`

| Direction | Type |
| --- | --- |
| Request | [`AgentReviseParams`](./src/resources/agents/agents.ts) |
| Response | [`AgentReviseResponse`](./src/resources/agents/agents.ts) |

```ts
const revise = await client.agents.revise('id', {
  clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
});
```

### `files`

| Direction | Type |
| --- | --- |
| Response | [`AgentFilesResponse`](./src/resources/agents/agents.ts) |

```ts
const files = await client.agents.files('id');
```

### `saveFile`

| Direction | Type |
| --- | --- |
| Request | [`AgentSaveFileParams`](./src/resources/agents/agents.ts) |
| Response | [`AgentSaveFileResponse`](./src/resources/agents/agents.ts) |

```ts
const saveFile = await client.agents.saveFile('id', {
  clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  path: 'x',
  content: '',
});
```

### `retrieve`

| Direction | Type |
| --- | --- |
| Response | [`AgentRetrieveResponse`](./src/resources/agents/agents.ts) |

```ts
const retrieve = await client.agents.retrieve('id');
```

### `update`

| Direction | Type |
| --- | --- |
| Request | [`AgentUpdateParams`](./src/resources/agents/agents.ts) |
| Response | [`AgentUpdateResponse`](./src/resources/agents/agents.ts) |

```ts
const update = await client.agents.update('id', {
  name: 'x',
  description: '',
});
```

### `delete`

| Direction | Type |
| --- | --- |
| Response | [`AgentDeleteResponse`](./src/resources/agents/agents.ts) |

```ts
const delete_ = await client.agents.delete('id');
```

### `history`

| Direction | Type |
| --- | --- |
| Request | [`AgentHistoryParams`](./src/resources/agents/agents.ts) |
| Response | [`AgentHistoryResponse`](./src/resources/agents/agents.ts) |

```ts
const history = await client.agents.history('id', {
  limit: 50,
});
```

### `activity`

| Direction | Type |
| --- | --- |
| Request | [`AgentActivityParams`](./src/resources/agents/agents.ts) |
| Response | [`AgentActivityResponse`](./src/resources/agents/agents.ts) |

```ts
const activity = await client.agents.activity('id', {
  limit: 50,
});
```

### `deploy`

| Direction | Type |
| --- | --- |
| Request | [`AgentDeployParams`](./src/resources/agents/agents.ts) |
| Response | [`AgentDeployResponse`](./src/resources/agents/agents.ts) |

```ts
const deploy = await client.agents.deploy('id', {
  versionId: 'x',
  clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
});
```

### `pause`

| Direction | Type |
| --- | --- |
| Response | [`AgentPauseResponse`](./src/resources/agents/agents.ts) |

```ts
const pause = await client.agents.pause('id');
```

### `resume`

| Direction | Type |
| --- | --- |
| Response | [`AgentResumeResponse`](./src/resources/agents/agents.ts) |

```ts
const resume = await client.agents.resume('id');
```

### `archive`

| Direction | Type |
| --- | --- |
| Response | [`AgentArchiveResponse`](./src/resources/agents/agents.ts) |

```ts
const archive = await client.agents.archive('id');
```

### `restore`

| Direction | Type |
| --- | --- |
| Response | [`AgentRestoreResponse`](./src/resources/agents/agents.ts) |

```ts
const restore = await client.agents.restore('id');
```

### `runNow`

| Direction | Type |
| --- | --- |
| Request | [`AgentRunNowParams`](./src/resources/agents/agents.ts) |
| Response | [`AgentRunNowResponse`](./src/resources/agents/agents.ts) |

```ts
const runNow = await client.agents.runNow('id', {
  clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
});
```

### `Agents Runs`

#### `retry`

| Direction | Type |
| --- | --- |
| Request | [`RunRetryParams`](./src/resources/agents/runs.ts) |
| Response | [`RunRetryResponse`](./src/resources/agents/runs.ts) |

```ts
const retry = await client.agents.runs.retry('runId', {
  id: 'id',
  clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
});
```

#### `cancel`

| Direction | Type |
| --- | --- |
| Request | [`RunCancelParams`](./src/resources/agents/runs.ts) |
| Response | [`RunCancelResponse`](./src/resources/agents/runs.ts) |

```ts
const cancel = await client.agents.runs.cancel('runId', {
  id: 'id',
});
```

## `Currency`

### `settings`

| Direction | Type |
| --- | --- |
| Response | [`CurrencySettingsResponse`](./src/resources/currency/currency.ts) |

```ts
const settings = await client.currency.settings();
```

### `setReporting`

| Direction | Type |
| --- | --- |
| Request | [`CurrencySetReportingParams`](./src/resources/currency/currency.ts) |
| Response | [`CurrencySetReportingResponse`](./src/resources/currency/currency.ts) |

```ts
const setReporting = await client.currency.setReporting({
  currency: 'xxx',
});
```

### `Currency Rates`

#### `setManual`

| Direction | Type |
| --- | --- |
| Request | [`RateSetManualParams`](./src/resources/currency/rates.ts) |
| Response | [`RateSetManualResponse`](./src/resources/currency/rates.ts) |

```ts
const setManual = await client.currency.rates.setManual('currency', {
  rate: 0,
});
```

#### `deleteManual`

| Direction | Type |
| --- | --- |
| Response | [`RateDeleteManualResponse`](./src/resources/currency/rates.ts) |

```ts
const deleteManual = await client.currency.rates.deleteManual('currency');
```

#### `refresh`

| Direction | Type |
| --- | --- |
| Response | [`RateRefreshResponse`](./src/resources/currency/rates.ts) |

```ts
const refresh = await client.currency.rates.refresh();
```

## `Contacts`

### `search`

| Direction | Type |
| --- | --- |
| Request | [`ContactSearchParams`](./src/resources/contacts.ts) |
| Response | [`ContactSearchResponse`](./src/resources/contacts.ts) |

```ts
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
```

### `retrieve`

| Direction | Type |
| --- | --- |
| Response | [`ContactRetrieveResponse`](./src/resources/contacts.ts) |

```ts
const retrieve = await client.contacts.retrieve('id');
```

### `update`

| Direction | Type |
| --- | --- |
| Request | [`ContactUpdateParams`](./src/resources/contacts.ts) |
| Response | [`ContactUpdateResponse`](./src/resources/contacts.ts) |

```ts
const update = await client.contacts.update('id', {
  data: {},
});
```

### `purge`

| Direction | Type |
| --- | --- |
| Response | [`ContactPurgeResponse`](./src/resources/contacts.ts) |

```ts
const purge = await client.contacts.purge('id');
```

### `create`

| Direction | Type |
| --- | --- |
| Request | [`ContactCreateParams`](./src/resources/contacts.ts) |
| Response | [`ContactCreateResponse`](./src/resources/contacts.ts) |

```ts
const create = await client.contacts.create({
  firstName: 'x',
});
```

### `archive`

| Direction | Type |
| --- | --- |
| Response | [`ContactArchiveResponse`](./src/resources/contacts.ts) |

```ts
const archive = await client.contacts.archive('id');
```

### `restore`

| Direction | Type |
| --- | --- |
| Response | [`ContactRestoreResponse`](./src/resources/contacts.ts) |

```ts
const restore = await client.contacts.restore('id');
```

### `enrich`

| Direction | Type |
| --- | --- |
| Response | [`ContactEnrichResponse`](./src/resources/contacts.ts) |

```ts
const enrich = await client.contacts.enrich('id');
```

### `bulkAssignOwner`

| Direction | Type |
| --- | --- |
| Request | [`ContactBulkAssignOwnerParams`](./src/resources/contacts.ts) |
| Response | [`ContactBulkAssignOwnerResponse`](./src/resources/contacts.ts) |

```ts
const bulkAssignOwner = await client.contacts.bulkAssignOwner({
  ids: [],
  ownerId: '',
});
```

### `bulkSetCompany`

| Direction | Type |
| --- | --- |
| Request | [`ContactBulkSetCompanyParams`](./src/resources/contacts.ts) |
| Response | [`ContactBulkSetCompanyResponse`](./src/resources/contacts.ts) |

```ts
const bulkSetCompany = await client.contacts.bulkSetCompany({
  ids: [],
  companyId: '',
});
```

### `bulkEnrich`

| Direction | Type |
| --- | --- |
| Request | [`ContactBulkEnrichParams`](./src/resources/contacts.ts) |
| Response | [`ContactBulkEnrichResponse`](./src/resources/contacts.ts) |

```ts
const bulkEnrich = await client.contacts.bulkEnrich({
  ids: [],
});
```

### `bulkArchive`

| Direction | Type |
| --- | --- |
| Request | [`ContactBulkArchiveParams`](./src/resources/contacts.ts) |
| Response | [`ContactBulkArchiveResponse`](./src/resources/contacts.ts) |

```ts
const bulkArchive = await client.contacts.bulkArchive({
  ids: [],
});
```

### `bulkRestore`

| Direction | Type |
| --- | --- |
| Request | [`ContactBulkRestoreParams`](./src/resources/contacts.ts) |
| Response | [`ContactBulkRestoreResponse`](./src/resources/contacts.ts) |

```ts
const bulkRestore = await client.contacts.bulkRestore({
  ids: [],
});
```

### `bulkPurge`

| Direction | Type |
| --- | --- |
| Request | [`ContactBulkPurgeParams`](./src/resources/contacts.ts) |
| Response | [`ContactBulkPurgeResponse`](./src/resources/contacts.ts) |

```ts
const bulkPurge = await client.contacts.bulkPurge({
  ids: [],
});
```

### `decideFact`

| Direction | Type |
| --- | --- |
| Request | [`ContactDecideFactParams`](./src/resources/contacts.ts) |
| Response | [`ContactDecideFactResponse`](./src/resources/contacts.ts) |

```ts
const decideFact = await client.contacts.decideFact({
  factId: '',
  decision: 'accept',
});
```

## `Deals`

### `search`

| Direction | Type |
| --- | --- |
| Request | [`DealSearchParams`](./src/resources/deals/deals.ts) |
| Response | [`DealSearchResponse`](./src/resources/deals/deals.ts) |

```ts
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
```

### `retrieve`

| Direction | Type |
| --- | --- |
| Response | [`DealRetrieveResponse`](./src/resources/deals/deals.ts) |

```ts
const retrieve = await client.deals.retrieve('id');
```

### `update`

| Direction | Type |
| --- | --- |
| Request | [`DealUpdateParams`](./src/resources/deals/deals.ts) |
| Response | [`DealUpdateResponse`](./src/resources/deals/deals.ts) |

```ts
const update = await client.deals.update('id', {
  data: {},
});
```

### `purge`

| Direction | Type |
| --- | --- |
| Response | [`DealPurgeResponse`](./src/resources/deals/deals.ts) |

```ts
const purge = await client.deals.purge('id');
```

### `create`

| Direction | Type |
| --- | --- |
| Request | [`DealCreateParams`](./src/resources/deals/deals.ts) |
| Response | [`DealCreateResponse`](./src/resources/deals/deals.ts) |

```ts
const create = await client.deals.create({
  name: 'x',
  companyId: 'x',
  ownerId: 'x',
});
```

### `archive`

| Direction | Type |
| --- | --- |
| Response | [`DealArchiveResponse`](./src/resources/deals/deals.ts) |

```ts
const archive = await client.deals.archive('id');
```

### `restore`

| Direction | Type |
| --- | --- |
| Response | [`DealRestoreResponse`](./src/resources/deals/deals.ts) |

```ts
const restore = await client.deals.restore('id');
```

### `setStage`

| Direction | Type |
| --- | --- |
| Request | [`DealSetStageParams`](./src/resources/deals/deals.ts) |
| Response | [`DealSetStageResponse`](./src/resources/deals/deals.ts) |

```ts
const setStage = await client.deals.setStage('id', {
  stage: 'DEMO_BOOKED',
});
```

### `contactOptions`

| Direction | Type |
| --- | --- |
| Response | [`DealContactOptionsResponse`](./src/resources/deals/deals.ts) |

```ts
const contactOptions = await client.deals.contactOptions('dealId');
```

### `bulkAssignOwner`

| Direction | Type |
| --- | --- |
| Request | [`DealBulkAssignOwnerParams`](./src/resources/deals/deals.ts) |
| Response | [`DealBulkAssignOwnerResponse`](./src/resources/deals/deals.ts) |

```ts
const bulkAssignOwner = await client.deals.bulkAssignOwner({
  ids: [],
  ownerId: 'x',
});
```

### `bulkSetStage`

| Direction | Type |
| --- | --- |
| Request | [`DealBulkSetStageParams`](./src/resources/deals/deals.ts) |
| Response | [`DealBulkSetStageResponse`](./src/resources/deals/deals.ts) |

```ts
const bulkSetStage = await client.deals.bulkSetStage({
  ids: [],
  stage: 'DEMO_BOOKED',
});
```

### `bulkArchive`

| Direction | Type |
| --- | --- |
| Request | [`DealBulkArchiveParams`](./src/resources/deals/deals.ts) |
| Response | [`DealBulkArchiveResponse`](./src/resources/deals/deals.ts) |

```ts
const bulkArchive = await client.deals.bulkArchive({
  ids: [],
});
```

### `bulkRestore`

| Direction | Type |
| --- | --- |
| Request | [`DealBulkRestoreParams`](./src/resources/deals/deals.ts) |
| Response | [`DealBulkRestoreResponse`](./src/resources/deals/deals.ts) |

```ts
const bulkRestore = await client.deals.bulkRestore({
  ids: [],
});
```

### `bulkPurge`

| Direction | Type |
| --- | --- |
| Request | [`DealBulkPurgeParams`](./src/resources/deals/deals.ts) |
| Response | [`DealBulkPurgeResponse`](./src/resources/deals/deals.ts) |

```ts
const bulkPurge = await client.deals.bulkPurge({
  ids: [],
});
```

### `Deals Contacts`

#### `attach`

| Direction | Type |
| --- | --- |
| Request | [`ContactAttachParams`](./src/resources/deals/contacts.ts) |
| Response | [`ContactAttachResponse`](./src/resources/deals/contacts.ts) |

```ts
const attach = await client.deals.contacts.attach('dealId', {
  contactId: 'x',
});
```

#### `detach`

| Direction | Type |
| --- | --- |
| Request | [`ContactDetachParams`](./src/resources/deals/contacts.ts) |
| Response | [`ContactDetachResponse`](./src/resources/deals/contacts.ts) |

```ts
const detach = await client.deals.contacts.detach('contactId', {
  dealId: 'dealId',
});
```

#### `setRole`

| Direction | Type |
| --- | --- |
| Request | [`ContactSetRoleParams`](./src/resources/deals/contacts.ts) |
| Response | [`ContactSetRoleResponse`](./src/resources/deals/contacts.ts) |

```ts
const setRole = await client.deals.contacts.setRole('contactId', {
  dealId: 'dealId',
  role: '',
});
```

## `Activities`

### `timeline`

| Direction | Type |
| --- | --- |
| Request | [`ActivityTimelineParams`](./src/resources/activities.ts) |
| Response | [`ActivityTimelineResponse`](./src/resources/activities.ts) |

```ts
const timeline = await client.activities.timeline({
  filter: 'all',
  limit: 30,
});
```

### `create`

| Direction | Type |
| --- | --- |
| Request | [`ActivityCreateParams`](./src/resources/activities.ts) |
| Response | [`ActivityCreateResponse`](./src/resources/activities.ts) |

```ts
const create = await client.activities.create({
  type: 'NOTE',
});
```

### `timelineCounts`

| Direction | Type |
| --- | --- |
| Request | [`ActivityTimelineCountsParams`](./src/resources/activities.ts) |
| Response | [`ActivityTimelineCountsResponse`](./src/resources/activities.ts) |

```ts
const timelineCounts = await client.activities.timelineCounts();
```

### `myTasks`

| Direction | Type |
| --- | --- |
| Request | [`ActivityMyTasksParams`](./src/resources/activities.ts) |
| Response | [`ActivityMyTasksResponse`](./src/resources/activities.ts) |

```ts
const myTasks = await client.activities.myTasks({
  window: 'all',
  limit: 25,
});
```

### `complete`

| Direction | Type |
| --- | --- |
| Request | [`ActivityCompleteParams`](./src/resources/activities.ts) |
| Response | [`ActivityCompleteResponse`](./src/resources/activities.ts) |

```ts
const complete = await client.activities.complete('id', {
  completed: true,
});
```

## `Enrichment`

### `queue`

| Direction | Type |
| --- | --- |
| Request | [`EnrichmentQueueParams`](./src/resources/enrichment.ts) |
| Response | [`EnrichmentQueueResponse`](./src/resources/enrichment.ts) |

```ts
const queue = await client.enrichment.queue({
  limit: 20,
});
```

## `Dashboard`

### `summary`

| Direction | Type |
| --- | --- |
| Request | [`DashboardSummaryParams`](./src/resources/dashboard.ts) |
| Response | [`DashboardSummaryResponse`](./src/resources/dashboard.ts) |

```ts
const summary = await client.dashboard.summary({
  scope: 'me',
});
```

## `Search`

### `quick`

| Direction | Type |
| --- | --- |
| Request | [`SearchQuickParams`](./src/resources/search.ts) |
| Response | [`SearchQuickResponse`](./src/resources/search.ts) |

```ts
const quick = await client.search.quick({
  q: '',
});
```

## `Google`

### `status`

| Direction | Type |
| --- | --- |
| Response | [`GoogleStatusResponse`](./src/resources/google.ts) |

```ts
const status = await client.google.status();
```

### `purgeSyncedData`

| Direction | Type |
| --- | --- |
| Response | [`GooglePurgeSyncedDataResponse`](./src/resources/google.ts) |

```ts
const purgeSyncedData = await client.google.purgeSyncedData();
```

### `revokeAccess`

| Direction | Type |
| --- | --- |
| Response | [`GoogleRevokeAccessResponse`](./src/resources/google.ts) |

```ts
const revokeAccess = await client.google.revokeAccess();
```

### `syncNow`

| Direction | Type |
| --- | --- |
| Response | [`GoogleSyncNowResponse`](./src/resources/google.ts) |

```ts
const syncNow = await client.google.syncNow();
```

### `setAutoCreate`

| Direction | Type |
| --- | --- |
| Request | [`GoogleSetAutoCreateParams`](./src/resources/google.ts) |
| Response | [`GoogleSetAutoCreateResponse`](./src/resources/google.ts) |

```ts
const setAutoCreate = await client.google.setAutoCreate({
  source: 'calendar',
  enabled: false,
});
```

### `suppressDomain`

| Direction | Type |
| --- | --- |
| Request | [`GoogleSuppressDomainParams`](./src/resources/google.ts) |
| Response | [`GoogleSuppressDomainResponse`](./src/resources/google.ts) |

```ts
const suppressDomain = await client.google.suppressDomain({
  domain: 'x',
  purge: true,
});
```

### `thread`

| Direction | Type |
| --- | --- |
| Response | [`GoogleThreadResponse`](./src/resources/google.ts) |

```ts
const thread = await client.google.thread('threadId');
```

### `event`

| Direction | Type |
| --- | --- |
| Response | [`GoogleEventResponse`](./src/resources/google.ts) |

```ts
const event = await client.google.event('eventId');
```

## `Microsoft`

### `status`

| Direction | Type |
| --- | --- |
| Response | [`MicrosoftStatusResponse`](./src/resources/microsoft.ts) |

```ts
const status = await client.microsoft.status();
```

### `purgeSyncedData`

| Direction | Type |
| --- | --- |
| Response | [`MicrosoftPurgeSyncedDataResponse`](./src/resources/microsoft.ts) |

```ts
const purgeSyncedData = await client.microsoft.purgeSyncedData();
```

### `revokeAccess`

| Direction | Type |
| --- | --- |
| Response | [`MicrosoftRevokeAccessResponse`](./src/resources/microsoft.ts) |

```ts
const revokeAccess = await client.microsoft.revokeAccess();
```

### `syncNow`

| Direction | Type |
| --- | --- |
| Response | [`MicrosoftSyncNowResponse`](./src/resources/microsoft.ts) |

```ts
const syncNow = await client.microsoft.syncNow();
```

### `setAutoCreate`

| Direction | Type |
| --- | --- |
| Request | [`MicrosoftSetAutoCreateParams`](./src/resources/microsoft.ts) |
| Response | [`MicrosoftSetAutoCreateResponse`](./src/resources/microsoft.ts) |

```ts
const setAutoCreate = await client.microsoft.setAutoCreate({
  source: 'outlook',
  enabled: false,
});
```

## `Settings`

### `modelCatalog`

| Direction | Type |
| --- | --- |
| Response | [`SettingModelCatalogResponse`](./src/resources/settings/settings.ts) |

```ts
const modelCatalog = await client.settings.modelCatalog();
```

### `Settings AgentModel`

#### `list`

| Direction | Type |
| --- | --- |
| Response | [`AgentModelListResponse`](./src/resources/settings/agent-model.ts) |

```ts
const list = await client.settings.agentModel.list();
```

#### `set`

| Direction | Type |
| --- | --- |
| Request | [`AgentModelSetParams`](./src/resources/settings/agent-model.ts) |
| Response | [`AgentModelSetResponse`](./src/resources/settings/agent-model.ts) |

```ts
const set_ = await client.settings.agentModel.set({
  modelId: 'x',
});
```

### `Settings ResearchKey`

#### `list`

| Direction | Type |
| --- | --- |
| Response | [`ResearchKeyListResponse`](./src/resources/settings/research-key.ts) |

```ts
const list = await client.settings.researchKey.list();
```

#### `set`

| Direction | Type |
| --- | --- |
| Request | [`ResearchKeySetParams`](./src/resources/settings/research-key.ts) |
| Response | [`ResearchKeySetResponse`](./src/resources/settings/research-key.ts) |

```ts
const set_ = await client.settings.researchKey.set({
  apiKey: 'xxxxxxxx',
});
```

### `Settings ArchiveRetention`

#### `list`

| Direction | Type |
| --- | --- |
| Response | [`ArchiveRetentionListResponse`](./src/resources/settings/archive-retention.ts) |

```ts
const list = await client.settings.archiveRetention.list();
```

#### `set`

| Direction | Type |
| --- | --- |
| Request | [`ArchiveRetentionSetParams`](./src/resources/settings/archive-retention.ts) |
| Response | [`ArchiveRetentionSetResponse`](./src/resources/settings/archive-retention.ts) |

```ts
const set_ = await client.settings.archiveRetention.set({
  days: 0,
});
```

## `Workspace`

### `list`

| Direction | Type |
| --- | --- |
| Response | [`WorkspaceListResponse`](./src/resources/workspace/workspace.ts) |

```ts
const list = await client.workspace.list();
```

### `update`

| Direction | Type |
| --- | --- |
| Request | [`WorkspaceUpdateParams`](./src/resources/workspace/workspace.ts) |
| Response | [`WorkspaceUpdateResponse`](./src/resources/workspace/workspace.ts) |

```ts
const update = await client.workspace.update({
  name: 'x',
  website: 'x',
});
```

### `Workspace Members`

#### `search`

| Direction | Type |
| --- | --- |
| Request | [`MemberSearchParams`](./src/resources/workspace/members.ts) |
| Response | [`MemberSearchResponse`](./src/resources/workspace/members.ts) |

```ts
const search = await client.workspace.members.search({
  q: '',
  sort: '',
  dir: 'asc',
  page: 1,
  pageSize: 25,
  role: [],
});
```

#### `setRole`

| Direction | Type |
| --- | --- |
| Request | [`MemberSetRoleParams`](./src/resources/workspace/members.ts) |
| Response | [`MemberSetRoleResponse`](./src/resources/workspace/members.ts) |

```ts
const setRole = await client.workspace.members.setRole('memberId', {
  role: 'owner',
});
```

## `Sso`

### `signInOptions`

| Direction | Type |
| --- | --- |
| Response | [`SsoSignInOptionsResponse`](./src/resources/sso.ts) |

```ts
const signInOptions = await client.sso.signInOptions();
```

### `settings`

| Direction | Type |
| --- | --- |
| Response | [`SsoSettingsResponse`](./src/resources/sso.ts) |

```ts
const settings = await client.sso.settings();
```

### `list`

| Direction | Type |
| --- | --- |
| Request | [`SsoListParams`](./src/resources/sso.ts) |
| Response | [`SsoListResponse`](./src/resources/sso.ts) |

```ts
const list = await client.sso.list({
  q: '',
  sort: '',
  dir: 'asc',
  page: 1,
  pageSize: 25,
});
```

### `register`

| Direction | Type |
| --- | --- |
| Request | [`SsoRegisterParams`](./src/resources/sso.ts) |
| Response | [`SsoRegisterResponse`](./src/resources/sso.ts) |

```ts
const register = await client.sso.register({
  providerId: 'x',
  issuer: 'https://example.com',
  domain: 'x',
  clientId: 'x',
  clientSecret: 'x',
});
```

### `delete`

| Direction | Type |
| --- | --- |
| Response | [`SsoDeleteResponse`](./src/resources/sso.ts) |

```ts
const delete_ = await client.sso.delete('providerId');
```

## `Slack`

### `status`

| Direction | Type |
| --- | --- |
| Response | [`SlackStatusResponse`](./src/resources/slack/slack.ts) |

```ts
const status = await client.slack.status();
```

### `matches`

| Direction | Type |
| --- | --- |
| Response | [`SlackMatchesResponse`](./src/resources/slack/slack.ts) |

```ts
const matches = await client.slack.matches();
```

### `refreshPeople`

| Direction | Type |
| --- | --- |
| Response | [`SlackRefreshPeopleResponse`](./src/resources/slack/slack.ts) |

```ts
const refreshPeople = await client.slack.refreshPeople();
```

### `disconnect`

| Direction | Type |
| --- | --- |
| Response | [`SlackDisconnectResponse`](./src/resources/slack/slack.ts) |

```ts
const disconnect = await client.slack.disconnect();
```

### `Slack Channels`

#### `list`

| Direction | Type |
| --- | --- |
| Request | [`ChannelListParams`](./src/resources/slack/channels.ts) |
| Response | [`ChannelListResponse`](./src/resources/slack/channels.ts) |

```ts
const list = await client.slack.channels.list();
```

#### `create`

| Direction | Type |
| --- | --- |
| Request | [`ChannelCreateParams`](./src/resources/slack/channels.ts) |
| Response | [`ChannelCreateResponse`](./src/resources/slack/channels.ts) |

```ts
const create = await client.slack.channels.create({
  name: 'x',
  isPrivate: false,
});
```

#### `join`

| Direction | Type |
| --- | --- |
| Response | [`ChannelJoinResponse`](./src/resources/slack/channels.ts) |

```ts
const join = await client.slack.channels.join('channelId');
```

## `SavedViews`

### `list`

| Direction | Type |
| --- | --- |
| Request | [`SavedViewListParams`](./src/resources/saved-views.ts) |
| Response | [`SavedViewListResponse`](./src/resources/saved-views.ts) |

```ts
const list = await client.savedViews.list({
  entity: 'COMPANY',
});
```

### `create`

| Direction | Type |
| --- | --- |
| Request | [`SavedViewCreateParams`](./src/resources/saved-views.ts) |
| Response | [`SavedViewCreateResponse`](./src/resources/saved-views.ts) |

```ts
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
```

### `update`

| Direction | Type |
| --- | --- |
| Request | [`SavedViewUpdateParams`](./src/resources/saved-views.ts) |
| Response | [`SavedViewUpdateResponse`](./src/resources/saved-views.ts) |

```ts
const update = await client.savedViews.update('id', {
  data: {},
});
```

### `delete`

| Direction | Type |
| --- | --- |
| Response | [`SavedViewDeleteResponse`](./src/resources/saved-views.ts) |

```ts
const delete_ = await client.savedViews.delete('id');
```
