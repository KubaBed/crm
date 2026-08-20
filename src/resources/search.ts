// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';

export class Search extends APIResource {
  /**
   * @param {SearchQuickParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SearchQuickResponse>} Successful response
   *
   * @example
   * ```ts
   * const quick = await client.search.quick({
   *   q: '',
   * });
   * ```
   */
  quick(
    query: SearchQuickParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<SearchQuickResponse> {
    return this._client.get('/search', { query, ...options });
  }
}

export interface SearchQuickParams {
  /**
   * @default ""
   */
  q?: string;
}

export interface SearchQuickResponse {
  hits: Array<SearchQuickResponse.Hit>;
}

export namespace SearchQuickResponse {
  export interface Hit {
    kind: 'company' | 'contact' | 'deal';
    id: string;
    label: string;
    detail: string | null;
    iconUrl: string | null;
    iconDarkUrl: string | null;
    iconTone: string | null;
    imageUrl: string | null;
  }
}
export declare namespace Search {
  export { type SearchQuickResponse as SearchQuickResponse, type SearchQuickParams as SearchQuickParams };
}
