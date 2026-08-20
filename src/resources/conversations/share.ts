// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { path as __scalarPath } from '../../internal/utils/path';

export class Share extends APIResource {
  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ShareStatusResponse>} Successful response
   *
   * @example
   * ```ts
   * const status = await client.conversations.share.status('id');
   * ```
   */
  status(id: string, options?: RequestOptions): APIPromise<ShareStatusResponse> {
    return this._client.get(__scalarPath`/conversations/${id}/share`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ShareCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const create = await client.conversations.share.create('id');
   * ```
   */
  create(id: string, options?: RequestOptions): APIPromise<ShareCreateResponse> {
    return this._client.post(__scalarPath`/conversations/${id}/share`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ShareRevokeResponse>} Successful response
   *
   * @example
   * ```ts
   * const revoke = await client.conversations.share.revoke('id');
   * ```
   */
  revoke(id: string, options?: RequestOptions): APIPromise<ShareRevokeResponse> {
    return this._client.delete(__scalarPath`/conversations/${id}/share`, options);
  }
}

export interface ShareStatusResponse {
  enabled: boolean;
  createdAt: string | null;
  expiresAt: string | null;
}

export interface ShareCreateResponse {
  token: string;
}

export interface ShareRevokeResponse {
  id: string;
}
export declare namespace Share {
  export {
    type ShareStatusResponse as ShareStatusResponse,
    type ShareCreateResponse as ShareCreateResponse,
    type ShareRevokeResponse as ShareRevokeResponse,
  };
}
