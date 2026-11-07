// Ported from Cuba 4.8.26 — src/_helper/AnimationTheme/AnimationThemeProvider.jsx.
// Drives the CSSTransition classNames in Layout/Layout.tsx; the class names
// themselves come from Cuba's vendors/animate.

import { useState } from 'react';
import type { ReactNode } from 'react';
import ConfigDB from '../../Config/ThemeConfig';
import Context from './index';

interface AnimationThemeProviderProps {
  children: ReactNode;
}

const AnimationThemeProvider = (props: AnimationThemeProviderProps) => {
  const [animation, setAnimation] = useState('');

  const routerAnimation = (layout_anim: string) => {
    ConfigDB.data.router_animation = layout_anim;
    localStorage.setItem('animation', layout_anim);
    setAnimation(layout_anim);
  };

  return (
    <Context.Provider
      value={{
        animation,
        routerAnimation,
      }}>
      {props.children}
    </Context.Provider>
  );
};

export default AnimationThemeProvider;
