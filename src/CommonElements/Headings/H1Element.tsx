// Ported from Cuba 4.8.26 -- src/CommonElements/Headings/H1Element.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode, HTMLAttributes } from 'react';

interface H1Props {
  attrH1?: HTMLAttributes<HTMLHeadingElement>;
  children?: ReactNode;
}

const H1 = (props: H1Props) => {
  return <h1 {...props.attrH1}>{props.children}</h1>;
};

export default H1;
