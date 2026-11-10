/* ══ EVENTS ═════════════════════════════════════════════════════════════════
   Governance → Events → All Events. An event is a trigger: when a record
   reaches a given state, send this email to this audience.

   Built from the same parts as Capping Limit (js/capping-limit.js):
   lpSearchField + apCS filters with listing-stats tiles, an .lp-table in an
   .lp-split-wrap, the .lp-isb-* panel behind the row action and a
   .ct-modal--form for + Add.

   THE OLD FILTERS, FOLDED. Event Id, Event Number and Event Subject were three
   inputs for things a person types - one search box. What is picked stays a
   dropdown. Status is the tiles, as on every listing, and the audience counts
   the old page had in a collapsing box are the Event For filter.

   THE THREE STEPS ARE SECTIONS OF ONE FORM, in the same order: what the event
   is, when it fires, what it says.

   ONE FIELD DECIDES THE NEXT. Category narrows Sub Category; Table Level
   narrows the Field Levels; a Field Level narrows its Data Level. A field with
   nothing to choose from yet is dimmed with a hint saying why. The panel reads
   the conditions back as a sentence ("Deal Log: Region is USA").

   EVENT NUMBER IS NOT UNIQUE. It is the number the workflow calls, and the old
   data has several events on one number. The key (EVT-334) is what identifies
   an event.

   AN ANNOUNCEMENT IS ADDED HERE. Category is the form's first section, and
   picking Announcement (js/event-categories.js) swaps the rest of the form
   for the announcement's own fields - title, message, audience, validity -
   drawn by js/announcement-admin.js. Its sub categories are what the
   announcement is filed under. Saving publishes it to the employee dashboard
   and lands on its row here, with its panel open. An existing
   event cannot be turned into an announcement, so Edit leaves the category out.

   THE SUBJECT COMES FROM THE TEMPLATE. Picking a template fills Template
   Subject; it can then be reworded for this event without touching the
   template. Categories and templates are held by id, so a rename reaches every
   event, and the event form adds a missing one without leaving the form. */

/* ── Reference data ────────────────────────────────────────────────────── */
const EV_TYPES=['Admin master','Customer master','Vendor master','Employee master','Consultant master'];
/* Table -> its fields -> the values a field can hold. */
const EV_TABLES={
  'Deal Log':{'Deal Status':['Pending for Approval','Approved','Rejected','Closed'],'Region':['USA','India','UK','UAE']},
  'Document':{'Document Status':['Uploaded','Approved','Re-upload Requested'],'Document Type':['ID Proof','Address Proof','Contract']},
  'Employee':{'Employee Status':['Onboarding','Active','On Notice','Exited'],'Employment Type':['EOR','PEO','Contractor']},
  'Entity':{'Entity Status':['Created','Verified','Inactive'],'Entity Type':['EOR Entity','PEO Entity','Direct Entity']},
  'Timesheet':{'Timesheet Status':['Draft','Submitted','Approved'],'Payment Cycle':['Weekly','Monthly']},
  'Vendor':{'Vendor Status':['Active','On Hold'],'Payment Cycle':['Weekly','Monthly']}
};
const EV_TILES=['Active','Inactive'];
const EV_MOVES={'Active':['Inactive','Deleted'],'Inactive':['Active','Deleted'],'Deleted':[]};
const EV_MOVE_LABELS={'Active':'Mark Active','Inactive':'Mark Inactive','Deleted':'Delete'};

