// Ported from Cuba 4.8.26 -- src/Route/index.jsx.
//
// Cuba's version calls configureFakeBackend() at module scope, fetches /users
// from it on mount, and reads `login` / `authenticated` / `token` out of
// localStorage to decide the landing redirect. All of that is gone: the fake
// backend does not exist here and the session comes from AuthContext.
//
// What is kept is the structure -- a Suspense boundary over Cuba's Loader, the
// private branch holding LayoutRoutes, the public login route, and the
// redirect from `/` to the default screen.
//
// Cuba appended the current layout name to that redirect (`/dashboard/Dubai`)
// because its theme-customizer reads the layout back out of the URL. The
// customizer is not ported, so the segment is gone from every path; the
// layout class comes from CustomizerProvider instead.

import { Suspense, useContext } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Loader from '../Layout/Loader';
import LayoutRoutes from './LayoutRoutes';
import Signin from '../Auth/Signin';
import PrivateRoute from './PrivateRoute';
import AuthContext from '../_helper/Auth';
import { PUBLIC_URL } from '../Config/base';

const Routers = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <BrowserRouter basename={PUBLIC_URL || '/'}>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path={'/'} element={<PrivateRoute />}>
            {isAuthenticated ? (
              <Route path={'/'} element={<Navigate to={'/dashboard'} replace />} />
            ) : null}
            <Route path={'/*'} element={<LayoutRoutes />} />
          </Route>
          <Route path={'/login'} element={<Signin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Routers;
