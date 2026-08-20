// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';

export class Dashboard extends APIResource {
  /**
   * @param {DashboardSummaryParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns {APIPromise<DashboardSummaryResponse>} Successful response
   *
   * @example
   * ```ts
   * const summary = await client.dashboard.summary({
   *   scope: 'me',
   * });
   * ```
   */
  summary(
    query: DashboardSummaryParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<DashboardSummaryResponse> {
    return this._client.get('/dashboard/summary', { query, ...options });
  }
}

export interface DashboardSummaryParams {
  /**
   * @default me
   */
  scope?: 'me' | 'everyone';
}

export interface DashboardSummaryResponse {
  scope: 'me' | 'everyone';
  reportingCurrency: string;
  unconverted: DashboardSummaryResponse.Unconverted;
  pipeline: DashboardSummaryResponse.Pipeline;
  wonThisMonth: DashboardSummaryResponse.WonThisMonth;
  wonPrevMonth: DashboardSummaryResponse.WonPrevMonth;
  performance: DashboardSummaryResponse.Performance;
  trend: Array<DashboardSummaryResponse.Trend>;
  closingThisMonthTotal: DashboardSummaryResponse.ClosingThisMonthTotal;
  biggestOpen: Array<DashboardSummaryResponse.BiggestOpen>;
  overdueTasks: Array<DashboardSummaryResponse.OverdueTask>;
  recentActivity: Array<DashboardSummaryResponse.RecentActivity>;
}

export namespace DashboardSummaryResponse {
  export interface Unconverted {
    count: number;
    currencies: Array<string>;
  }

  export interface Pipeline {
    stages: Array<Pipeline.Stage>;
    totalCents: number;
    totalDeals: number;
  }

  export namespace Pipeline {
    export interface Stage {
      stage:
        | 'DEMO_BOOKED'
        | 'QUALIFIED_TO_BUY'
        | 'UNQUALIFIED_TO_BUY'
        | 'DECISION_MAKER_BOUGHT_IN'
        | 'CONTRACT_SENT'
        | 'CLOSED_WON'
        | 'CLOSED_LOST';
      count: number;
      valueCents: number;
    }
  }

  export interface WonThisMonth {
    count: number;
    valueCents: number;
  }

  export interface WonPrevMonth {
    count: number;
    valueCents: number;
  }

  export interface Performance {
    windowDays: number;
    wins: number;
    losses: number;
    winRate: number | null;
    avgDealCents: number | null;
    avgCycleDays: number | null;
  }

  export interface Trend {
    month: string;
    won: number;
    created: number;
  }

  export interface ClosingThisMonthTotal {
    count: number;
    valueCents: number;
  }

  export interface BiggestOpen {
    id: string;
    name: string;
    stage:
      | 'DEMO_BOOKED'
      | 'QUALIFIED_TO_BUY'
      | 'UNQUALIFIED_TO_BUY'
      | 'DECISION_MAKER_BOUGHT_IN'
      | 'CONTRACT_SENT'
      | 'CLOSED_WON'
      | 'CLOSED_LOST';
    currency: string;
    company: BiggestOpen.Company;
    owner: BiggestOpen.Owner;
    amountCents: number | null;
    baseAmountCents: number | null;
    expectedCloseDate: string | null;
    stageChangedAt: string;
  }

  export namespace BiggestOpen {
    export interface Company {
      id: string;
      name: string;
      iconUrl: string | null;
      iconDarkUrl: string | null;
      iconTone: string | null;
    }

    export interface Owner {
      id: string;
      name: string;
      email: string;
      image: string | null;
    }
  }

  export interface OverdueTask {
    id: string;
    subject: string | null;
    company: OverdueTask.Company | null;
    deal: OverdueTask.Deal | null;
    dueAt: string | null;
  }

  export namespace OverdueTask {
    export interface Company {
      id: string;
      name: string;
    }

    export interface Deal {
      id: string;
      name: string;
    }
  }

  export interface RecentActivity {
    id: string;
    type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'STAGE_CHANGE' | 'ENRICHMENT';
    subject: string | null;
    body: string | null;
    createdBy: RecentActivity.CreatedBy;
    company: RecentActivity.Company | null;
    deal: RecentActivity.Deal | null;
    createdAt: string;
    meta: Record<string, string | number | boolean | Array<unknown> | Record<string, unknown> | null> | null;
  }

  export namespace RecentActivity {
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

    export interface Deal {
      id: string;
      name: string;
    }
  }
}
export declare namespace Dashboard {
  export {
    type DashboardSummaryResponse as DashboardSummaryResponse,
    type DashboardSummaryParams as DashboardSummaryParams,
  };
}
