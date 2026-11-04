// הלוגיקה של הממשק — הועברה מהעיצוב כמו שהיא, ומחוברת לשכבת ה-API (src/services/api.js).
import React from 'react';
import Layout from './Layout.jsx';
import { CAT, AUTO_PLAN, STEPS, meta } from './catalog.js';
import { api } from '../services/api.js';

const SCREENS = ['login','signup','plans','wizard','canvas','review','export','library','billing','settings'];
const screenFromHash = () => { const s = location.hash.replace(/^#\/?/, ''); return SCREENS.includes(s) ? s : null; };
export const MAX_DRAWING_BYTES = 80 * 1024 * 1024;
const fmtSize = b => b >= 1048576 ? (b/1048576).toFixed(1)+'MB' : Math.max(1, Math.round(b/1024))+'KB';
const validateDrawing = file => {
  if(!/\.dwg$/i.test(file.name)) return 'ניתן להעלות קובץ DWG בלבד';
  if(file.size > MAX_DRAWING_BYTES) return 'הקובץ גדול מ‑80MB';
  if(file.size === 0) return 'הקובץ ריק';
  return '';
};

export default class OmerApp extends React.Component {
  static defaultProps = { accent: '#4C6EF5' };

  state = {
    screen:'login', vBrand:'a', vDraw:'a', vAuto:'a',
    suStep:1, suBuild:['מגורים'], suPType:'חדש', suField:'אדריכלות', classOpen:false, pay:'card', plan:2, paid:false,
    f:{projName:'מגדל הדר, בניין ב׳', projAddr:'רחוב הדר 12, בני ברק'}, touched:{}, ecN:1,
    q:{exec:'יש', sup:'אין', ptype:'חדש', space:'ממ״ד (דירתי)', addon:'לא', approved:'לא', tech:'לא', techLoc:'גג', techOpen:'פתוחה', hvac:'מיני מרכזי + מפוצל', split:'כן', vrfStar:true},
    approvedFile:false, submitted:false, savedAt:'',
    wizMode:'full', wizStep:1,
    choice:{mamad:'רגיל', build:'תוספת ממ״ד למבנה קיים', lobby:'כולל מבואה', door:'הדף רסיסים', light:'80 ס״מ', win:'דו כנפי', hvac:'מיני מרכזי כללי', gas:'תשתיות גז מלאות', spr:'נדרש', cbl:'נדרש', scale:'1:50', motor:'מסתור', omerN:'2', omerP:'2.5'},
    parties:{exec:true, pm:false},
    fileReady:true,
    placed:[], nextId:1, zoom:1, pan:{x:0,y:0}, hover:null, hoverPos:null, tip:null,
    drag:null, dragXY:null,
    autoPhase:'idle', autoStep:0, autoLeft:5, resultHidden:false,
    apt:{A:'idle', B:'idle'},
    layer:'all', exportDone:false,
    settings:{autoSpr:true, keepLayers:true, mm:true},
    // ---- חיבור לשרת (לא משנה את הנראות)
    loginEmail:'office@arch-studio.co.il', loginPass:'123456789',
    upload:{name:'HADAR-B-FLOOR-03.dwg', meta:'4.2MB · 1:50 · 14 שכבות · זוהו 2 גרעיני ממ״ד', status:'ok', pct:100, error:'', id:null},
    orderId:'OM-261103-0417', busy:false, sendError:'', invoices:null
  };

  componentDidMount(){
    this._mv = e => this.onMove(e);
    this._up = e => this.onUp(e);
    window.addEventListener('pointermove', this._mv);
    window.addEventListener('pointerup', this._up);
    this._hash = () => { const s = screenFromHash(); if(s && s !== this.state.screen) this.setState({screen:s, hover:null}); };
    window.addEventListener('hashchange', this._hash);
    const initial = screenFromHash();
    if(initial) this.setState({screen:initial});
    this.handlePaymentReturn();
    api.billing.invoices().then(r => r && r.invoices && this.setState({invoices:r.invoices})).catch(() => {});
    try {
      const d = JSON.parse(localStorage.getItem('omer-draft-v1') || 'null');
      if(d) this.setState(s => ({f:{...s.f, ...d.f}, q:{...s.q, ...d.q}, ecN:d.ecN || 1, wizStep:d.wizStep || 1, wizMode:d.wizMode || 'full', approvedFile:!!d.approvedFile, savedAt:d.savedAt || ''}));
    } catch(e) {}
  }
  saveDraft(){
    clearTimeout(this._sd);
    this._sd = setTimeout(() => {
      const S = this.state, d = new Date();
      const savedAt = String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
      try { localStorage.setItem('omer-draft-v1', JSON.stringify({f:S.f, q:S.q, ecN:S.ecN, wizStep:S.wizStep, wizMode:S.wizMode, approvedFile:S.approvedFile, savedAt})); } catch(e) {}
      this.setState({savedAt});
    }, 250);
  }
  setF(k,v){ this.setState(s => ({f:{...s.f, [k]:v}}), () => this.saveDraft()); }
  touch(k){ this.setState(s => ({touched:{...s.touched, [k]:true}})); }
  pickQ(k,v){ this.setState(s => ({q:{...s.q, [k]:v}}), () => this.saveDraft()); }
  setStep(n){ this.setState({wizStep:n, submitted:false}, () => this.saveDraft()); }
  removeContact(i){
    this.setState(s => {
      const f = {...s.f}, T = ['Name','Phone','Email'];
      for(let j = i; j < s.ecN - 1; j++) T.forEach(t => { f['ec'+j+t] = s.f['ec'+(j+1)+t] || ''; });
      T.forEach(t => { delete f['ec'+(s.ecN-1)+t]; });
      return {f, ecN:s.ecN - 1};
    }, () => this.saveDraft());
  }
  componentWillUnmount(){
    window.removeEventListener('pointermove', this._mv);
    window.removeEventListener('pointerup', this._up);
    window.removeEventListener('hashchange', this._hash);
    clearInterval(this._t); clearInterval(this._c);
  }

  set(k,v){ this.setState({[k]:v}); }
  pick(k,v){ this.setState(s => ({choice:{...s.choice, [k]:v}})); }
  go(screen){
    this.setState({screen, hover:null});
    if(location.hash !== '#/'+screen) history.replaceState(null, '', '#/'+screen);
  }

  // ================================================================ server integration
  async doLogin(){
    const S = this.state;
    try { await api.auth.login({email:S.loginEmail, password:S.loginPass}); } catch(e) { console.warn('[login]', e.message); }
    this.go('wizard');
  }

  /** Signup step 3: open the account, then charge through the payment provider. */
  async checkout(){
    const S = this.state, F = S.f;
    const customer = {
      firstName:F.suFirst || '', lastName:F.suLast || '', email:F.suEmail || F.suOfficeEmail || '',
      office:F.suOffice || '', phone:F.suCPhone || F.suOfficePhone || ''
    };
    this.setState({busy:true, payError:''});
    try {
      // the account is created when an email was entered (the design allows leaving fields empty)
      if(customer.email) await api.auth.signup({...customer, password:F.suPass || '', officeEmail:F.suOfficeEmail || '', officeAddress:F.suAddr || '',
        buildTypes:S.suBuild, projectType:S.suPType, field:S.suField === 'אחר' ? (F.suFieldOther || 'אחר') : S.suField});
      // The card fields on screen are a visual placeholder only. Card data is NEVER sent to our server:
      // with a live provider the customer is redirected to (or shown in an iframe) the provider's secure page.
      const r = await api.payments.checkout({plan:S.plan, method:S.pay, customer});
      if(r.redirectUrl){ window.location.href = r.redirectUrl; return; }
      this.setState({paid:true, orderId:r.orderId || S.orderId, busy:false});
    } catch(e) {
      this.setState({busy:false, payError:e.message || 'התשלום נכשל'});
    }
  }

  /** Back from the provider's hosted payment page: ?payment=success&order=OM-... */
  handlePaymentReturn(){
    const q = new URLSearchParams(location.search);
    const st = q.get('payment');
    if(!st) return;
    const order = q.get('order');
    history.replaceState(null, '', location.pathname + '#/signup');
    if(st === 'success') this.setState({screen:'signup', suStep:3, paid:true, orderId:order || this.state.orderId});
    else this.setState({screen:'signup', suStep:3, paid:false, payError:'התשלום בוטל או נכשל — אפשר לנסות שוב'});
  }

  async submitProject(){
    const S = this.state;
    this.setState({busy:true, sendError:''});
    try {
      await api.projects.submit({mode:S.wizMode, fields:S.f, answers:S.q, contacts:S.ecN, approvedFile:S.approvedFile, drawingId:S.upload.id, drawingName:S.upload.name});
      this.setState({submitted:true, busy:false});
      try { localStorage.removeItem('omer-draft-v1'); } catch(e) {}
    } catch(e) {
      this.setState({busy:false, sendError:'השליחה נכשלה · '+(e.message || 'נסה שוב')});
    }
  }

  /** DWG only, up to 80MB. Validated here and again on the server. */
  onDrawingFile(file){
    if(!file) return;
    const err = validateDrawing(file);
    if(err){ this.setState({upload:{...this.state.upload, status:'error', error:err}, fileReady:false}); return; }
    const name = file.name, size = fmtSize(file.size);
    this.setState({fileReady:true, upload:{name, meta:size+' · מעלה…', status:'uploading', pct:0, error:'', id:null}});
    api.uploads.drawing(file, pct => this.setState(s => ({upload:{...s.upload, pct, meta:size+' · מעלה… '+pct+'%'}})))
      .then(r => this.setState({upload:{name, meta:[size, this.state.choice.scale, r.version].filter(Boolean).join(' · '), status:'ok', pct:100, error:'', id:r.id}}))
      .catch(e => this.setState({fileReady:false, upload:{name, meta:size, status:'error', pct:0, error:e.message || 'ההעלאה נכשלה', id:null}}));
  }

  async doExportFiles(){
    this.setState({exportDone:true});
    try { await api.exports.create({drawingId:this.state.upload.id, formats:['dwg','pdf']}); } catch(e) { console.warn('[export]', e.message); }
  }

  toSvg(cx, cy){
    const el = this._sheet && this._sheet.current;
    if(!el) return null;
    const r = el.getBoundingClientRect();
    return {x:(cx - r.left)/r.width*1000, y:(cy - r.top)/r.height*640};
  }

  onMove(e){
    const d = this.state.drag;
    if(!d) return;
    if(d.kind === 'palette'){ this.setState({dragXY:{x:e.clientX, y:e.clientY}}); return; }
    if(d.kind === 'marker'){
      const p = this.toSvg(e.clientX, e.clientY);
      if(!p) return;
      this.setState(s => ({placed:s.placed.map(m => m.id === d.id ? {...m, x:Math.max(20,Math.min(980,p.x + d.ox)), y:Math.max(20,Math.min(620,p.y + d.oy))} : m)}));
      return;
    }
    if(d.kind === 'pan'){
      this.setState({pan:{x:d.px + (e.clientX - d.sx), y:d.py + (e.clientY - d.sy)}});
    }
  }
  onUp(e){
    const d = this.state.drag;
    if(d && d.kind === 'palette'){
      const p = this.toSvg(e.clientX, e.clientY);
      if(p && p.x > 8 && p.x < 992 && p.y > 8 && p.y < 632){
        this.setState(s => ({placed:[...s.placed, {id:'m'+s.nextId, t:d.t, apt:p.x > 500 ? 'A' : 'B', x:p.x, y:p.y, manual:true}], nextId:s.nextId+1}));
      }
    }
    if(d) this.setState({drag:null, dragXY:null});
  }

  startAuto(){
    clearInterval(this._t); clearInterval(this._c);
    this.setState({autoPhase:'running', autoStep:0, autoLeft:5, placed:[], apt:{A:'idle',B:'idle'}, hover:null, resultHidden:false});
    let n = 0;
    this._t = setInterval(() => {
      n++;
      const placed = AUTO_PLAN.filter(p => p.step <= n).map((p,i) => ({id:'a'+i, ...p}));
      if(n >= 6){
        clearInterval(this._t); clearInterval(this._c);
        this.setState({autoStep:6, placed, autoPhase:'result', apt:{A:'pending',B:'pending'}});
      } else {
        this.setState({autoStep:n, placed});
      }
    }, 830);
    this._c = setInterval(() => this.setState(s => ({autoLeft:Math.max(0, +(s.autoLeft - 1).toFixed(0))})), 1000);
  }
  retryApt(a){
    this.setState(s => ({apt:{...s.apt, [a]:'running'}, placed:s.placed.filter(p => p.apt !== a)}));
    setTimeout(() => this.setState(s => ({
      apt:{...s.apt, [a]:'pending'},
      placed:[...s.placed, ...AUTO_PLAN.filter(p => p.apt === a).map((p,i) => ({id:'r'+a+i+Date.now(), ...p}))]
    })), 1300);
  }

  renderVals(){
    const S = this.state, acc = this.props.accent || '#4C6EF5';
    const V = k => S['v'+k];

    const NAV = [
      ['login','התחברות'],['signup','הרשמה'],['plans','חבילות'],['wizard','פתיחת פרויקט'],
      ['canvas','שרטוט אינטראקטיבי'],['auto','הצבה אוטומטית'],['review','בדיקה ואישור'],['export','הפקת קובץ'],
      ['library','ספריית אלמנטים'],['billing','חיוב'],['settings','הגדרות תקן']
    ];
    const activeScreen = S.screen === 'auto' ? 'canvas' : S.screen;
    const navItems = NAV.map(([k,label]) => ({
      label,
      style:'height:28px;padding:0 11px;border:0;font-size:12px;cursor:pointer;font-family:inherit;white-space:nowrap;'+
        ((k === S.screen || (k === 'canvas' && S.screen === 'canvas'))
          ? 'background:'+acc+';color:#fff' : 'background:transparent;color:#A8A69C'),
      go:() => { if(k === 'auto'){ this.go('canvas'); setTimeout(() => this.startAuto(), 60); } else this.go(k); }
    }));

    const brandScreen = ['login','signup','plans'].includes(S.screen);
    const vKey = brandScreen ? 'vBrand' : (S.autoPhase !== 'idle' ? 'vAuto' : 'vDraw');
    const vShow = brandScreen || S.screen === 'canvas';
    const vLabel = brandScreen ? 'זהות' : (S.autoPhase !== 'idle' ? 'חוויית הצבה' : 'עמוד שרטוט');
    const chip = on => 'width:26px;height:22px;border:0;cursor:pointer;font-size:11px;font-family:inherit;'+(on?'background:'+acc+';color:#fff':'background:transparent;color:#8C8A82');

    const dot = (c, size, fs) => 'width:'+size+'px;height:'+size+'px;border-radius:50%;background:'+c+';color:#fff;display:flex;align-items:center;justify-content:center;font-size:'+fs+'px;font-weight:600;flex:none;font-family:Rubik';
    const opt = on => 'height:36px;padding:0 14px;border:1px solid '+(on?acc:'#DEDCD5')+';background:'+(on?'#F2F4FF':'#fff')+';color:'+(on?'#26398F':'#4A4943')+';font-size:12.5px;cursor:pointer;font-family:inherit;'+(on?'font-weight:500':'');
    const optGroup = (key, arr, hint, label) => ({label, hint, opts:arr.map(o => ({label:o, style:opt(S.choice[key] === o), go:() => this.pick(key, o)}))});

    // ---- form fields + validation
    const vErr = (kind, v) => {
      if(!v) return '';
      const t = String(v).replace(/[\s-]/g, '');
      if(kind === 'phone' && !/^0\d{8,9}$/.test(t)) return 'מספר טלפון לא תקין';
      if(kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim())) return 'כתובת דוא״ל לא תקינה';
      if(kind === 'num' && !/^\d+(\.\d+)?$/.test(t)) return 'יש להזין מספר';
      if(kind === 'pw' && String(v).length < 8) return 'לפחות 8 תווים';
      return '';
    };
    const inp = bad => 'width:100%;height:40px;padding:0 11px;border:1px solid '+(bad ? '#C2255C' : '#DEDCD5')+';background:'+(bad ? '#FFF5F8' : '#FBFAF8')+';font-family:inherit;font-size:13px';
    const fld = (key, label, kind, ph, wrap) => {
      const v = S.f[key] || '', err = vErr(kind, v), show = !!err && !!S.touched[key];
      const ltr = kind && kind !== 'text';
      return {key, label, value:v, err, hasErr:show,
        ph:ph || (kind === 'phone' ? '050-0000000' : kind === 'email' ? 'name@company.co.il' : ''),
        type:kind === 'email' ? 'email' : kind === 'phone' ? 'tel' : kind === 'pw' ? 'password' : 'text',
        set:e => this.setF(key, e.target.value), blur:() => this.touch(key),
        style:inp(show)+(ltr ? ';direction:ltr;text-align:right' : ''), wrap:wrap || 'min-width:0'};
    };
    const qOpts = (k, arr, small) => arr.map(o => ({label:o, style:opt(S.q[k] === o)+(small ? ';height:30px;padding:0 14px' : ''), go:() => this.pickQ(k, o)}));
    const fSuUser = [fld('suFirst','שם פרטי','text','ישראל'), fld('suLast','שם משפחה','text','כהן'), fld('suEmail','דואר אלקטרוני','email','name@office.co.il'), fld('suPass','סיסמה','pw','לפחות 8 תווים')];
    const fSuOffice = [fld('suOffice','שם המשרד','text','אדריכלים בע״מ'), fld('suOfficePhone','טלפון המשרד','phone','03-0000000'), fld('suOfficeEmail','דוא״ל המשרד','email','office@company.co.il'), fld('suAddr','כתובת','text','רחוב, עיר')];
    const fSuContact = [fld('suCName','שם'), fld('suCPhone','טלפון נייד','phone'), fld('suCEmail','דוא״ל','email')];
    const fCard = [fld('cardNo','מספר כרטיס','ltr','0000 0000 0000 0000','min-width:0;grid-column:1/-1'), fld('cardExp','תוקף','ltr','MM/YY'), fld('cardCvv','CVV','ltr','123'), fld('cardId','ת״ז בעל הכרטיס','ltr'), fld('cardName','שם בעל הכרטיס')];
    const PLANS = [['ניסיון','שרטוט בודד, ללא חיוב','0 ₪'],['בסיס','עד 10 שרטוטים · משתמש אחד','— ₪'],['מקצועי','עד 40 שרטוטים · 3 משתמשים','— ₪'],['משרד','ללא הגבלה','— ₪']];
    const isTrial = S.plan === 0;
    const suStepFields = {1:fSuUser, 2:[...fSuOffice, ...fSuContact], 3:[]};

    const fProj = [fld('projName','שם הפרויקט'), fld('projAddr','כתובת הפרויקט','text','רחוב, עיר')];
    const fDev = [fld('devName','שם יזם'), fld('devContact','איש קשר'), fld('devPhone','טלפון','phone'), fld('devEmail','מייל','email')];
    const fExec = [fld('execCompany','שם חברה'), fld('execPM','מנהל פרויקט'), fld('execEng','מהנדס ביצוע')];
    const execContacts = Array.from({length:S.ecN}, (_, i) => ({
      num:String(i+1), canRemove:S.ecN > 1, remove:() => this.removeContact(i),
      fields:[fld('ec'+i+'Name','שם'), fld('ec'+i+'Phone','טלפון','phone'), fld('ec'+i+'Email','מייל','email')]
    }));
    const fSup = [fld('supName','שם'), fld('supPhone','טלפון','phone'), fld('supEmail','מייל','email')];
    const fCharNums = [fld('units','מספר דירות','num'), fld('area','שטח (מ״ר)','num'), fld('offices','משרדים (מ״ר)','num'), fld('industry','תעשייה (מ״ר)','num')];
    const fHvacNums = [fld('ceilBottom','גובה תחתית תקרת בטון (ס״מ)','num','260'), fld('floorCeil','גובה פני ריצוף ותקרה (ס״מ)','num','12'), fld('bldgLoc','מיקום הבניין','text','עיר / שכונה / גוש וחלקה')];
    const fTechOther = [fld('techOther','מיקום הקומה הטכנית')];
    const fFeed = [fld('feed','מקור ההזנה לממ״ד','text','לדוגמה: יחידה פנימית במסדרון')];
    const fVrf = [fld('vrfLoc','מיקום היחידה','text','גג / מסתור / חצר')];
    const isVrf = S.q.hvac === 'VRF';
    const SECS = S.wizMode === 'quick' ? ['char','upload','summary'] : ['proj','exec','sup','char','hvac','upload','summary'];
    const SEC_NAMES = {proj:'פרטי פרויקט', exec:'קבלן ביצוע', sup:'חברת פיקוח', char:'אפיון פרויקט', hvac:'מיזוג', upload:'העלאת השרטוט', summary:'סיכום ושליחה'};
    const wStep = Math.min(S.wizStep, SECS.length), cur = SECS[wStep-1];
    const stepFields = sec => ({
      proj:[...fProj, ...fDev],
      exec:S.q.exec === 'יש' ? [...fExec, ...execContacts.flatMap(c => c.fields)] : [],
      sup:S.q.sup === 'יש' ? fSup : [],
      char:fCharNums,
      hvac:[...fHvacNums, ...fFeed, ...(isVrf ? fVrf : [])]
    })[sec] || [];
    const gateOk = fields => {
      if(!fields.some(x => x.err)) return true;
      this.setState(s => ({touched:{...s.touched, ...Object.fromEntries(fields.map(x => [x.key, true]))}}));
      return false;
    };
    const dash = v => (v && String(v).trim()) ? String(v) : '—';
    const rows = arr => arr.map(([label, value]) => ({label, value:dash(value)}));
    const F = S.f, Q = S.q;
    const SUM = {
      proj:rows([['שם הפרויקט',F.projName],['כתובת',F.projAddr],['שם יזם',F.devName],['איש קשר',F.devContact],['טלפון',F.devPhone],['מייל',F.devEmail]]),
      exec:Q.exec === 'אין' ? rows([['קבלן ביצוע','אין']]) : rows([['שם חברה',F.execCompany],['מנהל פרויקט',F.execPM],['מהנדס ביצוע',F.execEng],
        ...Array.from({length:S.ecN}, (_, i) => ['איש קשר '+(i+1), [F['ec'+i+'Name'],F['ec'+i+'Phone'],F['ec'+i+'Email']].filter(Boolean).join(' · ')])]),
      sup:Q.sup === 'אין' ? rows([['חברת פיקוח','אין']]) : rows([['שם',F.supName],['טלפון',F.supPhone],['מייל',F.supEmail]]),
      char:rows([['סוג',Q.ptype],['מספר דירות',F.units],['שטח (מ״ר)',F.area],['משרדים (מ״ר)',F.offices],['תעשייה (מ״ר)',F.industry],['סוג מרחב מוגן',Q.space],['תוספת ממ״ד למבנה קיים',Q.addon],['תוכניות מיגון מאושרות',Q.approved === 'כן' ? (S.approvedFile ? 'כן · קובץ צורף' : 'כן · לא צורף קובץ') : 'לא']]),
      hvac:rows([['תחתית תקרת בטון',F.ceilBottom && F.ceilBottom+' ס״מ'],['פני ריצוף ותקרה',F.floorCeil && F.floorCeil+' ס״מ'],['מיקום הבניין',F.bldgLoc],
        ['קומה טכנית',Q.tech === 'קיימת' ? [Q.techLoc === 'אחר' ? (F.techOther || 'אחר') : Q.techLoc, Q.techOpen].join(' · ') : 'לא'],
        ['שיטת מיזוג',Q.hvac],['מפוצל לכל החדרים',Q.split],['מקור הזנה לממ״ד',F.feed],
        ...(isVrf ? [['יחידת VRF חיצונית',[F.vrfLoc, Q.vrfStar ? 'מסומנת ★' : ''].filter(Boolean).join(' · ')]] : []),
        ['מעברי קיר / רצפה','ת״י 4442 חלק 5']]),
      upload:rows([['קובץ', S.fileReady ? S.upload.name : '']])
    };

    // ---- markers
    const markers = S.placed.map(m => {
      const c = meta(m.t), lx = m.x/1000*100, ty = m.y/640*100, hovered = S.hover === m.id;
      return {
        num:c.num, short:c.short, showLabel:hovered || S.zoom > 1.4,
        style:'position:absolute;left:'+lx+'%;top:'+ty+'%;margin-left:-19px;margin-top:-19px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:grab;z-index:'+(hovered?12:10)+';touch-action:none;animation:fadeIn .28s ease both',
        dotStyle:dot(c.color, 24, 11)+';box-shadow:0 0 0 '+(hovered?'4px rgba(76,110,245,.22)':'2px #fff')+';transition:box-shadow .15s',
        labelStyle:'position:absolute;top:32px;left:50%;transform:translateX(-50%);background:#1A1A17;color:#fff;padding:2px 6px;font-family:IBM Plex Mono,monospace;font-size:9px;white-space:nowrap;pointer-events:none',
        down:e => { e.stopPropagation(); const p = this.toSvg(e.clientX, e.clientY); this.setState({drag:{kind:'marker', id:m.id, ox:m.x - p.x, oy:m.y - p.y}, hover:null}); },
        enter:e => {
          clearTimeout(this._ht);
          const r = e.currentTarget.getBoundingClientRect();
          const wrapEl = this._sheet.current && this._sheet.current.parentElement;
          const w = wrapEl ? wrapEl.getBoundingClientRect() : {left:0, top:0, width:900, height:600};
          this.setState({hover:m.id, hoverPos:{
            cx:r.left + r.width/2 - w.left, below:r.bottom - w.top, above:r.top - w.top,
            ww:w.width, wh:w.height
          }});
        },
        leave:() => { clearTimeout(this._ht); this._ht = setTimeout(() => this.setState({hover:null}), 140); }
      };
    });

    const hm = S.placed.find(p => p.id === S.hover);
    const hc = hm && meta(hm.t);
    const hv = hc ? {
      num:hc.num, name:hc.name, code:hc.code, color:hc.color, dim:hc.dim, specs:hc.specs,
      apt:'דירה 3'+(hm.apt === 'A' ? 'א' : 'ב'),
      round:hc.shape === 'round', rect:hc.shape === 'rect',
      dotStyle:dot(hc.color, 26, 12)
    } : {specs:[]};
    const HP = S.hoverPos || {cx:0, below:0, above:0, ww:900, wh:600};
    const cardW = 262, cardH = 372, midY = (HP.above + HP.below)/2;
    let cardLeft = HP.cx + 28;
    if(cardLeft + cardW + 8 > HP.ww) cardLeft = HP.cx - 28 - cardW;
    cardLeft = Math.max(8, Math.min(HP.ww - cardW - 8, cardLeft));
    const cardTop = Math.max(8, Math.min(HP.wh - cardH - 8, midY - cardH/2));

    // ---- palette
    const counts = {};
    S.placed.forEach(p => counts[p.t] = (counts[p.t] || 0) + 1);
    const palette = CAT.map(c => ({
      num:c.num, name:c.name, code:c.code, short:c.short,
      count:counts[c.t] || 0,
      style:'display:flex;align-items:center;gap:10px;padding:9px 10px;border:1px solid '+(S.drag && S.drag.t === c.t ? acc : '#EDEBE4')+';background:#fff;cursor:grab;touch-action:none',
      railStyle:'position:relative;display:flex;flex-direction:column;align-items:center;padding:7px 0;border:1px solid '+(S.tip === c.t ? acc : 'transparent')+';cursor:grab;touch-action:none;background:'+(S.tip === c.t ? '#F7F8FF' : 'transparent'),
      dotStyle:dot(c.color, 24, 11),
      countStyle:'font-family:IBM Plex Mono,monospace;font-size:11px;color:'+((counts[c.t]||0) ? '#4A4943' : '#C9C6BC'),
      tip:S.tip === c.t,
      enter:() => this.set('tip', c.t),
      leave:() => this.set('tip', null),
      down:e => { e.preventDefault(); this.setState({drag:{kind:'palette', t:c.t}, dragXY:{x:e.clientX, y:e.clientY}}); }
    }));

    const aptName = a => 'דירה 3' + (a === 'A' ? 'א' : 'ב');
    const stLabel = {idle:'ממתין', running:'מריץ…', pending:'לאישור', approved:'אושר', rejected:'נדחה'};
    const stColor = {idle:'#A8A69C', running:acc, pending:'#E8590C', approved:'#2F6F4E', rejected:'#C2255C'};
    const aptStatusList = ['A','B'].map(a => ({
      name:aptName(a), label:stLabel[S.apt[a]],
      style:'font-size:11.5px;font-weight:500;color:'+stColor[S.apt[a]]
    }));

    const autoSteps = STEPS.map((label,i) => {
      const done = S.autoStep > i, now = S.autoStep === i;
      return {
        label, icon:done ? '✓' : (now ? '›' : '·'),
        iconStyle:'width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:11px;flex:none;'+(done?'background:'+acc+';color:#fff':(now?'border:1px solid '+acc+';color:'+acc:'color:#C9C6BC')),
        textStyle:'color:'+(done?'#1A1A17':(now?'#1A1A17':'#A8A69C'))+';font-weight:'+(now?'500':'400'),
        meta:done ? 'הושלם' : (now ? 'פועל' : ''),
        metaStyle:'font-family:IBM Plex Mono,monospace;font-size:10.5px;color:'+(now?acc:'#A8A69C'),
        logIconStyle:'width:12px;color:'+(done?'#2F6F4E':(now?acc:'#55544D')),
        logTextStyle:'color:'+(done?'#D7D5CC':(now?'#fff':'#55544D'))
      };
    });

    const notesFor = a => a === 'A'
      ? [{icon:'✓', text:'6 אלמנטים הוצבו · אין התנגשות עם פתחים', ok:true},
         {icon:'!', text:'מעבר הכבילה במרחק 26 ס״מ מהפינה — מומלץ 30', ok:false}]
      : [{icon:'✓', text:'6 אלמנטים הוצבו לפי מיקום מנוע במסתור', ok:true},
         {icon:'✓', text:'כל הבדיקות עברו', ok:true}];

    const resultApts = ['A','B'].map(a => {
      const st = S.apt[a];
      return {
        name:aptName(a), badge:a === 'A' ? '3א' : '3ב', meta:'6 אלמנטים · ממ״ד 300/300',
        cardStyle:'border:1px solid '+(st === 'approved' ? '#CFE3D6' : st === 'rejected' ? '#F0D3DE' : '#DEDCD5')+';background:'+(st === 'approved' ? '#FAFDFB' : '#fff')+';padding:13px 14px',
        badgeStyle:dot(st === 'approved' ? '#2F6F4E' : st === 'rejected' ? '#C2255C' : acc, 26, 11),
        notes:notesFor(a).map(n => ({icon:st === 'running' ? '·' : n.icon, text:st === 'running' ? 'מריץ מחדש את ההצבה…' : n.text,
          mark:'flex:none;font-weight:600;color:'+(n.ok ? '#2F6F4E' : '#E8590C')})),
        pending:st === 'pending', done:st === 'approved' || st === 'rejected',
        doneLabel:st === 'approved' ? 'הדירה אושרה' : 'הדירה נדחתה — נדרש תכנון מחדש',
        doneStyle:'height:32px;display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:500;background:'+(st === 'approved' ? '#EEF6F1' : '#FCEFF3')+';color:'+(st === 'approved' ? '#2F6F4E' : '#C2255C'),
        approve:() => this.setState(s => ({apt:{...s.apt, [a]:'approved'}})),
        reject:() => this.setState(s => ({apt:{...s.apt, [a]:'rejected'}})),
        retry:() => this.retryApt(a)
      };
    });

    const scanZones = [{x:760,y:80},{x:60,y:80}].map(z => ({
      style:'position:absolute;left:'+(z.x/1000*100)+'%;top:'+(z.y/640*100)+'%;width:18%;height:28.1%;border:1.5px solid '+acc+';background:rgba(76,110,245,.07)'
    }));
    const aptBadges = S.autoPhase === 'result' ? ['A','B'].map(a => ({
      text:aptName(a) + ' · ' + stLabel[S.apt[a]],
      style:'position:absolute;left:'+(a === 'A' ? 76 : 6)+'%;top:'+((a === 'A' ? 44 : 44))+'px;transform:translateY(-100%);background:#fff;border:1px solid '+stColor[S.apt[a]]+';padding:4px 9px;font-size:11.5px;display:flex;align-items:center;gap:6px;white-space:nowrap',
      dotStyle:'width:7px;height:7px;border-radius:50%;background:'+stColor[S.apt[a]]
    })) : [];

    const legend = CAT.map(c => ({num:c.num, name:c.name, count:counts[c.t] || 0, dotStyle:dot(c.color, 20, 10)}));
    const previewDots = S.placed.map(p => ({cx:p.x, cy:p.y, color:meta(p.t).color}));
    const sheetDots = S.placed.map(p => ({cx:30 + p.x*0.7, cy:30 + p.y*0.75, color:meta(p.t).color}));

    return {
      navItems, variantSwitch:vShow, variantLabel:vLabel,
      setVarA:() => this.set(vKey,'a'), setVarB:() => this.set(vKey,'b'),
      varAStyle:chip(S[vKey] === 'a'), varBStyle:chip(S[vKey] === 'b'),

      isLogin:S.screen === 'login', isSignup:S.screen === 'signup', isPlans:S.screen === 'plans',
      isWizard:S.screen === 'wizard', isCanvas:S.screen === 'canvas', isReview:S.screen === 'review',
      isExport:S.screen === 'export', isLibrary:S.screen === 'library',
      isBilling:S.screen === 'billing', isSettings:S.screen === 'settings',
      brandA:S.vBrand === 'a', brandB:S.vBrand === 'b',
      goSignup:e => { if(e) e.preventDefault(); this.go('signup'); },
      goWizard:() => this.go('wizard'), goPlans:() => this.go('plans'),
      goCanvas:() => this.go('canvas'), goReview:() => this.go('review'), goExport:() => this.go('export'),

      // signup
      signupSteps:[['פרטי המשתמש','שם, דוא״ל, סיסמה'],['משרד ופעילות','סיווג ותחום עיסוק'],['תשלום','סליקה מאובטחת']].map(([label,hint],i) => ({
        label, hint, num:S.suStep > i+1 || S.paid ? '✓' : String(i+1),
        style:'flex:1;display:flex;align-items:center;gap:10px;padding:14px 16px;'+(i ? 'border-right:1px solid #EDEBE4;' : '')+(S.suStep === i+1 && !S.paid ? 'background:#F7F8FF' : ''),
        numStyle:dot(S.suStep > i+1 || S.paid ? '#2F6F4E' : S.suStep === i+1 ? acc : '#DEDCD5', 24, 11)
      })),
      su1:S.suStep === 1, su2:S.suStep === 2, su3:S.suStep === 3 && !S.paid, suPaid:S.paid, showSuNav:!S.paid,
      fSuUser, fSuOffice, fSuContact, fCard,
      fSuOther:[fld('suFieldOther','פירוט תחום העיסוק')], fieldOther:S.suField === 'אחר',
      suNextLabel:S.busy && S.suStep === 3 ? 'מעבד…' : S.suStep === 3 ? (isTrial ? 'התחל ניסיון' : 'תשלום ואישור') : 'המשך',
      suNext:() => {
        if(S.busy || !gateOk(suStepFields[S.suStep] || [])) return;
        if(S.suStep === 3) this.checkout(); else this.set('suStep', S.suStep + 1);
      },
      orderId:S.orderId, hasPayError:!!S.payError, payError:S.payError,
      loginEmail:S.loginEmail, loginPass:S.loginPass,
      setLoginEmail:e => this.set('loginEmail', e.target.value), setLoginPass:e => this.set('loginPass', e.target.value),
      doLogin:() => this.doLogin(),
      suPrev:() => S.suStep === 1 ? this.go('login') : this.set('suStep', S.suStep - 1),
      fieldOpts:['אדריכלות','תכנון','ביצוע','אינסטלציה','קונסטרוקציה','יועץ','אחר'].map(o => ({label:o, style:opt(S.suField === o), go:() => this.set('suField', o)})),
      ptypeOpts:['חדש','תמ״א','רמ״ה','תעשייתי'].map(o => ({label:o, style:opt(S.suPType === o), go:() => this.set('suPType', o)})),
      classOpen:S.classOpen, classEmpty:!S.suBuild.length,
      toggleClass:() => this.set('classOpen', !S.classOpen),
      classFieldStyle:'display:flex;align-items:center;gap:8px;min-height:40px;padding:6px 11px;border:1px solid '+(S.classOpen ? acc : '#DEDCD5')+';background:#FBFAF8;cursor:pointer',
      classTags:S.suBuild.map(o => ({label:o, remove:e => { e.stopPropagation(); this.setState(s => ({suBuild:s.suBuild.filter(x => x !== o)})); }})),
      classOpts:['ציבורי','מסחרי','מגורים'].map(o => {
        const on = S.suBuild.includes(o);
        return {label:o, mark:on ? '✓' : '',
          boxStyle:'width:16px;height:16px;flex:none;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;border:1px solid '+(on ? acc : '#C9C6BC')+';background:'+(on ? acc : '#fff'),
          go:() => this.setState(s => ({suBuild:on ? s.suBuild.filter(x => x !== o) : [...s.suBuild, o]}))};
      }),
      isTrial, notTrial:!isTrial,
      planOpts:PLANS.map(([name, sub, price], i) => ({name, sub, price,
        go:() => this.set('plan', i),
        rowStyle:'display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;border:1px solid '+(S.plan === i ? acc : '#EDEBE4')+';background:'+(S.plan === i ? '#F7F8FF' : '#fff'),
        radioStyle:'width:14px;height:14px;border-radius:50%;flex:none;background:#fff;border:'+(S.plan === i ? '4px solid '+acc : '1px solid #C9C6BC')})),
      coName:PLANS[S.plan][0], coPrice:PLANS[S.plan][2], coVat:isTrial ? '0 ₪' : '— ₪', coTotal:PLANS[S.plan][2],
      paidTitle:isTrial ? 'החשבון נפתח' : 'התשלום התקבל',
      paidSub:isTrial ? 'חבילת ניסיון · שרטוט אחד' : 'קבלה נשלחה ל‑'+(S.f.suEmail || S.f.suOfficeEmail || 'דוא״ל המשרד'),
      payMethods:[['card','כרטיס אשראי'],['bit','ביט'],['wallet','Apple / Google Pay']].map(([k,label]) => ({label, style:opt(S.pay === k)+';flex:1;height:34px;padding:0 8px;font-size:12px', go:() => this.set('pay', k)})),
      payCard:S.pay === 'card', payBit:S.pay === 'bit', payWallet:S.pay === 'wallet',

      // plans
      plans:[
        {name:'ניסיון', price:'0 ₪', per:'', sub:'שרטוט בודד, ללא חיוב', cta:'התחל ניסיון', tag:null,
         features:['שרטוט אחד בלבד','כל רכיבי הממ״ד','הצבה אוטומטית','ייצוא PDF עם סימן מים']},
        {name:'אופציה 1 · בסיס', price:'—', per:'לחודש', sub:'עד 10 שרטוטים · משתמש אחד', cta:'בחר חבילה', tag:null,
         features:['עד 10 שרטוטים בחודש','ייצוא DWG ו‑PDF','תמיכה בדוא״ל']},
        {name:'אופציה 2 · מקצועי', price:'—', per:'לחודש', sub:'עד 40 שרטוטים · 3 משתמשים', cta:'בחר חבילה', tag:'נבחר',
         features:['עד 40 שרטוטים בחודש','3 משתמשים במשרד','הגדרות תקן והעדפות משרד','ספריית בלוקים להורדה','תמיכה טלפונית']},
        {name:'אופציה 3 · משרד', price:'—', per:'לחודש', sub:'ללא הגבלה · משתמשים ללא הגבלה', cta:'בחר חבילה', tag:null,
         features:['שרטוטים ומשתמשים ללא הגבלה','ניהול הרשאות במשרד','תבניות כותרת שרטוט מותאמות','ליווי מקצועי בהטמעה']}
      ].map((p,i) => ({
        ...p,
        style:'background:#fff;border:'+(p.tag ? '2px solid '+acc : '1px solid #DEDCD5')+';padding:24px 22px;display:flex;flex-direction:column;justify-content:space-between',
        btnStyle:'height:42px;width:100%;border:'+(p.tag ? '0' : '1px solid #DEDCD5')+';background:'+(p.tag ? acc : '#fff')+';color:'+(p.tag ? '#fff' : '#1A1A17')+';font-size:13.5px;font-weight:500;cursor:pointer;font-family:inherit',
        go:() => this.setState({screen:'signup', suStep:3, plan:i, paid:false})
      })),

      // wizard
      wizSteps:SECS.map((k, idx) => {
        const n = idx + 1;
        return {num:S.wizStep > n || (S.submitted && n === SECS.length) ? '✓' : String(n), label:SEC_NAMES[k],
          style:'display:flex;align-items:center;gap:10px;padding:10px;border:0;background:'+(wStep === n ? '#F7F8FF' : 'transparent')+';cursor:pointer;font-size:12.5px;font-family:inherit;text-align:right;color:'+(wStep === n ? '#26398F' : '#4A4943'),
          numStyle:dot(S.wizStep > n ? '#2F6F4E' : wStep === n ? acc : '#DEDCD5', 22, 10),
          go:() => this.setStep(n)};
      }),
      setFull:() => this.setState({wizMode:'full', wizStep:1, submitted:false}, () => this.saveDraft()),
      setQuick:() => this.setState({wizMode:'quick', wizStep:1, submitted:false}, () => this.saveDraft()),
      fullStyle:'flex:1;height:34px;border:0;cursor:pointer;font-size:12px;font-family:inherit;'+(S.wizMode === 'full' ? 'background:'+acc+';color:#fff' : 'background:#fff;color:#6B6A63'),
      quickStyle:'flex:1;height:34px;border:0;cursor:pointer;font-size:12px;font-family:inherit;'+(S.wizMode === 'quick' ? 'background:'+acc+';color:#fff' : 'background:#fff;color:#6B6A63'),
      wizNum:String(wStep), wizTotal:String(SECS.length), wizTitle:SEC_NAMES[cur],
      progressStyle:'height:100%;background:'+acc+';transition:width .25s;width:'+(S.submitted ? 100 : Math.round((wStep - 1) / SECS.length * 100))+'%',
      draftLabel:S.sendError || (S.savedAt ? 'טיוטה נשמרה · '+S.savedAt : ''),
      wzProj:cur === 'proj', wzExec:cur === 'exec', wzSup:cur === 'sup', wzChar:cur === 'char', wzHvac:cur === 'hvac', wzUpload:cur === 'upload',
      wzSummary:cur === 'summary' && !S.submitted, wzSent:cur === 'summary' && S.submitted, showWizNav:!S.submitted,
      wizNextLabel:cur === 'summary' ? (S.busy ? 'שולח…' : 'שלח') : 'המשך',
      wizNext:() => {
        if(S.busy || !gateOk(stepFields(cur))) return;
        if(cur === 'summary'){ this.submitProject(); return; }
        this.setStep(wStep + 1);
      },
      wizPrev:() => wStep === 1 ? this.go('plans') : this.setStep(wStep - 1),
      fProj, fDev, fExec, execContacts, fSup, fCharNums, fHvacNums, fTechOther, fFeed, fVrf,
      addContact:() => this.setState(s => ({ecN:s.ecN + 1}), () => this.saveDraft()),
      qExec:qOpts('exec',['יש','אין'],true), hasExec:Q.exec === 'יש',
      qSup:qOpts('sup',['יש','אין'],true), hasSup:Q.sup === 'יש',
      qPtype:qOpts('ptype',['חדש','תמ״א','רמ״ה']),
      qSpace:qOpts('space',['ממ״ד (דירתי)','ממ״ק (קומתי)','ממ״מ (מוסדי)']),
      qAddon:qOpts('addon',['כן','לא']), qApproved:qOpts('approved',['כן','לא']),
      approvedYes:Q.approved === 'כן', approvedFile:S.approvedFile, approvedNoFile:!S.approvedFile,
      pickApproved:() => this.setState({approvedFile:true}, () => this.saveDraft()),
      removeApproved:() => this.setState({approvedFile:false}, () => this.saveDraft()),
      qTech:qOpts('tech',['קיימת','לא']), techYes:Q.tech === 'קיימת', techOther:Q.techLoc === 'אחר',
      qTechLoc:qOpts('techLoc',['גג','מרתף','אחר']), qTechOpen:qOpts('techOpen',['פתוחה','סגורה']),
      qHvac:qOpts('hvac',['מיני מרכזי + מפוצל','VRF','מערכת נפרדת']), qSplit:qOpts('split',['כן','לא']), isVrf,
      toggleStar:() => this.pickQ('vrfStar', !Q.vrfStar),
      starMark:Q.vrfStar ? '✓' : '',
      starBox:'width:16px;height:16px;flex:none;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;border:1px solid '+(Q.vrfStar ? acc : '#C9C6BC')+';background:'+(Q.vrfStar ? acc : '#fff'),
      sumSecs:SECS.filter(k => k !== 'summary').map((k, idx) => ({title:SEC_NAMES[k], rows:SUM[k], edit:() => this.setStep(idx + 1)})),
      // DWG upload (click or drag & drop)
      fileInputRef:(this._file = this._file || React.createRef()),
      pickFile:() => this._file.current && this._file.current.click(),
      onDrawingInput:e => { this.onDrawingFile(e.target.files && e.target.files[0]); e.target.value = ''; },
      onDrawingDragOver:e => e.preventDefault(),
      onDrawingDrop:e => { e.preventDefault(); this.onDrawingFile(e.dataTransfer.files && e.dataTransfer.files[0]); },
      fileReady:S.fileReady, uploadName:S.upload.name, uploadMeta:S.upload.meta,
      uploadStatus:S.upload.status === 'uploading' ? 'מעלה…' : 'נקרא בהצלחה',
      uploadStatusStyle:'font-size:12px;font-weight:500;color:'+(S.upload.status === 'uploading' ? acc : '#2F6F4E'),
      hasUploadError:S.upload.status === 'error', uploadError:S.upload.error,

      // canvas
      sheetRef:(this._sheet = this._sheet || React.createRef()),
      canvasWrapStyle:'flex:1;position:relative;overflow:hidden;background:#F4F2ED;cursor:'+(S.drag && S.drag.kind === 'pan' ? 'grabbing' : 'default')+';touch-action:none',
      sheetStyle:'position:absolute;left:50%;top:50%;width:min(92%,1120px);aspect-ratio:1000/640;background:#fff;border:1px solid #DEDCD5;box-shadow:0 6px 26px rgba(26,26,23,.09);transform:translate(calc(-50% + '+S.pan.x+'px),calc(-50% + '+S.pan.y+'px)) scale('+S.zoom+');transform-origin:center',
      onCanvasDown:e => this.setState({drag:{kind:'pan', sx:e.clientX, sy:e.clientY, px:S.pan.x, py:S.pan.y}, hover:null}),
      onWheel:e => { e.preventDefault(); this.setState(s => ({zoom:Math.max(.5, Math.min(3, +(s.zoom - e.deltaY*0.0016).toFixed(3)))})); },
      zoomPct:Math.round(S.zoom*100), zoomIn:() => this.setState(s => ({zoom:Math.min(3, +(s.zoom + .15).toFixed(2))})),
      zoomOut:() => this.setState(s => ({zoom:Math.max(.5, +(s.zoom - .15).toFixed(2))})),
      resetView:() => this.setState({zoom:1, pan:{x:0,y:0}}),
      layers:[['all','כל השכבות'],['arch','אדריכלות'],['omer','פרטי ממ״ד']].map(([k,label]) => ({
        label, style:'height:28px;padding:0 10px;border:1px solid '+(S.layer === k ? acc : '#DEDCD5')+';background:'+(S.layer === k ? '#F2F4FF' : '#fff')+';font-size:12px;cursor:pointer;font-family:inherit;white-space:nowrap',
        go:() => this.set('layer', k)
      })),
      undo:() => this.setState(s => ({placed:s.placed.slice(0,-1)})),
      markers, palette, aptStatusList, scanZones, aptBadges,
      paletteDocked:S.vDraw === 'a', paletteFloating:S.vDraw === 'b',
      placedCount:S.placed.length,
      statusHint:S.drag ? (S.drag.kind === 'palette' ? 'שחרר על השרטוט להצבה' : 'גרור למיקום · שחרר לנעילה') : 'גרור אלמנט מהסרגל · גלגלת לזום · גרירת רקע להזזה · מעבר על אלמנט לפרט מוגדל',
      hoverCard:!!hm, hv,
      keepHover:() => clearTimeout(this._ht),
      dropHover:() => { clearTimeout(this._ht); this._ht = setTimeout(() => this.setState({hover:null}), 140); },
      hoverCardStyle:'position:absolute;z-index:30;width:'+cardW+'px;background:#fff;border:1px solid #DEDCD5;box-shadow:0 14px 36px rgba(26,26,23,.16);left:'+cardLeft+'px;top:'+cardTop+'px;pointer-events:auto;animation:fadeIn .16s ease both',
      ghost:!!(S.drag && S.drag.kind === 'palette' && S.dragXY),
      ghostNum:S.drag && S.drag.t ? meta(S.drag.t).num : '',
      ghostStyle:S.dragXY ? 'position:fixed;left:'+S.dragXY.x+'px;top:'+S.dragXY.y+'px;transform:translate(-50%,-50%);z-index:80;pointer-events:none;'+dot(S.drag && S.drag.t ? meta(S.drag.t).color : acc, 26, 12)+';box-shadow:0 4px 14px rgba(26,26,23,.3)' : 'display:none',
      autoRunning:S.autoPhase === 'running',
      autoOverlayA:S.autoPhase === 'running' && S.vAuto === 'a',
      autoOverlayB:S.autoPhase === 'running' && S.vAuto === 'b',
      autoResult:S.autoPhase === 'result' && !S.resultHidden,
      resultHidden:S.autoPhase === 'result' && S.resultHidden,
      hideResult:() => this.set('resultHidden', true),
      showResult:() => this.set('resultHidden', false),
      resultChipWrapStyle:'position:absolute;top:14px;left:'+(S.vDraw === 'a' ? '296px' : '14px')+';z-index:40',
      autoSteps, autoLeft:S.autoLeft,
      autoBarStyle:'height:100%;width:'+Math.round(S.autoStep/6*100)+'%;background:'+acc+';transition:width .4s ease',
      startAuto:() => this.startAuto(),
      resultPanelStyle:'position:absolute;top:14px;left:'+(S.vDraw === 'a' ? '296px' : '14px')+';z-index:40;width:326px;max-height:calc(100% - 28px);overflow:auto;background:#fff;border:1px solid #DEDCD5;box-shadow:0 16px 44px rgba(26,26,23,.16);animation:fadeUp .3s ease both',
      resultSummary:'12 אלמנטים ב‑2 גרעיני ממ״ד · 2 אזהרות · אשר כל דירה בנפרד',
      resultApts, approveAll:() => this.setState({apt:{A:'approved',B:'approved'}}),
      dismissResult:() => this.setState({autoPhase:'idle'}),

      // review
      checks:[
        {icon:'✓', ok:1, title:'קוטר וסוג שרוולי אוורור', desc:'שני שרוולי 4״ חרושתיים מגולוונים בכל גרעין.', apt:'3א · 3ב'},
        {icon:'✓', ok:1, title:'גובה מרכז צינור כניסה', desc:'30 ס״מ מפני הריצוף, בהתאם להנחיות ההצבה.', apt:'3א · 3ב'},
        {icon:'✓', ok:1, title:'מיקום אלכסוני של יציאת האוויר', desc:'היציאה ממוקמת באלכסון לפתח הכניסה.', apt:'3א · 3ב'},
        {icon:'!', ok:0, title:'מרחק מעבר כבילה מפינה', desc:'26 ס״מ בפועל, מומלץ 30 ס״מ. אינו חוסם הפקה.', apt:'3א'},
        {icon:'✓', ok:1, title:'2 צינורות 8״ מעל משקוף הדלת', desc:'נדרש בשל בחירת מיזוג מיני מרכזי. מרווח 10 ס״מ.', apt:'3א · 3ב'},
        {icon:'!', ok:0, title:'הספק יחידת עומר לא הוזן', desc:'ההצבה בוצעה לפי מקסימום 3 כ״ס. יש להשלים לפני הגשה.', apt:'3ב'},
        {icon:'×', ok:-1, title:'חפיפה בין ספרינקלר לתוואי תקרה', desc:'מעבר הספרינקלר חופף לקורה. נדרשת הזזה של 12 ס״מ.', apt:'3א'}
      ].map(c => ({...c, mark:'width:20px;height:20px;flex:none;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#fff;background:'+(c.ok === 1 ? '#2F6F4E' : c.ok === 0 ? '#E8590C' : '#C2255C')})),
      legend, previewDots, sheetDots,

      // export
      formats:[
        {name:'DWG · שכבות מלאות', desc:'שכבת OMER-DETAILS מעל שרטוט האדריכל', size:'5.1MB', checked:true},
        {name:'PDF · A2 להגשה', desc:'כולל כותרת שרטוט ורשימת סימונים', size:'1.8MB', checked:true}
      ].map(f => ({...f, style:'display:flex;align-items:center;gap:11px;padding:11px 12px;border:1px solid '+(f.checked ? '#C9D0F7' : '#EDEBE4')+';background:'+(f.checked ? '#F7F8FF' : '#fff')+';margin-bottom:8px;cursor:pointer'})),
      exportLabel:S.exportDone ? 'הופק · הפק שוב' : 'הפק והורד',
      exportDone:S.exportDone, doExport:() => this.doExportFiles(),

      // library
      catalog:CAT.map(c => ({...c, num:c.num, dotStyle:dot(c.color, 26, 12), round:c.shape === 'round', rect:c.shape === 'rect'})),

      // billing
      invoices:(S.invoices || [
        {id:'INV-2609-11', desc:'חבילת מקצועי · ספטמבר 2026', sum:'—', state:'שולם'},
        {id:'INV-2608-08', desc:'חבילת מקצועי · אוגוסט 2026', sum:'—', state:'שולם'},
        {id:'INV-2607-04', desc:'חבילת בסיס · יולי 2026', sum:'—', state:'שולם'},
        {id:'INV-2606-02', desc:'שדרוג חבילה · יוני 2026', sum:'—', state:'זוכה'}
      ]).map(v => ({...v, stateStyle:'font-size:12px;font-weight:500;color:'+(v.state === 'שולם' ? '#2F6F4E' : '#6B6A63')})),

      // settings
      settingGroups:[
        {label:'כללי הצבה אוטומטית', rows:[
          {label:'גובה מרכז צינור כניסה 4״', desc:'ס״מ מפני הריצוף', isInput:true, value:'150'},
          {label:'גובה מרכז צינור יציאה 4״', desc:'ס״מ מפני הריצוף', isInput:true, value:'190'},
          {label:'מרווח בין צינורות 8״', desc:'ס״מ', isInput:true, value:'10'}
        ]},
        {label:'התנהגות המערכת', rows:[
          {label:'הוסף ספרינקלר כברירת מחדל', desc:'כאשר לא צוין אחרת בשלב הבסיס', isToggle:true, key:'autoSpr'},
          {label:'שמור את שכבות האדריכל בייצוא', desc:'בכל קובץ DWG שמופק', isToggle:true, key:'keepLayers'}
        ]}
      ].map(g => ({...g, rows:g.rows.map(r => {
        const on = r.key ? S.settings[r.key] : false;
        return {...r, isInput:!!r.isInput, isToggle:!!r.isToggle,
          toggleStyle:'width:42px;height:24px;border:0;border-radius:12px;position:relative;cursor:pointer;flex:none;background:'+(on ? acc : '#DEDCD5'),
          knobStyle:'position:absolute;top:3px;'+(on ? 'left:3px' : 'left:21px')+';width:18px;height:18px;border-radius:50%;background:#fff;transition:left .16s',
          go:() => r.key && this.setState(s => ({settings:{...s.settings, [r.key]:!s.settings[r.key]}}))};
      })}))
    };
  }

  render(){
    return <Layout v={this.renderVals()} />;
  }
}
