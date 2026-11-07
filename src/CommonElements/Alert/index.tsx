// Ported from Cuba 4.8.26 -- src/CommonElements/Alert/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode } from 'react';
import { Alert } from 'reactstrap';
import type { AlertProps, ButtonProps } from 'reactstrap';
import Btn from '../Button';

interface AlertsProps {
  attrAlert?: AlertProps;
  attrBtn?: ButtonProps;
  closeBtn?: boolean;
  divCls?: string;
  btnContent?: string;
  children?: ReactNode;
}

const Alerts = (props: AlertsProps) => {
  return (
    <Alert {...props.attrAlert}>
      {props.children}
      {props.closeBtn ? (
        <Btn attrBtn={props.attrBtn}>
          <div
            className={props.divCls}
            dangerouslySetInnerHTML={{ __html: props.btnContent ?? '' }}
          />
        </Btn>
      ) : (
        ''
      )}
    </Alert>
  );
};

export default Alerts;
