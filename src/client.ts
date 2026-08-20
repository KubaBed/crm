// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIPromise, type APIResponseProps } from './api-promise';
import * as Errors from './error';
import { uuid4 } from './internal/utils/uuid';
import { validatePositiveInteger, isAbsoluteURL, safeJSON, isEmptyObj } from './internal/utils/values';
import { sleep } from './internal/utils/sleep';
import { castToError, isAbortError } from './internal/errors';
import { getPlatformHeaders } from './internal/detect-platform';
import * as Shims from './internal/shims';
import * as Opts from './internal/request-options';
import { readEnv } from './internal/utils/env';
import {
  formatRequestDetails,
  loggerFor,
  parseLogLevel,
  type LogLevel,
  type Logger,
} from './internal/utils/log';
export type { Logger, LogLevel } from './internal/utils/log';
import type { RequestInit, RequestInfo, BodyInit, Fetch } from './internal/builtin-types';
import { buildHeaders, type HeadersLike, type NullableHeaders } from './internal/headers';
import type { FinalRequestOptions, RequestOptions } from './internal/request-options';
import type { HTTPMethod, FinalizedRequestInit, MergedRequestInit, PromiseOrValue } from './internal/types';
import { stringifyQuery } from './internal/utils/query';
import { toFile } from './core/uploads';
import { VERSION } from './version';
import { Auth } from './resources/auth';
import { Health, type HealthControllerCheckResponse } from './resources/health';
import {
  InternalCron,
  type InternalCronRatesControllerRatesViaGetParams,
  type InternalCronSyncControllerMailboxesViaGetParams,
  type InternalCronSyncControllerGoogleViaGetParams,
  type InternalCronTelemetryControllerRollupViaGetParams,
  type InternalCronTrackingRetentionControllerViaGetParams,
  type InternalCronArchiveRetentionControllerPruneViaGetParams,
} from './resources/internal-cron';
import {
  Conversations,
  type ConversationListResponse,
  type ConversationSaveResponse,
  type ConversationBuilderResourcesResponse,
  type ConversationEventsResponse,
  type ConversationSubmitBuilderResponse,
  type ConversationAnswerBuilderQuestionResponse,
  type ConversationRateBuilderResponseResponse,
  type ConversationMarkReadResponse,
  type ConversationSharedResponse,
  type ConversationDeleteResponse,
  type ConversationAttachmentsControllerReadParams,
  type ConversationListParams,
  type ConversationSaveParams,
  type ConversationBuilderResourcesParams,
  type ConversationEventsParams,
  type ConversationSubmitBuilderParams,
  type ConversationAnswerBuilderQuestionParams,
  type ConversationRateBuilderResponseParams,
} from './resources/conversations/conversations';
import {
  Tracking,
  type TrackingSettingsResponse,
  type TrackingRotateSiteIDResponse,
  type TrackingVerifyResponse,
  type TrackingSourcesResponse,
  type TrackingCompanyActivityResponse,
  type TrackingContactActivityResponse,
  type TrackingControllerCollectParams,
  type TrackingSetFlagParams,
  type TrackingSetCookieLifetimeParams,
  type TrackingVerifyParams,
} from './resources/tracking/tracking';
import { Users, type UserListResponse } from './resources/users';
import {
  APIKeys,
  type APIKeyListResponse,
  type APIKeyCreateResponse,
  type APIKeyRevokeResponse,
  type APIKeyListParams,
  type APIKeyCreateParams,
} from './resources/api-keys';
import {
  Companies,
  type CompanySearchResponse,
  type CompanyRetrieveResponse,
  type CompanyUpdateResponse,
  type CompanyPurgeResponse,
  type CompanyOptionsResponse,
  type CompanyCreateResponse,
  type CompanyArchiveResponse,
  type CompanyRestoreResponse,
  type CompanyBulkAssignOwnerResponse,
  type CompanyBulkEnrichResponse,
  type CompanyBulkArchiveResponse,
  type CompanyBulkRestoreResponse,
  type CompanyBulkPurgeResponse,
  type CompanyEnrichResponse,
  type CompanyResearchResponse,
  type CompanySetPrimaryContactResponse,
  type CompanySearchParams,
  type CompanyUpdateParams,
  type CompanyOptionsParams,
  type CompanyCreateParams,
  type CompanyBulkAssignOwnerParams,
  type CompanyBulkEnrichParams,
  type CompanyBulkArchiveParams,
  type CompanyBulkRestoreParams,
  type CompanyBulkPurgeParams,
  type CompanySetPrimaryContactParams,
} from './resources/companies';
import {
  Fields,
  type FieldListResponse,
  type FieldCreateResponse,
  type FieldRetrieveResponse,
  type FieldFiltersResponse,
  type FieldCoverageResponse,
  type FieldUpdateResponse,
  type FieldDeleteResponse,
  type FieldReorderResponse,
  type FieldArchiveResponse,
  type FieldRestoreResponse,
  type FieldBackfillResponse,
  type FieldListParams,
  type FieldCreateParams,
  type FieldRetrieveParams,
  type FieldUpdateParams,
  type FieldReorderParams,
} from './resources/fields';
import {
  Agents,
  type AgentListResponse,
  type AgentReviseResponse,
  type AgentFilesResponse,
  type AgentSaveFileResponse,
  type AgentRetrieveResponse,
  type AgentUpdateResponse,
  type AgentDeleteResponse,
  type AgentHistoryResponse,
  type AgentActivityResponse,
  type AgentDeployResponse,
  type AgentPauseResponse,
  type AgentResumeResponse,
  type AgentArchiveResponse,
  type AgentRestoreResponse,
  type AgentRunNowResponse,
  type AgentReviseParams,
  type AgentSaveFileParams,
  type AgentUpdateParams,
  type AgentHistoryParams,
  type AgentActivityParams,
  type AgentDeployParams,
  type AgentRunNowParams,
} from './resources/agents/agents';
import {
  Currency,
  type CurrencySettingsResponse,
  type CurrencySetReportingResponse,
  type CurrencySetReportingParams,
} from './resources/currency/currency';
import {
  Contacts,
  type ContactSearchResponse,
  type ContactRetrieveResponse,
  type ContactUpdateResponse,
  type ContactPurgeResponse,
  type ContactCreateResponse,
  type ContactArchiveResponse,
  type ContactRestoreResponse,
  type ContactEnrichResponse,
  type ContactBulkAssignOwnerResponse,
  type ContactBulkSetCompanyResponse,
  type ContactBulkEnrichResponse,
  type ContactBulkArchiveResponse,
  type ContactBulkRestoreResponse,
  type ContactBulkPurgeResponse,
  type ContactDecideFactResponse,
  type ContactSearchParams,
  type ContactUpdateParams,
  type ContactCreateParams,
  type ContactBulkAssignOwnerParams,
  type ContactBulkSetCompanyParams,
  type ContactBulkEnrichParams,
  type ContactBulkArchiveParams,
  type ContactBulkRestoreParams,
  type ContactBulkPurgeParams,
  type ContactDecideFactParams,
} from './resources/contacts';
import {
  Deals,
  type DealSearchResponse,
  type DealRetrieveResponse,
  type DealUpdateResponse,
  type DealPurgeResponse,
  type DealCreateResponse,
  type DealArchiveResponse,
  type DealRestoreResponse,
  type DealSetStageResponse,
  type DealContactOptionsResponse,
  type DealBulkAssignOwnerResponse,
  type DealBulkSetStageResponse,
  type DealBulkArchiveResponse,
  type DealBulkRestoreResponse,
  type DealBulkPurgeResponse,
  type DealSearchParams,
  type DealUpdateParams,
  type DealCreateParams,
  type DealSetStageParams,
  type DealBulkAssignOwnerParams,
  type DealBulkSetStageParams,
  type DealBulkArchiveParams,
  type DealBulkRestoreParams,
  type DealBulkPurgeParams,
} from './resources/deals/deals';
import {
  Activities,
  type ActivityTimelineResponse,
  type ActivityCreateResponse,
  type ActivityTimelineCountsResponse,
  type ActivityMyTasksResponse,
  type ActivityCompleteResponse,
  type ActivityTimelineParams,
  type ActivityCreateParams,
  type ActivityTimelineCountsParams,
  type ActivityMyTasksParams,
  type ActivityCompleteParams,
} from './resources/activities';
import { Enrichment, type EnrichmentQueueResponse, type EnrichmentQueueParams } from './resources/enrichment';
import { Dashboard, type DashboardSummaryResponse, type DashboardSummaryParams } from './resources/dashboard';
import { Search, type SearchQuickResponse, type SearchQuickParams } from './resources/search';
import {
  Google,
  type GoogleStatusResponse,
  type GooglePurgeSyncedDataResponse,
  type GoogleRevokeAccessResponse,
  type GoogleSyncNowResponse,
  type GoogleSetAutoCreateResponse,
  type GoogleSuppressDomainResponse,
  type GoogleThreadResponse,
  type GoogleEventResponse,
  type GoogleSetAutoCreateParams,
  type GoogleSuppressDomainParams,
} from './resources/google';
import {
  Microsoft,
  type MicrosoftStatusResponse,
  type MicrosoftPurgeSyncedDataResponse,
  type MicrosoftRevokeAccessResponse,
  type MicrosoftSyncNowResponse,
  type MicrosoftSetAutoCreateResponse,
  type MicrosoftSetAutoCreateParams,
} from './resources/microsoft';
import { Settings, type SettingModelCatalogResponse } from './resources/settings/settings';
import {
  Workspace,
  type WorkspaceListResponse,
  type WorkspaceUpdateResponse,
  type WorkspaceUpdateParams,
} from './resources/workspace/workspace';
import {
  Sso,
  type SsoSignInOptionsResponse,
  type SsoSettingsResponse,
  type SsoListResponse,
  type SsoRegisterResponse,
  type SsoDeleteResponse,
  type SsoListParams,
  type SsoRegisterParams,
} from './resources/sso';
import {
  Slack,
  type SlackStatusResponse,
  type SlackMatchesResponse,
  type SlackRefreshPeopleResponse,
  type SlackDisconnectResponse,
} from './resources/slack/slack';
import {
  SavedViews,
  type SavedViewListResponse,
  type SavedViewCreateResponse,
  type SavedViewUpdateResponse,
  type SavedViewDeleteResponse,
  type SavedViewListParams,
  type SavedViewCreateParams,
  type SavedViewUpdateParams,
} from './resources/saved-views';

