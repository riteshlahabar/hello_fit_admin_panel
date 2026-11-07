// Ported from Cuba 4.8.26 -- src/CommonElements/Popover/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import { Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import type { ReactNode } from 'react';

interface PopoversProps {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  isOpen: boolean;
  target: string;
  toggle?: () => void;
  trigger?: string;
  title?: string;
  children?: ReactNode;
}

const Popovers = (props: PopoversProps) => (
  <Popover
    placement={props.placement}
    isOpen={props.isOpen}
    target={props.target}
    toggle={props.toggle}
    trigger={props.trigger}>
    {props.title ? <PopoverHeader>{props.title}</PopoverHeader> : ''}
    <PopoverBody>{props.children}</PopoverBody>
  </Popover>
);

export default Popovers;
