// Ported from Cuba 4.8.26 -- src/CommonElements/Media/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

// Cuba renders images through reactstrap's <Media>. It is still exported in
// reactstrap 9.2.x, so this stays a pass-through as Cuba wrote it.

import { Media } from 'reactstrap';
import type { MediaProps } from 'reactstrap';

interface ImageProps {
  attrImage?: MediaProps;
}

const Image = (props: ImageProps) => <Media {...props.attrImage} />;

export default Image;
