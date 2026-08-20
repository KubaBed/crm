// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import * as RatesAPI from './rates';
import {
  Rates,
  type RateSetManualResponse,
  type RateDeleteManualResponse,
  type RateRefreshResponse,
  type RateSetManualParams,
} from './rates';

export class Currency extends APIResource {
  rates: RatesAPI.Rates = new RatesAPI.Rates(this._client);

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CurrencySettingsResponse>} Successful response
   *
   * @example
   * ```ts
   * const settings = await client.currency.settings();
   * ```
   */
  settings(options?: RequestOptions): APIPromise<CurrencySettingsResponse> {
    return this._client.get('/currency/settings', options);
  }

  /**
   * @param {CurrencySetReportingParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<CurrencySetReportingResponse>} Successful response
   *
   * @example
   * ```ts
   * const setReporting = await client.currency.setReporting({
   *   currency: 'xxx',
   * });
   * ```
   */
  setReporting(
    body: CurrencySetReportingParams,
    options?: RequestOptions,
  ): APIPromise<CurrencySetReportingResponse> {
    return this._client.patch('/currency/reporting-currency', { body, ...options });
  }
}

export interface CurrencySettingsResponse {
  reportingCurrency: string;
  refreshedAt: string | null;
  rates: Array<CurrencySettingsResponse.Rate>;
  inUse: Array<CurrencySettingsResponse.InUse>;
  unconverted: CurrencySettingsResponse.Unconverted;
  catalog: Array<CurrencySettingsResponse.Catalog>;
  canManage: boolean;
}

export namespace CurrencySettingsResponse {
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

export interface CurrencySetReportingParams {
  /**
   * @minLength 3
   * @maxLength 3
   */
  currency: string;
}

export interface CurrencySetReportingResponse {
  reportingCurrency: string;
  refreshedAt: string | null;
  rates: Array<CurrencySetReportingResponse.Rate>;
  inUse: Array<CurrencySetReportingResponse.InUse>;
  unconverted: CurrencySetReportingResponse.Unconverted;
  catalog: Array<CurrencySetReportingResponse.Catalog>;
  canManage: boolean;
}

export namespace CurrencySetReportingResponse {
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
Currency.Rates = Rates;

export declare namespace Currency {
  export {
    type CurrencySettingsResponse as CurrencySettingsResponse,
    type CurrencySetReportingResponse as CurrencySetReportingResponse,
    type CurrencySetReportingParams as CurrencySetReportingParams,
  };

  export {
    Rates as Rates,
    type RateSetManualResponse as RateSetManualResponse,
    type RateDeleteManualResponse as RateDeleteManualResponse,
    type RateRefreshResponse as RateRefreshResponse,
    type RateSetManualParams as RateSetManualParams,
  };
}
