// Ported from Cuba 4.8.26 -- src/Layout/Sidebar/SidebarLogo.jsx.
// Cuba picks logo.png vs logo_dark.png from the active layout and mixLayout
// flag; that branch is kept exactly. Its `require()` of the dark logo becomes a
// static import for Vite.

import { useContext } from 'react';
import { Grid } from 'react-feather';
import { Link } from 'react-router-dom';
import { Image } from '../../AbstractElements';
import CubaIcon from '../../assets/images/logo/logo.png';
import CubaIconDark from '../../assets/images/logo/logo_dark.png';
import CustomizerContext from '../../_helper/Customizer';
import { PUBLIC_URL } from '../../Config/base';

const SidebarLogo = () => {
  const { mixLayout, toggleSidebar, toggleIcon, layout, layoutURL } =
    useContext(CustomizerContext);

  // **Departs from Cuba, which has a bug here.** Cuba keeps its own
  // `useState(false)` beside the context and writes
  // `setToggle(!toggle); toggleSidebar(toggle)` — the second call passes the
  // value from *before* the update, so the sidebar is always one click behind
  // and the first click does nothing at all.
  //
  // The local copy is dropped rather than corrected, because it desynced for a
  // second reason: `Header/Leftbar` calls `toggleSidebar` directly from its
  // resize handler, which moves `toggleIcon` without the local copy ever
  // hearing about it. `toggleIcon` is the one thing `Sidebar/index.tsx`
  // actually renders from, so it is the only honest source of truth.
  const openCloseSidebar = () => {
    toggleSidebar(!toggleIcon);
  };

  const layout1 = localStorage.getItem('sidebar_layout') || layout;

  return (
    <div className='logo-wrapper'>
      {layout1 !== 'compact-wrapper dark-sidebar' &&
      layout1 !== 'compact-wrapper color-sidebar' &&
      mixLayout ? (
        <Link to={`${PUBLIC_URL}/dashboard/${layoutURL}`}>
          <Image
            attrImage={{ className: 'img-fluid d-inline', src: CubaIcon, alt: '' }}
          />
        </Link>
      ) : (
        <Link to={`${PUBLIC_URL}/dashboard/${layoutURL}`}>
          <Image
            attrImage={{
              className: 'img-fluid d-inline',
              src: CubaIconDark,
              alt: '',
            }}
          />
        </Link>
      )}
      <div className='back-btn' onClick={() => openCloseSidebar()}>
        <i className='fa fa-angle-left'></i>
      </div>
      <div className='toggle-sidebar' onClick={openCloseSidebar}>
        <Grid className='status_toggle middle sidebar-toggle' />
      </div>
    </div>
  );
};

export default SidebarLogo;
