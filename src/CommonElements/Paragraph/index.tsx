// Ported from Cuba 4.8.26 -- src/CommonElements/Paragraph/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import { Fragment } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';

interface PProps {
  attrPara?: HTMLAttributes<HTMLParagraphElement>;
  innerHtml?: string;
  children?: ReactNode;
}

const P = (props: PProps) => {
  return (
    <Fragment>
      {props.innerHtml ? (
        <p dangerouslySetInnerHTML={{ __html: props.innerHtml }} />
      ) : (
        ''
      )}
      <p {...props.attrPara}>{props.children}</p>
    </Fragment>
  );
};

export default P;
