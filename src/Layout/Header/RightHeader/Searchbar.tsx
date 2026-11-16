// Ported from Cuba 4.8.26 -- src/Layout/Header/RightHeader/Searchbar.tsx.
// Toggles the full-width search form that Header/index.tsx renders.
//
// **Cuba's version had its branches inverted** and opened the panel only when
// its own flag was *already* true. Starting from `useState(false)`, the first
// click took the else branch and removed a class that was not there, so nothing
// happened; the second click opened it. That is the "first click does nothing"
// report, 16 Nov 2026.
//
// Fixed by dropping the flag rather than inverting it. The panel lives in
// `Header/index.tsx` and its own X button removes `.open` straight from the
// DOM without telling this component, so any flag kept here desyncs the moment
// someone closes the panel that way -- and the next icon click would be dead
// again, by a different route. The class on `.search-full` is the only thing
// that is actually true, so it is read at click time.
//
// Cuba also cleared `.more_lang` here, to shut the language dropdown when
// search opened. That dropdown went with the Language control on 16 Nov, and
// nothing renders `.more_lang` any more, so the line is gone with it.

import SvgIcon from '../../../Components/Common/Component/SvgIcon';

const Searchbar = () => {
  const toggleSearch = () => {
    const panel = document.querySelector('.search-full');
    if (!panel) return;

    const willOpen = !panel.classList.contains('open');
    panel.classList.toggle('open', willOpen);

    if (willOpen) {
      // The panel animates in; focusing it is what makes one click enough.
      document.querySelector<HTMLInputElement>('#demo-input')?.focus();
    }
  };

  return (
    <li>
      <span className='header-search'>
        <SvgIcon iconId='search' onClick={toggleSearch} />
      </span>
    </li>
  );
};

export default Searchbar;
