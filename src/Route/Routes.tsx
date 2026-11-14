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
import Customers from '../Components/Customers/Customers';
import Instructors from '../Components/Instructors/Instructors';
import Bookings from '../Components/Bookings/Bookings';
import CustomerReviews from '../Components/Reviews/CustomerReviews';
import InstructorReviews from '../Components/Reviews/InstructorReviews';
import Payments from '../Components/Payments/Payments';
import Earnings from '../Components/Earnings/Earnings';
import Categories from '../Components/Catalog/Categories';
import Services from '../Components/Catalog/Services';
import Coupons from '../Components/Marketing/Coupons';
import Plans from '../Components/Plans/Plans';
import {
  AccountsReportPage,
  BookingsReportPage,
  PaymentsReportPage,
  StatusReportPage,
} from '../Components/Reports';

export interface AppRoute {
  path: string;
  Component: ReactNode;
}

export const routes: AppRoute[] = [
  { path: `/dashboard/:layout`, Component: <Dashboard /> },

  // Management (spec 5.2, 5.3) — /admin/customers/* and /admin/instructors/*.
  // Neither has a create or a delete route: a customer signs themselves up and
  // a teacher applies from the app.
  { path: `/management/customers/:layout`, Component: <Customers /> },
  { path: `/management/instructors/:layout`, Component: <Instructors /> },
  // Bookings — PDF 6.6 Booking Management.
  { path: `/management/bookings/:layout`, Component: <Bookings /> },
  // Transactions — PDF 6.7 Payment and Transaction Management (read-only).
  { path: `/management/payments/:layout`, Component: <Payments /> },
  // Reviews — PDF 6.10. Split by direction: the customer's review of a
  // provider is public, the provider's review of a customer is internal.
  { path: `/reviews/customer/:layout`, Component: <CustomerReviews /> },
  { path: `/reviews/instructor/:layout`, Component: <InstructorReviews /> },

  // Earnings — PDF 6.8 Commission and Earnings Information.
  { path: `/finance/earnings/:layout`, Component: <Earnings /> },

  // Catalog — PDF 6.5 Category and Service Management.
  { path: `/catalog/categories/:layout`, Component: <Categories /> },
  { path: `/catalog/services/:layout`, Component: <Services /> },

  // Marketing — PDF 6.9 Coupons and Promotional Settings.
  { path: `/marketing/coupons/:layout`, Component: <Coupons /> },
  // Membership plans — client instruction, 13 Nov 2026 (not in the v3 PDF).
  { path: `/marketing/plans/:layout`, Component: <Plans /> },

  // Reports — PDF 6.12. One route per report, no export (6.12 gates it) and
  // no Summary page (charts are not in the PDF — parked for the client).
  { path: `/reports/bookings/:layout`, Component: <BookingsReportPage /> },
  { path: `/reports/customers-providers/:layout`, Component: <AccountsReportPage /> },
  { path: `/reports/payments/:layout`, Component: <PaymentsReportPage /> },
  { path: `/reports/booking-status/:layout`, Component: <StatusReportPage /> },

  // Masters — NOT in the PDF, see state/scope-documents.md.
  { path: `/masters/cities/:layout`, Component: <Cities /> },
  { path: `/masters/areas/:layout`, Component: <Areas /> },
  { path: `/masters/pincodes/:layout`, Component: <Pincodes /> },
  { path: `/masters/branches/:layout`, Component: <Branches /> },
  // Languages — menu commented out 10 Nov 2026 (not in the v3 PDF). Route left
  // in place so the screen still resolves if the menu entry comes back.
  { path: `/masters/languages/:layout`, Component: <Languages /> },
  { path: `/masters/holidays/:layout`, Component: <Holidays /> },

  // Administration (spec 5.8) — /admin/admin-users/* and /admin/roles/* on
  // the API. Both are Super Admin only by default: the seed grants the
  // `admins` permission module to that role alone.
  { path: `/administration/admin-users/:layout`, Component: <AdminUsers /> },
  { path: `/administration/roles/:layout`, Component: <Roles /> },
];
