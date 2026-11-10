// Typed calls for /admin/admin-users/* and /admin/roles/*, matching the NestJS
// DTOs in hello_fit_backend/src/modules/admin-user/dto/admin-user.dto.ts.
//
// Three shapes of the API are worth knowing at the call site, because they are
// why the screens are built the way they are:
//
//   - `email` and `password` are absent from UpdateAdminUserDto on purpose.
//     Email is the login identifier and the audit trail's human anchor, and a
//     password change is its own route, so a careless PATCH of the profile
//     form cannot silently take over an account. Both are create-only fields.
//   - A status change and a password reset are `POST :id/status` and
//     `POST :id/password`, gated on `admins:approve` rather than `admins:edit`
//     — locking a colleague out is a different class of action from fixing
//     their phone number. They are row actions, not form fields.
//   - `PUT /admin/roles/:id/permissions` replaces the set wholesale, so the
//     matrix editor always sends every checked id, never a diff.
//
// `GET /admin/roles` answers no pagination meta (the list is six rows plus
// whatever ops adds), so `listedAll` synthesises it for CrudPage.

import { api } from './api';
import { listed, qs } from './masters.api';
import type { ApiResult } from './api';
import type { Listed, ListQuery, PageMeta } from './masters.api';

/** Mirrors the Prisma `UserStatus` enum. There is no INACTIVE. */
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface RoleRef {
  id: string;
  name: string;
  slug: string;
  isSystem: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  mobile: string | null;
  status: UserStatus;
  roleId: string;
  branchId: string | null;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role?: RoleRef;
  branch?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string; email: string } | null;
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  description: string | null;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  /** On the list response. */
  _count?: { adminUsers: number; rolePermissions: number };
  /** On the detail response only. */
  rolePermissions?: RolePermission[];
}

/** For an endpoint that returns the whole collection with no meta. */
async function listedAll<T>(
  result: ApiResult<T[]>,
): Promise<{ ok: true; value: Listed<T> } | { ok: false; message: string }> {
  if (!result.ok) return { ok: false, message: result.error.message };
  const rows = result.data ?? [];
  const meta: PageMeta = {
    page: 1,
    limit: rows.length || 1,
    total: rows.length,
    pages: 1,
  };
  return { ok: true, value: { rows, meta } };
}

const ADMINS = '/admin/admin-users';
const ROLES = '/admin/roles';

export const adminUsersApi = {
  list: async (query: ListQuery = {}) =>
    listed<AdminUser>(await api.get<AdminUser[]>(`${ADMINS}${qs(query)}`)),

  /** The caller's own record. Open to any admin — no grant needed. */
  me: () => api.get<AdminUser>(`${ADMINS}/me`),

  get: (id: string) => api.get<AdminUser>(`${ADMINS}/${id}`),

  create: (body: Record<string, unknown>) =>
    api.post<AdminUser>(ADMINS, body),

  update: (id: string, body: Record<string, unknown>) =>
    api.patch<AdminUser>(`${ADMINS}/${id}`, body),

  /** `admins:approve`. Also revokes their refresh tokens when suspending. */
  changeStatus: (id: string, body: { status: UserStatus; reason?: string }) =>
    api.post<AdminUser>(`${ADMINS}/${id}/status`, body),

  /** `admins:approve`. Signs their other sessions out. */
  resetPassword: (id: string, password: string) =>
    api.post<{ changed: boolean }>(`${ADMINS}/${id}/password`, { password }),

  /** The caller changing their own, which requires the current one. */
  changeOwnPassword: (body: {
    currentPassword: string;
    newPassword: string;
  }) => api.post<{ changed: boolean }>(`${ADMINS}/me/password`, body),

  remove: (id: string) => api.delete<AdminUser>(`${ADMINS}/${id}`),
};

export const rolesApi = {
  list: async () => listedAll<Role>(await api.get<Role[]>(ROLES)),

  /** The full (module, action) catalogue, for the matrix editor. */
  permissions: () => api.get<Permission[]>(`${ROLES}/permissions`),

  /** Detail carries `rolePermissions`, which the list response does not. */
  get: (id: string) => api.get<Role>(`${ROLES}/${id}`),

  create: (body: Record<string, unknown>) => api.post<Role>(ROLES, body),

  update: (id: string, body: Record<string, unknown>) =>
    api.patch<Role>(`${ROLES}/${id}`, body),

  /** Replaces the set wholesale — send every checked id. */
  setPermissions: (id: string, permissionIds: string[]) =>
    api.put<Role>(`${ROLES}/${id}/permissions`, { permissionIds }),

  remove: (id: string) => api.delete<Role>(`${ROLES}/${id}`),
};

/** Role options for the admin-user form's select. */
export async function fetchRoleOptions() {
  const result = await rolesApi.list();
  if (!result.ok) return [];
  return result.value.rows.map((r) => ({ value: r.id, label: r.name }));
}

/** The password rule the API enforces, stated once for the help text. */
export const PASSWORD_HELP =
  'At least 12 characters with an upper-case letter, a lower-case letter, a digit and a symbol.';