/* ── Seed data (the old screen's rows, then one for each other audience) ── */
function evSeed(id,key,number,name,type,aud,catId,subId,service,process,table,c,rule,comment,tplId,subject,status,by,at,opts){
  return Object.assign({id:id,key:key,number:number,name:name,type:type,aud:aud,catId:catId,subId:subId,service:service,process:process,
    table:table,f1:c[0]||'',d1:c[1]||'',f2:c[2]||'',d2:c[3]||'',rule:rule,comment:comment,tplId:tplId,subject:subject,
    schedule:false,promo:false,status:status,createdBy:by,createdAt:at},opts||{});
}
const eventsData=[
  evSeed(13,334,3500,'New Entity Created','Admin master','Admin',2,5,'All','All','Entity',['Entity Status','Created'],'Tells the admin team when a new entity is created so its setup can be checked','Sent to the admin team once, when the entity is created.',12,'New entity created: [Entity_Name]','Active','Tarak Swain','4 Nov 2026 | 04:36:10 PM'),
  evSeed(12,333,2995,'Customer Welcome on First Sign-in','Customer master','User',1,1,'All','Onboarding','Entity',['Entity Status','Verified'],'Welcomes the customer once their entity is set up and they first land on the dashboard','Sent once, on the first sign-in after the entity is created.',10,'[First_Name] – Let\'s Get [Company_Name] Started on ADT','Active','Tarak Swain','6 Apr 2026 | 06:03:17 PM'),
  evSeed(11,326,3001,'Timesheet Due Reminder','Employee master','User',4,8,'All','Payroll','Timesheet',['Timesheet Status','Draft'],'Reminds an employee whose timesheet is still in draft two days before the cycle closes','Runs on schedule.',11,'Your timesheet is due, [First_Name]','Active','Meera Iyer','2 Oct 2023 | 10:20:00 AM',{schedule:true}),
  evSeed(10,325,3000,'Consultant Welcome','Consultant master','Consultant',1,1,'Contractor','Onboarding','Employee',['Employee Status','Onboarding','Employment Type','Contractor'],'Welcomes a consultant once their agreement is active','Sent to the consultant, copied to the account manager.',6,'Welcome aboard, [First_Name]','Active','Syed Ayaz','21 Jun 2023 | 09:45:00 AM'),
  evSeed(9,324,2999,'Sub Contractor Work Order','Vendor master','Sub Contracting',3,7,'Contractor','Compliance','Vendor',['Vendor Status','Active'],'Sends the sub contractor the work order to confirm','Sent when a work order is raised.',7,'New work order for [Company_Name]','Active','Syed Ayaz','2 Aug 2023 | 03:25:00 PM'),
  evSeed(8,332,3005,'Employee Document Changed','Admin master','Admin',2,4,'All','Compliance','Document',['Document Status','Uploaded'],'Tells HR when an employee uploads or changes a document on their profile','Sent to HR for review.',5,'Document changed: [Employee_Name]','Inactive','Tarak Swain','16 May 2023 | 06:06:38 PM'),
  evSeed(7,331,3005,'USA Deal Closed','Admin master','Admin',2,3,'All','All','Deal Log',['Deal Status','Closed','Region','USA'],'Tells HR when the closing team marks a USA deal as Closed in the deal log','Sent to HR.',4,'Deal closed for [Company_Name]','Active','Tarak Swain','16 May 2023 | 06:06:38 PM'),
  evSeed(6,330,3005,'USA Deal – MSA for HR','Admin master','Admin',2,6,'All','All','Deal Log',['Region','USA'],'Sends HR the MSA template when a deal is logged for the USA region','Sent to HR.',4,'MSA needed for [Company_Name]','Active','Tarak Swain','16 May 2023 | 06:04:20 PM'),
  evSeed(5,329,3004,'Vendor Salary – HR Copy','Vendor master','Vendor',1,2,'All','Payroll','Vendor',['Vendor Status','Active'],'Sends HR the vendor salary details once the vendor is active','Sent to HR.',3,'Vendor salary processed: [Company_Name]','Active','Tarak Swain','12 May 2023 | 12:33:00 PM'),
  evSeed(4,328,3003,'Vendor Monthly Salary','Vendor master','Vendor',1,2,'All','Payroll','Vendor',['Payment Cycle','Monthly'],'Sends the vendor their salary details at the close of each monthly cycle','Sent to the vendor.',3,'Your salary details for this cycle','Active','Tarak Swain','12 May 2023 | 12:31:08 PM'),
  evSeed(3,327,3002,'Deal Pending Approval','Admin master','Admin',2,3,'All','All','Deal Log',['Deal Status','Pending for Approval'],'Asks the approver to review a deal that is pending for approval','Sent to the approver.',4,'Deal awaiting your approval: [Company_Name]','Active','Tarak Swain','24 Apr 2023 | 11:02:00 AM'),
  evSeed(2,323,2998,'Course Enrolment Confirmed','Customer master','Education',4,9,'All','Onboarding','Employee',['Employee Status','Onboarding'],'Confirms a learner\'s enrolment','Sent to the learner.',8,'You are enrolled, [First_Name]','Active','Syed Ayaz','8 Sep 2023 | 11:15:00 AM'),
  evSeed(1,322,2997,'EOR Entity Verification','Admin master','Admin',3,7,'EOR','Compliance','Entity',['Entity Status','Created','Entity Type','EOR Entity'],'Asks the compliance team to verify a new EOR entity','Sent to the compliance team.',1,'Verify [Entity_Name]','Active','Tarak Swain','20 Jan 2023 | 10:05:00 AM')
];
let evNextId=14,evNextKey=335;

/* ── Derived values ────────────────────────────────────────────────────── */
function evRec(id){return eventsData.find(function(x){return x.id===id;})||null;}
function evKey(e){return 'EVT-'+e.key;}
function evLive(){return eventsData.filter(function(e){return e.status!=='Deleted';});}
function evForTemplate(tplId){return evLive().filter(function(e){return e.tplId===tplId;});}
function evForTaxonomy(k,id){return evLive().filter(function(e){return (k==='cat'?e.catId:e.subId)===id;});}
function evMoveSubCategory(subId,catId){eventsData.forEach(function(e){if(e.subId===subId)e.catId=catId;});}
function evSubject(e){return e.subject||(e.tplId?'':'No template linked');}
/* What a person calls the event; a record without one falls back to the subject. */
function evName(e){return e.name||evSubject(e);}
function evTemplate(e){return e.tplId?etRec(e.tplId):null;}
/* The conditions as a sentence. */
function evWhen(e){
  const parts=[];
  if(e.f1)parts.push(e.f1+' is '+e.d1);
  if(e.f2)parts.push(e.f2+' is '+e.d2);
  return e.table+(parts.length?': '+parts.join(' and '):': any change');
}
function evFieldsOf(table){return EV_TABLES[table]?Object.keys(EV_TABLES[table]):[];}
function evDataOf(table,field){return EV_TABLES[table]&&EV_TABLES[table][field]||[];}
function evPlural(n,w){return n+' '+w+(n===1?'':'s');}
/* The Add Event form, with Announcement picked as its category. */
function evIsAnm(){return !!(evModalOpen&&evDraft&&evDraft.cat&&ecIsAnmName(evDraft.cat));}
/* Category names for the listing's filter. */
function evCatNames(){return ecLive('cat').map(function(c){return c.name;}).reverse();}
/* ANNOUNCEMENTS ARE LISTED HERE TOO, as rows under the Announcement category.
   They have no Process Type or Service Group, so either filter hides them,
   and their Event For is the employees they are posted to. A row opens the
   announcement's own panel (js/announcement-admin.js) in this page's split,
   in place of the event panel - there is no separate Announcements page. */
const EV_ANM_FOR='Employee';
function evAnmRows(){
  if(typeof annData==='undefined'||evProcessF||evServiceF)return [];
  if(evForF&&evForF!==EV_ANM_FOR)return [];
  if(evCatF&&!ecIsAnmName(evCatF))return [];
  return annData.filter(function(a){return (!evSubF||a.category===evSubF)&&(!evStatusF||a.status===evStatusF);});
}
/* To an announcement from anywhere (a category's list, a new publish): the
   filters are cleared, the listing turns to the page it is on, its panel opens. */
