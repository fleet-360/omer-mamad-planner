import TopBar from '../screens/TopBar.jsx';
import Login from '../screens/Login.jsx';
import Signup from '../screens/Signup.jsx';
import Plans from '../screens/Plans.jsx';
import Wizard from '../screens/Wizard.jsx';
import Canvas from '../screens/Canvas.jsx';
import Review from '../screens/Review.jsx';
import Export from '../screens/Export.jsx';
import Library from '../screens/Library.jsx';
import Billing from '../screens/Billing.jsx';
import Settings from '../screens/Settings.jsx';
import { sx } from '../ui/dom.jsx';

export default function Layout({ v }) {
  return (
    <div dir="rtl" style={sx("min-height:100vh;background:#F4F2ED;display:flex;flex-direction:column")}>
      <TopBar v={v} />
      {v.isLogin ? <Login v={v} /> : null}
      {v.isSignup ? <Signup v={v} /> : null}
      {v.isPlans ? <Plans v={v} /> : null}
      {v.isWizard ? <Wizard v={v} /> : null}
      {v.isCanvas ? <Canvas v={v} /> : null}
      {v.isReview ? <Review v={v} /> : null}
      {v.isExport ? <Export v={v} /> : null}
      {v.isLibrary ? <Library v={v} /> : null}
      {v.isBilling ? <Billing v={v} /> : null}
      {v.isSettings ? <Settings v={v} /> : null}
    </div>
  );
}
