// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class InternalCron extends APIResource {
  /**
   * Refresh exchange rates and convert amounts left pending
   *
   * @param {InternalCronRatesControllerRatesViaGetParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns Rates refreshed; conversion counts.
   *
   * @example
   * ```ts
   * await client.internalCron.ratesControllerRatesViaGet({
   *   authorization: 'authorization',
   * });
   * ```
   */
  ratesControllerRatesViaGet(
    params: InternalCronRatesControllerRatesViaGetParams,
    options?: RequestOptions,
  ): APIPromise<void> {
    const { authorization } = params;
    return this._client.get('/internal/sync/rates', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*', authorization: authorization }, options?.headers]),
    });
  }

  /**
   * Run any due Gmail, Outlook or calendar sync
   *
   * @param {InternalCronSyncControllerMailboxesViaGetParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns The sync ran; per-mailbox results.
   *
   * @example
   * ```ts
   * await client.internalCron.syncControllerMailboxesViaGet({
   *   authorization: 'authorization',
   * });
   * ```
   */
  syncControllerMailboxesViaGet(
    params: InternalCronSyncControllerMailboxesViaGetParams,
    options?: RequestOptions,
  ): APIPromise<void> {
    const { authorization } = params;
    return this._client.get('/internal/sync/mailboxes', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*', authorization: authorization }, options?.headers]),
    });
  }

  /**
   * Alias of `mailboxes`, kept for existing cron deployments
   *
   * @param {InternalCronSyncControllerGoogleViaGetParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns The sync ran; per-mailbox results.
   *
   * @example
   * ```ts
   * await client.internalCron.syncControllerGoogleViaGet({
   *   authorization: 'authorization',
   * });
   * ```
   */
  syncControllerGoogleViaGet(
    params: InternalCronSyncControllerGoogleViaGetParams,
    options?: RequestOptions,
  ): APIPromise<void> {
    const { authorization } = params;
    return this._client.get('/internal/sync/google', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*', authorization: authorization }, options?.headers]),
    });
  }

  /**
   * Roll up raw telemetry events into daily counts
   *
   * @param {InternalCronTelemetryControllerRollupViaGetParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns The rollup ran.
   *
   * @example
   * ```ts
   * await client.internalCron.telemetryControllerRollupViaGet({
   *   authorization: 'authorization',
   * });
   * ```
   */
  telemetryControllerRollupViaGet(
    params: InternalCronTelemetryControllerRollupViaGetParams,
    options?: RequestOptions,
  ): APIPromise<void> {
    const { authorization } = params;
    return this._client.get('/internal/telemetry/rollup', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*', authorization: authorization }, options?.headers]),
    });
  }

  /**
   * Roll up and sweep tracking data older than the retention window
   *
   * @param {InternalCronTrackingRetentionControllerViaGetParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns The sweep ran; removed and rolled counts.
   *
   * @example
   * ```ts
   * await client.internalCron.trackingRetentionControllerViaGet({
   *   authorization: 'authorization',
   * });
   * ```
   */
  trackingRetentionControllerViaGet(
    params: InternalCronTrackingRetentionControllerViaGetParams,
    options?: RequestOptions,
  ): APIPromise<void> {
    const { authorization } = params;
    return this._client.get('/internal/tracking/retention', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*', authorization: authorization }, options?.headers]),
    });
  }

  /**
   * Purge companies, contacts and deals past the archive window
   *
   * @param {InternalCronArchiveRetentionControllerPruneViaGetParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns The prune ran; per-record-type counts.
   *
   * @example
   * ```ts
   * await client.internalCron.archiveRetentionControllerPruneViaGet({
   *   authorization: 'authorization',
   * });
   * ```
   */
  archiveRetentionControllerPruneViaGet(
    params: InternalCronArchiveRetentionControllerPruneViaGetParams,
    options?: RequestOptions,
  ): APIPromise<void> {
    const { authorization } = params;
    return this._client.get('/internal/archive/prune', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*', authorization: authorization }, options?.headers]),
    });
  }
}

export interface InternalCronRatesControllerRatesViaGetParams {
  authorization: string;
}

export interface InternalCronSyncControllerMailboxesViaGetParams {
  authorization: string;
}

export interface InternalCronSyncControllerGoogleViaGetParams {
  authorization: string;
}

export interface InternalCronTelemetryControllerRollupViaGetParams {
  authorization: string;
}

export interface InternalCronTrackingRetentionControllerViaGetParams {
  authorization: string;
}

export interface InternalCronArchiveRetentionControllerPruneViaGetParams {
  authorization: string;
}
export declare namespace InternalCron {
  export {
    type InternalCronRatesControllerRatesViaGetParams as InternalCronRatesControllerRatesViaGetParams,
    type InternalCronSyncControllerMailboxesViaGetParams as InternalCronSyncControllerMailboxesViaGetParams,
    type InternalCronSyncControllerGoogleViaGetParams as InternalCronSyncControllerGoogleViaGetParams,
    type InternalCronTelemetryControllerRollupViaGetParams as InternalCronTelemetryControllerRollupViaGetParams,
    type InternalCronTrackingRetentionControllerViaGetParams as InternalCronTrackingRetentionControllerViaGetParams,
    type InternalCronArchiveRetentionControllerPruneViaGetParams as InternalCronArchiveRetentionControllerPruneViaGetParams,
  };
}
