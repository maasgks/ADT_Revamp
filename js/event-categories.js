/* ══ EVENT CATEGORIES & SUB CATEGORIES ══════════════════════════════════════
   Governance → Events → Categories and Sub Categories. What an event is filed
   under (js/events.js).

   TWO PAGES, ONE MODULE. A category and a sub category are the same record
   apart from the sub category's parent, so one set of functions serves both,
   told which by `k` ('cat' or 'sub'). The onclick wrappers at the end of this
   file give each page the plain function names the shared parts expect.

   Built from the same parts as Capping Limit (js/capping-limit.js): the
   standard listing, panel, Logs and + Add form.

   EVENTS POINT AT THESE BY ID, so renaming a category renames it on every
   event. Delete is offered only when nothing uses the record: a category
   needs its sub categories and events moved first, a sub category its events.
   The Logs form says what is still in the way.

   ANNOUNCEMENT IS A CATEGORY. Its sub categories are what an announcement is
   filed under (General, Holiday, Payroll...), and picking it on the Add Event
   form turns the form into the announcement form (js/announcement-admin.js).
   The category carries anm:true, so a rename does not break that. Its rows
   count announcements, not events, and an announcement is held by its sub
   category's name, so a rename reaches every announcement filed there. */

/* ── Seed data ─────────────────────────────────────────────────────────── */
function ecSeed(id,name,desc,status,by,at,catId){
  return {id:id,key:id,name:name,desc:desc||'',status:status,createdBy:by,createdAt:at,catId:catId||null};
}
const eventCategoriesData=[
  Object.assign(ecSeed(6,'Announcement','Notices posted to the employee dashboard for an audience and a window of dates.','Active','Priya Sharma','1 Oct 2026 | 09:00:00 AM'),{anm:true}),
  ecSeed(5,'Promotional','Offers and announcements sent to a chosen audience.','Inactive','Meera Iyer','3 Mar 2026 | 09:15:00 AM'),
  ecSeed(4,'Payroll Flow','Timesheets, payslips and pay runs.','Active','Meera Iyer','8 Jan 2026 | 11:00:00 AM'),
  ecSeed(3,'Compliance Flow','Reminders and checks that keep an entity compliant.','Active','Syed Ayaz','18 Aug 2023 | 03:11:00 PM'),
  ecSeed(2,'Admin Core Flow','What the admin team is told as a deal or record moves.','Active','Tarak Swain','2 Jan 2023 | 10:30:00 AM'),
  ecSeed(1,'Core Flow','What users and vendors are told as they move through ADT.','Active','Tarak Swain','2 Jan 2023 | 10:00:00 AM')
];
const eventSubCategoriesData=[
  ecSeed(21,'Portal Update','','Active','Priya Sharma','1 Oct 2026 | 09:20:00 AM',6),
  ecSeed(20,'Event','','Active','Priya Sharma','1 Oct 2026 | 09:19:00 AM',6),
  ecSeed(19,'Training','','Active','Priya Sharma','1 Oct 2026 | 09:18:00 AM',6),
  ecSeed(18,'Benefits','','Active','Priya Sharma','1 Oct 2026 | 09:17:00 AM',6),
  ecSeed(17,'Compliance','','Active','Priya Sharma','1 Oct 2026 | 09:16:00 AM',6),
  ecSeed(16,'Policy','','Active','Priya Sharma','1 Oct 2026 | 09:15:00 AM',6),
  ecSeed(15,'Leave & Attendance','','Active','Priya Sharma','1 Oct 2026 | 09:14:00 AM',6),
  ecSeed(14,'Payroll','','Active','Priya Sharma','1 Oct 2026 | 09:13:00 AM',6),
  ecSeed(13,'Holiday','','Active','Priya Sharma','1 Oct 2026 | 09:12:00 AM',6),
  ecSeed(12,'HR Update','','Active','Priya Sharma','1 Oct 2026 | 09:11:00 AM',6),
  ecSeed(11,'General','','Active','Priya Sharma','1 Oct 2026 | 09:10:00 AM',6),
  ecSeed(10,'Campaigns','One-off campaigns.','Inactive','Meera Iyer','3 Mar 2026 | 09:30:00 AM',5),
  ecSeed(9,'Payslips','','Active','Meera Iyer','8 Jan 2026 | 11:30:00 AM',4),
  ecSeed(8,'Timesheets','','Active','Meera Iyer','8 Jan 2026 | 11:20:00 AM',4),
  ecSeed(7,'Reminders','','Active','Syed Ayaz','18 Aug 2023 | 03:20:00 PM',3),
  ecSeed(6,'Contracts','MSA and agreement templates.','Active','Tarak Swain','2 Jan 2023 | 11:00:00 AM',2),
  ecSeed(5,'Testing','','Active','Tarak Swain','2 Jan 2023 | 10:55:00 AM',2),
  ecSeed(4,'Documents','','Active','Tarak Swain','2 Jan 2023 | 10:50:00 AM',2),
  ecSeed(3,'Deal Log','','Active','Tarak Swain','2 Jan 2023 | 10:45:00 AM',2),
  ecSeed(2,'Salary','','Active','Tarak Swain','2 Jan 2023 | 10:20:00 AM',1),
  ecSeed(1,'Onboarding','','Active','Tarak Swain','2 Jan 2023 | 10:10:00 AM',1)
];

