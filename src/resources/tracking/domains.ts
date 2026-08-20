// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { path as __scalarPath } from '../../internal/utils/path';

export class Domains extends APIResource {
  /**
   * @param {DomainCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DomainCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const create = await client.tracking.domains.create({
   *   host: 'x',
   *   scope: 'EXACT_HOST',
   * });
   * ```
   */
  create(body: DomainCreateParams, options?: RequestOptions): APIPromise<DomainCreateResponse> {
    return this._client.post('/tracking/domains', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<unknown>} Successful response
   *
   * @example
   * ```ts
   * const unknown_ = await client.tracking.domains.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<unknown> {
    return this._client.delete(__scalarPath`/tracking/domains/${id}`, options);
  }
}

export interface DomainCreateParams {
  /**
   * @minLength 1
   * @maxLength 253
   */
  host: string;
  /**
   * @default EXACT_HOST
   */
  scope?: 'SITE_AND_SUBDOMAINS' | 'EXACT_HOST';
}

export interface DomainCreateResponse {
  id: string;
  host: string;
  scope: 'SITE_AND_SUBDOMAINS' | 'EXACT_HOST';
  pageViews: number;
  lastSeenAt: string | null;
}
export declare namespace Domains {
  export { type DomainCreateResponse as DomainCreateResponse, type DomainCreateParams as DomainCreateParams };
}
