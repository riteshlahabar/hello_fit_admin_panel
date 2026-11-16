// Ported from Cuba 4.8.26 -- src/Layout/Header/RightHeader/index.jsx.
//
// Cuba's list is Language, Searchbar, BookmarkHeader, MoonLight, CartHeader,
// Notificationbar, UserHeader. BookmarkHeader and CartHeader are left out:
// they are the template's bookmark-app and ecommerce-cart demos, each backed by
// one of Cuba's fake-data context providers, and neither corresponds to
// anything in HelloFit. Removing them changes nothing about the header's
// design -- the <UL> and its classes are unchanged, so the remaining items lay
// out exactly as the template does.
//
// **Language is out as well** (client, 16 Nov 2026) -- the flag and "EN". It
// offered Cuba's own seven languages, which were never HelloFit's: section 12
// has not said what the panel ships, so the control promised a choice nothing
// behind it could honour.
//
// `Language.tsx` is kept on disk, not deleted, so restoring it is this import
// plus one line. **The i18n stack stays either way** -- `i18n.ts`, `main.tsx`
// and `Sidebar/SidebarMenuItems.tsx` all use it, so none of the three
// `i18next` dependencies became unused.

import { Fragment } from 'react';
import { Col } from 'reactstrap';
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
