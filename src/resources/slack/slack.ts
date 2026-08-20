// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import * as ChannelsAPI from './channels';
import {
  Channels,
  type ChannelListResponse,
  type ChannelCreateResponse,
  type ChannelJoinResponse,
  type ChannelListParams,
  type ChannelCreateParams,
} from './channels';

export class Slack extends APIResource {
  channels: ChannelsAPI.Channels = new ChannelsAPI.Channels(this._client);

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SlackStatusResponse>} Successful response
   *
   * @example
   * ```ts
   * const status = await client.slack.status();
   * ```
   */
  status(options?: RequestOptions): APIPromise<SlackStatusResponse> {
    return this._client.get('/slack/status', options);
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SlackMatchesResponse>} Successful response
   *
   * @example
   * ```ts
   * const matches = await client.slack.matches();
   * ```
   */
  matches(options?: RequestOptions): APIPromise<SlackMatchesResponse> {
    return this._client.get('/slack/matches', options);
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SlackRefreshPeopleResponse>} Successful response
   *
   * @example
   * ```ts
   * const refreshPeople = await client.slack.refreshPeople();
   * ```
   */
  refreshPeople(options?: RequestOptions): APIPromise<SlackRefreshPeopleResponse> {
    return this._client.post('/slack/people/refresh', options);
  }

  /**
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<SlackDisconnectResponse>} Successful response
   *
   * @example
   * ```ts
   * const disconnect = await client.slack.disconnect();
   * ```
   */
  disconnect(options?: RequestOptions): APIPromise<SlackDisconnectResponse> {
    return this._client.delete('/slack/connection', options);
  }
}

export interface SlackStatusResponse {
  configured: boolean;
  connected: boolean;
  workspace: string | null;
  lastConnectedAt: string | null;
  scopes: Array<string>;
  canInviteItself: boolean;
  canManage: boolean;
  agents: Array<SlackStatusResponse.Agent>;
  people: SlackStatusResponse.People;
}

export namespace SlackStatusResponse {
  export interface Agent {
    id: string;
    name: string;
    description: string | null;
    status: 'DRAFT' | 'DEPLOYING' | 'LIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
  }

  export interface People {
    matched: number;
    reviewed: number;
  }
}

export interface SlackMatchesResponse {
  rows: Array<SlackMatchesResponse.Row>;
  sync: 'idle' | 'syncing' | 'stalled';
}

export namespace SlackMatchesResponse {
  export interface Row {
    crmUserId: string;
    name: string;
    email: string;
    match: Row.Match | null;
  }

  export namespace Row {
    export interface Match {
      slackUserId: string | null;
      slackHandle: string | null;
      slackEmail: string | null;
    }
  }
}

export interface SlackRefreshPeopleResponse {
  requested: boolean;
}

export interface SlackDisconnectResponse {
  disconnected: boolean;
}
Slack.Channels = Channels;

export declare namespace Slack {
  export {
    type SlackStatusResponse as SlackStatusResponse,
    type SlackMatchesResponse as SlackMatchesResponse,
    type SlackRefreshPeopleResponse as SlackRefreshPeopleResponse,
    type SlackDisconnectResponse as SlackDisconnectResponse,
  };

  export {
    Channels as Channels,
    type ChannelListResponse as ChannelListResponse,
    type ChannelCreateResponse as ChannelCreateResponse,
    type ChannelJoinResponse as ChannelJoinResponse,
    type ChannelListParams as ChannelListParams,
    type ChannelCreateParams as ChannelCreateParams,
  };
}
