// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { path as __scalarPath } from '../../internal/utils/path';
import * as ContactsAPI from './contacts';
import {
  Contacts,
  type ContactAttachResponse,
  type ContactDetachResponse,
  type ContactSetRoleResponse,
  type ContactAttachParams,
  type ContactDetachParams,
  type ContactSetRoleParams,
} from './contacts';

export class Deals extends APIResource {
  contacts: ContactsAPI.Contacts = new ContactsAPI.Contacts(this._client);

  /**
   * @param {DealSearchParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealSearchResponse>} Successful response
   *
   * @example
   * ```ts
   * const search = await client.deals.search({
   *   q: '',
   *   sort: '',
   *   dir: 'asc',
   *   page: 1,
   *   pageSize: 25,
   *   status: 'all',
   *   owner: [],
   *   stage: [],
   *   closing: [],
   *   fields: {},
   *   archived: false,
   * });
   * ```
   */
  search(body: DealSearchParams, options?: RequestOptions): APIPromise<DealSearchResponse> {
    return this._client.post('/deals/search', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealRetrieveResponse>} Successful response
   *
   * @example
   * ```ts
   * const retrieve = await client.deals.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<DealRetrieveResponse> {
    return this._client.get(__scalarPath`/deals/${id}`, options);
  }

  /**
   * @param {string} id
   * @param {DealUpdateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealUpdateResponse>} Successful response
   *
   * @example
   * ```ts
   * const update = await client.deals.update('id', {
   *   data: {},
   * });
   * ```
   */
  update(id: string, body: DealUpdateParams, options?: RequestOptions): APIPromise<DealUpdateResponse> {
    return this._client.patch(__scalarPath`/deals/${id}`, { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealPurgeResponse>} Successful response
   *
   * @example
   * ```ts
   * const purge = await client.deals.purge('id');
   * ```
   */
  purge(id: string, options?: RequestOptions): APIPromise<DealPurgeResponse> {
    return this._client.delete(__scalarPath`/deals/${id}`, options);
  }

  /**
   * @param {DealCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const create = await client.deals.create({
   *   name: 'x',
   *   companyId: 'x',
   *   ownerId: 'x',
   * });
   * ```
   */
  create(body: DealCreateParams, options?: RequestOptions): APIPromise<DealCreateResponse> {
    return this._client.post('/deals', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealArchiveResponse>} Successful response
   *
   * @example
   * ```ts
   * const archive = await client.deals.archive('id');
   * ```
   */
  archive(id: string, options?: RequestOptions): APIPromise<DealArchiveResponse> {
    return this._client.post(__scalarPath`/deals/${id}/archive`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealRestoreResponse>} Successful response
   *
   * @example
   * ```ts
   * const restore = await client.deals.restore('id');
   * ```
   */
  restore(id: string, options?: RequestOptions): APIPromise<DealRestoreResponse> {
    return this._client.post(__scalarPath`/deals/${id}/restore`, options);
  }

  /**
   * @param {string} id
   * @param {DealSetStageParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealSetStageResponse>} Successful response
   *
   * @example
   * ```ts
   * const setStage = await client.deals.setStage('id', {
   *   stage: 'DEMO_BOOKED',
   * });
   * ```
   */
  setStage(id: string, body: DealSetStageParams, options?: RequestOptions): APIPromise<DealSetStageResponse> {
    return this._client.patch(__scalarPath`/deals/${id}/stage`, { body, ...options });
  }

  /**
   * @param {string} dealID
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealContactOptionsResponse>} Successful response
   *
   * @example
   * ```ts
   * const contactOptions = await client.deals.contactOptions('dealId');
   * ```
   */
  contactOptions(dealID: string, options?: RequestOptions): APIPromise<DealContactOptionsResponse> {
    return this._client.get(__scalarPath`/deals/${dealID}/contact-options`, options);
  }

  /**
   * @param {DealBulkAssignOwnerParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealBulkAssignOwnerResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkAssignOwner = await client.deals.bulkAssignOwner({
   *   ids: [],
   *   ownerId: 'x',
   * });
   * ```
   */
  bulkAssignOwner(
    body: DealBulkAssignOwnerParams,
    options?: RequestOptions,
  ): APIPromise<DealBulkAssignOwnerResponse> {
    return this._client.post('/deals/bulk-assign-owner', { body, ...options });
  }

  /**
   * @param {DealBulkSetStageParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealBulkSetStageResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkSetStage = await client.deals.bulkSetStage({
   *   ids: [],
   *   stage: 'DEMO_BOOKED',
   * });
   * ```
   */
  bulkSetStage(body: DealBulkSetStageParams, options?: RequestOptions): APIPromise<DealBulkSetStageResponse> {
    return this._client.post('/deals/bulk-set-stage', { body, ...options });
  }

  /**
   * @param {DealBulkArchiveParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealBulkArchiveResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkArchive = await client.deals.bulkArchive({
   *   ids: [],
   * });
   * ```
   */
  bulkArchive(body: DealBulkArchiveParams, options?: RequestOptions): APIPromise<DealBulkArchiveResponse> {
    return this._client.post('/deals/bulk-archive', { body, ...options });
  }

  /**
   * @param {DealBulkRestoreParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealBulkRestoreResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkRestore = await client.deals.bulkRestore({
   *   ids: [],
   * });
   * ```
   */
  bulkRestore(body: DealBulkRestoreParams, options?: RequestOptions): APIPromise<DealBulkRestoreResponse> {
    return this._client.post('/deals/bulk-restore', { body, ...options });
  }

  /**
   * @param {DealBulkPurgeParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DealBulkPurgeResponse>} Successful response
   *
   * @example
   * ```ts
   * const bulkPurge = await client.deals.bulkPurge({
   *   ids: [],
   * });
   * ```
   */
  bulkPurge(body: DealBulkPurgeParams, options?: RequestOptions): APIPromise<DealBulkPurgeResponse> {
    return this._client.post('/deals/bulk-purge', { body, ...options });
  }
}

export interface DealSearchParams {
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
   * @default all
   */
  status?: string;
  /**
   * @default []
   */
  owner?: Array<string>;
  /**
   * @default []
   */
  stage?: Array<string>;
  /**
   * @default []
   */
  closing?: Array<string>;
  /**
   * @default {}
   */
  fields?: Record<string, Array<string>>;
  /**
   * @default false
   */
  archived?: boolean;
}

export interface DealSearchResponse {
  rows: Array<DealSearchResponse.Row>;
  total: number;
  facetCounts: Record<string, Record<string, number>>;
  openValueCents: number | null;
  reportingCurrency: string;
  unconverted: DealSearchResponse.Unconverted;
}

export namespace DealSearchResponse {
  export interface Row {
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
    company: Row.Company;
    owner: Row.Owner;
    amountCents: number | null;
    baseAmountCents: number | null;
    expectedCloseDate: string | null;
    closedAt: string | null;
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

  export interface Unconverted {
    count: number;
    currencies: Array<string>;
  }
}

export interface DealRetrieveResponse {
  id: string;
  name: string;
  description: string | null;
  stage:
    | 'DEMO_BOOKED'
    | 'QUALIFIED_TO_BUY'
    | 'UNQUALIFIED_TO_BUY'
    | 'DECISION_MAKER_BOUGHT_IN'
    | 'CONTRACT_SENT'
    | 'CLOSED_WON'
    | 'CLOSED_LOST';
  currency: string;
  closedReason: string | null;
  company: DealRetrieveResponse.Company;
  owner: DealRetrieveResponse.Owner;
  fields: Array<DealRetrieveResponse.Field>;
  amountCents: number | null;
  baseAmountCents: number | null;
  reportingCurrency: string;
  fxRate: number | null;
  fxRateAt: string | null;
  stageChangedAt: string;
  expectedCloseDate: string | null;
  closedAt: string | null;
  createdAt: string;
  archivedAt: string | null;
  contacts: Array<DealRetrieveResponse.Contact>;
}

export namespace DealRetrieveResponse {
  export interface Company {
    id: string;
    name: string;
    domain: string | null;
    iconUrl: string | null;
    iconDarkUrl: string | null;
    iconTone: string | null;
    logoUrl: string | null;
    industry: string | null;
  }

  export interface Owner {
    id: string;
    name: string;
    email: string;
    image: string | null;
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

  export interface Contact {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    title: string | null;
    imageUrl: string | null;
    role: string | null;
  }
}

export interface DealUpdateParams {
  data: DealUpdateParams.Data;
}

export namespace DealUpdateParams {
  export interface Data {
    /**
     * @minLength 1
     */
    name?: string;
    description?: string | null;
    companyId?: string;
    ownerId?: string;
    /**
     * @minimum 0
     * @maximum 99999999999999
     */
    amountCents?: number | null;
    /**
     * @minLength 3
     * @maxLength 3
     */
    currency?: string;
    expectedCloseDate?: string | null;
    fields?: Record<string, string | number | boolean | null>;
  }
}

export interface DealUpdateResponse {
  id: string;
  name: string;
}

export interface DealPurgeResponse {
  id: string;
  name: string;
}

export interface DealCreateParams {
  /**
   * @minLength 1
   */
  name: string;
  /**
   * @minLength 1
   */
  companyId: string;
  /**
   * @minLength 1
   */
  ownerId: string;
  stage?:
    | 'DEMO_BOOKED'
    | 'QUALIFIED_TO_BUY'
    | 'UNQUALIFIED_TO_BUY'
    | 'DECISION_MAKER_BOUGHT_IN'
    | 'CONTRACT_SENT'
    | 'CLOSED_WON'
    | 'CLOSED_LOST';
  /**
   * @minimum 0
   * @maximum 99999999999999
   */
  amountCents?: number | null;
  /**
   * @minLength 3
   * @maxLength 3
   */
  currency?: string;
  expectedCloseDate?: string | null;
}

export interface DealCreateResponse {
  id: string;
  name: string;
  companyId: string;
}

export interface DealArchiveResponse {
  id: string;
  name: string;
}

export interface DealRestoreResponse {
  id: string;
  name: string;
}

export interface DealSetStageParams {
  stage:
    | 'DEMO_BOOKED'
    | 'QUALIFIED_TO_BUY'
    | 'UNQUALIFIED_TO_BUY'
    | 'DECISION_MAKER_BOUGHT_IN'
    | 'CONTRACT_SENT'
    | 'CLOSED_WON'
    | 'CLOSED_LOST';
  closedReason?: string;
}

export interface DealSetStageResponse {
  id: string;
  stage:
    | 'DEMO_BOOKED'
    | 'QUALIFIED_TO_BUY'
    | 'UNQUALIFIED_TO_BUY'
    | 'DECISION_MAKER_BOUGHT_IN'
    | 'CONTRACT_SENT'
    | 'CLOSED_WON'
    | 'CLOSED_LOST';
  changed: boolean;
}

export type DealContactOptionsResponse = Array<DealContactOptionsResponse.DealContactOptionsResponseItem>;

export namespace DealContactOptionsResponse {
  export interface DealContactOptionsResponseItem {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    title: string | null;
    imageUrl: string | null;
  }
}

export interface DealBulkAssignOwnerParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
  /**
   * @minLength 1
   */
  ownerId: string;
}

export interface DealBulkAssignOwnerResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface DealBulkSetStageParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
  stage:
    | 'DEMO_BOOKED'
    | 'QUALIFIED_TO_BUY'
    | 'UNQUALIFIED_TO_BUY'
    | 'DECISION_MAKER_BOUGHT_IN'
    | 'CONTRACT_SENT'
    | 'CLOSED_WON'
    | 'CLOSED_LOST';
  closedReason?: string;
}

export interface DealBulkSetStageResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface DealBulkArchiveParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
}

export interface DealBulkArchiveResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface DealBulkRestoreParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
}

export interface DealBulkRestoreResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}

