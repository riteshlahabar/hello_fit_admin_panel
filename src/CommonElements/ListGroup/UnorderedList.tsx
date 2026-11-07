// Ported from Cuba 4.8.26 -- src/CommonElements/ListGroup/UnorderedList.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode } from 'react';
import { ListGroup } from 'reactstrap';
import type { ListGroupProps, ListGroupItemProps } from 'reactstrap';
import ListItems from './ListItem';

interface ULProps {
  attrUL?: ListGroupProps;
  attrLI?: ListGroupItemProps;
  listItem?: string[];
  children?: ReactNode;
}

const UL = (props: ULProps) => {
  return (
    <ListGroup {...props.attrUL}>
      {props.listItem
        ? props.listItem.map((item, i) => (
            <ListItems val={item} attrLI={props.attrLI} key={i} />
          ))
        : props.children}
    </ListGroup>
  );
};

export default UL;
