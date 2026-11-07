// Ported from Cuba 4.8.26 -- src/App.jsx.
//
// Cuba nests 24 context providers here: Chartist, Chartjs, GoogleChart,
// Project, Chat, Contact, Task, Gallery, Table, Bookmark, Todo, Email,
// SearchResult, Product, Cart, Filter, WishList, JobSearch, Learning, Faq,
// AnimationTheme and Customizer. Every one of them but the last two exists to
// hold the fake data behind a template demo page -- kanban boards, an inbox, a
// shop -- and none corresponds to anything in HelloFit.
//
// What is kept is what the shell genuinely needs: CustomizerProvider (the
// layout, sidebar and colour state the SCSS reads) and AnimationThemeProvider
// (the route transition). AuthProvider is added in their place, holding the
// real admin session that Cuba's fake backend used to stand in for.

import AnimationThemeProvider from './_helper/AnimationTheme/AnimationThemeProvider';
import CustomizerProvider from './_helper/Customizer/CustomizerProvider';
import AuthProvider from './_helper/Auth/AuthProvider';
import Routers from './Route';

const App = () => (
  <div className='App'>
    <AuthProvider>
      <CustomizerProvider>
        <AnimationThemeProvider>
          <Routers />
        </AnimationThemeProvider>
      </CustomizerProvider>
    </AuthProvider>
  </div>
);

export default App;
