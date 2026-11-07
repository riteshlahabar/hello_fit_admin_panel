// Ported from Cuba 4.8.26 -- src/CommonElements/Ribbon/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode, HTMLAttributes } from 'react';

interface RibbonProps {
  attrRibbons?: HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
}

const Ribbon = (props: RibbonProps) => {
  return <div {...props.attrRibbons}>{props.children}</div>;
};

export default Ribbon;
