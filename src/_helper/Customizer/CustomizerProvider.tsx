// Ported from Cuba 4.8.26 — src/_helper/Customizer/CustomizerProvider.jsx.
// Logic is unchanged: the same localStorage keys, the same writes through
// ConfigDB.data, the same effect that reads the layout name out of the URL's
// last segment. Only the types and the `.map` -> `.forEach` in that effect
// differ, because Cuba's version mapped purely for the side effect.

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
  const [mix_background_layout, setMixBackgroundLayout] = useState('');
  const [toggleIcon, setToggleIcon] = useState(false);
  const [mixLayout, setMixLayout] = useState(false);
  const [sidebarResponsive, setSidebarResponsive] = useState(false);
  const [IsOpen, setIsClose] = useState(false);

  const defaultLayoutObj = classes.find(
    (item) => Object.values(item).pop() === 'compact-wrapper',
  )!;
  const layoutURL =
    localStorage.getItem('layout') || Object.keys(defaultLayoutObj).pop()!;
  const layoutValue = Object.values(defaultLayoutObj).pop()!;
  const location = window.location.pathname.split('/').pop();

  useEffect(() => {
    setLayout(layoutValue);
    setSidebarIconType(
      localStorage.getItem('sidebar_icon_type') ||
        ConfigDB.data.settings.sidebar.iconType,
    );
    classes.forEach((item) => {
      const item1 = Object.keys(item).pop();
      if (location === item1) {
        const val = Object.values(item).pop()!;
        localStorage.setItem('sidebar_layout', val);
        ConfigDB.data.settings.sidebar.type = val;
        setLayout(val);
      }
    });
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
        layoutURL,
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
