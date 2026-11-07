// Replaces Cuba's localStorage `login` / `authenticated` / `auth0_profile`
// flags with the real session. Shaped like Cuba's other _helper contexts so it
// sits in the same provider stack in App.tsx.

import { createContext } from 'react';

export interface AdminIdentity {
  /** AdminUser.id — the JWT `sub` on an admin-audience token. */
  id: string;
  /** Role slug from the token, e.g. `super-admin`. */
  role: string;
  /** Kept as an array so UserHeader can render the first one. */
  roles: string[];
  /** `module:action` strings; the server is still the authority on these. */
  permissions: string[];
  /** Best available display name. The token carries no name field. */
  name: string;
}

export interface AuthContextValue {
  admin: AdminIdentity | null;
  /** Null while the stored token is still being read on first paint. */
  ready: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  /** True when a usable admin access token is held. */
  isAuthenticated: boolean;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export default AuthContext;
