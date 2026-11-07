// Ported from Cuba 4.8.26 -- src/CommonElements/Headings/H3Element.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode, HTMLAttributes } from 'react';

interface H3Props {
  attrH3?: HTMLAttributes<HTMLHeadingElement>;
  children?: ReactNode;
}

const H3 = (props: H3Props) => {
  return <h3 {...props.attrH3}>{props.children}</h3>;
};

export default H3;
