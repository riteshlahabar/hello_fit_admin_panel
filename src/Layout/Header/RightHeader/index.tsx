// Ported from Cuba 4.8.26 -- src/Layout/Header/RightHeader/index.jsx.
//
// Cuba's list is Language, Searchbar, BookmarkHeader, MoonLight, CartHeader,
// Notificationbar, UserHeader. BookmarkHeader and CartHeader are left out:
// they are the template's bookmark-app and ecommerce-cart demos, each backed by
// one of Cuba's fake-data context providers, and neither corresponds to
// anything in HelloFit. Removing them changes nothing about the header's
// design -- the <UL> and its classes are unchanged, so the remaining items lay
// out exactly as the template does.

import { Fragment } from 'react';
import { Col } from 'reactstrap';
import Language from './Language';
import Searchbar from './Searchbar';
import Notificationbar from './Notificationbar';
import MoonLight from './MoonLight';
import UserHeader from './UserHeader';
import { UL } from '../../../AbstractElements';

const RightHeader = () => {
  return (
    <Fragment>
      <Col
        xxl='7'
        xl='6'
        md='7'
        className='nav-right pull-right right-header col-8 p-0 ms-auto'>
        <UL attrUL={{ className: 'simple-list nav-menus flex-row' }}>
          <Language />
          <Searchbar />
          <MoonLight />
          <Notificationbar />
          <UserHeader />
        </UL>
      </Col>
    </Fragment>
  );
};

export default RightHeader;
