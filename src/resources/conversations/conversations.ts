// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { buildHeaders } from '../../internal/headers';
import { path as __scalarPath } from '../../internal/utils/path';
import * as BuilderAPI from './builder';
import {
  Builder,
  type BuilderListResponse,
  type BuilderCreateResponse,
  type BuilderRetrieveResponse,
  type BuilderCreateParams,
} from './builder';
import * as ShareAPI from './share';
import { Share, type ShareStatusResponse, type ShareCreateResponse, type ShareRevokeResponse } from './share';

export class Conversations extends APIResource {
  builder: BuilderAPI.Builder = new BuilderAPI.Builder(this._client);
  share: ShareAPI.Share = new ShareAPI.Share(this._client);

  /**
   * Download a conversation attachment
   *
   * @param {string} id - Attachment id.
   * @param {ConversationAttachmentsControllerReadParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns The attachment's raw bytes.
   *
   * @example
   * ```ts
   * await client.conversations.attachmentsControllerRead('id');
   * ```
   */
  attachmentsControllerRead(
    id: string,
    query: ConversationAttachmentsControllerReadParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<void> {
    return this._client.get(__scalarPath`/api/conversations/attachments/${id}`, {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * @param {ConversationListParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ConversationListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.conversations.list();
   * ```
   */
  list(
    query: ConversationListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ConversationListResponse> {
    return this._client.get('/conversations', { query, ...options });
  }

  /**
   * @param {ConversationSaveParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ConversationSaveResponse>} Successful response
   *
   * @example
   * ```ts
   * const save = await client.conversations.save({
   *   sessionId: 'x',
   * });
   * ```
   */
  save(body: ConversationSaveParams, options?: RequestOptions): APIPromise<ConversationSaveResponse> {
    return this._client.post('/conversations', { body, ...options });
  }

  /**
   * @param {ConversationBuilderResourcesParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ConversationBuilderResourcesResponse>} Successful response
   *
   * @example
   * ```ts
   * const builderResources = await client.conversations.builderResources({
   *   q: '',
   * });
   * ```
   */
  builderResources(
    query: ConversationBuilderResourcesParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ConversationBuilderResourcesResponse> {
    return this._client.get('/conversations/builder-resources', { query, ...options });
  }

  /**
   * @param {string} id
   * @param {ConversationEventsParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ConversationEventsResponse>} Successful response
   *
   * @example
   * ```ts
   * const events = await client.conversations.events('id', {
   *   limit: 2000,
   * });
   * ```
   */
  events(
    id: string,
    query: ConversationEventsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ConversationEventsResponse> {
    return this._client.get(__scalarPath`/conversations/${id}/events`, { query, ...options });
  }

  /**
   * @param {string} id
   * @param {ConversationSubmitBuilderParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ConversationSubmitBuilderResponse>} Successful response
   *
   * @example
   * ```ts
   * const submitBuilder = await client.conversations.submitBuilder('id', {
   *   clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
   *   commandType: 'CHAT',
   *   message: 'x',
   *   resources: [],
   *   attachments: [],
   * });
   * ```
   */
  submitBuilder(
    id: string,
    body: ConversationSubmitBuilderParams,
    options?: RequestOptions,
  ): APIPromise<ConversationSubmitBuilderResponse> {
    return this._client.post(__scalarPath`/conversations/${id}/submit-builder`, { body, ...options });
  }

  /**
   * @param {string} id
   * @param {ConversationAnswerBuilderQuestionParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ConversationAnswerBuilderQuestionResponse>} Successful response
   *
   * @example
   * ```ts
   * const answerBuilderQuestion = await client.conversations.answerBuilderQuestion('id', {
   *   clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
   *   requestId: 'x',
   * });
   * ```
   */
  answerBuilderQuestion(
    id: string,
    body: ConversationAnswerBuilderQuestionParams,
    options?: RequestOptions,
  ): APIPromise<ConversationAnswerBuilderQuestionResponse> {
    return this._client.post(__scalarPath`/conversations/${id}/answer-builder-question`, {
      body,
      ...options,
    });
  }

  /**
   * @param {string} id
   * @param {ConversationRateBuilderResponseParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ConversationRateBuilderResponseResponse>} Successful response
   *
   * @example
   * ```ts
   * const rateBuilderResponse = await client.conversations.rateBuilderResponse('id', {
   *   messageId: 'x',
   *   rating: 'UP',
   * });
   * ```
   */
  rateBuilderResponse(
    id: string,
    body: ConversationRateBuilderResponseParams,
    options?: RequestOptions,
  ): APIPromise<ConversationRateBuilderResponseResponse> {
    return this._client.post(__scalarPath`/conversations/${id}/rate-builder-response`, { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ConversationMarkReadResponse>} Successful response
   *
   * @example
   * ```ts
   * const markRead = await client.conversations.markRead('id');
   * ```
   */
  markRead(id: string, options?: RequestOptions): APIPromise<ConversationMarkReadResponse> {
    return this._client.patch(__scalarPath`/conversations/${id}/read`, options);
  }

  /**
   * @param {string} token
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ConversationSharedResponse>} Successful response
   *
   * @example
   * ```ts
   * const shared = await client.conversations.shared('tokenxxxxxxxxxxxxxxxxxxxxxxxxxxx');
   * ```
   */
  shared(token: string, options?: RequestOptions): APIPromise<ConversationSharedResponse> {
    return this._client.get(__scalarPath`/conversations/shared/${token}`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ConversationDeleteResponse>} Successful response
   *
   * @example
   * ```ts
   * const delete_ = await client.conversations.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<ConversationDeleteResponse> {
    return this._client.delete(__scalarPath`/conversations/${id}`, options);
  }
}

export interface ConversationAttachmentsControllerReadParams {
  /**
   * Share token, for a link opened outside a session.
   */
  share?: string;
}

export interface ConversationListParams {
  /**
   * @minLength 1
   */
  contactId?: string;
  /**
   * @minLength 1
   */
  companyId?: string;
  /**
   * @minLength 1
   */
  dealId?: string;
}

export type ConversationListResponse = Array<ConversationListResponse.ConversationListResponseItem>;

export namespace ConversationListResponse {
  export interface ConversationListResponseItem {
    id: string;
    sessionId: string;
    continuationToken: string | null;
    streamIndex: number;
    title: string | null;
    messageCount: number;
    lastMessageAt: string;
  }
}

export interface ConversationSaveParams {
  /**
   * @minLength 1
   */
  sessionId: string;
  /**
   * @minLength 1
   */
  contactId?: string;
  /**
   * @minLength 1
   */
  companyId?: string;
  /**
   * @minLength 1
   */
  dealId?: string;
  continuationToken?: string | null;
  /**
   * @minimum 0
   * @maximum 9007199254740991
   */
  streamIndex?: number;
  /**
   * @maxLength 120
   */
  title?: string;
  /**
   * @minimum 0
   * @maximum 9007199254740991
   */
  messageCount?: number;
}

export interface ConversationSaveResponse {
  id: string;
}

export interface ConversationBuilderResourcesParams {
  /**
   * @default ""
   * @maxLength 120
   */
  q?: string;
}

export type ConversationBuilderResourcesResponse =
  Array<ConversationBuilderResourcesResponse.ConversationBuilderResourcesResponseItem>;

export namespace ConversationBuilderResourcesResponse {
  export interface ConversationBuilderResourcesResponseItem {
    kind: 'integration' | 'company' | 'contact' | 'deal';
    id: string;
    label: string;
    detail: string | null;
    imageUrl: string | null;
  }
}

export interface ConversationEventsParams {
  /**
   * @default 2000
   * @minimum 1
   * @maximum 5000
   */
  limit?: number;
}

export type ConversationEventsResponse = Array<ConversationEventsResponse.ConversationEventsResponseItem>;

export namespace ConversationEventsResponse {
  export interface ConversationEventsResponseItem {
    type: string;
    data: unknown;
    meta: ConversationEventsResponseItem.Meta;
  }

  export namespace ConversationEventsResponseItem {
    export interface Meta {
      id: string;
      at: string;
    }
  }
}

export interface ConversationSubmitBuilderParams {
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  clientRequestId: string;
  /**
   * @minLength 1
   * @maxLength 20000
   */
  message: string;
  /**
   * @default CHAT
   */
  commandType?: 'CHAT' | 'CREATE_AGENT';
  /**
   * @default []
   * @maxItems 20
   */
  resources?: Array<ConversationSubmitBuilderParams.Resource>;
  /**
   * @default []
   * @maxItems 5
   */
  attachments?: Array<
    ConversationSubmitBuilderParams.Attachment | ConversationSubmitBuilderParams.Attachment2
  >;
}

export namespace ConversationSubmitBuilderParams {
  export interface Resource {
    kind: 'integration' | 'company' | 'contact' | 'deal';
    /**
     * @minLength 1
     * @maxLength 160
     */
    id: string;
    /**
     * @minLength 1
     * @maxLength 120
     */
    label: string;
    /**
     * @maxLength 160
     */
    detail?: string | null;
    /**
     * @format uri
     */
    imageUrl?: string | null;
  }

  export interface Attachment {
    /**
     * @minLength 1
     * @maxLength 180
     */
    name: string;
    /**
     * @minLength 1
     * @maxLength 120
     */
    type: string;
    /**
     * @minimum 1
     * @maximum 2000000
     */
    size: number;
    /**
     * @minLength 1
     * @maxLength 2800000
     * @pattern ^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$
     */
    contentBase64: string;
  }

  export interface Attachment2 {
    /**
     * @minLength 1
     */
    id: string;
    /**
     * @minLength 1
     * @maxLength 180
     */
    name: string;
    /**
     * @minLength 1
     * @maxLength 120
     */
    type: string;
    /**
     * @minimum 1
     * @maximum 2000000
     */
    size: number;
    previewUrl?: string | null;
  }
}

export interface ConversationSubmitBuilderResponse {
  id: string;
}

export interface ConversationAnswerBuilderQuestionParams {
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  clientRequestId: string;
  /**
   * @minLength 1
   * @maxLength 240
   */
  requestId: string;
  /**
   * @minLength 1
   * @maxLength 160
   */
  optionId?: string;
  /**
   * @minLength 1
   * @maxLength 20000
   */
  text?: string;
}

export interface ConversationAnswerBuilderQuestionResponse {
  id: string;
}

export interface ConversationRateBuilderResponseParams {
  /**
   * @minLength 1
   * @maxLength 240
   */
  messageId: string;
  rating: 'UP' | 'DOWN' | null;
}

export interface ConversationRateBuilderResponseResponse {
  id: string;
  rating: 'UP' | 'DOWN' | null;
}

export interface ConversationMarkReadResponse {
  id: string;
}

export interface ConversationSharedResponse {
  id: string;
  title: string | null;
  ownerName: string;
  lastMessageAt: string;
  agent: ConversationSharedResponse.Agent | null;
  builderArtifacts: Array<ConversationSharedResponse.BuilderArtifact>;
  submissions: Array<ConversationSharedResponse.Submission>;
  events: Array<ConversationSharedResponse.Event>;
}

export namespace ConversationSharedResponse {
  export interface Agent {
    id: string;
    name: string;
    status: 'DRAFT' | 'DEPLOYING' | 'LIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
  }

  export interface BuilderArtifact {
    id: string;
    versionId: string | null;
    path: string;
    language: string;
    content: string;
    previousContent: string | null;
    revision: number;
    status: 'WRITING' | 'READY';
    createdAt: string;
  }

  export interface Submission {
    id: string;
    commandType: 'CHAT' | 'CREATE_AGENT';
    message: Record<string, unknown>;
    status: 'PENDING' | 'SENDING' | 'ACCEPTED' | 'FAILED' | 'CANCELLED';
    errorMessage: string | null;
    createdAt: string;
  }

  export interface Event {
    type: string;
    data: unknown;
    meta: Event.Meta;
  }

  export namespace Event {
    export interface Meta {
      id: string;
      at: string;
    }
  }
}

export interface ConversationDeleteResponse {
  id: string;
}
Conversations.Builder = Builder;
Conversations.Share = Share;

export declare namespace Conversations {
  export {
    type ConversationListResponse as ConversationListResponse,
    type ConversationSaveResponse as ConversationSaveResponse,
    type ConversationBuilderResourcesResponse as ConversationBuilderResourcesResponse,
    type ConversationEventsResponse as ConversationEventsResponse,
    type ConversationSubmitBuilderResponse as ConversationSubmitBuilderResponse,
    type ConversationAnswerBuilderQuestionResponse as ConversationAnswerBuilderQuestionResponse,
    type ConversationRateBuilderResponseResponse as ConversationRateBuilderResponseResponse,
    type ConversationMarkReadResponse as ConversationMarkReadResponse,
    type ConversationSharedResponse as ConversationSharedResponse,
    type ConversationDeleteResponse as ConversationDeleteResponse,
    type ConversationAttachmentsControllerReadParams as ConversationAttachmentsControllerReadParams,
    type ConversationListParams as ConversationListParams,
    type ConversationSaveParams as ConversationSaveParams,
    type ConversationBuilderResourcesParams as ConversationBuilderResourcesParams,
    type ConversationEventsParams as ConversationEventsParams,
    type ConversationSubmitBuilderParams as ConversationSubmitBuilderParams,
    type ConversationAnswerBuilderQuestionParams as ConversationAnswerBuilderQuestionParams,
    type ConversationRateBuilderResponseParams as ConversationRateBuilderResponseParams,
  };

  export {
    Builder as Builder,
    type BuilderListResponse as BuilderListResponse,
    type BuilderCreateResponse as BuilderCreateResponse,
    type BuilderRetrieveResponse as BuilderRetrieveResponse,
    type BuilderCreateParams as BuilderCreateParams,
  };

  export {
    Share as Share,
    type ShareStatusResponse as ShareStatusResponse,
    type ShareCreateResponse as ShareCreateResponse,
    type ShareRevokeResponse as ShareRevokeResponse,
  };
}
