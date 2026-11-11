// Typed calls for /admin/payments/*, matching the NestJS DTO in
// hello_fit_backend/src/modules/payment/dto/admin-payment.dto.ts.
//
// **Every route is a GET.** PDF 6.7's seven functionalities are all views, and
// it defers refund initiation to "the selected payment gateway and the agreed
// refund workflow" — so there is no refund, capture or retry call here.
//
// The gateway's verbatim response (`rawPayload`) is never serialised by the
// API: 6.7's acceptance criteria require that sensitive payment credentials
// are not exposed through the admin interface.

import { api } from './api';
import { listed, qs } from './masters.api';
import type { ListQuery } from './masters.api';

export type PaymentState =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED';

export interface PaymentRow {
  id: string;
  amount: string;
  method: string | null;
  status: PaymentState;
  gateway: string;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  booking: {
    id: string;
    code: string;
    paymentStatus: string;
    customer: { id: string; name: string; user: { mobile: string } } | null;
    /** First session only — it carries the provider. */
    sessions: { instructor: { id: string; name: string } | null }[];
  } | null;
}

export interface RefundRow {
  id: string;
  amount: string;
  mode: string;
  status: string;
  slabApplied: string | null;
  gatewayRefundId: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface PaymentSummaryRow {
  status: PaymentState;
  count: number;
  amount: string;
}

export interface PaymentListQuery extends ListQuery {
  status?: PaymentState | '';
  hasGatewayRef?: boolean;
}

const BASE = '/admin/payments';

export const paymentsApi = {
  list: async (query: PaymentListQuery = {}) =>
    listed<PaymentRow>(await api.get<PaymentRow[]>(`${BASE}${qs(query)}`)),

  /** Count and total per state, across the whole filter — not just the page. */
  summary: (query: PaymentListQuery = {}) =>
    api.get<PaymentSummaryRow[]>(`${BASE}/summary${qs(query)}`),

  /** Payment + the booking's invoice + any refunds against that booking. */
  get: (id: string) => api.get<Record<string, unknown>>(`${BASE}/${id}`),
};

export const PAYMENT_STATES: { value: PaymentState; label: string }[] = [
  { value: 'CREATED', label: 'Created' },
  { value: 'AUTHORIZED', label: 'Authorized' },
  { value: 'CAPTURED', label: 'Captured' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];
