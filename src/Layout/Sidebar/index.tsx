// Ported from Cuba 4.8.26 -- src/Layout/Sidebar/index.jsx.
//
// Kept as Cuba wrote it, with two mechanical changes:
//  - the `.filter`/`.map` walks that existed only for their side effects are
//    `.forEach`, which is what they were already doing;
//  - DOM lookups that Cuba dereferences unguarded use `?.`. Every one of these
//    elements is rendered by this component or by SidebarMenu, so the guard
//    never changes behaviour -- it only stops a null crash if the markup moves.
//
// `defaultLayout` is Cuba's own line: `customizer.layout` is a string, so
// Object.keys on it yields character indices. It is only ever used when the URL
// has no trailing segment, and the value is immediately overwritten, so the
// oddity is harmless and is left alone.

import { Fragment, useState, useEffect, useContext } from 'react';
import CustomContext from '../../_helper/Customizer';
import { MENUITEMS } from './Menu';
import type { MenuItem } from './Menu';
import SidebarIcon from './SidebarIcon';
import SidebarLogo from './SidebarLogo';
import SidebarMenu from './SidebarMenu';

const Sidebar = () => {
  const customizer = useContext(CustomContext);
  const { toggleIcon } = useContext(CustomContext);
  const id = window.location.pathname.split('/').pop();
  const defaultLayout = Object.keys(customizer.layout);

  const layout = id ? id : defaultLayout;
  const [, setMainMenu] = useState<unknown>(MENUITEMS);
  const [width, setWidth] = useState(0);

  const handleScroll = () => {
    if (window.scrollY > 400) {
      const main = document.querySelector('.sidebar-main');
      if (main) main.className = 'sidebar-main hovered';
    } else {
      if (document.getElementById('sidebar-main')) {
        const main = document.querySelector('.sidebar-main');
        if (main) main.className = 'sidebar-main';
      }
    }
  };

  const handleResize = () => {
    setWidth(window.innerWidth - 500);
  };

  useEffect(() => {
    document.querySelector('.left-arrow')?.classList.add('d-none');
    window.addEventListener('resize', handleResize);
    handleResize();
    const currentUrl = window.location.pathname;
    MENUITEMS.forEach((items) => {
      items.Items.forEach((Items) => {
        if (Items.path === currentUrl) setNavActive(Items);
        if (!Items.children) return;
        Items.children.forEach((subItems) => {
          if (subItems.path === currentUrl) setNavActive(subItems);
          if (!subItems.children) return;
          subItems.children.forEach((subSubItems) => {
            if (subSubItems.path === currentUrl) {
              setNavActive(subSubItems);
            }
          });
        });
      });
    });
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const activeClass = () => {
    document.querySelector('.bg-overlay1')?.classList.add('active');
  };

  const setNavActive = (item: MenuItem) => {
    MENUITEMS.forEach((menuItems) => {
      menuItems.Items.forEach((Items) => {
        if (Items !== item) {
          Items.active = false;
          document.querySelector('.bg-overlay1')?.classList.remove('active');
        }
        if (Items.children && Items.children.includes(item)) {
          Items.active = true;
          document.querySelector('.sidebar-links')?.classList.add('active');
        }
        if (Items.children) {
          Items.children.forEach((submenuItems) => {
            if (submenuItems.children && submenuItems.children.includes(item)) {
              Items.active = true;
              submenuItems.active = true;
            }
          });
        }
      });
    });
    item.active = !item.active;
    setMainMenu({ mainmenu: MENUITEMS });
  };

  const closeOverlay = () => {
    document.querySelector('.bg-overlay1')?.classList.remove('active');
    document.querySelector('.sidebar-links')?.classList.remove('active');
  };

  return (
    <Fragment>
      <div
        className='bg-overlay1'
        onClick={() => {
          closeOverlay();
        }}></div>
      <div
        className={`sidebar-wrapper ${toggleIcon ? 'close_icon' : ''}`}
        sidebar-layout='stroke-svg'>
        <SidebarIcon />
        <SidebarLogo />
        <SidebarMenu
          setMainMenu={setMainMenu}
          setNavActive={setNavActive}
          activeClass={activeClass}
          width={width}
        />
      </div>
    </Fragment>
  );
};

export default Sidebar;
