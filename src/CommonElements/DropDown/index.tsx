// Ported from Cuba 4.8.26 -- src/CommonElements/DropDown/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import { Dropdown, DropdownItem, DropdownMenu } from 'reactstrap';
import type {
  DropdownProps,
  DropdownMenuProps,
  DropdownItemProps,
  ButtonProps,
} from 'reactstrap';
import type { ReactNode } from 'react';
import Btn from '../Button';

interface DropdownsProps {
  attrDropDown?: DropdownProps;
  attrDropBtn?: ButtonProps;
  attrDropMenu?: DropdownMenuProps;
  attrDropItem?: DropdownItemProps;
  dropBtnContent?: string;
  dropItem: { item: ReactNode }[];
}

const Dropdowns = (props: DropdownsProps) => (
  <Dropdown {...props.attrDropDown}>
    <Btn attrBtn={props.attrDropBtn}>
      <div
        dangerouslySetInnerHTML={{ __html: props.dropBtnContent ?? '' }}
      />
    </Btn>
    <DropdownMenu {...props.attrDropMenu}>
      {props.dropItem.map((item, i) => (
        <DropdownItem {...props.attrDropItem} key={i}>
          {item.item}
        </DropdownItem>
      ))}
    </DropdownMenu>
  </Dropdown>
);

export default Dropdowns;
