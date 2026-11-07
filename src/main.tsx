// Entry point. Cuba's src/index.jsx used ReactDOM.render (React 17); React 19
// needs createRoot. The import order is Cuba's and matters: the stylesheet and
// i18n are both imported for their side effects before App mounts.
//
// StrictMode is deliberately off. Cuba's layout code mutates the DOM directly
// and mutates `active` in place on the MENUITEMS objects; StrictMode's double
// invocation of effects makes the sidebar accordion toggle itself closed again
// on mount. Turning it on means rewriting Cuba's sidebar state handling, which
// is exactly the design behaviour we are porting rather than redesigning.

import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './App';
import './i18n';

createRoot(document.getElementById('root')!).render(<App />);
