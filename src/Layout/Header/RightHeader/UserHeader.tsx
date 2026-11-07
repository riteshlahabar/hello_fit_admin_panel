// Ported from Cuba 4.8.26 -- src/Layout/Header/RightHeader/UserHeader.jsx.
//
// The markup is Cuba's. What is deliberately NOT ported is Cuba's auth: the
// original reads `localStorage.authenticated` and `localStorage.auth0_profile`,
// both written by Cuba's fake backend (src/Services/fack.backend.js) and its
// Auth0 demo. This panel talks to the real NestJS API, so the identity shown
// here and the logout behaviour come from AuthContext instead.
//
// Cuba's three demo menu entries (Account -> /app/users/userProfile,
// Inbox -> /app/email-app, Taskboard -> /app/todo-app) point at template pages
// that do not exist in this panel. The dropdown keeps Cuba's shape with the
// entries this panel actually has; the rest return as their screens are
// brought across.

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User } from 'react-feather';
import defaultProfile from '../../../assets/images/dashboard/profile.png';
import { LI, UL, Image, P } from '../../../AbstractElements';
import CustomizerContext from '../../../_helper/Customizer';
import AuthContext from '../../../_helper/Auth';
import { Account, Admin, LogOut } from '../../../Constant';
import { PUBLIC_URL } from '../../../Config/base';

const UserHeader = () => {
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);
  const { admin, logout } = useContext(AuthContext);

  const name = admin?.name || Admin;
  const role = admin?.roles?.[0] || Admin;

  const onLogout = async () => {
    await logout();
    navigate(`${PUBLIC_URL}/login`);
  };

  const UserMenuRedirect = (redirect: string) => {
    navigate(redirect);
  };

  return (
    <li className='profile-nav onhover-dropdown pe-0 py-0'>
      <div className='media profile-media'>
        <Image
          attrImage={{
            className: 'b-r-10 m-0',
            src: defaultProfile,
            alt: '',
          }}
        />
        <div className='media-body'>
          <span>{name}</span>
          <P attrPara={{ className: 'mb-0 font-roboto' }}>
            {role} <i className='middle fa fa-angle-down'></i>
          </P>
        </div>
      </div>
      <UL attrUL={{ className: 'simple-list profile-dropdown onhover-show-div' }}>
        <LI
          attrLI={{
            onClick: () =>
              UserMenuRedirect(`${PUBLIC_URL}/profile/${layoutURL}`),
          }}>
          <User />
          <span>{Account} </span>
        </LI>
        <LI attrLI={{ onClick: onLogout }}>
          <LogIn />
          <span>{LogOut}</span>
        </LI>
      </UL>
    </li>
  );
};

export default UserHeader;
