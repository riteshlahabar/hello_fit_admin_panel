// Ported from Cuba 4.8.26 -- src/Layout/Sidebar/SidebarMenuItems.jsx.
//
// Behaviour is unchanged, including the parts that are unusual:
//
//  - `item.active` is mutated in place on the MENUITEMS objects and a re-render
//    is forced by calling setMainMenu with a fresh value. Cuba passes
//    `{ mainmenu: MENUITEMS }` there even though the state was initialised to
//    the array itself; the value is never read, only used to trigger the
//    render, so the shape mismatch is harmless and is kept rather than
//    "fixed" -- changing it risks changing when the accordion re-renders.
//  - the active class is decided by `CurrentPath.includes(title.toLowerCase())`,
//    not by matching the route, which is why Cuba's menu titles and paths are
//    kept in step with each other.
//  - `href='javascript'` is Cuba's own markup; the click handler calls
//    preventDefault, so it never navigates.

import { Fragment, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SvgIcon from '../../Components/Common/Component/SvgIcon';
import CustomizerContext from '../../_helper/Customizer';
import { MENUITEMS } from './Menu';
import type { MenuItem } from './Menu';

export interface SidebarMenuItemsProps {
  setMainMenu: (value: unknown) => void;
  sidebartoogle?: boolean;
  setNavActive: (item: MenuItem) => void;
  activeClass: (active?: boolean) => void;
}

const SidebarMenuItems = ({
  setMainMenu,
  sidebartoogle,
  setNavActive,
  activeClass,
}: SidebarMenuItemsProps) => {
  const { layout } = useContext(CustomizerContext);
  const layout1 = localStorage.getItem('sidebar_layout') || layout;

  const id = window.location.pathname.split('/').pop();
  const layoutId = id;
  const CurrentPath = window.location.pathname;

  const { t } = useTranslation();

  const toggletNavActive = (item: MenuItem) => {
    if (window.innerWidth <= 991) {
      document.querySelector('.page-header')!.className =
        'page-header close_icon';
      document.querySelector('.sidebar-wrapper')!.className =
        'sidebar-wrapper close_icon ';
      document
        .querySelector('.mega-menu-container')
        ?.classList.remove('d-block');
      if (item.type === 'sub') {
        document.querySelector('.page-header')!.className = 'page-header';
        document.querySelector('.sidebar-wrapper')!.className =
          'sidebar-wrapper';
      }
    }
    if (!item.active) {
      MENUITEMS.forEach((a) => {
        a.Items.forEach((Items) => {
          if (a.Items.includes(item)) Items.active = false;
          if (!Items.children) return;
          Items.children.forEach((b) => {
            if (Items.children!.includes(item)) {
              b.active = false;
            }
            if (!b.children) return;
            b.children.forEach((c) => {
              if (b.children!.includes(item)) {
                c.active = false;
              }
            });
          });
        });
      });
    }
    item.active = !item.active;
    setMainMenu({ mainmenu: MENUITEMS });
  };

  return (
    <>
      {MENUITEMS.map((Item, i) => (
        <Fragment key={i}>
          <li className='sidebar-main-title'>
            <div>
              <h6 className='lan-1'>{t(Item.menutitle)}</h6>
            </div>
          </li>
          {Item.Items.map((menuItem, i) => (
            <li className='sidebar-list' key={i}>
              {menuItem.type === 'sub' ? (
                <a
                  href='javascript'
                  className={`sidebar-link sidebar-title ${
                    CurrentPath.includes(menuItem.title.toLowerCase())
                      ? 'active'
                      : ''
                  } ${menuItem.active ? 'active' : ''}`}
                  onClick={(event) => {
                    event.preventDefault();
                    setNavActive(menuItem);
                    activeClass(menuItem.active);
                  }}>
                  <SvgIcon
                    className='stroke-icon'
                    iconId={`stroke-${menuItem.icon}`}
                  />
                  <SvgIcon
                    className='fill-icon'
                    iconId={`fill-${menuItem.icon}`}
                  />
                  <span>{t(menuItem.title)}</span>
                  {menuItem.badge ? (
                    <label className={menuItem.badge}>
                      {menuItem.badgetxt}
                    </label>
                  ) : (
                    ''
                  )}
                  <div className='according-menu'>
                    {menuItem.active ? (
                      <i className='fa fa-angle-down'></i>
                    ) : (
                      <i className='fa fa-angle-right'></i>
                    )}
                  </div>
                </a>
              ) : (
                ''
              )}

              {menuItem.type === 'link' ? (
                <Link
                  to={menuItem.path + '/' + layoutId}
                  className={`sidebar-link sidebar-title link-nav  ${
                    CurrentPath.includes(menuItem.title.toLowerCase())
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => toggletNavActive(menuItem)}>
                  <SvgIcon
                    className='stroke-icon'
                    iconId={`stroke-${menuItem.icon}`}
                  />
                  <SvgIcon
                    className='fill-icon'
                    iconId={`fill-${menuItem.icon}`}
                  />
                  <span>{t(menuItem.title)}</span>
                  {menuItem.badge ? (
                    <label className={menuItem.badge}>
                      {menuItem.badgetxt}
                    </label>
                  ) : (
                    ''
                  )}
                </Link>
              ) : (
                ''
              )}

              {menuItem.children ? (
                <ul
                  className='sidebar-submenu'
                  style={
                    layout1 !== 'compact-sidebar compact-small'
                      ? menuItem?.active ||
                        CurrentPath.includes(menuItem?.title?.toLowerCase())
                        ? sidebartoogle
                          ? { opacity: 1, transition: 'opacity 500ms ease-in' }
                          : { display: 'block' }
                        : { display: 'none' }
                      : { display: 'none' }
                  }>
                  {menuItem.children.map((childrenItem, index) => {
                    return (
                      <li key={index}>
                        {childrenItem.type === 'sub' ? (
                          <a
                            href='javascript'
                            className={`${
                              CurrentPath.includes(
                                childrenItem?.title?.toLowerCase(),
                              )
                                ? 'active'
                                : ''
                            }`}
                            onClick={(event) => {
                              event.preventDefault();
                              toggletNavActive(childrenItem);
                            }}>
                            {t(childrenItem.title)}
                            <span className='sub-arrow'>
                              <i className='fa fa-chevron-right'></i>
                            </span>
                            <div className='according-menu'>
                              {childrenItem.active ? (
                                <i className='fa fa-angle-down'></i>
                              ) : (
                                <i className='fa fa-angle-right'></i>
                              )}
                            </div>
                          </a>
                        ) : (
                          ''
                        )}

                        {childrenItem.type === 'link' ? (
                          <Link
                            to={childrenItem.path + '/' + layoutId}
                            className={`${
                              CurrentPath.includes(
                                childrenItem?.title?.toLowerCase(),
                              )
                                ? 'active'
                                : ''
                            }`}
                            onClick={() => toggletNavActive(childrenItem)}>
                            {t(childrenItem.title)}
                          </Link>
                        ) : (
                          ''
                        )}

                        {childrenItem.children ? (
                          <ul
                            className='nav-sub-childmenu submenu-content'
                            style={
                              CurrentPath.includes(
                                childrenItem?.title?.toLowerCase(),
                              ) || childrenItem.active
                                ? { display: 'block' }
                                : { display: 'none' }
                            }>
                            {childrenItem.children.map(
                              (childrenSubItem, key) => (
                                <li key={key}>
                                  {childrenSubItem.type === 'link' ? (
                                    <Link
                                      to={childrenSubItem.path + '/' + layoutId}
                                      className={`${
                                        CurrentPath.includes(
                                          childrenSubItem?.title?.toLowerCase(),
                                        )
                                          ? 'active'
                                          : ''
                                      }`}
                                      onClick={() =>
                                        toggletNavActive(childrenSubItem)
                                      }>
                                      {t(childrenSubItem.title)}
                                    </Link>
                                  ) : (
                                    ''
                                  )}
                                </li>
                              ),
                            )}
                          </ul>
                        ) : (
                          ''
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                ''
              )}
            </li>
          ))}
        </Fragment>
      ))}
    </>
  );
};

export default SidebarMenuItems;
