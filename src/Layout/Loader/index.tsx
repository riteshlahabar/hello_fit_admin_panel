// Ported from Cuba 4.8.26 -- src/Layout/Loader/index.jsx.
// One mechanical fix: Cuba writes the SVG filter primitives as `fegaussianblur`
// and `fecolormatrix`. Those are not valid JSX element names -- React's SVG
// elements are camelCase -- so they are spelled `feGaussianBlur` and
// `feColorMatrix` here. The rendered filter is identical; the `goo` blob
// animation comes from components/loader.scss.

import { Fragment, useEffect, useState } from 'react';

const Loader = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [show]);

  return (
    <Fragment>
      <div className={`loader-wrapper ${show ? '' : 'loderhide'}`}>
        <div className='loader-index'>
          <span></span>
        </div>
        <svg>
          <defs></defs>
          <filter id='goo'>
            <feGaussianBlur
              in='SourceGraphic'
              stdDeviation='11'
              result='blur'></feGaussianBlur>
            <feColorMatrix
              in='blur'
              values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9'
              result='goo'></feColorMatrix>
          </filter>
        </svg>
      </div>
    </Fragment>
  );
};

export default Loader;
