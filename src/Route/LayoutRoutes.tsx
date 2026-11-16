// Ported from Cuba 4.8.26 -- src/Route/LayoutRoutes.jsx.
// Nests every app route under AppLayout so the shell mounts once. Cuba wrapped
// each route in its own <Route element={<AppLayout />}> inside a Fragment;
// collapsed here to a single parent route, which is the same thing in
// react-router 6/7 and stops the layout remounting between pages.

import { Navigate, Route, Routes } from 'react-router-dom';
import { routes } from './Routes';
import AppLayout from '../Layout/Layout';

const LayoutRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {routes.map(({ path, Component }, i) => (
          <Route path={path} element={Component} key={i} />
        ))}
        {/*
          Cuba has no catch-all, so any URL that matched no route above drew
          the shell with an empty body and no 404 -- which is what a bookmark
          of the old `/<path>/Dubai` form now is, the layout segment having
          been dropped from every path. Send those to the dashboard rather
          than to a blank page.
        */}
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Route>
    </Routes>
  );
};

export default LayoutRoutes;
