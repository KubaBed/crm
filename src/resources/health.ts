// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';

export class Health extends APIResource {
  /**
   * Report API and database liveness
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<HealthControllerCheckResponse>} The API and its database are reachable.
   *
   * @example
   * ```ts
   * const string_ = await client.health.controllerCheck();
   * ```
   */
  controllerCheck(options?: RequestOptions): APIPromise<HealthControllerCheckResponse> {
    return this._client.get('/health', options);
  }
}

export type HealthControllerCheckResponse = string;
export declare namespace Health {
  export { type HealthControllerCheckResponse as HealthControllerCheckResponse };
}
