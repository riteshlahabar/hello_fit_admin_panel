// Ported from Cuba 4.8.26 -- src/CommonElements/Progressbar/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode } from 'react';
import { Progress } from 'reactstrap';
import type { ProgressProps } from 'reactstrap';

interface ProgressbarProps {
  attrProgress?: ProgressProps;
  children?: ReactNode;
}

const Progressbar = (props: ProgressbarProps) => {
  return <Progress {...props.attrProgress}>{props.children}</Progress>;
};

export default Progressbar;
