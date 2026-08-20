// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { path as __scalarPath } from '../internal/utils/path';

export class APIKeys extends APIResource {
  /**
   * @param {APIKeyListParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<APIKeyListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.apiKeys.list({
   *   q: '',
   *   sort: '',
   *   dir: 'asc',
   *   page: 1,
   *   pageSize: 25,
   * });
   * ```
   */
  list(
    query: APIKeyListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<APIKeyListResponse> {
    return this._client.get('/api-keys', { query, ...options });
  }

  /**
   * @param {APIKeyCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<APIKeyCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const create = await client.apiKeys.create({
   *   name: 'x',
   *   expiresInDays: 0,
   * });
   * ```
   */
  create(body: APIKeyCreateParams, options?: RequestOptions): APIPromise<APIKeyCreateResponse> {
    return this._client.post('/api-keys', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<APIKeyRevokeResponse>} Successful response
   *
   * @example
   * ```ts
   * const revoke = await client.apiKeys.revoke('id');
   * ```
   */
  revoke(id: string, options?: RequestOptions): APIPromise<APIKeyRevokeResponse> {
    return this._client.delete(__scalarPath`/api-keys/${id}`, options);
  }
}

export interface APIKeyListParams {
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
}

export interface APIKeyListResponse {
  rows: Array<APIKeyListResponse.Row>;
  total: number;
  facetCounts: Record<string, Record<string, number>>;
}

export namespace APIKeyListResponse {
  export interface Row {
    id: string;
    name: string | null;
    start: string | null;
    enabled: boolean;
    createdAt: string;
    lastRequest: string | null;
    expiresAt: string | null;
  }
}

export interface APIKeyCreateParams {
  /**
   * @minLength 1
   * @maxLength 64
   */
  name: string;
  /**
   * @minimum 1
   * @maximum 365
   */
  expiresInDays: number | null;
}

export interface APIKeyCreateResponse {
  id: string;
  name: string | null;
  start: string | null;
  enabled: boolean;
  createdAt: string;
  lastRequest: string | null;
  expiresAt: string | null;
  key: string;
}

export interface APIKeyRevokeResponse {
  id: string;
}
export declare namespace APIKeys {
  export {
    type APIKeyListResponse as APIKeyListResponse,
    type APIKeyCreateResponse as APIKeyCreateResponse,
    type APIKeyRevokeResponse as APIKeyRevokeResponse,
    type APIKeyListParams as APIKeyListParams,
    type APIKeyCreateParams as APIKeyCreateParams,
  };
}
