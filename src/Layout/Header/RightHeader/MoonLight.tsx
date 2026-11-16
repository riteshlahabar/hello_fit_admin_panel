// Ported from Cuba 4.8.26 -- src/Layout/Header/RightHeader/MoonLight.jsx.
// Cuba's dark mode: `light-only` / `dark-only` on <body>, and themes/_dark.scss
// plus the `body.dark-only` custom-property block in style.scss do the rest.
//
// **Two departures, both fixing a reload bug.**
//
// Cuba kept its own `useState(false)` here and wrote `document.body.className`
// itself. Nothing read the stored setting back on boot, so a reload always
// came back light — and the moon icon's `active` state reset with it, so the
// icon and the page could disagree. The body class now belongs to
// `CustomizerProvider`, which applies it on mount as well as on every change,
// and this component reads `mix_background_layout` instead of duplicating it.
//
// Assigning `document.body.className` outright also wiped every other class on
// <body>; the provider uses `classList` instead.

import { useContext } from 'react';
import SvgIcon from '../../../Components/Common/Component/SvgIcon';
import CustomizerContext from '../../../_helper/Customizer';

const MoonLight = () => {
  const { addMixBackgroundLayout, mix_background_layout } =
    useContext(CustomizerContext);

  const dark = mix_background_layout === 'dark-only';

  return (
    <li>
      <div
        className={`mode ${dark ? 'active' : ''}`}
        onClick={() => addMixBackgroundLayout(dark ? 'light-only' : 'dark-only')}>
        <SvgIcon iconId={'moon'} />
      </div>
    </li>
  );
};

export default MoonLight;
