/* ══ EXPENSES ═══════════════════════════════════════════════════════════════
   Reached two ways: Time & Pay → Expense Management → Expenses on the rail
   (next to Capping Limit, js/capping-limit.js), and the profile dropdown
   (index.html) - a claim is also something a person files and follows,
   like Apply Application.

   Built from the parts every other listing uses - lpSearchField + apCS
   filters and listing-stats tiles above an .lp-table in an .lp-split-wrap, the
   .lp-isb-* detail panel behind the row action, sbHero, the shared Logs view
   (lpLogsView) and the Workflow timeline (wfTimelineHTML), and a
   .ct-modal--form popup for + Add. Only the expense-specific parts are new.

   THE OLD SCREEN'S FILTERS, FOLDED. Employee Id, Expense Id and Employee Email
   were three separate inputs. They are all things a person TYPES to find one
   claim, so they are one search box (lpSearchMatch reads every field); the
   things you PICK from a list stay dropdowns.

   AN EXPENSE IS ITS LINE ITEMS. The claim's amount, its start and end dates
   were typed on the claim AND on each line, and could disagree. Here the
   claim's Net Amount and date range are read off its line items - state is
   derived, never typed.

   STATUS MOVES IN LOGS, NOT IN EDIT. Edit changes what the claim says; a move
   (Approve, Reject, Follow-Up, Mark Reimbursed) carries a comment and is only
   offered from Logs, and only the moves legal from where the claim is now. */

/* ── Reference data ────────────────────────────────────────────────────── */
const EXP_STATUSES=['Draft','Awaiting Approval','Follow-Up','Approved','Rejected','Reimbursed'];
/* The quick tiles are the claims someone owes the next move on: the
   approver (Awaiting Approval), the employee (Follow-Up) and finance
   (Approved, still to be paid). Draft, Rejected and Reimbursed are not yet
   filed or already closed - they are reached from the Status dropdown. */
const EXP_TILES=['Awaiting Approval','Follow-Up','Approved'];
/* Who owes the next move, per status - and the only moves Logs offers. */
const EXP_MOVES={
  'Draft':['Awaiting Approval'],
  'Awaiting Approval':['Approved','Rejected','Follow-Up'],
  'Follow-Up':['Awaiting Approval','Approved','Rejected'],
  'Approved':['Reimbursed'],
  'Rejected':[],
  'Reimbursed':[]
};
const EXP_MOVE_LABELS={'Awaiting Approval':'Submit for Approval','Approved':'Approve','Rejected':'Reject',
  'Follow-Up':'Follow-Up','Reimbursed':'Mark Reimbursed'};
const EXP_LINE_STATUSES=['Pending','Approved','Rejected','Follow-Up'];
const EXP_LINE_MOVES={'Pending':['Approved','Rejected','Follow-Up'],'Follow-Up':['Pending','Approved','Rejected'],'Approved':[],'Rejected':[]};
/* The category picks the sub categories a line item may use. Capping Limit
   (js/capping-limit.js) sets its limits on these same categories. */
const EXP_CATEGORIES=['Travel Reimbursement','Meal Allowance','Accommodation','Fuel Reimbursement','Team Outing','Office Events','Office Stationery'];
const EXP_SUBCATS={
  'Travel Reimbursement':['One Way','Two Way','Intercity Travel - Air','Intercity Travel - Train','Intercity Travel - Bus'],
  'Meal Allowance':['Breakfast','Lunch','Dinner'],
  'Accommodation':['Accommodation'],
  'Fuel Reimbursement':['One Way','Two Way','Bike','Car'],
  'Team Outing':['Monthly','Quarterly','Annual'],
  'Office Events':['Monthly','Annual','Festival'],
  'Office Stationery':['Monthly','Annual','Festival']
};
const EXP_CURRENCIES=['INR','GBP','USD','EUR','AED'];
const EXP_CLAIM_FOR=['Self','Others'];
const EXP_APP_TYPES=['Reimbursement','Advance'];
const EXP_TRAVEL_MODES=['None','Flight','Train','Bus','Cab','Own Vehicle'];
/* The extra columns an entity adds to its expense form (the old screen's
   "Test Column 1 / 2"). Each line item carries a value for each. */
const EXP_CUSTOM_COLS=['Test Column 1','Test Column 2'];

/* People an expense can be filed for: the seeds below, then everyone the
   Admin Access modules know (Direct + Global employees included). */
/* dept and position are what a Capping Limit is pinned to. */
const EXP_PEOPLE=[
  {name:'Syed Ayaz',empId:'1200',email:'syed.ayaz@opendhi.com',dept:'Operations',position:'Support Specialist'},
  {name:'Tarak Swain',empId:'768',email:'tarak.swain@maaserp.com',dept:'Sales',position:'Business Analyst'},
  {name:'Premnath Jayachandran',empId:'991',email:'premnath.jayachandran@opendhi.com',dept:'Engineering',position:'Senior Developer'},
  {name:'Prem Raj',empId:'731',email:'prem.raj@maaserp.com',dept:'Operations',position:'Ops Manager'},
  {name:'Meera Iyer',empId:'1042',email:'meera.iyer@opendhi.com',dept:'HR',position:'HR Manager'},
  {name:'Arjun Nair',empId:'655',email:'arjun.nair@maaserp.com',dept:'Engineering',position:'Software Engineer'}
];
function expPeople(){
  const out=EXP_PEOPLE.slice();
  (typeof axPeople==='function'?axPeople():[]).forEach(function(p){
    if(out.some(function(o){return o.name===p.name;}))return;
    out.push({name:p.name,empId:p.empId||'',email:p.name.toLowerCase().replace(/[^a-z]+/g,'.').replace(/^\.|\.$/g,'')+'@dhihyperlocal.com',
      dept:p.dept||'',position:p.desig||''});
  });
  return out;
}
function expPerson(name){return expPeople().find(function(p){return p.name===name;})||null;}

