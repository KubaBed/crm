// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import * as MembersAPI from './members';
import {
  Members,
  type MemberSearchResponse,
  type MemberSetRoleResponse,
  type MemberSearchParams,
  type MemberSetRoleParams,
} from './members';

export class Workspace extends APIResource {
  members: MembersAPI.Members = new MembersAPI.Members(this._client);

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<WorkspaceListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.workspace.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<WorkspaceListResponse> {
    return this._client.get('/workspace', options);
  }

  /**
   * @param {WorkspaceUpdateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<WorkspaceUpdateResponse>} Successful response
   *
   * @example
   * ```ts
   * const update = await client.workspace.update({
   *   name: 'x',
   *   website: 'x',
   * });
   * ```
   */
  update(body: WorkspaceUpdateParams, options?: RequestOptions): APIPromise<WorkspaceUpdateResponse> {
    return this._client.patch('/workspace', { body, ...options });
  }
}

export interface WorkspaceListResponse {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  onboarded: boolean;
  viewerRole: 'owner' | 'admin' | 'member' | null;
  canRename: boolean;
  canChangeRoles: boolean;
}

export interface WorkspaceUpdateParams {
  /**
   * @minLength 1
   * @maxLength 120
   */
  name: string;
  /**
   * @minLength 1
   * @maxLength 255
   */
  website: string;
  /**
   * @minLength 1
   * @maxLength 48
   * @pattern ^[a-z0-9]+(?:-[a-z0-9]+)*$
   */
  slug?: string;
}

export interface WorkspaceUpdateResponse {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  onboarded: boolean;
  viewerRole: 'owner' | 'admin' | 'member' | null;
  canRename: boolean;
  canChangeRoles: boolean;
}
Workspace.Members = Members;

export declare namespace Workspace {
  export {
    type WorkspaceListResponse as WorkspaceListResponse,
    type WorkspaceUpdateResponse as WorkspaceUpdateResponse,
    type WorkspaceUpdateParams as WorkspaceUpdateParams,
  };

  export {
    Members as Members,
    type MemberSearchResponse as MemberSearchResponse,
    type MemberSetRoleResponse as MemberSetRoleResponse,
    type MemberSearchParams as MemberSearchParams,
    type MemberSetRoleParams as MemberSetRoleParams,
  };
}
