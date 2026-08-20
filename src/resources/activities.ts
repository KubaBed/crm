// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { path as __scalarPath } from '../internal/utils/path';

export class Activities extends APIResource {
  /**
   * @param {ActivityTimelineParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ActivityTimelineResponse>} Successful response
   *
   * @example
   * ```ts
   * const timeline = await client.activities.timeline({
   *   filter: 'all',
   *   limit: 30,
   * });
   * ```
   */
  timeline(
    query: ActivityTimelineParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ActivityTimelineResponse> {
    return this._client.get('/activities', { query, ...options });
  }

  /**
   * @param {ActivityCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ActivityCreateResponse>} Successful response
   *
   * @example
   * ```ts
   * const create = await client.activities.create({
   *   type: 'NOTE',
   * });
   * ```
   */
  create(body: ActivityCreateParams, options?: RequestOptions): APIPromise<ActivityCreateResponse> {
    return this._client.post('/activities', { body, ...options });
  }

  /**
   * @param {ActivityTimelineCountsParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ActivityTimelineCountsResponse>} Successful response
   *
   * @example
   * ```ts
   * const timelineCounts = await client.activities.timelineCounts();
   * ```
   */
  timelineCounts(
    query: ActivityTimelineCountsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ActivityTimelineCountsResponse> {
    return this._client.get('/activities/counts', { query, ...options });
  }

  /**
   * @param {ActivityMyTasksParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ActivityMyTasksResponse>} Successful response
   *
   * @example
   * ```ts
   * const myTasks = await client.activities.myTasks({
   *   window: 'all',
   *   limit: 25,
   * });
   * ```
   */
  myTasks(
    query: ActivityMyTasksParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ActivityMyTasksResponse> {
    return this._client.get('/activities/my-tasks', { query, ...options });
  }

  /**
   * @param {string} id
   * @param {ActivityCompleteParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<ActivityCompleteResponse>} Successful response
   *
   * @example
   * ```ts
   * const complete = await client.activities.complete('id', {
   *   completed: true,
   * });
   * ```
   */
  complete(
    id: string,
    body: ActivityCompleteParams,
    options?: RequestOptions,
  ): APIPromise<ActivityCompleteResponse> {
    return this._client.patch(__scalarPath`/activities/${id}/complete`, { body, ...options });
  }
}

export interface ActivityTimelineParams {
  companyId?: string;
  contactId?: string;
  dealId?: string;
  /**
   * @default all
   */
  filter?: 'all' | 'history' | 'notes' | 'upcoming' | 'done' | 'email' | 'meetings';
  cursor?: string;
  /**
   * @default 30
   * @minimum 1
   * @maximum 100
   */
  limit?: number;
}

export interface ActivityTimelineResponse {
  entries: Array<ActivityTimelineResponse.Entry>;
  nextCursor: string | null;
}

export namespace ActivityTimelineResponse {
  export interface Entry {
    id: string;
    type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'STAGE_CHANGE' | 'ENRICHMENT';
    subject: string | null;
    body: string | null;
    occurredAt: string | null;
    dueAt: string | null;
    completedAt: string | null;
    meta: Record<string, string | number | boolean | Array<unknown> | Record<string, unknown> | null> | null;
    createdAt: string;
    createdBy: Entry.CreatedBy;
    company: Entry.Company | null;
    contact: Entry.Contact | null;
    deal: Entry.Deal | null;
    emailThread: Entry.EmailThread | null;
    calendarEvent: Entry.CalendarEvent | null;
  }

  export namespace Entry {
    export interface CreatedBy {
      id: string;
      name: string;
      email: string;
      image: string | null;
    }

    export interface Company {
      id: string;
      name: string;
    }

    export interface Contact {
      id: string;
      firstName: string;
      lastName: string | null;
    }

    export interface Deal {
      id: string;
      name: string;
    }

    export interface EmailThread {
      id: string;
      messageCount: number;
      lastMessageAt: string;
    }

    export interface CalendarEvent {
      id: string;
      startsAt: string;
      endsAt: string;
      isAllDay: boolean;
      location: string | null;
      conferenceUrl: string | null;
      attendeeCount: number;
    }
  }
}

export interface ActivityCreateParams {
  type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK';
  subject?: string;
  body?: string;
  occurredAt?: string;
  dueAt?: string | null;
  companyId?: string;
  contactId?: string;
  dealId?: string;
}

export interface ActivityCreateResponse {
  id: string;
  type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'STAGE_CHANGE' | 'ENRICHMENT';
  subject: string | null;
  body: string | null;
  occurredAt: string | null;
  dueAt: string | null;
  completedAt: string | null;
  meta: Record<string, string | number | boolean | Array<unknown> | Record<string, unknown> | null> | null;
  createdAt: string;
  createdBy: ActivityCreateResponse.CreatedBy;
  company: ActivityCreateResponse.Company | null;
  contact: ActivityCreateResponse.Contact | null;
  deal: ActivityCreateResponse.Deal | null;
  emailThread: ActivityCreateResponse.EmailThread | null;
  calendarEvent: ActivityCreateResponse.CalendarEvent | null;
}

export namespace ActivityCreateResponse {
  export interface CreatedBy {
    id: string;
    name: string;
    email: string;
    image: string | null;
  }

  export interface Company {
    id: string;
    name: string;
  }

  export interface Contact {
    id: string;
    firstName: string;
    lastName: string | null;
  }

  export interface Deal {
    id: string;
    name: string;
  }

  export interface EmailThread {
    id: string;
    messageCount: number;
    lastMessageAt: string;
  }

  export interface CalendarEvent {
    id: string;
    startsAt: string;
    endsAt: string;
    isAllDay: boolean;
    location: string | null;
    conferenceUrl: string | null;
    attendeeCount: number;
  }
}

export interface ActivityTimelineCountsParams {
  companyId?: string;
  contactId?: string;
  dealId?: string;
}

export interface ActivityTimelineCountsResponse {
  all: number;
  notes: number;
  upcoming: number;
  done: number;
  email: number;
  meetings: number;
}

export interface ActivityMyTasksParams {
  /**
   * @default all
   */
  window?: 'overdue' | 'upcoming' | 'all';
  /**
   * @default 25
   * @minimum 1
   * @maximum 100
   */
  limit?: number;
}

export type ActivityMyTasksResponse = Array<ActivityMyTasksResponse.ActivityMyTasksResponseItem>;

export namespace ActivityMyTasksResponse {
  export interface ActivityMyTasksResponseItem {
    id: string;
    type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'STAGE_CHANGE' | 'ENRICHMENT';
    subject: string | null;
    body: string | null;
    occurredAt: string | null;
    dueAt: string | null;
    completedAt: string | null;
    meta: Record<string, string | number | boolean | Array<unknown> | Record<string, unknown> | null> | null;
    createdAt: string;
    createdBy: ActivityMyTasksResponseItem.CreatedBy;
    company: ActivityMyTasksResponseItem.Company | null;
    contact: ActivityMyTasksResponseItem.Contact | null;
    deal: ActivityMyTasksResponseItem.Deal | null;
    emailThread: ActivityMyTasksResponseItem.EmailThread | null;
    calendarEvent: ActivityMyTasksResponseItem.CalendarEvent | null;
  }

  export namespace ActivityMyTasksResponseItem {
    export interface CreatedBy {
      id: string;
      name: string;
      email: string;
      image: string | null;
    }

    export interface Company {
      id: string;
      name: string;
    }

    export interface Contact {
      id: string;
      firstName: string;
      lastName: string | null;
    }

    export interface Deal {
      id: string;
      name: string;
    }

    export interface EmailThread {
      id: string;
      messageCount: number;
      lastMessageAt: string;
    }

    export interface CalendarEvent {
      id: string;
      startsAt: string;
      endsAt: string;
      isAllDay: boolean;
      location: string | null;
      conferenceUrl: string | null;
      attendeeCount: number;
    }
  }
}

export interface ActivityCompleteParams {
  /**
   * @default true
   */
  completed?: boolean;
}

export interface ActivityCompleteResponse {
  id: string;
  type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'STAGE_CHANGE' | 'ENRICHMENT';
  subject: string | null;
  body: string | null;
  occurredAt: string | null;
  dueAt: string | null;
  completedAt: string | null;
  meta: Record<string, string | number | boolean | Array<unknown> | Record<string, unknown> | null> | null;
  createdAt: string;
  createdBy: ActivityCompleteResponse.CreatedBy;
  company: ActivityCompleteResponse.Company | null;
  contact: ActivityCompleteResponse.Contact | null;
  deal: ActivityCompleteResponse.Deal | null;
  emailThread: ActivityCompleteResponse.EmailThread | null;
  calendarEvent: ActivityCompleteResponse.CalendarEvent | null;
}

export namespace ActivityCompleteResponse {
  export interface CreatedBy {
    id: string;
    name: string;
    email: string;
    image: string | null;
  }

  export interface Company {
    id: string;
    name: string;
  }

  export interface Contact {
    id: string;
    firstName: string;
    lastName: string | null;
  }

  export interface Deal {
    id: string;
    name: string;
  }

  export interface EmailThread {
    id: string;
    messageCount: number;
    lastMessageAt: string;
  }

  export interface CalendarEvent {
    id: string;
    startsAt: string;
    endsAt: string;
    isAllDay: boolean;
    location: string | null;
    conferenceUrl: string | null;
    attendeeCount: number;
  }
}
export declare namespace Activities {
  export {
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
}
