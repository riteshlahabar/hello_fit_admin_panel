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
import Cities from '../Components/Masters/Cities';
import Areas from '../Components/Masters/Areas';
import Pincodes from '../Components/Masters/Pincodes';
import Branches from '../Components/Masters/Branches';
import Languages from '../Components/Masters/Languages';
import Holidays from '../Components/Masters/Holidays';
import AdminUsers from '../Components/Administration/AdminUsers';
import Roles from '../Components/Administration/Roles';

export interface AppRoute {
  path: string;
  Component: ReactNode;
}

export const routes: AppRoute[] = [
  { path: `/dashboard/:layout`, Component: <Dashboard /> },

  // Masters (spec 5.7) — backed by /admin/masters/* on the API.
  { path: `/masters/cities/:layout`, Component: <Cities /> },
  { path: `/masters/areas/:layout`, Component: <Areas /> },
  { path: `/masters/pincodes/:layout`, Component: <Pincodes /> },
  { path: `/masters/branches/:layout`, Component: <Branches /> },
  { path: `/masters/languages/:layout`, Component: <Languages /> },
  { path: `/masters/holidays/:layout`, Component: <Holidays /> },

  // Administration (spec 5.8) — /admin/admin-users/* and /admin/roles/* on
  // the API. Both are Super Admin only by default: the seed grants the
  // `admins` permission module to that role alone.
  { path: `/administration/admin-users/:layout`, Component: <AdminUsers /> },
  { path: `/administration/roles/:layout`, Component: <Roles /> },
];
