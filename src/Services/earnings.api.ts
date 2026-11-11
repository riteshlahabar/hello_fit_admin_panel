// Typed calls for /admin/earnings/* (PDF 6.8), matching the NestJS DTOs in
// hello_fit_backend/src/modules/payout/dto/.
//
// 6.8 wants: relevant booking values, recorded deductions, instructor earnings
// information, and payout status. All four are on the row — `sessionValue`,
// `deductions`, `commissionAmount`/`netAmount`, and the batch the earning
// landed in.
//
// **Two things 6.8 mentions are deliberately absent.** "Configure or maintain
// agreed commission parameters **where included**" is conditional, and there
// is no admin CRUD over `CommissionRule` — ask before building one. And 6.8
// itself excludes "automated provider settlements, split payments and advanced
// accounting functionality... unless separately agreed", so this screen reads
// and holds; it never moves money.

import { api } from './api';
import { listed, qs } from './masters.api';
import type { ListQuery } from './masters.api';

export type EarningStatus =
  | 'PENDING'
  | 'PAYABLE'
  | 'PAID'
  | 'WITHHELD';

export interface PayoutRef {
  id: string;
  status: string;
  cycleFrom: string;
  cycleTo: string;
  utr: string | null;
}

export interface Earning {
  id: string;
  sessionValue: string;
  commissionAmount: string;
  deductions: string;
  netAmount: string;
  status: EarningStatus;
  payableFrom: string | null;
  withheldReason: string | null;
  createdAt: string;
  instructor: { id: string; name: string } | null;
  session: {
    id: string;
    sequence: number;
    sessionDate: string;
    booking: { code: string } | null;
    service: { name: string } | null;
  } | null;
  payoutItem: { payoutId: string; payout: PayoutRef | null } | null;
}

export interface EarningListQuery extends ListQuery {
  instructorId?: string;
  status?: EarningStatus | '';
  /** Session-date range: finance reconciles by when the work happened. */
  from?: string;
  to?: string;
}

export const earningsApi = {
  list: async (query: EarningListQuery = {}) =>
    listed<Earning>(await api.get<Earning[]>(`/admin/earnings${qs(query)}`)),

  /** `finance:edit`. Holds this earning out of every future batch. */
  withhold: (id: string, reason: string) =>
    api.post<Earning>(`/admin/earnings/${id}/withhold`, { reason }),

  /** `finance:edit`. Puts it back in line for the next batch. */
  release: (id: string, reason?: string) =>
    api.post<Earning>(
      `/admin/earnings/${id}/release`,
      reason ? { reason } : {},
    ),
};

export const EARNING_STATUSES: { value: EarningStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAYABLE', label: 'Payable' },
  { value: 'PAID', label: 'Paid' },
  { value: 'WITHHELD', label: 'Withheld' },
];
