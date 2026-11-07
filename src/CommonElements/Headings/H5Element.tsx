// Ported from Cuba 4.8.26 -- src/CommonElements/Headings/H5Element.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode, HTMLAttributes } from 'react';

interface H5Props {
  attrH5?: HTMLAttributes<HTMLHeadingElement>;
  children?: ReactNode;
}

const H5 = (props: H5Props) => {
  return <h5 {...props.attrH5}>{props.children}</h5>;
};

export default H5;