export type AuthTokenProvider = () => string | Promise<string>;

export interface ClientOptions {
  /**
   * The API key for cookie authorization.
   */
  cookie?: string | AuthTokenProvider | undefined;

  /**
   * The API key for header authorization.
   */
  apiKey?: string | AuthTokenProvider | undefined;

  /**
   * Override the default base URL for the API, e.g., "https://api.example.com/v2/"
   *
   * Defaults to process.env["TRYCOMP_BASE_URL"].
   */
  baseURL?: string | null | undefined;

  /**
   * The maximum amount of time (in milliseconds) that the client should wait for a response
   * from the server before timing out a single request.
   *
   * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
   * much longer than this timeout before the promise succeeds or fails.
   *
   * @unit milliseconds
   */
  timeout?: number | undefined;

  /**
   * Additional `RequestInit` options to be passed to `fetch` calls.
   * Properties will be overridden by per-request `fetchOptions`.
   */
  fetchOptions?: MergedRequestInit | undefined;

  /**
   * Specify a custom `fetch` function implementation.
   *
   * If not provided, we expect that `fetch` is defined globally.
   */
  fetch?: Fetch | undefined;

  /**
   * The maximum number of times that the client will retry a request in case of a
   * temporary failure, like a network error or a 5XX error from the server.
   *
   * @default 2
   */
  maxRetries?: number | undefined;

  /**
   * Default headers to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * header to `null` in request options.
   */
  defaultHeaders?: HeadersLike | undefined;

  /**
   * Default query parameters to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * param to `undefined` in request options.
   */
  defaultQuery?: Record<string, string | undefined> | undefined;

  /**
   * Set the log level.
   *
   * Defaults to process.env["TRYCOMP_LOG"] or 'warn' if it isn't set.
   */
  logLevel?: LogLevel | undefined;

  /**
   * Set the logger.
   *
   * Defaults to globalThis.console.
   */
  logger?: Logger | undefined;
}

export type CrmAPIOptions = ClientOptions;

/**
 * API Client for interfacing with the CrmApi API.
 */
export class CrmAPI {
  cookie: string | AuthTokenProvider;
  apiKey: string | AuthTokenProvider;

  baseURL: string;
  maxRetries: number;
  timeout: number;
  logger: Logger;
  logLevel: LogLevel | undefined;
  fetchOptions: MergedRequestInit | undefined;
  private fetch: Fetch;
  #encoder: Opts.RequestEncoder;
  protected idempotencyHeader?: string;
  private _baseURLOverridden: boolean;
  private _defaultBaseURL: string;
  private _options: ClientOptions;

