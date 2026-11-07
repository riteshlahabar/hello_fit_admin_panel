// Ported from Cuba 4.8.26 -- src/i18n.jsx.
//
// SidebarMenuItems and the Language picker both depend on this being
// initialised, so it is imported for its side effect in main.tsx exactly as
// Cuba does. `keySeparator: false` is Cuba's and matters: the menu uses the
// English string itself as the lookup key, so a title containing a dot must
// not be read as a nested path.
//
// The resource tables are Cuba's. Which languages HelloFit actually ships is
// still open in the spec (section 12), so nothing is added or removed here.

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translations: {
          General: 'General',
          'Dashboards,Widgets': 'Dashboards,Widgets',
          Dashboard: 'Dashboard',
          Default: 'Default',
          Widgets: 'Widgets',
          Chart: 'Chart',
          Applications: 'Applications',
        },
      },
      cn: {
        translations: {
          General: '一般',
          Dashboards: '仪表板',
          Widgets: '小部件',
          Dashboard: '仪表板',
          Default: '默认',
          Chart: '图表',
          Applications: '应用领域',
        },
      },
      ae: {
        translations: {
          General: 'جنرال لواء',
          Dashboards: 'لوحات القيادة والحاجيات',
          Widgets: 'لوحات القيادة',
          Dashboard: 'لوحة القيادة',
          Default: 'إفتراضي',
          Chart: 'مخطط',
          Applications: 'التطبيقات',
        },
      },
      du: {
        translations: {
          General: 'Algemeen',
          Dashboards: 'Dashboards',
          Dashboard: 'Dashboard',
          Default: 'Standaard',
          Widgets: 'Widgets',
          Chart: 'Grafiek',
          Applications: 'Toepassingen',
        },
      },
      es: {
        translations: {
          General: 'General',
          'Dashboards,Widgets': 'Cuadros de mando, widgets',
          Dashboard: 'Tablero',
          Default: 'Defecto',
          Widgets: 'Widgets',
          Chart: 'Gráfico',
          Applications: 'Aplicaciones',
        },
      },
      fr: {
        translations: {
          General: 'Générale',
          'Dashboards,Widgets': 'Tableaux de bord, widgets',
          Dashboard: 'Tableau de bord',
          Default: 'Défaut',
          Widgets: 'Widgets',
          Chart: 'Graphique',
          Applications: 'Applications',
        },
      },
      pt: {
        translations: {
          General: 'Geral',
          'Dashboards,Widgets': 'Painéis, Widgets',
          Dashboard: 'painel de controle',
          Default: 'Padrão',
          Widgets: 'Widgets',
          Chart: 'Gráfico',
          Applications: 'Formulários',
        },
      },
    },
    fallbackLng: 'en',
    debug: false,

    ns: ['translations'],
    defaultNS: 'translations',

    keySeparator: false,

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
