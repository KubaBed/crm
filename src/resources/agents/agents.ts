// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { path as __scalarPath } from '../../internal/utils/path';
import * as RunsAPI from './runs';
import {
  Runs,
  type RunRetryResponse,
  type RunCancelResponse,
  type RunRetryParams,
  type RunCancelParams,
} from './runs';

export class Agents extends APIResource {
  runs: RunsAPI.Runs = new RunsAPI.Runs(this._client);

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.agents.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<AgentListResponse> {
    return this._client.get('/agents', options);
  }

  /**
   * @param {string} id
   * @param {AgentReviseParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentReviseResponse>} Successful response
   *
   * @example
   * ```ts
   * const revise = await client.agents.revise('id', {
   *   clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
   * });
   * ```
   */
  revise(id: string, body: AgentReviseParams, options?: RequestOptions): APIPromise<AgentReviseResponse> {
    return this._client.post(__scalarPath`/agents/${id}/revise`, { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentFilesResponse>} Successful response
   *
   * @example
   * ```ts
   * const files = await client.agents.files('id');
   * ```
   */
  files(id: string, options?: RequestOptions): APIPromise<AgentFilesResponse> {
    return this._client.get(__scalarPath`/agents/${id}/files`, options);
  }

  /**
   * @param {string} id
   * @param {AgentSaveFileParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentSaveFileResponse>} Successful response
   *
   * @example
   * ```ts
   * const saveFile = await client.agents.saveFile('id', {
   *   clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
   *   path: 'x',
   *   content: '',
   * });
   * ```
   */
  saveFile(
    id: string,
    body: AgentSaveFileParams,
    options?: RequestOptions,
  ): APIPromise<AgentSaveFileResponse> {
    return this._client.post(__scalarPath`/agents/${id}/save-file`, { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentRetrieveResponse>} Successful response
   *
   * @example
   * ```ts
   * const retrieve = await client.agents.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<AgentRetrieveResponse> {
    return this._client.get(__scalarPath`/agents/${id}`, options);
  }

  /**
   * @param {string} id
   * @param {AgentUpdateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentUpdateResponse>} Successful response
   *
   * @example
   * ```ts
   * const update = await client.agents.update('id', {
   *   name: 'x',
   *   description: '',
   * });
   * ```
   */
  update(id: string, body: AgentUpdateParams, options?: RequestOptions): APIPromise<AgentUpdateResponse> {
    return this._client.patch(__scalarPath`/agents/${id}`, { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentDeleteResponse>} Successful response
   *
   * @example
   * ```ts
   * const delete_ = await client.agents.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<AgentDeleteResponse> {
    return this._client.delete(__scalarPath`/agents/${id}`, options);
  }

  /**
   * @param {string} id
   * @param {AgentHistoryParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentHistoryResponse>} Successful response
   *
   * @example
   * ```ts
   * const history = await client.agents.history('id', {
   *   limit: 50,
   * });
   * ```
   */
  history(
    id: string,
    query: AgentHistoryParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<AgentHistoryResponse> {
    return this._client.get(__scalarPath`/agents/${id}/history`, { query, ...options });
  }

  /**
   * @param {string} id
   * @param {AgentActivityParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentActivityResponse>} Successful response
   *
   * @example
   * ```ts
   * const activity = await client.agents.activity('id', {
   *   limit: 50,
   * });
   * ```
   */
  activity(
    id: string,
    query: AgentActivityParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<AgentActivityResponse> {
    return this._client.get(__scalarPath`/agents/${id}/activity`, { query, ...options });
  }

  /**
   * @param {string} id
   * @param {AgentDeployParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentDeployResponse>} Successful response
   *
   * @example
   * ```ts
   * const deploy = await client.agents.deploy('id', {
   *   versionId: 'x',
   *   clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
   * });
   * ```
   */
  deploy(id: string, body: AgentDeployParams, options?: RequestOptions): APIPromise<AgentDeployResponse> {
    return this._client.post(__scalarPath`/agents/${id}/deploy`, { body, ...options });
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentPauseResponse>} Successful response
   *
   * @example
   * ```ts
   * const pause = await client.agents.pause('id');
   * ```
   */
  pause(id: string, options?: RequestOptions): APIPromise<AgentPauseResponse> {
    return this._client.post(__scalarPath`/agents/${id}/pause`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentResumeResponse>} Successful response
   *
   * @example
   * ```ts
   * const resume = await client.agents.resume('id');
   * ```
   */
  resume(id: string, options?: RequestOptions): APIPromise<AgentResumeResponse> {
    return this._client.post(__scalarPath`/agents/${id}/resume`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentArchiveResponse>} Successful response
   *
   * @example
   * ```ts
   * const archive = await client.agents.archive('id');
   * ```
   */
  archive(id: string, options?: RequestOptions): APIPromise<AgentArchiveResponse> {
    return this._client.post(__scalarPath`/agents/${id}/archive`, options);
  }

  /**
   * @param {string} id
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentRestoreResponse>} Successful response
   *
   * @example
   * ```ts
   * const restore = await client.agents.restore('id');
   * ```
   */
  restore(id: string, options?: RequestOptions): APIPromise<AgentRestoreResponse> {
    return this._client.post(__scalarPath`/agents/${id}/restore`, options);
  }

  /**
   * @param {string} id
   * @param {AgentRunNowParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentRunNowResponse>} Successful response
   *
   * @example
   * ```ts
   * const runNow = await client.agents.runNow('id', {
   *   clientRequestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
   * });
   * ```
   */
  runNow(id: string, body: AgentRunNowParams, options?: RequestOptions): APIPromise<AgentRunNowResponse> {
    return this._client.post(__scalarPath`/agents/${id}/run`, { body, ...options });
  }
}

export type AgentListResponse = Array<AgentListResponse.AgentListResponseItem>;

export namespace AgentListResponse {
  export interface AgentListResponseItem {
    id: string;
    name: string;
    description: string | null;
    status: 'DRAFT' | 'DEPLOYING' | 'LIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
    createdAt: string;
    updatedAt: string;
    createdBy: AgentListResponseItem.CreatedBy;
    currentVersion: AgentListResponseItem.CurrentVersion | null;
    triggers: Array<AgentListResponseItem.Trigger>;
    runCount: number;
  }

  export namespace AgentListResponseItem {
    export interface CreatedBy {
      id: string;
      name: string;
      image: string | null;
    }

    export interface CurrentVersion {
      id: string;
      number: number;
      deployedAt: string | null;
    }

    export interface Trigger {
      id: string;
      type: 'MANUAL' | 'SCHEDULE' | 'EVENT' | 'WEBHOOK';
      name: string;
      nextRunAt: string | null;
    }
  }
}

export interface AgentReviseParams {
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  clientRequestId: string;
  channel?: AgentReviseParams.Channel;
  /**
   * @maxItems 20
   */
  actions?: Array<string>;
  /**
   * @maxItems 50
   */
  resources?: Array<AgentReviseParams.Resource>;
}

export namespace AgentReviseParams {
  export interface Channel {
    /**
     * @minLength 1
     * @maxLength 64
     */
    id: string;
    /**
     * @minLength 1
     * @maxLength 120
     */
    name: string;
  }

  export interface Resource {
    /**
     * @minLength 1
     * @maxLength 160
     */
    id: string;
    kind: 'company' | 'contact' | 'deal' | 'integration';
    /**
     * @minLength 1
     * @maxLength 160
     */
    label: string;
  }
}

export interface AgentReviseResponse {
  versionId: string;
}

export interface AgentFilesResponse {
  versionId: string | null;
  files: Array<AgentFilesResponse.File>;
}

export namespace AgentFilesResponse {
  export interface File {
    path: string;
    language: string;
    content: string;
    previousContent: string | null;
    revision: number;
  }
}

export interface AgentSaveFileParams {
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  clientRequestId: string;
  /**
   * @minLength 1
   * @maxLength 400
   */
  path: string;
  /**
   * @maxLength 500000
   */
  content: string;
}

export interface AgentSaveFileResponse {
  saved: boolean;
  versionId: string | null;
}

export interface AgentRetrieveResponse {
  id: string;
  name: string;
  description: string | null;
  status: 'DRAFT' | 'DEPLOYING' | 'LIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
  createdById: string;
  createdBy: AgentRetrieveResponse.CreatedBy;
  canManage: boolean;
  createdAt: string;
  updatedAt: string;
  currentVersion: AgentRetrieveResponse.CurrentVersion | null;
  reviewVersion: AgentRetrieveResponse.ReviewVersion | null;
  triggers: Array<AgentRetrieveResponse.Trigger>;
  runCount: number;
  capabilities: AgentRetrieveResponse.Capabilities | AgentRetrieveResponse.Capabilities2;
}

export namespace AgentRetrieveResponse {
  export interface CreatedBy {
    id: string;
    name: string;
    image: string | null;
  }

  export interface CurrentVersion {
    id: string;
    number: number;
    status: 'DRAFT' | 'VALIDATING' | 'READY' | 'DEPLOYED' | 'REJECTED';
    manifest: unknown;
    modelId: string;
    sandboxPolicy: unknown;
    approvedAt: string | null;
    deployedAt: string | null;
  }

  export interface ReviewVersion {
    id: string;
    number: number;
    status: 'DRAFT' | 'READY';
    manifest: ReviewVersion.Manifest;
    modelId: string;
    sandboxPolicy: unknown;
    sourceConversationId: string | null;
  }

  export namespace ReviewVersion {
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

  export interface Trigger {
    id: string;
    type: 'MANUAL' | 'SCHEDULE' | 'EVENT' | 'WEBHOOK';
    name: string;
    config: unknown;
    enabled: boolean;
    nextRunAt: string | null;
    lastRunAt: string | null;
  }

  export interface Capabilities {
    readable: false;
    problem: string;
    actions: Array<Capabilities.Action>;
    dataScope: null;
    channel: null;
  }

  export namespace Capabilities {
    export interface Action {
      /**
       * @minLength 1
       * @maxLength 120
       */
      type: string;
      /**
       * @minLength 1
       * @maxLength 60
       */
      provider: string;
      /**
       * @maxLength 400
       */
      summary: string;
      destination?: Action.Destination;
    }

    export namespace Action {
      export interface Destination {
        kind: 'channel' | 'user';
        /**
         * @minLength 1
         * @maxLength 120
         */
        id: string;
        /**
         * @minLength 1
         * @maxLength 120
         */
        label: string;
      }
    }
  }

  export interface Capabilities2 {
    readable: true;
    problem: null;
    actions: Array<Capabilities2.Action>;
    dataScope: Capabilities2.DataScope;
    channel: Capabilities2.Channel | null;
  }

  export namespace Capabilities2 {
    export interface Action {
      /**
       * @minLength 1
       * @maxLength 120
       */
      type: string;
      /**
       * @minLength 1
       * @maxLength 60
       */
      provider: string;
      /**
       * @maxLength 400
       */
      summary: string;
      destination?: Action.Destination;
    }

    export namespace Action {
      export interface Destination {
        kind: 'channel' | 'user';
        /**
         * @minLength 1
         * @maxLength 120
         */
        id: string;
        /**
         * @minLength 1
         * @maxLength 120
         */
        label: string;
      }
    }

    export interface DataScope {
      mode: 'SELECTED' | 'WORKSPACE';
      /**
       * @maxLength 400
       */
      summary: string;
      resources: Array<DataScope.Resource>;
    }

    export namespace DataScope {
      export interface Resource {
        /**
         * @minLength 1
         * @maxLength 160
         */
        id: string;
        kind: 'company' | 'contact' | 'deal' | 'integration';
        /**
         * @minLength 1
         * @maxLength 160
         */
        label: string;
      }
    }

    export interface Channel {
      kind: 'channel' | 'user';
      /**
       * @minLength 1
       * @maxLength 120
       */
      id: string;
      /**
       * @minLength 1
       * @maxLength 120
       */
      label: string;
    }
  }
}

export interface AgentUpdateParams {
  /**
   * @minLength 1
   * @maxLength 120
   */
  name: string;
  /**
   * @maxLength 500
   */
  description: string | null;
}

export interface AgentUpdateResponse {
  id: string;
  name: string;
  description: string | null;
  status: 'DRAFT' | 'DEPLOYING' | 'LIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
}

export interface AgentDeleteResponse {
  id: string;
  name: string;
  status: 'DELETED';
  updatedAt: string;
  disabledTriggers: number;
  cancelledRuns: number;
}

export interface AgentHistoryParams {
  /**
   * @default 50
   * @minimum 1
   * @maximum 100
   */
  limit?: number;
}

export type AgentHistoryResponse = Array<AgentHistoryResponse.AgentHistoryResponseItem>;

export namespace AgentHistoryResponse {
  export interface AgentHistoryResponseItem {
    id: string;
    status: 'QUEUED' | 'RUNNING' | 'WAITING_FOR_APPROVAL' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
    triggerType: 'MANUAL' | 'SCHEDULE' | 'EVENT' | 'WEBHOOK';
    summary: string | null;
    modelId: string | null;
    inputTokens: number | null;
    outputTokens: number | null;
    costUsd: string | null;
    errorCode: string | null;
    errorMessage: string | null;
    createdAt: string;
    startedAt: string | null;
    finishedAt: string | null;
    initiatedBy: AgentHistoryResponseItem.InitiatedBy | null;
    version: AgentHistoryResponseItem.Version;
    totalEvents: number;
    eventsTruncated: boolean;
    canCancel: boolean;
    events: Array<AgentHistoryResponseItem.Event>;
    actions: Array<AgentHistoryResponseItem.Action>;
  }

  export namespace AgentHistoryResponseItem {
    export interface InitiatedBy {
      id: string;
      name: string;
      image: string | null;
    }

    export interface Version {
      id: string;
      number: number;
    }

    export interface Event {
      id: string;
      sequence: number;
      type: string;
      data: unknown;
      emittedAt: string;
    }

    export interface Action {
      id: string;
      type: string;
      provider: string;
      targetType: string | null;
      targetId: string | null;
      targetLabel: string | null;
      summary: string;
      status: 'PLANNED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
      externalId: string | null;
      attemptCount: number;
      errorCode: string | null;
      errorMessage: string | null;
      plannedAt: string;
      startedAt: string | null;
      completedAt: string | null;
    }
  }
}

export interface AgentActivityParams {
  /**
   * @default 50
   * @minimum 1
   * @maximum 100
   */
  limit?: number;
}

export type AgentActivityResponse = Array<AgentActivityResponse.AgentActivityResponseItem>;

export namespace AgentActivityResponse {
  export interface AgentActivityResponseItem {
    id: string;
    type: string;
    summary: string;
    before: unknown | null;
    after: unknown | null;
    requestId: string | null;
    emittedAt: string;
    actorType: string;
    actorId: string | null;
    actorUser: AgentActivityResponseItem.ActorUser | null;
    version: AgentActivityResponseItem.Version | null;
  }

  export namespace AgentActivityResponseItem {
    export interface ActorUser {
      id: string;
      name: string;
      image: string | null;
    }

    export interface Version {
      id: string;
      number: number;
    }
  }
}

export interface AgentDeployParams {
  /**
   * @minLength 1
   */
  versionId: string;
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  clientRequestId: string;
}

export interface AgentDeployResponse {
  id: string;
  versionId: string;
  status: 'LIVE';
}

export interface AgentPauseResponse {
  id: string;
  name: string;
  status: 'PAUSED';
  updatedAt: string;
}

export interface AgentResumeResponse {
  id: string;
  name: string;
  status: 'LIVE';
  updatedAt: string;
}

export interface AgentArchiveResponse {
  id: string;
  name: string;
  status: 'ARCHIVED';
  updatedAt: string;
}

export interface AgentRestoreResponse {
  id: string;
  name: string;
  status: 'PAUSED';
  updatedAt: string;
}

export interface AgentRunNowParams {
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  clientRequestId: string;
}

export interface AgentRunNowResponse {
  id: string;
}
Agents.Runs = Runs;

export declare namespace Agents {
  export {
    type AgentListResponse as AgentListResponse,
    type AgentReviseResponse as AgentReviseResponse,
    type AgentFilesResponse as AgentFilesResponse,
    type AgentSaveFileResponse as AgentSaveFileResponse,
    type AgentRetrieveResponse as AgentRetrieveResponse,
    type AgentUpdateResponse as AgentUpdateResponse,
    type AgentDeleteResponse as AgentDeleteResponse,
    type AgentHistoryResponse as AgentHistoryResponse,
    type AgentActivityResponse as AgentActivityResponse,
    type AgentDeployResponse as AgentDeployResponse,
    type AgentPauseResponse as AgentPauseResponse,
    type AgentResumeResponse as AgentResumeResponse,
    type AgentArchiveResponse as AgentArchiveResponse,
    type AgentRestoreResponse as AgentRestoreResponse,
    type AgentRunNowResponse as AgentRunNowResponse,
    type AgentReviseParams as AgentReviseParams,
    type AgentSaveFileParams as AgentSaveFileParams,
    type AgentUpdateParams as AgentUpdateParams,
    type AgentHistoryParams as AgentHistoryParams,
    type AgentActivityParams as AgentActivityParams,
    type AgentDeployParams as AgentDeployParams,
    type AgentRunNowParams as AgentRunNowParams,
  };

  export {
    Runs as Runs,
    type RunRetryResponse as RunRetryResponse,
    type RunCancelResponse as RunCancelResponse,
    type RunRetryParams as RunRetryParams,
    type RunCancelParams as RunCancelParams,
  };
}
