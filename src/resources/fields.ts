// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { path as __scalarPath } from '../internal/utils/path';

export class Fields extends APIResource {
  /**
   * @param {FieldListParams} query - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<FieldListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.fields.list({
   *   entity: 'COMPANY',
   *   includeArchived: false,
   * });
   * ```
   */
  list(query: FieldListParams, options?: RequestOptions): APIPromise<FieldListResponse> {
    return this._client.get('/fields', { query, ...options });
  }

  /**
   * @param {FieldCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<FieldCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const create = await client.fields.create({
   *   entity: 'COMPANY',
   *   label: 'x',
   *   type: 'TEXT',
   *   options: [],
   *   agentFilled: true,
   *   agentBrief: null,
   *   required: false,
   *   showOnSheet: true,
   *   showOnTable: false,
   *   showOnFilter: false,
   * });
   * ```
   */
  create(body: FieldCreateParams, options?: RequestOptions): APIPromise<FieldCreateResponse> {
    return this._client.post('/fields', { body, ...options });
  }

  /**
   * @param {string} key
   * @param {FieldRetrieveParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<FieldRetrieveResponse>} Successful response
   *
   * @example
   * ```ts
   * const retrieve = await client.fields.retrieve('key', {
   *   entity: 'COMPANY',
   * });
   * ```
   */
  retrieve(
    key: string,
    params: FieldRetrieveParams,
    options?: RequestOptions,
  ): APIPromise<FieldRetrieveResponse> {
    const { entity } = params;
    return this._client.get(__scalarPath`/fields/${entity}/${key}`, options);
  }