/* ── Seed data ─────────────────────────────────────────────────────────── */
function expLine(id,title,amount,subCat,start,end,proof,comments,status,cols){
  return {id:id,title:title,amount:amount,subCat:subCat,start:start,end:end||start,proof:proof||'',proofUrl:'',
    comments:comments||'',status:status||'Pending',cols:cols||{}};
}
const expensesData=[
  {id:1,key:297,title:'Test Hyd to Mum flight ticket',claimFor:'Self',name:'Syed Ayaz',empId:'1200',email:'syed.ayaz@opendhi.com',
   category:'Travel Reimbursement',currency:'INR',appType:'Reimbursement',travelMode:'Flight',notes:'Test Hyd to Mum flight ticket',
   status:'Awaiting Approval',appliedOn:'2026-04-07',reimbursedOn:'',createdBy:'Syed Ayaz',createdAt:'7 Apr 2026 | 01:40:12 PM',
   lines:[expLine(1,'Test Hyd to Mum flight ticket',6000,'Intercity Travel - Air','2026-04-02','2026-04-02','hyd-mum-ticket.pdf','Test Hyd to Mum flight ticket','Follow-Up',
     {'Test Column 1':'Test Value 1','Test Column 2':'Test Value 2'})]},
  {id:2,key:296,title:'hwd7',claimFor:'Self',name:'Tarak Swain',empId:'768',email:'tarak.swain@maaserp.com',
   category:'Accommodation',currency:'GBP',appType:'Reimbursement',travelMode:'None',notes:'',
   status:'Draft',appliedOn:'2025-10-21',reimbursedOn:'',createdBy:'Tarak Swain',createdAt:'21 Oct 2025 | 11:05:40 AM',
   lines:[]},
  {id:3,key:294,title:'Travel to Pune',claimFor:'Self',name:'Premnath Jayachandran',empId:'991',email:'premnath.jayachandran@opendhi.com',
   category:'Travel Reimbursement',currency:'INR',appType:'Reimbursement',travelMode:'Train',notes:'Client workshop in Pune.',
   status:'Awaiting Approval',appliedOn:'2025-03-17',reimbursedOn:'',createdBy:'Premnath Jayachandran',createdAt:'17 Mar 2025 | 10:12:03 AM',
   lines:[expLine(1,'Mumbai to Pune train',1240,'Intercity Travel - Train','2025-03-13','2025-03-13','pune-train.pdf','Shatabdi, chair car'),
     expLine(2,'Station to client office cab',652,'One Way','2025-03-13','2025-03-13','cab-receipt.jpg','')]},
  {id:4,key:293,title:'Traveling',claimFor:'Self',name:'Prem Raj',empId:'731',email:'prem.raj@maaserp.com',
   category:'Travel Reimbursement',currency:'INR',appType:'Reimbursement',travelMode:'Cab',notes:'',
   status:'Awaiting Approval',appliedOn:'2024-12-26',reimbursedOn:'',createdBy:'Prem Raj',createdAt:'26 Dec 2024 | 04:22:51 PM',
   lines:[expLine(1,'Airport drop',472,'One Way','2024-12-23','2024-12-23','uber-2312.pdf','')]},
  {id:5,key:292,title:'Traveling',claimFor:'Self',name:'Prem Raj',empId:'731',email:'prem.raj@maaserp.com',
   category:'Travel Reimbursement',currency:'INR',appType:'Reimbursement',travelMode:'Cab',notes:'',
   status:'Awaiting Approval',appliedOn:'2024-12-26',reimbursedOn:'',createdBy:'Prem Raj',createdAt:'26 Dec 2024 | 04:10:09 PM',
   lines:[expLine(1,'Client visit cab',101,'Two Way','2024-12-20','2024-12-20','ola-2012.pdf','')]},
  {id:6,key:291,title:'Bangalore client visit',claimFor:'Self',name:'Meera Iyer',empId:'1042',email:'meera.iyer@opendhi.com',
   category:'Accommodation',currency:'INR',appType:'Reimbursement',travelMode:'None',notes:'Two nights for the onboarding workshop.',
   status:'Reimbursed',appliedOn:'2024-12-18',reimbursedOn:'2024-12-30',createdBy:'Meera Iyer',createdAt:'18 Dec 2024 | 09:30:00 AM',
   lines:[expLine(1,'Hotel stay - 2 nights',9800,'Accommodation','2024-12-15','2024-12-17','hotel-invoice.pdf','','Approved')]},
  {id:7,key:289,title:'Team lunch - sprint close',claimFor:'Others',name:'Arjun Nair',empId:'655',email:'arjun.nair@maaserp.com',
   category:'Meal Allowance',currency:'INR',appType:'Reimbursement',travelMode:'None',notes:'Filed on behalf of the platform team.',
   status:'Approved',appliedOn:'2024-12-12',reimbursedOn:'',createdBy:'Arjun Nair',createdAt:'12 Dec 2024 | 03:15:44 PM',
   lines:[expLine(1,'Team lunch',3450,'Lunch','2024-12-11','2024-12-11','lunch-bill.jpg','8 people','Approved')]},
  {id:8,key:287,title:'Fuel - client visits, November',claimFor:'Self',name:'Syed Ayaz',empId:'1200',email:'syed.ayaz@opendhi.com',
   category:'Fuel Reimbursement',currency:'INR',appType:'Reimbursement',travelMode:'None',notes:'',
   status:'Rejected',appliedOn:'2024-12-04',reimbursedOn:'',createdBy:'Syed Ayaz',createdAt:'4 Dec 2024 | 10:02:18 AM',
   lines:[expLine(1,'Fuel for own car',1199,'Car','2024-11-01','2024-11-30','fuel-nov.pdf','','Rejected')]},
  {id:9,key:285,title:'London partner meeting',claimFor:'Self',name:'Tarak Swain',empId:'768',email:'tarak.swain@maaserp.com',
   category:'Travel Reimbursement',currency:'GBP',appType:'Advance',travelMode:'Train',notes:'Advance against the Q4 partner meeting.',
   status:'Follow-Up',appliedOn:'2024-11-26',reimbursedOn:'',createdBy:'Tarak Swain',createdAt:'26 Nov 2024 | 12:45:30 PM',
   lines:[expLine(1,'London to Reading return',64,'Two Way','2024-11-28','2024-11-28','gwr-ticket.pdf','')]},
  {id:10,key:283,title:'Stationery for onboarding kits',claimFor:'Others',name:'Meera Iyer',empId:'1042',email:'meera.iyer@opendhi.com',
   category:'Office Stationery',currency:'INR',appType:'Reimbursement',travelMode:'None',notes:'',
   status:'Reimbursed',appliedOn:'2024-11-20',reimbursedOn:'2024-11-29',createdBy:'Meera Iyer',createdAt:'20 Nov 2024 | 11:11:11 AM',
   lines:[expLine(1,'Notebooks and pens',2380,'Monthly','2024-11-18','2024-11-18','stationery.pdf','','Approved')]}
];
let expNextId=11,expNextKey=298;

/* ── Derived values ────────────────────────────────────────────────────── */
function expTotal(r){return r.lines.reduce(function(s,l){return s+(parseFloat(l.amount)||0);},0);}
function expMoney(n,cur){return (Number(n)||0).toLocaleString('en-IN',{maximumFractionDigits:2})+(cur?' '+cur:'');}
function expStart(r){return r.lines.map(function(l){return l.start;}).filter(Boolean).sort()[0]||'';}
function expEnd(r){return r.lines.map(function(l){return l.end||l.start;}).filter(Boolean).sort().pop()||'';}
function expKey(r){return 'EXP-'+r.key;}
function expRec(id){return expensesData.find(function(x){return x.id===id;})||null;}

const EXP_ICO={
  hero:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 .7V2l-1 .7-3-2-3 2-3-2-3 2-3-2z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>',
  plane:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
  note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  cols:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
  clip:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
  dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
};

/* ── State ─────────────────────────────────────────────────────────────── */
let expSelectedId=null,expTab='basic-details';
let expCatF='',expStatusF='',expDateF='',expQ='';
let expLogScope='expense',expLogLineId=null;
/* One edit at a time: the claim's basic details, or one line item ('new' for
   + Add Line Item). The draft is read back from the form on every repaint. */
let expEditBasic=false,expLineEdit=null,expDraft=null,expDraftOrig='';
let expModalOpen=false;

/* ── Filters ───────────────────────────────────────────────────────────────
   Only the filters someone actually reaches for:
     Search        - a claim is looked up by what you know: title, key,
                     employee name, ID or email.
     Category      - "all travel claims this month".
     Expense Date  - "what was spent on the 2nd".
     Status        - every status; the three quick tiles set the same
                     filter, so the tile and the dropdown always agree.
   Claim For (Self / Others) and Currency were dropped - nobody works a
   queue by either, and both are on the panel. */
