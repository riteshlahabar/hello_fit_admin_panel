// Typed calls for the admin review routes (PDF 6.10), matching
// hello_fit_backend/src/modules/review/review.controller.ts.
//
// **Both directions, as two separate screens** — client instruction,
// 10 Nov 2026. A customer's review of a provider is public once published; a
// provider's review of a customer is **internal**, carries a
// `confidentialNote`, and the customer never sees it. Two audiences and two
// moderation rules, so they are two menus rather than one table with a
// direction column — a note that applies to half the rows is a footgun.
//
// These admin routes are the only place the confidential note is served:
// `@AllowAudience('admin')` plus `reviews:view`. It must never be copied onto
// a customer-facing response.
//
// 6.10 also mentions "view support inquiries or complaints **if the
// corresponding module is enabled**". There is no such module, so the screen
// shows reviews and the reports raised against them, which is the complaint
// trail that does exist.

import { api } from './api';
import { listed, qs } from './masters.api';
import type { ListQuery } from './masters.api';

export type ReviewState =
  | 'PENDING'
  | 'SUBMITTED'
  | 'PUBLISHED'
  | 'FLAGGED'
  | 'HIDDEN'
  | 'EXPIRED';

export interface ReviewReport {
  id: string;
  reason: string;
}

export type ReviewDirection = 'CUSTOMER_TO_INSTRUCTOR' | 'INSTRUCTOR_TO_CUSTOMER';

export interface Review {
  direction: ReviewDirection;
  /** Instructor-to-customer only. Admin eyes only. */
  confidentialNote: string | null;
  id: string;
  overallRating: number;
  comment: string | null;
  tags: string[];
  state: ReviewState;
  flagReason: string | null;
  hiddenReason: string | null;
  reply: string | null;
  publishedAt: string | null;
  createdAt: string;
  booking: { id: string; code: string } | null;
  session: { id: string; sessionDate: string } | null;
  reports: ReviewReport[];
  /** Resolved server-side — author and subject are polymorphic ids. */
  customerName: string | null;
  instructorName: string | null;
}

export interface ReviewListQuery extends ListQuery {
  state?: ReviewState | '';
  rating?: number;
  direction?: ReviewDirection;
}

export const reviewsApi = {
  list: async (query: ReviewListQuery = {}) =>
    listed<Review>(await api.get<Review[]>(`/admin/reviews${qs(query)}`)),

  /** `reviews:approve`. Publishes if the blind rule allows. */
  approve: (id: string, reason?: string) =>
    api.post<Review>(`/admin/reviews/${id}/approve`, reason ? { reason } : {}),

  /** `reviews:edit`. Removes it from customer-facing platforms. */
  hide: (id: string, reason?: string) =>
    api.post<Review>(`/admin/reviews/${id}/hide`, reason ? { reason } : {}),
};

/**
 * The state filter offers **Pending and Submitted only** — client instruction,
 * 10 Nov 2026. The enum still has PUBLISHED, FLAGGED, HIDDEN and EXPIRED and
 * rows in those states still appear in the table; they are simply not
 * filterable, because what an operator is looking for here is the queue of
 * reviews not yet dealt with.
 */
export const REVIEW_STATE_FILTERS: { value: ReviewState; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUBMITTED', label: 'Submitted' },
];

/** Every state, for rendering a badge on whatever the row actually is. */
export const REVIEW_STATES: { value: ReviewState; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'FLAGGED', label: 'Flagged' },
  { value: 'HIDDEN', label: 'Hidden' },
  { value: 'EXPIRED', label: 'Expired' },
];
