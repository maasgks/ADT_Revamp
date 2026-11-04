/* ══ CAPPING LIMIT ══════════════════════════════════════════════════════════
   Time & Pay → Expense Management → Capping Limit. The most a claim in one
   expense category may come to, for a department, a position, or everyone.

   Built from the same parts as Expenses (js/expenses.js): lpSearchField + apCS
   filters with listing-stats tiles, an .lp-table in an .lp-split-wrap, the
   .lp-isb-* panel behind the row action (sbHero, axField, lpLogsView,
   wfTimelineHTML, sbHistoryHTML) and a .ct-modal--form popup for + Add.

   THE OLD FILTERS, FOLDED. Name and Capping Id were two inputs for things a
   person TYPES - one search box. Capping Level and Category are picked, so
   they stay dropdowns. Net Amount (an exact-amount match nobody searches by)
   and Currency are on the row and in the panel, not in the bar. Status is the
   tiles, as on every listing.

   ONE FIELD DECIDES THE REST. The old form showed Department, Position and
   Employee whatever the Type said. Here Type (the level) decides what the
   limit is pinned to: a Department limit needs its department, a Position
   limit its position; a field the level does not use is dimmed with a hint
   saying why, never silently ignored.

   CATEGORIES ARE THE EXPENSE CATEGORIES (EXP_CATEGORIES), so a limit can only
   be set on something an employee can actually claim. */

/* ── Reference data ────────────────────────────────────────────────────── */
const CAP_LEVELS=['Category','Department','Position'];
const CAP_TILES=['Active','Inactive'];
/* Deleted is a move, not a tile: a deleted limit leaves the listing. */
const CAP_MOVES={'Active':['Inactive','Deleted'],'Inactive':['Active','Deleted'],'Deleted':[]};
const CAP_MOVE_LABELS={'Active':'Reactivate','Inactive':'Deactivate','Deleted':'Delete'};
const CAP_LEVEL_HINT={
  'Category':'Applies to every claim in the category.',
  'Department':'Applies to everyone in the department.',
  'Position':'Applies to everyone in the position.'
};
function capDepts(){return typeof AX_DEPTS!=='undefined'?AX_DEPTS:['Engineering','Finance','HR','Operations','Sales','Admin'];}
function capPositions(){return typeof EA_DESIGNATIONS!=='undefined'?EA_DESIGNATIONS:['Business Analyst'];}
function capCategories(){return typeof EXP_CATEGORIES!=='undefined'?EXP_CATEGORIES:[];}
function capCurrencies(){return typeof EXP_CURRENCIES!=='undefined'?EXP_CURRENCIES:['INR','USD','EUR','GBP','AED'];}
function capPeople(){return typeof expPeople==='function'?expPeople().map(function(p){return p.name;}):[];}

/* ── Seed data (the old screen's rows) ─────────────────────────────────── */
function capSeed(id,key,name,level,category,dept,position,employee,currency,amount,status,by,at,desc){
  return {id:id,key:key,name:name,level:level,category:category,dept:dept||'',position:position||'',employee:employee||'',
    currency:currency,amount:amount,status:status,createdBy:by,createdAt:at,desc:desc||''};
}
const cappingData=[
  capSeed(1,20,'TEST TEAM PARTY SHIV','Department','Meals','Engineering','','','INR',150000,'Active','Tarak Swain','12 Mar 2026 | 11:20:05 AM','TEAM OUTING'),
  capSeed(2,19,'TEST SHIV','Department','Travel Reimbursement','Finance','','','INR',100000,'Active','Tarak Swain','10 Mar 2026 | 04:02:41 PM',''),
  capSeed(3,18,'TEST TRAVEL','Department','Travel Reimbursement','Sales','','','INR',5000,'Active','Tarak Swain','2 Mar 2026 | 10:15:30 AM','Local travel for field sales.'),
  capSeed(4,17,'test SHIV','Department','Accommodation','HR','','','INR',10000,'Active','Tarak Swain','24 Feb 2026 | 12:40:00 PM',''),
  capSeed(5,16,'shiv test','Department','Office Supplies','Operations','','','INR',50000,'Active','Tarak Swain','20 Feb 2026 | 09:55:12 AM',''),
  capSeed(6,15,'test','Department','Internet and Phone','Admin','','','INR',2000,'Active','Tarak Swain','18 Feb 2026 | 03:11:48 PM',''),
  capSeed(7,14,'Asst Bearer Meal','Position','Meals','','Support Specialist','','INR',2500,'Active','Syed Ayaz','5 Feb 2026 | 01:05:00 PM','Daily meal allowance on shift.'),
  capSeed(8,13,'House keeping Travelling','Department','Travel Reimbursement','Operations','','','INR',2000,'Active','Syed Ayaz','28 Jan 2026 | 10:30:00 AM',''),
  capSeed(9,12,'Client meal - global','Category','Meals','','','','USD',150,'Inactive','Meera Iyer','14 Jan 2026 | 05:45:20 PM','Replaced by department-level meal limits.'),
  capSeed(10,11,'Senior developer broadband','Position','Internet and Phone','Engineering','Senior Developer','','INR',1500,'Active','Meera Iyer','8 Jan 2026 | 11:00:00 AM','Monthly home broadband.')
];
let capNextId=11,capNextKey=21;