function evShowAnm(id,tab){
  evForF='';evCatF='';evSubF='';evProcessF='';evServiceF='';evStatusF='';evQ='';
  evDropEdit();evSelectedId=null;
  anmSelectedId=id;anmTab=tab||'basic-details';anmEditMode=false;anmEditId=null;
  const at=evMergeRows(evRows(),evAnmRows()).findIndex(function(x){return x.a&&x.a.id===id;});
  if(at>=0)lpLandedAt('events',at);
  if(page!=='events')navigatePage('events');else renderADTPage();
}
function evStamp(x){return Date.parse(String(x.createdAt||'').replace(' | ',' '))||0;}
/* Events keep their order; announcements, newest first, go in by date. */
function evMergeRows(evs,anns){
  anns=anns.slice().sort(function(a,b){return evStamp(b)-evStamp(a);});
  const out=[];let i=0,j=0;
  while(i<evs.length||j<anns.length){
    if(j>=anns.length||(i<evs.length&&evStamp(evs[i])>=evStamp(anns[j])))out.push({e:evs[i++]});
    else out.push({a:anns[j++]});
  }
  return out;
}

const EV_ICO={
  hero:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
};

/* ── State ─────────────────────────────────────────────────────────────── */
let evSelectedId=null,evTab='basic-details';
let evForF='',evCatF='',evSubF='',evProcessF='',evServiceF='',evStatusF='',evQ='';
let evEditing=false,evDraft=null,evDraftOrig='',evModalOpen=false,evAddOpen='',evPreviewOpen=false;

/* ── Filters ───────────────────────────────────────────────────────────── */
function evRows(){
  return evLive().filter(function(e){
    if(evForF&&e.aud!==evForF)return false;
    if(evCatF&&ecCatName(e.catId)!==evCatF)return false;
    if(evSubF&&ecSubName(e.subId)!==evSubF)return false;
    if(evProcessF&&e.process!==evProcessF)return false;
    if(evServiceF&&e.service!==evServiceF)return false;
    if(evStatusF&&e.status!==evStatusF)return false;
    return true;
  });
}
/* The key is searched as the row shows it (EVT-334). */
function evSearchRows(rows,q){
  const n=String(q||'').trim().toLowerCase();
  if(!n)return rows;
  return rows.filter(function(e){return lpSearchMatch(n,e)||evKey(e).toLowerCase().indexOf(n)>=0;});
}
function evToggleStat(v){evStatusF=evStatusF===v?'':v;evSelectedId=null;renderADTPage();}
function applyEvFilters(){
  evForF=getCSValue('ev-f-for');
  evCatF=getCSValue('ev-f-cat');
  evSubF=getCSValue('ev-f-sub');
  evProcessF=getCSValue('ev-f-process');
  evServiceF=getCSValue('ev-f-service');
  evQ=lpSearchValue('ev-f-q');
  evSelectedId=null;renderADTPage();
}
function resetEvFilters(){evForF='';evCatF='';evSubF='';evProcessF='';evServiceF='';evStatusF='';evQ='';evSelectedId=null;renderADTPage();}
/* Picking a category narrows the Sub Category filter to it straight away. */
function evFilterSubHTML(cat,cur){
  const opts=cat?ecSubOptions(cat,cur):ecLive('sub').map(function(s){return s.name;}).reverse().filter(function(n,i,a){return a.indexOf(n)===i;});
  return apCS('ev-f-sub',opts,cur,'Sub Category');
}
function evFilterCatHook(val){
  const w=document.getElementById('csw-ev-f-sub');if(w)w.outerHTML=evFilterSubHTML(val,'');
}

/* ── Detail panel ──────────────────────────────────────────────────────── */
function evDropEdit(){evEditing=false;evDraft=null;evAddOpen='';evPreviewOpen=false;}
function openEvSidebar(id,tab){
  if(evSelectedId!=null&&evSelectedId!==id&&sbLeaveGuard('ev',function(){openEvSidebar(id,tab);}))return;
  /* One panel at a time: an open announcement panel closes first. */
  if(anmSelectedId!=null){
    if(sbLeaveGuard('anm',function(){openEvSidebar(id,tab);}))return;
    anmSelectedId=null;anmEditMode=false;anmEditId=null;
    const as=document.getElementById('anm-split-sb');if(as)as.classList.remove('open');
  }
  if(evSelectedId!==id)evDropEdit();
  evTab=tab||sbKeepTab(evSelectedId,evTab);evSelectedId=id;
  const sb=document.getElementById('ev-split-sb');if(sb)sb.classList.add('open');
  isbTab('ev',renderEvSidebar);
  document.querySelectorAll('.ev-row').forEach(function(r){r.classList.toggle('lp-row-selected',r.id==='ev-row-'+id);});
}
function closeEvSidebar(){
  if(sbLeaveGuard('ev',closeEvSidebar))return;
  evDropEdit();evSelectedId=null;
  const sb=document.getElementById('ev-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.ev-row').forEach(function(r){r.classList.remove('lp-row-selected');});
}
function navEvTab(t){if(evEditing&&!sbHasDraft('ev'))evDropEdit();evTab=t;isbTab('ev',renderEvSidebar);}
/* From a category's or a template's list of events to the event itself. */
function evGoTo(id){
  resetEvFilters();
  evSelectedId=id;evTab='basic-details';
  navigatePage('events');
}
/* The list a template or a category shows of the events that use it. */
function evUsedByHTML(rows,empty){
  if(!rows.length)return '<div class="lp-wf-empty">'+empty+'</div>';
  return '<div class="sb-hist-wrap"><table class="ax-hist ev-used"><thead><tr><th>S. No</th><th>Event</th><th>Key</th><th>Event For</th><th>Status</th></tr></thead><tbody>'
    +rows.map(function(e,i){
      return '<tr onclick="evGoTo('+e.id+')"><td>'+(i+1)+'</td>'
        +'<td class="ev-used-name" title="'+attrSafe(evName(e))+'"><b>'+sbEsc(evName(e))+'</b></td>'
        +'<td>'+evKey(e)+'</td><td>'+e.aud+'</td><td>'+axBadge(statusTone(e.status),e.status)+'</td></tr>';
    }).join('')+'</tbody></table></div>';
}

