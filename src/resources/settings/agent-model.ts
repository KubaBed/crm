// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';

export class AgentModel extends APIResource {
  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentModelListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.settings.agentModel.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<AgentModelListResponse> {
    return this._client.get('/settings/agent-model', options);
  }

  /**
   * @param {AgentModelSetParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<AgentModelSetResponse>} Successful response
   *
   * @example
   * ```ts
   * const set_ = await client.settings.agentModel.set({
   *   modelId: 'x',
   * });
   * ```
   */
  set(body: AgentModelSetParams, options?: RequestOptions): APIPromise<AgentModelSetResponse> {
    return this._client.patch('/settings/agent-model', { body, ...options });
  }
}

export interface AgentModelListResponse {
  selectedId: string | null;
  effectiveId: string;
  defaultId: string;
  effective: AgentModelListResponse.Effective | null;
  updatedAt: string | null;
}

export namespace AgentModelListResponse {
  export interface Effective {
    id: string;
    name: string;
    provider: string;
    contextWindowTokens: number;
    pricing: Effective.Pricing | null;
  }

  export namespace Effective {
    export interface Pricing {
      input: number;
      output: number;
    }
  }
}

export interface AgentModelSetParams {
  /**
   * @minLength 1
   * @maxLength 200
   */
  modelId: string | null;
}

export interface AgentModelSetResponse {
  selectedId: string | null;
  effectiveId: string;
  defaultId: string;
  effective: AgentModelSetResponse.Effective | null;
  updatedAt: string | null;
}

export namespace AgentModelSetResponse {
  export interface Effective {
    id: string;
    name: string;
    provider: string;
    contextWindowTokens: number;
    pricing: Effective.Pricing | null;
  }

  export namespace Effective {
    export interface Pricing {
      input: number;
      output: number;
    }
  }
}
export declare namespace AgentModel {
  export {
    type AgentModelListResponse as AgentModelListResponse,
    type AgentModelSetResponse as AgentModelSetResponse,
    type AgentModelSetParams as AgentModelSetParams,
  };
}
