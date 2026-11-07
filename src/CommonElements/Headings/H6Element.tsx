// Ported from Cuba 4.8.26 -- src/CommonElements/Headings/H6Element.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode, HTMLAttributes } from 'react';

interface H6Props {
  attrH6?: HTMLAttributes<HTMLHeadingElement>;
  children?: ReactNode;
}

const H6 = (props: H6Props) => {
  return <h6 {...props.attrH6}>{props.children}</h6>;
};

export default H6;
