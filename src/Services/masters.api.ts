// Typed calls for /admin/masters/*, matching the NestJS DTOs in
// hello_fit_backend/src/modules/masters/dto/masters.dto.ts.
//
// Every list endpoint answers { data: rows[], meta: { page, limit, total,
// pages } } through the response envelope, so `listed()` unwraps both halves
// in one place.

import { api } from './api';
import type { ApiResult } from './api';

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface City {
  id: string;
  name: string;
  state: string | null;
  isActive: boolean;
  launchDate: string | null;
  _count?: { serviceAreas: number; branches: number };
}

export interface ServiceArea {
  id: string;
  cityId: string;
  name: string;
  branchId: string | null;
  isActive: boolean;
  launchDate: string | null;
  city?: { id: string; name: string; state: string | null };
  branch?: { id: string; name: string } | null;
  _count?: { pincodes: number };
}

export interface Pincode {
  id: string;
  code: string;
  areaId: string;
  isActive: boolean;
  area?: { id: string; name: string; city?: { id: string; name: string } };
}

export interface Branch {
  id: string;
  name: string;
  cityId: string;
  address: string | null;
  managerId: string | null;
  isActive: boolean;
  city?: { id: string; name: string };
  manager?: { id: string; name: string; email: string } | null;
  _count?: { serviceAreas: number; instructors: number };
}

export interface Language {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface Holiday {
  id: string;
  date: string;
  cityId: string | null;
  title: string;
  blocksBooking: boolean;
  city?: { id: string; name: string } | null;
}

export interface ListQuery {
  q?: string;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export function qs(query: ListQuery): string {
  const parts = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== '' && v !== false)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

export interface Listed<T> {
  rows: T[];
  meta: PageMeta;
}

const EMPTY_META: PageMeta = { page: 1, limit: 20, total: 0, pages: 1 };

/**
 * Unwraps a list response into rows + meta, or surfaces the error message.
 *
 * Exported alongside `qs` because every admin list endpoint answers the same
 * envelope: `admins.api.ts` shares these rather than growing a second copy.
 */
export async function listed<T>(
  result: ApiResult<T[]>,
): Promise<{ ok: true; value: Listed<T> } | { ok: false; message: string }> {
  if (!result.ok) return { ok: false, message: result.error.message };
  return {
    ok: true,
    value: {
      rows: result.data ?? [],
      meta: (result.meta as unknown as PageMeta) ?? EMPTY_META,
    },
  };
}

const BASE = '/admin/masters';

export const mastersApi = {
  cities: {
    list: async (query: ListQuery = {}) =>
      listed<City>(await api.get<City[]>(`${BASE}/cities${qs(query)}`)),
    create: (body: Partial<City>) => api.post<City>(`${BASE}/cities`, body),
    update: (id: string, body: Partial<City>) =>
      api.patch<City>(`${BASE}/cities/${id}`, body),
    remove: (id: string) => api.delete(`${BASE}/cities/${id}`),
  },
  areas: {
    list: async (query: ListQuery = {}) =>
      listed<ServiceArea>(await api.get<ServiceArea[]>(`${BASE}/areas${qs(query)}`)),
    create: (body: Partial<ServiceArea>) =>
      api.post<ServiceArea>(`${BASE}/areas`, body),
    update: (id: string, body: Partial<ServiceArea>) =>
      api.patch<ServiceArea>(`${BASE}/areas/${id}`, body),
    remove: (id: string) => api.delete(`${BASE}/areas/${id}`),
  },
  pincodes: {
    list: async (query: ListQuery = {}) =>
      listed<Pincode>(await api.get<Pincode[]>(`${BASE}/pincodes${qs(query)}`)),
    create: (body: Partial<Pincode>) =>
      api.post<Pincode>(`${BASE}/pincodes`, body),
    bulk: (body: { areaId: string; codes: string[] }) =>
      api.post<{ areaId: string; created: number; skipped: string[] }>(
        `${BASE}/pincodes/bulk`,
        body,
      ),
    update: (id: string, body: Partial<Pincode>) =>
      api.patch<Pincode>(`${BASE}/pincodes/${id}`, body),
    remove: (id: string) => api.delete(`${BASE}/pincodes/${id}`),
  },
  branches: {
    list: async (query: ListQuery = {}) =>
      listed<Branch>(await api.get<Branch[]>(`${BASE}/branches${qs(query)}`)),
    create: (body: Partial<Branch>) => api.post<Branch>(`${BASE}/branches`, body),
    update: (id: string, body: Partial<Branch>) =>
      api.patch<Branch>(`${BASE}/branches/${id}`, body),
    remove: (id: string) => api.delete(`${BASE}/branches/${id}`),
  },
  languages: {
    list: async (query: ListQuery = {}) =>
      listed<Language>(await api.get<Language[]>(`${BASE}/languages${qs(query)}`)),
    create: (body: Partial<Language>) =>
      api.post<Language>(`${BASE}/languages`, body),
    update: (id: string, body: Partial<Language>) =>
      api.patch<Language>(`${BASE}/languages/${id}`, body),
    remove: (id: string) => api.delete(`${BASE}/languages/${id}`),
  },
  holidays: {
    list: async (query: ListQuery = {}) =>
      listed<Holiday>(await api.get<Holiday[]>(`${BASE}/holidays${qs(query)}`)),
    create: (body: Partial<Holiday>) =>
      api.post<Holiday>(`${BASE}/holidays`, body),
    update: (id: string, body: Partial<Holiday>) =>
      api.patch<Holiday>(`${BASE}/holidays/${id}`, body),
    remove: (id: string) => api.delete(`${BASE}/holidays/${id}`),
  },
};
