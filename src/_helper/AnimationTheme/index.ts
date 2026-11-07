// Ported from Cuba 4.8.26 — src/_helper/AnimationTheme/index.jsx, typed.

import { createContext } from 'react';

export interface AnimationThemeContextValue {
  animation: string;
  routerAnimation: (layoutAnim: string) => void;
}

const AnimationThemeContext = createContext<AnimationThemeContextValue>(
  {} as AnimationThemeContextValue,
);

export default AnimationThemeContext;
