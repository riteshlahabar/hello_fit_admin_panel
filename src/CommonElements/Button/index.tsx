// Ported from Cuba 4.8.26 -- src/CommonElements/Button/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode } from 'react';
import { Button } from 'reactstrap';
import type { ButtonProps } from 'reactstrap';

interface BtnProps {
  attrBtn?: ButtonProps;
  children?: ReactNode;
}

const Btn = (props: BtnProps) => {
  return <Button {...props.attrBtn}>{props.children}</Button>;
};

export default Btn;
