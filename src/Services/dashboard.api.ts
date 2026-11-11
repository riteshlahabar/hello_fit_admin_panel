// Typed call for the dashboard summary (PDF 6.2), matching
// hello_fit_backend/src/modules/dashboard/admin-dashboard.controller.ts.
//
// One route, one request. The tiles are counted in the database, so the screen
// never sums rows of its own — a dashboard that adds up a page of results
// quietly reports the page instead of the platform.

import { api } from './api';

export interface CustomerCounts {
  total: number;
  active: number;
  suspended: number;
  blocked: number;
}

export interface InstructorCounts {
  total: number;
  active: number;
  suspended: number;
  pendingApplications: number;
  kycPending: number;
}

export type BookingPaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'FAILED';

/** The six main session statuses; the API rolls the other seven up or out. */
export interface SessionStatusCounts {
  confirmed: number;
  assigned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export type PaymentState =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED';

export interface DashboardSummary {
  /** The calendar day the booking, session and payment counts describe. */
  date: string;
  customers: CustomerCounts;
  instructors: InstructorCounts;
  bookings: {
    total: number;
    byPaymentStatus: Record<BookingPaymentStatus, number>;
  };
  sessions: { total: number; byStatus: SessionStatusCounts };
  /** Decimal amounts arrive as strings, as everywhere else in the API. */
  payments: Record<PaymentState, { count: number; amount: string | number }>;
}

export const dashboardApi = {
  /** Omit the date and the API answers for today. */
  summary: (date?: string, signal?: AbortSignal) =>
    api.get<DashboardSummary>(
      `/admin/dashboard/summary${date ? `?date=${date}` : ''}`,
      signal,
    ),
};
