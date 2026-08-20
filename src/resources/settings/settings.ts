// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import * as AgentModelAPI from './agent-model';
import {
  AgentModel,
  type AgentModelListResponse,
  type AgentModelSetResponse,
  type AgentModelSetParams,
} from './agent-model';
import * as ResearchKeyAPI from './research-key';
import {
  ResearchKey,
  type ResearchKeyListResponse,
  type ResearchKeySetResponse,
  type ResearchKeySetParams,
} from './research-key';
import * as ArchiveRetentionAPI from './archive-retention';
import {
  ArchiveRetention,
  type ArchiveRetentionListResponse,
  type ArchiveRetentionSetResponse,
  type ArchiveRetentionSetParams,
} from './archive-retention';

export class Settings extends APIResource {
  agentModel: AgentModelAPI.AgentModel = new AgentModelAPI.AgentModel(this._client);
  researchKey: ResearchKeyAPI.ResearchKey = new ResearchKeyAPI.ResearchKey(this._client);
  archiveRetention: ArchiveRetentionAPI.ArchiveRetention = new ArchiveRetentionAPI.ArchiveRetention(
    this._client,
  );

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SettingModelCatalogResponse>} Successful response
   *
   * @example
   * ```ts
   * const modelCatalog = await client.settings.modelCatalog();
   * ```
   */
  modelCatalog(options?: RequestOptions): APIPromise<SettingModelCatalogResponse> {
    return this._client.get('/settings/model-catalog', options);
  }
}

export interface SettingModelCatalogResponse {
  models: Array<SettingModelCatalogResponse.Model>;
  available: boolean;
}

export namespace SettingModelCatalogResponse {
  export interface Model {
    id: string;
    name: string;
    provider: string;
    contextWindowTokens: number;
    pricing: Model.Pricing | null;
  }

  export namespace Model {
    export interface Pricing {
      input: number;
      output: number;
    }
  }
}
Settings.AgentModel = AgentModel;
Settings.ResearchKey = ResearchKey;
Settings.ArchiveRetention = ArchiveRetention;

export declare namespace Settings {
  export { type SettingModelCatalogResponse as SettingModelCatalogResponse };

  export {
    AgentModel as AgentModel,
    type AgentModelListResponse as AgentModelListResponse,
    type AgentModelSetResponse as AgentModelSetResponse,
    type AgentModelSetParams as AgentModelSetParams,
  };

  export {
    ResearchKey as ResearchKey,
    type ResearchKeyListResponse as ResearchKeyListResponse,
    type ResearchKeySetResponse as ResearchKeySetResponse,
    type ResearchKeySetParams as ResearchKeySetParams,
  };

  export {
    ArchiveRetention as ArchiveRetention,
    type ArchiveRetentionListResponse as ArchiveRetentionListResponse,
    type ArchiveRetentionSetResponse as ArchiveRetentionSetResponse,
    type ArchiveRetentionSetParams as ArchiveRetentionSetParams,
  };
}