  /**
   * API Client for interfacing with the CrmApi API.
   *
   * @param {string | AuthTokenProvider | undefined} [opts.cookie=process.env["COOKIE"] ?? undefined]
   * @param {string | AuthTokenProvider | undefined} [opts.apiKey=process.env["API_KEY"] ?? undefined]
   * @param {string} [opts.baseURL=process.env["TRYCOMP_BASE_URL"] ?? /] - Override the default base URL for the API.
   * @param {number} [opts.timeout=1 minute] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
   * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
   */
  constructor({
    baseURL = readEnv('TRYCOMP_BASE_URL'),
    cookie = readEnv('COOKIE'),
    apiKey = readEnv('API_KEY'),
    ...opts
  }: ClientOptions = {}) {
    if (cookie === undefined) {
      throw new Errors.CrmAPIError(
        "The COOKIE environment variable is missing or empty; either provide it, or instantiate the CrmAPI client with an cookie option, like new CrmAPI({ cookie: 'My Cookie' }).",
      );
    }
    if (apiKey === undefined) {
      throw new Errors.CrmAPIError(
        "The API_KEY environment variable is missing or empty; either provide it, or instantiate the CrmAPI client with an apiKey option, like new CrmAPI({ apiKey: 'My API Key' }).",
      );
    }

    const options: ClientOptions = {
      cookie,
      apiKey,
      ...opts,
      baseURL: baseURL || '',
    };
    const baseURLOverridden = baseURL !== null && baseURL !== undefined && baseURL !== '';
    const defaultBaseURL = '';
    this.baseURL = options.baseURL || defaultBaseURL;
    this.timeout = options.timeout ?? CrmAPI.DEFAULT_TIMEOUT /* 1 minute */;
    this.logger = options.logger ?? console;
    const defaultLogLevel = 'warn';
    // Set default logLevel early so that we can log a warning in parseLogLevel.
    this.logLevel = defaultLogLevel;
    this.logLevel =
      parseLogLevel(options.logLevel, 'ClientOptions.logLevel', this) ??
      parseLogLevel(readEnv('TRYCOMP_LOG'), 'process.env["TRYCOMP_LOG"]', this) ??
      defaultLogLevel;
    this.fetchOptions = options.fetchOptions;
    this.maxRetries = options.maxRetries ?? 2;
    this.fetch = options.fetch ?? Shims.getDefaultFetch();
    this.#encoder = Opts.FallbackEncoder;

    const customHeadersEnv = readEnv('TRYCOMP_CUSTOM_HEADERS');
    if (customHeadersEnv) {
      const parsed: Record<string, string> = {};
      for (const line of customHeadersEnv.split('\n')) {
        const colon = line.indexOf(':');
        if (colon >= 0) {
          parsed[line.substring(0, colon).trim()] = line.substring(colon + 1).trim();
        }
      }
      options.defaultHeaders = { ...parsed, ...options.defaultHeaders };
    }

    this._options = { ...options, baseURL: baseURLOverridden ? this.baseURL : undefined };
    this._baseURLOverridden = baseURLOverridden;
    this._defaultBaseURL = defaultBaseURL;

    this.cookie = cookie;
    this.apiKey = apiKey;
  }

  withOptions(options: Partial<ClientOptions>): this {
    const client = new (this.constructor as new (props: ClientOptions) => this)({
      ...this._options,
      ...(this.#baseURLOverridden() ? { baseURL: this.baseURL } : {}),
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      cookie: this.cookie,
      apiKey: this.apiKey,
      ...options,
    });
    return client;
  }

  #baseURLOverridden(): boolean {
    // A named environment selects a default URL; only explicit overrides should bypass per-request defaults.
    return this._baseURLOverridden || this.baseURL !== this._defaultBaseURL;
  }

  protected defaultQuery(): Record<string, string | undefined> | undefined {
    return this._options.defaultQuery;
  }

  protected stringifyQuery(query: object | Record<string, unknown>): string {
    return stringifyQuery(query);
  }

  private getUserAgent(): string {
    return `${this.constructor.name}/JS ${VERSION}`;
  }

  protected defaultIdempotencyKey(): string {
    return `scalar-node-retry-${uuid4()}`;
  }

  protected makeStatusError(
    status: number,
    error: object | undefined,
    message: string | undefined,
    headers: Headers,
  ): Errors.APIError {
    return Errors.APIError.generate(status, error, message, headers);
  }

