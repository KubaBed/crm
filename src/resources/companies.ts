// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { path as __scalarPath } from '../internal/utils/path';

export class Companies extends APIResource {
  /**
   * @param {CompanySearchParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanySearchResponse>} Successful response
   *
   * @example
   * ```ts
   * const search = await client.companies.search({
   *   q: '',
   *   sort: '',
   *   dir: 'asc',
   *   page: 1,
   *   pageSize: 25,
   *   owner: [],
   *   industry: [],
   *   enrichment: [],
   *   source: [],
   *   activity: [],
   *   fields: {},
   *   archived: false,
   * });
   * ```
   */
  search(body: CompanySearchParams, options?: RequestOptions): APIPromise<CompanySearchResponse> {
    return this._client.post('/companies/search', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyRetrieveResponse>} Successful response
   *
   * @example
   * ```ts
   * const retrieve = await client.companies.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<CompanyRetrieveResponse> {
    return this._client.get(__scalarPath`/companies/${id}`, options);
  }

  /**
   * @param {string} id
   * @param {CompanyUpdateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyUpdateResponse>} Successful response
   *
   * @example
   * ```ts
   * const update = await client.companies.update('id', {
   *   data: {},
   * });
   * ```
   */
  update(id: string, body: CompanyUpdateParams, options?: RequestOptions): APIPromise<CompanyUpdateResponse> {
    return this._client.patch(__scalarPath`/companies/${id}`, { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyPurgeResponse>} Successful response
   *
   * @example
   * ```ts
   * const purge = await client.companies.purge('id');
   * ```
   */
  purge(id: string, options?: RequestOptions): APIPromise<CompanyPurgeResponse> {
    return this._client.delete(__scalarPath`/companies/${id}`, options);
  }

  /**
   * @param {CompanyOptionsParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyOptionsResponse>} Successful response
   *
   * @example
   * ```ts
   * const options = await client.companies.options({
   *   q: '',
   * });
   * ```
   */
  options(
    query: CompanyOptionsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<CompanyOptionsResponse> {
    return this._client.get('/companies/options', { query, ...options });
  }

  /**
   * @param {CompanyCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const create = await client.companies.create({
   *   name: 'x',
   * });
   * ```
   */
  create(body: CompanyCreateParams, options?: RequestOptions): APIPromise<CompanyCreateResponse> {
    return this._client.post('/companies', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyArchiveResponse>} Successful response
   *
   * @example
   * ```ts
   * const archive = await client.companies.archive('id');
   * ```
   */
  archive(id: string, options?: RequestOptions): APIPromise<CompanyArchiveResponse> {
    return this._client.post(__scalarPath`/companies/${id}/archive`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyRestoreResponse>} Successful response
   *
   * @example
   * ```ts
   * const restore = await client.companies.restore('id');
   * ```
   */
  restore(id: string, options?: RequestOptions): APIPromise<CompanyRestoreResponse> {
    return this._client.post(__scalarPath`/companies/${id}/restore`, options);
  }

  /**
   * @param {CompanyBulkAssignOwnerParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyBulkAssignOwnerResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkAssignOwner = await client.companies.bulkAssignOwner({
   *   ids: [],
   *   ownerId: '',
   * });
   * ```
   */
  bulkAssignOwner(
    body: CompanyBulkAssignOwnerParams,
    options?: RequestOptions,
  ): APIPromise<CompanyBulkAssignOwnerResponse> {
    return this._client.post('/companies/bulk-assign-owner', { body, ...options });
  }

  /**
   * @param {CompanyBulkEnrichParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyBulkEnrichResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkEnrich = await client.companies.bulkEnrich({
   *   ids: [],
   * });
   * ```
   */
  bulkEnrich(body: CompanyBulkEnrichParams, options?: RequestOptions): APIPromise<CompanyBulkEnrichResponse> {
    return this._client.post('/companies/bulk-enrich', { body, ...options });
  }

  /**
   * @param {CompanyBulkArchiveParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyBulkArchiveResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkArchive = await client.companies.bulkArchive({
   *   ids: [],
   * });
   * ```
   */
  bulkArchive(
    body: CompanyBulkArchiveParams,
    options?: RequestOptions,
  ): APIPromise<CompanyBulkArchiveResponse> {
    return this._client.post('/companies/bulk-archive', { body, ...options });
  }

  /**
   * @param {CompanyBulkRestoreParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyBulkRestoreResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkRestore = await client.companies.bulkRestore({
   *   ids: [],
   * });
   * ```
   */
  bulkRestore(
    body: CompanyBulkRestoreParams,
    options?: RequestOptions,
  ): APIPromise<CompanyBulkRestoreResponse> {
    return this._client.post('/companies/bulk-restore', { body, ...options });
  }

  /**
   * @param {CompanyBulkPurgeParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyBulkPurgeResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkPurge = await client.companies.bulkPurge({
   *   ids: [],
   * });
   * ```
   */
  bulkPurge(body: CompanyBulkPurgeParams, options?: RequestOptions): APIPromise<CompanyBulkPurgeResponse> {
    return this._client.post('/companies/bulk-purge', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyEnrichResponse>} Successful response
   *
   * @example
   * ```ts
   * const enrich = await client.companies.enrich('id');
   * ```
   */
  enrich(id: string, options?: RequestOptions): APIPromise<CompanyEnrichResponse> {
    return this._client.post(__scalarPath`/companies/${id}/enrich`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanyResearchResponse>} Successful response
   *
   * @example
   * ```ts
   * const research = await client.companies.research('id');
   * ```
   */
  research(id: string, options?: RequestOptions): APIPromise<CompanyResearchResponse> {
    return this._client.post(__scalarPath`/companies/${id}/research`, options);
  }

  /**
   * @param {string} companyID
   * @param {CompanySetPrimaryContactParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CompanySetPrimaryContactResponse>} Successful response
   *
   * @example
   * ```ts
   * const setPrimaryContact = await client.companies.setPrimaryContact('companyId', {
   *   contactId: '',
   * });
   * ```
   */
  setPrimaryContact(
    companyID: string,
    body: CompanySetPrimaryContactParams,
    options?: RequestOptions,
  ): APIPromise<CompanySetPrimaryContactResponse> {
    return this._client.post(__scalarPath`/companies/${companyID}/set-primary-contact`, { body, ...options });
  }
}

export interface CompanySearchParams {
  /**
   * @default ""
   */
  q?: string;
  /**
   * @default ""
   */
  sort?: string;
  /**
   * @default asc
   */
  dir?: 'asc' | 'desc';
  /**
   * @default 1
   * @minimum 1
   * @maximum 9007199254740991
   */
  page?: number;
  /**
   * @default 25
   * @minimum 1
   * @maximum 100
   */
  pageSize?: number;
  /**
   * @default []
   */
  owner?: Array<string>;
  /**
   * @default []
   */
  industry?: Array<string>;
  /**
   * @default []
   */
  enrichment?: Array<string>;
  /**
   * @default []
   */
  source?: Array<string>;
  /**
   * @default []
   */
  activity?: Array<string>;
  /**
   * @default {}
   */
  fields?: Record<string, Array<string>>;
  /**
   * @default false
   */
  archived?: boolean;
}

export interface CompanySearchResponse {
  rows: Array<CompanySearchResponse.Row>;
  total: number;
  facetCounts: Record<string, Record<string, number>>;
}

export namespace CompanySearchResponse {
  export interface Row {
    id: string;
    name: string;
    domain: string | null;
    iconUrl: string | null;
    iconDarkUrl: string | null;
    iconTone: string | null;
    logoUrl: string | null;
    brandColor: string | null;
    industry: string | null;
    enrichmentStatus: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED' | 'SKIPPED';
    queued: boolean;
    source: 'MANUAL' | 'IMPORT' | 'EMAIL' | 'CALENDAR' | 'TRACKING';
    owner: Row.Owner | null;
    contactCount: number;
    openDealCount: number;
    lastActivityAt: string | null;
    createdAt: string;
    archivedAt: string | null;
    fields: Record<string, string | number | boolean | null>;
  }

  export namespace Row {
    export interface Owner {
      id: string;
      name: string;
      email: string;
      image: string | null;
    }
  }
}

export interface CompanyRetrieveResponse {
  id: string;
  name: string;
  domain: string | null;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  iconUrl: string | null;
  iconDarkUrl: string | null;
  iconTone: string | null;
  brandColor: string | null;
  industry: string | null;
  subIndustry: string | null;
  city: string | null;
  stateCode: string | null;
  country: string | null;
  countryCode: string | null;
  phone: string | null;
  email: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  githubUrl: string | null;
  pricingUrl: string | null;
  careersUrl: string | null;
  enrichmentStatus: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED' | 'SKIPPED';
  enrichmentError: string | null;
  source: 'MANUAL' | 'IMPORT' | 'EMAIL' | 'CALENDAR' | 'TRACKING';
  owner: CompanyRetrieveResponse.Owner | null;
  contacts: Array<CompanyRetrieveResponse.Contact>;
  fields: Array<CompanyRetrieveResponse.Field>;
  queued: boolean;
  createdAt: string;
  archivedAt: string | null;
  enrichedAt: string | null;
  primaryContactId: string | null;
  primaryContact: CompanyRetrieveResponse.PrimaryContact | null;
  reportingCurrency: string;
  deals: Array<CompanyRetrieveResponse.Deal>;
}

export namespace CompanyRetrieveResponse {
  export interface Owner {
    id: string;
    name: string;
    email: string;
    image: string | null;
  }

  export interface Contact {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    title: string | null;
    imageUrl: string | null;
    owner: Contact.Owner | null;
  }

  export namespace Contact {
    export interface Owner {
      id: string;
      name: string;
      email: string;
      image: string | null;
    }
  }

  export interface Field {
    id: string;
    entity: 'COMPANY' | 'CONTACT' | 'DEAL';
    key: string;
    label: string;
    type:
      | 'TEXT'
      | 'LONG_TEXT'
      | 'NUMBER'
      | 'DATE'
      | 'CHECKBOX'
      | 'SELECT'
      | 'URL'
      | 'EMAIL'
      | 'PHONE'
      | 'USER';
    typeLabel: string;
    agentFilled: boolean;
    agentBrief: string | null;
    required: boolean;
    showOnSheet: boolean;
    showOnTable: boolean;
    showOnFilter: boolean;
    position: number;
    archived: boolean;
    options: Array<Field.Option>;
    value: string | number | boolean | null;
  }

  export namespace Field {
    export interface Option {
      id: string;
      label: string;
      position: number;
    }
  }

  export interface PrimaryContact {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    title: string | null;
  }

  export interface Deal {
    id: string;
    name: string;
    stage:
      | 'DEMO_BOOKED'
      | 'QUALIFIED_TO_BUY'
      | 'UNQUALIFIED_TO_BUY'
      | 'DECISION_MAKER_BOUGHT_IN'
      | 'CONTRACT_SENT'
      | 'CLOSED_WON'
      | 'CLOSED_LOST';
    currency: string;
    expectedCloseDate: string | null;
    owner: Deal.Owner | null;
    amountCents: number | null;
    baseAmountCents: number | null;
  }

  export namespace Deal {
    export interface Owner {
      id: string;
      name: string;
      email: string;
      image: string | null;
    }
  }
}

export interface CompanyUpdateParams {
  data: CompanyUpdateParams.Data;
}

export namespace CompanyUpdateParams {
  export interface Data {
    /**
     * @minLength 1
     */
    name?: string;
    domain?: string;
    website?: string;
    description?: string;
    industry?: string;
    city?: string;
    stateCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    linkedinUrl?: string;
    ownerId?: string | null;
    fields?: Record<string, string | number | boolean | null>;
  }
}

export interface CompanyUpdateResponse {
  id: string;
  name: string;
  domain: string | null;
}

export interface CompanyPurgeResponse {
  id: string;
  name: string;
}

export interface CompanyOptionsParams {
  /**
   * @default ""
   */
  q?: string;
}

export type CompanyOptionsResponse = Array<CompanyOptionsResponse.CompanyOptionsResponseItem>;

export namespace CompanyOptionsResponse {
  export interface CompanyOptionsResponseItem {
    id: string;
    name: string;
    domain: string | null;
    iconUrl: string | null;
  }
}

export interface CompanyCreateParams {
  /**
   * @minLength 1
   */
  name: string;
  domain?: string;
  ownerId?: string | null;
}

export interface CompanyCreateResponse {
  id: string;
  name: string;
  domain: string | null;
}

export interface CompanyArchiveResponse {
  id: string;
  name: string;
}

export interface CompanyRestoreResponse {
  id: string;
  name: string;
}

export interface CompanyBulkAssignOwnerParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
  ownerId: string | null;
}

export interface CompanyBulkAssignOwnerResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface CompanyBulkEnrichParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
}

export interface CompanyBulkEnrichResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface CompanyBulkArchiveParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
}

export interface CompanyBulkArchiveResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface CompanyBulkRestoreParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
}

export interface CompanyBulkRestoreResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface CompanyBulkPurgeParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
}

