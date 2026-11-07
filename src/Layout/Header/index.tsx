// Ported from Cuba 4.8.26 -- src/Layout/Header/index.jsx.
//
// The full-width search that filters the sidebar menu, kept as Cuba built it:
// it walks MENUITEMS three levels deep, pushes matching `link` items into a
// list, and toggles `.is-open` on `.Typeahead-menu` / `.empty-menu`.
//
// Changes are mechanical only:
//  - Cuba holds the result list in the same `searchValue` state it binds to the
//    input's defaultValue, so the state is a string on first render and an
//    array afterwards. Typed here as a discriminated union of the two rather
//    than restructured, because the markup branches on exactly that.
//  - the placeholder reads "Search HelloFit .." rather than "Search Cuba ..".
//  - unguarded querySelector dereferences use `?.`.

import {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import { Form, Row } from 'reactstrap';
import { X } from 'react-feather';
import { Link } from 'react-router-dom';
import CustomContext from '../../_helper/Customizer';
import Leftbar from './Leftbar/index';
import RightHeader from './RightHeader/index';
import { MENUITEMS } from '../Sidebar/Menu';
import type { MenuItem } from '../Sidebar/Menu';
import { Loading } from '../../Constant';
import SvgIcon from '../../Components/Common/Component/SvgIcon';

const Header = () => {
  const id = window.location.pathname.split('/').pop();
  const layout = id;
  const { toggleIcon } = useContext(CustomContext);
  const [searchValue, setsearchValue] = useState<string | MenuItem[]>('');
  const { customizer } = useContext(CustomContext);

  const layout_type = customizer.settings.layout_type;

  const escFunction = useCallback((event: KeyboardEvent) => {
    if (event.keyCode === 27) {
      setsearchValue('');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false);
    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
  }, [escFunction]);

  const addFix = () => {
    document.querySelector('.Typeahead-menu')?.classList.add('is-open');
    document.body.classList.add(`${layout_type}`);
  };

  const removeFix = () => {
    setsearchValue('');
    document.querySelector('.Typeahead-menu')?.classList.remove('is-open');
    document.body.classList.add(`${layout_type}`);
    document.body.classList.remove('offcanvas');
  };

  const checkSearchResultEmpty = (items: MenuItem[]) => {
    if (!items.length) {
      document.querySelector('.empty-menu')?.classList.add('is-open');
    } else {
      document.querySelector('.empty-menu')?.classList.remove('is-open');
    }
  };

  const handleSearchKeyword = (keyword: string) => {
    keyword ? addFix() : removeFix();
    const items: MenuItem[] = [];

    MENUITEMS.forEach((menuItems) => {
      menuItems.Items.forEach((mItems) => {
        if (
          mItems.title.toLowerCase().includes(keyword) &&
          mItems.type === 'link'
        ) {
          items.push(mItems);
        }
        if (!mItems.children) return;
        mItems.children.forEach((subItems) => {
          if (
            subItems.title.toLowerCase().includes(keyword) &&
            subItems.type === 'link'
          ) {
            subItems.icon = mItems.icon;
            items.push(subItems);
          }
          if (!subItems.children) return;
          subItems.children.forEach((suSubItems) => {
            if (suSubItems.title.toLowerCase().includes(keyword)) {
              suSubItems.icon = mItems.icon;
              items.push(suSubItems);
            }
          });
        });
      });
    });

    checkSearchResultEmpty(items);
    setsearchValue(items);
  };

  return (
    <Fragment>
      <div className={`page-header ${toggleIcon ? 'close_icon' : ''}`}>
        <Row className='header-wrapper m-0'>
          <Form className='form-inline search-full col' action='#' method='get'>
            <div className='form-group w-100'>
              <div className='Typeahead Typeahead--twitterUsers'>
                <div className='u-posRelative'>
                  <input
                    className='Typeahead-input form-control-plaintext w-100'
                    id='demo-input'
                    type='search'
                    placeholder='Search HelloFit ..'
                    onChange={(e) => handleSearchKeyword(e.target.value)}
                  />
                  <div
                    className='spinner-border Typeahead-spinner'
                    role='status'>
                    <span className='sr-only'>{Loading}</span>
                  </div>
                  <X
                    className='close-search'
                    onClick={() =>
                      document
                        .querySelector('.search-full')
                        ?.classList.remove('open')
                    }
                  />
                </div>
                <div className='Typeahead-menu' id='search-outer'>
                  <div className='header-search-suggestion custom-scrollbar'>
                    {Array.isArray(searchValue)
                      ? searchValue.map((data, index) => {
                          return (
                            <div className='ProfileCard u-cf' key={index}>
                              <div className='ProfileCard-details'>
                                <div className='ProfileCard-realName'>
                                  <Link
                                    to={data.path + '/' + layout}
                                    className='realname  w-100 d-flex justify-content-start gap-2'
                                    onClick={removeFix}>
                                    <SvgIcon
                                      style={{ width: '16px', height: '16px' }}
                                      className='stroke-icon'
                                      iconId={`stroke-${data.icon}`}
                                    />
                                    <SvgIcon
                                      style={{ width: '16px', height: '16px' }}
                                      className='fill-icon'
                                      iconId={`fill-${data.icon}`}
                                    />
                                    {data.title}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      : ''}
                  </div>
                </div>
                <div className='Typeahead-menu empty-menu'>
                  <div className='tt-dataset tt-dataset-0'>
                    <div className='EmptyMessage'>
                      {'Opps!! There are no result found.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Form>
          <Leftbar />
          <RightHeader />
        </Row>
      </div>
    </Fragment>
  );
};

export default Header;