function evSeedLogs(e){
  const p=String(e.createdAt).split(' | ');
  const fx=[{date:p[0],time:p[1]||'09:00:00 AM',user:e.createdBy,status:'Active',action:'Event created.'}];
  if(e.status==='Inactive')fx.unshift({date:p[0],time:'06:30:00 PM',user:'Shaun Test1',status:'Inactive',action:'No longer in use.'});
  return seedLogs(e,fx);
}
const EV_STEP_TITLE={'Active':'Event Active','Inactive':'Event Inactive','Deleted':'Event Deleted'};
function evWorkflow(e){
  const done=wfDoneFromLogs(evSeedLogs(e),function(st){return EV_STEP_TITLE[st]||st;});
  const LEFT={'Inactive':[{title:'Mark Active or Delete',owner:'Company Admin'}]};
  return wfPlan(done,LEFT[e.status]||[]);
}
function evMoves(e){return EV_MOVES[e.status]||[];}

function renderEvSidebar(){
  const e=evRec(evSelectedId);if(!e)return '';
  const tpl=evTemplate(e);
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'email',label:'Email'},{id:'logs',label:'Logs'},{id:'history',label:'History'},{id:'workflow',label:'Workflow'}];
  const tabBar=axTabBar('ev',tabs,evTab,'navEvTab','closeEvSidebar');
  const hero=function(editing,edit){return sbHero({icon:EV_ICO.hero,name:sbEsc(evName(e)),meta:[evKey(e),'No. '+e.number,'For '+e.aud],
    status:axBadge(statusTone(e.status),e.status),editing:editing,onEdit:edit});};
  const opts=[e.schedule?'Schedule Event':'',e.promo?'Promotion':''].filter(Boolean);
  let body='';
  if(evTab==='basic-details'&&evEditing){
    body=hero(true)+axInlineFormHTML(evFieldsHTML(),'evCancelEdit()','evSaveEdit()');
  }else if(evTab==='basic-details'){
    body=hero(false,'evStartEdit()')
      +'<div class="lp-sb-detail-grid">'
      +axField(EV_ICO.layers,'Event Type',e.type)
      +axField(AX_ICO.fHash,'Event Number',String(e.number))
      +axField(EC_ICO.tag,'Event Category',sbEsc(ecCatName(e.catId)))
      +axField(EC_ICO.tags,'Event Sub Category',sbEsc(ecSubName(e.subId)))
      +axField(AX_ICO.fUser,'Event For',e.aud)
      +axField(AX_ICO.fBuild,'Service Group',e.service)
      +axField(AX_ICO.fBox,'Process Type',e.process)
      +axField(AX_ICO.fCheck,'Options',opts.join(', ')||'None')
      +axField(EV_ICO.hero,'Fires When',sbEsc(evWhen(e)),true)
      +axField(EV_ICO.note,'Business Rule',sbEsc(e.rule),true)
      +axField(EV_ICO.note,'Trigger Comment',sbEsc(e.comment),true)
      +axField(AX_ICO.fMail,'Event Template',tpl?'<a class="rb-link" onclick="etGoTo('+tpl.id+')">'+sbEsc(tpl.name)+'</a> <span class="ax-sub">'+etKey(tpl)+'</span>':'No template linked')
      +axField(AX_ICO.fMail,'Template Subject',e.subject?etMark(sbEsc(e.subject)):'')
      +axField(AX_ICO.fUser,'Created By',e.createdBy)
      +axField(AX_ICO.fCal,'Created On',String(e.createdAt).split(' | ')[0])
      +'</div>';
  }else if(evTab==='email'){
    const off=tpl&&tpl.status!=='Active';
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Email This Event Sends</span>'
        +(tpl?'<span class="ax-count"><a class="rb-link" onclick="etGoTo('+tpl.id+')">'+etKey(tpl)+' · '+sbEsc(tpl.name)+'</a></span>':'')+'</div>'
      +(off?'<div class="ev-warn">'+tpl.name+' is '+tpl.status+', so this event has no email to send until it is marked Active.</div>':'')
      +(tpl?etPreviewHTML(tpl,e.subject):'<div class="lp-wf-empty">No template linked. Use Edit on Basic Details to link one.</div>');
  }else if(evTab==='logs'){
    body=lpLogsView(evSeedLogs(e),evLogFormHTML(e),{labels:EV_MOVE_LABELS});
  }else if(evTab==='history'){
    body=sbHistoryHTML(e);
  }else{
    body=wfTimelineHTML(evWorkflow(e));
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
function evLogFormHTML(e){
  return '<div class="lp-logs-form">'
    +'<div class="lp-logs-form-header"><span class="lp-log-dot"></span>'+e.status+'</div>'
    +'<p class="lp-logs-form-sub">Mark this event active or inactive, or delete it, and say why</p>'
    +lpLogStatusField('ev-log-status-sel',e.status,[e.status].concat(evMoves(e)))
    +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
    +'<textarea class="lp-logs-form-textarea" id="ev-log-comment-inp" placeholder="Enter comment"></textarea>'
    +'<div style="display:flex;gap:10px;margin-top:12px">'
    +'<button class="ep-cancel-btn" style="flex:1" onclick="navEvTab(\'logs\')">Cancel</button>'
    +'<button class="lp-logs-save-btn" style="flex:1" onclick="evSaveLog('+e.id+')">Submit</button>'
    +'</div></div>';
}
function evSaveLog(id){
  const e=evRec(id);if(!e)return;
  evSeedLogs(e);
  if(!lpCommitLog(e,'ev-log-status-sel','ev-log-comment-inp',e.logs))return;
  if(e.status==='Deleted'){
    evDropEdit();evSelectedId=null;renderADTPage();
    showToast('Event deleted','success',evKey(e)+' no longer fires.');return;
  }
  renderADTPage();
  showToast('Log added','success',evKey(e)+' is now '+e.status+'.');
}

/* ── The form: panel Edit and + Add share it ───────────────────────────── */
function evDraftOf(e){
  const t=e?evTemplate(e):null;
  return e?{name:e.name||'',type:e.type,number:String(e.number),cat:ecCatName(e.catId),sub:ecSubName(e.subId),aud:e.aud,service:e.service,process:e.process,
      table:e.table,f1:e.f1,d1:e.d1,f2:e.f2,d2:e.d2,rule:e.rule,comment:e.comment,schedule:e.schedule,promo:e.promo,tpl:t?t.name:'',subject:e.subject}
    :{name:'',type:'',number:'',cat:'',sub:'',aud:'',service:'',process:'',table:'',f1:'',d1:'',f2:'',d2:'',rule:'',comment:'',
      schedule:false,promo:false,tpl:'',subject:'',status:'Inactive',anm:null};
}
function evStartEdit(){
  const e=evRec(evSelectedId);if(!e)return;
  evEditing=true;evAddOpen='';
  evDraft=evDraftOf(e);
  evDraftOrig=JSON.stringify(evDraft);
  renderADTPage();
}
function evCancelEdit(){evDropEdit();renderADTPage();}
function evSync(){
  if(!evDraft)return;
  [['name','ev-e-name'],['number','ev-e-number'],['rule','ev-e-rule'],['comment','ev-e-comment'],['subject','ev-e-subject']]
    .forEach(function(p){const el=document.getElementById(p[1]);if(el)evDraft[p[0]]=el.value.trim();});
  [['type','ev-e-type'],['cat','ev-e-cat'],['sub','ev-e-sub'],['aud','ev-e-for'],['status','ev-e-status'],['service','ev-e-service'],['process','ev-e-process'],
   ['table','ev-e-table'],['f1','ev-e-f1'],['d1','ev-e-d1'],['f2','ev-e-f2'],['d2','ev-e-d2'],['tpl','ev-e-tpl']]
    .forEach(function(p){if(document.getElementById('csw-'+p[1]))evDraft[p[0]]=getCSValue(p[1]);});
  [['schedule','ev-e-schedule'],['promo','ev-e-promo']].forEach(function(p){const el=document.getElementById(p[1]);if(el)evDraft[p[0]]=el.checked;});
  if(evDraft.anm){const v=anmEvRead();if(v)evDraft.anm=v;}
}
function evRepaint(){
  if(!(evModalOpen&&formRepaintParts(buildAddEvModalHTML(),['ev-m-grid','ev-m-foot'])))renderADTPage();
  if(evIsAnm())anmFormSync();
}
/* A pick that decides what the next field can hold clears what no longer fits. */
function evFormHook(val,csid){
  evSync();
  const d=evDraft;
  if(csid==='ev-e-cat'){d.sub='';if(evModalOpen&&ecIsAnmName(val)&&!d.anm)d.anm=anmEvBlank();}
  if(csid==='ev-e-table'){d.f1='';d.d1='';d.f2='';d.d2='';}
  if(csid==='ev-e-f1'){d.d1='';if(!val||d.f2===val){d.f2='';d.d2='';}}
  if(csid==='ev-e-f2')d.d2='';
  if(csid==='ev-e-tpl'){const t=etByName(val);d.subject=t?t.subject:'';if(!t)evPreviewOpen=false;}
  evRepaint();
}
/* The email this event would send: the template, under this event's subject.
   Only the preview's own box is repainted, so typing keeps its caret. */
function evPreviewBody(){
  const d=evDraft,t=d&&d.tpl?etByName(d.tpl):null;
  return evPreviewOpen&&t?etPreviewHTML(t,d.subject||'No subject yet'):'';
}
function evPreviewPaint(){
  const box=document.getElementById('ev-pv'),btn=document.getElementById('ev-pv-btn');
  if(box)box.innerHTML=evPreviewBody();
  if(btn)btn.textContent=evPreviewOpen?'Hide Preview':'Preview Email';
}
function evPreviewToggle(){
  evSync();
  evPreviewOpen=!evPreviewOpen;
  evPreviewPaint();
  if(evPreviewOpen)etPreviewShow('ev-pv');
}
function evPreviewLive(){if(evPreviewOpen){evSync();evPreviewPaint();}}
/* The inline + Add on Category and Sub Category; Template opens its full form. */
function evOpenAdd(key){
  evSync();
  if(key==='tpl'){evAddOpen='';startAddEt(true);return;}
  evAddOpen=evAddOpen===key?'':key;
  evRepaint();axFocus('ev-new-'+key);
}
function evCancelAdd(){evSync();evAddOpen='';evRepaint();}
function evSaveAdd(key){
  const el=document.getElementById('ev-new-'+key);
  const val=el?el.value.trim():'';
  if(!val){showToast('Enter a name first','error');if(el)el.focus();return;}
  if(/['"]/.test(val)){showToast('Quotes are not allowed in a name','error');return;}
  evSync();
  const d=evDraft,cat=ecCatByName(d.cat);
  const list=key==='cat'?ecLive('cat'):ecSubsOf(cat?cat.id:0);
  const twin=list.find(function(x){return x.name.toLowerCase()===val.toLowerCase();});
  if(twin){
    if(twin.status!=='Active'){showToast(twin.name+' is '+twin.status,'info','Mark it Active from its own page to use it.');return;}
    if(twin.anm&&!evModalOpen){showToast('An event cannot become an announcement','error','Add the announcement from + Add instead.');return;}
    showToast(val+' already exists','info','It has been selected for you.');
    if(key==='cat'){d.cat=twin.name;d.sub='';}else d.sub=twin.name;
  }else{
    const r=ecQuickAdd(key,val,key==='sub'?cat.id:null);
    if(key==='cat'){d.cat=r.name;d.sub='';}else d.sub=r.name;
    showToast(EC_KIND[key].noun+' added','success','"'+val+'" is now an option.');
  }
  if(evModalOpen&&ecIsAnmName(d.cat)&&!d.anm)d.anm=anmEvBlank();
  evAddOpen='';evRepaint();
}
/* Back from the Add Email Template form with the new template picked. */
function evTemplateMade(t){
  if(!evDraft)return;
  evDraft.tpl=t.name;evDraft.subject=t.subject;
}
function evFieldsHTML(){
  const d=evDraft;
  const label=function(text,req){return '<label class="ep-form-label">'+text+(req?' <span class="req">*</span>':'')+'</label>';};
  const sel=function(id,text,opts,val,ph,req,hook){return '<div class="ep-form-group">'+label(text,req)+apCS(id,opts,val,ph,hook)+'</div>';};
  /* A dimmed field says what it is waiting for. */
  const dep=function(on,inner,why){return '<div class="ep-form-group'+(on?'':' exp-dim')+'">'+inner+(on?'':'<div class="ea-hint">'+why+'</div>')+'</div>';};
  /* The leave policy form's sections. ep-form-full lets one sit in the panel's
     own grid when the form is edited there. */
  const sec=function(title,body){return '<div class="policy-form-section ev-fsec ep-form-full"><div class="policy-section-title">'+title+'</div><div class="ep-form-grid">'+body+'</div></div>';};
  const fields=evFieldsOf(d.table);
  const fields2=fields.filter(function(f){return f!==d.f1;});
  const tplOpts=emailTemplatesData.filter(function(t){return t.status==='Active'||t.name===d.tpl;}).map(function(t){return t.name;}).reverse();
  /* First, because it decides the rest: Announcement turns the form into the
     announcement form. Edit leaves Announcement out of the list. */
  const anm=evIsAnm();
  const catSec=sec('Category',
      '<div class="ep-form-group">'+axAddLabel('Event Category',true,'cat','evOpenAdd')
        +apCS('ev-e-cat',ecCatOptions(d.cat,!evModalOpen),d.cat,'Select Category','evFormHook')
        +axInlineAdd('ev','cat',evAddOpen,'Category Name','evSaveAdd','evCancelAdd')+'</div>'
      +dep(!!d.cat,axAddLabel('Event Sub Category',true,d.cat?'sub':'','evOpenAdd')
        +axCS('ev-e-sub',ecSubOptions(d.cat,d.sub),d.sub,'Select Sub Category')
        +axInlineAdd('ev','sub',evAddOpen,'Sub Category Name','evSaveAdd','evCancelAdd'),'Pick a Category first.')
      +(anm?'<div class="ep-form-group ep-form-full"><div class="ev-anm-note">'+ANM_ICO.megaphone
        +'<span>Posted to the Announcements panel on the employee dashboard, for the audience and dates below. The sub category is what it is filed under.</span></div></div>':''));
  if(anm)return catSec+anmEvFieldsHTML(d.anm,sec);
  return catSec+sec('Event Details',
      '<div class="ep-form-group ep-form-full"><label class="ep-form-label" for="ev-e-name">Event Name <span class="req">*</span></label>'
        +'<input class="ep-form-input" id="ev-e-name" value="'+attrSafe(d.name)+'" placeholder="e.g. Deal Pending Approval"></div>'
      +sel('ev-e-type','Event Type',EV_TYPES,d.type,'Select Event Type',true)
      +'<div class="ep-form-group"><label class="ep-form-label" for="ev-e-number">Event Number <span class="req">*</span></label>'
        +'<input class="ep-form-input" id="ev-e-number" type="number" min="1" step="1" value="'+attrSafe(d.number)+'" placeholder="Event Number"></div>'
      /* Status is only asked when adding; alone on its row, Event For takes the width. */
      +'<div class="ep-form-group'+(evModalOpen?'':' ep-form-full')+'">'+label('Event For',true)+apCS('ev-e-for',ET_FOR,d.aud,'Select Event For')+'</div>'
      +(evModalOpen?sel('ev-e-status','Status',EV_TILES,d.status,'Select Status',true):''))
    +sec('Trigger',
      sel('ev-e-service','Service Group',ET_SERVICES,d.service,'Select Service Group',true)
      +sel('ev-e-process','Process Type',ET_PROCESS,d.process,'Select Process Type',true)
      +'<div class="ep-form-group ep-form-full">'+label('Table Level',true)+apCS('ev-e-table',Object.keys(EV_TABLES),d.table,'Select Table Level','evFormHook')+'</div>'
      +dep(!!d.table,label('Field Level One')+axCS('ev-e-f1',fields,d.f1,'Select Field','evFormHook'),'Pick a Table Level first.')
      +dep(!!d.f1,label('Data Level One',!!d.f1)+axCS('ev-e-d1',evDataOf(d.table,d.f1),d.d1,'Select Value'),'Pick Field Level One first.')
      +dep(!!d.f1,label('Field Level Two')+axCS('ev-e-f2',fields2,d.f2,'Select Field','evFormHook'),'Pick Field Level One first.')
      +dep(!!d.f2,label('Data Level Two',!!d.f2)+axCS('ev-e-d2',evDataOf(d.table,d.f2),d.d2,'Select Value'),'Pick Field Level Two first.')
      +'<div class="ep-form-group ep-form-full"><label class="ep-form-label" for="ev-e-comment">Trigger Comment <span class="req">*</span></label>'
        +'<textarea class="ep-form-input ax-notes" id="ev-e-comment" placeholder="e.g. Sent to HR once, when the status changes">'+sbEsc(d.comment)+'</textarea></div>')
    +sec('Rule and Options',
      '<div class="ep-form-group ep-form-full"><label class="ep-form-label" for="ev-e-rule">Business Rule <span class="req">*</span></label>'
        +'<textarea class="ep-form-input ax-notes" id="ev-e-rule" placeholder="e.g. Tell HR when the closing team updates a deal">'+sbEsc(d.rule)+'</textarea></div>'
      +'<div class="ep-form-group ep-form-full ev-opts">'
        +'<label class="hdoc-check"><input type="checkbox" id="ev-e-schedule"'+(d.schedule?' checked':'')+'><span>Schedule Event</span></label>'
        +'<label class="hdoc-check"><input type="checkbox" id="ev-e-promo"'+(d.promo?' checked':'')+'><span>Promotion</span></label>'
      +'</div>')
    +sec('Email',
      '<div class="ep-form-group">'+axAddLabel('Event Template',false,'tpl','evOpenAdd')
        +axCS('ev-e-tpl',tplOpts,d.tpl,'Select Template','evFormHook')+'</div>'
      +'<div class="ep-form-group'+(d.tpl?'':' exp-dim')+'"><label class="ep-form-label" for="ev-e-subject">Template Subject'+(d.tpl?' <span class="req">*</span>':'')+'</label>'
        +'<input class="ep-form-input" id="ev-e-subject" value="'+attrSafe(d.subject)+'" placeholder="Template Subject" oninput="evPreviewLive()"'+(d.tpl?'':' disabled')+'>'
        +(d.tpl?'':'<div class="ea-hint">Pick a Template first.</div>')+'</div>'
      +'<div class="ep-form-group ep-form-full et-pv-wrap">'
        +'<button type="button" class="btn-outline" id="ev-pv-btn" onclick="evPreviewToggle()"'+(d.tpl?'':' disabled title="Pick a Template first"')+'>'+(evPreviewOpen?'Hide Preview':'Preview Email')+'</button>'
        +'<div class="et-pv" id="ev-pv">'+evPreviewBody()+'</div></div>');
}
function evCheck(d){
  const need=[['name','Event Name'],['type','Event Type'],['number','Event Number'],['cat','Event Category'],['sub','Event Sub Category'],['aud','Event For'],
    ['service','Service Group'],['process','Process Type'],['table','Table Level'],['rule','Business Rule'],['comment','Trigger Comment']];
  if(evModalOpen)need.push(['status','Status']);
  if(d.f1)need.push(['d1','Data Level One']);
  if(d.f2)need.push(['d2','Data Level Two']);
  if(d.tpl)need.push(['subject','Template Subject']);
  for(let i=0;i<need.length;i++){if(!String(d[need[i][0]]||'').trim()){showToast(need[i][1]+' is required','error');return false;}}
  if(!/^[1-9]\d*$/.test(d.number)){showToast('Event Number must be a whole number','error');return false;}
  return true;
}
/* The draft holds names, as the dropdowns do; the record holds ids. */
function evFromDraft(d){
  const c=ecCatByName(d.cat),s=c?ecSubByName(c.id,d.sub):null,t=d.tpl?etByName(d.tpl):null;
  return {name:d.name,type:d.type,number:Number(d.number),catId:c?c.id:null,subId:s?s.id:null,aud:d.aud,service:d.service,process:d.process,
    table:d.table,f1:d.f1,d1:d.d1,f2:d.f2,d2:d.d2,rule:d.rule,comment:d.comment,schedule:!!d.schedule,promo:!!d.promo,
    tplId:t?t.id:null,subject:t?d.subject:''};
}
function evSaveEdit(){
  const e=evRec(evSelectedId);if(!e||!evDraft)return;
  evSync();
  if(!evCheck(evDraft))return;
  Object.assign(e,evFromDraft(evDraft));
  evDropEdit();
  renderADTPage();
  showToast('Event updated','success',e.name+' saved.');
}

/* ── + Add ─────────────────────────────────────────────────────────────── */
/* mode 'anm' opens it with the Announcement category already picked
   (anmStartCreate, the quick action "Create an announcement"). */
function startAddEv(mode){
  if(page!=='events')navigatePage('events');
  evDropEdit();
  evDraft=evDraftOf(null);
  const ac=mode==='anm'?ecAnmCat():null;
  if(ac&&ac.status==='Active'){evDraft.cat=ac.name;evDraft.anm=anmEvBlank();}
  evModalOpen=true;
  renderADTPage();
  if(evIsAnm())anmFormSync();
}
function cancelAddEv(){evModalOpen=false;evDraft=null;evAddOpen='';evPreviewOpen=false;renderADTPage();}
function buildAddEvModalHTML(){
  return '<div class="ct-modal-overlay">'
    +'<div class="ct-modal ct-modal--form ax-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Add Event</span>'
      +'<button class="ct-modal-close" onclick="cancelAddEv()">'+AX_ICO.x+'</button></div>'
    +'<p class="ct-modal-sub">When a record reaches a state, send an email to an audience - or, under Announcement, post a notice to the employee dashboard. Fields marked <span class="req">*</span> are required.</p>'
    +'<div class="ep-form-card ev-form-card" id="ev-m-grid">'+evFieldsHTML()+'</div>'
    +'<div class="ct-modal-foot" id="ev-m-foot"><div class="ct-modal-btns">'
      +'<button class="ep-cancel-btn" onclick="cancelAddEv()">Cancel</button>'
      +'<button class="ep-save-btn" onclick="submitAddEv()">'+(evIsAnm()?'Publish Announcement':'Add Event')+'</button>'
    +'</div></div>'
    +'</div></div>';
}
function submitAddEv(){
  evSync();
  const d=evDraft;
  if(evIsAnm()){
    if(!d.sub){showToast('Event Sub Category is required','error','Pick what this announcement is filed under.');return;}
    const f=anmEvRecord(d.anm,d.sub);
    if(!anmCheck(f))return;
    const a=anmCreate(f);
    evModalOpen=false;evDraft=null;evAddOpen='';evPreviewOpen=false;
    evShowAnm(a.id);
    anmPublishedToast(a);
    return;
  }
  if(!evCheck(d))return;
  const s=stampNow();
  const e=Object.assign({id:evNextId++,key:evNextKey++,status:d.status,createdBy:CURRENT_USER,createdAt:axStamp()},evFromDraft(d));
  e.logs=[{date:s.date,time:s.time,user:CURRENT_USER,status:e.status,action:'Event created as '+e.status+'.'}];
  eventsData.unshift(e);
  lpLanded('events',e.id);
  evModalOpen=false;evDraft=null;evAddOpen='';evPreviewOpen=false;
  renderADTPage();
  showToast('Event added','success',e.name+' · '+evKey(e)+' for '+e.aud+'.');
}

/* ── Listing ───────────────────────────────────────────────────────────── */
/* THE ROW IDENTIFIES, THE PANEL EXPLAINS. A row is the event's name, who it is for
   and where it is filed. Event Type, Event Number, Sub Category, Business Rule
   and the date are on the panel, and the search box still finds them. */
function buildEventsHTML(){
  const live=evLive(),anns=typeof annData!=='undefined'?annData:[];
  const count=function(s){return live.filter(function(e){return e.status===s;}).length+anns.filter(function(a){return a.status===s;}).length;};
  const shown=evSearchRows(evRows(),evQ);
  const q=String(evQ||'').trim().toLowerCase();
  const shownAnm=evAnmRows().filter(function(a){return !q||lpSearchMatch(q,a)||a.annId.toLowerCase().indexOf(q)>=0;});
  if(evSelectedId&&!shown.some(function(e){return e.id===evSelectedId;}))evSelectedId=null;
  if(anmSelectedId&&(evSelectedId||!shownAnm.some(function(a){return a.id===anmSelectedId;}))){anmSelectedId=null;anmEditMode=false;anmEditId=null;}
  const sig=[evForF,evCatF,evSubF,evProcessF,evServiceF,evStatusF,evQ].join('|');
  const pgn=listPage('events',sig,evMergeRows(shown,shownAnm).map(function(x,i){
    if(x.a){
      const a=x.a,aud=anmAudText(a);
      /* Drawn like an event row, with the audience under Event For. Pin and
         Visibility (Live / Scheduled / Expired) are on the panel only. */
      return '<tr class="ev-row anm-row'+(anmSelectedId===a.id?' lp-row-selected':'')+'" id="anm-row-'+a.id+'" style="cursor:pointer" onclick="openAnmSidebar('+a.id+')">'
        +'<td class="lp-c-n">'+(i+1)+'</td>'
        +'<td><div class="lp-c-main ax-c-link ax-c-trunc" title="'+attrSafe(a.title)+'">'+sbEsc(a.title)+'</div><div class="lp-c-sub">'+a.annId+'</div></td>'
        +'<td><div class="lp-c-plain">'+EV_ANM_FOR+'</div><div class="lp-c-sub ax-c-trunc" title="'+attrSafe(aud)+'">'+sbEsc(aud)+'</div></td>'
        +'<td><div class="lp-c-plain">'+sbEsc((ecAnmCat()||{name:'Announcement'}).name)+'</div><div class="lp-c-sub">'+sbEsc(a.category)+'</div></td>'
        +'<td>'+axBadge(statusTone(a.status),a.status)+'</td>'
        +'<td onclick="event.stopPropagation()">'+rowLogCell('announcements',a.id)+'</td>'
        +'</tr>';
    }
    const e=x.e,sub=evName(e);
    return '<tr class="ev-row'+(evSelectedId===e.id?' lp-row-selected':'')+'" id="ev-row-'+e.id+'" style="cursor:pointer" onclick="openEvSidebar('+e.id+')">'
      +'<td class="lp-c-n">'+(i+1)+'</td>'
      +'<td><div class="lp-c-main ax-c-link ax-c-trunc" title="'+attrSafe(sub)+'">'+sbEsc(sub)+'</div><div class="lp-c-sub">'+evKey(e)+'</div></td>'
      +'<td><div class="lp-c-plain">'+e.aud+'</div></td>'
      +'<td><div class="lp-c-plain ax-c-trunc" title="'+attrSafe(ecCatName(e.catId))+'">'+sbEsc(ecCatName(e.catId))+'</div></td>'
      +'<td>'+axBadge(statusTone(e.status),e.status)+'</td>'
      +'<td onclick="event.stopPropagation()">'+rowLogCell('events',e.id)+'</td>'
      +'</tr>';
  }),'<tr><td colspan="6" style="padding:24px;text-align:center;color:var(--gray)">No events match this filter.</td></tr>');
  const stat=function(s){
    return '<div class="listing-stat'+(evStatusF===s?' stat-selected':'')+'" onclick="evToggleStat(\''+s+'\')">'
      +'<div class="listing-stat-count" style="color:var(--st-'+statusTone(s)+'-fg)">'+count(s)+'</div><div class="listing-stat-label">'+s+'</div></div>';
  };
  return '<div class="lp-page">'
    +dashboardBackHTML()
    +'<div class="exp-top ev-top" style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:4px">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0">'
    +'<div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +lpSearchField('ev-f-q',evQ,'Search events','applyEvFilters()')
    +apCS('ev-f-for',ET_FOR.concat([EV_ANM_FOR]),evForF,'Event For')
    +apCS('ev-f-cat',evCatNames(),evCatF,'Category','evFilterCatHook')
    +evFilterSubHTML(evCatF,evSubF)
    +apCS('ev-f-process',ET_PROCESS,evProcessF,'Process Type')
    +apCS('ev-f-service',ET_SERVICES,evServiceF,'Service Group')
    +clearFiltersBtn([evForF,evCatF,evSubF,evProcessF,evServiceF,evStatusF,evQ],'resetEvFilters()')
    +'<button class="lp-pill-search" onclick="applyEvFilters()">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats">'+EV_TILES.map(stat).join('')+'</div></div>'
    +'<div class="lp-split-wrap ax-split-wrap" style="margin-top:14px" id="ev-split-wrap"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table ax-table ev-table"><thead><tr><th>S. No</th><th>Event</th><th>Event For</th><th>Category</th>'
      +'<th>Status</th><th>Action</th></tr></thead>'
    +'<tbody>'+pgn.rows+'</tbody></table>'
    +pgn.pager
    +'</div></div>'
    +'<div class="lp-split-sb'+(evSelectedId?' open':'')+'" id="ev-split-sb"><div class="lp-isb" id="ev-isb-inner">'+(evSelectedId?sbRender(renderEvSidebar,'ev'):'')+'</div></div>'
    /* An announcement row opens its own panel here, in the event panel's place. */
    +'<div class="lp-split-sb'+(anmSelectedId?' open':'')+'" id="anm-split-sb"><div class="lp-isb" id="anm-isb-inner">'+(anmSelectedId?sbRender(renderAnmSidebar,'anm'):'')+'</div></div>'
    +'</div></div>'
    /* Add Template from the event form takes the form's place, then hands back. */
    +(etModalOpen?buildAddEtModalHTML():evModalOpen?buildAddEvModalHTML():'');
}

/* ── Wiring ────────────────────────────────────────────────────────────── */
Object.assign(supportPageMeta,{'events':{title:'All Events',context:'All Events',filters:[],columns:[],rows:[]}});
if(typeof LP_ROW_PREFIX!=='undefined')LP_ROW_PREFIX['events']='ev';
Object.assign(SB_STATUS_TONE,{deleted:'bad'});
sbDraftReg('ev',{
  dirty:function(){
    if(!evEditing||evModalOpen||etModalOpen)return false;
    evSync();
    return JSON.stringify(evDraft)!==evDraftOrig;
  },
  drop:evDropEdit});
