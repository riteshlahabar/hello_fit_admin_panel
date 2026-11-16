// Ported from Cuba 4.8.26 -- src/Layout/Sidebar/SidebarIcon.jsx.
// The collapsed-sidebar logo mark, shown on the 90px rail in place of the full
// wordmark.
//
// Cuba's own `logo-icon.png` went with the rest of its branding (client,
// 16 Nov 2026). The HelloFit mark suits this slot better than the wide one it
// replaces upstairs — it is square, which is exactly what a 35px rail wants.

import { Link } from 'react-router-dom';
import hellofitLogo from '../../assets/images/logo/hellofit-logo.png';
import { PUBLIC_URL } from '../../Config/base';

const SidebarIcon = () => {
  return (
    <div className='logo-icon-wrapper'>
      <Link to={`${PUBLIC_URL}/dashboard`}>
        <img className='img-fluid hf-brand-icon' src={hellofitLogo} alt='HelloFit' />
      </Link>
    </div>
  );
};

export default SidebarIcon;
