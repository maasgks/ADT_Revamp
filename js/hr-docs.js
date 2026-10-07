/* ══ HR DOCS (FR-22) ═══════════════════════════════════════════════════════
   Letters HR issues to employees - experience, relieving, offer, warning and
   the rest - each produced from the ONE Active Template configured for its
   Document Type.

   THE LIFECYCLE, in the order FR-22 states it:

     Create        the Active Template for the type is loaded and its fields
                   are shown. Employee fields fill themselves from the
                   employee picked; the rest HR types.
     Save as Draft the values are kept; the document stays Draft and is
                   listed under Saved Drafts at the top of its type.
     Preview       the template rendered with what has been entered.
     Submit        the document moves to final review: Edit (back to the
                   fields, values kept), Download, or Save as Draft.

   WHO MAY DO WHAT (FR-22.1). Super Admin maintains templates and picks the
   Active one - one per type, never two. HR never sees a template: HR picks a
   type and gets the fields the Active Template asks for. Both read the role
   the rest of the app reads, CURRENT_USER_ROLE.

   FIELDS COME FROM THE TEMPLATE, NOT FROM A FORM DEFINITION. A template is a
   body with {{placeholders}}; the placeholders it uses ARE its fields. A
   catalogue below says how a known placeholder behaves - an employee picker,
   a value read off that employee, a date, a number, a choice. A placeholder
   the catalogue does not know becomes a plain text field. So when a Super
   Admin changes the Active Template, the Create form changes with it, which
   is FR-22.3's "the exact fields displayed shall depend on the selected
   Active Template". */

/* ── Who may maintain templates ────────────────────────────────────────── */
const HDOC_ADMIN_ROLES=['Entity Super Admin','Opendhi Platform Admin'];
function hdocIsAdmin(){return HDOC_ADMIN_ROLES.indexOf(CURRENT_USER_ROLE)>=0;}
/* TEMPLATE SETTINGS ARE HIDDEN FOR NOW. Every way into them - the gear on
   each row, the Templates button and "Active template" line on a type's
   screen, the template name in the Create popup - reads this one switch.
   Documents are still made from each type's Active Template; only the UI to
   see or change templates is off. Set to true to bring it all back. */
const HDOC_TEMPLATES_UI=false;
function hdocTplUI(){return HDOC_TEMPLATES_UI&&hdocIsAdmin();}

/* ── Document types ────────────────────────────────────────────────────── */
const HDOC_TYPES=[
  {key:'experience', label:'Experience Letter',          prefix:'EXP',blurb:'Certifies tenure and the role held.'},
  {key:'relieving',  label:'Relieving Letter',           prefix:'REL',blurb:'Confirms release after the last working day.'},
  {key:'internship', label:'Internship Letter',          prefix:'INT',blurb:'Certifies internship dates and project.'},
  {key:'offer',      label:'Offer Letter',               prefix:'OFR',blurb:'Offers a role with CTC and joining date.'},
  {key:'appointment',label:'Appointment Letter',         prefix:'APT',blurb:'Formally appoints a joined employee.'},
  {key:'increment',  label:'Increment Letter',           prefix:'INC',blurb:'Records a CTC revision and its effective date.'},
  {key:'confirmation',label:'Confirmation Letter',       prefix:'CNF',blurb:'Confirms service after probation.'},
  {key:'warn-leave', label:'Warning Letter - Leave',     prefix:'WLL',blurb:'Warns about unauthorised absence.'},
  {key:'warn-perf',  label:'Warning Letter - Performance',prefix:'WLP',blurb:'Warns about performance, with an improvement period.'}
];
function hdocTypeOf(key){return HDOC_TYPES.find(function(t){return t.key===key;})||null;}

/* ── People the letters are about, and who signs them ──────────────────── */
function hdocEmployees(){
  const de=(typeof directEmpData!=='undefined'?directEmpData:[]).map(function(e){
    return {name:e.name,empId:e.empId,designation:e.jobTitle,department:e.dept,location:e.branch,joinDate:e.joinDate,email:e.email};
  });
  const ge=(typeof globalEmpData!=='undefined'?globalEmpData:[]).map(function(e){
    return {name:e.name,empId:e.empId,designation:e.jobTitle,department:e.dept,location:e.country,joinDate:e.joinDate,email:e.email};
  });
  return de.concat(ge);
}
function hdocEmp(name){return hdocEmployees().find(function(e){return e.name===name;})||null;}
const HDOC_SIGNATORIES=[{name:'Pallavi Parate',desig:'HR Manager'},{name:'Shaun Test1',desig:'Director'}];
function hdocCompany(){
  return (typeof hdCurrentEntityName==='function'&&hdCurrentEntityName())||'Dhi Hyperlocal Pvt Ltd';
}

/* ── The field catalogue ───────────────────────────────────────────────────
   type      employee | auto | signatory | date | number | text | textarea | select
   from      for auto fields: which employee (or signatory) value they read   */
const HDOC_FIELDS={
  employee_name:      {label:'Employee',type:'employee',req:true},
  employee_id:        {label:'Employee ID',type:'auto',from:'empId'},
  designation:        {label:'Designation',type:'auto',from:'designation'},
  department:         {label:'Department',type:'auto',from:'department'},
  work_location:      {label:'Work Location',type:'auto',from:'location'},
  date_of_joining:    {label:'Date of Joining',type:'auto',from:'joinDate'},
  employee_email:     {label:'Employee Email',type:'auto',from:'email'},
  issue_date:         {label:'Issue Date',type:'date',req:true,today:true},
  last_working_day:   {label:'Last Working Day',type:'date',req:true},
  resignation_date:   {label:'Resignation Date',type:'date',req:true},
  candidate_name:     {label:'Candidate Name',type:'text',req:true,ph:'Full name'},
  candidate_address:  {label:'Candidate Address',type:'textarea',ph:'Postal address'},
  offered_designation:{label:'Offered Designation',type:'select',req:true,opts:['Software Engineer','Developer','QA Engineer','Product Manager','UX Designer','HR Manager','Finance Analyst','Sales Executive']},
  offered_department: {label:'Offered Department',type:'select',req:true,opts:['Engineering','Product','Design','HR','Finance','Sales','Operations']},
  proposed_joining:   {label:'Proposed Joining Date',type:'date',req:true},
  offer_valid_till:   {label:'Offer Valid Till',type:'date',req:true},
  annual_ctc:         {label:'Annual CTC (₹)',type:'number',req:true,ph:'e.g. 1200000'},
  probation_period:   {label:'Probation Period',type:'select',req:true,opts:['3 months','6 months','12 months']},
  notice_period:      {label:'Notice Period',type:'select',req:true,opts:['30 days','60 days','90 days']},
  internship_start:   {label:'Internship Start Date',type:'date',req:true},
  internship_end:     {label:'Internship End Date',type:'date',req:true},
  project_title:      {label:'Project / Assignment',type:'text',req:true,ph:'e.g. Payroll analytics dashboard'},
  stipend:            {label:'Monthly Stipend (₹)',type:'number',ph:'e.g. 15000'},
  previous_ctc:       {label:'Previous Annual CTC (₹)',type:'number',req:true,ph:'e.g. 900000'},
  revised_ctc:        {label:'Revised Annual CTC (₹)',type:'number',req:true,ph:'e.g. 1035000'},
  effective_date:     {label:'Effective Date',type:'date',req:true},
  confirmation_date:  {label:'Confirmation Date',type:'date',req:true},
  absence_from:       {label:'Absent From',type:'date',req:true},
  absence_to:         {label:'Absent To',type:'date',req:true},
  absence_details:    {label:'Details of Absence',type:'textarea',req:true,ph:'What happened, and what policy it breaches'},
  performance_concerns:{label:'Performance Concerns',type:'textarea',req:true,ph:'The specific shortfalls observed'},
  improvement_period: {label:'Improvement Period',type:'select',req:true,opts:['30 days','60 days','90 days']},
  signatory_name:     {label:'Signatory',type:'signatory',req:true},
  signatory_designation:{label:'Signatory Designation',type:'auto',from:'sigDesig'}
};
function hdocHuman(key){return key.replace(/_/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});}
function hdocFieldDef(key){return HDOC_FIELDS[key]||{label:hdocHuman(key),type:'text',req:true};}
/* The placeholders a template uses, in the order they first appear. */
function hdocTemplateKeys(tpl){
  const seen=[];const re=/\{\{\s*([a-z0-9_]+)\s*\}\}/g;let m;
  const src=(tpl.heading||'')+'\n'+(tpl.body||'');
  while((m=re.exec(src)))if(seen.indexOf(m[1])<0)seen.push(m[1]);
  /* The company is the entity being worked in, never a field to fill. */
  return seen.filter(function(k){return k!=='company_name';});
}
/* What HR is asked for. Auto values are shown, read-only, beside the field
   they come from; anything the template uses that depends on a picked
   employee or signatory pulls that picker in even if the body never names it. */
