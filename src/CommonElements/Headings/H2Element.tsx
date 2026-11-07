// Ported from Cuba 4.8.26 -- src/CommonElements/Headings/H2Element.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode, HTMLAttributes } from 'react';

interface H2Props {
  attrH2?: HTMLAttributes<HTMLHeadingElement>;
  children?: ReactNode;
}

const H2 = (props: H2Props) => {
  return <h2 {...props.attrH2}>{props.children}</h2>;
};

export default H2;
