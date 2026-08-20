// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { path as __scalarPath } from '../../internal/utils/path';

export class Members extends APIResource {
  /**
   * @param {MemberSearchParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<MemberSearchResponse>} Successful response
   *
   * @example
   * ```ts
   * const search = await client.workspace.members.search({
   *   q: '',
   *   sort: '',
   *   dir: 'asc',
   *   page: 1,
   *   pageSize: 25,
   *   role: [],
   * });
   * ```
   */
  search(body: MemberSearchParams, options?: RequestOptions): APIPromise<MemberSearchResponse> {
    return this._client.post('/workspace/members/search', { body, ...options });
  }

  /**
   * @param {string} memberID
   * @param {MemberSetRoleParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<MemberSetRoleResponse>} Successful response
   *
   * @example
   * ```ts
   * const setRole = await client.workspace.members.setRole('memberId', {
   *   role: 'owner',
   * });
   * ```
   */
  setRole(
    memberID: string,
    body: MemberSetRoleParams,
    options?: RequestOptions,
  ): APIPromise<MemberSetRoleResponse> {
    return this._client.patch(__scalarPath`/workspace/members/${memberID}/role`, { body, ...options });
  }
}

export interface MemberSearchParams {
  /**
   * @default ""
   */
  q?: string;
  /**
   * @default ""
   */
  sort?: string;
  /**
   * @default asc
   */
  dir?: 'asc' | 'desc';
  /**
   * @default 1
   * @minimum 1
   * @maximum 9007199254740991
   */
  page?: number;
  /**
   * @default 25
   * @minimum 1
   * @maximum 100
   */
  pageSize?: number;
  /**
   * @default []
   */
  role?: Array<string>;
}

export interface MemberSearchResponse {
  rows: Array<MemberSearchResponse.Row>;
  total: number;
  facetCounts: Record<string, Record<string, number>>;
}

export namespace MemberSearchResponse {
  export interface Row {
    id: string;
    userId: string;
    name: string;
    email: string;
    image: string | null;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
    isViewer: boolean;
  }
}

export interface MemberSetRoleParams {
  role: 'owner' | 'admin' | 'member';
}

export interface MemberSetRoleResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  isViewer: boolean;
}
export declare namespace Members {
  export {
    type MemberSearchResponse as MemberSearchResponse,
    type MemberSetRoleResponse as MemberSetRoleResponse,
    type MemberSearchParams as MemberSearchParams,
    type MemberSetRoleParams as MemberSetRoleParams,
  };
}
