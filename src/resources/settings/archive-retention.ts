// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';

export class ArchiveRetention extends APIResource {
  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ArchiveRetentionListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.settings.archiveRetention.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<ArchiveRetentionListResponse> {
    return this._client.get('/settings/archive-retention', options);
  }

  /**
   * @param {ArchiveRetentionSetParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ArchiveRetentionSetResponse>} Successful response
   *
   * @example
   * ```ts
   * const set_ = await client.settings.archiveRetention.set({
   *   days: 0,
   * });
   * ```
   */
  set(body: ArchiveRetentionSetParams, options?: RequestOptions): APIPromise<ArchiveRetentionSetResponse> {
    return this._client.patch('/settings/archive-retention', { body, ...options });
  }
}

export interface ArchiveRetentionListResponse {
  days: number;
}

export interface ArchiveRetentionSetParams {
  /**
   * @minimum 1
   * @maximum 3650
   */
  days: number;
}

export interface ArchiveRetentionSetResponse {
  days: number;
}
export declare namespace ArchiveRetention {
  export {
    type ArchiveRetentionListResponse as ArchiveRetentionListResponse,
    type ArchiveRetentionSetResponse as ArchiveRetentionSetResponse,
    type ArchiveRetentionSetParams as ArchiveRetentionSetParams,
  };
}
