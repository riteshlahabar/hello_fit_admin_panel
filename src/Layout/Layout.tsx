// Ported from Cuba 4.8.26 -- src/Layout/Layout.jsx.
//
// The wrapper structure is what every one of Cuba's 164 stylesheets keys off,
// so it is unchanged: `.page-wrapper` carrying the layout class and the
// `sidebar-layout` attribute, then `.page-body-wrapper` > Sidebar +
// `.page-body` > the routed Outlet, with Footer inside the body wrapper.
//
// One mechanical change: react-transition-group needs a nodeRef in React 19
// (findDOMNode is gone), so the CSSTransition wraps a ref'd div. Cuba already
// had two nested plain divs there, so the ref attaches to the outer one and no
// element is added or removed.
//
// Cuba renders <ThemeCustomize /> here and it is NOT ported. That panel is the
// template's own showroom rather than part of the admin design: its header
// reads "PREVIEW SETTINGS / Try It Real Time", its nav is four outbound
// Pixelstrap links -- the freshdesk support desk, the Cuba documentation site,
// "Check Features" on admin.pixelstrap.com, and a "Buy Now" Envato affiliate
// link (1.envato.market/3GVzd) -- and its two tabs exist to preview-switch
// Cuba's twelve layouts and recolour them, which a shipped panel picks once.
// Its SCSS (themes/theme-customizer.scss) is still imported, so nothing about
// the rest of the design changes. Porting it is ~860 lines across 14 files and
// can be done if the layout switcher is genuinely wanted in-product.

import { Fragment, useContext, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import { Outlet, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import Taptop from './TapTop';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import CustomizerContext from '../_helper/Customizer';
import AnimationThemeContext from '../_helper/AnimationTheme';
import ConfigDB from '../Config/ThemeConfig';

const AppLayout = () => {
  const { layout } = useContext(CustomizerContext);
  const { sidebarIconType } = useContext(CustomizerContext);

  const layout1 = localStorage.getItem('sidebar_layout') || layout;
  const sideBarIcon =
    localStorage.getItem('sidebar_icon_type') || sidebarIconType;
  const location = useLocation();
  const { animation } = useContext(AnimationThemeContext);
  const animationTheme =
    localStorage.getItem('animation') ||
    animation ||
    ConfigDB.data.router_animation;
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Fragment>
      <Taptop />
      <div
        className={`page-wrapper ${layout1}`}
        sidebar-layout={sideBarIcon}
        id='pageWrapper'>
        <Header />
        <div className='page-body-wrapper'>
          <Sidebar />
          <div className='page-body'>
            <TransitionGroup>
              <CSSTransition
                key={location.key}
                nodeRef={nodeRef}
                timeout={100}
                classNames={animationTheme}
                unmountOnExit>
                <div ref={nodeRef}>
                  <div>
                    <Outlet />
                  </div>
                </div>
              </CSSTransition>
            </TransitionGroup>
          </div>
          <Footer />
        </div>
      </div>
      <ToastContainer />
    </Fragment>
  );
};

export default AppLayout;
