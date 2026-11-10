// Ported verbatim from Cuba 4.8.26 — src/Config/ThemeConfig.jsx.
// `static data` is kept as a mutable singleton because Cuba's Customizer writes
// through it (ConfigDB.data.settings.sidebar.type = ...) and the SCSS reads the
// resulting body/wrapper classes.

export interface ThemeSettings {
  layout_type: 'ltr' | 'rtl';
  sidebar: {
    type: string;
    iconType: string;
  };
  sidebar_setting: string;
}

export interface ThemeColor {
  primary_color: string;
  secondary_color: string;
  mix_background_layout: string;
}

export interface ThemeConfigData {
  settings: ThemeSettings;
  color: ThemeColor;
  router_animation: string;
}

export class ConfigDB {
  static data: ThemeConfigData = {
    settings: {
      layout_type: 'ltr',
      sidebar: {
        type: 'compact-wrapper',
        iconType: 'stroke-svg',
      },
      sidebar_setting: 'default-sidebar',
    },
    color: {
      // HelloFit brand accent from `website design frontview/` (--orange,
      // --taupe). Cuba's own values were #7366ff / #f73164. These must match
      // --theme-deafult / --theme-secondary in assets/scss/style.scss and
      // $primary-color / $secondary-color in assets/scss/utils/_variables.scss.
      primary_color: localStorage.getItem('default_color') || '#e33e29',
      secondary_color: localStorage.getItem('secondary_color') || '#c1b19e',
      mix_background_layout: 'light-only',
    },
    // Bridged onto Cuba's animate.css keyframes by styles/route-animation.scss;
    // any name in its $route-animations list is valid.
    router_animation: 'fadeInUp',
  };
}

export default ConfigDB;