const EC_KIND={
  cat:{pre:'ecat',page:'event-categories',data:eventCategoriesData,noun:'Category',low:'category',code:'CAT',next:7,hero:'tag',
    apply:'applyEcatFilters',reset:'resetEcatFilters',stat:'ecatToggleStat',open:'openEcatSidebar',close:'closeEcatSidebar',nav:'navEcatTab'},
  sub:{pre:'esub',page:'event-sub-categories',data:eventSubCategoriesData,noun:'Sub Category',low:'sub category',code:'SUB',next:22,hero:'tags',
    apply:'applyEsubFilters',reset:'resetEsubFilters',stat:'esubToggleStat',open:'openEsubSidebar',close:'closeEsubSidebar',nav:'navEsubTab'}
};
const EC_TILES=['Active','Inactive'];
const EC_MOVES={'Active':['Inactive','Deleted'],'Inactive':['Active','Deleted'],'Deleted':[]};
const EC_MOVE_LABELS={'Active':'Mark Active','Inactive':'Mark Inactive','Deleted':'Delete'};

/* ── State ─────────────────────────────────────────────────────────────── */
function ecFresh(){return {sel:null,tab:'basic-details',q:'',statusF:'',catF:'',editing:false,draft:null,orig:'',modal:false};}
const ecState={cat:ecFresh(),sub:ecFresh()};