function hdocFormKeys(tpl){
  const keys=hdocTemplateKeys(tpl);
  const needsEmp=keys.some(function(k){const d=hdocFieldDef(k);return d.type==='auto'&&d.from!=='sigDesig';});
  const needsSig=keys.indexOf('signatory_designation')>=0;
  if(needsEmp&&keys.indexOf('employee_name')<0)keys.unshift('employee_name');
  if(needsSig&&keys.indexOf('signatory_name')<0)keys.push('signatory_name');
  /* Pickers first, then everything else in template order - the employee
     decides half the form, so it is the first thing asked. */
  const first=keys.filter(function(k){return hdocFieldDef(k).type==='employee';});
  return first.concat(keys.filter(function(k){return first.indexOf(k)<0;}));
}

/* ── Templates ─────────────────────────────────────────────────────────── */
const SIG_BLOCK='\n\nFor {{company_name}}\n\n\n{{signatory_name}}\n{{signatory_designation}}';
const hdocTemplates=[
  {id:1,type:'experience',name:'Experience Letter - Standard',heading:'EXPERIENCE CERTIFICATE',status:'Active',updatedBy:'Shaun Test1',updatedAt:'12 Aug 2026',
   body:'Date: {{issue_date}}\n\nTO WHOMSOEVER IT MAY CONCERN\n\nThis is to certify that {{employee_name}} (Employee ID: {{employee_id}}) was employed with {{company_name}} as {{designation}} in the {{department}} department from {{date_of_joining}} to {{last_working_day}}.\n\nDuring this period we found {{employee_name}} to be sincere, hardworking and dedicated to the responsibilities entrusted to them. Their conduct throughout the tenure was good.\n\nWe wish them every success in their future endeavours.'+SIG_BLOCK},
  {id:2,type:'experience',name:'Experience Letter - Short form',heading:'EXPERIENCE LETTER',status:'Inactive',updatedBy:'Shaun Test1',updatedAt:'02 Mar 2026',
   body:'Date: {{issue_date}}\n\nThis is to certify that {{employee_name}} worked with {{company_name}} as {{designation}} from {{date_of_joining}} to {{last_working_day}}.\n\nWe wish them the very best.'+SIG_BLOCK},
  {id:3,type:'relieving',name:'Relieving Letter - Standard',heading:'RELIEVING LETTER',status:'Active',updatedBy:'Shaun Test1',updatedAt:'12 Aug 2026',
   body:'Date: {{issue_date}}\n\n{{employee_name}}\nEmployee ID: {{employee_id}}\n{{work_location}}\n\nDear {{employee_name}},\n\nWith reference to your resignation dated {{resignation_date}}, we confirm that you have been relieved from the services of {{company_name}} at the close of business hours on {{last_working_day}}.\n\nYou were working with us as {{designation}} in the {{department}} department since {{date_of_joining}}. Your full and final settlement has been processed as per company policy.\n\nWe thank you for your contributions and wish you success in the future.'+SIG_BLOCK},
  {id:4,type:'internship',name:'Internship Certificate - Standard',heading:'INTERNSHIP CERTIFICATE',status:'Active',updatedBy:'Shaun Test1',updatedAt:'12 Aug 2026',
   body:'Date: {{issue_date}}\n\nTO WHOMSOEVER IT MAY CONCERN\n\nThis is to certify that {{employee_name}} has successfully completed an internship with {{company_name}} in the {{department}} department from {{internship_start}} to {{internship_end}}.\n\nDuring the internship they worked on "{{project_title}}" and showed a keen willingness to learn and a professional approach to their work.\n\nWe wish them all the best for their future.'+SIG_BLOCK},
  {id:5,type:'offer',name:'Offer Letter - Full time',heading:'OFFER OF EMPLOYMENT',status:'Active',updatedBy:'Shaun Test1',updatedAt:'20 Sep 2026',
   body:'Date: {{issue_date}}\n\n{{candidate_name}}\n{{candidate_address}}\n\nDear {{candidate_name}},\n\nWe are pleased to offer you the position of {{offered_designation}} in the {{offered_department}} department at {{company_name}}.\n\nYour annual Cost to Company (CTC) will be ₹{{annual_ctc}}. Your proposed date of joining is {{proposed_joining}}. You will be on probation for {{probation_period}} from your date of joining.\n\nThis offer is valid until {{offer_valid_till}}. Please sign and return a copy of this letter as your acceptance.\n\nWe look forward to welcoming you to the team.'+SIG_BLOCK},
  {id:6,type:'offer',name:'Offer Letter - 2025 format',heading:'OFFER LETTER',status:'Inactive',updatedBy:'Shaun Test1',updatedAt:'14 Jan 2025',
   body:'Date: {{issue_date}}\n\nDear {{candidate_name}},\n\nWe are happy to offer you the role of {{offered_designation}} at an annual CTC of ₹{{annual_ctc}}, joining on {{proposed_joining}}.'+SIG_BLOCK},
  {id:7,type:'appointment',name:'Appointment Letter - Standard',heading:'LETTER OF APPOINTMENT',status:'Active',updatedBy:'Shaun Test1',updatedAt:'12 Aug 2026',
   body:'Date: {{issue_date}}\n\n{{employee_name}}\nEmployee ID: {{employee_id}}\n\nDear {{employee_name}},\n\nFurther to your acceptance of our offer, we are pleased to appoint you as {{designation}} in the {{department}} department of {{company_name}}, with effect from {{date_of_joining}}. Your place of work will be {{work_location}}.\n\nYour annual CTC will be ₹{{annual_ctc}}. You will be on probation for {{probation_period}}, after which your services may be confirmed in writing. Either party may end this employment by giving {{notice_period}} notice.\n\nYou will be governed by the policies and rules of the company as amended from time to time.'+SIG_BLOCK},
  {id:8,type:'increment',name:'Increment Letter - Standard',heading:'SALARY REVISION LETTER',status:'Active',updatedBy:'Shaun Test1',updatedAt:'12 Aug 2026',
   body:'Date: {{issue_date}}\n\n{{employee_name}}\nEmployee ID: {{employee_id}}, {{designation}}\n\nDear {{employee_name}},\n\nIn recognition of your contribution, we are pleased to inform you that your annual CTC has been revised from ₹{{previous_ctc}} to ₹{{revised_ctc}} with effect from {{effective_date}}.\n\nAll other terms and conditions of your employment remain unchanged. We look forward to your continued contribution.'+SIG_BLOCK},
  {id:9,type:'confirmation',name:'Confirmation Letter - Standard',heading:'CONFIRMATION OF EMPLOYMENT',status:'Active',updatedBy:'Shaun Test1',updatedAt:'12 Aug 2026',
   body:'Date: {{issue_date}}\n\n{{employee_name}}\nEmployee ID: {{employee_id}}\n\nDear {{employee_name}},\n\nWe are pleased to inform you that, on successful completion of your probation period, your services as {{designation}} in the {{department}} department are confirmed with effect from {{confirmation_date}}.\n\nAll other terms of your appointment remain unchanged. We congratulate you and wish you a rewarding career with {{company_name}}.'+SIG_BLOCK},
  {id:10,type:'warn-leave',name:'Warning Letter - Unauthorised Absence',heading:'WARNING LETTER',status:'Active',updatedBy:'Shaun Test1',updatedAt:'12 Aug 2026',
   body:'Date: {{issue_date}}\n\n{{employee_name}}\nEmployee ID: {{employee_id}}, {{designation}}\n\nSubject: Warning for unauthorised absence\n\nDear {{employee_name}},\n\nIt has been noted that you were absent from work from {{absence_from}} to {{absence_to}} without prior approval or intimation to your reporting manager.\n\n{{absence_details}}\n\nThis is in breach of the company leave policy. You are hereby warned that any repetition will lead to strict disciplinary action. Please acknowledge receipt of this letter.'+SIG_BLOCK},
  {id:11,type:'warn-perf',name:'Warning Letter - Performance',heading:'PERFORMANCE WARNING LETTER',status:'Active',updatedBy:'Shaun Test1',updatedAt:'12 Aug 2026',
   body:'Date: {{issue_date}}\n\n{{employee_name}}\nEmployee ID: {{employee_id}}, {{designation}}, {{department}}\n\nSubject: Warning regarding performance\n\nDear {{employee_name}},\n\nThis letter is to formally bring to your attention concerns about your performance in your role as {{designation}}:\n\n{{performance_concerns}}\n\nYou are given {{improvement_period}} from the date of this letter to show clear and sustained improvement. Your manager will review your progress during this period. Failure to improve may result in further disciplinary action.'+SIG_BLOCK}
];
let hdocTplNextId=12;
function hdocActiveTemplate(type){
  return hdocTemplates.find(function(t){return t.type===type&&t.status==='Active';})||null;
}
function hdocTemplateById(id){return hdocTemplates.find(function(t){return t.id===id;})||null;}

