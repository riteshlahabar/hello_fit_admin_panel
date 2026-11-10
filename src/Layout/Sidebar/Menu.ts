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
    menutitle: 'Configuration',
    menucontent: 'Geography, languages and holidays',
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
          { path: '/masters/languages', title: 'Languages', type: 'link', active: false },
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