export interface CompanyBulkPurgeResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface CompanyEnrichResponse {
  id: string;
  queued: boolean;
}

export interface CompanyResearchResponse {
  ok: true;
  queued: true;
}

export interface CompanySetPrimaryContactParams {
  contactId: string | null;
}

export interface CompanySetPrimaryContactResponse {
  id: string;
  primaryContactId: string | null;
}
export declare namespace Companies {
  export {
    type CompanySearchResponse as CompanySearchResponse,
    type CompanyRetrieveResponse as CompanyRetrieveResponse,
    type CompanyUpdateResponse as CompanyUpdateResponse,
    type CompanyPurgeResponse as CompanyPurgeResponse,
    type CompanyOptionsResponse as CompanyOptionsResponse,
    type CompanyCreateResponse as CompanyCreateResponse,
    type CompanyArchiveResponse as CompanyArchiveResponse,
    type CompanyRestoreResponse as CompanyRestoreResponse,
    type CompanyBulkAssignOwnerResponse as CompanyBulkAssignOwnerResponse,
    type CompanyBulkEnrichResponse as CompanyBulkEnrichResponse,
    type CompanyBulkArchiveResponse as CompanyBulkArchiveResponse,
    type CompanyBulkRestoreResponse as CompanyBulkRestoreResponse,
    type CompanyBulkPurgeResponse as CompanyBulkPurgeResponse,
    type CompanyEnrichResponse as CompanyEnrichResponse,
    type CompanyResearchResponse as CompanyResearchResponse,
    type CompanySetPrimaryContactResponse as CompanySetPrimaryContactResponse,
    type CompanySearchParams as CompanySearchParams,
    type CompanyUpdateParams as CompanyUpdateParams,
    type CompanyOptionsParams as CompanyOptionsParams,
    type CompanyCreateParams as CompanyCreateParams,
    type CompanyBulkAssignOwnerParams as CompanyBulkAssignOwnerParams,
    type CompanyBulkEnrichParams as CompanyBulkEnrichParams,
    type CompanyBulkArchiveParams as CompanyBulkArchiveParams,
    type CompanyBulkRestoreParams as CompanyBulkRestoreParams,
    type CompanyBulkPurgeParams as CompanyBulkPurgeParams,
    type CompanySetPrimaryContactParams as CompanySetPrimaryContactParams,
  };
}