/* ── Derived values ────────────────────────────────────────────────────── */
function ecRec(k,id){return EC_KIND[k].data.find(function(x){return x.id===id;})||null;}
function ecKey(k,r){return EC_KIND[k].code+'-'+String(r.key).padStart(3,'0');}
function ecCatName(id){const c=ecRec('cat',id);return c?c.name:'';}
function ecSubName(id){const s=ecRec('sub',id);return s?s.name:'';}
function ecCatByName(name){return eventCategoriesData.find(function(x){return x.status!=='Deleted'&&x.name===name;})||null;}
function ecSubByName(catId,name){return eventSubCategoriesData.find(function(x){return x.status!=='Deleted'&&x.catId===catId&&x.name===name;})||null;}
function ecLive(k){return EC_KIND[k].data.filter(function(r){return r.status!=='Deleted';});}
function ecSubsOf(catId){return eventSubCategoriesData.filter(function(s){return s.status!=='Deleted'&&s.catId===catId;});}
function ecEvents(k,r){return typeof evForTaxonomy==='function'?evForTaxonomy(k,r.id):[];}
function ecPlural(n,one,many){return n+' '+(n===1?one:many);}
/* The Announcement category, and whether a record is it or sits under it. */
function ecAnmCat(){return eventCategoriesData.find(function(c){return c.anm&&c.status!=='Deleted';})||null;}
function ecIsAnmName(catName){const c=ecCatByName(catName);return !!(c&&c.anm);}
function ecIsAnm(k,r){return k==='cat'?!!r.anm:!!(ecRec('cat',r.catId)||{}).anm;}
function ecAnns(k,r){return ecIsAnm(k,r)&&typeof anmFiledUnder==='function'?anmFiledUnder(k,r):[];}
/* What is filed under a record: events, or announcements under Announcement. */
function ecUsed(k,r){
  return ecIsAnm(k,r)?{rows:ecAnns(k,r),one:'announcement',many:'announcements',tab:'Announcements'}
    :{rows:ecEvents(k,r),one:'event',many:'events',tab:'Events'};
}
/* What has to move before this record can be deleted, in words. */
function ecBlockers(k,r){
  const out=[],ev=ecEvents(k,r).length,an=ecAnns(k,r).length,subs=k==='cat'?ecSubsOf(r.id).length:0;
  if(subs)out.push(ecPlural(subs,'sub category','sub categories'));
  if(ev)out.push(ecPlural(ev,'event','events'));
  if(an)out.push(ecPlural(an,'announcement','announcements'));
  return out;
}
function ecMoves(k,r){
  const stuck=ecBlockers(k,r).length>0;
  return (EC_MOVES[r.status]||[]).filter(function(m){return m!=='Deleted'||!stuck;});
}
/* Options for the event form: what is active, plus what the event already has.
   noAnm leaves Announcement out, where an event cannot become one. */
function ecCatOptions(cur,noAnm){
  return ecLive('cat').filter(function(c){return (c.status==='Active'||c.name===cur)&&!(noAnm&&c.anm);}).map(function(c){return c.name;}).reverse();
}
function ecSubOptions(catName,cur){
  const c=ecCatByName(catName);if(!c)return [];
  return ecSubsOf(c.id).filter(function(s){return s.status==='Active'||s.name===cur;}).map(function(s){return s.name;}).reverse();
}
/* The event form's inline + Add. */
function ecQuickAdd(k,name,catId){
  const K=EC_KIND[k],s=stampNow();
  const r=ecSeed(K.next++,name,'','Active',CURRENT_USER,axStamp(),catId);
  r.logs=[{date:s.date,time:s.time,user:CURRENT_USER,status:'Active',action:K.noun+' created.'}];
  K.data.unshift(r);
  return r;
}

const EC_ICO={
  tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  tags:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
};

/* ── Filters ───────────────────────────────────────────────────────────── */
function ecRows(k){
  const s=ecState[k];
  return ecLive(k).filter(function(r){
    if(s.catF&&ecCatName(r.catId)!==s.catF)return false;
    if(s.statusF&&r.status!==s.statusF)return false;
    return true;
  });
}
function ecSearchRows(k,rows,q){
  const n=String(q||'').trim().toLowerCase();
  if(!n)return rows;
  return rows.filter(function(r){return lpSearchMatch(n,r)||ecKey(k,r).toLowerCase().indexOf(n)>=0;});
}
function ecToggleStat(k,v){const s=ecState[k];s.statusF=s.statusF===v?'':v;s.sel=null;renderADTPage();}
function ecApply(k){
  const s=ecState[k];
  if(k==='sub')s.catF=getCSValue('esub-f-cat');
  s.q=lpSearchValue(EC_KIND[k].pre+'-f-q');
  s.sel=null;renderADTPage();
}
function ecReset(k){const s=ecState[k];s.q='';s.statusF='';s.catF='';s.sel=null;renderADTPage();}

