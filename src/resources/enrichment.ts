// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';

export class Enrichment extends APIResource {
  /**
   * @param {EnrichmentQueueParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<EnrichmentQueueResponse>} Successful response
   *
   * @example
   * ```ts
   * const queue = await client.enrichment.queue({
   *   limit: 20,
   * });
   * ```
   */
  queue(
    query: EnrichmentQueueParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<EnrichmentQueueResponse> {
    return this._client.get('/enrichment/queue', { query, ...options });
  }
}

export interface EnrichmentQueueParams {
  /**
   * @default 20
   * @minimum 1
   * @maximum 200
   */
  limit?: number;
}

export interface EnrichmentQueueResponse {
  rows: Array<EnrichmentQueueResponse.Row>;
  total: number;
  scheduled: Array<EnrichmentQueueResponse.Scheduled>;
  scheduledTotal: number;
}

export namespace EnrichmentQueueResponse {
  export interface Row {
    id: string;
    state: 'running' | 'queued' | 'failed';
    line: string;
    startedAt: string | null;
    subject: Row.Subject | Row.Subject2;
  }

  export namespace Row {
    export interface Subject {
      kind: 'contact';
      id: string;
      name: string;
      email: string | null;
      imageUrl: string | null;
    }

    export interface Subject2 {
      kind: 'company';
      id: string;
      name: string;
      logoUrl: string | null;
      logoDarkUrl: string | null;
      logoTone: string | null;
    }
  }

  export interface Scheduled {
    id: string;
    due: string;
    subject: Scheduled.Subject | Scheduled.Subject2;
  }

  export namespace Scheduled {
    export interface Subject {
      kind: 'contact';
      id: string;
      name: string;
      email: string | null;
      imageUrl: string | null;
    }

    export interface Subject2 {
      kind: 'company';
      id: string;
      name: string;
      logoUrl: string | null;
      logoDarkUrl: string | null;
      logoTone: string | null;
    }
  }
}
export declare namespace Enrichment {
  export {
    type EnrichmentQueueResponse as EnrichmentQueueResponse,
    type EnrichmentQueueParams as EnrichmentQueueParams,
  };
}
