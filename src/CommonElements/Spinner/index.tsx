// Ported from Cuba 4.8.26 -- src/CommonElements/Spinner/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { HTMLAttributes } from 'react';

interface SpinnerProps {
  attrSpinner?: HTMLAttributes<HTMLDivElement>;
}

const Spinner = (props: SpinnerProps) => <div {...props.attrSpinner} />;

export default Spinner;
