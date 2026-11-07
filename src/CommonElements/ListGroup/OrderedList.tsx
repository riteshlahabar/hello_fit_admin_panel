// Ported from Cuba 4.8.26 -- src/CommonElements/ListGroup/OrderedList.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode, HTMLAttributes } from 'react';

interface OLProps {
  attrOL?: HTMLAttributes<HTMLOListElement>;
  children?: ReactNode;
}

const OL = (props: OLProps) => {
  return <ol {...props.attrOL}>{props.children}</ol>;
};

export default OL;
