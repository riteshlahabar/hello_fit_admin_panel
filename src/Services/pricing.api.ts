// Typed calls for the pricing menu — /admin/packages.
//
// Admin sets every price and a provider never does (client, 17-11-2026), so
// unlike the Services screen this is full CRUD. Two shapes to know:
//
//   * **Status is its own route** (`PATCH :id/status`), not a field on the
//     edit body — which is why the screen passes a `rowActions` button rather
//     than an Active checkbox on the dialog when editing.
//   * A package holds a **percent**, never a price. The money is
//     `Service.basePrice`: base x persons x sessions, then the percent.
//
// Group Slabs were deleted on 18-11-2026 — a group deal is now a package
// with `persons` above 1, sold on the services the admin ticks.
//
// Trainer Categories were deleted on 19-11-2026 (client). Commission is now a
// percent on the service, overridable per provider — not a band.
// → state/pricing-rules.md

import { api } from './api';
import { listed, qs } from './masters.api';
import type { ListQuery } from './masters.api';

export interface Package {
  id: string;
  name: string;
  /** Card symbol — an emoji or glyph; null means the card draws its own. */
  icon: string | null;
  sessionCount: number;
  /** People attending each session; the package decides the head count. */
  persons: number;
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
  /** The services this package is sold on; empty means sold nowhere. */
  services?: { id: string; name: string }[];
}



/**
 * Weekdays arrive comma-joined from the dialog's seven checkboxes. **No day
 * ticked means "any weekday", so an empty value sends `[]`** rather than
 * being dropped — dropping it left the stored days untouched and a package
 * could never be opened back up to the whole week (18 Nov 2026).
 */
function weekdaysBody(body: Record<string, unknown>): Record<string, unknown> {
  const raw = body.allowedWeekdays;
  if (raw === undefined) return body;

  return {
    ...body,
    allowedWeekdays: String(raw)
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((day) => Number.isInteger(day)),
  };
}

/**
 * The services multi-select arrives comma-joined from the dialog. An empty
 * value is still sent rather than dropped — the API refuses `[]` now that one
 * service is compulsory (client, 19 Nov 2026), and dropping it on a PATCH
 * would silently leave the old links in place instead.
 */
function packageBody(body: Record<string, unknown>): Record<string, unknown> {
  const withDays = weekdaysBody(body);
  const raw = withDays.serviceIds;
  if (raw === undefined) return withDays;

  return {
    ...withDays,
    serviceIds: String(raw).split(',').filter(Boolean),
  };
}

const PACKAGES = '/admin/packages';

export const pricingApi = {
  packages: {
    list: async (query: ListQuery = {}) =>
      listed<Package>(await api.get<Package[]>(`${PACKAGES}${qs(query)}`)),
    create: (body: Record<string, unknown>) =>
      api.post<Package>(PACKAGES, packageBody(body)),
    update: (id: string, body: Record<string, unknown>) =>
      api.patch<Package>(`${PACKAGES}/${id}`, packageBody(body)),
    /** Hard delete; refused while a booking points at the package. */
    remove: (id: string) => api.delete(`${PACKAGES}/${id}`),
    /** Reports the booking count in its message when deactivating. */
    setStatus: (id: string, isActive: boolean) =>
      api.patch<Package>(`${PACKAGES}/${id}/status`, { isActive }),
  },

};
