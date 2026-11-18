// Ported from Cuba 4.8.26 -- src/Route/Routes.jsx.
//
// Cuba's starter-kit ships exactly one route here (its sample page) and the
// full template ships several hundred. The list below grows one line per
// screen as each is brought across from Cuba's template.
//
// Cuba declares every path with a trailing `/:layout` segment -- the name of
// one of its twelve sidebar layouts -- so its theme-customizer can switch
// layout and have the choice survive a reload. That customizer is not ported
// (see Layout/Layout.tsx), so the segment could never be anything but `Dubai`
// and is gone from these paths. The layout class still comes from
// CustomizerProvider, which falls back to Cuba's own default.

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
import Packages from '../Components/Pricing/Packages';
import GroupSlabs from '../Components/Pricing/GroupSlabs';
import TrainerCategories from '../Components/Pricing/TrainerCategories';
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
  { path: `/dashboard`, Component: <Dashboard /> },

  // Management (spec 5.2, 5.3) — /admin/customers/* and /admin/instructors/*.
  // Neither has a create or a delete route: a customer signs themselves up and
  // a teacher applies from the app.
  { path: `/management/customers`, Component: <Customers /> },
  { path: `/management/instructors`, Component: <Instructors /> },
  // Bookings — PDF 6.6 Booking Management.
  { path: `/management/bookings`, Component: <Bookings /> },
  // Transactions — PDF 6.7 Payment and Transaction Management (read-only).
  { path: `/management/payments`, Component: <Payments /> },
  // Reviews — PDF 6.10. Split by direction: the customer's review of a
  // provider is public, the provider's review of a customer is internal.
  { path: `/reviews/customer`, Component: <CustomerReviews /> },
  { path: `/reviews/instructor`, Component: <InstructorReviews /> },

  // Earnings — PDF 6.8 Commission and Earnings Information.
  { path: `/finance/earnings`, Component: <Earnings /> },

  // Catalog — PDF 6.5 Category and Service Management.
  { path: `/catalog/categories`, Component: <Categories /> },
  { path: `/catalog/services`, Component: <Services /> },

  // Marketing — PDF 6.9 Coupons and Promotional Settings.
  { path: `/marketing/coupons`, Component: <Coupons /> },
  // Pricing — the client's pricing doc, 17 Nov 2026. Packages took the slot
  // membership plans had: the client reads "plan" as "package", and the plan
  // module is gone from the backend. → state/pricing-rules.md
  { path: `/marketing/packages`, Component: <Packages /> },
  { path: `/marketing/group-slabs`, Component: <GroupSlabs /> },
  { path: `/marketing/trainer-categories`, Component: <TrainerCategories /> },

  // Reports — PDF 6.12. One route per report, no export (6.12 gates it) and
  // no Summary page (charts are not in the PDF — parked for the client).
  { path: `/reports/bookings`, Component: <BookingsReportPage /> },
  { path: `/reports/customers-providers`, Component: <AccountsReportPage /> },
  { path: `/reports/payments`, Component: <PaymentsReportPage /> },
  { path: `/reports/booking-status`, Component: <StatusReportPage /> },

  // Masters — NOT in the PDF, see state/scope-documents.md.
  { path: `/masters/cities`, Component: <Cities /> },
  { path: `/masters/areas`, Component: <Areas /> },
  { path: `/masters/pincodes`, Component: <Pincodes /> },
  { path: `/masters/branches`, Component: <Branches /> },
  // Languages — menu commented out 10 Nov 2026 (not in the v3 PDF). Route left
  // in place so the screen still resolves if the menu entry comes back.
  { path: `/masters/languages`, Component: <Languages /> },
  { path: `/masters/holidays`, Component: <Holidays /> },

  // Administration (spec 5.8) — /admin/admin-users/* and /admin/roles/* on
  // the API. Both are Super Admin only by default: the seed grants the
  // `admins` permission module to that role alone.
  { path: `/administration/admin-users`, Component: <AdminUsers /> },
  { path: `/administration/roles`, Component: <Roles /> },
];
