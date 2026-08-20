// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { path as __scalarPath } from '../internal/utils/path';

export class Contacts extends APIResource {
  /**
   * @param {ContactSearchParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactSearchResponse>} Successful response
   *
   * @example
   * ```ts
   * const search = await client.contacts.search({
   *   q: '',
   *   sort: '',
   *   dir: 'asc',
   *   page: 1,
   *   pageSize: 25,
   *   owner: [],
   *   company: [],
   *   source: [],
   *   title: [],
   *   seniority: [],
   *   persona: [],
   *   activity: [],
   *   fields: {},
   *   archived: false,
   * });
   * ```
   */
  search(body: ContactSearchParams, options?: RequestOptions): APIPromise<ContactSearchResponse> {
    return this._client.post('/contacts/search', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactRetrieveResponse>} Successful response
   *
   * @example
   * ```ts
   * const retrieve = await client.contacts.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<ContactRetrieveResponse> {
    return this._client.get(__scalarPath`/contacts/${id}`, options);
  }

  /**
   * @param {string} id
   * @param {ContactUpdateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactUpdateResponse>} Successful response
   *
   * @example
   * ```ts
   * const update = await client.contacts.update('id', {
   *   data: {},
   * });
   * ```
   */
  update(id: string, body: ContactUpdateParams, options?: RequestOptions): APIPromise<ContactUpdateResponse> {
    return this._client.patch(__scalarPath`/contacts/${id}`, { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactPurgeResponse>} Successful response
   *
   * @example
   * ```ts
   * const purge = await client.contacts.purge('id');
   * ```
   */
  purge(id: string, options?: RequestOptions): APIPromise<ContactPurgeResponse> {
    return this._client.delete(__scalarPath`/contacts/${id}`, options);
  }

  /**
   * @param {ContactCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const create = await client.contacts.create({
   *   firstName: 'x',
   * });
   * ```
   */
  create(body: ContactCreateParams, options?: RequestOptions): APIPromise<ContactCreateResponse> {
    return this._client.post('/contacts', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactArchiveResponse>} Successful response
   *
   * @example
   * ```ts
   * const archive = await client.contacts.archive('id');
   * ```
   */
  archive(id: string, options?: RequestOptions): APIPromise<ContactArchiveResponse> {
    return this._client.post(__scalarPath`/contacts/${id}/archive`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactRestoreResponse>} Successful response
   *
   * @example
   * ```ts
   * const restore = await client.contacts.restore('id');
   * ```
   */
  restore(id: string, options?: RequestOptions): APIPromise<ContactRestoreResponse> {
    return this._client.post(__scalarPath`/contacts/${id}/restore`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactEnrichResponse>} Successful response
   *
   * @example
   * ```ts
   * const enrich = await client.contacts.enrich('id');
   * ```
   */
  enrich(id: string, options?: RequestOptions): APIPromise<ContactEnrichResponse> {
    return this._client.post(__scalarPath`/contacts/${id}/enrich`, options);
  }

  /**
   * @param {ContactBulkAssignOwnerParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactBulkAssignOwnerResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkAssignOwner = await client.contacts.bulkAssignOwner({
   *   ids: [],
   *   ownerId: '',
   * });
   * ```
   */
  bulkAssignOwner(
    body: ContactBulkAssignOwnerParams,
    options?: RequestOptions,
  ): APIPromise<ContactBulkAssignOwnerResponse> {
    return this._client.post('/contacts/bulk-assign-owner', { body, ...options });
  }

  /**
   * @param {ContactBulkSetCompanyParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactBulkSetCompanyResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkSetCompany = await client.contacts.bulkSetCompany({
   *   ids: [],
   *   companyId: '',
   * });
   * ```
   */
  bulkSetCompany(
    body: ContactBulkSetCompanyParams,
    options?: RequestOptions,
  ): APIPromise<ContactBulkSetCompanyResponse> {
    return this._client.post('/contacts/bulk-set-company', { body, ...options });
  }

  /**
   * @param {ContactBulkEnrichParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactBulkEnrichResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkEnrich = await client.contacts.bulkEnrich({
   *   ids: [],
   * });
   * ```
   */
  bulkEnrich(body: ContactBulkEnrichParams, options?: RequestOptions): APIPromise<ContactBulkEnrichResponse> {
    return this._client.post('/contacts/bulk-enrich', { body, ...options });
  }

  /**
   * @param {ContactBulkArchiveParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactBulkArchiveResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkArchive = await client.contacts.bulkArchive({
   *   ids: [],
   * });
   * ```
   */
  bulkArchive(
    body: ContactBulkArchiveParams,
    options?: RequestOptions,
  ): APIPromise<ContactBulkArchiveResponse> {
    return this._client.post('/contacts/bulk-archive', { body, ...options });
  }

  /**
   * @param {ContactBulkRestoreParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactBulkRestoreResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkRestore = await client.contacts.bulkRestore({
   *   ids: [],
   * });
   * ```
   */
  bulkRestore(
    body: ContactBulkRestoreParams,
    options?: RequestOptions,
  ): APIPromise<ContactBulkRestoreResponse> {
    return this._client.post('/contacts/bulk-restore', { body, ...options });
  }

  /**
   * @param {ContactBulkPurgeParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactBulkPurgeResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkPurge = await client.contacts.bulkPurge({
   *   ids: [],
   * });
   * ```
   */
  bulkPurge(body: ContactBulkPurgeParams, options?: RequestOptions): APIPromise<ContactBulkPurgeResponse> {
    return this._client.post('/contacts/bulk-purge', { body, ...options });
  }

  /**
   * @param {ContactDecideFactParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactDecideFactResponse>} Successful response
   *
   * @example
   * ```ts
   * const decideFact = await client.contacts.decideFact({
   *   factId: '',
   *   decision: 'accept',
   * });
   * ```
   */
  decideFact(body: ContactDecideFactParams, options?: RequestOptions): APIPromise<ContactDecideFactResponse> {
    return this._client.post('/contacts/decide-fact', { body, ...options });
  }
}

export interface ContactSearchParams {
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
  company?: Array<string>;
  /**
   * @default []
   */
  source?: Array<string>;
  /**
   * @default []
   */
  title?: Array<string>;
  /**
   * @default []
   */
  seniority?: Array<string>;
  /**
   * @default []
   */
  persona?: Array<string>;
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

export interface ContactSearchResponse {
  rows: Array<ContactSearchResponse.Row>;
  total: number;
  facetCounts: Record<string, Record<string, number>>;
}

export namespace ContactSearchResponse {
  export interface Row {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    title: string | null;
    imageUrl: string | null;
    source: 'MANUAL' | 'IMPORT' | 'EMAIL' | 'CALENDAR' | 'TRACKING';
    company: Row.Company | null;
    owner: Row.Owner | null;
    lastActivityAt: string | null;
    createdAt: string;
    archivedAt: string | null;
    fields: Record<string, string | number | boolean | null>;
  }

  export namespace Row {
    export interface Company {
      id: string;
      name: string;
      domain: string | null;
      iconUrl: string | null;
      iconDarkUrl: string | null;
      iconTone: string | null;
      logoUrl: string | null;
    }

    export interface Owner {
      id: string;
      name: string;
      email: string;
      image: string | null;
    }
  }
}

export interface ContactRetrieveResponse {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  githubUrl: string | null;
  imageUrl: string | null;
  enrichmentStatus: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED' | 'SKIPPED';
  enrichmentError: string | null;
  owner: ContactRetrieveResponse.Owner | null;
  company: ContactRetrieveResponse.Company | null;
  fields: Array<ContactRetrieveResponse.Field>;
  queued: boolean;
  createdAt: string;
  archivedAt: string | null;
  brief: ContactRetrieveResponse.Brief | null;
  facts: Array<ContactRetrieveResponse.Fact>;
  relationship: ContactRetrieveResponse.Relationship;
  isPrimaryContact: boolean;
  deals: Array<ContactRetrieveResponse.Deal>;
}

export namespace ContactRetrieveResponse {
  export interface Owner {
    id: string;
    name: string;
    email: string;
    image: string | null;
  }

  export interface Company {
    id: string;
    name: string;
    domain: string | null;
    iconUrl: string | null;
    iconDarkUrl: string | null;
    iconTone: string | null;
    logoUrl: string | null;
    industry: string | null;
    primaryContactId: string | null;
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

  export interface Brief {
    narrative: string;
    sections: Brief.Sections;
    score: number;
    sourceUrl: string | null;
    refreshedAt: string;
  }

  export namespace Brief {
    export interface Sections {
      currentRole?: string;
      tenure?: string;
      previousRoles?: Array<string>;
      seniority?: string;
      function?: string;
      location?: string;
    }
  }

  export interface Fact {
    id: string;
    field: string;
    value: string;
    score: number;
    band: 'VERIFIED' | 'PROBABLE' | 'POSSIBLE';
    evidence: Array<Fact.Evidence>;
    method: string;
    sourceUrl: string | null;
    status: 'APPLIED' | 'PROPOSED' | 'DISMISSED' | 'SUPERSEDED';
    observedAt: string;
  }

  export namespace Fact {
    export interface Evidence {
      kind: string;
      detail: string;
      sourceUrl?: string;
    }
  }

  export interface Relationship {
    emails: number;
    threads: number;
    lastReplyAt: string | null;
    meetings: number;
    nextMeeting: Relationship.NextMeeting | null;
    colleagues: Array<Relationship.Colleague>;
  }

  export namespace Relationship {
    export interface NextMeeting {
      title: string;
      startsAt: string;
    }

    export interface Colleague {
      id: string;
      name: string;
      title: string | null;
    }
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
    owner: Deal.Owner;
    role: string | null;
    amountCents: number | null;
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

export interface ContactUpdateParams {
  data: ContactUpdateParams.Data;
}

export namespace ContactUpdateParams {
  export interface Data {
    /**
     * @minLength 1
     */
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    title?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    githubUrl?: string;
    companyId?: string | null;
    ownerId?: string | null;
    fields?: Record<string, string | number | boolean | null>;
  }
}

export interface ContactUpdateResponse {
  id: string;
  firstName: string;
  lastName: string | null;
}

export interface ContactPurgeResponse {
  id: string;
  name: string;
}

export interface ContactCreateParams {
  /**
   * @minLength 1
   */
  firstName: string;
  lastName?: string;
  email?: '' | (string & {});
  phone?: string;
  title?: string;
  companyId?: string | null;
  ownerId?: string | null;
}

export interface ContactCreateResponse {
  id: string;
  firstName: string;
  lastName: string | null;
}

export interface ContactArchiveResponse {
  id: string;
  name: string;
}

export interface ContactRestoreResponse {
  id: string;
  name: string;
}

export interface ContactEnrichResponse {
  id: string;
  queued: true;
}

export interface ContactBulkAssignOwnerParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
  ownerId: string | null;
}

export interface ContactBulkAssignOwnerResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface ContactBulkSetCompanyParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
  companyId: string | null;
}

export interface ContactBulkSetCompanyResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface ContactBulkEnrichParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
}

export interface ContactBulkEnrichResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface ContactBulkArchiveParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
}

export interface ContactBulkArchiveResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface ContactBulkRestoreParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
}

export interface ContactBulkRestoreResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface ContactBulkPurgeParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
}

export interface ContactBulkPurgeResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface ContactDecideFactParams {
  factId: string;
  decision: 'accept' | 'dismiss';
}

export interface ContactDecideFactResponse {
  contactId: string;
  field: string;
  applied: boolean;
}
export declare namespace Contacts {
  export {
    type ContactSearchResponse as ContactSearchResponse,
    type ContactRetrieveResponse as ContactRetrieveResponse,
    type ContactUpdateResponse as ContactUpdateResponse,
    type ContactPurgeResponse as ContactPurgeResponse,
    type ContactCreateResponse as ContactCreateResponse,
    type ContactArchiveResponse as ContactArchiveResponse,
    type ContactRestoreResponse as ContactRestoreResponse,
    type ContactEnrichResponse as ContactEnrichResponse,
    type ContactBulkAssignOwnerResponse as ContactBulkAssignOwnerResponse,
    type ContactBulkSetCompanyResponse as ContactBulkSetCompanyResponse,
    type ContactBulkEnrichResponse as ContactBulkEnrichResponse,
    type ContactBulkArchiveResponse as ContactBulkArchiveResponse,
    type ContactBulkRestoreResponse as ContactBulkRestoreResponse,
    type ContactBulkPurgeResponse as ContactBulkPurgeResponse,
    type ContactDecideFactResponse as ContactDecideFactResponse,
    type ContactSearchParams as ContactSearchParams,
    type ContactUpdateParams as ContactUpdateParams,
    type ContactCreateParams as ContactCreateParams,
    type ContactBulkAssignOwnerParams as ContactBulkAssignOwnerParams,
    type ContactBulkSetCompanyParams as ContactBulkSetCompanyParams,
    type ContactBulkEnrichParams as ContactBulkEnrichParams,
    type ContactBulkArchiveParams as ContactBulkArchiveParams,
    type ContactBulkRestoreParams as ContactBulkRestoreParams,
    type ContactBulkPurgeParams as ContactBulkPurgeParams,
    type ContactDecideFactParams as ContactDecideFactParams,
  };
}