/* ── Documents ─────────────────────────────────────────────────────────── */
const hdocDocs=[
  {id:1,no:'EXP-2026-0001',type:'experience',templateId:1,status:'Submitted',createdBy:'Pallavi Parate',createdAt:'14 Feb 2025 | 11:05 AM',updatedAt:'14 Feb 2025 | 11:20 AM',
   values:{employee_name:'Rahul Mehta',issue_date:'2025-02-14',last_working_day:'2025-02-12',signatory_name:'Pallavi Parate'}},
  {id:2,no:'APT-2026-0001',type:'appointment',templateId:7,status:'Submitted',createdBy:'Pallavi Parate',createdAt:'15 Jan 2025 | 10:00 AM',updatedAt:'15 Jan 2025 | 10:12 AM',
   values:{employee_name:'Testemp Antar',issue_date:'2025-01-15',annual_ctc:'1200000',probation_period:'6 months',notice_period:'60 days',signatory_name:'Shaun Test1'}},
  {id:3,no:'OFR-2026-0001',type:'offer',templateId:5,status:'Submitted',createdBy:'Pallavi Parate',createdAt:'28 Aug 2026 | 04:15 PM',updatedAt:'28 Aug 2026 | 04:30 PM',
   values:{candidate_name:'Meera Iyer',candidate_address:'12 Jubilee Hills, Hyderabad 500033',issue_date:'2026-08-28',offered_designation:'UX Designer',offered_department:'Design',
     annual_ctc:'1450000',proposed_joining:'2026-09-15',probation_period:'6 months',offer_valid_till:'2026-09-05',signatory_name:'Pallavi Parate'}},
  {id:4,no:'INC-2026-0001',type:'increment',templateId:8,status:'Submitted',createdBy:'Pallavi Parate',createdAt:'01 Apr 2026 | 09:30 AM',updatedAt:'01 Apr 2026 | 09:45 AM',
   values:{employee_name:'Anika Shah',issue_date:'2026-04-01',previous_ctc:'900000',revised_ctc:'1035000',effective_date:'2026-04-01',signatory_name:'Shaun Test1'}},
  {id:5,no:'',type:'confirmation',templateId:9,status:'Draft',createdBy:'Pallavi Parate',createdAt:'30 Sep 2026 | 03:10 PM',updatedAt:'02 Oct 2026 | 11:40 AM',
   values:{employee_name:'Anika Shah',issue_date:'2026-10-02',confirmation_date:''}},
  {id:6,no:'',type:'warn-leave',templateId:10,status:'Draft',createdBy:'Shaun Test1',createdAt:'03 Oct 2026 | 10:05 AM',updatedAt:'03 Oct 2026 | 10:05 AM',
   values:{employee_name:'Dev Kulkarni',issue_date:'2026-10-03',absence_from:'2026-09-22',absence_to:'2026-09-24',absence_details:''}},
  {id:7,no:'',type:'offer',templateId:5,status:'Draft',createdBy:'Pallavi Parate',createdAt:'04 Oct 2026 | 05:25 PM',updatedAt:'04 Oct 2026 | 05:25 PM',
   values:{candidate_name:'Karan Verma',offered_designation:'Software Engineer',offered_department:'Engineering',annual_ctc:'1600000'}}
];
let hdocDocNextId=8;
function hdocStampNow(){const s=stampNow();return s.date+' | '+s.time.replace(/:\d\d (AM|PM)$/,' $1');}
function hdocDrafts(type){
  return hdocDocs.filter(function(d){return d.status==='Draft'&&(!type||d.type===type);});
}
function hdocIssued(type){
  return hdocDocs.filter(function(d){return d.status==='Submitted'&&(!type||d.type===type);});
}
function hdocNextNo(type){
  const t=hdocTypeOf(type);const yr=new Date().getFullYear();
  const n=hdocDocs.filter(function(d){return d.type===type&&d.no;}).length+1;
  return t.prefix+'-'+yr+'-'+String(n).padStart(4,'0');
}
/* Who a document is about - the employee, or the candidate on an offer. */
function hdocSubject(d){return (d.values&&(d.values.employee_name||d.values.candidate_name))||'';}

/* ── Values: what HR typed, plus what is read off the people picked ─────── */
function hdocResolve(values){
  const v=Object.assign({},values||{});
  const e=hdocEmp(v.employee_name);
  Object.keys(HDOC_FIELDS).forEach(function(k){
    const f=HDOC_FIELDS[k];
    if(f.type==='auto'&&f.from!=='sigDesig')v[k]=e?(e[f.from]||''):'';
  });
  const sg=HDOC_SIGNATORIES.find(function(s){return s.name===v.signatory_name;});
  v.signatory_designation=sg?sg.desig:'';
  v.company_name=hdocCompany();
  return v;
}
/* A value as it reads in a letter: dates spelled out, money grouped. */
function hdocFmt(key,val){
  if(val==null||val==='')return '';
  const f=hdocFieldDef(key);
  if(f.type==='date')return cdLabel(val)||val;
  if(f.type==='number'){const n=parseFloat(val);return isNaN(n)?val:n.toLocaleString('en-IN');}
  return String(val);
}
function hdocEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
/* The letter as markup. A placeholder with no value yet is shown as its label
   in a marked box, so a Preview of a half-filled document shows what is
   missing instead of silently printing a gap. */
function hdocRenderLetter(tpl,values,docNo){
  const v=hdocResolve(values);
  const fill=function(src){
    return hdocEsc(src).replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/g,function(_,k){
      if(k==='company_name')return hdocEsc(v.company_name);
      const out=hdocFmt(k,v[k]);
      return out?'<span class="hdoc-val">'+hdocEsc(out).replace(/\n/g,'<br>')+'</span>'
        :'<span class="hdoc-miss">'+hdocEsc(hdocFieldDef(k).label)+'</span>';
    });
  };
  const paras=String(tpl.body||'').split(/\n{2,}/).map(function(p){
    return '<p>'+fill(p).replace(/\n/g,'<br>')+'</p>';
  }).join('');
  return '<div class="hdoc-paper">'
    +'<div class="hdoc-lh"><div class="hdoc-lh-name">'+hdocEsc(v.company_name)+'</div>'
      +'<div class="hdoc-lh-sub">Plot 21, HITEC City, Hyderabad 500081 · hr@dhihyperlocal.com</div></div>'
    +'<div class="hdoc-ref">'+(docNo?'Ref: '+hdocEsc(docNo):'Ref: <span class="hdoc-miss">Issued on submit</span>')+'</div>'
    +'<div class="hdoc-heading">'+fill(tpl.heading||'')+'</div>'
    +'<div class="hdoc-body">'+paras+'</div>'
    +'</div>';
}
function hdocMissing(tpl,values){
  const v=hdocResolve(values);
  return hdocFormKeys(tpl).filter(function(k){
    const f=hdocFieldDef(k);
    if(f.type==='auto')return false;
    return f.req&&!String(v[k]||'').trim();
  }).map(function(k){return hdocFieldDef(k).label;});
}

