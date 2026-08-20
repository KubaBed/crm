// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { path as __scalarPath } from '../../internal/utils/path';

export class Runs extends APIResource {
  /**
   * @param {string} runID
   * @param {RunRetryParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<RunRetryResponse>} Successful response
   *
   * @example
   * ```ts
   * const retry = await client.agents.runs.retry('runId', {
   *   id: 'id',
   *   clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
   * });
   * ```
   */
  retry(runID: string, params: RunRetryParams, options?: RequestOptions): APIPromise<RunRetryResponse> {
    const { id, ...body } = params;
    return this._client.post(__scalarPath`/agents/${id}/runs/${runID}/retry`, { body, ...options });
  }

  /**
   * @param {string} runID
   * @param {RunCancelParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<RunCancelResponse>} Successful response
   *
   * @example
   * ```ts
   * const cancel = await client.agents.runs.cancel('runId', {
   *   id: 'id',
   * });
   * ```
   */
  cancel(runID: string, params: RunCancelParams, options?: RequestOptions): APIPromise<RunCancelResponse> {
    const { id } = params;
    return this._client.post(__scalarPath`/agents/${id}/runs/${runID}/cancel`, options);
  }
}

export interface RunRetryParams {
  /**
   * Path param
   * @minLength 1
   */
  id: string;
  /**
   * Body param
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  clientRequestId: string;
}

export interface RunRetryResponse {
  id: string;
}

export interface RunCancelParams {
  /**
   * @minLength 1
   */
  id: string;
}

export interface RunCancelResponse {
  id: string;
  status: 'QUEUED' | 'RUNNING' | 'WAITING_FOR_APPROVAL' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  cancelled: boolean;
}
export declare namespace Runs {
  export {
    type RunRetryResponse as RunRetryResponse,
    type RunCancelResponse as RunCancelResponse,
    type RunRetryParams as RunRetryParams,
    type RunCancelParams as RunCancelParams,
  };
}
