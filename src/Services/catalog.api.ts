// Typed calls for /admin/catalog/*, matching the NestJS DTOs in
// hello_fit_backend/src/modules/catalog/dto/admin-catalog.dto.ts.
//
// PDF 6.5 is asymmetric and so is this: the admin **owns categories** (create,
// edit, describe, activate/deactivate) and over a service has **create** (client
// instruction, 18 Nov 2026), the rate card (17 Nov) and visibility — but **no
// edit and no delete**. 4.5 gives the provider its service's wording and both
// overrides were asked for by name; an edit form was not.
//
// No category delete either. 6.5 lists create, edit, activate and deactivate,
// and nothing more.

import { api } from './api';
import { listed, qs } from './masters.api';
import type { ListQuery } from './masters.api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  /** Card image for the website home grid (PDF 6.5, client instruction 11 Nov). */
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { services: number };
}

export interface CatalogService {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  durationMin: number;
  basePrice: string;
  level: string;
  isActive: boolean;
  category?: { id: string; name: string; isActive: boolean };
  _count?: { instructorServices: number; bookings: number };
}

export interface ServiceListQuery extends ListQuery {
  categoryId?: string;
}

const BASE = '/admin/catalog';

export const catalogApi = {
  categories: {
    list: async (query: ListQuery = {}) =>
      listed<Category>(await api.get<Category[]>(`${BASE}/categories${qs(query)}`)),
    create: (body: Record<string, unknown>) =>
      api.post<Category>(`${BASE}/categories`, body),
    /** Also the activate / deactivate call — `isActive` is a field on it. */
    update: (id: string, body: Record<string, unknown>) =>
      api.patch<Category>(`${BASE}/categories/${id}`, body),
  },

  services: {
    list: async (query: ServiceListQuery = {}) =>
      listed<CatalogService>(
        await api.get<CatalogService[]>(`${BASE}/services${qs(query)}`),
      ),
    /**
     * Adding a service (client instruction, 18 Nov 2026) — past §4.5, which
     * gives the provider its own services. There is still no **edit**: only
     * creation and the rate card were asked for.
     */
    create: (body: Record<string, unknown>) =>
      api.post<CatalogService>(`${BASE}/services`, body),
    setVisibility: (id: string, isActive: boolean) =>
      api.post<CatalogService & { upcomingBookings: number }>(
        `${BASE}/services/${id}/visibility`,
        { isActive },
      ),
  },
};

/** Category options for the service screen's filter. */
export async function fetchCategoryOptions() {
  const result = await catalogApi.categories.list({ limit: 100 });
  if (!result.ok) return [];
  return result.value.rows.map((c) => ({ value: c.id, label: c.name }));
}