/* ══ STATE ═════════════════════════════════════════════════════════════════ */
let hdocType=null;            // null = the cards; a type key = that type's screen
let hdocQ='';
/* The one popup open, if any:
     {view:'form'|'preview'|'final', type, templateId, docId, values}
     {view:'templates', type}   {view:'tpl-edit', type, tplId}           */
let hdocModal=null;
function hdocReset(){hdocType=null;hdocQ='';hdocModal=null;}

/* ══ NAVIGATION ════════════════════════════════════════════════════════════ */
function hdocOpenType(key){hdocType=key;hdocQ='';renderADTPage();const c=document.getElementById('adt-content');if(c)c.scrollTop=0;}
function hdocBack(){hdocType=null;hdocQ='';renderADTPage();}
function hdocSearch(){hdocQ=lpSearchValue('hdoc-q');renderADTPage();}
function hdocClearSearch(){hdocQ='';renderADTPage();}

/* ══ CREATE / DRAFT / PREVIEW / SUBMIT ═════════════════════════════════════ */
/* FR-22.3: Create always loads the type's CURRENT Active Template. */
function hdocCreate(type,ev){
  if(ev)ev.stopPropagation();
  const tpl=hdocActiveTemplate(type);
  if(!tpl){showToast('No Active Template','error',hdocTypeOf(type).label+' has no Active Template yet. '
    +(hdocTplUI()?'Set one under Templates.':'Ask a Super Admin to set one.'));return;}
  const values={};
  hdocFormKeys(tpl).forEach(function(k){if(hdocFieldDef(k).today)values[k]=cdISO(new Date());});
  hdocModal={view:'form',type:type,templateId:tpl.id,docId:null,values:values};
  renderADTPage();
}
/* FR-22.7: a draft opens with what was entered. If the template it was
   started from is no longer the Active one, it moves to the Active one -
   HR only ever produces documents from the Active Template - and every value
   the new template still asks for comes along. */
function hdocOpenDoc(id){
  const d=hdocDocs.find(function(x){return x.id===id;});if(!d)return;
  let tplId=d.templateId;
  if(d.status==='Draft'){
    const act=hdocActiveTemplate(d.type);
    if(act&&act.id!==d.templateId){
      tplId=act.id;
      showToast('Template updated','info','This draft now uses the current Active Template for '+hdocTypeOf(d.type).label+'. Your entered values were kept.');
    }
  }
  hdocModal={view:d.status==='Draft'?'form':'final',type:d.type,templateId:tplId,docId:d.id,values:Object.assign({},d.values)};
  renderADTPage();
}
function hdocClose(){hdocModal=null;renderADTPage();}
/* Read every field on the form back into the working values. */
function hdocSync(){
  if(!hdocModal||hdocModal.view!=='form')return;
  const tpl=hdocTemplateById(hdocModal.templateId);if(!tpl)return;
  hdocFormKeys(tpl).forEach(function(k){
    const f=hdocFieldDef(k),id='hdf-'+k;
    if(f.type==='auto')return;
    if(f.type==='employee'||f.type==='signatory'||f.type==='select'){
      if(document.getElementById('csw-'+id))hdocModal.values[k]=getCSValue(id);
    }else{
      const el=document.getElementById(id);if(el)hdocModal.values[k]=el.value.trim?el.value.trim():el.value;
    }
  });
}
/* Picking an employee or a signatory fills the values read off them. */
function hdocPickHook(){hdocSync();renderADTPage();}
function hdocToPreview(){hdocSync();hdocModal.view='preview';renderADTPage();}
function hdocToForm(){hdocModal.view='form';renderADTPage();}
/* FR-22.4 / 22.5 / 22.6: Save as Draft keeps the values and the document
   stays (or goes back to) Draft, listed under Saved Drafts. */
function hdocSaveDraft(){
  hdocSync();
  const m=hdocModal;
  const hasAny=Object.keys(m.values).some(function(k){return String(m.values[k]||'').trim()&&!hdocFieldDef(k).today;});
  if(!hasAny){showToast('Nothing to save yet','error','Fill in at least one field before saving a draft.');return;}
  const now=hdocStampNow();
  let d=m.docId?hdocDocs.find(function(x){return x.id===m.docId;}):null;
  if(d){
    d.values=Object.assign({},m.values);d.templateId=m.templateId;d.status='Draft';d.updatedAt=now;
  }else{
    d={id:hdocDocNextId++,no:'',type:m.type,templateId:m.templateId,status:'Draft',createdBy:CURRENT_USER,
      createdAt:now,updatedAt:now,values:Object.assign({},m.values)};
    hdocDocs.unshift(d);
  }
  hdocModal=null;
  renderADTPage();
  showToast('Saved as draft','success',hdocTypeOf(d.type).label+(hdocSubject(d)?' for '+hdocSubject(d):'')+' is in Saved Drafts.');
}
/* FR-22.6: Submit moves the document to final review. Every field the
   template requires has to be there - a letter with a gap in it is not
   ready to be downloaded and handed to someone. */
function hdocSubmit(){
  const m=hdocModal;
  const tpl=hdocTemplateById(m.templateId);
  const miss=hdocMissing(tpl,m.values);
  if(miss.length){
    showToast('Complete the document first','error',miss.length===1?miss[0]+' is required.':miss.length+' fields are still empty — first: '+miss[0]+'.');
    hdocModal.view='form';renderADTPage();return;
  }
  const now=hdocStampNow();
  let d=m.docId?hdocDocs.find(function(x){return x.id===m.docId;}):null;
  if(!d){
    d={id:hdocDocNextId++,no:'',type:m.type,templateId:m.templateId,status:'Draft',createdBy:CURRENT_USER,createdAt:now,updatedAt:now,values:{}};
    hdocDocs.unshift(d);
  }
  d.values=Object.assign({},m.values);d.templateId=m.templateId;
  if(!d.no)d.no=hdocNextNo(d.type);
  d.status='Submitted';d.updatedAt=now;d.submittedAt=now;
  hdocModal={view:'final',type:d.type,templateId:d.templateId,docId:d.id,values:Object.assign({},d.values)};
  lpLanded('hr-docs',d.id);
  renderADTPage();
  showToast('Document submitted','success',d.no+' is ready to download.');
}
/* FR-22.6 Edit: back to the fields, values kept. */
function hdocEditFinal(){hdocModal.view='form';renderADTPage();}
/* FR-22.6 Download, in the shape of the Active Template it was made from.
   An HTML document saved as .doc opens in Word with the letterhead and the
   formatting intact - no server is needed to produce it. */
function hdocDownload(){
  const m=hdocModal;
  const d=hdocDocs.find(function(x){return x.id===m.docId;});
  const tpl=hdocTemplateById(m.templateId);if(!d||!tpl)return;
  const letter=hdocRenderLetter(tpl,d.values,d.no)
    .replace(/<span class="hdoc-val">/g,'<span>');
  const css='body{font-family:Calibri,Arial,sans-serif;color:#1e293b;font-size:11pt;line-height:1.6}'
    +'.hdoc-lh{border-bottom:2px solid #0f172a;padding-bottom:8pt;margin-bottom:14pt}.hdoc-lh-name{font-size:16pt;font-weight:bold}'
    +'.hdoc-lh-sub{font-size:9pt;color:#64748b}.hdoc-ref{font-size:9pt;color:#64748b;text-align:right}'
    +'.hdoc-heading{text-align:center;font-weight:bold;font-size:13pt;letter-spacing:1pt;margin:14pt 0}';
  const html='<html><head><meta charset="utf-8"><title>'+hdocEsc(d.no)+'</title><style>'+css+'</style></head><body>'+letter+'</body></html>';
  const blob=new Blob(['﻿',html],{type:'application/msword'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=d.no+'_'+hdocSubject(d).replace(/[^A-Za-z0-9]+/g,'_')+'.doc';
  document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},400);
  showToast('Downloading','success',a.download);
}
function hdocDeleteDraft(id,ev){
  if(ev)ev.stopPropagation();
  const i=hdocDocs.findIndex(function(x){return x.id===id&&x.status==='Draft';});if(i<0)return;
  const d=hdocDocs[i];
  if(!confirm('Delete this draft '+hdocTypeOf(d.type).label+(hdocSubject(d)?' for '+hdocSubject(d):'')+'? This cannot be undone.'))return;
  hdocDocs.splice(i,1);renderADTPage();
  showToast('Draft deleted','info');
}

