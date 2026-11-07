// Replaces Cuba 4.8.26's src/Route/PrivateRoute.jsx.
//
// Cuba's version is not a real guard: it reads three localStorage flags
// (`login`, `authenticated`, `token`), writes them back on every mount, and
// fires a fetch at its fake backend's /users to decide. Anyone could set
// localStorage.login and walk in, which is fine for a template demo and not
// fine here.
//
// This gates on a held admin access token instead, and waits for AuthProvider
// to finish reading storage before deciding -- otherwise a hard refresh
// bounces a signed-in admin to the login screen for one frame. The real
// enforcement is server-side regardless: every /admin/* route runs the
// audience, roles and permissions guards.

import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../_helper/Auth';
import Loader from '../Layout/Loader';
import { PUBLIC_URL } from '../Config/base';

const PrivateRoute = () => {
  const { isAuthenticated, ready } = useContext(AuthContext);

  if (!ready) return <Loader />;

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={`${PUBLIC_URL}/login`} replace />
  );
};

export default PrivateRoute;
