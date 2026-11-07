// Ported from Cuba 4.8.26 -- src/CommonElements/Tooltip/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode } from 'react';
import { Tooltip } from 'reactstrap';
import type { TooltipProps } from 'reactstrap';

interface ToolTipProps {
  // Required, unlike the other wrappers' attr props: reactstrap's TooltipProps
  // makes `target` mandatory, so there is no valid call without it.
  attrToolTip: TooltipProps;
  children?: ReactNode;
}

const ToolTip = (props: ToolTipProps) => {
  return <Tooltip {...props.attrToolTip}>{props.children}</Tooltip>;
};

export default ToolTip;
