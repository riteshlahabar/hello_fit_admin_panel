// Ported from Cuba 4.8.26 -- src/Layout/Sidebar/SidebarLogo.jsx.
//
// Cuba picked logo.png vs logo_dark.png from the active layout and its
// `mixLayout` flag. Both images, and that whole branch, went on the client's
// instruction (16 Nov 2026) — one HelloFit mark reads on either background.
// `mixLayout` and the `sidebar_layout` lookup went with them.

import { useContext } from 'react';
import { Grid } from 'react-feather';
import { Link } from 'react-router-dom';
import { Image } from '../../AbstractElements';
import hellofitLogo from '../../assets/images/logo/hellofit-logo.png';
import CustomizerContext from '../../_helper/Customizer';
import { PUBLIC_URL } from '../../Config/base';

const SidebarLogo = () => {
  const { toggleSidebar, toggleIcon } = useContext(CustomizerContext);

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


  return (
    <div className='logo-wrapper'>
      {/* Cuba branched here on `mixLayout` and the sidebar variant to pick
          logo.png or logo_dark.png — a light wordmark and a dark one. The
          HelloFit mark reads on either, so the branch is gone with the images
          (client, 16 Nov 2026) and `mixLayout` and `layout1` with it.

          The mark is 2048x2048 where Cuba's was 121x35, and nothing in Cuba's
          CSS sizes a logo — `img-fluid` alone would draw it the full 265px
          width of the sidebar. `styles/brand.scss` caps it. */}
      <Link to={`${PUBLIC_URL}/dashboard`}>
        <Image
          attrImage={{
            className: 'img-fluid d-inline hf-brand',
            src: hellofitLogo,
            alt: 'HelloFit',
          }}
        />
      </Link>
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
