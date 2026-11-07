// Ported from Cuba 4.8.26 -- src/Layout/Sidebar/SidebarIcon.jsx.
// The collapsed-sidebar logo mark. Cuba's `require()` of the image becomes a
// static import, which is how Vite resolves assets.

import { useContext } from 'react';
import { Link } from 'react-router-dom';
import cubaimg from '../../assets/images/logo/logo-icon.png';
import CustomizerContext from '../../_helper/Customizer';
import { PUBLIC_URL } from '../../Config/base';

const SidebarIcon = () => {
  const { layoutURL } = useContext(CustomizerContext);
  return (
    <div className='logo-icon-wrapper'>
      <Link to={`${PUBLIC_URL}/dashboard/${layoutURL}`}>
        <img className='img-fluid' src={cubaimg} alt='' />
      </Link>
    </div>
  );
};

export default SidebarIcon;
