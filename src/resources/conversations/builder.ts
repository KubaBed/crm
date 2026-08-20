// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { path as __scalarPath } from '../../internal/utils/path';

export class Builder extends APIResource {
  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<BuilderListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.conversations.builder.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<BuilderListResponse> {
    return this._client.get('/conversations/builder', options);
  }

  /**
   * @param {BuilderCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<BuilderCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const create = await client.conversations.builder.create({
   *   clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
   *   commandType: 'CHAT',
   *   message: 'x',
   *   resources: [],
   *   attachments: [],
   * });
   * ```
   */
  create(body: BuilderCreateParams, options?: RequestOptions): APIPromise<BuilderCreateResponse> {
    return this._client.post('/conversations/builder', { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<BuilderRetrieveResponse>} Successful response
   *
   * @example
   * ```ts
   * const retrieve = await client.conversations.builder.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<BuilderRetrieveResponse> {
    return this._client.get(__scalarPath`/conversations/builder/${id}`, options);
  }
}

export type BuilderListResponse = Array<BuilderListResponse.BuilderListResponseItem>;

export namespace BuilderListResponse {
  export interface BuilderListResponseItem {
    id: string;
    sessionId: string | null;
    continuationToken: string | null;
    streamIndex: number;
    title: string | null;
    messageCount: number;
    lastMessageAt: string;
    lastAssistantAt: string | null;
    unread: boolean;
    state: 'working' | 'unread' | 'deployed' | 'idle';
    agent: BuilderListResponseItem.Agent | null;
  }

  export namespace BuilderListResponseItem {
    export interface Agent {
      id: string;
      name: string;
      status: 'DRAFT' | 'DEPLOYING' | 'LIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
    }
  }
}

export interface BuilderCreateParams {
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
  resources?: Array<BuilderCreateParams.Resource>;
  /**
   * @default []
   * @maxItems 5
   */
  attachments?: Array<BuilderCreateParams.Attachment>;
}

export namespace BuilderCreateParams {
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
}

export interface BuilderCreateResponse {
  id: string;
}

export interface BuilderRetrieveResponse {
  id: string;
  sessionId: string | null;
  continuationToken: string | null;
  streamIndex: number;
  title: string | null;
  messageCount: number;
  lastMessageAt: string;
  lastAssistantAt: string | null;
  lastReadAt: string | null;
  pendingQuestion: BuilderRetrieveResponse.PendingQuestion | null;
  agent: BuilderRetrieveResponse.Agent | null;
  createdVersions: Array<BuilderRetrieveResponse.CreatedVersion>;
  builderArtifacts: Array<BuilderRetrieveResponse.BuilderArtifact>;
  feedback: Array<BuilderRetrieveResponse.Feedback>;
  submissions: Array<BuilderRetrieveResponse.Submission>;
}

export namespace BuilderRetrieveResponse {
  export interface PendingQuestion {
    kind: 'question';
    requestId: string;
    prompt: string;
    options: Array<PendingQuestion.Option>;
    display?: 'confirmation' | 'select' | 'text';
    allowFreeform?: boolean;
  }

  export namespace PendingQuestion {
    export interface Option {
      id: string;
      label: string;
      description?: string;
      style?: 'danger' | 'default' | 'primary';
    }
  }

  export interface Agent {
    id: string;
    name: string;
    description: string | null;
    status: 'DRAFT' | 'DEPLOYING' | 'LIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
    createdBy: Agent.CreatedBy;
    currentVersion: Agent.CurrentVersion | null;
    triggers: Array<Agent.Trigger>;
  }

  export namespace Agent {
    export interface CreatedBy {
      id: string;
      name: string;
    }

    export interface CurrentVersion {
      id: string;
      number: number;
      status: 'DRAFT' | 'VALIDATING' | 'READY' | 'DEPLOYED' | 'REJECTED';
      manifest: unknown;
      modelId: string;
      sandboxPolicy: unknown;
      deployedAt: string | null;
    }

    export interface Trigger {
      id: string;
      type: 'MANUAL' | 'SCHEDULE' | 'EVENT' | 'WEBHOOK';
      name: string;
      config: unknown;
      enabled: boolean;
      nextRunAt: string | null;
    }
  }

  export interface CreatedVersion {
    id: string;
    number: number;
    status: 'DRAFT' | 'VALIDATING' | 'READY' | 'DEPLOYED' | 'REJECTED';
    instructions: string;
    manifest: CreatedVersion.Manifest;
    modelId: string;
    sandboxPolicy: unknown;
    validation: unknown | null;
    createdAt: string;
  }

  export namespace CreatedVersion {
    export interface Manifest {
      access: Array<string>;
      triggers: Array<Manifest.Trigger>;
      actions: Array<Manifest.Action>;
      dataScope: Manifest.DataScope;
      name?: string;
      description?: string;
    }

    export namespace Manifest {
      export interface Trigger {
        type?: string;
        summary?: string;
      }

      export interface Action {
        summary?: string;
      }

      export interface DataScope {
        summary?: string;
      }
    }
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

  export interface Feedback {
    messageId: string;
    rating: 'UP' | 'DOWN';
  }

  export interface Submission {
    id: string;
    clientRequestId: string;
    commandType: 'CHAT' | 'CREATE_AGENT';
    message: Record<string, unknown>;
    status: 'PENDING' | 'SENDING' | 'ACCEPTED' | 'FAILED' | 'CANCELLED';
    errorCode: string | null;
    errorMessage: string | null;
    createdAt: string;
    sentAt: string | null;
    acceptedAt: string | null;
  }
}
export declare namespace Builder {
  export {
    type BuilderListResponse as BuilderListResponse,
    type BuilderCreateResponse as BuilderCreateResponse,
    type BuilderRetrieveResponse as BuilderRetrieveResponse,
    type BuilderCreateParams as BuilderCreateParams,
  };
}
