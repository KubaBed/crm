// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { path as __scalarPath } from '../../internal/utils/path';

export class Rates extends APIResource {
  /**
   * @param {string} currency
   * @param {RateSetManualParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<RateSetManualResponse>} Successful response
   *
   * @example
   * ```ts
   * const setManual = await client.currency.rates.setManual('currency', {
   *   rate: 0,
   * });
   * ```
   */
  setManual(
    currency: string,
    body: RateSetManualParams,
    options?: RequestOptions,
  ): APIPromise<RateSetManualResponse> {
    return this._client.put(__scalarPath`/currency/rates/${currency}`, { body, ...options });
  }

  /**
   * @param {string} currency
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<RateDeleteManualResponse>} Successful response
   *
   * @example
   * ```ts
   * const deleteManual = await client.currency.rates.deleteManual('currency');
   * ```
   */
  deleteManual(currency: string, options?: RequestOptions): APIPromise<RateDeleteManualResponse> {
    return this._client.delete(__scalarPath`/currency/rates/${currency}`, options);
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<RateRefreshResponse>} Successful response
   *
   * @example
   * ```ts
   * const refresh = await client.currency.rates.refresh();
   * ```
   */
  refresh(options?: RequestOptions): APIPromise<RateRefreshResponse> {
    return this._client.post('/currency/rates/refresh', options);
  }
}

export interface RateSetManualParams {
  rate: number;
}

export interface RateSetManualResponse {
  reportingCurrency: string;
  refreshedAt: string | null;
  rates: Array<RateSetManualResponse.Rate>;
  inUse: Array<RateSetManualResponse.InUse>;
  unconverted: RateSetManualResponse.Unconverted;
  catalog: Array<RateSetManualResponse.Catalog>;
  canManage: boolean;
}

export namespace RateSetManualResponse {
  export interface Rate {
    currency: string;
    name: string | null;
    rate: number;
    asOf: string;
    source: 'FETCHED' | 'MANUAL';
    provider: string | null;
    overriding: boolean;
  }

  export interface InUse {
    currency: string;
    name: string | null;
    deals: number;
    convertible: boolean;
  }

  export interface Unconverted {
    count: number;
    currencies: Array<string>;
  }

  export interface Catalog {
    code: string;
    name: string;
    minorUnits: number;
  }
}

export interface RateDeleteManualResponse {
  reportingCurrency: string;
  refreshedAt: string | null;
  rates: Array<RateDeleteManualResponse.Rate>;
  inUse: Array<RateDeleteManualResponse.InUse>;
  unconverted: RateDeleteManualResponse.Unconverted;
  catalog: Array<RateDeleteManualResponse.Catalog>;
  canManage: boolean;
}

export namespace RateDeleteManualResponse {
  export interface Rate {
    currency: string;
    name: string | null;
    rate: number;
    asOf: string;
    source: 'FETCHED' | 'MANUAL';
    provider: string | null;
    overriding: boolean;
  }

  export interface InUse {
    currency: string;
    name: string | null;
    deals: number;
    convertible: boolean;
  }

  export interface Unconverted {
    count: number;
    currencies: Array<string>;
  }

  export interface Catalog {
    code: string;
    name: string;
    minorUnits: number;
  }
}

export interface RateRefreshResponse {
  reportingCurrency: string;
  refreshedAt: string | null;
  rates: Array<RateRefreshResponse.Rate>;
  inUse: Array<RateRefreshResponse.InUse>;
  unconverted: RateRefreshResponse.Unconverted;
  catalog: Array<RateRefreshResponse.Catalog>;
  canManage: boolean;
}

export namespace RateRefreshResponse {
  export interface Rate {
    currency: string;
    name: string | null;
    rate: number;
    asOf: string;
    source: 'FETCHED' | 'MANUAL';
    provider: string | null;
    overriding: boolean;
  }

  export interface InUse {
    currency: string;
    name: string | null;
    deals: number;
    convertible: boolean;
  }

  export interface Unconverted {
    count: number;
    currencies: Array<string>;
  }

  export interface Catalog {
    code: string;
    name: string;
    minorUnits: number;
  }
}
export declare namespace Rates {
  export {
    type RateSetManualResponse as RateSetManualResponse,
    type RateDeleteManualResponse as RateDeleteManualResponse,
    type RateRefreshResponse as RateRefreshResponse,
    type RateSetManualParams as RateSetManualParams,
  };
}