/* ── Derived values ────────────────────────────────────────────────────── */
function capRec(id){return cappingData.find(function(x){return x.id===id;})||null;}
function capKey(r){return 'CAP-'+r.key;}
function capMoney(r){return (Number(r.amount)||0).toLocaleString('en-IN',{maximumFractionDigits:2})+' '+r.currency;}
/* What the limit is pinned to, in one phrase: the listing's "Applies To". */
function capTarget(r){
  if(r.level==='Department')return r.dept;
  if(r.level==='Position')return r.position+(r.dept?' · '+r.dept:'');
  return 'Everyone';
}

const CAP_ICO={
  hero:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
  layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
};

/* ── State ─────────────────────────────────────────────────────────────── */
let capSelectedId=null,capTab='basic-details';
let capLevelF='',capCatF='',capStatusF='',capQ='';
let capEditing=false,capDraft=null,capDraftOrig='',capModalOpen=false;

/* ── Filters ───────────────────────────────────────────────────────────── */
function capRows(){
  return cappingData.filter(function(r){
    if(r.status==='Deleted')return false;
    if(capLevelF&&r.level!==capLevelF)return false;
    if(capCatF&&r.category!==capCatF)return false;
    if(capStatusF&&r.status!==capStatusF)return false;
    return true;
  });
}
function capToggleStat(v){capStatusF=capStatusF===v?'':v;capSelectedId=null;renderADTPage();}
function applyCapFilters(){
  const pick=function(id,all){const v=getCSValue(id);return v&&v!==all?v:'';};
  capLevelF=pick('cap-f-level','All Levels');
  capCatF=pick('cap-f-cat','All Categories');
  capQ=lpSearchValue('cap-f-q');
  capSelectedId=null;renderADTPage();
}
function resetCapFilters(){capLevelF='';capCatF='';capStatusF='';capQ='';capSelectedId=null;renderADTPage();}

/* ── Detail panel ──────────────────────────────────────────────────────── */
function capDropEdit(){capEditing=false;capDraft=null;}
function openCapSidebar(id,tab){
  if(capSelectedId!=null&&capSelectedId!==id&&sbLeaveGuard('cap',function(){openCapSidebar(id,tab);}))return;
  if(capSelectedId!==id)capDropEdit();
  capTab=tab||sbKeepTab(capSelectedId,capTab);capSelectedId=id;
  const sb=document.getElementById('cap-split-sb');if(sb)sb.classList.add('open');
  isbTab('cap',renderCapSidebar);
  document.querySelectorAll('.cap-row').forEach(function(r){r.classList.toggle('lp-row-selected',r.id==='cap-row-'+id);});
}
function closeCapSidebar(){
  if(sbLeaveGuard('cap',closeCapSidebar))return;
  capDropEdit();capSelectedId=null;
  const sb=document.getElementById('cap-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.cap-row').forEach(function(r){r.classList.remove('lp-row-selected');});
}
function navCapTab(t){if(capEditing&&!sbHasDraft('cap'))capDropEdit();capTab=t;isbTab('cap',renderCapSidebar);}

