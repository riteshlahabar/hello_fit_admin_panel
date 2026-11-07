// Ported verbatim from Cuba 4.8.26 -- src/Layout/Header/RightHeader/MoonLight.jsx.
// Cuba's dark mode: it sets `light-only` / `dark-only` on <body>, and
// themes/dark.scss plus the `body.dark-only` custom-property block in
// style.scss do the rest.

import { useContext, useState } from 'react';
import SvgIcon from '../../../Components/Common/Component/SvgIcon';
import CustomizerContext from '../../../_helper/Customizer';

const MoonLight = () => {
  const { addMixBackgroundLayout } = useContext(CustomizerContext);
  const [moonlight, setMoonlight] = useState(false);

  const MoonlightToggle = (light: boolean) => {
    if (light) {
      addMixBackgroundLayout('light-only');
      document.body.className = 'light-only';
      setMoonlight(!light);
    } else {
      addMixBackgroundLayout('dark-only');
      document.body.className = 'dark-only';
      setMoonlight(!light);
    }
  };

  return (
    <li>
      <div
        className={`mode ${moonlight ? 'active' : ''}`}
        onClick={() => MoonlightToggle(moonlight)}>
        <SvgIcon iconId={'moon'} />
      </div>
    </li>
  );
};

export default MoonLight;
