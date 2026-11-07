// Ported from Cuba 4.8.26 -- src/CommonElements/ListGroup/ListItem.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { ListGroupItem } from 'reactstrap';
import type { ListGroupItemProps } from 'reactstrap';

interface LIProps {
  attrLI?: ListGroupItemProps;
  val?: string;
  children?: ReactNode;
}

const LI = (props: LIProps) => {
  return (
    <Fragment>
      <ListGroupItem {...props.attrLI}>
        {props.val ? (
          <div dangerouslySetInnerHTML={{ __html: props.val }} />
        ) : (
          ''
        )}{' '}
        {props.children}
      </ListGroupItem>
    </Fragment>
  );
};

export default LI;