  /**
   * @param {"COMPANY" | "CONTACT" | "DEAL"} entity
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<FieldFiltersResponse>} Successful response
   *
   * @example
   * ```ts
   * const filters = await client.fields.filters('COMPANY');
   * ```
   */
  filters(
    entity: 'COMPANY' | 'CONTACT' | 'DEAL',
    options?: RequestOptions,
  ): APIPromise<FieldFiltersResponse> {
    return this._client.get(__scalarPath`/fields/${entity}/filterable`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<FieldCoverageResponse>} Successful response
   *
   * @example
   * ```ts
   * const coverage = await client.fields.coverage('id');
   * ```
   */
  coverage(id: string, options?: RequestOptions): APIPromise<FieldCoverageResponse> {
    return this._client.get(__scalarPath`/fields/${id}/coverage`, options);
  }

  /**
   * @param {string} id
   * @param {FieldUpdateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<FieldUpdateResponse>} Successful response
   *
   * @example
   * ```ts
   * const update = await client.fields.update('id', {
   *   data: {},
   * });
   * ```
   */
  update(id: string, body: FieldUpdateParams, options?: RequestOptions): APIPromise<FieldUpdateResponse> {
    return this._client.patch(__scalarPath`/fields/${id}`, { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<FieldDeleteResponse>} Successful response
   *
   * @example
   * ```ts
   * const delete_ = await client.fields.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<FieldDeleteResponse> {
    return this._client.delete(__scalarPath`/fields/${id}`, options);
  }

  /**
   * @param {FieldReorderParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<FieldReorderResponse>} Successful response
   *
   * @example
   * ```ts
   * const reorder = await client.fields.reorder({
   *   entity: 'COMPANY',
   *   ids: [],
   * });
   * ```
   */
  reorder(body: FieldReorderParams, options?: RequestOptions): APIPromise<FieldReorderResponse> {
    return this._client.post('/fields/reorder', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<FieldArchiveResponse>} Successful response
   *
   * @example
   * ```ts
   * const archive = await client.fields.archive('id');
   * ```
   */
  archive(id: string, options?: RequestOptions): APIPromise<FieldArchiveResponse> {
    return this._client.post(__scalarPath`/fields/${id}/archive`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<FieldRestoreResponse>} Successful response
   *
   * @example
   * ```ts
   * const restore = await client.fields.restore('id');
   * ```
   */
  restore(id: string, options?: RequestOptions): APIPromise<FieldRestoreResponse> {
    return this._client.post(__scalarPath`/fields/${id}/restore`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<FieldBackfillResponse>} Successful response
   *
   * @example
   * ```ts
   * const backfill = await client.fields.backfill('id');
   * ```
   */
  backfill(id: string, options?: RequestOptions): APIPromise<FieldBackfillResponse> {
    return this._client.post(__scalarPath`/fields/${id}/backfill`, options);
  }
}

export interface FieldListParams {
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
  /**
   * @default false
   */
  includeArchived?: boolean;
}

export type FieldListResponse = Array<FieldListResponse.FieldListResponseItem>;

export namespace FieldListResponse {
  export interface FieldListResponseItem {
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
    options: Array<FieldListResponseItem.Option>;
  }

  export namespace FieldListResponseItem {
    export interface Option {
      id: string;
      label: string;
      position: number;
    }
  }
}

export interface FieldCreateParams {
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
  /**
   * @minLength 1
   */
  label: string;
  type: 'TEXT' | 'LONG_TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX' | 'SELECT' | 'URL' | 'EMAIL' | 'PHONE' | 'USER';
  /**
   * @default []
   */
  options?: Array<FieldCreateParams.Option>;
  /**
   * @default true
   */
  agentFilled?: boolean;
  /**
   * @default null
   */
  agentBrief?: string | null;
  /**
   * @default false
   */
  required?: boolean;
  /**
   * @default true
   */
  showOnSheet?: boolean;
  /**
   * @default false
   */
  showOnTable?: boolean;
  /**
   * @default false
   */
  showOnFilter?: boolean;
}

export namespace FieldCreateParams {
  export interface Option {
    /**
     * @minLength 1
     */
    label: string;
    id?: string;
  }
}

export interface FieldCreateResponse {
  id: string;
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
  key: string;
  label: string;
  type: 'TEXT' | 'LONG_TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX' | 'SELECT' | 'URL' | 'EMAIL' | 'PHONE' | 'USER';
  typeLabel: string;
  agentFilled: boolean;
  agentBrief: string | null;
  required: boolean;
  showOnSheet: boolean;
  showOnTable: boolean;
  showOnFilter: boolean;
  position: number;
  archived: boolean;
  options: Array<FieldCreateResponse.Option>;
}

export namespace FieldCreateResponse {
  export interface Option {
    id: string;
    label: string;
    position: number;
  }
}

export interface FieldRetrieveParams {
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
}

export interface FieldRetrieveResponse {
  id: string;
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
  key: string;
  label: string;
  type: 'TEXT' | 'LONG_TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX' | 'SELECT' | 'URL' | 'EMAIL' | 'PHONE' | 'USER';
  typeLabel: string;
  agentFilled: boolean;
  agentBrief: string | null;
  required: boolean;
  showOnSheet: boolean;
  showOnTable: boolean;
  showOnFilter: boolean;
  position: number;
  archived: boolean;
  options: Array<FieldRetrieveResponse.Option>;
}

export namespace FieldRetrieveResponse {
  export interface Option {
    id: string;
    label: string;
    position: number;
  }
}

export type FieldFiltersResponse = Array<FieldFiltersResponse.FieldFiltersResponseItem>;

export namespace FieldFiltersResponse {
  export interface FieldFiltersResponseItem {
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
    options: Array<FieldFiltersResponseItem.Option>;
  }

  export namespace FieldFiltersResponseItem {
    export interface Option {
      id: string;
      label: string;
      position: number;
    }
  }
}

export interface FieldCoverageResponse {
  filled: number;
  total: number;
}

export interface FieldUpdateParams {
  data: FieldUpdateParams.Data;
}

export namespace FieldUpdateParams {
  export interface Data {
    /**
     * @minLength 1
     */
    label?: string;
    type?:
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
    options?: Array<Data.Option>;
    agentFilled?: boolean;
    agentBrief?: string | null;
    required?: boolean;
    showOnSheet?: boolean;
    showOnTable?: boolean;
    showOnFilter?: boolean;
  }

  export namespace Data {
    export interface Option {
      /**
       * @minLength 1
       */
      label: string;
      id?: string;
    }
  }
}

export interface FieldUpdateResponse {
  id: string;
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
  key: string;
  label: string;
  type: 'TEXT' | 'LONG_TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX' | 'SELECT' | 'URL' | 'EMAIL' | 'PHONE' | 'USER';
  typeLabel: string;
  agentFilled: boolean;
  agentBrief: string | null;
  required: boolean;
  showOnSheet: boolean;
  showOnTable: boolean;
  showOnFilter: boolean;
  position: number;
  archived: boolean;
  options: Array<FieldUpdateResponse.Option>;
}

export namespace FieldUpdateResponse {
  export interface Option {
    id: string;
    label: string;
    position: number;
  }
}

export interface FieldDeleteResponse {
  id: string;
}

export interface FieldReorderParams {
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
  /**
   * @minItems 1
   */
  ids: Array<string>;
}

export type FieldReorderResponse = Array<FieldReorderResponse.FieldReorderResponseItem>;

export namespace FieldReorderResponse {
  export interface FieldReorderResponseItem {
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
    options: Array<FieldReorderResponseItem.Option>;
  }

  export namespace FieldReorderResponseItem {
    export interface Option {
      id: string;
      label: string;
      position: number;
    }
  }
}

export interface FieldArchiveResponse {
  id: string;
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
  key: string;
  label: string;
  type: 'TEXT' | 'LONG_TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX' | 'SELECT' | 'URL' | 'EMAIL' | 'PHONE' | 'USER';
  typeLabel: string;
  agentFilled: boolean;
  agentBrief: string | null;
  required: boolean;
  showOnSheet: boolean;
  showOnTable: boolean;
  showOnFilter: boolean;
  position: number;
  archived: boolean;
  options: Array<FieldArchiveResponse.Option>;
}

export namespace FieldArchiveResponse {
  export interface Option {
    id: string;
    label: string;
    position: number;
  }
}

export interface FieldRestoreResponse {
  id: string;
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
  key: string;
  label: string;
  type: 'TEXT' | 'LONG_TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX' | 'SELECT' | 'URL' | 'EMAIL' | 'PHONE' | 'USER';
  typeLabel: string;
  agentFilled: boolean;
  agentBrief: string | null;
  required: boolean;
  showOnSheet: boolean;
  showOnTable: boolean;
  showOnFilter: boolean;
  position: number;
  archived: boolean;
  options: Array<FieldRestoreResponse.Option>;
}

export namespace FieldRestoreResponse {
  export interface Option {
    id: string;
    label: string;
    position: number;
  }
}

export interface FieldBackfillResponse {
  queued: boolean;
}
export declare namespace Fields {
  export {
    type FieldListResponse as FieldListResponse,
    type FieldCreateResponse as FieldCreateResponse,
    type FieldRetrieveResponse as FieldRetrieveResponse,
    type FieldFiltersResponse as FieldFiltersResponse,
    type FieldCoverageResponse as FieldCoverageResponse,
    type FieldUpdateResponse as FieldUpdateResponse,
    type FieldDeleteResponse as FieldDeleteResponse,
    type FieldReorderResponse as FieldReorderResponse,
    type FieldArchiveResponse as FieldArchiveResponse,
    type FieldRestoreResponse as FieldRestoreResponse,
    type FieldBackfillResponse as FieldBackfillResponse,
    type FieldListParams as FieldListParams,
    type FieldCreateParams as FieldCreateParams,
    type FieldRetrieveParams as FieldRetrieveParams,
    type FieldUpdateParams as FieldUpdateParams,
    type FieldReorderParams as FieldReorderParams,
  };
}
