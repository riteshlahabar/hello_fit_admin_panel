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
      primary_color: localStorage.getItem('default_color') || '#7366ff',
      secondary_color: localStorage.getItem('secondary_color') || '#f73164',
      mix_background_layout: 'light-only',
    },
    router_animation: 'fadeIn',
  };
}

export default ConfigDB;
