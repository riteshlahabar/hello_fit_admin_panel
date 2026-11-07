// Ported verbatim from Cuba 4.8.26 — src/Data/Layouts.jsx.
// Cuba names its twelve sidebar layouts after cities; the value is the class
// pair the SCSS keys off, and the key is what lands in the URL and in
// localStorage('layout'). Do not rename these — layout/sidebar.scss and
// themes/responsive.scss both select on the values.

export type LayoutClass = Record<string, string>;

export const classes: LayoutClass[] = [
  { Dubai: 'compact-wrapper' },
  { London: 'only-body' },
  { Seoul: 'compact-wrapper modern-type' },
  { LosAngeles: 'horizontal-wrapper material-type' },
  { Paris: 'compact-wrapper dark-sidebar' },
  { Tokyo: 'compact-sidebar' },
  { Madrid: 'compact-wrapper color-sidebar' },
  { Moscow: 'compact-sidebar compact-small' },
  { NewYork: 'compact-wrapper box-layout' },
  { Singapore: 'horizontal-wrapper enterprice-type' },
  { Rome: 'compact-sidebar compact-small material-icon' },
  { Barcelona: 'horizontal-wrapper enterprice-type advance-layout' },
];