/* ══ TEMPLATES (Super Admin only) ══════════════════════════════════════════ */
function hdocOpenTemplates(type,ev){
  if(ev)ev.stopPropagation();
  if(!hdocTplUI())return;
  hdocModal={view:'templates',type:type};renderADTPage();
}
/* FR-22.1: one Active Template per type. Making one Active retires the one
   that was, in the same move, so there is never a moment with two. */
function hdocSetActive(id){
  if(!hdocIsAdmin())return;
  const t=hdocTemplateById(id);if(!t)return;
  hdocTemplates.forEach(function(x){if(x.type===t.type)x.status=x.id===id?'Active':'Inactive';});
  t.updatedBy=CURRENT_USER;t.updatedAt=stampNow().date;
  renderADTPage();
  showToast('Active template changed','success','"'+t.name+'" is now used for every new '+hdocTypeOf(t.type).label+'.');
}
function hdocEditTemplate(type,id){
  if(!hdocIsAdmin())return;
  hdocModal={view:'tpl-edit',type:type,tplId:id||null};renderADTPage();
}
/* Live list of the fields the template being edited will ask HR for, so the
   Super Admin sees the form they are designing while writing the letter. */
function hdocTplFieldsHTML(heading,body){
  const keys=hdocFormKeys({heading:heading,body:body});
  if(!keys.length)return '<span class="hdoc-chip-empty">No fields yet — insert one below.</span>';
  return keys.map(function(k){
    const f=hdocFieldDef(k);
    const kind=f.type==='auto'?'Auto':f.type==='employee'?'Employee':f.type==='signatory'?'Signatory':HDOC_FIELDS[k]?'Entered':'Text (custom)';
    return '<span class="hdoc-fchip'+(f.type==='auto'?' is-auto':'')+'" title="'+attrSafe(kind)+'">'+hdocEsc(f.label)+'</span>';
  }).join('');
}
function hdocTplLive(){
  const h=document.getElementById('hdt-heading'),b=document.getElementById('hdt-body');
  const box=document.getElementById('hdt-fields');
  if(box)box.innerHTML=hdocTplFieldsHTML(h?h.value:'',b?b.value:'');
}
function hdocInsertField(key){
  const b=document.getElementById('hdt-body');if(!b)return;
  const tok='{{'+key+'}}';
  const s=b.selectionStart||b.value.length,e=b.selectionEnd||s;
  b.value=b.value.slice(0,s)+tok+b.value.slice(e);
  b.focus();b.selectionStart=b.selectionEnd=s+tok.length;
  hdocTplLive();
}
function hdocSaveTemplate(){
  if(!hdocIsAdmin())return;
  const m=hdocModal;
  const name=(document.getElementById('hdt-name')||{}).value||'';
  const heading=(document.getElementById('hdt-heading')||{}).value||'';
  const body=(document.getElementById('hdt-body')||{}).value||'';
  const makeActive=!!(document.getElementById('hdt-active')||{}).checked;
  if(!name.trim()){showToast('Template Name is required','error');return;}
  if(!body.trim()){showToast('The template body is empty','error');return;}
  if(hdocTemplates.some(function(t){return t.type===m.type&&t.id!==m.tplId&&t.name.toLowerCase()===name.trim().toLowerCase();})){
    showToast('A template with that name exists','error','Give this one its own name.');return;}
  const bad=(body+heading).match(/\{\{(?!\s*[a-z0-9_]+\s*\}\})[^}]*\}\}/);
  if(bad){showToast('Check the placeholder '+bad[0],'error','Use lowercase letters, numbers and underscores, e.g. {{employee_name}}.');return;}
  let t=m.tplId?hdocTemplateById(m.tplId):null;
  if(t){t.name=name.trim();t.heading=heading.trim();t.body=body;}
  else{
    t={id:hdocTplNextId++,type:m.type,name:name.trim(),heading:heading.trim(),body:body,status:'Inactive'};
    hdocTemplates.push(t);
  }
  t.updatedBy=CURRENT_USER;t.updatedAt=stampNow().date;
  if(makeActive||!hdocActiveTemplate(m.type))hdocTemplates.forEach(function(x){if(x.type===t.type)x.status=x.id===t.id?'Active':'Inactive';});
  hdocModal={view:'templates',type:m.type};
  renderADTPage();
  showToast('Template saved','success','"'+t.name+'"'+(t.status==='Active'?' is the Active Template.':' saved as Inactive.'));
}

/* ══ RENDERING ═════════════════════════════════════════════════════════════ */
const HDOC_ICO={
  doc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
  award:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="6"/><path d="M15.48 12.89L17 22l-5-3-5 3 1.52-9.11"/></svg>',
  exit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  cap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 6 12 13 2 6"/></svg>',
  sign:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  trend:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  calX:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="10" y1="14" x2="14" y2="18"/><line x1="14" y1="14" x2="10" y2="18"/></svg>',
  alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  plus:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  back:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>',
  x:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  chevR:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 18 15 12 9 6"/></svg>',
  chev:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="6 9 12 15 18 9"/></svg>',
  edit:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
  eye:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  dl:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  cog:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.17 14H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9.83 3.17V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 2.82 1.17l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.83 9H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
};
const HDOC_TYPE_ICON={experience:'award',relieving:'exit',internship:'cap',offer:'mail',appointment:'sign',
  increment:'trend',confirmation:'check','warn-leave':'calX','warn-perf':'alert'};

/* ══ LAYOUT ═══════════════════════════════════════════════════════════════
   WHAT THE PAGE IS FOR decides its shape. HR comes here to do one of three
   things: start a letter, pick up a draft, or find one already issued. So:

     main column   the nine document types, as one catalogue grouped by the
                   stage of employment they belong to - the order HR thinks
                   in ("someone is leaving: experience, relieving") rather
                   than an alphabet or a grid of look-alike tiles.
     side rail     Saved Drafts first - unfinished work is what most needs
                   picking up - then the documents issued most recently.

   A type's own screen keeps the same two columns: its issued documents in
   the main column, its drafts in the rail. Same places, same meaning, on
   both screens. */
/* Each group carries one of the app's status tones, so its letters are told
   apart at a glance by colour as well as by heading: blue for people coming
   in, green while they are here, slate as they leave, red for discipline -
   the same meanings those tones have everywhere else in the product. */
const HDOC_GROUPS=[
  {label:'Hiring & Joining', tone:'info',hint:'For candidates and new joiners', keys:['offer','appointment','internship']},
  {label:'During Employment',tone:'ok',  hint:'Milestones while in service',    keys:['confirmation','increment']},
  {label:'Exit',             tone:'idle',hint:'When an employee leaves',        keys:['experience','relieving']},
  {label:'Disciplinary',     tone:'bad', hint:'Formal warnings',                keys:['warn-leave','warn-perf']}
];
function hdocGroupOf(key){return HDOC_GROUPS.find(function(g){return g.keys.indexOf(key)>=0;})||HDOC_GROUPS[0];}
/* "Updated 2 days ago" is what someone scanning their drafts wants; the
   exact date is on the row's tooltip. */
