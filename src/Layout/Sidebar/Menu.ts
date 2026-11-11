// Ported from Cuba 4.8.26 -- src/Layout/Sidebar/Menu.jsx.
//
// The shape is Cuba's and must stay that way: SidebarMenuItems.tsx walks
// menutitle -> Items -> children -> children three levels deep, and `active` is
// mutated in place on these objects by setNavActive/toggletNavActive. `icon`
// names a pair of symbols in public/svg/sprite.svg (`stroke-<icon>` and
// `fill-<icon>`), so only the 40 icons that sprite carries are valid.
//
// The entries below are Cuba's own starter-kit entries. HelloFit's real
// navigation is added here one line at a time as each admin screen is brought
// across from Cuba's template -- deliberately not invented ahead of the
// screens, and not ahead of the marketplace-vs-institute decision that governs
// what the allocation and catalog screens even are.

export interface MenuItem {
  title: string;
  icon?: string;
  type: 'link' | 'sub';
  path?: string;
  active?: boolean;
  badge?: string;
  badgetxt?: string;
  children?: MenuItem[];
}

export interface MenuGroup {
  menutitle: string;
  menucontent: string;
  Items: MenuItem[];
}

export const MENUITEMS: MenuGroup[] = [
  {
    menutitle: 'General',
    menucontent: 'Dashboards,Widgets',
    Items: [
      {
        title: 'Dashboard',
        icon: 'home',
        type: 'link',
        path: '/dashboard',
        active: false,
      },
    ],
  },
  {
    // The two people-facing tables (spec 5.2, 5.3). Both are read-and-decide
    // screens rather than CRUD: neither API has a create or a delete route,
    // because a customer signs themselves up and a teacher applies.
    menutitle: 'Management',
    menucontent: 'Customers and teachers',
    Items: [
      {
        title: 'Customers',
        // `contact`, not `user`: Administration already uses `user`, and two
        // groups on the same glyph is how people click the wrong one.
        icon: 'contact',
        type: 'link',
        path: '/management/customers',
        active: false,
      },
      {
        title: 'Bookings',
        icon: 'calendar',
        type: 'link',
        path: '/management/bookings',
        active: false,
      },
      {
        title: 'Transactions',
        icon: 'charts',
        type: 'link',
        path: '/management/payments',
        active: false,
      },
      {
        // Two menus, not one table with a direction column: a customer's
        // review of a provider is public once published, while a provider's
        // review of a customer is internal and carries an admin-only note.
        title: 'Reviews',
        icon: 'social',
        type: 'sub',
        active: false,
        children: [
          {
            path: '/reviews/customer',
            title: 'Customer Reviews',
            type: 'link',
            active: false,
          },
          {
            path: '/reviews/instructor',
            title: 'Instructor Reviews',
            type: 'link',
            active: false,
          },
        ],
      },
      {
        title: 'Instructors',
        icon: 'learning',
        type: 'link',
        path: '/management/instructors',
        active: false,
      },
    ],
  },
  {
    // PDF 6.8 Commission and Earnings Information. Read-and-hold only: 6.8
    // excludes automated settlements and split payments, so nothing here
    // moves money.
    menutitle: 'Finance',
    menucontent: 'Instructor earnings and commission',
    Items: [
      {
        title: 'Earnings',
        icon: 'charts',
        type: 'link',
        path: '/finance/earnings',
        active: false,
      },
    ],
  },
  {
    // PDF 6.5 Category and Service Management. Asymmetric on purpose:
    // categories are the admin's to create and edit, services are only
    // reviewed and shown/hidden — 4.5 gives the instructor their own pricing.
    menutitle: 'Catalog',
    menucontent: 'Categories and instructor services',
    Items: [
      {
        title: 'Categories',
        icon: 'ecommerce',
        type: 'link',
        path: '/catalog/categories',
        active: false,
      },
      {
        title: 'Services',
        icon: 'ui-kits',
        type: 'link',
        path: '/catalog/services',
        active: false,
      },
    ],
  },
  {
    // PDF 6.12 Reports. One item per report — client instruction,
    // 11 Nov 2026. No Summary item: "all reports in cards and graphs" is the
    // Dashboard (6.2) with a range instead of a day, and charts are nowhere in
    // the PDF, so it is parked pending the client.
    menutitle: 'Reports',
    menucontent: 'Operational summaries',
    Items: [
      {
        title: 'Reports',
        icon: 'charts',
        type: 'sub',
        active: false,
        children: [
          { path: '/reports/bookings', title: 'Bookings', type: 'link', active: false },
          {
            path: '/reports/customers-providers',
            title: 'Customers & Providers',
            type: 'link',
            active: false,
          },
          { path: '/reports/payments', title: 'Payments', type: 'link', active: false },
          {
            path: '/reports/booking-status',
            title: 'Booking Status',
            type: 'link',
            active: false,
          },
        ],
      },
    ],
  },
  {
    // PDF 6.9 Coupons and Promotional Settings. One item, because 6.9 asks
    // for one thing — promotional codes. 6.11 Content Management is the other
    // marketing-shaped menu in the PDF and is not built yet.
    menutitle: 'Marketing',
    menucontent: 'Promotional coupons',
    Items: [
      {
        title: 'Coupons',
        icon: 'charts',
        type: 'link',
        path: '/marketing/coupons',
        active: false,
      },
    ],
  },
  {
    menutitle: 'Configuration',
    menucontent: 'Geography and holidays',
    Items: [
      {
        title: 'Masters',
        icon: 'others',
        type: 'sub',
        active: false,
        children: [
          { path: '/masters/cities', title: 'Cities', type: 'link', active: false },
          { path: '/masters/areas', title: 'Service Areas', type: 'link', active: false },
          { path: '/masters/pincodes', title: 'Pincodes', type: 'link', active: false },
          { path: '/masters/branches', title: 'Branches', type: 'link', active: false },
          // Commented out, not deleted — client instruction, 10 Nov 2026. The
          // v3 PDF never mentions language (0 hits in 1,490 lines); the
          // Languages master came from the ODT, which is no longer the source
          // of truth. The screen, the API and the `languages` table all still
          // exist; only the way in is closed.
          // { path: '/masters/languages', title: 'Languages', type: 'link', active: false },
          { path: '/masters/holidays', title: 'Holidays', type: 'link', active: false },
        ],
      },
    ],
  },
  {
    menutitle: 'Administration',
    menucontent: 'Staff accounts and what they can reach',
    Items: [
      {
        title: 'Administration',
        icon: 'user',
        type: 'sub',
        active: false,
        children: [
          {
            path: '/administration/admin-users',
            title: 'Admin Users',
            type: 'link',
            active: false,
          },
          {
            path: '/administration/roles',
            title: 'Roles & Permissions',
            type: 'link',
            active: false,
          },
        ],
      },
    ],
  },
];