  buildURL(
    path: string,
    query: Record<string, unknown> | null | undefined,
    defaultBaseURL?: string | undefined,
  ): string {
    const baseURL = (!this.#baseURLOverridden() && defaultBaseURL) || this.baseURL;
    // Guarantee exactly one "/" between baseURL and path so that bases without a trailing slash
    // and paths without a leading slash do not fuse into a malformed URL (e.g. ".../v1" + "widgets").
    const url = isAbsoluteURL(path)
      ? new URL(path)
      : new URL(
          (baseURL.endsWith('/') ? baseURL : baseURL + '/') + (path.startsWith('/') ? path.slice(1) : path),
        );

    const defaultQuery = this.defaultQuery();
    const pathQuery = Object.fromEntries(url.searchParams);
    if (!isEmptyObj(defaultQuery) || !isEmptyObj(pathQuery)) {
      query = { ...pathQuery, ...defaultQuery, ...query };
    }

    if (typeof query === 'object' && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }

    return url.toString();
  }

  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  protected async prepareOptions(options: FinalRequestOptions): Promise<void> {}

  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  protected async prepareRequest(
    request: RequestInit,
    { url, options }: { url: string; options: FinalRequestOptions },
  ): Promise<void> {}

  get<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp> {
    return this.methodRequest('get', path, opts);
  }

  post<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp> {
    return this.methodRequest('post', path, opts);
  }

  patch<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp> {
    return this.methodRequest('patch', path, opts);
  }

  put<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp> {
    return this.methodRequest('put', path, opts);
  }

  delete<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp> {
    return this.methodRequest('delete', path, opts);
  }

  private methodRequest<Rsp>(
    method: HTTPMethod,
    path: string,
    opts?: PromiseOrValue<RequestOptions>,
  ): APIPromise<Rsp> {
    return this.request(
      Promise.resolve(opts).then((opts) => {
        return { method, path, ...opts } as FinalRequestOptions;
      }),
    );
  }

  request<Rsp>(
    options: PromiseOrValue<FinalRequestOptions>,
    remainingRetries: number | null = null,
  ): APIPromise<Rsp> {
    return new APIPromise(this, this.makeRequest(options, remainingRetries, undefined));
  }

  private async makeRequest(
    optionsInput: PromiseOrValue<FinalRequestOptions>,
    retriesRemaining: number | null,
    retryOfRequestLogID: string | undefined,
  ): Promise<APIResponseProps> {
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }

    await this.prepareOptions(options);

    const { req, url, timeout } = await this.buildRequest(options, {
      retryCount: maxRetries - retriesRemaining,
    });

    await this.prepareRequest(req, { url, options });

    /** Not an API request ID, just for correlating local log entries. */
    const requestLogID = 'log_' + ((Math.random() * (1 << 24)) | 0).toString(16).padStart(6, '0');
    const retryLogStr = retryOfRequestLogID === undefined ? '' : `, retryOf: ${retryOfRequestLogID}`;
    const startTime = Date.now();

    loggerFor(this).debug(
      `[${requestLogID}] sending request`,
      formatRequestDetails({
        retryOfRequestLogID,
        method: options.method,
        url,
        options,
        headers: req.headers,
      }),
    );

    if (options.signal?.aborted) {
      throw new Errors.APIUserAbortError();
    }

    const controller = new AbortController();
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    const headersTime = Date.now();

    if (response instanceof globalThis.Error) {
      const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
      if (options.signal?.aborted) {
        throw new Errors.APIUserAbortError();
      }
      // detect native connection timeout errors
      // deno throws "TypeError: error sending request for url (https://example/): client error (Connect): tcp connect error: Operation timed out (os error 60): Operation timed out (os error 60)"
      // undici throws "TypeError: fetch failed" with cause "ConnectTimeoutError: Connect Timeout Error (attempted address: example:443, timeout: 1ms)"
      // others do not provide enough information to distinguish timeouts from other connection errors
      const isTimeout =
        isAbortError(response) ||
        /timed? ?out/i.test(String(response) + ('cause' in response ? String(response.cause) : ''));
      if (retriesRemaining) {
        loggerFor(this).info(
          `[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - ${retryMessage}`,
        );
        loggerFor(this).debug(
          `[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (${retryMessage})`,
          formatRequestDetails({
            retryOfRequestLogID,
            url,
            durationMs: headersTime - startTime,
            message: response.message,
          }),
        );
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
      }
      loggerFor(this).info(
        `[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - error; no more retries left`,
      );
      loggerFor(this).debug(
        `[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (error; no more retries left)`,
        formatRequestDetails({
          retryOfRequestLogID,
          url,
          durationMs: headersTime - startTime,
          message: response.message,
        }),
      );
      if (isTimeout) {
        throw new Errors.APIConnectionTimeoutError();
      }
      throw new Errors.APIConnectionError({ cause: response });
    }

    const responseInfo = `[${requestLogID}${retryLogStr}] ${req.method} ${url} ${
      response.ok ? 'succeeded' : 'failed'
    } with status ${response.status} in ${headersTime - startTime}ms`;

    if (!response.ok) {
      const shouldRetry = await this.shouldRetry(response);
      if (retriesRemaining && shouldRetry) {
        const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;

        // We don't need the body of this response.
        await Shims.CancelReadableStream(response.body);
        loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
        loggerFor(this).debug(
          `[${requestLogID}] response error (${retryMessage})`,
          formatRequestDetails({
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            durationMs: headersTime - startTime,
          }),
        );
        return this.retryRequest(
          options,
          retriesRemaining,
          retryOfRequestLogID ?? requestLogID,
          response.headers,
        );
      }

      const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;

      loggerFor(this).info(`${responseInfo} - ${retryMessage}`);

      const errText = await response.text().catch((err: any) => castToError(err).message);
      const errJSON = safeJSON(errText) as any;
      const errMessage = errJSON ? undefined : errText;

      loggerFor(this).debug(
        `[${requestLogID}] response error (${retryMessage})`,
        formatRequestDetails({
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          message: errMessage,
          durationMs: Date.now() - startTime,
        }),
      );

      const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
      throw err;
    }

    loggerFor(this).info(responseInfo);
    loggerFor(this).debug(
      `[${requestLogID}] response start`,
      formatRequestDetails({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        headers: response.headers,
        durationMs: headersTime - startTime,
      }),
    );

    return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
  }

  async fetchWithTimeout(
    url: RequestInfo,
    init: RequestInit | undefined,
    ms: number,
    controller: AbortController,
  ): Promise<Response> {
    const { signal, method, ...options } = init || {};
    const abort = this._makeAbort(controller);
    if (signal) signal.addEventListener('abort', abort, { once: true });

    const timeout = setTimeout(abort, ms);

    const isReadableBody =
      ((globalThis as any).ReadableStream && options.body instanceof (globalThis as any).ReadableStream) ||
      (typeof options.body === 'object' && options.body !== null && Symbol.asyncIterator in options.body);

    const fetchOptions: RequestInit = {
      signal: controller.signal as any,
      ...(isReadableBody ? { duplex: 'half' } : {}),
      method: 'GET',
      ...options,
    };
    if (method) {
      // Custom methods like 'patch' need to be uppercased
      // See https://github.com/nodejs/undici/issues/2294
      fetchOptions.method = method.toUpperCase();
    }

    try {
      // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
      return await this.fetch.call(undefined, url, fetchOptions);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async shouldRetry(response: Response): Promise<boolean> {
    // Note this is not a standard header.
    const shouldRetryHeader = response.headers.get('x-should-retry');

    // If the server explicitly says whether or not to retry, obey.
    if (shouldRetryHeader === 'true') return true;
    if (shouldRetryHeader === 'false') return false;

    // Retry on request timeouts.
    if (response.status === 408) return true;

    // Retry on lock timeouts.
    if (response.status === 409) return true;

    // Retry on rate limits.
    if (response.status === 429) return true;

    // Retry internal errors.
    if (response.status >= 500) return true;

    return false;
  }

  private async retryRequest(
    options: FinalRequestOptions,
    retriesRemaining: number,
    requestLogID: string,
    responseHeaders?: Headers | undefined,
  ): Promise<APIResponseProps> {
    let timeoutMillis: number | undefined;

    // Note the `retry-after-ms` header may not be standard, but is a good idea and we'd like proactive support for it.
    const retryAfterMillisHeader = responseHeaders?.get('retry-after-ms');
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }

    // About the Retry-After header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
    const retryAfterHeader = responseHeaders?.get('retry-after');
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1000;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }

    // If the API asks us to wait a certain amount of time, just do what it says,
    // but cap server-provided delays at 60s so an oversized or malformed Retry-After
    // (e.g. `retry-after-ms: 999999999`, a past HTTP-date, or a value that Date.parse
    // failed on) cannot block retries for an unbounded amount of time. Otherwise fall
    // back to the default exponential-backoff calculation.
    const maxRetryAfterMillis = 60 * 1000;
    if (
      timeoutMillis === undefined ||
      !Number.isFinite(timeoutMillis) ||
      timeoutMillis <= 0 ||
      timeoutMillis > maxRetryAfterMillis
    ) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);

