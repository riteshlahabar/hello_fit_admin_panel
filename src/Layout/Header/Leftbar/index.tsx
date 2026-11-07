// Ported from Cuba 4.8.26 -- src/Layout/Header/Leftbar/index.jsx.
//
// Cuba renders <NotificationSlider /> in the right-hand Col. That component is
// template advertising, not design: its three slides are Pixelstrap's own
// marketing copy and one of them is an Envato affiliate "Buy now !" link to
// https://1.envato.market/3GVzd. It also pulls in react-slick and a gif asset
// for that alone. The Col is kept so the header grid is unchanged; what goes in
// it is HelloFit's to decide when there is something to announce.
//
// Cuba's `require()` calls for the two logos become static imports for Vite,
// and the unguarded `document.querySelector(...).className` writes use `?.`.

import { Fragment, useState, useLayoutEffect, useContext } from 'react';
import { Col } from 'reactstrap';
import { AlignCenter } from 'react-feather';
import { Link } from 'react-router-dom';
import { Image } from '../../../AbstractElements';
import CustomizerContext from '../../../_helper/Customizer';
import logoLight from '../../../assets/images/logo/logo.png';
import logoDark from '../../../assets/images/logo/logo_dark.png';
import { PUBLIC_URL } from '../../../Config/base';

const Leftbar = () => {
  const { layoutURL, toggleSidebar } = useContext(CustomizerContext);
  const [sidebartoggle, setSidebartoggle] = useState(true);
  const width = useWindowSize();

  function useWindowSize() {
    const [size, setSize] = useState(0);
    useLayoutEffect(() => {
      function updateSize() {
        setSize(window.innerWidth);
        if (window.innerWidth <= 1007) {
          toggleSidebar(true);
          const wrapper = document.querySelector('.page-wrapper');
          if (wrapper) wrapper.className = 'page-wrapper compact-wrapper';
        } else {
          toggleSidebar(false);
        }
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return size;
  }

  const responsive_openCloseSidebar = (toggle: boolean) => {
    if (width <= 991) {
      const header = document.querySelector('.page-header');
      if (header) header.className = 'page-header';
      const wrapper = document.querySelector('.sidebar-wrapper');
      if (wrapper) wrapper.className = 'sidebar-wrapper ';
      document.querySelector('.bg-overlay')?.classList.add('active');
    } else {
      if (toggle) {
        setSidebartoggle(!toggle);
        const header = document.querySelector('.page-header');
        if (header) header.className = 'page-header close_icon';
        const wrapper = document.querySelector('.sidebar-wrapper');
        if (wrapper) wrapper.className = 'sidebar-wrapper close_icon ';
        document
          .querySelector('.mega-menu-container')
          ?.classList.remove('d-block');
      } else {
        setSidebartoggle(!toggle);
        const header = document.querySelector('.page-header');
        if (header) header.className = 'page-header';
        const wrapper = document.querySelector('.sidebar-wrapper');
        if (wrapper) wrapper.className = 'sidebar-wrapper ';
      }
    }
  };

  return (
    <Fragment>
      <Col className='header-logo-wrapper col-auto p-0' id='out_side_click'>
        <div className='logo-wrapper'>
          <Link to={`${PUBLIC_URL}/dashboard/${layoutURL}`}>
            <Image
              attrImage={{
                className: 'img-fluid for-light',
                src: logoLight,
                alt: '',
              }}
            />
            <Image
              attrImage={{
                className: 'img-fluid for-dark',
                src: logoDark,
                alt: '',
              }}
            />
          </Link>
        </div>
        <div
          className='toggle-sidebar'
          onClick={() => responsive_openCloseSidebar(sidebartoggle)}
          style={
            window.innerWidth <= 991 ? { display: 'block' } : { display: 'none' }
          }>
          <AlignCenter
            className='status_toggle middle sidebar-toggle'
            id='sidebar-toggle'
          />
        </div>
      </Col>
      <Col
        xxl='5'
        xl='6'
        lg='5'
        md='4'
        sm='3'
        className='left-header p-0'></Col>
    </Fragment>
  );
};

export default Leftbar;
