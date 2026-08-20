// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { path as __scalarPath } from '../internal/utils/path';

export class SavedViews extends APIResource {
  /**
   * @param {SavedViewListParams} query - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SavedViewListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.savedViews.list({
   *   entity: 'COMPANY',
   * });
   * ```
   */
  list(query: SavedViewListParams, options?: RequestOptions): APIPromise<SavedViewListResponse> {
    return this._client.get('/saved-views', { query, ...options });
  }

  /**
   * @param {SavedViewCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SavedViewCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const create = await client.savedViews.create({
   *   entity: 'COMPANY',
   *   name: 'x',
   *   shared: false,
   *   filters: {
   *     q: '',
   *     sort: '',
   *     dir: 'asc',
   *     archived: false,
   *     filters: {},
   *   },
   * });
   * ```
   */
  create(body: SavedViewCreateParams, options?: RequestOptions): APIPromise<SavedViewCreateResponse> {
    return this._client.post('/saved-views', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {SavedViewUpdateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SavedViewUpdateResponse>} Successful response
   *
   * @example
   * ```ts
   * const update = await client.savedViews.update('id', {
   *   data: {},
   * });
   * ```
   */
  update(
    id: string,
    body: SavedViewUpdateParams,
    options?: RequestOptions,
  ): APIPromise<SavedViewUpdateResponse> {
    return this._client.patch(__scalarPath`/saved-views/${id}`, { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SavedViewDeleteResponse>} Successful response
   *
   * @example
   * ```ts
   * const delete_ = await client.savedViews.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<SavedViewDeleteResponse> {
    return this._client.delete(__scalarPath`/saved-views/${id}`, options);
  }
}

export interface SavedViewListParams {
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
}

export type SavedViewListResponse = Array<SavedViewListResponse.SavedViewListResponseItem>;

export namespace SavedViewListResponse {
  export interface SavedViewListResponseItem {
    id: string;
    entity: 'COMPANY' | 'CONTACT' | 'DEAL';
    name: string;
    shared: boolean;
    filters: SavedViewListResponseItem.Filters;
    mine: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export namespace SavedViewListResponseItem {
    export interface Filters {
      q: string;
      sort: string;
      dir: 'asc' | 'desc';
      archived: boolean;
      filters: Record<string, Array<string>>;
    }
  }
}

export interface SavedViewCreateParams {
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
  /**
   * @minLength 1
   * @maxLength 120
   */
  name: string;
  filters: SavedViewCreateParams.Filters;
  /**
   * @default false
   */
  shared?: boolean;
}

export namespace SavedViewCreateParams {
  export interface Filters {
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
     * @default false
     */
    archived?: boolean;
    /**
     * @default {}
     */
    filters?: Record<string, Array<string>>;
  }
}

export interface SavedViewCreateResponse {
  id: string;
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
  name: string;
  shared: boolean;
  filters: SavedViewCreateResponse.Filters;
  mine: boolean;
  createdAt: string;
  updatedAt: string;
}

export namespace SavedViewCreateResponse {
  export interface Filters {
    q: string;
    sort: string;
    dir: 'asc' | 'desc';
    archived: boolean;
    filters: Record<string, Array<string>>;
  }
}

export interface SavedViewUpdateParams {
  data: SavedViewUpdateParams.Data;
}

export namespace SavedViewUpdateParams {
  export interface Data {
    /**
     * @minLength 1
     * @maxLength 120
     */
    name?: string;
    shared?: boolean;
    filters?: Data.Filters;
  }

  export namespace Data {
    export interface Filters {
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
       * @default false
       */
      archived?: boolean;
      /**
       * @default {}
       */
      filters?: Record<string, Array<string>>;
    }
  }
}

export interface SavedViewUpdateResponse {
  id: string;
  entity: 'COMPANY' | 'CONTACT' | 'DEAL';
  name: string;
  shared: boolean;
  filters: SavedViewUpdateResponse.Filters;
  mine: boolean;
  createdAt: string;
  updatedAt: string;
}

export namespace SavedViewUpdateResponse {
  export interface Filters {
    q: string;
    sort: string;
    dir: 'asc' | 'desc';
    archived: boolean;
    filters: Record<string, Array<string>>;
  }
}

export interface SavedViewDeleteResponse {
  id: string;
}
export declare namespace SavedViews {
  export {
    type SavedViewListResponse as SavedViewListResponse,
    type SavedViewCreateResponse as SavedViewCreateResponse,
    type SavedViewUpdateResponse as SavedViewUpdateResponse,
    type SavedViewDeleteResponse as SavedViewDeleteResponse,
    type SavedViewListParams as SavedViewListParams,
    type SavedViewCreateParams as SavedViewCreateParams,
    type SavedViewUpdateParams as SavedViewUpdateParams,
  };
}
