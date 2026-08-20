// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class Auth extends APIResource {
  /**
   * Get the signed-in user's profile
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns The signed-in user's profile.
   *
   * @example
   * ```ts
   * await client.auth.controllerGetMe();
   * ```
   */
  controllerGetMe(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/auth/me', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Check whether the current request carries a valid session
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns Whether the request is authenticated, and as whom.
   *
   * @example
   * ```ts
   * await client.auth.controllerGetSession();
   * ```
   */
  controllerGetSession(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/auth/session', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}
