// Ported verbatim from Cuba 4.8.26 -- src/Layout/Sidebar/SidebarMenu.jsx.
// The left/right arrows and the hard-coded -2598/-2034/-3570/-3464 margins are
// Cuba's horizontal-layout scroller. They only come into play when the active
// layout contains `horizontal-wrapper`, and the numbers are tuned to Cuba's own
// menu width -- kept as written rather than recomputed.

import { useContext, useState } from 'react';
import { ArrowRight, ArrowLeft } from 'react-feather';
import CustomizerContext from '../../_helper/Customizer';
import SidebarMenuItems from './SidebarMenuItems';
import type { MenuItem } from './Menu';

interface SidebarMenuProps {
  setMainMenu: (value: unknown) => void;
  sidebartoogle?: boolean;
  setNavActive: (item: MenuItem) => void;
  activeClass: (active?: boolean) => void;
  width: number;
}

const SidebarMenu = ({
  setMainMenu,
  sidebartoogle,
  setNavActive,
  activeClass,
  width,
}: SidebarMenuProps) => {
  const { customizer } = useContext(CustomizerContext);
  const wrapper = customizer.settings.sidebar.type;
  const [margin, setMargin] = useState(0);

  const scrollToRight = () => {
    if (margin <= -2598 || margin <= -2034) {
      if (width === 492) {
        setMargin(-3570);
      } else {
        setMargin(-3464);
      }
      document.querySelector('.right-arrow')!.classList.add('d-none');
      document.querySelector('.left-arrow')!.classList.remove('d-none');
    } else {
      setMargin((margin) => (margin += -width));
      document.querySelector('.left-arrow')!.classList.remove('d-none');
    }
  };

  const scrollToLeft = () => {
    if (margin >= -width) {
      setMargin(0);
      document.querySelector('.left-arrow')!.classList.add('d-none');
      document.querySelector('.right-arrow')!.classList.remove('d-none');
    } else {
      setMargin((margin) => (margin += width));
      document.querySelector('.right-arrow')!.classList.remove('d-none');
    }
  };

  return (
    <nav className='sidebar-main' id='sidebar-main'>
      <div className='left-arrow' onClick={scrollToLeft}>
        <ArrowLeft />
      </div>
      <div
        id='sidebar-menu'
        style={
          wrapper.split(' ').includes('horizontal-wrapper')
            ? { marginLeft: margin + 'px' }
            : { margin: '0px' }
        }>
        <ul className='sidebar-links custom-scrollbar'>
          <li className='back-btn'>
            <div className='mobile-back text-end'>
              <span>{'Back'}</span>
              <i className='fa fa-angle-right ps-2' aria-hidden='true'></i>
            </div>
          </li>
          <SidebarMenuItems
            setMainMenu={setMainMenu}
            sidebartoogle={sidebartoogle}
            setNavActive={setNavActive}
            activeClass={activeClass}
          />
        </ul>
      </div>
      <div className='right-arrow' onClick={scrollToRight}>
        <ArrowRight />
      </div>
    </nav>
  );
};

export default SidebarMenu;
