// Typed calls for /admin/bookings/*, matching the NestJS DTOs in
// hello_fit_backend/src/modules/booking/dto/admin-booking.dto.ts.
//
// Covers PDF 6.6 Booking Management: view records, search, customer and
// provider references, service/date/time/status, payment status, the
// acceptance-rejection-cancellation record (the status history on the detail
// response), permitted status actions, and detail for support.
//
// No create and no update. A booking is made by the customer; an admin's only
// permitted action here is cancelling, and **cancelling does not refund** —
// refunds are their own module with their own policy slabs and audit.

import { api } from './api';
import { listed, qs } from './masters.api';
import type { ListQuery } from './masters.api';

export type SessionStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'REASSIGNMENT_NEEDED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'RESCHEDULE_REQUESTED'
  | 'CANCELLED_BY_CUSTOMER'
  | 'CANCELLED_BY_TEACHER'
  | 'CANCELLED_BY_ADMIN'
  | 'NO_SHOW_CUSTOMER'
  | 'NO_SHOW_TEACHER';

export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'FAILED';

export interface BookingSessionRow {
  id: string;
  sequence: number;
  sessionDate: string;
  fromMinute: number;
  toMinute: number;
  status: SessionStatus;
  instructor: { id: string; name: string } | null;
}

export interface Booking {
  id: string;
  code: string;
  type: string;
  sessionCount: number;
  payable: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  customer: { id: string; name: string; user: { mobile: string } } | null;
  service: { id: string; name: string; durationMin: number } | null;
  sessions: BookingSessionRow[];
}

export interface BookingListQuery extends ListQuery {
  status?: SessionStatus | '';
  paymentStatus?: PaymentStatus | '';
}

const BASE = '/admin/bookings';

export const bookingsApi = {
  list: async (query: BookingListQuery = {}) =>
    listed<Booking>(await api.get<Booking[]>(`${BASE}${qs(query)}`)),

  /** Adds sessions, payments, the address and the full status history. */
  get: (id: string) => api.get<Record<string, unknown>>(`${BASE}/${id}`),

  /** `bookings:edit`. Cancels every session not already finished. */
  cancel: (id: string, reason: string) =>
    api.post<{ code: string; cancelledSessions: number }>(
      `${BASE}/${id}/cancel`,
      { reason },
    ),
};

/**
 * The one Status dropdown carries both groups — client instruction,
 * 10 Nov 2026. A value is prefixed so the screen knows which query parameter
 * it belongs to: `s:` is a session status, `p:` is a payment status.
 */
export const STATUS_OPTIONS: { value: SessionStatus; label: string }[] = [
  { value: 'PENDING_PAYMENT', label: 'Pending payment' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'REASSIGNMENT_NEEDED', label: 'Reassignment needed' },
  { value: 'EN_ROUTE', label: 'En route' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'RESCHEDULE_REQUESTED', label: 'Reschedule requested' },
  { value: 'CANCELLED_BY_CUSTOMER', label: 'Cancelled by customer' },
  { value: 'CANCELLED_BY_TEACHER', label: 'Cancelled by trainer' },
  { value: 'CANCELLED_BY_ADMIN', label: 'Cancelled by admin' },
  { value: 'NO_SHOW_CUSTOMER', label: 'No-show — customer' },
  { value: 'NO_SHOW_TEACHER', label: 'No-show — trainer' },
];

export const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PARTIALLY_REFUNDED', label: 'Partially refunded' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'FAILED', label: 'Failed' },
];

/** Minutes from midnight → "6:30 AM", the way the slot grid stores them. */
export function formatMinute(minute: number): string {
  const h24 = Math.floor(minute / 60);
  const mm = String(minute % 60).padStart(2, '0');
  const suffix = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm} ${suffix}`;
}