/* ── Detail panel ──────────────────────────────────────────────────────── */
function ecDropEdit(k){const s=ecState[k];s.editing=false;s.draft=null;}
function ecOpen(k,id,tab){
  const s=ecState[k],K=EC_KIND[k],pre=K.pre;
  if(s.sel!=null&&s.sel!==id&&sbLeaveGuard(pre,function(){ecOpen(k,id,tab);}))return;
  if(s.sel!==id)ecDropEdit(k);
  s.tab=tab||sbKeepTab(s.sel,s.tab);s.sel=id;
  const sb=document.getElementById(pre+'-split-sb');if(sb)sb.classList.add('open');
  isbTab(pre,function(){return ecRender(k);});
  document.querySelectorAll('.'+pre+'-row').forEach(function(r){r.classList.toggle('lp-row-selected',r.id===pre+'-row-'+id);});
}
function ecClose(k){
  const s=ecState[k],pre=EC_KIND[k].pre;
  if(sbLeaveGuard(pre,function(){ecClose(k);}))return;
  ecDropEdit(k);s.sel=null;
  const sb=document.getElementById(pre+'-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.'+pre+'-row').forEach(function(r){r.classList.remove('lp-row-selected');});
}
function ecNav(k,t){
  const s=ecState[k],pre=EC_KIND[k].pre;
  if(s.editing&&!sbHasDraft(pre))ecDropEdit(k);
  s.tab=t;isbTab(pre,function(){return ecRender(k);});
}
function ecSeedLogs(k,r){
  const p=String(r.createdAt).split(' | '),noun=EC_KIND[k].noun;
  const fx=[{date:p[0],time:p[1]||'09:00:00 AM',user:r.createdBy,status:'Active',action:noun+' created.'}];
  if(r.status==='Inactive')fx.unshift({date:p[0],time:'06:00:00 PM',user:'Shaun Test1',status:'Inactive',action:'No longer in use.'});
  return seedLogs(r,fx);
}
function ecWorkflow(k,r){
  const noun=EC_KIND[k].noun;
  const T={'Active':noun+' Active','Inactive':noun+' Inactive','Deleted':noun+' Deleted'};
  const done=wfDoneFromLogs(ecSeedLogs(k,r),function(st){return T[st]||st;});
  const LEFT={'Inactive':[{title:'Mark Active or Delete',owner:'Company Admin'}]};
  return wfPlan(done,LEFT[r.status]||[]);
}
function ecRender(k){
  const s=ecState[k],K=EC_KIND[k],r=ecRec(k,s.sel);if(!r)return '';
  const u=ecUsed(k,r),used=u.rows,subs=k==='cat'?ecSubsOf(r.id):[];
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'events',label:u.tab},{id:'logs',label:'Logs'},{id:'history',label:'History'},{id:'workflow',label:'Workflow'}];
  const tabBar=axTabBar(K.pre,tabs,s.tab,K.nav,K.close);
  const hero=function(editing,edit){return sbHero({icon:EC_ICO[K.hero],name:sbEsc(r.name),
    meta:[ecKey(k,r),k==='sub'?ecCatName(r.catId):null,ecPlural(used.length,u.one,u.many)],
    status:axBadge(statusTone(r.status),r.status),editing:editing,onEdit:edit});};
  const startEdit=K.pre+'StartEdit()';
  let body='';
  if(s.tab==='basic-details'&&s.editing){
    body=hero(true)+axInlineFormHTML(ecFieldsHTML(k),K.pre+'CancelEdit()',K.pre+'SaveEdit()');
  }else if(s.tab==='basic-details'){
    body=hero(false,startEdit)
      +'<div class="lp-sb-detail-grid">'
      +axField(AX_ICO.fTag,K.noun+' Name',sbEsc(r.name))
      +(k==='sub'?axField(EC_ICO.tag,'Category',sbEsc(ecCatName(r.catId)))
        :axField(EC_ICO.tags,'Sub Categories',subs.length?sbEsc(subs.map(function(x){return x.name;}).reverse().join(', ')):'None yet'))
      +axField(AX_ICO.fHash,u.tab,used.length?ecPlural(used.length,u.one,u.many)+' <span class="ax-sub"><a class="rb-link" onclick="'+K.nav+'(\'events\')">See the list</a></span>':'Not used by any '+u.one+' yet')
      +axField(AX_ICO.fUser,'Created By',r.createdBy)
      +axField(AX_ICO.fCal,'Created On',String(r.createdAt).split(' | ')[0])
      +axField(EC_ICO.note,'Description',sbEsc(r.desc),true)
      +'</div>';
  }else if(s.tab==='events'){
    const none='No '+u.one+' is filed under this '+K.low+' yet.';
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">'+u.tab+' Filed Here</span><span class="ax-count">'+ecPlural(used.length,u.one,u.many)+'</span></div>'
      +(ecIsAnm(k,r)?anmUsedByHTML(used,none):evUsedByHTML(used,none));
  }else if(s.tab==='logs'){
    body=lpLogsView(ecSeedLogs(k,r),ecLogFormHTML(k,r),{labels:EC_MOVE_LABELS});
  }else if(s.tab==='history'){
    body=sbHistoryHTML(r);
  }else{
    body=wfTimelineHTML(ecWorkflow(k,r));
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
function ecLogFormHTML(k,r){
  const K=EC_KIND[k],pre=K.pre,moves=ecMoves(k,r),block=ecBlockers(k,r);
  return '<div class="lp-logs-form">'
    +'<div class="lp-logs-form-header"><span class="lp-log-dot"></span>'+r.status+'</div>'
    +'<p class="lp-logs-form-sub">Mark this '+K.low+' active or inactive, or delete it, and say why'
      +(block.length?'. Delete is available once nothing uses it - '+block.join(' and ')+' still '+(block.length===1&&/^1 /.test(block[0])?'does':'do')+'.':'')+'</p>'
    +lpLogStatusField(pre+'-log-status-sel',r.status,[r.status].concat(moves))
    +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
    +'<textarea class="lp-logs-form-textarea" id="'+pre+'-log-comment-inp" placeholder="Enter comment"></textarea>'
    +'<div style="display:flex;gap:10px;margin-top:12px">'
    +'<button class="ep-cancel-btn" style="flex:1" onclick="'+K.nav+'(\'logs\')">Cancel</button>'
    +'<button class="lp-logs-save-btn" style="flex:1" onclick="ecSaveLog(\''+k+'\','+r.id+')">Submit</button>'
    +'</div></div>';
}
function ecSaveLog(k,id){
  const r=ecRec(k,id),K=EC_KIND[k],s=ecState[k];if(!r)return;
  ecSeedLogs(k,r);
  if(!lpCommitLog(r,K.pre+'-log-status-sel',K.pre+'-log-comment-inp',r.logs))return;
  if(r.status==='Deleted'){
    ecDropEdit(k);s.sel=null;renderADTPage();
    showToast(K.noun+' deleted','success',ecKey(k,r)+' · '+r.name+' is no longer available.');return;
  }
  renderADTPage();
  showToast('Log added','success',ecKey(k,r)+' is now '+r.status+'.');
}

/* ── The form: panel Edit and + Add share it ───────────────────────────── */
function ecStartEdit(k){
  const s=ecState[k],r=ecRec(k,s.sel);if(!r)return;
  s.editing=true;
  s.draft={name:r.name,desc:r.desc,cat:k==='sub'?ecCatName(r.catId):''};
  s.orig=JSON.stringify(s.draft);
  renderADTPage();
}
function ecCancelEdit(k){ecDropEdit(k);renderADTPage();}
function ecSync(k){
  const d=ecState[k].draft,pre=EC_KIND[k].pre;if(!d)return;
  [['name','-e-name'],['desc','-e-desc']].forEach(function(p){const el=document.getElementById(pre+p[1]);if(el)d[p[0]]=el.value.trim();});
  [['cat','-e-cat'],['status','-e-status']].forEach(function(p){if(document.getElementById('csw-'+pre+p[1]))d[p[0]]=getCSValue(pre+p[1]);});
}
function ecFieldsHTML(k){
  const s=ecState[k],K=EC_KIND[k],pre=K.pre,d=s.draft;
  const name='<div class="ep-form-group'+(k==='cat'&&!s.modal?' ep-form-full':'')+'"><label class="ep-form-label" for="'+pre+'-e-name">'+K.noun+' Name <span class="req">*</span></label>'
    +'<input class="ep-form-input" id="'+pre+'-e-name" value="'+attrSafe(d.name)+'" placeholder="e.g. '+(k==='cat'?'Payroll Flow':'Payslips')+'"></div>';
  return (k==='sub'?'<div class="ep-form-group"><label class="ep-form-label">Category <span class="req">*</span></label>'
      +axCS(pre+'-e-cat',ecCatOptions(d.cat),d.cat,'Select Category')+'</div>':'')
    +name
    +(s.modal?'<div class="ep-form-group"><label class="ep-form-label">Status <span class="req">*</span></label>'+apCS(pre+'-e-status',EC_TILES,d.status,'Select Status')+'</div>':'')
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label" for="'+pre+'-e-desc">Description</label>'
      +'<textarea class="ep-form-input ax-notes" id="'+pre+'-e-desc" placeholder="What this '+K.low+' covers">'+attrSafe(d.desc||'')+'</textarea></div>';
}
function ecCheck(k,d,selfId){
  const K=EC_KIND[k];
  if(k==='sub'&&!d.cat){showToast('Category is required','error');return false;}
  if(!String(d.name||'').trim()){showToast(K.noun+' Name is required','error');return false;}
  if(/['"]/.test(d.name)){showToast('Quotes are not allowed in a name','error');return false;}
  const cat=k==='sub'?ecCatByName(d.cat):null;
  const twin=ecLive(k).find(function(x){return x.id!==selfId&&x.name.toLowerCase()===d.name.toLowerCase()&&(!cat||x.catId===cat.id);});
  if(twin){showToast('This '+K.low+' already exists','error',ecKey(k,twin)+' · '+twin.name);return false;}
  return true;
}
function ecSaveEdit(k){
  const s=ecState[k],r=ecRec(k,s.sel);if(!r||!s.draft)return;
  ecSync(k);
  const d=s.draft;
  if(!ecCheck(k,d,r.id))return;
  const was=r.name,to=k==='sub'?ecCatByName(d.cat):null;
  /* Events and announcements are different records: a sub category holding
     either cannot cross between Announcement and the other categories. */
  if(to&&to.id!==r.catId&&!!to.anm!==ecIsAnm('sub',r)&&(ecEvents('sub',r).length||ecAnns('sub',r).length)){
    showToast('Cannot move to '+to.name,'error','Move what is filed under '+r.name+' first.');return;
  }
  r.name=d.name;r.desc=d.desc;
  if(k==='sub'&&was!==r.name&&ecIsAnm('sub',r)&&typeof anmRenameSub==='function')anmRenameSub(was,r.name);
  if(k==='sub'){
    const c=ecCatByName(d.cat);
    /* Moved to another category: its events move with it. */
    if(c&&c.id!==r.catId){r.catId=c.id;evMoveSubCategory(r.id,c.id);}
  }
  ecDropEdit(k);
  renderADTPage();
  showToast(EC_KIND[k].noun+' updated','success',ecKey(k,r)+' saved.');
}

/* ── + Add ─────────────────────────────────────────────────────────────── */
function ecStartAdd(k){
  const s=ecState[k],K=EC_KIND[k];
  if(page!==K.page)navigatePage(K.page);
  ecDropEdit(k);
  s.draft={name:'',desc:'',cat:s.catF||'',status:'Active'};
  s.modal=true;
  renderADTPage();
}
function ecCancelAdd(k){const s=ecState[k];s.modal=false;s.draft=null;renderADTPage();}
function ecModalHTML(k){
  const K=EC_KIND[k],pre=K.pre;
  return '<div class="ct-modal-overlay">'
    +'<div class="ct-modal ct-modal--form ax-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Add Event '+K.noun+'</span>'
      +'<button class="ct-modal-close" onclick="ecCancelAdd(\''+k+'\')">'+AX_ICO.x+'</button></div>'
    +'<p class="ct-modal-sub">'+(k==='cat'?'A group of related events.':'A group inside a category. An event is filed under both.')+' Fields marked <span class="req">*</span> are required.</p>'
    +'<div class="ep-form-grid" id="'+pre+'-m-grid">'+ecFieldsHTML(k)+'</div>'
    +'<div class="ct-modal-foot"><div class="ct-modal-btns">'
      +'<button class="ep-cancel-btn" onclick="ecCancelAdd(\''+k+'\')">Cancel</button>'
      +'<button class="ep-save-btn" onclick="ecSubmitAdd(\''+k+'\')">Add '+K.noun+'</button>'
    +'</div></div>'
    +'</div></div>';
}
function ecSubmitAdd(k){
  const s=ecState[k],K=EC_KIND[k];
  ecSync(k);
  const d=s.draft;
  if(!ecCheck(k,d,null))return;
  if(!d.status){showToast('Status is required','error');return;}
  const c=k==='sub'?ecCatByName(d.cat):null,stamp=stampNow();
  const r=ecSeed(K.next++,d.name,d.desc,d.status,CURRENT_USER,axStamp(),c?c.id:null);
  r.logs=[{date:stamp.date,time:stamp.time,user:CURRENT_USER,status:d.status,action:K.noun+' created as '+d.status+'.'}];
  K.data.unshift(r);
  lpLanded(K.page,r.id);
  s.modal=false;s.draft=null;
  renderADTPage();
  showToast(K.noun+' added','success',ecKey(k,r)+' · '+r.name+'.');
}

/* ── Listing ───────────────────────────────────────────────────────────── */
function ecCount(n,one,many){
  return n?'<div class="lp-c-plain">'+ecPlural(n,one,many)+'</div>':'<div class="lp-c-plain is-none">None</div>';
}
function ecRowHTML(k,r,i){
  const s=ecState[k],K=EC_KIND[k],pre=K.pre;
  return '<tr class="'+pre+'-row'+(s.sel===r.id?' lp-row-selected':'')+'" id="'+pre+'-row-'+r.id+'" style="cursor:pointer" onclick="'+K.open+'('+r.id+')">'
    +'<td class="lp-c-n">'+(i+1)+'</td>'
    +'<td><div class="lp-c-main ax-c-link ax-c-trunc" title="'+attrSafe(r.name)+'">'+sbEsc(r.name)+'</div><div class="lp-c-sub">'+ecKey(k,r)+'</div></td>'
    +(k==='cat'
      ?'<td>'+ecCount(ecSubsOf(r.id).length,'sub category','sub categories')+'</td>'
      :'<td><div class="lp-c-plain">'+sbEsc(ecCatName(r.catId))+'</div></td>')
    +'<td>'+(function(u){return ecCount(u.rows.length,u.one,u.many);})(ecUsed(k,r))+'</td>'
    +'<td>'+axBadge(statusTone(r.status),r.status)+'</td>'
    +'<td onclick="event.stopPropagation()">'+rowLogCell(K.page,r.id)+'</td>'
    +'</tr>';
}
function ecListHTML(k){
  const s=ecState[k],K=EC_KIND[k],pre=K.pre;
  const live=ecLive(k);
  const count=function(st){return live.filter(function(r){return r.status===st;}).length;};
  const shown=ecSearchRows(k,ecRows(k),s.q);
  if(s.sel&&!shown.some(function(r){return r.id===s.sel;}))s.sel=null;
  const pgn=listPage(K.page,[s.catF,s.statusF,s.q].join('|'),shown.map(function(r,i){return ecRowHTML(k,r,i);}),
    '<tr><td colspan="6" style="padding:24px;text-align:center;color:var(--gray)">No '+(k==='cat'?'categories':'sub categories')+' match this filter.</td></tr>');
  const stat=function(st){
    return '<div class="listing-stat'+(s.statusF===st?' stat-selected':'')+'" onclick="'+K.stat+'(\''+st+'\')">'
      +'<div class="listing-stat-count" style="color:var(--st-'+statusTone(st)+'-fg)">'+count(st)+'</div><div class="listing-stat-label">'+st+'</div></div>';
  };
  return '<div class="lp-page">'
    +dashboardBackHTML()
    +'<div class="exp-top ec-top" style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:4px">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0">'
    +'<div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +lpSearchField(pre+'-f-q',s.q,'Search '+(k==='cat'?'categories':'sub categories'),K.apply+'()')
    +(k==='sub'?apCS('esub-f-cat',ecLive('cat').map(function(c){return c.name;}).reverse(),s.catF,'All Categories'):'')
    +clearFiltersBtn([s.catF,s.statusF,s.q],K.reset+'()')
    +'<button class="lp-pill-search" onclick="'+K.apply+'()">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats">'+EC_TILES.map(stat).join('')+'</div></div>'
    +'<div class="lp-split-wrap ax-split-wrap" style="margin-top:14px" id="'+pre+'-split-wrap"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table ax-table ec-table"><thead><tr><th>S. No</th><th>'+K.noun+'</th><th>'+(k==='cat'?'Sub Categories':'Category')+'</th><th>Events</th>'
      +'<th>Status</th><th>Action</th></tr></thead>'
    +'<tbody>'+pgn.rows+'</tbody></table>'
    +pgn.pager
    +'</div></div>'
    +'<div class="lp-split-sb'+(s.sel?' open':'')+'" id="'+pre+'-split-sb"><div class="lp-isb" id="'+pre+'-isb-inner">'+(s.sel?sbRender(function(){return ecRender(k);},pre):'')+'</div></div>'
    +'</div></div>'
    +(s.modal?ecModalHTML(k):'');
}
function buildEventCategoriesHTML(){return ecListHTML('cat');}
function buildEventSubCategoriesHTML(){return ecListHTML('sub');}

/* ── Wiring ────────────────────────────────────────────────────────────── */
/* Plain names for the parts that call a function by name. */
function openEcatSidebar(id,tab){ecOpen('cat',id,tab);}
function openEsubSidebar(id,tab){ecOpen('sub',id,tab);}
function closeEcatSidebar(){ecClose('cat');}
function closeEsubSidebar(){ecClose('sub');}
function navEcatTab(t){ecNav('cat',t);}
function navEsubTab(t){ecNav('sub',t);}
function applyEcatFilters(){ecApply('cat');}
function applyEsubFilters(){ecApply('sub');}
function resetEcatFilters(){ecReset('cat');}
function resetEsubFilters(){ecReset('sub');}
function ecatToggleStat(v){ecToggleStat('cat',v);}
function esubToggleStat(v){ecToggleStat('sub',v);}
function ecatStartEdit(){ecStartEdit('cat');}
function esubStartEdit(){ecStartEdit('sub');}
function ecatCancelEdit(){ecCancelEdit('cat');}
function esubCancelEdit(){ecCancelEdit('sub');}
function ecatSaveEdit(){ecSaveEdit('cat');}
function esubSaveEdit(){ecSaveEdit('sub');}

Object.assign(supportPageMeta,{
  'event-categories':{title:'Event Categories',context:'Event Categories',filters:[],columns:[],rows:[]},
  'event-sub-categories':{title:'Event Sub Categories',context:'Event Sub Categories',filters:[],columns:[],rows:[]}
});
if(typeof LP_ROW_PREFIX!=='undefined'){LP_ROW_PREFIX['event-categories']='ecat';LP_ROW_PREFIX['event-sub-categories']='esub';}
Object.assign(SB_STATUS_TONE,{deleted:'bad'});
['cat','sub'].forEach(function(k){
  sbDraftReg(EC_KIND[k].pre,{
    dirty:function(){
      const s=ecState[k];
      if(!s.editing||s.modal)return false;
      ecSync(k);
      return JSON.stringify(s.draft)!==s.orig;
    },
    drop:function(){ecDropEdit(k);}});
});
