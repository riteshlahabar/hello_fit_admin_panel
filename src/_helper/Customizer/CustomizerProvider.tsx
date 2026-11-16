// Ported from Cuba 4.8.26 — src/_helper/Customizer/CustomizerProvider.jsx.
// Logic is unchanged bar one removal: the same localStorage keys and the same
// writes through ConfigDB.data. What is gone is the mount effect's walk over
// the twelve layout names looking for a match on the URL's last segment --
// routes no longer carry that segment, so it matched nothing. See the comment
// at the effect.

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import ConfigDB from '../../Config/ThemeConfig';
import { classes } from '../../Data/Layouts';
import Context from './index';

interface CustomizerProviderProps {
  children: ReactNode;
}

const CustomizerProvider = (props: CustomizerProviderProps) => {
  const customizer = ConfigDB.data;
  const [layout, setLayout] = useState('');
  const [sidebarIconType, setSidebarIconType] = useState('');
  // Seeded from ConfigDB, which now reads the localStorage key `MoonLight`
  // has always written. Cuba started this at `''`, so a reload came back light
  // whatever had been chosen.
  const [mix_background_layout, setMixBackgroundLayout] = useState(
    customizer.color.mix_background_layout,
  );
  const [toggleIcon, setToggleIcon] = useState(false);
  const [mixLayout, setMixLayout] = useState(false);
  const [sidebarResponsive, setSidebarResponsive] = useState(false);
  const [IsOpen, setIsClose] = useState(false);

  const defaultLayoutObj = classes.find(
    (item) => Object.values(item).pop() === 'compact-wrapper',
  )!;
  const layoutValue = Object.values(defaultLayoutObj).pop()!;

  useEffect(() => {
    setLayout(layoutValue);
    setSidebarIconType(
      localStorage.getItem('sidebar_icon_type') ||
        ConfigDB.data.settings.sidebar.iconType,
    );
    // Cuba matched the URL's last segment against its twelve layout names here
    // and promoted the match to the active sidebar class. That segment is gone
    // from every route (see Route/Routes.tsx) and the layout switcher that
    // wrote it was never ported, so the loop could only ever reselect
    // `compact-wrapper`, which `layoutValue` above already is.
    ConfigDB.data.settings.sidebar_setting = 'default-sidebar';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set LTR, RTL, BOX type
  const addLayout = (layout: string) => {
    ConfigDB.data.settings.layout_type = layout as 'ltr' | 'rtl';
    localStorage.setItem('layout_type', layout);
    setLayout(layout);
  };

  // Toggle sidebar
  const toggleSidebar = (toggle: boolean) => {
    setToggleIcon(toggle);
  };

  // Multiple sidebar layouts
  const addSidebarLayouts = (sidebar_layout: string) => {
    localStorage.setItem('sidebar_layout', sidebar_layout);
    ConfigDB.data.settings.sidebar.type = sidebar_layout;
    setLayout(sidebar_layout);
  };

  // Sidebar icon type
  const addSidebarIconType = (sidebar_Icon_Type: string) => {
    localStorage.setItem('sidebar_icon_type', sidebar_Icon_Type);
    ConfigDB.data.settings.sidebar.iconType = sidebar_Icon_Type;
    setSidebarIconType(sidebar_Icon_Type);
  };

  // Sidebar settings like (border, default, ...)
  const addSidebarSettings = (settings: string) => {
    ConfigDB.data.settings.sidebar_setting = settings;
  };

  // The body class that `style.scss` and `themes/_dark.scss` key off, applied
  // here rather than in `MoonLight`. Two reasons:
  //
  //  - on boot nothing applied it at all, so a restored `dark-only` setting
  //    painted nothing until the icon was clicked again;
  //  - `MoonLight` assigned `document.body.className` outright, which wipes
  //    every other class on <body>. `Header` puts the layout direction there.
  //    Nothing currently keys off `body.ltr`, so it broke nothing yet — but it
  //    was a trap, and `classList` costs the same.
  useEffect(() => {
    document.body.classList.remove('light-only', 'dark-only');
    document.body.classList.add(mix_background_layout || 'light-only');
  }, [mix_background_layout]);

  // Mix layouts like (dark, light, ...)
  const addMixBackgroundLayout = (mix_background_layout: string) => {
    ConfigDB.data.color.mix_background_layout = mix_background_layout;
    localStorage.setItem('mix_background_layout', mix_background_layout);
    if (mix_background_layout !== 'light-only') {
      setMixLayout(false);
    } else {
      setMixLayout(true);
    }
    setMixBackgroundLayout(mix_background_layout);
  };

  // Colours
  const addColor = (default_color: string, secondary_color: string) => {
    ConfigDB.data.color.primary_color = default_color;
    ConfigDB.data.color.secondary_color = secondary_color;
    localStorage.setItem('default_color', default_color);
    localStorage.setItem('secondary_color', secondary_color);
  };

  const toggleSidebarResponsive = (toggle: boolean) => {
    setSidebarResponsive(toggle);
  };

  return (
    <Context.Provider
      value={{
        layout,
        sidebarIconType,
        mix_background_layout,
        toggleIcon,
        mixLayout,
        sidebarResponsive,
        IsOpen,
        customizer,
        setIsClose,
        setToggleIcon,
        toggleSidebarResponsive,
        setMixLayout,
        addSidebarLayouts,
        addSidebarIconType,
        addSidebarSettings,
        addLayout,
        addMixBackgroundLayout,
        addColor,
        toggleSidebar,
      }}>
      {props.children}
    </Context.Provider>
  );
};

export default CustomizerProvider;
