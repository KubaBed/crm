// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { path as __scalarPath } from '../../internal/utils/path';

export class Channels extends APIResource {
  /**
   * @param {ChannelListParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ChannelListResponse>} Successful response
   *
   * @example
   * ```ts
   * const list = await client.slack.channels.list();
   * ```
   */
  list(
    query: ChannelListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ChannelListResponse> {
    return this._client.get('/slack/channels', { query, ...options });
  }

  /**
   * @param {ChannelCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ChannelCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const create = await client.slack.channels.create({
   *   name: 'x',
   *   isPrivate: false,
   * });
   * ```
   */
  create(body: ChannelCreateParams, options?: RequestOptions): APIPromise<ChannelCreateResponse> {
    return this._client.post('/slack/channels', { body, ...options });
  }

  /**
   * @param {string} channelID
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ChannelJoinResponse>} Successful response
   *
   * @example
   * ```ts
   * const join = await client.slack.channels.join('channelId');
   * ```
   */
  join(channelID: string, options?: RequestOptions): APIPromise<ChannelJoinResponse> {
    return this._client.post(__scalarPath`/slack/channels/${channelID}/join`, options);
  }
}

export interface ChannelListParams {
  /**
   * @minLength 1
   * @maxLength 64
   */
  cursor?: string | null;
  /**
   * @minimum 1
   * @maximum 100
   */
  limit?: number;
  /**
   * @maxLength 120
   */
  query?: string;
}

export interface ChannelListResponse {
  canInviteItself: boolean;
  sync: 'idle' | 'syncing' | 'stalled';
  nextCursor: string | null;
  rows: Array<ChannelListResponse.Row>;
}

export namespace ChannelListResponse {
  export interface Row {
    id: string;
    name: string;
    memberCount: number | null;
    isPrivate: boolean;
    isMember: boolean;
    classified: boolean;
    inviteRequestedAt: string | null;
  }
}

export interface ChannelCreateParams {
  /**
   * @minLength 1
   * @maxLength 80
   * @pattern ^[a-z0-9-_]+$
   */
  name: string;
  /**
   * @default false
   */
  isPrivate?: boolean;
}

export interface ChannelCreateResponse {
  channel: ChannelCreateResponse.Channel;
}

export namespace ChannelCreateResponse {
  export interface Channel {
    id: string;
    name: string;
  }
}

export interface ChannelJoinResponse {
  queued: boolean;
  alreadyJoined: boolean;
}
export declare namespace Channels {
  export {
    type ChannelListResponse as ChannelListResponse,
    type ChannelCreateResponse as ChannelCreateResponse,
    type ChannelJoinResponse as ChannelJoinResponse,
    type ChannelListParams as ChannelListParams,
    type ChannelCreateParams as ChannelCreateParams,
  };
}
