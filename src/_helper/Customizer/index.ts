// Ported from Cuba 4.8.26 — src/_helper/Customizer/index.jsx, typed.
// Cuba created the context with no default value and every consumer assumes the
// provider is present; the cast keeps that behaviour without making every
// `useContext` call site nullable.

import { createContext } from 'react';
import type { ThemeConfigData } from '../../Config/ThemeConfig';

export interface CustomizerContextValue {
  layout: string;
  sidebarIconType: string;
  mix_background_layout: string;
  toggleIcon: boolean;
  mixLayout: boolean;
  sidebarResponsive: boolean;
  IsOpen: boolean;
  layoutURL: string;
  customizer: ThemeConfigData;
  setIsClose: (open: boolean) => void;
  setToggleIcon: (toggle: boolean) => void;
  toggleSidebarResponsive: (toggle: boolean) => void;
  setMixLayout: (mix: boolean) => void;
  addSidebarLayouts: (sidebarLayout: string) => void;
  addSidebarIconType: (sidebarIconType: string) => void;
  addSidebarSettings: (settings: string) => void;
  addLayout: (layout: string) => void;
  addMixBackgroundLayout: (mixBackgroundLayout: string) => void;
  addColor: (defaultColor: string, secondaryColor: string) => void;
  toggleSidebar: (toggle: boolean) => void;
}

const CustomizerContext = createContext<CustomizerContextValue>(
  {} as CustomizerContextValue,
);

export default CustomizerContext;
