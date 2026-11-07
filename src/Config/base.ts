// Cuba is a Create React App project and spells its public base path
// `process.env.PUBLIC_URL` in roughly a hundred places. Vite has no such
// variable; the equivalent is `import.meta.env.BASE_URL`, which differs in that
// it always carries a trailing slash where CRA's never does.
//
// Every ported Cuba file imports PUBLIC_URL from here, so the CRA -> Vite
// substitution stays mechanical and reviewable in one place rather than being
// re-derived per file.

export const PUBLIC_URL = import.meta.env.BASE_URL.replace(/\/$/, '');

// Joins a path onto the public base. Cuba writes `${PUBLIC_URL}/svg/sprite.svg`
// directly; this is for the places where a leading slash would double up.
export const publicPath = (path: string) =>
  `${PUBLIC_URL}/${path.replace(/^\//, '')}`;
