// Ported from Cuba 4.8.26 -- src/CommonElements/BlockQuote/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import type { ReactNode, HTMLAttributes } from 'react';

interface BlockQuotesProps {
  attrBlockQuote?: HTMLAttributes<HTMLQuoteElement>;
  children?: ReactNode;
}

const BlockQuotes = (props: BlockQuotesProps) => {
  return <blockquote {...props.attrBlockQuote}>{props.children}</blockquote>;
};

export default BlockQuotes;
