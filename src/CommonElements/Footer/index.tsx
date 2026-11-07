// Ported from Cuba 4.8.26 -- src/CommonElements/Footer/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode, HTMLAttributes } from 'react';

interface FooterProps {
  attrFooter?: HTMLAttributes<HTMLElement>;
  children?: ReactNode;
}

const Footer = (props: FooterProps) => {
  return <footer {...props.attrFooter}>{props.children}</footer>;
};

export default Footer;
