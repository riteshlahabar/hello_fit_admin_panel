// Typed calls for the three pricing menus — /admin/packages,
// /admin/group-slabs and /admin/trainer-categories.
//
// Admin sets every price and a provider never does (client, 17 Nov 2026), so
// unlike the Services screen these three are full CRUD. Two shapes they share:
//
//   * **No delete anywhere.** A booking keeps its `packageId` and the invoice
//     behind it must stay explicable, so a row leaves the dropdown by going
//     inactive. The API has no delete route to call.
//   * **Status is its own route** (`PATCH :id/status`), not a field on the
//     edit body — which is why the screens pass a `rowActions` button rather
//     than an Active checkbox on the dialog when editing.
//
// A package and a slab both hold a **percent**, never a price. The money is
// `Service.basePrice`. → state/pricing-rules.md

import { api } from './api';
import { listed, qs } from './masters.api';
import type { ListQuery } from './masters.api';

export interface Package {
  id: string;
  name: string;
  /** Card symbol — an emoji or glyph; null means the card draws its own. */
  icon: string | null;
  sessionCount: number;
  validityDays: number;
  /** Signed: +20 is the trial markup, -15 the intensive discount. */
  percentAdjust: number;
  freeSessionCount: number;
  /** 0 = Sunday to 6 = Saturday. Empty means any weekday. */
  allowedWeekdays: number[];
  fixedInstructorAllowed: boolean;
  sortOrder: number;
  isActive: boolean;
  _count?: { bookings: number };
}

export interface GroupSlab {
  id: string;
  /** The row's identity — unique, and not editable. */
  minPersons: number;
  percentOff: number;
  isActive: boolean;
}

export interface TrainerCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { instructors: number; commissionRules: number };
}

/**
 * The dialog has no array input, so weekdays are typed as "1,3,5" and parsed
 * here. Empty stays absent, which the API reads as "any weekday".
 */
function weekdaysBody(body: Record<string, unknown>): Record<string, unknown> {
  const raw = body.allowedWeekdays;
  if (raw === undefined || raw === '') {
    const { allowedWeekdays: _drop, ...rest } = body;
    return rest;
  }

  return {
    ...body,
    allowedWeekdays: String(raw)
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((day) => Number.isInteger(day)),
  };
}

const PACKAGES = '/admin/packages';
const SLABS = '/admin/group-slabs';
const CATEGORIES = '/admin/trainer-categories';

export const pricingApi = {
  packages: {
    list: async (query: ListQuery = {}) =>
      listed<Package>(await api.get<Package[]>(`${PACKAGES}${qs(query)}`)),
    create: (body: Record<string, unknown>) =>
      api.post<Package>(PACKAGES, weekdaysBody(body)),
    update: (id: string, body: Record<string, unknown>) =>
      api.patch<Package>(`${PACKAGES}/${id}`, weekdaysBody(body)),
    /** Hard delete; refused while a booking points at the package. */
    remove: (id: string) => api.delete(`${PACKAGES}/${id}`),
    /** Reports the booking count in its message when deactivating. */
    setStatus: (id: string, isActive: boolean) =>
      api.patch<Package>(`${PACKAGES}/${id}/status`, { isActive }),
  },

  groupSlabs: {
    list: async (query: ListQuery = {}) =>
      listed<GroupSlab>(await api.get<GroupSlab[]>(`${SLABS}${qs(query)}`)),
    /** A retired row for the same size is revived rather than duplicated. */
    create: (body: Record<string, unknown>) => api.post<GroupSlab>(SLABS, body),
    /** `percentOff` only — `minPersons` in the body is a 400. */
    update: (id: string, body: Record<string, unknown>) =>
      api.patch<GroupSlab>(`${SLABS}/${id}`, { percentOff: body.percentOff }),
    setStatus: (id: string, isActive: boolean) =>
      api.patch<GroupSlab>(`${SLABS}/${id}/status`, { isActive }),
    /** Nothing stores a slab, so the delete always goes through. */
    remove: (id: string) => api.delete(`${SLABS}/${id}`),
  },

  trainerCategories: {
    list: async (query: ListQuery = {}) =>
      listed<TrainerCategory>(
        await api.get<TrainerCategory[]>(`${CATEGORIES}${qs(query)}`),
      ),
    create: (body: Record<string, unknown>) =>
      api.post<TrainerCategory>(CATEGORIES, body),
    update: (id: string, body: Record<string, unknown>) =>
      api.patch<TrainerCategory>(`${CATEGORIES}/${id}`, body),
    /** Refused while providers or live commission rules point at the band. */
    setStatus: (id: string, isActive: boolean) =>
      api.patch<TrainerCategory>(`${CATEGORIES}/${id}/status`, { isActive }),
  },
};
