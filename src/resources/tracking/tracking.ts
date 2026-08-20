// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { buildHeaders } from '../../internal/headers';
import { path as __scalarPath } from '../../internal/utils/path';
import * as DomainsAPI from './domains';
import { Domains, type DomainCreateResponse, type DomainCreateParams } from './domains';

export class Tracking extends APIResource {
  domains: DomainsAPI.Domains = new DomainsAPI.Domains(this._client);

  /**
   * Fetch a site's compiled tracking config, for the tracking script
   *
   * @param {string} siteID - Public site identifier.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns The compiled config, or null if the site is unknown.
   *
   * @example
   * ```ts
   * await client.tracking.controllerPublicConfig('siteId');
   * ```
   */
  controllerPublicConfig(siteID: string, options?: RequestOptions): APIPromise<void> {
    return this._client.get(__scalarPath`/api/t/config/${siteID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Ingest a batch of events from the tracking script
   *
   * @param {TrackingControllerCollectParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns Always returned, even when the batch was rejected or unreadable.
   *
   * @example
   * ```ts
   * await client.tracking.controllerCollect({
   *   origin: 'origin',
   *   'user-agent': 'userAgent',
   * });
   * ```
   */
  controllerCollect(params: TrackingControllerCollectParams, options?: RequestOptions): APIPromise<void> {
    const { origin, 'user-agent': userAgent } = params;
    return this._client.post('/api/t/e', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*', origin: origin, 'user-agent': userAgent }, options?.headers]),
    });
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<TrackingSettingsResponse>} Successful response
   *
   * @example
   * ```ts
   * const settings = await client.tracking.settings();
   * ```
   */
  settings(options?: RequestOptions): APIPromise<TrackingSettingsResponse> {
    return this._client.get('/tracking/settings', options);
  }

  /**
   * @param {TrackingSetFlagParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<unknown>} Successful response
   *
   * @example
   * ```ts
   * const unknown_ = await client.tracking.setFlag({
   *   flag: 'crossDomain',
   *   enabled: false,
   * });
   * ```
   */
  setFlag(body: TrackingSetFlagParams, options?: RequestOptions): APIPromise<unknown> {
    return this._client.patch('/tracking/flags', { body, ...options });
  }

  /**
   * @param {TrackingSetCookieLifetimeParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<unknown>} Successful response
   *
   * @example
   * ```ts
   * const unknown_ = await client.tracking.setCookieLifetime({
   *   days: 0,
   * });
   * ```
   */
  setCookieLifetime(body: TrackingSetCookieLifetimeParams, options?: RequestOptions): APIPromise<unknown> {
    return this._client.patch('/tracking/cookie-lifetime', { body, ...options });
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<TrackingRotateSiteIDResponse>} Successful response
   *
   * @example
   * ```ts
   * const rotateSiteID = await client.tracking.rotateSiteID();
   * ```
   */
  rotateSiteID(options?: RequestOptions): APIPromise<TrackingRotateSiteIDResponse> {
    return this._client.post('/tracking/site-id/rotate', options);
  }

  /**
   * @param {TrackingVerifyParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<TrackingVerifyResponse>} Successful response
   *
   * @example
   * ```ts
   * const verify = await client.tracking.verify({
   *   url: 'x',
   * });
   * ```
   */
  verify(body: TrackingVerifyParams, options?: RequestOptions): APIPromise<TrackingVerifyResponse> {
    return this._client.post('/tracking/verify', { body, ...options });
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<TrackingSourcesResponse>} Successful response
   *
   * @example
   * ```ts
   * const sources = await client.tracking.sources();
   * ```
   */
  sources(options?: RequestOptions): APIPromise<TrackingSourcesResponse> {
    return this._client.get('/tracking/sources', options);
  }

  /**
   * @param {string} companyID
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<TrackingCompanyActivityResponse>} Successful response
   *
   * @example
   * ```ts
   * const companyActivity = await client.tracking.companyActivity('companyId');
   * ```
   */
  companyActivity(companyID: string, options?: RequestOptions): APIPromise<TrackingCompanyActivityResponse> {
    return this._client.get(__scalarPath`/tracking/companies/${companyID}/activity`, options);
  }

  /**
   * @param {string} contactID
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<TrackingContactActivityResponse>} Successful response
   *
   * @example
   * ```ts
   * const contactActivity = await client.tracking.contactActivity('contactId');
   * ```
   */
  contactActivity(contactID: string, options?: RequestOptions): APIPromise<TrackingContactActivityResponse> {
    return this._client.get(__scalarPath`/tracking/contacts/${contactID}/activity`, options);
  }
}

export interface TrackingControllerCollectParams {
  origin: string;
  'user-agent': string;
}

export interface TrackingSettingsResponse {
  siteId: string | null;
  ready: boolean;
  scriptUrl: string;
  snippet: string | null;
  tagManagerSnippet: string | null;
  crossDomain: boolean;
  limitToDomains: boolean;
  cookieSubdomains: boolean;
  secureCookies: boolean;
  honourDnt: boolean;
  cookieDays: number;
  paused: boolean;
  cookieLifetimes: Array<TrackingSettingsResponse.CookieLifetime>;
  domains: Array<TrackingSettingsResponse.Domain>;
  receivingSince: string | null;
  pageViews: number;
  submissions: number;
  canManage: boolean;
}

export namespace TrackingSettingsResponse {
  export interface CookieLifetime {
    days: number;
    label: string;
  }

  export interface Domain {
    id: string;
    host: string;
    scope: 'SITE_AND_SUBDOMAINS' | 'EXACT_HOST';
    pageViews: number;
    lastSeenAt: string | null;
  }
}

export interface TrackingSetFlagParams {
  flag: 'crossDomain' | 'limitToDomains' | 'cookieSubdomains' | 'secureCookies' | 'honourDnt' | 'paused';
  enabled: boolean;
}

export interface TrackingSetCookieLifetimeParams {
  /**
   * @minimum 0
   * @maximum 400
   */
  days: number;
}

export interface TrackingRotateSiteIDResponse {
  siteId: string;
}

export interface TrackingVerifyParams {
  /**
   * @minLength 1
   * @maxLength 2048
   */
  url: string;
}

export type TrackingVerifyResponse =
  | TrackingVerifyResponse.TrackingVerifyResponseItem
  | TrackingVerifyResponse.TrackingVerifyResponseItem2
  | TrackingVerifyResponse.TrackingVerifyResponseItem3;

export namespace TrackingVerifyResponse {
  export interface TrackingVerifyResponseItem {
    status: 'found';
    host: string;
    responseMs: number;
    allowed: boolean;
    pageView: boolean;
    container: TrackingVerifyResponseItem.Container | null;
  }

  export namespace TrackingVerifyResponseItem {
    export interface Container {
      id: string;
      carriesSiteId: boolean;
    }
  }

  export interface TrackingVerifyResponseItem2 {
    status: 'missing';
    host: string;
    responseMs: number;
    containers: Array<string>;
  }

  export interface TrackingVerifyResponseItem3 {
    status: 'unreachable';
    host: string;
    detail: string;
  }
}

export type TrackingSourcesResponse = Array<TrackingSourcesResponse.TrackingSourcesResponseItem>;

export namespace TrackingSourcesResponse {
  export interface TrackingSourcesResponseItem {
    source: string;
    medium: string | null;
    views: number;
    contacts: number;
  }
}

export interface TrackingCompanyActivityResponse {
  identified: boolean;
  visitors: number;
  views: number;
  lastSeenAt: string | null;
  pages: Array<TrackingCompanyActivityResponse.Page>;
  firstTouch: TrackingCompanyActivityResponse.FirstTouch | null;
  lastTouch: TrackingCompanyActivityResponse.LastTouch | null;
}

export namespace TrackingCompanyActivityResponse {
  export interface Page {
    host: string;
    path: string;
    views: number;
    lastSeenAt: string;
  }

  export interface FirstTouch {
    label: string;
    source: string;
    medium: string | null;
    campaign: string | null;
    landing: string | null;
    referrer: string | null;
    at: string | null;
  }

  export interface LastTouch {
    label: string;
    source: string;
    medium: string | null;
    campaign: string | null;
    landing: string | null;
    referrer: string | null;
    at: string | null;
  }
}

export interface TrackingContactActivityResponse {
  identified: boolean;
  visitors: number;
  views: number;
  lastSeenAt: string | null;
  pages: Array<TrackingContactActivityResponse.Page>;
  firstTouch: TrackingContactActivityResponse.FirstTouch | null;
  lastTouch: TrackingContactActivityResponse.LastTouch | null;
}

export namespace TrackingContactActivityResponse {
  export interface Page {
    host: string;
    path: string;
    views: number;
    lastSeenAt: string;
  }

  export interface FirstTouch {
    label: string;
    source: string;
    medium: string | null;
    campaign: string | null;
    landing: string | null;
    referrer: string | null;
    at: string | null;
  }

  export interface LastTouch {
    label: string;
    source: string;
    medium: string | null;
    campaign: string | null;
    landing: string | null;
    referrer: string | null;
    at: string | null;
  }
}
Tracking.Domains = Domains;

export declare namespace Tracking {
  export {
    type TrackingSettingsResponse as TrackingSettingsResponse,
    type TrackingRotateSiteIDResponse as TrackingRotateSiteIDResponse,
    type TrackingVerifyResponse as TrackingVerifyResponse,
    type TrackingSourcesResponse as TrackingSourcesResponse,
    type TrackingCompanyActivityResponse as TrackingCompanyActivityResponse,
    type TrackingContactActivityResponse as TrackingContactActivityResponse,
    type TrackingControllerCollectParams as TrackingControllerCollectParams,
    type TrackingSetFlagParams as TrackingSetFlagParams,
    type TrackingSetCookieLifetimeParams as TrackingSetCookieLifetimeParams,
    type TrackingVerifyParams as TrackingVerifyParams,
  };

  export {
    Domains as Domains,
    type DomainCreateResponse as DomainCreateResponse,
    type DomainCreateParams as DomainCreateParams,
  };
}