/* Logs: seeded once from the record, then only ever added to. */
function capSeedLogs(r){
  const p=String(r.createdAt).split(' | ');
  const fx=[{date:p[0],time:p[1]||'09:00:00 AM',user:r.createdBy,status:'Active',action:'Capping limit created at '+capMoney(r)+'.'}];
  if(r.status==='Inactive')fx.unshift({date:p[0],time:'06:00:00 PM',user:'Shaun Test1',status:'Inactive',action:r.desc||'No longer in use.'});
  return seedLogs(r,fx);
}
const CAP_STEP_TITLE={'Active':'Limit Active','Inactive':'Limit Deactivated','Deleted':'Limit Deleted'};
function capWorkflow(r){
  const done=wfDoneFromLogs(capSeedLogs(r),function(st){return CAP_STEP_TITLE[st]||st;});
  const LEFT={'Inactive':[{title:'Reactivate or Delete',owner:'Finance Admin'}]};
  return wfPlan(done,LEFT[r.status]||[]);
}

function renderCapSidebar(){
  const r=capRec(capSelectedId);if(!r)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'logs',label:'Logs'},{id:'history',label:'History'},{id:'workflow',label:'Workflow'}];
  const tabBar=axTabBar('cap',tabs,capTab,'navCapTab','closeCapSidebar');
  const hero=function(editing,edit){return sbHero({icon:CAP_ICO.hero,name:r.name,meta:[capKey(r),r.level+' level',r.category],
    status:axBadge(statusTone(r.status),r.status),editing:editing,onEdit:edit});};
  let body='';
  if(capTab==='basic-details'&&capEditing){
    body=hero(true)+axInlineFormHTML(capFieldsHTML(),'capCancelEdit()','capSaveEdit()');
  }else if(capTab==='basic-details'){
    body=hero(false,'capStartEdit()')
      +'<div class="lp-sb-detail-grid">'
      +axField(AX_ICO.fTag,'Name',r.name)
      +axField(CAP_ICO.layers,'Type',r.level+' <span class="ax-sub">'+CAP_LEVEL_HINT[r.level]+'</span>')
      +axField(AX_ICO.fBox,'Category',r.category)
      +axField(AX_ICO.fCash,'Amount Limit',capMoney(r))
      +axField(AX_ICO.fCash,'Currency',r.currency)
      +axField(AX_ICO.fBuild,'Department',r.dept||(r.level==='Position'?'Every department':''))
      +axField(AX_ICO.fUser,'Position',r.position)
      +axField(AX_ICO.fUser,'Individual',r.employee||'Not set for one employee')
      +axField(AX_ICO.fUser,'Created By',r.createdBy)
      +axField(AX_ICO.fCal,'Created On',String(r.createdAt).split(' | ')[0])
      +axField(CAP_ICO.note,'Description',r.desc,true)
      +'</div>';
  }else if(capTab==='logs'){
    const moves=CAP_MOVES[r.status]||[];
    body=lpLogsView(capSeedLogs(r),capLogFormHTML(r,moves),{labels:CAP_MOVE_LABELS});
  }else if(capTab==='history'){
    body=sbHistoryHTML(r);
  }else{
    body=wfTimelineHTML(capWorkflow(r));
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
function capLogFormHTML(r,moves){
  return '<div class="lp-logs-form">'
    +'<div class="lp-logs-form-header"><span class="lp-log-dot"></span>'+r.status+'</div>'
    +'<p class="lp-logs-form-sub">Activate, deactivate or delete this limit and say why</p>'
    +lpLogStatusField('cap-log-status-sel',r.status,[r.status].concat(moves))
    +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
    +'<textarea class="lp-logs-form-textarea" id="cap-log-comment-inp" placeholder="Enter comment"></textarea>'
    +'<div style="display:flex;gap:10px;margin-top:12px">'
    +'<button class="ep-cancel-btn" style="flex:1" onclick="navCapTab(\'logs\')">Cancel</button>'
    +'<button class="lp-logs-save-btn" style="flex:1" onclick="capSaveLog('+r.id+')">Submit</button>'
    +'</div></div>';
}
function capSaveLog(id){
  const r=capRec(id);if(!r)return;
  capSeedLogs(r);
  if(!lpCommitLog(r,'cap-log-status-sel','cap-log-comment-inp',r.logs))return;
  if(r.status==='Deleted'){
    capDropEdit();capSelectedId=null;renderADTPage();
    showToast('Capping limit deleted','success',capKey(r)+' · '+r.name+' no longer applies.');return;
  }
  renderADTPage();
  showToast('Log added','success',capKey(r)+' is now '+r.status+'.');
}

/* ── The form: panel Edit and the + Add popup share it ─────────────────── */
function capStartEdit(){
  const r=capRec(capSelectedId);if(!r)return;
  capEditing=true;capTab='basic-details';
  capDraft={name:r.name,level:r.level,category:r.category,dept:r.dept,position:r.position,employee:r.employee,
    currency:r.currency,amount:String(r.amount),desc:r.desc};
  capDraftOrig=JSON.stringify(capDraft);
  renderADTPage();
}
function capCancelEdit(){capDropEdit();renderADTPage();}
function capSync(){
  if(!capDraft)return;
  [['name','cap-e-name'],['amount','cap-e-amt'],['desc','cap-e-desc']].forEach(function(p){const el=document.getElementById(p[1]);if(el)capDraft[p[0]]=el.value.trim();});
  [['level','cap-e-level'],['category','cap-e-cat'],['dept','cap-e-dept'],['position','cap-e-pos'],['employee','cap-e-emp'],['currency','cap-e-cur']]
    .forEach(function(p){if(document.getElementById('csw-'+p[1]))capDraft[p[0]]=getCSValue(p[1]);});
}
/* Type decides which fields apply, so changing it repaints the form. */
function capFormHook(){capSync();renderADTPage();}
function capFieldsHTML(){
  const d=capDraft;
  const lv=d.level;
  const deptOn=lv==='Department'||lv==='Position';
  const posOn=lv==='Position';
  const sel=function(id,label,opts,val,ph,req,hook){
    return '<div class="ep-form-group"><label class="ep-form-label">'+label+(req?' <span class="req">*</span>':'')+'</label>'+apCS(id,opts,val,ph,hook)+'</div>';
  };
  const dim=function(on,inner,why){return '<div class="ep-form-group'+(on?'':' exp-dim')+'">'+inner+(on?'':'<div class="ea-hint">'+why+'</div>')+'</div>';};
  return '<div class="ep-form-group ep-form-full"><label class="ep-form-label" for="cap-e-name">Name <span class="req">*</span></label>'
      +'<input class="ep-form-input" id="cap-e-name" value="'+attrSafe(d.name)+'" placeholder="e.g. Sales team travel"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Type <span class="req">*</span></label>'
      +apCS('cap-e-level',CAP_LEVELS,lv,'Select Type','capFormHook')
      +(lv?'<div class="ea-hint">'+CAP_LEVEL_HINT[lv]+'</div>':'')+'</div>'
    +sel('cap-e-cat','Category',capCategories(),d.category,'Select Category',true)
    +dim(deptOn,'<label class="ep-form-label">Department'+(lv==='Department'?' <span class="req">*</span>':'')+'</label>'
      +apCS('cap-e-dept',capDepts(),deptOn?d.dept:'',lv==='Position'?'Every department':'Select Department'),
      lv?'Not used for a '+lv+'-level limit.':'Pick a Type first.')
    +dim(posOn,'<label class="ep-form-label">Position'+(posOn?' <span class="req">*</span>':'')+'</label>'
      +axCS('cap-e-pos',capPositions(),posOn?d.position:'','Search Position'),
      lv?'Only for a Position-level limit.':'Pick a Type first.')
    +'<div class="ep-form-group"><label class="ep-form-label">Employee</label>'
      +axCS('cap-e-emp',capPeople(),d.employee,'Search Employee')
      +'<div class="ea-hint">Leave empty to apply to everyone at this level.</div></div>'
    +sel('cap-e-cur','Base Currency',capCurrencies(),d.currency,'Select Currency',true)
    +'<div class="ep-form-group"><label class="ep-form-label" for="cap-e-amt">Amount Limit <span class="req">*</span></label>'
      +'<div class="ax-currency"><span>'+(d.currency||'—')+'</span><input class="ep-form-input" id="cap-e-amt" type="number" min="0" step="0.01" value="'+attrSafe(d.amount)+'" placeholder="0.00"></div></div>'
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label" for="cap-e-desc">Description</label>'
      +'<textarea class="ep-form-input ax-notes" id="cap-e-desc" placeholder="What this limit covers">'+attrSafe(d.desc||'')+'</textarea></div>';
}
function capCheck(d,selfId){
  const need=[['name','Name'],['level','Type'],['category','Category'],['currency','Base Currency'],['amount','Amount Limit']];
  if(d.level==='Department')need.push(['dept','Department']);
  if(d.level==='Position')need.push(['position','Position']);
  for(let i=0;i<need.length;i++){if(!String(d[need[i][0]]||'').trim()){showToast(need[i][1]+' is required','error');return false;}}
  const n=parseFloat(d.amount);
  if(isNaN(n)||n<=0){showToast('Amount Limit must be more than 0','error');return false;}
  /* What the level does not use is cleared, so the record says only what applies. */
  if(d.level==='Category'){d.dept='';d.position='';}
  if(d.level==='Department')d.position='';
  /* Two live limits on the same thing would leave the approver guessing which wins. */
  const twin=cappingData.find(function(x){
    return x.id!==selfId&&x.status==='Active'&&x.level===d.level&&x.category===d.category&&x.dept===d.dept
      &&x.position===d.position&&x.employee===(d.employee||'');
  });
  if(twin){showToast('A limit already covers this','error',capKey(twin)+' · '+twin.name+' is active for the same '+d.level.toLowerCase()+' and category.');return false;}
  return true;
}
function capSaveEdit(){
  const r=capRec(capSelectedId);if(!r||!capDraft)return;
  capSync();
  const d=capDraft;
  if(!capCheck(d,r.id))return;
  Object.assign(r,{name:d.name,level:d.level,category:d.category,dept:d.dept,position:d.position,employee:d.employee||'',
    currency:d.currency,amount:parseFloat(d.amount),desc:d.desc});
  capDropEdit();
  renderADTPage();
  showToast('Capping limit updated','success',capKey(r)+' saved.');
}

/* ── + Add ─────────────────────────────────────────────────────────────── */
function startAddCap(){
  if(page!=='capping-limit')navigatePage('capping-limit');
  capDropEdit();
  capDraft={name:'',level:'',category:'',dept:'',position:'',employee:'',currency:'INR',amount:'',desc:''};
  capModalOpen=true;
  renderADTPage();
}
function cancelAddCap(){capModalOpen=false;capDraft=null;renderADTPage();}
function buildAddCapModalHTML(){
  return '<div class="ct-modal-overlay">'
    +'<div class="ct-modal ct-modal--form ax-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Add Capping Limit</span>'
      +'<button class="ct-modal-close" onclick="cancelAddCap()">'+AX_ICO.x+'</button></div>'
    +'<p class="ct-modal-sub">Set the most a claim in one expense category may come to. Type decides who it applies to. Fields marked <span class="req">*</span> are required.</p>'
    +'<div class="ep-form-grid">'+capFieldsHTML()+'</div>'
    +'<div class="ct-modal-foot"><div class="ct-modal-btns">'
      +'<button class="ep-cancel-btn" onclick="cancelAddCap()">Cancel</button>'
      +'<button class="ep-save-btn" onclick="submitAddCap()">Add Capping Limit</button>'
    +'</div></div>'
    +'</div></div>';
}
function submitAddCap(){
  capSync();
  const d=capDraft;
  if(!capCheck(d,null))return;
  const s=stampNow();
  const r=capSeed(capNextId++,capNextKey++,d.name,d.level,d.category,d.dept,d.position,d.employee,d.currency,parseFloat(d.amount),
    'Active',CURRENT_USER,axStamp(),d.desc);
  r.logs=[{date:s.date,time:s.time,user:CURRENT_USER,status:'Active',action:'Capping limit created at '+capMoney(r)+'.'}];
  cappingData.unshift(r);
  lpLanded('capping-limit',r.id);
  capModalOpen=false;capDraft=null;
  renderADTPage();
  showToast('Capping limit added','success',capKey(r)+' · '+capMoney(r)+' for '+r.category+'.');
}

/* ── Listing ───────────────────────────────────────────────────────────── */
function buildCappingLimitHTML(){
  const live=cappingData.filter(function(r){return r.status!=='Deleted';});
  const count=function(s){return live.filter(function(r){return r.status===s;}).length;};
  const shown=lpSearchRows(capRows(),capQ);
  if(capSelectedId&&!shown.some(function(r){return r.id===capSelectedId;}))capSelectedId=null;
  const pgn=listPage('capping-limit',[capLevelF,capCatF,capStatusF,capQ].join('|'),shown.map(function(r,i){
    /* Key rides under the name; Currency is on the amount. Created By,
       Employee and Description are in the panel. */
    return '<tr class="cap-row'+(capSelectedId===r.id?' lp-row-selected':'')+'" id="cap-row-'+r.id+'" style="cursor:pointer" onclick="openCapSidebar('+r.id+')">'
      +'<td class="lp-c-n">'+(i+1)+'</td>'
      +'<td><div class="lp-c-main ax-c-link ax-c-trunc" title="'+attrSafe(r.name)+'">'+r.name+'</div><div class="lp-c-sub">'+capKey(r)+'</div></td>'
      +'<td><div class="lp-c-plain">'+r.level+'</div><div class="lp-c-sub ax-c-trunc" title="'+attrSafe(capTarget(r))+'">'+capTarget(r)+(r.employee?' · '+r.employee:'')+'</div></td>'
      +'<td><div class="lp-c-plain ax-c-trunc" title="'+attrSafe(r.category)+'">'+r.category+'</div></td>'
      +'<td class="cap-c-amt"><div class="lp-c-plain">'+capMoney(r)+'</div></td>'
      +'<td>'+axBadge(statusTone(r.status),r.status)+'</td>'
      +'<td onclick="event.stopPropagation()"><button class="lp-action-btn" onclick="openCapSidebar('+r.id+')" title="View Details">'+AX_ICO.dots+'</button></td>'
      +'</tr>';
  }),'<tr><td colspan="7" style="padding:24px;text-align:center;color:var(--gray)">No capping limits match this filter.</td></tr>');
  const stat=function(s){
    return '<div class="listing-stat'+(capStatusF===s?' stat-selected':'')+'" onclick="capToggleStat(\''+s+'\')">'
      +'<div class="listing-stat-count" style="color:var(--st-'+statusTone(s)+'-fg)">'+count(s)+'</div><div class="listing-stat-label">'+s+'</div></div>';
  };
  return '<div class="lp-page">'
    +dashboardBackHTML()
    +'<div class="exp-top cap-top" style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:4px">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0">'
    +'<div class="lp-filter-bar-label exp-f-label">Select Filter'+clearFiltersBtn([capLevelF,capCatF,capStatusF,capQ],'resetCapFilters()')+'</div>'
    +'<div class="lp-filter-bar-row">'
    +lpSearchField('cap-f-q',capQ,'Search limits','applyCapFilters()')
    +apCS('cap-f-level',CAP_LEVELS,capLevelF,'All Levels')
    +apCS('cap-f-cat',capCategories(),capCatF,'All Categories')
    +'<button class="lp-pill-search" onclick="applyCapFilters()">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats">'+CAP_TILES.map(stat).join('')+'</div></div>'
    +'<div class="lp-split-wrap ax-split-wrap" style="margin-top:14px" id="cap-split-wrap"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table ax-table cap-table"><thead><tr><th>S. No</th><th>Capping Limit</th><th>Applies To</th><th>Category</th>'
      +'<th>Amount Limit</th><th>Status</th><th>Action</th></tr></thead>'
    +'<tbody>'+pgn.rows+'</tbody></table>'
    +pgn.pager
    +'</div></div>'
    +'<div class="lp-split-sb'+(capSelectedId?' open':'')+'" id="cap-split-sb"><div class="lp-isb" id="cap-isb-inner">'+(capSelectedId?sbRender(renderCapSidebar,'cap'):'')+'</div></div>'
    +'</div></div>'
    +(capModalOpen?buildAddCapModalHTML():'');
}

/* ── Wiring ────────────────────────────────────────────────────────────── */
Object.assign(supportPageMeta,{'capping-limit':{title:'Capping Limit',context:'Capping Limit',filters:[],columns:[],rows:[]}});
if(typeof LP_ROW_PREFIX!=='undefined')LP_ROW_PREFIX['capping-limit']='cap';
Object.assign(SB_STATUS_TONE,{deleted:'bad'});
sbDraftReg('cap',{
  dirty:function(){
    if(!capEditing||capModalOpen)return false;
    capSync();
    return JSON.stringify(capDraft)!==capDraftOrig;
  },
  drop:capDropEdit});
