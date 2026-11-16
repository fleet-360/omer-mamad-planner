import { Sidebar, Header, DemoDock, PREAUTH } from '../screens/Shell.jsx';
import Login from '../screens/Login.jsx';
import Signup from '../screens/Signup.jsx';
import Plans from '../screens/Plans.jsx';
import Projects from '../screens/Projects.jsx';
import Wizard from '../screens/Wizard.jsx';
import Canvas from '../screens/Canvas.jsx';
import Review from '../screens/Review.jsx';
import Export from '../screens/Export.jsx';
import Library from '../screens/Library.jsx';
import Billing from '../screens/Billing.jsx';
import Settings from '../screens/Settings.jsx';
import { sx } from '../ui/dom.jsx';
import { useSyncExternalStore } from 'react';
import { getLang, subscribe } from './i18n.js';
import { getTheme, subscribe as subscribeTheme } from './theme.js';

export default function Layout({ v }) {
  const lang = useSyncExternalStore(subscribe, getLang);
  useSyncExternalStore(subscribeTheme, getTheme); // re-render every screen when the theme changes
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const screens = (
    <>
      {v.isLogin ? <Login v={v} /> : null}
      {v.isSignup ? <Signup v={v} /> : null}
      {v.isPlans ? <Plans v={v} /> : null}
      {v.isProjects ? <Projects v={v} /> : null}
      {v.isWizard ? <Wizard v={v} /> : null}
      {v.isCanvas ? <Canvas v={v} /> : null}
      {v.isReview ? <Review v={v} /> : null}
      {v.isExport ? <Export v={v} /> : null}
      {v.isLibrary ? <Library v={v} /> : null}
      {v.isBilling ? <Billing v={v} /> : null}
      {v.isSettings ? <Settings v={v} /> : null}
    </>
  );
  // Login, signup and plans are full-page (no navigation before login); everything else lives in the shell.
  if (PREAUTH.includes(v.screen)) {
    return (
      <div dir={dir} style={sx("min-height:100vh;background:#F4F2ED;display:flex;flex-direction:column")}>
        {screens}
        <DemoDock v={v} />
      </div>
    );
  }
  return (
    <div dir={dir} style={sx("min-height:100vh;background:#F4F2ED;display:flex")}>
      <Sidebar v={v} />
      <div style={sx("flex:1;min-width:0;display:flex;flex-direction:column")}>
        <Header v={v} />
        {screens}
      </div>
      <DemoDock v={v} />
    </div>
  );
}