export interface DealBulkPurgeParams {
  /**
   * @minItems 1
   * @maxItems 100
   */
  ids: Array<string>;
}

export interface DealBulkPurgeResponse {
  requested: number;
  succeeded: number;
  failed: number;
  message: string | null;
}
Deals.Contacts = Contacts;

export declare namespace Deals {
  export {
    type DealSearchResponse as DealSearchResponse,
    type DealRetrieveResponse as DealRetrieveResponse,
    type DealUpdateResponse as DealUpdateResponse,
    type DealPurgeResponse as DealPurgeResponse,
    type DealCreateResponse as DealCreateResponse,
    type DealArchiveResponse as DealArchiveResponse,
    type DealRestoreResponse as DealRestoreResponse,
    type DealSetStageResponse as DealSetStageResponse,
    type DealContactOptionsResponse as DealContactOptionsResponse,
    type DealBulkAssignOwnerResponse as DealBulkAssignOwnerResponse,
    type DealBulkSetStageResponse as DealBulkSetStageResponse,
    type DealBulkArchiveResponse as DealBulkArchiveResponse,
    type DealBulkRestoreResponse as DealBulkRestoreResponse,
    type DealBulkPurgeResponse as DealBulkPurgeResponse,
    type DealSearchParams as DealSearchParams,
    type DealUpdateParams as DealUpdateParams,
    type DealCreateParams as DealCreateParams,
    type DealSetStageParams as DealSetStageParams,
    type DealBulkAssignOwnerParams as DealBulkAssignOwnerParams,
    type DealBulkSetStageParams as DealBulkSetStageParams,
    type DealBulkArchiveParams as DealBulkArchiveParams,
    type DealBulkRestoreParams as DealBulkRestoreParams,
    type DealBulkPurgeParams as DealBulkPurgeParams,
  };

  export {
    Contacts as Contacts,
    type ContactAttachResponse as ContactAttachResponse,
    type ContactDetachResponse as ContactDetachResponse,
    type ContactSetRoleResponse as ContactSetRoleResponse,
    type ContactAttachParams as ContactAttachParams,
    type ContactDetachParams as ContactDetachParams,
    type ContactSetRoleParams as ContactSetRoleParams,
  };
}
