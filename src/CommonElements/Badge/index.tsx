// Ported from Cuba 4.8.26 -- src/CommonElements/Badge/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode } from 'react';
import { Badge } from 'reactstrap';
import type { BadgeProps } from 'reactstrap';

interface BadgesProps {
  attrBadge?: BadgeProps;
  children?: ReactNode;
}

const Badges = (props: BadgesProps) => {
  return <Badge {...props.attrBadge}>{props.children}</Badge>;
};

export default Badges;
