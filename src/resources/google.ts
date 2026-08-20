// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { path as __scalarPath } from '../internal/utils/path';

export class Google extends APIResource {
  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<GoogleStatusResponse>} Successful response
   *
   * @example
   * ```ts
   * const status = await client.google.status();
   * ```
   */
  status(options?: RequestOptions): APIPromise<GoogleStatusResponse> {
    return this._client.get('/google/status', options);
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<GooglePurgeSyncedDataResponse>} Successful response
   *
   * @example
   * ```ts
   * const purgeSyncedData = await client.google.purgeSyncedData();
   * ```
   */
  purgeSyncedData(options?: RequestOptions): APIPromise<GooglePurgeSyncedDataResponse> {
    return this._client.post('/google/purge-synced-data', options);
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<GoogleRevokeAccessResponse>} Successful response
   *
   * @example
   * ```ts
   * const revokeAccess = await client.google.revokeAccess();
   * ```
   */
  revokeAccess(options?: RequestOptions): APIPromise<GoogleRevokeAccessResponse> {
    return this._client.post('/google/revoke', options);
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<GoogleSyncNowResponse>} Successful response
   *
   * @example
   * ```ts
   * const syncNow = await client.google.syncNow();
   * ```
   */
  syncNow(options?: RequestOptions): APIPromise<GoogleSyncNowResponse> {
    return this._client.post('/google/sync', options);
  }

  /**
   * @param {GoogleSetAutoCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<GoogleSetAutoCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const setAutoCreate = await client.google.setAutoCreate({
   *   source: 'calendar',
   *   enabled: false,
   * });
   * ```
   */
  setAutoCreate(
    body: GoogleSetAutoCreateParams,
    options?: RequestOptions,
  ): APIPromise<GoogleSetAutoCreateResponse> {
    return this._client.patch('/google/auto-create', { body, ...options });
  }

  /**
   * @param {GoogleSuppressDomainParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<GoogleSuppressDomainResponse>} Successful response
   *
   * @example
   * ```ts
   * const suppressDomain = await client.google.suppressDomain({
   *   domain: 'x',
   *   purge: true,
   * });
   * ```
   */
  suppressDomain(
    body: GoogleSuppressDomainParams,
    options?: RequestOptions,
  ): APIPromise<GoogleSuppressDomainResponse> {
    return this._client.post('/google/suppress-domain', { body, ...options });
  }

  /**
   * @param {string} threadID
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<GoogleThreadResponse>} Successful response
   *
   * @example
   * ```ts
   * const thread = await client.google.thread('threadId');
   * ```
   */
  thread(threadID: string, options?: RequestOptions): APIPromise<GoogleThreadResponse> {
    return this._client.get(__scalarPath`/google/threads/${threadID}`, options);
  }

  /**
   * @param {string} eventID
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<GoogleEventResponse>} Successful response
   *
   * @example
   * ```ts
   * const event = await client.google.event('eventId');
   * ```
   */
  event(eventID: string, options?: RequestOptions): APIPromise<GoogleEventResponse> {
    return this._client.get(__scalarPath`/google/events/${eventID}`, options);
  }
}

export interface GoogleStatusResponse {
  configured: boolean;
  linked: boolean;
  required: boolean;
  hasRefreshToken: boolean;
  sources: Array<GoogleStatusResponse.Source>;
}

export namespace GoogleStatusResponse {
  export interface Source {
    source: 'calendar' | 'gmail';
    connected: boolean;
    status: 'IDLE' | 'RUNNING' | 'NEEDS_RECONNECT' | 'FAILED' | null;
    lastSyncedAt: string | null;
    lastError: string | null;
    autoCreate: boolean;
  }
}

export interface GooglePurgeSyncedDataResponse {
  purged: number;
}

export interface GoogleRevokeAccessResponse {
  revoked: boolean;
}

export interface GoogleSyncNowResponse {
  configured: boolean;
  linked: boolean;
  required: boolean;
  hasRefreshToken: boolean;
  sources: Array<GoogleSyncNowResponse.Source>;
}

