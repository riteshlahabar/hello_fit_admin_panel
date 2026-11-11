// Typed calls for /admin/reports/*, matching the NestJS DTO in
// hello_fit_backend/src/modules/reports/dto/reports.dto.ts.
//
// PDF 6.12 grants four summaries and gates export: "only where explicitly
// included in the agreed report requirements". None are agreed, so there is
// **no export call here** — the backend has no route to call.
//
// Every report takes the same inclusive calendar-day range and echoes it back
// as `range`, which is what lets the screen show what it asked for rather
// than the default it silently got.

import { api } from './api';
import { qs } from './masters.api';

export interface ReportRange {
  from: string;
  to: string;
  days: number;
}

/**
 * Index signature so `qs()` accepts it — `ListQuery` is typed for the list
 * endpoints and this is not one, but the serialising is identical.
 */
export interface RangeQuery {
  from?: string;
  to?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface AccountsReport {
  range: ReportRange;
  customers: {
    total: number;
    active: number;
    suspended: number;
    blocked: number;
    newInRange: number;
  };
  providers: {
    total: number;
    active: number;
    pendingApplications: number;
    kycPending: number;
    newApplicationsInRange: number;
    newApprovedInRange: number;
  };
}

export interface BookingsReport {
  range: ReportRange;
  rows: {
    date: string;
    bookings: number;
    sessions: number;
    gross: number;
    discount: number;
    net: number;
  }[];
  totals: {
    bookings: number;
    sessions: number;
    gross: number;
    discount: number;
    net: number;
    payable: number;
  };
}

export interface PaymentsReport {
  range: ReportRange;
  rows: { status: string; count: number; amount: number }[];
  refunds: { count: number; amount: number };
  totals: { count: number; amount: number };
}

export interface StatusReport {
  range: ReportRange;
  total: number;
  rows: { status: string; sessions: number; percent: number }[];
}

const BASE = '/admin/reports';

export const reportsApi = {
  accounts: (query: RangeQuery = {}) =>
    api.get<AccountsReport>(`${BASE}/customers-providers${qs(query)}`),
  bookings: (query: RangeQuery = {}) =>
    api.get<BookingsReport>(`${BASE}/bookings${qs(query)}`),
  payments: (query: RangeQuery = {}) =>
    api.get<PaymentsReport>(`${BASE}/payments${qs(query)}`),
  bookingStatus: (query: RangeQuery = {}) =>
    api.get<StatusReport>(`${BASE}/booking-status${qs(query)}`),
};

/** `₹1,234.00` — the panel shows money the same way everywhere. */
export function rupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Calendar day as YYYY-MM-DD, offset by whole days from today. */
export function day(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${String(d.getDate()).padStart(2, '0')}`;
}

/** `CANCELLED_BY_CUSTOMER` → `Cancelled by customer`. */
export function humanStatus(status: string): string {
  const words = status.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