    return this.makeRequest(options, retriesRemaining - 1, requestLogID);
  }

  private calculateDefaultRetryTimeoutMillis(retriesRemaining: number, maxRetries: number): number {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8.0;

    const numRetries = maxRetries - retriesRemaining;

    // Apply exponential backoff, but not more than the max.
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);

    // Apply some jitter, take up to at most 25 percent of the retry time.
    const jitter = 1 - Math.random() * 0.25;

    return sleepSeconds * jitter * 1000;
  }

  async buildRequest(
    inputOptions: FinalRequestOptions,
    { retryCount = 0 }: { retryCount?: number } = {},
  ): Promise<{ req: FinalizedRequestInit; url: string; timeout: number }> {
    const options = { ...inputOptions };
    const { method, path, query, defaultBaseURL } = options;

    const url = this.buildURL(path!, query as Record<string, unknown>, defaultBaseURL);
    if ('timeout' in options) validatePositiveInteger('timeout', options.timeout);
    options.timeout = options.timeout ?? this.timeout;
    const { bodyHeaders, body } = this.buildBody({ options });
    // Headers read the caller's own options, not the copy defaulted above: `X-Scalar-Timeout`
    // reports an explicit per-request timeout, and the idempotency key written back here has to
    // land where the retry can see it.
    const reqHeaders = await this.buildHeaders({
      options: inputOptions,
      method,
      bodyHeaders,
      retryCount,
      url,
    });

    const req: FinalizedRequestInit = {
      method,
      headers: reqHeaders,
      ...(options.signal && { signal: options.signal }),
      ...((globalThis as any).ReadableStream &&
        body instanceof (globalThis as any).ReadableStream && { duplex: 'half' }),
      // `buildBody` already collapses no-body into `undefined`; here we only need to drop that
      // sentinel. A truthiness spread would also strip an intentional empty-string body.
      ...(body !== undefined && { body }),
      ...((this.fetchOptions as any) ?? {}),
      ...((options.fetchOptions as any) ?? {}),
    };
    return { req, url, timeout: options.timeout };
  }

  private async buildHeaders({
    options,
    method,
    bodyHeaders,
    retryCount,
    url,
  }: {
    options: FinalRequestOptions;
    method: HTTPMethod;
    bodyHeaders: HeadersLike;
    retryCount: number;
    url: string;
  }): Promise<Headers> {
    let idempotencyHeaders: HeadersLike = {};
    if (this.idempotencyHeader && method !== 'get') {
      if (!options.idempotencyKey) options.idempotencyKey = this.defaultIdempotencyKey();
      idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
    }

    const headers = buildHeaders([
      idempotencyHeaders,
      {
        Accept: 'application/json',
        'User-Agent': this.getUserAgent(),
        'X-Scalar-Retry-Count': String(retryCount),
        ...(options.timeout ? { 'X-Scalar-Timeout': String(Math.trunc(options.timeout / 1000)) } : {}),
        ...getPlatformHeaders(),
      },
      await this.authHeaders(options),
      this._options.defaultHeaders,
      bodyHeaders,
      options.headers,
    ]);
    appendAuthCookies(headers.values, await this.authCookiesAsync());

    this.validateAuth(url, headers.values, options);

    return headers.values;
  }

  private _makeAbort(controller: AbortController) {
    // note: we can't just inline this method inside `fetchWithTimeout()` because then the closure
    //       would capture all request options, and cause a memory leak.
    return () => controller.abort();
  }

  private buildBody({ options: { body, headers: rawHeaders } }: { options: FinalRequestOptions }): {
    bodyHeaders: HeadersLike;
    body: BodyInit | undefined;
  } {
    // Skip only `null`/`undefined` so an intentional empty-string (or 0/false) payload still
    // reaches the encoder. A plain `!body` check would silently drop those falsy-but-valid bodies,
    // and `null` must be excluded here too because the iterator check below uses `in`, which
    // throws on null.
    if (body == null) {
      return { bodyHeaders: undefined, body: undefined };
    }
    const headers = buildHeaders([rawHeaders]);
    if (
      // Pass raw type verbatim
      ArrayBuffer.isView(body) ||
      body instanceof ArrayBuffer ||
      body instanceof DataView ||
      // Always pass strings through verbatim. The previous guard required a caller-set
      // `content-type` and otherwise fell through to `FallbackEncoder`, which JSON.stringifies
      // the value and labels it `application/json` — silently quoting plain-text payloads and
      // mislabeling them as JSON. fetch defaults a string body to `text/plain;charset=UTF-8`
      // when no `content-type` is set, which is a safer default than misclaiming JSON.
      typeof body === 'string' ||
      // `Blob` is superset of `File`
      ((globalThis as any).Blob && body instanceof (globalThis as any).Blob) ||
      // `FormData` -> `multipart/form-data`
      body instanceof FormData ||
      // `URLSearchParams` -> `application/x-www-form-urlencoded`
      body instanceof URLSearchParams ||
      // Send chunked stream (each chunk has own `length`)
      ((globalThis as any).ReadableStream && body instanceof (globalThis as any).ReadableStream)
    ) {
      return { bodyHeaders: undefined, body: body as BodyInit };
    } else if (
      typeof body === 'object' &&
      (Symbol.asyncIterator in body ||
        (Symbol.iterator in body && 'next' in body && typeof body.next === 'function'))
    ) {
      return { bodyHeaders: undefined, body: Shims.ReadableStreamFrom(body as AsyncIterable<Uint8Array>) };
    } else if (
      typeof body === 'object' &&
      headers.values.get('content-type') === 'application/x-www-form-urlencoded'
    ) {
      return {
        bodyHeaders: { 'content-type': 'application/x-www-form-urlencoded' },
        body: this.stringifyQuery(body),
      };
    } else {
      return this.#encoder({ body, headers });
    }
  }

  protected validateAuth(url: string, headers: Headers, options: FinalRequestOptions): void {
    return;
  }

  authHeadersSync(): Record<string, string> {
    const headers: Record<string, string> = {};
    const apiKey = this.resolveAuthOptionSync('apiKey', this.apiKey);
    if (apiKey) headers['x-api-key'] = apiKey;
    return headers;
  }

  webSocketAuthHeaders(): Record<string, string> {
    const apiKey = this.resolveAuthOptionSync('apiKey', this.apiKey);
    if (apiKey) return { 'x-api-key': apiKey };
    return {};
  }

  protected async authHeaders(opts: FinalRequestOptions): Promise<NullableHeaders | undefined> {
    const apiKey = await this.resolveAuthOption('apiKey', this.apiKey);
    if (apiKey == null) {
      return undefined;
    }
    return buildHeaders([{ 'x-api-key': apiKey }]);
  }

  private async authQueryAsync(): Promise<Record<string, string>> {
    const query: Record<string, string> = {};
    return query;
  }

  private async authCookiesAsync(): Promise<Record<string, string>> {
    const cookies: Record<string, string> = {};
    const cookie = await this.resolveAuthOption('cookie', this.cookie);
    if (cookie) cookies['crm.session_token'] = cookie;
    return cookies;
  }

  private async resolveAuthOption(
    optionName: string,
    value: string | AuthTokenProvider | null | undefined,
  ): Promise<string | undefined> {
    if (value == null) return undefined;
    const token = typeof value === 'function' ? await value() : value;
    if (!token) throw new Errors.CrmAPIError(`Expected '${optionName}' to resolve to a non-empty string.`);
    return token;
  }

  private resolveAuthOptionSync(
    optionName: string,
    value: string | AuthTokenProvider | null | undefined,
  ): string | undefined {
    if (value == null) return undefined;
    const token = typeof value === 'function' ? value() : value;
    if (typeof token !== 'string' || !token)
      throw new Errors.CrmAPIError(`Expected '${optionName}' to resolve to a non-empty string.`);
    return token;
  }

  static CrmAPI = this;
  static DEFAULT_TIMEOUT = 60000; // 1 minute

  static CrmAPIError = Errors.CrmAPIError;
  static APIError = Errors.APIError;
  static APIConnectionError = Errors.APIConnectionError;
  static APIConnectionTimeoutError = Errors.APIConnectionTimeoutError;
  static APIUserAbortError = Errors.APIUserAbortError;
  static NotFoundError = Errors.NotFoundError;
  static ConflictError = Errors.ConflictError;
  static RateLimitError = Errors.RateLimitError;
  static BadRequestError = Errors.BadRequestError;
  static AuthenticationError = Errors.AuthenticationError;
  static InternalServerError = Errors.InternalServerError;
  static PermissionDeniedError = Errors.PermissionDeniedError;
  static UnprocessableEntityError = Errors.UnprocessableEntityError;

  static toFile = toFile;

  auth: Auth = new Auth(this);
  health: Health = new Health(this);
  internalCron: InternalCron = new InternalCron(this);
  conversations: Conversations = new Conversations(this);
  tracking: Tracking = new Tracking(this);
  users: Users = new Users(this);
  apiKeys: APIKeys = new APIKeys(this);
  companies: Companies = new Companies(this);
  fields: Fields = new Fields(this);
  agents: Agents = new Agents(this);
  currency: Currency = new Currency(this);
  contacts: Contacts = new Contacts(this);
  deals: Deals = new Deals(this);
  activities: Activities = new Activities(this);
  enrichment: Enrichment = new Enrichment(this);
  dashboard: Dashboard = new Dashboard(this);
  search: Search = new Search(this);
  google: Google = new Google(this);
  microsoft: Microsoft = new Microsoft(this);
  settings: Settings = new Settings(this);
  workspace: Workspace = new Workspace(this);
  sso: Sso = new Sso(this);
  slack: Slack = new Slack(this);
  savedViews: SavedViews = new SavedViews(this);
}

