// Typed calls for /admin/customers/*, matching the NestJS DTOs in
// hello_fit_backend/src/modules/customer/dto/admin-customer.dto.ts.
//
// Two absences in the API shape the screen:
//
//   - **There is no create route.** A customer account is made by OTP signup
//     (`auth.verifyLoginOtp` writes the profile on first login), so an admin
//     "adding" one would mint an account whose owner cannot sign into it.
//   - **There is no delete route.** Removal is the deletion-request workflow
//     (spec 10.3) with retention rules a table action must not shortcut.
//
// And two things that look like one action but are not. **Suspend** writes
// `User.status` and revokes the refresh tokens — the login stops working.
// **Block** writes `CustomerProfile.isBlocked` — the login still works and the
// history is still readable, but `booking.create` refuses them. Both are
// `customers:approve`; editing the profile is `customers:edit`.
//
// `qs` and `listed` come from masters.api — every admin list endpoint answers
// the same envelope and there is no reason for a third copy.

import { api } from './api';
import { listed, qs } from './masters.api';
import type { Listed, ListQuery } from './masters.api';
import type { UserStatus } from './admins.api';

/** Mirrors the Prisma `TrustBand` enum (spec 4.6). */
export type TrustBand = 'NEW' | 'GOOD' | 'CAUTION' | 'RESTRICTED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED';

/** The account half of a customer. Status and mobile live on `User`. */
export interface CustomerAccount {
  id: string;
  mobile: string;
  email: string | null;
  status: UserStatus;
  lastLoginAt: string | null;
  language?: string;
  suspendedAt?: string | null;
  suspendReason?: string | null;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  gender: Gender;
  dob: string | null;
  goal: string | null;
  healthNotes: string | null;
  /** Derived from teacher-to-customer reviews; not editable here. */
  trustScore: string;
  trustBand: TrustBand;
  referralCode: string;
  referredById: string | null;
  isBlocked: boolean;
  blockReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: CustomerAccount;
  _count?: { bookings: number; addresses: number; referrals?: number };
}

export interface CustomerListQuery extends ListQuery {
  status?: UserStatus | '';
  trustBand?: TrustBand | '';
  isBlocked?: boolean;
  includeDeleted?: boolean;
}

const BASE = '/admin/customers';

export const customersApi = {
  list: async (query: CustomerListQuery = {}) =>
    listed<Customer>(await api.get<Customer[]>(`${BASE}${qs(query)}`)),

  /** Detail adds `addresses` and the wallet balance. */
  get: (id: string) => api.get<Customer>(`${BASE}/${id}`),

  /** `customers:edit`. Name, gender, dob, goal and health notes only. */
  update: (id: string, body: Record<string, unknown>) =>
    api.patch<Customer>(`${BASE}/${id}`, body),

  /** `customers:approve`. Suspending revokes their app sessions. */
  changeStatus: (id: string, body: { status: UserStatus; reason: string }) =>
    api.post<Customer & { revokedSessions: number; upcomingSessions: number }>(
      `${BASE}/${id}/status`,
      body,
    ),

  /** `customers:approve`. The blacklist. A reason is required to set it. */
  setBlocked: (id: string, body: { isBlocked: boolean; reason?: string }) =>
    api.post<Customer & { upcomingSessions: number }>(
      `${BASE}/${id}/block`,
      body,
    ),
};

export type { Listed };