export namespace GoogleSyncNowResponse {
  export interface Source {
    source: 'calendar' | 'gmail';
    connected: boolean;
    status: 'IDLE' | 'RUNNING' | 'NEEDS_RECONNECT' | 'FAILED' | null;
    lastSyncedAt: string | null;
    lastError: string | null;
    autoCreate: boolean;
  }
}

export interface GoogleSetAutoCreateParams {
  source: 'calendar' | 'gmail';
  enabled: boolean;
}

export interface GoogleSetAutoCreateResponse {
  configured: boolean;
  linked: boolean;
  required: boolean;
  hasRefreshToken: boolean;
  sources: Array<GoogleSetAutoCreateResponse.Source>;
}

export namespace GoogleSetAutoCreateResponse {
  export interface Source {
    source: 'calendar' | 'gmail';
    connected: boolean;
    status: 'IDLE' | 'RUNNING' | 'NEEDS_RECONNECT' | 'FAILED' | null;
    lastSyncedAt: string | null;
    lastError: string | null;
    autoCreate: boolean;
  }
}

export interface GoogleSuppressDomainParams {
  /**
   * @minLength 1
   */
  domain: string;
  /**
   * @maxLength 200
   */
  reason?: string;
  /**
   * @default true
   */
  purge?: boolean;
}

export interface GoogleSuppressDomainResponse {
  domain: string;
  purged: number;
}

export interface GoogleThreadResponse {
  id: string;
  subject: string | null;
  messageCount: number;
  firstMessageAt: string;
  lastMessageAt: string;
  company: GoogleThreadResponse.Company | null;
  contact: GoogleThreadResponse.Contact | null;
  messages: Array<GoogleThreadResponse.Message>;
}

export namespace GoogleThreadResponse {
  export interface Company {
    id: string;
    name: string;
  }

  export interface Contact {
    id: string;
    firstName: string;
    lastName: string | null;
  }

  export interface Message {
    id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    fromEmail: string;
    fromName: string | null;
    recipients: Array<Message.Recipient>;
    subject: string | null;
    body: string | null;
    snippet: string | null;
    sentAt: string;
    gmailMessageId: string | null;
    outlookWebLink: string | null;
    fromImageUrl: string | null;
    mailboxUrl: string | null;
    mailboxName: string | null;
  }

  export namespace Message {
    export interface Recipient {
      email: string;
      name: string | null;
      kind: string;
    }
  }
}

export interface GoogleEventResponse {
  id: string;
  title: string | null;
  description: string | null;
  location: string | null;
  conferenceUrl: string | null;
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  status: string;
  organizerEmail: string | null;
  company: GoogleEventResponse.Company | null;
  contact: GoogleEventResponse.Contact | null;
  attendees: Array<GoogleEventResponse.Attendee>;
}

export namespace GoogleEventResponse {
  export interface Company {
    id: string;
    name: string;
  }

  export interface Contact {
    id: string;
    firstName: string;
    lastName: string | null;
  }

  export interface Attendee {
    id: string;
    email: string;
    name: string | null;
    responseStatus: string | null;
    isOrganizer: boolean;
    contactId: string | null;
    imageUrl: string | null;
  }
}
export declare namespace Google {
  export {
    type GoogleStatusResponse as GoogleStatusResponse,
    type GooglePurgeSyncedDataResponse as GooglePurgeSyncedDataResponse,
    type GoogleRevokeAccessResponse as GoogleRevokeAccessResponse,
    type GoogleSyncNowResponse as GoogleSyncNowResponse,
    type GoogleSetAutoCreateResponse as GoogleSetAutoCreateResponse,
    type GoogleSuppressDomainResponse as GoogleSuppressDomainResponse,
    type GoogleThreadResponse as GoogleThreadResponse,
    type GoogleEventResponse as GoogleEventResponse,
    type GoogleSetAutoCreateParams as GoogleSetAutoCreateParams,
    type GoogleSuppressDomainParams as GoogleSuppressDomainParams,
  };
}
