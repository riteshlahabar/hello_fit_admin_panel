// Ported from Cuba 4.8.26 -- src/CommonElements/Headings/H4Element.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode, HTMLAttributes } from 'react';

interface H4Props {
  attrH4?: HTMLAttributes<HTMLHeadingElement>;
  children?: ReactNode;
}

const H4 = (props: H4Props) => {
  return <h4 {...props.attrH4}>{props.children}</h4>;
};

export default H4;
