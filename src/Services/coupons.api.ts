// Typed calls for /admin/coupons/*, matching the NestJS DTOs in
// hello_fit_backend/src/modules/coupon/dto/coupon.dto.ts.
//
// PDF 6.9 grants all four: create coupons, configure the code and discount
// parameters, configure validity rules, activate or deactivate. Delete is
// the house soft-delete — the row stays so a booking priced against the code
// keeps its reason.
//
// There is no get-by-id call because there is no such route: the table
// carries every field the edit dialog needs.

import { api } from './api';
import { listed, qs } from './masters.api';
import type { ListQuery } from './masters.api';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  maxDiscount: number | null;
  minBookingAmount: number;
  /** Calendar day, YYYY-MM-DD. */
  validFrom: string;
  validTo: string;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  usedCount: number;
  isActive: boolean;
  /** Derived by the API: why an active coupon may still do nothing. */
  validity: 'valid' | 'upcoming' | 'expired';
  exhausted: boolean;
}

export interface CouponListQuery extends ListQuery {
  status?: 'all' | 'active' | 'inactive';
  validity?: 'all' | 'valid' | 'upcoming' | 'expired';
}

const BASE = '/admin/coupons';

export const couponsApi = {
  list: async (query: CouponListQuery = {}) =>
    listed<Coupon>(await api.get<Coupon[]>(`${BASE}${qs(query)}`)),

  create: (body: Record<string, unknown>) => api.post<Coupon>(BASE, body),

  update: (id: string, body: Record<string, unknown>) =>
    api.patch<Coupon>(`${BASE}/${id}`, body),

  /** PDF 6.9's activate / deactivate — its own route, its own audit line. */
  setStatus: (id: string, isActive: boolean) =>
    api.post<Coupon>(`${BASE}/${id}/status`, { isActive }),

  remove: (id: string) => api.delete<{ id: string }>(`${BASE}/${id}`),
};

/** `20%` or `₹200` — the discount as one readable cell. */
export function formatDiscount(coupon: Coupon): string {
  return coupon.discountType === 'PERCENT'
    ? `${coupon.discountValue}%`
    : `₹${coupon.discountValue.toFixed(2)}`;
}
