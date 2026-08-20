// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { path as __scalarPath } from '../internal/utils/path';

export class Sso extends APIResource {
  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SsoSignInOptionsResponse>} Successful response
   *
   * @example
   * ```ts
   * const signInOptions = await client.sso.signInOptions();
   * ```
   */
  signInOptions(options?: RequestOptions): APIPromise<SsoSignInOptionsResponse> {
    return this._client.get('/sso/sign-in-options', options);
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SsoSettingsResponse>} Successful response
   *
   * @example
   * ```ts
   * const settings = await client.sso.settings();
   * ```
   */
  settings(options?: RequestOptions): APIPromise<SsoSettingsResponse> {
    return this._client.get('/sso/settings', options);
  }

  /**
   * @param {SsoListParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SsoListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.sso.list({
   *   q: '',
   *   sort: '',
   *   dir: 'asc',
   *   page: 1,
   *   pageSize: 25,
   * });
   * ```
   */
  list(query: SsoListParams | null | undefined = {}, options?: RequestOptions): APIPromise<SsoListResponse> {
    return this._client.get('/sso', { query, ...options });
  }

  /**
   * @param {SsoRegisterParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SsoRegisterResponse>} Successful response
   *
   * @example
   * ```ts
   * const register = await client.sso.register({
   *   providerId: 'x',
   *   issuer: 'https://example.com',
   *   domain: 'x',
   *   clientId: 'x',
   *   clientSecret: 'x',
   * });
   * ```
   */
  register(body: SsoRegisterParams, options?: RequestOptions): APIPromise<SsoRegisterResponse> {
    return this._client.post('/sso', { body, ...options });
  }

  /**
   * @param {string} providerID
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SsoDeleteResponse>} Successful response
   *
   * @example
   * ```ts
   * const delete_ = await client.sso.delete('providerId');
   * ```
   */
  delete(providerID: string, options?: RequestOptions): APIPromise<SsoDeleteResponse> {
    return this._client.delete(__scalarPath`/sso/${providerID}`, options);
  }
}

export interface SsoSignInOptionsResponse {
  google: boolean;
  microsoft: boolean;
  providers: Array<SsoSignInOptionsResponse.Provider>;
}

export namespace SsoSignInOptionsResponse {
  export interface Provider {
    providerId: string;
    name: string;
  }
}

export interface SsoSettingsResponse {
  canConfigure: boolean;
  callbackBase: string;
}

export interface SsoListParams {
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
}

export interface SsoListResponse {
  rows: Array<SsoListResponse.Row>;
  total: number;
  facetCounts: Record<string, Record<string, number>>;
}

export namespace SsoListResponse {
  export interface Row {
    providerId: string;
    name: string;
    type: 'oidc' | 'saml';
    issuer: string;
    domains: Array<string>;
    clientIdLastFour: string | null;
    callbackURL: string;
  }
}

export interface SsoRegisterParams {
  /**
   * @minLength 1
   * @maxLength 64
   * @pattern ^[a-z0-9][a-z0-9-]*$
   */
  providerId: string;
  /**
   * @format uri
   * @maxLength 512
   */
  issuer: string;
  /**
   * @minLength 1
   * @maxLength 255
   */
  domain: string;
  /**
   * @minLength 1
   * @maxLength 512
   */
  clientId: string;
  /**
   * @minLength 1
   * @maxLength 1024
   */
  clientSecret: string;
}

export interface SsoRegisterResponse {
  providerId: string;
  name: string;
  type: 'oidc' | 'saml';
  issuer: string;
  domains: Array<string>;
  clientIdLastFour: string | null;
  callbackURL: string;
}

export interface SsoDeleteResponse {
  providerId: string;
}
export declare namespace Sso {
  export {
    type SsoSignInOptionsResponse as SsoSignInOptionsResponse,
    type SsoSettingsResponse as SsoSettingsResponse,
    type SsoListResponse as SsoListResponse,
    type SsoRegisterResponse as SsoRegisterResponse,
    type SsoDeleteResponse as SsoDeleteResponse,
    type SsoListParams as SsoListParams,
    type SsoRegisterParams as SsoRegisterParams,
  };
}
