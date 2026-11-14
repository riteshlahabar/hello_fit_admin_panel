// Typed calls for /admin/plans/*, matching the NestJS DTOs in
// hello_fit_backend/src/modules/plan/dto/plan.dto.ts.
//
// Membership plans — client instruction, 13 Nov 2026. **Not in the v3 PDF**
// (state/open-points.md); the page was supplied as a design and asked for.
//
// Three things this client deliberately does not have:
//
//   * **No delete.** The API has no route. A plan a customer has chosen cannot
//     vanish without orphaning that choice, and `isActive: false` already
//     takes it off the website — which is what "remove it" means here.
//   * **No `slug` in any body.** It is derived from the name server-side, so
//     one plan cannot end up with two spellings.
//   * **No price arithmetic.** The API returns numbers, not Prisma Decimals,
//     so nothing here needs to parse money out of an object.

import { api } from './api';
import { listed, qs } from './masters.api';
import type { ListQuery } from './masters.api';

export interface PlanFeature {
  label: string;
  /** ✓ when true, – when false — the design's struck-through row. */
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  eyebrow: string | null;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  billingCaption: string | null;
  isPopular: boolean;
  sortOrder: number;
  isActive: boolean;
  features: PlanFeature[];
  featureCount: number;
  /** How many customers chose this plan. Nothing is billed for it. */
  customerCount: number;
}

/** `'true'` / `'false'` as literal strings — the API's filter takes strings,
 *  because an implicit boolean conversion turns "false" into true. */
export interface PlanListQuery extends ListQuery {
  isActive?: 'true' | 'false';
}

const BASE = '/admin/plans';

export const plansApi = {
  list: async (query: PlanListQuery = {}) =>
    listed<Plan>(await api.get<Plan[]>(`${BASE}${qs(query)}`)),

  create: (body: Record<string, unknown>) => api.post<Plan>(BASE, body),

  /** Also the activate / deactivate call — `isActive` is a field on it. */
  update: (id: string, body: Record<string, unknown>) =>
    api.patch<Plan>(`${BASE}/${id}`, body),

  /** The whole list, every time — the dialog edits rows together. */
  replaceFeatures: (id: string, features: PlanFeature[]) =>
    api.put<Plan>(`${BASE}/${id}/features`, { features }),
};