CrmAPI.Auth = Auth;
CrmAPI.Health = Health;
CrmAPI.InternalCron = InternalCron;
CrmAPI.Conversations = Conversations;
CrmAPI.Tracking = Tracking;
CrmAPI.Users = Users;
CrmAPI.APIKeys = APIKeys;
CrmAPI.Companies = Companies;
CrmAPI.Fields = Fields;
CrmAPI.Agents = Agents;
CrmAPI.Currency = Currency;
CrmAPI.Contacts = Contacts;
CrmAPI.Deals = Deals;
CrmAPI.Activities = Activities;
CrmAPI.Enrichment = Enrichment;
CrmAPI.Dashboard = Dashboard;
CrmAPI.Search = Search;
CrmAPI.Google = Google;
CrmAPI.Microsoft = Microsoft;
CrmAPI.Settings = Settings;
CrmAPI.Workspace = Workspace;
CrmAPI.Sso = Sso;
CrmAPI.Slack = Slack;
CrmAPI.SavedViews = SavedViews;

export declare namespace CrmAPI {
  export type RequestOptions = Opts.RequestOptions;
  export { Auth as Auth };

  export { Health as Health, type HealthControllerCheckResponse as HealthControllerCheckResponse };

  export {
    InternalCron as InternalCron,
    type InternalCronRatesControllerRatesViaGetParams as InternalCronRatesControllerRatesViaGetParams,
    type InternalCronSyncControllerMailboxesViaGetParams as InternalCronSyncControllerMailboxesViaGetParams,
    type InternalCronSyncControllerGoogleViaGetParams as InternalCronSyncControllerGoogleViaGetParams,
    type InternalCronTelemetryControllerRollupViaGetParams as InternalCronTelemetryControllerRollupViaGetParams,
    type InternalCronTrackingRetentionControllerViaGetParams as InternalCronTrackingRetentionControllerViaGetParams,
    type InternalCronArchiveRetentionControllerPruneViaGetParams as InternalCronArchiveRetentionControllerPruneViaGetParams,
  };

  export {
    Conversations as Conversations,
    type ConversationListResponse as ConversationListResponse,
    type ConversationSaveResponse as ConversationSaveResponse,
    type ConversationBuilderResourcesResponse as ConversationBuilderResourcesResponse,
    type ConversationEventsResponse as ConversationEventsResponse,
    type ConversationSubmitBuilderResponse as ConversationSubmitBuilderResponse,
    type ConversationAnswerBuilderQuestionResponse as ConversationAnswerBuilderQuestionResponse,
    type ConversationRateBuilderResponseResponse as ConversationRateBuilderResponseResponse,
    type ConversationMarkReadResponse as ConversationMarkReadResponse,
    type ConversationSharedResponse as ConversationSharedResponse,
    type ConversationDeleteResponse as ConversationDeleteResponse,
    type ConversationAttachmentsControllerReadParams as ConversationAttachmentsControllerReadParams,
    type ConversationListParams as ConversationListParams,
    type ConversationSaveParams as ConversationSaveParams,
    type ConversationBuilderResourcesParams as ConversationBuilderResourcesParams,
    type ConversationEventsParams as ConversationEventsParams,
    type ConversationSubmitBuilderParams as ConversationSubmitBuilderParams,
    type ConversationAnswerBuilderQuestionParams as ConversationAnswerBuilderQuestionParams,
    type ConversationRateBuilderResponseParams as ConversationRateBuilderResponseParams,
  };

