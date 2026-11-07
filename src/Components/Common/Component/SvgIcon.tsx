// Ported from Cuba 4.8.26 — src/Components/Common/Component/SvgIcon.jsx.
// Every Cuba icon is a <use> into public/svg/sprite.svg, which carries 40
// `stroke-*` and 40 `fill-*` symbols. The sidebar renders both variants and the
// SCSS shows one, which is how Cuba's stroke/fill icon switch works.

import type { SVGProps } from 'react';
import { publicPath } from '../../../Config/base';

interface SvgIconProps extends SVGProps<SVGSVGElement> {
  iconId: string;
}

const SvgIcon = (props: SvgIconProps) => {
  const { iconId, ...res } = props;
  return (
    <svg {...res}>
      <use href={`${publicPath('svg/sprite.svg')}#${iconId}`}></use>
    </svg>
  );
};

export default SvgIcon;
