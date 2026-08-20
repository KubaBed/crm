// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';

export class ResearchKey extends APIResource {
  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ResearchKeyListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.settings.researchKey.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<ResearchKeyListResponse> {
    return this._client.get('/settings/research-key', options);
  }

  /**
   * @param {ResearchKeySetParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ResearchKeySetResponse>} Successful response
   *
   * @example
   * ```ts
   * const set_ = await client.settings.researchKey.set({
   *   apiKey: 'xxxxxxxx',
   * });
   * ```
   */
  set(body: ResearchKeySetParams, options?: RequestOptions): APIPromise<ResearchKeySetResponse> {
    return this._client.patch('/settings/research-key', { body, ...options });
  }
}

export interface ResearchKeyListResponse {
  configured: boolean;
  hint: string | null;
}

export interface ResearchKeySetParams {
  /**
   * @minLength 8
   * @maxLength 500
   */
  apiKey: string;
}

export interface ResearchKeySetResponse {
  configured: boolean;
  hint: string | null;
}
export declare namespace ResearchKey {
  export {
    type ResearchKeyListResponse as ResearchKeyListResponse,
    type ResearchKeySetResponse as ResearchKeySetResponse,
    type ResearchKeySetParams as ResearchKeySetParams,
  };
}