  export {
    Tracking as Tracking,
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

  export { Users as Users, type UserListResponse as UserListResponse };

  export {
    APIKeys as APIKeys,
    type APIKeyListResponse as APIKeyListResponse,
    type APIKeyCreateResponse as APIKeyCreateResponse,
    type APIKeyRevokeResponse as APIKeyRevokeResponse,
    type APIKeyListParams as APIKeyListParams,
    type APIKeyCreateParams as APIKeyCreateParams,
  };

  export {
    Companies as Companies,
    type CompanySearchResponse as CompanySearchResponse,
    type CompanyRetrieveResponse as CompanyRetrieveResponse,
    type CompanyUpdateResponse as CompanyUpdateResponse,
    type CompanyPurgeResponse as CompanyPurgeResponse,
    type CompanyOptionsResponse as CompanyOptionsResponse,
    type CompanyCreateResponse as CompanyCreateResponse,
    type CompanyArchiveResponse as CompanyArchiveResponse,
    type CompanyRestoreResponse as CompanyRestoreResponse,
    type CompanyBulkAssignOwnerResponse as CompanyBulkAssignOwnerResponse,
    type CompanyBulkEnrichResponse as CompanyBulkEnrichResponse,
    type CompanyBulkArchiveResponse as CompanyBulkArchiveResponse,
    type CompanyBulkRestoreResponse as CompanyBulkRestoreResponse,
    type CompanyBulkPurgeResponse as CompanyBulkPurgeResponse,
    type CompanyEnrichResponse as CompanyEnrichResponse,
    type CompanyResearchResponse as CompanyResearchResponse,
    type CompanySetPrimaryContactResponse as CompanySetPrimaryContactResponse,
    type CompanySearchParams as CompanySearchParams,
    type CompanyUpdateParams as CompanyUpdateParams,
    type CompanyOptionsParams as CompanyOptionsParams,
    type CompanyCreateParams as CompanyCreateParams,
    type CompanyBulkAssignOwnerParams as CompanyBulkAssignOwnerParams,
    type CompanyBulkEnrichParams as CompanyBulkEnrichParams,
    type CompanyBulkArchiveParams as CompanyBulkArchiveParams,
    type CompanyBulkRestoreParams as CompanyBulkRestoreParams,
    type CompanyBulkPurgeParams as CompanyBulkPurgeParams,
    type CompanySetPrimaryContactParams as CompanySetPrimaryContactParams,
  };

  export {
    Fields as Fields,
    type FieldListResponse as FieldListResponse,
    type FieldCreateResponse as FieldCreateResponse,
    type FieldRetrieveResponse as FieldRetrieveResponse,
    type FieldFiltersResponse as FieldFiltersResponse,
    type FieldCoverageResponse as FieldCoverageResponse,
    type FieldUpdateResponse as FieldUpdateResponse,
    type FieldDeleteResponse as FieldDeleteResponse,
    type FieldReorderResponse as FieldReorderResponse,
    type FieldArchiveResponse as FieldArchiveResponse,
    type FieldRestoreResponse as FieldRestoreResponse,
    type FieldBackfillResponse as FieldBackfillResponse,
    type FieldListParams as FieldListParams,
    type FieldCreateParams as FieldCreateParams,
    type FieldRetrieveParams as FieldRetrieveParams,
    type FieldUpdateParams as FieldUpdateParams,
    type FieldReorderParams as FieldReorderParams,
  };

  export {
    Agents as Agents,
    type AgentListResponse as AgentListResponse,
    type AgentReviseResponse as AgentReviseResponse,
    type AgentFilesResponse as AgentFilesResponse,
    type AgentSaveFileResponse as AgentSaveFileResponse,
    type AgentRetrieveResponse as AgentRetrieveResponse,
    type AgentUpdateResponse as AgentUpdateResponse,
    type AgentDeleteResponse as AgentDeleteResponse,
    type AgentHistoryResponse as AgentHistoryResponse,
    type AgentActivityResponse as AgentActivityResponse,
    type AgentDeployResponse as AgentDeployResponse,
    type AgentPauseResponse as AgentPauseResponse,
    type AgentResumeResponse as AgentResumeResponse,
    type AgentArchiveResponse as AgentArchiveResponse,
    type AgentRestoreResponse as AgentRestoreResponse,
    type AgentRunNowResponse as AgentRunNowResponse,
    type AgentReviseParams as AgentReviseParams,
    type AgentSaveFileParams as AgentSaveFileParams,
    type AgentUpdateParams as AgentUpdateParams,
    type AgentHistoryParams as AgentHistoryParams,
    type AgentActivityParams as AgentActivityParams,
    type AgentDeployParams as AgentDeployParams,
    type AgentRunNowParams as AgentRunNowParams,
  };

  export {
    Currency as Currency,
    type CurrencySettingsResponse as CurrencySettingsResponse,
    type CurrencySetReportingResponse as CurrencySetReportingResponse,
    type CurrencySetReportingParams as CurrencySetReportingParams,
  };

  export {
    Contacts as Contacts,
    type ContactSearchResponse as ContactSearchResponse,
    type ContactRetrieveResponse as ContactRetrieveResponse,
    type ContactUpdateResponse as ContactUpdateResponse,
    type ContactPurgeResponse as ContactPurgeResponse,
    type ContactCreateResponse as ContactCreateResponse,
    type ContactArchiveResponse as ContactArchiveResponse,
    type ContactRestoreResponse as ContactRestoreResponse,
    type ContactEnrichResponse as ContactEnrichResponse,
    type ContactBulkAssignOwnerResponse as ContactBulkAssignOwnerResponse,
    type ContactBulkSetCompanyResponse as ContactBulkSetCompanyResponse,
    type ContactBulkEnrichResponse as ContactBulkEnrichResponse,
    type ContactBulkArchiveResponse as ContactBulkArchiveResponse,
    type ContactBulkRestoreResponse as ContactBulkRestoreResponse,
    type ContactBulkPurgeResponse as ContactBulkPurgeResponse,
    type ContactDecideFactResponse as ContactDecideFactResponse,
    type ContactSearchParams as ContactSearchParams,
    type ContactUpdateParams as ContactUpdateParams,
    type ContactCreateParams as ContactCreateParams,
    type ContactBulkAssignOwnerParams as ContactBulkAssignOwnerParams,
    type ContactBulkSetCompanyParams as ContactBulkSetCompanyParams,
    type ContactBulkEnrichParams as ContactBulkEnrichParams,
    type ContactBulkArchiveParams as ContactBulkArchiveParams,
    type ContactBulkRestoreParams as ContactBulkRestoreParams,
    type ContactBulkPurgeParams as ContactBulkPurgeParams,
    type ContactDecideFactParams as ContactDecideFactParams,
  };

  export {
    Deals as Deals,
    type DealSearchResponse as DealSearchResponse,
    type DealRetrieveResponse as DealRetrieveResponse,
    type DealUpdateResponse as DealUpdateResponse,
    type DealPurgeResponse as DealPurgeResponse,
    type DealCreateResponse as DealCreateResponse,
    type DealArchiveResponse as DealArchiveResponse,
    type DealRestoreResponse as DealRestoreResponse,
    type DealSetStageResponse as DealSetStageResponse,
    type DealContactOptionsResponse as DealContactOptionsResponse,
    type DealBulkAssignOwnerResponse as DealBulkAssignOwnerResponse,
    type DealBulkSetStageResponse as DealBulkSetStageResponse,
    type DealBulkArchiveResponse as DealBulkArchiveResponse,
    type DealBulkRestoreResponse as DealBulkRestoreResponse,
    type DealBulkPurgeResponse as DealBulkPurgeResponse,
    type DealSearchParams as DealSearchParams,
    type DealUpdateParams as DealUpdateParams,
    type DealCreateParams as DealCreateParams,
    type DealSetStageParams as DealSetStageParams,
    type DealBulkAssignOwnerParams as DealBulkAssignOwnerParams,
    type DealBulkSetStageParams as DealBulkSetStageParams,
    type DealBulkArchiveParams as DealBulkArchiveParams,
    type DealBulkRestoreParams as DealBulkRestoreParams,
    type DealBulkPurgeParams as DealBulkPurgeParams,
  };

  export {
    Activities as Activities,
    type ActivityTimelineResponse as ActivityTimelineResponse,
    type ActivityCreateResponse as ActivityCreateResponse,
    type ActivityTimelineCountsResponse as ActivityTimelineCountsResponse,
    type ActivityMyTasksResponse as ActivityMyTasksResponse,
    type ActivityCompleteResponse as ActivityCompleteResponse,
    type ActivityTimelineParams as ActivityTimelineParams,
    type ActivityCreateParams as ActivityCreateParams,
    type ActivityTimelineCountsParams as ActivityTimelineCountsParams,
    type ActivityMyTasksParams as ActivityMyTasksParams,
    type ActivityCompleteParams as ActivityCompleteParams,
  };

  export {
    Enrichment as Enrichment,
    type EnrichmentQueueResponse as EnrichmentQueueResponse,
    type EnrichmentQueueParams as EnrichmentQueueParams,
  };

  export {
    Dashboard as Dashboard,
    type DashboardSummaryResponse as DashboardSummaryResponse,
    type DashboardSummaryParams as DashboardSummaryParams,
  };

  export {
    Search as Search,
    type SearchQuickResponse as SearchQuickResponse,
    type SearchQuickParams as SearchQuickParams,
  };

  export {
    Google as Google,
    type GoogleStatusResponse as GoogleStatusResponse,
    type GooglePurgeSyncedDataResponse as GooglePurgeSyncedDataResponse,
    type GoogleRevokeAccessResponse as GoogleRevokeAccessResponse,
    type GoogleSyncNowResponse as GoogleSyncNowResponse,
    type GoogleSetAutoCreateResponse as GoogleSetAutoCreateResponse,
    type GoogleSuppressDomainResponse as GoogleSuppressDomainResponse,
    type GoogleThreadResponse as GoogleThreadResponse,
    type GoogleEventResponse as GoogleEventResponse,
    type GoogleSetAutoCreateParams as GoogleSetAutoCreateParams,
    type GoogleSuppressDomainParams as GoogleSuppressDomainParams,
  };

  export {
    Microsoft as Microsoft,
    type MicrosoftStatusResponse as MicrosoftStatusResponse,
    type MicrosoftPurgeSyncedDataResponse as MicrosoftPurgeSyncedDataResponse,
    type MicrosoftRevokeAccessResponse as MicrosoftRevokeAccessResponse,
    type MicrosoftSyncNowResponse as MicrosoftSyncNowResponse,
    type MicrosoftSetAutoCreateResponse as MicrosoftSetAutoCreateResponse,
    type MicrosoftSetAutoCreateParams as MicrosoftSetAutoCreateParams,
  };

  export { Settings as Settings, type SettingModelCatalogResponse as SettingModelCatalogResponse };

  export {
    Workspace as Workspace,
    type WorkspaceListResponse as WorkspaceListResponse,
    type WorkspaceUpdateResponse as WorkspaceUpdateResponse,
    type WorkspaceUpdateParams as WorkspaceUpdateParams,
  };

  export {
    Sso as Sso,
    type SsoSignInOptionsResponse as SsoSignInOptionsResponse,
    type SsoSettingsResponse as SsoSettingsResponse,
    type SsoListResponse as SsoListResponse,
    type SsoRegisterResponse as SsoRegisterResponse,
    type SsoDeleteResponse as SsoDeleteResponse,
    type SsoListParams as SsoListParams,
    type SsoRegisterParams as SsoRegisterParams,
  };

  export {
    Slack as Slack,
    type SlackStatusResponse as SlackStatusResponse,
    type SlackMatchesResponse as SlackMatchesResponse,
    type SlackRefreshPeopleResponse as SlackRefreshPeopleResponse,
    type SlackDisconnectResponse as SlackDisconnectResponse,
  };

  export {
    SavedViews as SavedViews,
    type SavedViewListResponse as SavedViewListResponse,
    type SavedViewCreateResponse as SavedViewCreateResponse,
    type SavedViewUpdateResponse as SavedViewUpdateResponse,
    type SavedViewDeleteResponse as SavedViewDeleteResponse,
    type SavedViewListParams as SavedViewListParams,
    type SavedViewCreateParams as SavedViewCreateParams,
    type SavedViewUpdateParams as SavedViewUpdateParams,
  };
}

const headerExplicitlyOmitted = (source: HeadersLike | undefined, name: string): boolean => {
  if (!source || Array.isArray(source) || source instanceof Headers) return false;
  const target = name.toLowerCase();
  return Object.entries(source).some(([key, value]) => key.toLowerCase() === target && value === null);
};

const appendAuthCookies = (headers: Headers, cookies: Record<string, string>): void => {
  for (const [name, value] of Object.entries(cookies)) {
    if (cookieHeaderHas(headers.get('Cookie'), name)) continue;
    const cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    const existing = headers.get('Cookie');
    headers.set('Cookie', existing ? existing + '; ' + cookie : cookie);
  }
};

const cookieHeaderHas = (value: string | null, name: string): boolean => {
  if (!value) return false;
  const target = encodeURIComponent(name) + '=';
  return value.split(';').some((cookie) => cookie.trim().startsWith(target));
};
