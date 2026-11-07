// Real admin session, in place of Cuba's fake one.
//
// The backend has no /admin/auth/me route, so the identity shown in the UI is
// read out of the access token's own payload. That is a display convenience
// only: `can()` decides whether to render a button, and the server re-checks
// every permission on every request through PermissionsGuard. Nothing here is
// an authorization decision.

import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Context from './index';
import type { AdminIdentity } from './index';
import { api, tokenStore } from '../../Services/api';

interface AdminTokenClaims {
  sub?: string;
  aud?: string;
  role?: string;
  roles?: string[];
  perms?: string[];
  exp?: number;
  email?: string;
  name?: string;
}

/** Decodes a JWT payload without verifying it. Display only — see above. */
function readClaims(token: string): AdminTokenClaims | null {
  const segments = token.split('.');
  if (segments.length !== 3) return null;
  try {
    const payload = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      '=',
    );
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as AdminTokenClaims;
  } catch {
    return null;
  }
}

function identityFrom(token: string | null): AdminIdentity | null {
  if (!token) return null;
  const claims = readClaims(token);
  if (!claims?.sub) return null;

  // An app-audience token must not be treated as an admin session: every
  // /admin/* route would answer 401 and the panel would look signed in while
  // nothing loaded.
  if (claims.aud && claims.aud !== 'admin') return null;

  // `exp` is deliberately not enforced here. An expired access token does not
  // mean the session is over -- the refresh token may still be good, and the
  // first request will rotate it. Bouncing to the login screen on a stale
  // access token would sign the admin out on every hard refresh.

  const role = claims.role ?? 'admin';
  return {
    id: claims.sub,
    role,
    roles: claims.roles?.length ? claims.roles : [role],
    permissions: claims.perms ?? [],
    name: claims.name ?? claims.email ?? 'Admin',
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = (props: AuthProviderProps) => {
  // Read straight out of storage during initialisation rather than in an
  // effect: localStorage is synchronous, so there is no reason to render once
  // signed-out and then again signed-in -- that flash is what sends a
  // refreshing admin to the login screen for a frame.
  const [admin, setAdmin] = useState<AdminIdentity | null>(() =>
    identityFrom(tokenStore.access),
  );
  const ready = true;

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.adminLogin(email, password);
    if (!result.ok) {
      return { ok: false as const, message: result.error.message };
    }
    tokenStore.set(result.data.accessToken, result.data.refreshToken);
    const identity = identityFrom(result.data.accessToken);
    if (!identity) {
      tokenStore.clear();
      return {
        ok: false as const,
        message: 'The server returned a token this panel cannot read.',
      };
    }
    setAdmin(identity);
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.refresh;
    // Best effort: revoke server-side, but clear locally no matter what. A
    // failed logout call must not leave the admin stuck signed in.
    if (refreshToken) {
      await api.adminLogout(refreshToken).catch(() => undefined);
    }
    tokenStore.clear();
    setAdmin(null);
  }, []);

  const can = useCallback(
    (permission: string) => admin?.permissions.includes(permission) ?? false,
    [admin],
  );

  const value = useMemo(
    () => ({
      admin,
      ready,
      signIn,
      logout,
      isAuthenticated: admin !== null,
      can,
    }),
    [admin, ready, signIn, logout, can],
  );

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
};

export default AuthProvider;