function hdocAgo(stamp){
  const p=String(stamp||'').split(' | ')[0].split(' ');
  const mi=CD_MON_SHORT.indexOf(p[1]);
  if(p.length<3||mi<0)return p.join(' ');
  const d=new Date(+p[2],mi,+p[0]),t=new Date();t.setHours(0,0,0,0);
  const n=Math.round((t-d)/86400000);
  if(n<=0)return 'today';
  if(n===1)return 'yesterday';
  if(n<7)return n+' days ago';
  return p.join(' ');
}
function hdocInitials(name){
  const w=String(name||'').trim().split(/\s+/).filter(Boolean);
  return w.length?(w[0][0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase():'?';
}
/* One item in the rail - a draft or an issued document. */
function hdocItemHTML(d,mode){
  const who=hdocSubject(d);
  const t=hdocTypeOf(d.type);
  const sub=mode==='issued'
    ?d.no+' · '+t.label
    :(mode==='type'?'Started by '+hdocEsc(d.createdBy):t.label);
  return '<div class="hdoc-item" role="button" tabindex="0" onclick="hdocOpenDoc('+d.id+')" '
    +'onkeydown="if(event.key===\'Enter\')hdocOpenDoc('+d.id+')" title="'+attrSafe((mode==='issued'?'Issued ':'Last updated ')+d.updatedAt)+'">'
    +'<span class="hdoc-av'+(mode==='issued'?' is-issued':'')+'">'+hdocInitials(who)+'</span>'
    +'<span class="hdoc-item-txt"><span class="hdoc-item-name">'+(who?hdocEsc(who):'<i>Untitled draft</i>')+'</span>'
      +'<span class="hdoc-item-sub">'+sub+'</span></span>'
    +(mode==='issued'
      ?'<span class="hdoc-item-go">'+HDOC_ICO.chevR+'</span>'
      :'<span class="hdoc-item-age">'+hdocAgo(d.updatedAt)+'</span>'+'<button type="button" class="hdoc-item-del" title="Delete draft" aria-label="Delete draft" onclick="hdocDeleteDraft('+d.id+',event)">'+HDOC_ICO.trash+'</button>')
    +'</div>';
}
function hdocPanel(title,count,body,tone){
  return '<section class="hdoc-panel">'
    +'<div class="hdoc-panel-head"><span class="hdoc-panel-title">'+title+'</span>'
      +(count!=null?'<span class="hdoc-pill'+(tone?' is-'+tone:'')+'">'+count+'</span>':'')+'</div>'
    +body+'</section>';
}
function hdocDraftsPanel(type){
  const list=hdocDrafts(type);
  if(!list.length)return '';      // no drafts: the panel is not shown at all
  return hdocPanel('Saved Drafts',list.length,
    list.length?'<div class="hdoc-items">'+list.map(function(d){return hdocItemHTML(d,type?'type':'all');}).join('')+'</div>'
      :'<div class="hdoc-rail-empty">No drafts'+(type?' for this letter':'')+'. Use <b>Save as Draft</b> while creating a document to finish it later.</div>',
    list.length?'wait':'');
}

function buildHrDocsHTML(){
  return (hdocType?hdocTypeScreenHTML():hdocCardsHTML())+hdocModalHTML();
}
/* The catalogue. Each type is a row - icon, name, what it is for, how many
   exist - with Create on it, so starting a letter is one click from here
   (FR-22.2 "Create button on every card") and opening the row shows what has
   been issued. */
function hdocCardsHTML(){
  const admin=hdocIsAdmin();
  const row=function(t){
    const act=hdocActiveTemplate(t.key);
    const issued=hdocIssued(t.key).length,drafts=hdocDrafts(t.key).length;
    return '<div class="hdoc-row" role="button" tabindex="0" onclick="hdocOpenType(\''+t.key+'\')" '
      +'onkeydown="if(event.key===\'Enter\')hdocOpenType(\''+t.key+'\')">'
      +'<span class="hdoc-row-ico tone-'+hdocGroupOf(t.key).tone+'">'+HDOC_ICO[HDOC_TYPE_ICON[t.key]]+'</span>'
      +'<span class="hdoc-row-txt"><span class="hdoc-row-name">'+t.label+'</span>'
        +'<span class="hdoc-row-desc">'+(act?t.blurb:'<span class="hdoc-warn">'+(hdocTplUI()?'No Active Template — set one in Templates.':'Not available yet.')+'</span>')+'</span></span>'
      /* Drafts lead when there are any - they are work waiting on someone. */
      +'<span class="hdoc-row-stats">'
        +(drafts?'<span class="hdoc-chip is-draft">'+drafts+' draft'+(drafts===1?'':'s')+'</span>':'')
        +'<span class="hdoc-chip'+(issued?'':' is-zero')+'">'+issued+' issued</span>'
      +'</span>'
      +'<span class="hdoc-row-acts">'
        /* HR never sees a template (FR-22.1); see HDOC_TEMPLATES_UI. */
        +(hdocTplUI()?'<button type="button" class="hdoc-icon-btn" onclick="hdocOpenTemplates(\''+t.key+'\',event)" title="Templates" aria-label="Templates for '+attrSafe(t.label)+'">'+HDOC_ICO.cog+'</button>':'')
        +'<button type="button" class="ep-cancel-btn hdoc-create" onclick="hdocCreate(\''+t.key+'\',event)"'+(act?'':' disabled')+'>'+HDOC_ICO.plus+'Create</button>'
      +'</span>'
      +'</div>';
  };
  const catalogue='<section class="hdoc-panel">'
    +HDOC_GROUPS.map(function(g){
      return '<div class="hdoc-group"><div class="hdoc-group-label">'
          +'<span class="hdoc-group-dot tone-'+g.tone+'"></span><span class="hdoc-group-name">'+g.label+'</span>'
          +'<span class="hdoc-group-hint">'+g.hint+'</span></div>'
        +g.keys.map(function(k){return row(hdocTypeOf(k));}).join('')+'</div>';
    }).join('')+'</section>';
  const recent=hdocIssued().slice().sort(function(a,b){return b.id-a.id;}).slice(0,5);
  const totalIssued=hdocIssued().length,totalDrafts=hdocDrafts().length;
  return '<div class="lp-page hdoc-page">'
    +dashboardBackHTML()
    +'<header class="hdoc-head"><div><h1 class="hdoc-title">HR Docs</h1>'
      +'<p class="hdoc-sub">'+(hdocTplUI()?'Letters for employees, each made from its document type&rsquo;s Active Template.'
        :'Create, save and download letters for your employees.')+'</p></div>'
      /* The app's own listing-stats strip, read-only here: totals, not filters. */
      +'<div class="listing-stats hdoc-stats">'
        +'<div class="listing-stat"><div class="listing-stat-count">'+HDOC_TYPES.length+'</div><div class="listing-stat-label">Letter Types</div></div>'
        +'<div class="listing-stat"><div class="listing-stat-count" style="color:var(--st-ok-fg)">'+totalIssued+'</div><div class="listing-stat-label">Issued</div></div>'
        +'<div class="listing-stat"><div class="listing-stat-count" style="color:var(--st-wait-fg)">'+totalDrafts+'</div><div class="listing-stat-label">In Draft</div></div>'
      +'</div></header>'
    +'<div class="hdoc-layout">'
      +'<div class="hdoc-main">'+catalogue+'</div>'
      +'<aside class="hdoc-rail">'
        +hdocDraftsPanel(null)
        +hdocPanel('Recently Issued',null,recent.length
          ?'<div class="hdoc-items">'+recent.map(function(d){return hdocItemHTML(d,'issued');}).join('')+'</div>'
          :'<div class="hdoc-rail-empty">Nothing issued yet.</div>')
      +'</aside>'
    +'</div></div>';
}
/* One type's screen: what it is and how to make one, then everything issued
   from it, with its drafts in the rail. */
function hdocTypeScreenHTML(){
  const t=hdocTypeOf(hdocType);
  const act=hdocActiveTemplate(t.key);
  const all=hdocIssued(t.key);
  const rows=lpSearchRows(all.map(function(d){
    return {d:d,no:d.no,name:hdocSubject(d),by:d.createdBy,at:d.createdAt};
  }),hdocQ);
  const pgn=listPage('hr-docs-'+t.key,hdocQ,rows.map(function(r,i){
    const d=r.d;
    return '<tr class="hdoc-trow" id="hdoc-row-'+d.id+'" style="cursor:pointer" onclick="hdocOpenDoc('+d.id+')">'
      +'<td class="lp-c-n">'+(i+1)+'</td>'
      +'<td style="white-space:nowrap"><span style="font-weight:600;color:var(--navy)">'+d.no+'</span></td>'
      +'<td><span class="hdoc-cell-who"><span class="hdoc-av is-issued is-sm">'+hdocInitials(r.name)+'</span>'+hdocEsc(r.name)+'</span></td>'
      +'<td>'+hdocEsc(d.createdBy)+'</td>'
      +'<td style="white-space:nowrap">'+(d.submittedAt||d.updatedAt).split(' | ')[0]+'</td>'
      +'<td><span class="lp-status-badge tone-'+statusTone('Submitted')+'">Submitted</span></td>'
      +'<td onclick="event.stopPropagation()"><button class="att-row-btn" title="Open" onclick="hdocOpenDoc('+d.id+')">'+HDOC_ICO.eye+'</button></td>'
      +'</tr>';
  }),'<tr><td colspan="7" class="hdoc-table-empty">'
      +(hdocQ?'No documents match &ldquo;'+hdocEsc(hdocQ)+'&rdquo;.'
        :'<b>No '+t.label.toLowerCase()+'s issued yet.</b><br>Documents appear here once they are submitted.')+'</td></tr>');
  return '<div class="lp-page hdoc-page">'
    +'<button class="ep-back hdoc-back" onclick="hdocBack()">'+HDOC_ICO.back+' HR Docs</button>'
    +'<header class="hdoc-head hdoc-type-head">'
      +'<span class="hdoc-row-ico is-lg tone-'+hdocGroupOf(t.key).tone+'">'+HDOC_ICO[HDOC_TYPE_ICON[t.key]]+'</span>'
      +'<div class="hdoc-type-txt"><h1 class="hdoc-title">'+t.label+'</h1>'
        +'<p class="hdoc-sub">'+t.blurb+'</p>'
        +(hdocTplUI()?'<p class="hdoc-type-tpl">'+(act?'Active template · <b>'+hdocEsc(act.name)+'</b>':'<span class="hdoc-warn">No Active Template</span>')+'</p>':'')
      +'</div>'
      +'<div class="hdoc-type-btns">'
        +(hdocTplUI()?'<button class="ep-cancel-btn" onclick="hdocOpenTemplates(\''+t.key+'\')">'+HDOC_ICO.cog+' Templates</button>':'')
        +'<button class="ep-save-btn" onclick="hdocCreate(\''+t.key+'\')"'+(act?'':' disabled title="No Active Template"')+'>'+HDOC_ICO.plus+' Create '+t.label+'</button>'
      +'</div></header>'
    /* FR-22.1 / 22.6: Saved Drafts first, with its count, then what has been
       issued - both full width, one above the other. */
    +hdocDraftsTableHTML(t.key)
    +'<section class="hdoc-panel">'
      +'<div class="hdoc-panel-head"><span class="hdoc-panel-title">Issued Documents</span><span class="hdoc-pill">'+all.length+'</span>'
        +'<span class="hdoc-panel-search">'+lpSearchField('hdoc-q',hdocQ,'Search number or employee','hdocSearch()')
        +(hdocQ?'<button class="lp-pill-clear" onclick="hdocClearSearch()">Clear</button>':'')+'</span></div>'
      +'<table class="lp-table hdoc-table"><thead><tr><th>S. No</th><th>Document No</th><th>Employee</th><th>Created By</th>'
        +'<th>Issued On</th><th>Status</th><th>Action</th></tr></thead><tbody>'+pgn.rows+'</tbody></table>'
      +(all.length>LIST_PAGE_SIZE?pgn.pager:'')
    +'</section></div>';
}
/* FR-22.6: the type's drafts as a table - who the letter is for, its type,
   who started it, when, and the way back into it. */
function hdocDraftsTableHTML(type){
  const list=hdocDrafts(type);
  if(!list.length)return '';      // no drafts: the section is not shown at all
  const rows=list.map(function(d,i){
    const who=hdocSubject(d);
    return '<tr class="hdoc-trow" style="cursor:pointer" onclick="hdocOpenDoc('+d.id+')">'
      +'<td class="lp-c-n">'+(i+1)+'</td>'
      +'<td>'+(who?'<span class="hdoc-cell-who"><span class="hdoc-av is-sm">'+hdocInitials(who)+'</span>'+hdocEsc(who)+'</span>':'<i style="color:var(--gray)">Not chosen yet</i>')+'</td>'
      +'<td>'+hdocTypeOf(d.type).label+'</td>'
      +'<td>'+hdocEsc(d.createdBy)+'</td>'
      +'<td style="white-space:nowrap">'+String(d.createdAt).split(' | ')[0]+'</td>'
      +'<td style="white-space:nowrap">'+String(d.updatedAt).split(' | ')[0]+'</td>'
      +'<td onclick="event.stopPropagation()" style="white-space:nowrap">'
        +'<button class="att-row-btn" title="Continue editing" onclick="hdocOpenDoc('+d.id+')">'+HDOC_ICO.edit+'</button>'
        +'<button class="att-row-btn is-danger" title="Delete draft" onclick="hdocDeleteDraft('+d.id+',event)">'+HDOC_ICO.trash+'</button></td>'
      +'</tr>';
  }).join('');
  return '<section class="hdoc-panel hdoc-drafts-top">'
    +'<div class="hdoc-panel-head"><span class="hdoc-panel-title">Saved Drafts</span>'
      +'<span class="hdoc-pill'+(list.length?' is-wait':'')+'">'+list.length+'</span></div>'
    +(list.length
      ?'<table class="lp-table hdoc-table"><thead><tr><th>S. No</th><th>Employee / Candidate</th><th>Document Type</th><th>Created By</th>'
        +'<th>Created Date</th><th>Updated Date</th><th>Action</th></tr></thead><tbody>'+rows+'</tbody></table>'
      :'<div class="hdoc-rail-empty">No drafts for this letter. Use <b>Save as Draft</b> while creating a document to finish it later.</div>')
    +'</section>';
}

/* ── The popups ──────────────────────────────────────────────────────────── */
function hdocModalShell(title,sub,body,foot,wide,back){
  return '<div class="ct-modal-overlay">'
    +'<div class="ct-modal ct-modal--form hdoc-modal'+(wide?' hdoc-modal-wide':'')+'" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">'
      +(back?'<button class="hdoc-hdr-back" onclick="'+back+'" title="Back">'+HDOC_ICO.back+'</button>':'')+title+'</span>'
      +'<button class="ct-modal-close" onclick="hdocClose()">'+HDOC_ICO.x+'</button></div>'
    +(sub?'<p class="ct-modal-sub">'+sub+'</p>':'')
    +body
    +'<div class="ct-modal-foot">'+foot+'</div>'
    +'</div></div>';
}
function hdocModalHTML(){
  const m=hdocModal;if(!m)return '';
  if(m.view==='templates')return hdocTemplatesModalHTML();
  if(m.view==='tpl-edit')return hdocTplEditModalHTML();
  const t=hdocTypeOf(m.type),tpl=hdocTemplateById(m.templateId);
  if(!t||!tpl)return '';
  const d=m.docId?hdocDocs.find(function(x){return x.id===m.docId;}):null;
  if(m.view==='form'){
    const v=hdocResolve(m.values);
    const fields=hdocFormKeys(tpl).map(function(k){
      const f=hdocFieldDef(k),id='hdf-'+k;
      const lbl='<label class="ep-form-label" for="'+id+'">'+hdocEsc(f.label)+(f.req&&f.type!=='auto'?' <span class="req">*</span>':'')
        +(f.type==='auto'?' <span class="hdoc-auto">Auto</span>':'')+'</label>';
      let ctl='';
      if(f.type==='employee')ctl=apCS(id,hdocEmployees().map(function(e){return e.name;}),m.values[k]||'','Select Employee','hdocPickHook');
      else if(f.type==='signatory')ctl=apCS(id,HDOC_SIGNATORIES.map(function(s){return s.name;}),m.values[k]||'','Select Signatory','hdocPickHook');
      else if(f.type==='select')ctl=apCS(id,f.opts,m.values[k]||'','Select');
      else if(f.type==='date')ctl=apCD(id,m.values[k]||'','dd-mm-yyyy');
      else if(f.type==='auto')ctl='<input class="ep-form-input hdoc-auto-input" id="'+id+'" readonly value="'+attrSafe(hdocFmt(k,v[k])||'')+'" placeholder="'
        +(f.from==='sigDesig'?'Filled from the signatory':'Filled from the employee')+'">';
      else if(f.type==='textarea')ctl='<textarea class="ep-form-input hdoc-textarea" id="'+id+'" placeholder="'+attrSafe(f.ph||'')+'">'+hdocEsc(m.values[k]||'')+'</textarea>';
      else ctl='<input class="ep-form-input" id="'+id+'" type="'+(f.type==='number'?'number':'text')+'"'+(f.type==='number'?' min="0"':'')
        +' value="'+attrSafe(m.values[k]||'')+'" placeholder="'+attrSafe(f.ph||'')+'">';
      return '<div class="ep-form-group'+(f.type==='textarea'?' ep-form-full':'')+'">'+lbl+ctl+'</div>';
    }).join('');
    const sub=(d&&d.status==='Draft'?'Continuing a saved draft. ':d&&d.status==='Submitted'?'Editing '+d.no+'. ':'')
      +(hdocTplUI()?'The fields below come from the Active Template for this document type (<b>'+hdocEsc(tpl.name)+'</b>). '
        :'Fill in the details for this document. ')+'Fields marked <span class="req">*</span> are required to submit.';
    return hdocModalShell((d&&d.status==='Submitted'?'Edit ':d?'':'Create ')+t.label,sub,
      '<div class="ep-form-grid">'+fields+'</div>',
      '<div class="ct-modal-btns">'
        +'<button class="ep-cancel-btn" onclick="hdocClose()">Cancel</button>'
        +'<button class="ep-cancel-btn" onclick="hdocSaveDraft()">Save as Draft</button>'
        +'<button class="ep-save-btn" onclick="hdocToPreview()">'+HDOC_ICO.eye+' Preview</button>'
      +'</div>',false);
  }
  const miss=hdocMissing(tpl,m.values);
  if(m.view==='preview'){
    return hdocModalShell('Preview — '+t.label,
      miss.length?'<span class="hdoc-miss-note">'+miss.length+' required field'+(miss.length===1?' is':'s are')+' still empty — marked in the document. Go back to fill '+(miss.length===1?'it':'them')+' before submitting.</span>'
        :'This is the document as it will be issued. Submit to finalise it, or save it as a draft.',
      '<div class="hdoc-paper-wrap">'+hdocRenderLetter(tpl,m.values,d&&d.no)+'</div>',
      '<div class="ct-modal-btns">'
        +'<button class="ep-cancel-btn" onclick="hdocToForm()">'+HDOC_ICO.back+' Back to Fields</button>'
        +'<button class="ep-cancel-btn" onclick="hdocSaveDraft()">Save as Draft</button>'
        +'<button class="ep-save-btn" onclick="hdocSubmit()"'+(miss.length?' disabled title="Fill every required field first"':'')+'>Submit</button>'
      +'</div>',true,'hdocToForm()');
  }
  /* final review */
  return hdocModalShell(t.label+' — '+(d?d.no:''),
    '<span class="lp-status-badge tone-'+statusTone('Submitted')+'">Submitted</span> Final review'
      +(d?' · created by '+hdocEsc(d.createdBy)+' on '+d.createdAt.split(' | ')[0]:'')+'.',
    '<div class="hdoc-paper-wrap">'+hdocRenderLetter(tpl,m.values,d&&d.no)+'</div>',
    '<div class="ct-modal-btns">'
      +'<button class="ep-cancel-btn" onclick="hdocEditFinal()">'+HDOC_ICO.edit+' Edit</button>'
      +'<button class="ep-cancel-btn" onclick="hdocSaveDraft()">Save as Draft</button>'
      +'<button class="ep-save-btn" onclick="hdocDownload()">'+HDOC_ICO.dl+' Download</button>'
    +'</div>',true);
}
function hdocTemplatesModalHTML(){
  const t=hdocTypeOf(hdocModal.type);
  const list=hdocTemplates.filter(function(x){return x.type===t.key;});
  const rows=list.map(function(x){
    return '<tr><td><div style="font-weight:600;color:var(--navy)">'+hdocEsc(x.name)+'</div>'
        +'<div class="hdoc-tpl-sub">'+hdocFormKeys(x).length+' fields · heading “'+hdocEsc(x.heading||'—')+'”</div></td>'
      +'<td style="white-space:nowrap">'+hdocEsc(x.updatedBy||'—')+'<div class="hdoc-tpl-sub">'+hdocEsc(x.updatedAt||'')+'</div></td>'
      +'<td><span class="lp-status-badge tone-'+statusTone(x.status)+'">'+x.status+'</span></td>'
      +'<td style="white-space:nowrap;text-align:right">'
        +(x.status==='Active'?'':'<button class="ep-cancel-btn hdoc-sm-btn" onclick="hdocSetActive('+x.id+')">Set Active</button>')
        +'<button class="att-row-btn" title="Edit template" onclick="hdocEditTemplate(\''+t.key+'\','+x.id+')">'+HDOC_ICO.edit+'</button></td></tr>';
  }).join('');
  return hdocModalShell('Templates — '+t.label,
    'Only one template can be Active at a time. Every new '+t.label+' is created from the Active one; HR never sees this list.',
    '<table class="lp-table hdoc-tpl-table"><thead><tr><th>Template</th><th>Last Updated</th><th>Status</th><th></th></tr></thead><tbody>'
      +(rows||'<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--gray)">No templates yet.</td></tr>')+'</tbody></table>',
    '<button class="ep-cancel-btn" onclick="hdocEditTemplate(\''+t.key+'\')">'+HDOC_ICO.plus+' Add Template</button>'
    +'<div class="ct-modal-btns"><button class="ep-save-btn" onclick="hdocClose()">Done</button></div>',false);
}
function hdocTplEditModalHTML(){
  const m=hdocModal,t=hdocTypeOf(m.type);
  const x=m.tplId?hdocTemplateById(m.tplId):null;
  const seed=x||hdocActiveTemplate(t.key)||{heading:t.label.toUpperCase(),body:''};
  const name=x?x.name:'';
  const heading=x?x.heading:seed.heading;
  const body=x?x.body:seed.body;
  const chips=Object.keys(HDOC_FIELDS).map(function(k){
    return '<button type="button" class="hdoc-ins" onclick="hdocInsertField(\''+k+'\')" title="Insert {{'+k+'}}">'+hdocEsc(HDOC_FIELDS[k].label)+'</button>';
  }).join('')+'<button type="button" class="hdoc-ins" onclick="hdocInsertField(\'company_name\')" title="Insert {{company_name}}">Company Name</button>';
  return hdocModalShell((x?'Edit Template':'Add Template')+' — '+t.label,
    'Write the letter with <code>{{placeholders}}</code>. The placeholders you use become the fields HR fills in.'
      +(x?'':' A new template starts from the current Active one.'),
    '<div class="ep-form-grid">'
      +'<div class="ep-form-group"><label class="ep-form-label" for="hdt-name">Template Name <span class="req">*</span></label>'
        +'<input class="ep-form-input" id="hdt-name" value="'+attrSafe(name)+'" placeholder="e.g. '+attrSafe(t.label)+' - 2027 format"></div>'
      +'<div class="ep-form-group"><label class="ep-form-label" for="hdt-heading">Document Heading</label>'
        +'<input class="ep-form-input" id="hdt-heading" value="'+attrSafe(heading)+'" oninput="hdocTplLive()"></div>'
      +'<div class="ep-form-group ep-form-full"><label class="ep-form-label" for="hdt-body">Letter Body <span class="req">*</span></label>'
        +'<textarea class="ep-form-input hdoc-tpl-body" id="hdt-body" oninput="hdocTplLive()">'+hdocEsc(body)+'</textarea>'
        +'<div class="hdoc-ins-row"><span class="hdoc-ins-lbl">Insert field</span>'+chips+'</div></div>'
      +'<div class="ep-form-group ep-form-full"><label class="ep-form-label">Fields HR will fill in</label>'
        +'<div class="hdoc-fchips" id="hdt-fields">'+hdocTplFieldsHTML(heading,body)+'</div></div>'
      +'<div class="ep-form-group ep-form-full"><label class="hdoc-check"><input type="checkbox" id="hdt-active"'
        +(x&&x.status==='Active'?' checked disabled':'')+'><span>Make this the Active Template for '+t.label+'</span></label></div>'
    +'</div>',
    '<button class="ep-cancel-btn" onclick="hdocOpenTemplates(\''+t.key+'\')">'+HDOC_ICO.back+' Back to Templates</button>'
    +'<div class="ct-modal-btns"><button class="ep-save-btn" onclick="hdocSaveTemplate()">Save Template</button></div>',true);
}

/* Page title - getPageMeta() falls back to supportPageMeta. */
supportPageMeta['hr-docs']={title:'HR Docs',context:'HR Docs',filters:[],columns:[],rows:[]};
