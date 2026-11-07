// Ported from Cuba 4.8.26 -- src/Route/Routes.jsx.
//
// Cuba's starter-kit ships exactly one route here (its sample page) and the
// full template ships several hundred. The list below grows one line per
// screen as each is brought across from Cuba's template.
//
// The `:layout` segment is Cuba's, not decoration: SidebarMenuItems links to
// `path + '/' + layoutId` and CustomizerProvider reads the layout name back out
// of the URL's last segment, which is how Cuba's twelve layouts survive a
// reload.

import type { ReactNode } from 'react';
import Dashboard from '../Components/Pages/Dashboard';

export interface AppRoute {
  path: string;
  Component: ReactNode;
}

export const routes: AppRoute[] = [
  { path: `/dashboard/:layout`, Component: <Dashboard /> },
];
