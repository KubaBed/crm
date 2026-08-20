// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { path as __scalarPath } from '../../internal/utils/path';

export class Contacts extends APIResource {
  /**
   * @param {string} dealID
   * @param {ContactAttachParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactAttachResponse>} Successful response
   *
   * @example
   * ```ts
   * const attach = await client.deals.contacts.attach('dealId', {
   *   contactId: 'x',
   * });
   * ```
   */
  attach(
    dealID: string,
    body: ContactAttachParams,
    options?: RequestOptions,
  ): APIPromise<ContactAttachResponse> {
    return this._client.post(__scalarPath`/deals/${dealID}/contacts`, { body, ...options });
  }

  /**
   * @param {string} contactID
   * @param {ContactDetachParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactDetachResponse>} Successful response
   *
   * @example
   * ```ts
   * const detach = await client.deals.contacts.detach('contactId', {
   *   dealId: 'dealId',
   * });
   * ```
   */
  detach(
    contactID: string,
    params: ContactDetachParams,
    options?: RequestOptions,
  ): APIPromise<ContactDetachResponse> {
    const { dealId } = params;
    return this._client.delete(__scalarPath`/deals/${dealId}/contacts/${contactID}`, options);
  }

  /**
   * @param {string} contactID
   * @param {ContactSetRoleParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ContactSetRoleResponse>} Successful response
   *
   * @example
   * ```ts
   * const setRole = await client.deals.contacts.setRole('contactId', {
   *   dealId: 'dealId',
   *   role: '',
   * });
   * ```
   */
  setRole(
    contactID: string,
    params: ContactSetRoleParams,
    options?: RequestOptions,
  ): APIPromise<ContactSetRoleResponse> {
    const { dealId, ...body } = params;
    return this._client.patch(__scalarPath`/deals/${dealId}/contacts/${contactID}/role`, {
      body,
      ...options,
    });
  }
}

export interface ContactAttachParams {
  /**
   * @minLength 1
   */
  contactId: string;
  /**
   * @maxLength 80
   */
  role?: string | null;
}

export interface ContactAttachResponse {
  dealId: string;
  contactId: string;
}

export interface ContactDetachParams {
  dealId: string;
}

export interface ContactDetachResponse {
  dealId: string;
  contactId: string;
}

export interface ContactSetRoleParams {
  /**
   * Path param
   */
  dealId: string;
  /**
   * Body param
   * @maxLength 80
   */
  role: string | null;
}

export interface ContactSetRoleResponse {
  dealId: string;
  contactId: string;
  role: string | null;
}
export declare namespace Contacts {
  export {
    type ContactAttachResponse as ContactAttachResponse,
    type ContactDetachResponse as ContactDetachResponse,
    type ContactSetRoleResponse as ContactSetRoleResponse,
    type ContactAttachParams as ContactAttachParams,
    type ContactDetachParams as ContactDetachParams,
    type ContactSetRoleParams as ContactSetRoleParams,
  };
}