function expRows(){
  return expensesData.filter(function(r){
    if(expCatF&&r.category!==expCatF)return false;
    if(expStatusF&&r.status!==expStatusF)return false;
    /* Expense Date: any claim with a line item spanning that day. */
    if(expDateF&&!r.lines.some(function(l){return l.start<=expDateF&&(l.end||l.start)>=expDateF;}))return false;
    return true;
  });
}
function expToggleStat(v){expStatusF=expStatusF===v?'':v;expSelectedId=null;renderADTPage();}
function applyExpFilters(){
  const pick=function(id,all){const v=getCSValue(id);return v&&v!==all?v:'';};
  expCatF=pick('exp-f-cat','All Categories');
  expStatusF=pick('exp-f-status','All Statuses');
  expDateF=getCDValue('exp-f-date');
  expQ=lpSearchValue('exp-f-q');
  expSelectedId=null;renderADTPage();
}
function resetExpFilters(){expCatF='';expStatusF='';expDateF='';expQ='';expSelectedId=null;renderADTPage();}

/* Export Filtered: exactly the rows the filters leave, as a CSV. */
function expExport(){
  const rows=lpSearchRows(expRows(),expQ);
  if(!rows.length){showToast('Nothing to export','info','No expense matches the current filters.');return;}
  const head=['S.No','Key','Title','Claim For','Employee Id','Employee Email','Expense Category','Total Amount','Currency',
    'Date Of Exp.','Status','Application Type','Applied On','Reimbursed On'];
  const q=function(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
  const lines=[head.join(',')].concat(rows.map(function(r,i){
    return [i+1,r.key,r.title,r.claimFor,r.empId,r.email,r.category,expTotal(r),r.currency,cdLabel(expStart(r)),r.status,
      r.appType,cdLabel(r.appliedOn),r.reimbursedOn?cdLabel(r.reimbursedOn):'Not Reimbursed'].map(q).join(',');
  }));
  const blob=new Blob([lines.join('\n')],{type:'text/csv'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='expenses-'+cdISO(new Date())+'.csv';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
  showToast('Export ready','success',rows.length+' expense'+(rows.length===1?'':'s')+' exported.');
}

/* ── Detail panel ──────────────────────────────────────────────────────── */
function expEditing(){return expEditBasic||expLineEdit!=null;}
function expDropEdit(){expEditBasic=false;expLineEdit=null;expDraft=null;}
function openExpSidebar(id,tab){
  if(expSelectedId!=null&&expSelectedId!==id&&sbLeaveGuard('exp',function(){openExpSidebar(id,tab);}))return;
  if(expSelectedId!==id){expDropEdit();expLogLineId=null;}
  expTab=tab||sbKeepTab(expSelectedId,expTab);expSelectedId=id;
  const sb=document.getElementById('exp-split-sb');if(sb)sb.classList.add('open');
  isbTab('exp',renderExpSidebar);
  document.querySelectorAll('.exp-row').forEach(function(r){r.classList.toggle('lp-row-selected',r.id==='exp-row-'+id);});
}
function closeExpSidebar(){
  if(sbLeaveGuard('exp',closeExpSidebar))return;
  expDropEdit();expSelectedId=null;
  const sb=document.getElementById('exp-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.exp-row').forEach(function(r){r.classList.remove('lp-row-selected');});
}
function navExpTab(t){if(expEditing()&&!sbHasDraft('exp'))expDropEdit();expTab=t;isbTab('exp',renderExpSidebar);}
function expSetLogScope(s){expLogScope=s;isbTab('exp',renderExpSidebar);}
function expPickLogLine(v){
  const r=expRec(expSelectedId);if(!r)return;
  const l=r.lines.find(function(x){return expLineLabel(r,x)===v;});
  expLogLineId=l?l.id:null;isbTab('exp',renderExpSidebar);
}

/* Logs: seeded once from the claim's own dates, then only ever added to. */
function expSeedLogs(r){
  const p=String(r.createdAt).split(' | ');
  const fx=[{date:p[0],time:p[1]||'09:00:00 AM',user:r.createdBy,status:'Draft',action:'Expense drafted.'}];
  if(r.status!=='Draft')fx.unshift({date:cdLabel(r.appliedOn),time:p[1]||'09:05:00 AM',user:r.createdBy,status:'Awaiting Approval',
    action:'Submitted for approval with '+r.lines.length+' line item'+(r.lines.length===1?'':'s')+'.'});
  if(r.status==='Follow-Up')fx.unshift({date:cdLabel(r.appliedOn),time:'03:30:00 PM',user:'Shaun Test1',status:'Follow-Up',
    action:'Please attach the booking confirmation for the return leg.'});
  if(['Approved','Reimbursed'].indexOf(r.status)>=0)fx.unshift({date:cdLabel(r.appliedOn),time:'05:10:00 PM',user:'Shaun Test1',status:'Approved',
    action:'Within policy. Approved.'});
  if(r.status==='Rejected')fx.unshift({date:cdLabel(r.appliedOn),time:'05:10:00 PM',user:'Shaun Test1',status:'Rejected',
    action:'Fuel for client visits is covered by the monthly conveyance allowance.'});
  if(r.status==='Reimbursed')fx.unshift({date:cdLabel(r.reimbursedOn),time:'11:00:00 AM',user:'Finance Admin',status:'Reimbursed',
    action:'Paid with the payroll run.'});
  return seedLogs(r,fx);
}
function expSeedLineLogs(r,l){
  const p=String(r.createdAt).split(' | ');
  const fx=[{date:p[0],time:p[1]||'09:00:00 AM',user:r.createdBy,status:'Pending',action:'Line item added.'}];
  if(l.status!=='Pending')fx.unshift({date:cdLabel(r.appliedOn),time:'04:00:00 PM',user:'Shaun Test1',status:l.status,
    action:l.status==='Follow-Up'?(r.key===297?'Test please let me know the update':'Proof is unclear - please re-upload.'):l.status==='Rejected'?'Not claimable under the policy.':'Checked against the receipt.'});
  return seedLogs(l,fx);
}
/* Workflow is read from the Logs, so the two can never disagree; then the
   steps still to come, with who owns each. */
const EXP_STEP_TITLE={'Draft':'Expense Drafted','Awaiting Approval':'Submitted for Approval','Follow-Up':'Follow-Up Raised',
  'Approved':'Expense Approved','Rejected':'Expense Rejected','Reimbursed':'Reimbursed'};
function expWorkflow(r){
  const done=wfDoneFromLogs(expSeedLogs(r),function(st){return EXP_STEP_TITLE[st]||st;});
  const who=r.name||'Employee';
  const LEFT={
    'Draft':[{title:'Submit for Approval',owner:who},{title:'Approve Expense',owner:'Reporting Manager'},{title:'Reimburse',owner:'Finance Admin'}],
    'Awaiting Approval':[{title:'Approve Expense',owner:'Reporting Manager'},{title:'Reimburse',owner:'Finance Admin'}],
    'Follow-Up':[{title:'Respond to Follow-Up',owner:who},{title:'Approve Expense',owner:'Reporting Manager'},{title:'Reimburse',owner:'Finance Admin'}],
    'Approved':[{title:'Reimburse',owner:'Finance Admin'}]
  };
  return wfPlan(done,LEFT[r.status]||[]);
}

function expProofChip(l){
  if(!l.proof)return '';
  return '<button type="button" class="exp-proof" onclick="expOpenProof('+expSelectedId+','+l.id+')" title="'+attrSafe(l.proof)+'">'
    +EXP_ICO.clip+'<span>'+l.proof+'</span></button>';
}
function expOpenProof(id,lineId){
  const r=expRec(id);const l=r&&r.lines.find(function(x){return x.id===lineId;});
  if(!l)return;
  if(l.proofUrl){window.open(l.proofUrl,'_blank');return;}
  showToast(l.proof,'info','The original file is held on the server; this prototype shows its name only.');
}

function renderExpSidebar(){
  const r=expRec(expSelectedId);if(!r)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'summary',label:'Expense Summary'},{id:'logs',label:'Logs'},
    {id:'history',label:'History'},{id:'workflow',label:'Workflow'}];
  const tabBar=axTabBar('exp',tabs,expTab,'navExpTab','closeExpSidebar');
  const hero=function(editing,edit){return sbHero({icon:EXP_ICO.hero,name:r.title,meta:[expKey(r),r.category,r.claimFor],
    status:axBadge(statusTone(r.status),r.status),editing:editing,onEdit:edit});};
  const locked=['Approved','Rejected','Reimbursed'].indexOf(r.status)>=0;
  let body='';
  if(expTab==='basic-details'&&expEditBasic){
    body=hero(true)+axInlineFormHTML(expBasicFieldsHTML(),'expCancelEdit()','expSaveEdit()');
  }else if(expTab==='basic-details'){
    const s=expStart(r),e=expEnd(r);
    body=hero(false,locked?'':'expStartEdit()')
      +(locked?'<div class="ax-locked-note exp-note">This claim is <b>'+r.status+'</b>, so it can no longer be edited.</div>':'')
      +'<div class="lp-sb-detail-grid">'
      +axField(AX_ICO.fTag,'Title',r.title)
      +axField(AX_ICO.fUser,'Claim Expense',r.claimFor)
      +axField(AX_ICO.fUser,'Employee Name',r.name)
      +axField(AX_ICO.fHash,'Employee Id',r.empId)
      +axField(AX_ICO.fMail,'Employee Email',r.email)
      +axField(AX_ICO.fBox,'Expense Category',r.category)
      +axField(AX_ICO.fCash,'Net Amount',expMoney(expTotal(r),r.currency)+' <span class="ax-sub">from '+r.lines.length+' line item'+(r.lines.length===1?'':'s')+'</span>')
      +axField(AX_ICO.fCash,'Currency',r.currency)
      +axField(AX_ICO.fCal,'Expense Start Date',s?cdLabel(s):'')
      +axField(AX_ICO.fCal,'Expense End Date',e?cdLabel(e):'')
      +axField(EXP_ICO.plane,'Travel Mode',r.travelMode)
      +axField(AX_ICO.fTicket,'Application Type',r.appType)
      +axField(AX_ICO.fCal,'Applied On',cdLabel(r.appliedOn))
      +axField(AX_ICO.fCheck,'Reimbursed On',r.reimbursedOn?cdLabel(r.reimbursedOn):'Not Reimbursed')
      +axField(EXP_ICO.note,'Notes',r.notes,true)
      +'</div>';
  }else if(expTab==='summary'){
    body=expSummaryHTML(r,locked);
  }else if(expTab==='logs'){
    body=expLogsHTML(r);
  }else if(expTab==='history'){
    body=sbHistoryHTML(r);
  }else{
    body=wfTimelineHTML(expWorkflow(r));
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}

/* Expense Summary: the line items the claim is made of, each its own card. */
function expSummaryHTML(r,locked){
  const total=expTotal(r);
  let out='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Line Items <span class="ax-count">'+r.lines.length+'</span></span>'
    +'<span class="exp-sum-total">Total <b>'+expMoney(total,r.currency)+'</b></span></div>';
  if(expLineEdit==='new')out+=expLineFormHTML(r,null);
  if(!r.lines.length&&expLineEdit!=='new')
    out+='<div class="ax-empty">No line items yet. <b>Add Line Item</b> records what was spent, with its proof.</div>';
  out+=r.lines.map(function(l,i){
    if(expLineEdit===l.id)return expLineFormHTML(r,l);
    const cols=EXP_CUSTOM_COLS.map(function(c){return axField(EXP_ICO.cols,c,(l.cols||{})[c]);}).join('');
    return '<div class="exp-line">'
      +'<div class="exp-line-hd"><span class="exp-line-n">'+(i+1)+'</span>'
        +'<div class="exp-line-ttl"><div class="exp-line-name">'+l.title+'</div>'
        +'<div class="exp-line-amt">'+expMoney(l.amount,r.currency)+'</div></div>'
        +axBadge(statusTone(l.status),l.status)
        +(locked||expEditing()?'':'<button class="btn-outline btn-sm" onclick="expStartLine('+l.id+')">'+SB_PEN+' Edit</button>')
      +'</div>'
      +'<div class="lp-sb-detail-grid">'
      +axField(AX_ICO.fCash,'Amount Spent',expMoney(l.amount,r.currency))
      +axField(AX_ICO.fBox,'Sub Category',l.subCat)
      +axField(AX_ICO.fCal,'Start Date',cdLabel(l.start))
      +axField(AX_ICO.fCal,'End Date',cdLabel(l.end))
      +axField(EXP_ICO.clip.replace('width="13" height="13" ',''),'Expense Proof',expProofChip(l))
      +cols
      +axField(EXP_ICO.note,'Comments',l.comments,true)
      +'</div></div>';
  }).join('');
  if(!locked&&!expEditing())
    out+='<button class="btn-outline exp-add-line" onclick="expStartLine(\'new\')">'+AX_ICO.plus+' Add Line Item</button>';
  return out;
}

/* Logs: the claim's own log, or one line item's - a strip picks which. */
function expLogsHTML(r){
  const seg=function(id,label){return '<button type="button" class="seg-btn'+(expLogScope===id?' active':'')+'" onclick="expSetLogScope(\''+id+'\')">'+label+'</button>';};
  const strip='<div class="segmented is-compact exp-log-scope">'+seg('expense','Expense Logs')+seg('line','Line Item Logs')+'</div>';
  if(expLogScope!=='line'){
    const moves=EXP_MOVES[r.status]||[];
    return strip+lpLogsView(expSeedLogs(r),expLogFormHTML('exp-log',r.status,moves,'expSaveLog('+r.id+')',
      'Move this claim on and say why'),{labels:EXP_MOVE_LABELS});
  }
  if(!r.lines.length)return strip+'<div class="ax-empty">This claim has no line items yet, so there is nothing to log against.</div>';
  const l=r.lines.find(function(x){return x.id===expLogLineId;})||r.lines[0];
  expLogLineId=l.id;
  const label=function(x){return expLineLabel(r,x);};
  const picker='<div class="exp-log-line"><div class="lp-logs-form-label">Line Item</div>'
    +apCS('exp-log-line-pick',r.lines.map(label),label(l),'Select Line Item','expPickLogLine')+'</div>';
  const moves=EXP_LINE_MOVES[l.status]||[];
  return strip+picker+lpLogsView(expSeedLineLogs(r,l),expLogFormHTML('exp-llog',l.status,moves,'expSaveLineLog('+r.id+','+l.id+')',
    'Approve, reject or query this line'),{labels:{'Approved':'Approve','Rejected':'Reject','Pending':'Reopen'}});
}
/* apCS writes its options into an onclick string, so quotes are kept out. */
function expLineLabel(r,l){return String(l.title).replace(/['"\\]/g,'')+' · '+expMoney(l.amount,r.currency);}
function expLogFormHTML(pre,status,moves,save,sub){
  return '<div class="lp-logs-form">'
    +'<div class="lp-logs-form-header"><span class="lp-log-dot"></span>'+status+'</div>'
    +'<p class="lp-logs-form-sub">'+sub+'</p>'
    +lpLogStatusField(pre+'-status-sel',status,[status].concat(moves))
    +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
    +'<textarea class="lp-logs-form-textarea" id="'+pre+'-comment-inp" placeholder="Enter comment"></textarea>'
    +'<div style="display:flex;gap:10px;margin-top:12px">'
    +'<button class="ep-cancel-btn" style="flex:1" onclick="navExpTab(\'logs\')">Cancel</button>'
    +'<button class="lp-logs-save-btn" style="flex:1" onclick="'+save+'">Submit</button>'
    +'</div></div>';
}
function expSaveLog(id){
  const r=expRec(id);if(!r)return;
  const was=r.status;
  if(was==='Draft'&&getCSValue('exp-log-status-sel')==='Awaiting Approval'&&!r.lines.length){
    showToast('Add a line item first','error','A claim needs at least one line item before it can be submitted.');return;
  }
  expSeedLogs(r);
  if(!lpCommitLog(r,'exp-log-status-sel','exp-log-comment-inp',r.logs))return;
  if(r.status==='Awaiting Approval'&&was==='Draft')r.appliedOn=axToday();
  if(r.status==='Reimbursed')r.reimbursedOn=axToday();
  renderADTPage();
  showToast('Log added','success',expKey(r)+' is now '+r.status+'.');
}
function expSaveLineLog(id,lineId){
  const r=expRec(id);const l=r&&r.lines.find(function(x){return x.id===lineId;});if(!l)return;
  expSeedLineLogs(r,l);
  if(!lpCommitLog(l,'exp-llog-status-sel','exp-llog-comment-inp',l.logs))return;
  renderADTPage();
  showToast('Line item updated','success','"'+l.title+'" is now '+l.status+'.');
}

/* ── Edit: basic details (in the panel) ────────────────────────────────── */
function expStartEdit(){
  const r=expRec(expSelectedId);if(!r)return;
  expLineEdit=null;expEditBasic=true;expTab='basic-details';
  expDraft={title:r.title,claimFor:r.claimFor,name:r.name,category:r.category,currency:r.currency,appType:r.appType,
    travelMode:r.travelMode,notes:r.notes||''};
  expDraftOrig=JSON.stringify(expDraft);
  renderADTPage();
}
function expCancelEdit(){expDropEdit();renderADTPage();}
function expSyncBasic(){
  if(!expDraft)return;
  [['title','exp-e-title'],['notes','exp-e-notes']].forEach(function(p){const el=document.getElementById(p[1]);if(el)expDraft[p[0]]=el.value.trim();});
  [['claimFor','exp-e-claim'],['name','exp-e-emp'],['category','exp-e-cat'],['currency','exp-e-cur'],['appType','exp-e-app'],['travelMode','exp-e-mode']]
    .forEach(function(p){if(document.getElementById('csw-'+p[1]))expDraft[p[0]]=getCSValue(p[1]);});
}
function expFormHook(){expSyncBasic();if(expModalOpen)expSyncLine();expRepaintForm();}
function expBasicFieldsHTML(){
  const d=expDraft;
  const p=expPerson(d.name);
  const travel=d.category==='Travel Reimbursement';
  const sel=function(id,label,opts,val,ph,req,hook,cls){
    return '<div class="ep-form-group'+(cls?' '+cls:'')+'"><label class="ep-form-label">'+label+(req?' <span class="req">*</span>':'')+'</label>'+apCS(id,opts,val,ph,hook)+'</div>';
  };
  /* Laid out as the old claim form: who it is for, the category (with the
     limit it falls under), then the title and notes. Application Type and
     Travel Mode are not asked when filing - the sub categories already say
     how someone travelled - and stay editable from the panel. */
  return sel('exp-e-claim','Claim For',EXP_CLAIM_FOR,d.claimFor,'Select',true)
    +'<div class="ep-form-group"><label class="ep-form-label">Employee <span class="req">*</span></label>'
      +axCS('exp-e-emp',expPeople().map(function(x){return x.name;}),d.name,'Search Employee','expFormHook')+'</div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Employee Id</label>'
      +'<input class="ep-form-input" readonly value="'+attrSafe(p?p.empId:'')+'" placeholder="Auto — from the employee"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Employee Email</label>'
      +'<input class="ep-form-input" readonly value="'+attrSafe(p?p.email:'')+'" placeholder="Auto — from the employee"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Expense Category <span class="req">*</span></label>'
      +apCS('exp-e-cat',EXP_CATEGORIES,d.category,'Select Category','expFormHook')+expCapHintHTML(d.category,d.name)+'</div>'
    +sel('exp-e-cur','Currency',EXP_CURRENCIES,d.currency,'Select Currency',true,'expFormHook')
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label" for="exp-e-title">Title <span class="req">*</span></label>'
      +'<input class="ep-form-input" id="exp-e-title" value="'+attrSafe(d.title)+'" placeholder="e.g. Hyderabad to Mumbai flight"></div>'
    +(expModalOpen?'':sel('exp-e-app','Application Type',EXP_APP_TYPES,d.appType,'Select Type',true)
      +'<div class="ep-form-group'+(travel?'':' exp-dim')+'"><label class="ep-form-label">Travel Mode</label>'
      +apCS('exp-e-mode',EXP_TRAVEL_MODES,travel?d.travelMode:'None','Select Travel Mode')
      +(travel?'':'<div class="ea-hint">Only for Travel Reimbursement.</div>')+'</div>')
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label" for="exp-e-notes">Notes <span class="exp-opt">(Optional)</span></label>'
      +'<textarea class="ep-form-input ax-notes" id="exp-e-notes" placeholder="What was this for?">'+attrSafe(d.notes||'')+'</textarea></div>';
}
/* "Capping limit (TEST TRAVEL): 5,000 INR" under Expense Category - the limit
   this employee's claim in this category falls under (capFor), and how far
   over it the items so far come. */
function expCapHintHTML(category,name){
  if(!category||typeof capFor!=='function')return '';
  const cap=capFor(category,name);
  if(!cap)return '<div class="ea-hint exp-cap">No capping limit on '+category+'.</div>';
  const total=expModalOpen&&expDraft&&expDraft.lines
    ?expDraft.lines.reduce(function(s,l){return s+(parseFloat(l.amount)||0);},0)+(parseFloat((expDraft.line||{}).amount)||0)
    :(expRec(expSelectedId)?expTotal(expRec(expSelectedId)):0);
  const over=total-cap.amount;
  return '<div class="ea-hint exp-cap">Capping limit ('+cap.name+'): <b>'+capMoney(cap)+'</b>'
    +(over>0?'<span class="exp-cap-over"> · items come to '+expMoney(total,cap.currency)+', over by '+expMoney(over,cap.currency)+'</span>':'')+'</div>';
}
function expCheckBasic(d){
  const need=[['title','Title'],['claimFor','Claim For'],['name','Employee'],['category','Expense Category'],['currency','Currency'],['appType','Application Type']];
  for(let i=0;i<need.length;i++){if(!String(d[need[i][0]]||'').trim()){showToast(need[i][1]+' is required','error');return false;}}
  if(d.category!=='Travel Reimbursement')d.travelMode='None';
  return true;
}
function expSaveEdit(){
  const r=expRec(expSelectedId);if(!r||!expDraft)return;
  expSyncBasic();
  const d=expDraft;
  if(!expCheckBasic(d))return;
  if(d.category!==r.category&&r.lines.some(function(l){return (EXP_SUBCATS[d.category]||[]).indexOf(l.subCat)<0;})){
    showToast('Sub categories no longer fit','error','Line items use sub categories of '+r.category+'. Edit them in Expense Summary first.');return;}
  const p=expPerson(d.name);
  Object.assign(r,{title:d.title,claimFor:d.claimFor,name:d.name,empId:p?p.empId:r.empId,email:p?p.email:r.email,
    category:d.category,currency:d.currency,appType:d.appType,travelMode:d.travelMode,notes:d.notes});
  expDropEdit();
  renderADTPage();
  showToast('Expense updated','success',expKey(r)+' saved.');
}

/* ── Edit / add a line item (in Expense Summary) ───────────────────────── */
function expBlankLine(){return {title:'',amount:'',subCat:'',start:'',end:'',proof:'',proofUrl:'',comments:'',cols:{}};}
function expStartLine(lineId){
  const r=expRec(expSelectedId);if(!r)return;
  const l=lineId==='new'?null:r.lines.find(function(x){return x.id===lineId;});
  expEditBasic=false;expLineEdit=l?l.id:'new';expTab='summary';
  expDraft=l?{title:l.title,amount:String(l.amount),subCat:l.subCat,start:l.start,end:l.end,proof:l.proof,proofUrl:l.proofUrl,
    comments:l.comments,cols:Object.assign({},l.cols)}:expBlankLine();
  expDraftOrig=JSON.stringify(expDraft);
  renderADTPage();
}
function expSyncLine(){
  if(!expDraft)return;
  [['title','exp-l-title'],['amount','exp-l-amt'],['comments','exp-l-desc']].forEach(function(p){const el=document.getElementById(p[1]);if(el)expDraft[p[0]]=el.value.trim();});
  [['start','exp-l-start'],['end','exp-l-end']].forEach(function(p){const el=document.getElementById(p[1]);if(el)expDraft[p[0]]=el.value;});
  if(document.getElementById('csw-exp-l-sub'))expDraft.subCat=getCSValue('exp-l-sub');
  expDraft.cols=expDraft.cols||{};
  EXP_CUSTOM_COLS.forEach(function(c,i){const el=document.getElementById('exp-l-col-'+i);if(el)expDraft.cols[c]=el.value.trim();});
}
function expPickProof(input){
  const f=input.files&&input.files[0];input.value='';
  if(!f)return;
  if(f.size>5*1024*1024){showToast('File is over 5 MB','error',f.name);return;}
  expSyncLine();if(expModalOpen)expSyncBasic();
  const t=expModalOpen?expDraft.line:expDraft;
  t.proof=f.name;t.proofUrl=URL.createObjectURL(f);
  expRepaintForm();
}
function expClearProof(){
  expSyncLine();if(expModalOpen)expSyncBasic();
  const t=expModalOpen?expDraft.line:expDraft;
  t.proof='';t.proofUrl='';expRepaintForm();
}
/* The line item's fields - used in the panel and in the + Add popup. */
function expLineFieldsHTML(cur,category){
  const d=expDraft;
  const proof=d.proof
    ?'<div class="ax-img-row exp-proof-row">'+EXP_ICO.clip+'<span class="ax-img-name" title="'+attrSafe(d.proof)+'">'+d.proof+'</span>'
      +'<button type="button" class="att-row-btn is-danger" onclick="expClearProof()" title="Remove file">'+AX_ICO.trash+'</button></div>'
    :'<label class="att-zone ax-img-zone"><input type="file" accept="image/png,image/jpeg,application/pdf" hidden onchange="expPickProof(this)">'
      +'<span class="att-zone-ico">'+AX_ICO.upload+'</span>'
      +'<span><span class="att-zone-title">Click to upload</span><span class="att-zone-hint"> · PDF, PNG, JPG (max 5 MB)</span></span></label>';
  const subs=EXP_SUBCATS[category]||[];
  return '<div class="ep-form-group"><label class="ep-form-label" for="exp-l-title">Line Title <span class="req">*</span></label>'
      +'<input class="ep-form-input" id="exp-l-title" value="'+attrSafe(d.title)+'" placeholder="e.g. Flight ticket"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label" for="exp-l-amt">Amount Spent <span class="req">*</span></label>'
      +'<div class="ax-currency"><span>'+(cur||'—')+'</span><input class="ep-form-input" id="exp-l-amt" type="number" min="0" step="0.01" value="'+attrSafe(d.amount)+'" placeholder="0.00"></div></div>'
    +'<div class="ep-form-group'+(subs.length?'':' exp-dim')+'"><label class="ep-form-label">Sub Category <span class="req">*</span></label>'
      +apCS('exp-l-sub',subs,d.subCat,subs.length?'Select Sub Category':'Pick a category first')+'</div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Start Date <span class="req">*</span></label>'+apCD('exp-l-start',d.start,'dd-mm-yyyy')+'</div>'
    +'<div class="ep-form-group"><label class="ep-form-label">End Date</label>'+apCD('exp-l-end',d.end,'dd-mm-yyyy')
      +'<div class="ea-hint">Leave empty for a one-day expense.</div></div>'
    +EXP_CUSTOM_COLS.map(function(c,i){
      return '<div class="ep-form-group"><label class="ep-form-label" for="exp-l-col-'+i+'">'+c+'</label>'
        +'<input class="ep-form-input" id="exp-l-col-'+i+'" value="'+attrSafe((d.cols||{})[c]||'')+'" placeholder="'+c+'"></div>';
    }).join('')
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label">Expense Proof <span class="req">*</span></label>'+proof+'</div>'
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label" for="exp-l-desc">Description</label>'
      +'<textarea class="ep-form-input ax-notes" id="exp-l-desc" placeholder="Anything the approver should know">'+attrSafe(d.comments||'')+'</textarea></div>';
}
function expLineFormHTML(r,l){
  return '<div class="exp-line is-editing"><div class="exp-line-hd"><div class="exp-line-ttl"><div class="exp-line-name">'
    +(l?'Edit line item':'New line item')+'</div></div></div>'
    +'<div class="ep-form-grid">'+expLineFieldsHTML(r.currency,r.category)+'</div>'
    +'<div class="lp-sb-form-actions"><button class="ep-cancel-btn" onclick="expCancelEdit()">Cancel</button>'
    +'<button class="ep-save-btn" onclick="expSaveLine()">'+(l?'Save changes':'Add Line Item')+'</button></div></div>';
}
function expCheckLine(d,category){
  const need=[['title','Line Title'],['amount','Amount Spent'],['subCat','Sub Category'],['start','Start Date'],['proof','Expense Proof']];
  for(let i=0;i<need.length;i++){if(!String(d[need[i][0]]||'').trim()){showToast(need[i][1]+' is required','error');return false;}}
  const n=parseFloat(d.amount);
  if(isNaN(n)||n<=0){showToast('Amount Spent must be more than 0','error');return false;}
  if((EXP_SUBCATS[category]||[]).indexOf(d.subCat)<0){showToast('Pick a sub category of '+category,'error');return false;}
  if(d.end&&d.end<d.start){showToast('Ends before it starts','error','End Date must be on or after the Start Date.');return false;}
  if(d.start>axToday()){showToast('Start Date is in the future','error','Claim an expense once it has been spent.');return false;}
  return true;
}
function expSaveLine(){
  const r=expRec(expSelectedId);if(!r||!expDraft)return;
  expSyncLine();
  const d=expDraft;
  if(!expCheckLine(d,r.category))return;
  const vals={title:d.title,amount:parseFloat(d.amount),subCat:d.subCat,start:d.start,end:d.end||d.start,proof:d.proof,
    proofUrl:d.proofUrl,comments:d.comments,cols:Object.assign({},d.cols)};
  let msg;
  if(expLineEdit==='new'){
    const id=r.lines.reduce(function(m,x){return Math.max(m,x.id);},0)+1;
    r.lines.push(Object.assign({id:id,status:'Pending'},vals));
    msg='Line item added';
  }else{
    const l=r.lines.find(function(x){return x.id===expLineEdit;});if(!l)return;
    Object.assign(l,vals);
    msg='Line item updated';
  }
  expDropEdit();
  renderADTPage();
  showToast(msg,'success','Net amount is now '+expMoney(expTotal(r),r.currency)+'.');
}

/* ── Listing ───────────────────────────────────────────────────────────── */
function buildExpensesHTML(){
  const count=function(s){return expensesData.filter(function(r){return r.status===s;}).length;};
  const shown=lpSearchRows(expRows(),expQ);
  if(expSelectedId&&!shown.some(function(r){return r.id===expSelectedId;}))expSelectedId=null;
  const pgn=listPage('expenses',[expCatF,expStatusF,expDateF,expQ].join('|'),shown.map(function(r,i){
    /* The listing answers "which claim, whose, how much, where is it". Email,
       Employee Id, Claim For, Application Type, end date, Applied On and
       Reimbursed On are all in the panel's Basic Details. */
    const s=expStart(r);
    return '<tr class="exp-row'+(expSelectedId===r.id?' lp-row-selected':'')+'" id="exp-row-'+r.id+'" style="cursor:pointer" onclick="openExpSidebar('+r.id+')">'
      +'<td class="lp-c-n">'+(i+1)+'</td>'
      +'<td><div class="lp-c-main ax-c-link ax-c-trunc" title="'+attrSafe(r.title)+'">'+r.title+'</div><div class="lp-c-sub">'+expKey(r)+'</div></td>'
      +'<td><div class="lp-c-plain ax-c-trunc exp-c-emp" title="'+attrSafe(r.name)+'">'+r.name+'</div></td>'
      +'<td><div class="lp-c-plain ax-c-trunc exp-c-cat" title="'+attrSafe(r.category)+'">'+r.category+'</div></td>'
      +'<td class="exp-c-amt exp-c-nw"><div class="lp-c-plain">'+expMoney(expTotal(r),r.currency)+'</div></td>'
      +'<td class="exp-c-nw"><div class="lp-c-plain'+(s?'':' is-none')+'">'+(s?cdLabel(s):'—')+'</div></td>'
      +'<td>'+axBadge(statusTone(r.status),r.status)+'</td>'
      +'<td onclick="event.stopPropagation()"><button class="lp-action-btn" onclick="openExpSidebar('+r.id+')" title="View Details">'+AX_ICO.dots+'</button></td>'
      +'</tr>';
  }),'<tr><td colspan="8" style="padding:24px;text-align:center;color:var(--gray)">No expenses match this filter.</td></tr>');
  const stat=function(s){
    return '<div class="listing-stat'+(expStatusF===s?' stat-selected':'')+'" onclick="expToggleStat(\''+s+'\')">'
      +'<div class="listing-stat-count" style="color:var(--st-'+statusTone(s)+'-fg)">'+count(s)+'</div><div class="listing-stat-label">'+s+'</div></div>';
  };
  return '<div class="lp-page">'
    +dashboardBackHTML()
    +'<div class="exp-top" style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:4px">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0">'
    /* Clear Filters sits on the label line, not in the row: the row then has
       the same width with or without a filter applied, so the tiles beside
       it never get pushed or squeezed when it appears. */
    +'<div class="lp-filter-bar-label exp-f-label">Select Filter'+clearFiltersBtn([expCatF,expStatusF,expDateF,expQ],'resetExpFilters()')+'</div>'
    +'<div class="lp-filter-bar-row">'
    +lpSearchField('exp-f-q',expQ,'Search expenses','applyExpFilters()')
    +apCS('exp-f-cat',EXP_CATEGORIES,expCatF,'All Categories')
    +apCS('exp-f-status',EXP_STATUSES,expStatusF,'All Statuses')
    +apCD('exp-f-date',expDateF,'Expense Date')
    +'<button class="lp-pill-search" onclick="applyExpFilters()">Search</button>'
    +'</div></div>'
    /* Six tiles: the compact strip (as Tickets), so they share the filter row. */
    +'<div class="listing-stats is-compact">'+EXP_TILES.map(stat).join('')+'</div></div>'
    +'<div class="lp-split-wrap ax-split-wrap" style="margin-top:14px" id="exp-split-wrap"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table ax-table exp-table"><thead><tr><th>S. No</th><th>Expense</th><th>Employee</th><th>Category</th>'
      +'<th>Total Amount</th><th>Date of Exp.</th><th>Status</th><th>Action</th></tr></thead>'
    +'<tbody>'+pgn.rows+'</tbody></table>'
    +pgn.pager
    +'</div></div>'
    +'<div class="lp-split-sb'+(expSelectedId?' open':'')+'" id="exp-split-sb"><div class="lp-isb" id="exp-isb-inner">'+(expSelectedId?sbRender(renderExpSidebar,'exp'):'')+'</div></div>'
    +'</div></div>'
    +(expModalOpen?buildAddExpenseModalHTML():'');
}

/* ── + Add: the claim and its expense items, in one popup ──────────────────
   As the old form: the claim on top, then Expense Items. The item being
   typed is one form; "Add Expense Item" checks it and files it as a card
   above, ready for the next. Submit takes the cards plus whatever is in the
   form, so a one-item claim needs no extra click. */
function startAddExpense(){
  if(page!=='expenses')navigatePage('expenses');
  expDropEdit();
  const me=EXP_PEOPLE[0];
  expDraft={title:'',claimFor:'Self',name:me.name,category:'',currency:'INR',appType:'Reimbursement',travelMode:'None',notes:'',
    lines:[],line:expBlankLine()};
  expModalOpen=true;
  renderADTPage();
}
function cancelAddExpense(){expModalOpen=false;expDraft=null;renderADTPage();}
/* The popup keeps the item being typed on expDraft.line; expSyncLine/expLineFieldsHTML
   work on expDraft, so they are pointed at the line while it is read or drawn. */
function expWithLine(fn){
  const claim=expDraft;expDraft=claim.line;
  try{return fn();}finally{claim.line=expDraft;expDraft=claim;}
}
/* Has anything been typed into the item form? An untouched form is not an item. */
function expLineTouched(l){return !!(l.title||l.amount||l.subCat||l.start||l.end||l.proof||l.comments);}
function expAddModalLine(){
  expSyncBasic();expSyncLine();
  const d=expDraft;
  if(!d.category){showToast('Pick the Expense Category first','error','Sub categories come from the category.');return;}
  if(!expWithLine(function(){return expCheckLine(d.line,d.category);}))return;
  d.lines.push(Object.assign({},d.line,{cols:Object.assign({},d.line.cols)}));
  d.line=expBlankLine();
  expRepaintForm();
}
function expRemoveModalLine(i){expSyncBasic();expSyncLine();expDraft.lines.splice(i,1);expRepaintForm();}
function expModalLinesHTML(d){
  if(!d.lines.length)return '';
  return d.lines.map(function(l,i){
    const fits=(EXP_SUBCATS[d.category]||[]).indexOf(l.subCat)>=0;
    return '<div class="exp-line exp-mline">'
      +'<div class="exp-line-hd"><span class="exp-line-n">'+(i+1)+'</span>'
      +'<div class="exp-line-ttl"><div class="exp-line-name">'+l.title+'</div>'
      +'<div class="exp-line-amt">'+expMoney(l.amount,d.currency)+' · '+l.subCat+' · '+cdLabel(l.start)
        +(l.end&&l.end!==l.start?' – '+cdLabel(l.end):'')+(l.proof?' · '+l.proof:'')+'</div>'
      +(fits?'':'<div class="ea-hint exp-cap-over">'+l.subCat+' is not a sub category of '+d.category+' - remove and add again.</div>')
      +'</div>'
      +'<button type="button" class="att-row-btn is-danger" onclick="expRemoveModalLine('+i+')" title="Remove item">'+AX_ICO.trash+'</button>'
      +'</div></div>';
  }).join('');
}
function buildAddExpenseModalHTML(){
  const d=expDraft;
  const lineFields=expWithLine(function(){return expLineFieldsHTML(d.currency,d.category);});
  const n=d.lines.length;
  return '<div class="ct-modal-overlay">'
    +'<div class="ct-modal ct-modal--form ax-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Add Expense</span>'
      +'<button class="ct-modal-close" onclick="cancelAddExpense()">'+AX_ICO.x+'</button></div>'
    +'<p class="ct-modal-sub">File an expense claim and the items it is made of. The claim&rsquo;s dates and total are read off its items. Fields marked <span class="req">*</span> are required.</p>'
    +'<div class="exp-modal-sec">Claim</div>'
    +'<div class="ep-form-grid" id="exp-m-claim">'+expBasicFieldsHTML()+'</div>'
    +'<div id="exp-m-items">'
    +'<div class="exp-modal-sec">Expense Items'+(n?' <span class="ax-count">'+n+'</span>':'')+'</div>'
    +expModalLinesHTML(d)
    +'<div class="exp-line is-editing"><div class="exp-line-hd"><div class="exp-line-ttl"><div class="exp-line-name">'
      +(n?'Item '+(n+1):'Item 1')+'</div></div></div>'
      +'<div class="ep-form-grid">'+lineFields+'</div>'
      +'<div class="exp-mline-add"><button type="button" class="btn-outline btn-sm" onclick="expAddModalLine()">'+AX_ICO.plus+' Add Expense Item</button></div>'
    +'</div></div>'
    +'<div class="ct-modal-foot"><div class="ct-modal-btns">'
      +'<button class="ep-cancel-btn" onclick="cancelAddExpense()">Cancel</button>'
      +'<button class="btn-outline" onclick="submitAddExpense(false)">Save as Draft</button>'
      +'<button class="ep-save-btn" onclick="submitAddExpense(true)">Submit to Claim</button>'
    +'</div></div>'
    +'</div></div>';
}
/* REPAINT THE FORM, NOT THE PAGE. A pick in the form (employee, category,
   currency, a proof, an item added) changes what the form shows - the
   capping hint, the sub categories - and nothing else on screen. Repainting
   the whole page for it replayed the page's entrance and dropped the form
   back to its top. So only the named parts of the open form are swapped, and
   every scroll position is put back as it was. */
function formRepaintParts(html,ids){
  const keep=[].filter.call(document.querySelectorAll('.ct-modal--form, .ct-modal-overlay, #adt-content, .page-content'),
    function(e){return e.scrollTop>0;}).map(function(e){return [e,e.scrollTop];});
  const winY=window.scrollY;
  const tmp=document.createElement('div');tmp.innerHTML=html;
  let done=0;
  ids.forEach(function(id){
    const live=document.getElementById(id),next=tmp.querySelector('#'+id);
    if(live&&next){live.innerHTML=next.innerHTML;done++;}
  });
  keep.forEach(function(k){k[0].scrollTop=k[1];});
  if(window.scrollY!==winY)window.scrollTo(0,winY);
  return done===ids.length;
}
function expRepaintForm(){
  if(expModalOpen&&formRepaintParts(buildAddExpenseModalHTML(),['exp-m-claim','exp-m-items']))return;
  renderADTPage();
}
/* The popup's own repaints (employee, category, proof) read both halves first. */
const _expSyncLineInner=expSyncLine;
expSyncLine=function(){
  if(expModalOpen&&expDraft&&expDraft.line)return expWithLine(_expSyncLineInner);
  return _expSyncLineInner();
};
function submitAddExpense(submit){
  expSyncBasic();expSyncLine();
  const d=expDraft;
  if(!expCheckBasic(d))return;
  const items=d.lines.slice();
  /* The form counts as an item when something is typed in it, or when it is the only one. */
  if(expLineTouched(d.line)||!items.length){
    if(!expWithLine(function(){return expCheckLine(d.line,d.category);}))return;
    items.push(d.line);
  }
  const bad=items.find(function(l){return (EXP_SUBCATS[d.category]||[]).indexOf(l.subCat)<0;});
  if(bad){showToast('Sub categories no longer fit','error','"'+bad.title+'" uses '+bad.subCat+', which is not a sub category of '+d.category+'.');return;}
  const p=expPerson(d.name);
  const s=stampNow();
  const r={id:expNextId++,key:expNextKey++,title:d.title,claimFor:d.claimFor,name:d.name,empId:p?p.empId:'',email:p?p.email:'',
    category:d.category,currency:d.currency,appType:d.appType,travelMode:d.travelMode,notes:d.notes,
    status:submit?'Awaiting Approval':'Draft',appliedOn:axToday(),reimbursedOn:'',createdBy:CURRENT_USER,createdAt:axStamp(),
    lines:items.map(function(l,i){return {id:i+1,title:l.title,amount:parseFloat(l.amount),subCat:l.subCat,start:l.start,end:l.end||l.start,
      proof:l.proof,proofUrl:l.proofUrl,comments:l.comments,cols:Object.assign({},l.cols),status:'Pending'};})};
  const nItems=r.lines.length+' line item'+(r.lines.length===1?'':'s');
  r.logs=[{date:s.date,time:s.time,user:CURRENT_USER,status:r.status,
    action:submit?'Submitted for approval with '+nItems+'.':'Saved as draft with '+nItems+'.'}];
  expensesData.unshift(r);
  lpLanded('expenses',r.id);
  expModalOpen=false;expDraft=null;
  renderADTPage();
  showToast(submit?'Expense submitted':'Draft saved','success',expKey(r)+' · '+expMoney(expTotal(r),r.currency)+(submit?' is awaiting approval.':''));
}

/* ── Wiring ────────────────────────────────────────────────────────────── */
Object.assign(supportPageMeta,{'expenses':{title:'Expenses',context:'Expenses',filters:[],columns:[],rows:[]}});
if(typeof LP_ROW_PREFIX!=='undefined')LP_ROW_PREFIX['expenses']='exp';
/* Awaiting Approval: someone owes a decision. Reimbursed: paid, done. */
Object.assign(SB_STATUS_TONE,{'awaiting-approval':'wait',reimbursed:'ok'});
sbDraftReg('exp',{
  dirty:function(){
    if(!expEditing()||expModalOpen)return false;
    if(expEditBasic)expSyncBasic();else expSyncLine();
    return JSON.stringify(expDraft)!==expDraftOrig;
  },
  drop:expDropEdit});
