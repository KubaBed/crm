// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';

export class Microsoft extends APIResource {
  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<MicrosoftStatusResponse>} Successful response
   *
   * @example
   * ```ts
   * const status = await client.microsoft.status();
   * ```
   */
  status(options?: RequestOptions): APIPromise<MicrosoftStatusResponse> {
    return this._client.get('/microsoft/status', options);
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<MicrosoftPurgeSyncedDataResponse>} Successful response
   *
   * @example
   * ```ts
   * const purgeSyncedData = await client.microsoft.purgeSyncedData();
   * ```
   */
  purgeSyncedData(options?: RequestOptions): APIPromise<MicrosoftPurgeSyncedDataResponse> {
    return this._client.post('/microsoft/purge-synced-data', options);
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<MicrosoftRevokeAccessResponse>} Successful response
   *
   * @example
   * ```ts
   * const revokeAccess = await client.microsoft.revokeAccess();
   * ```
   */
  revokeAccess(options?: RequestOptions): APIPromise<MicrosoftRevokeAccessResponse> {
    return this._client.post('/microsoft/revoke', options);
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<MicrosoftSyncNowResponse>} Successful response
   *
   * @example
   * ```ts
   * const syncNow = await client.microsoft.syncNow();
   * ```
   */
  syncNow(options?: RequestOptions): APIPromise<MicrosoftSyncNowResponse> {
    return this._client.post('/microsoft/sync', options);
  }

  /**
   * @param {MicrosoftSetAutoCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<MicrosoftSetAutoCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const setAutoCreate = await client.microsoft.setAutoCreate({
   *   source: 'outlook',
   *   enabled: false,
   * });
   * ```
   */
  setAutoCreate(
    body: MicrosoftSetAutoCreateParams,
    options?: RequestOptions,
  ): APIPromise<MicrosoftSetAutoCreateResponse> {
    return this._client.patch('/microsoft/auto-create', { body, ...options });
  }
}

export interface MicrosoftStatusResponse {
  configured: boolean;
  linked: boolean;
  required: boolean;
  hasRefreshToken: boolean;
  sources: Array<MicrosoftStatusResponse.Source>;
}

export namespace MicrosoftStatusResponse {
  export interface Source {
    source: 'outlook';
    connected: boolean;
    status: 'IDLE' | 'RUNNING' | 'NEEDS_RECONNECT' | 'FAILED' | null;
    lastSyncedAt: string | null;
    lastError: string | null;
    autoCreate: boolean;
  }
}

export interface MicrosoftPurgeSyncedDataResponse {
  purged: number;
}

export interface MicrosoftRevokeAccessResponse {
  revoked: boolean;
}

export interface MicrosoftSyncNowResponse {
  configured: boolean;
  linked: boolean;
  required: boolean;
  hasRefreshToken: boolean;
  sources: Array<MicrosoftSyncNowResponse.Source>;
}

export namespace MicrosoftSyncNowResponse {
  export interface Source {
    source: 'outlook';
    connected: boolean;
    status: 'IDLE' | 'RUNNING' | 'NEEDS_RECONNECT' | 'FAILED' | null;
    lastSyncedAt: string | null;
    lastError: string | null;
    autoCreate: boolean;
  }
}

export interface MicrosoftSetAutoCreateParams {
  source: 'outlook';
  enabled: boolean;
}

export interface MicrosoftSetAutoCreateResponse {
  configured: boolean;
  linked: boolean;
  required: boolean;
  hasRefreshToken: boolean;
  sources: Array<MicrosoftSetAutoCreateResponse.Source>;
}

export namespace MicrosoftSetAutoCreateResponse {
  export interface Source {
    source: 'outlook';
    connected: boolean;
    status: 'IDLE' | 'RUNNING' | 'NEEDS_RECONNECT' | 'FAILED' | null;
    lastSyncedAt: string | null;
    lastError: string | null;
    autoCreate: boolean;
  }
}
export declare namespace Microsoft {
  export {
    type MicrosoftStatusResponse as MicrosoftStatusResponse,
    type MicrosoftPurgeSyncedDataResponse as MicrosoftPurgeSyncedDataResponse,
    type MicrosoftRevokeAccessResponse as MicrosoftRevokeAccessResponse,
    type MicrosoftSyncNowResponse as MicrosoftSyncNowResponse,
    type MicrosoftSetAutoCreateResponse as MicrosoftSetAutoCreateResponse,
    type MicrosoftSetAutoCreateParams as MicrosoftSetAutoCreateParams,
  };
}
