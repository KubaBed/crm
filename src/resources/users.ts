// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';

export class Users extends APIResource {
  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<UserListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.users.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<UserListResponse> {
    return this._client.get('/users', options);
  }
}

export type UserListResponse = Array<UserListResponse.UserListResponseItem>;

export namespace UserListResponse {
  export interface UserListResponseItem {
    id: string;
    name: string;
    email: string;
    image: string | null;
  }
}
export declare namespace Users {
  export { type UserListResponse as UserListResponse };
}
