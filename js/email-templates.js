/* ══ EMAIL TEMPLATES ════════════════════════════════════════════════════════
   Governance → Email Templates. The email an event sends (js/events.js).

   ONE PAGE. The old screen had two sidebar entries, Add New Email Template and
   View All Email Templates. Here the listing is the module and + Add opens the
   form on it, as on every other module.

   Built from the same parts as Capping Limit (js/capping-limit.js):
   lpSearchField + apCS filters with listing-stats tiles, an .lp-table in an
   .lp-split-wrap, the .lp-isb-* panel behind the row action and a
   .ct-modal--form for + Add. Only the editor and the mail preview are new.

   THE EDITOR IS WHAT AN EMAIL NEEDS. Formatting, lists, links, images and the
   merge fields a template actually depends on ([First_Name]...). The old
   toolbar's print, media, emoji and table menus are gone. Pasted text arrives
   as text, so nothing from Word or a web page comes along with it.

   STATUS: a new template picks Active or Inactive and starts Inactive, as the
   old form did. After that it only moves from Logs, with a comment. A template
   an event still sends cannot be deleted: the move is not offered and the Logs
   form says which events to free first. */

/* ── Reference data ────────────────────────────────────────────────────── */
const ET_FOR=['User','Admin','Vendor','Consultant','Sub Contracting','Education'];
const ET_PROCESS=['All','Onboarding','Payroll','Compliance','Offboarding'];
const ET_SERVICES=['All','EOR','PEO','Immigration','Contractor'];
const ET_TYPES=['Plain','HTML'];
const ET_FIELDS=['First_Name','Last_Name','Employee_Name','Company_Name','Entity_Name','Reporting_Manager','Effective_Date','Login_Link'];
const ET_TILES=['Active','Inactive'];
const ET_MOVES={'Active':['Inactive','Deleted'],'Inactive':['Active','Deleted'],'Deleted':[]};
const ET_MOVE_LABELS={'Active':'Mark Active','Inactive':'Mark Inactive','Deleted':'Delete'};

/* ── Seed data ─────────────────────────────────────────────────────────── */
function etSeed(id,name,aud,process,service,type,subject,status,by,at,content){
  return {id:id,key:id,name:name,aud:aud,process:process,service:service,type:type,subject:subject,
    status:status,createdBy:by,createdAt:at,content:content};
}
const ET_SIGN='<p>Regards,<br>Team Opendhi</p>';
const emailTemplatesData=[
  etSeed(12,'New Entity Alert','Admin','All','All','Plain','New entity created: [Entity_Name]','Active','Tarak Swain','4 Nov 2026 | 04:30:00 PM','<p>Hello,</p><p>A new entity, [Entity_Name], has been created for [Company_Name]. Please check its setup before it goes live.</p><p><a href="[Login_Link]">Open ADT</a></p>'+ET_SIGN),
  etSeed(11,'Timesheet Reminder','User','Payroll','All','Plain','Your timesheet is due, [First_Name]','Active','Meera Iyer','2 Oct 2026 | 10:15:00 AM','<p>Hi [First_Name],</p><p>Your timesheet for this period has not been submitted yet. Please submit it by [Effective_Date] so it can reach [Reporting_Manager] for approval.</p>'+ET_SIGN),
  etSeed(10,'Employee Welcome','User','Onboarding','All','HTML','[First_Name] – Let\'s Get [Company_Name] Started on ADT','Active','Tarak Swain','6 Apr 2026 | 06:00:00 PM','<h2>Welcome to ADT, [First_Name]</h2><p>[Company_Name] is now set up on ADT. Here is what to do first:</p><ol><li>Complete your profile</li><li>Upload your documents</li><li>Invite your team</li></ol><p><a href="[Login_Link]">Sign in to ADT</a></p>'+ET_SIGN),
  etSeed(9,'Exit Interview Invite','User','Offboarding','EOR','Plain','Your exit interview, [First_Name]','Inactive','Meera Iyer','14 Jan 2026 | 05:45:00 PM','<p>Hi [First_Name],</p><p>We would like to hear about your time at [Company_Name]. HR will share a slot before [Effective_Date].</p>'+ET_SIGN),
  etSeed(8,'Course Enrolment','Education','Onboarding','All','Plain','You are enrolled, [First_Name]','Active','Syed Ayaz','8 Sep 2023 | 11:10:00 AM','<p>Hi [First_Name],</p><p>Your enrolment is confirmed. The course starts on [Effective_Date].</p>'+ET_SIGN),
  etSeed(7,'Sub Contractor Work Order','Sub Contracting','Compliance','Contractor','Plain','New work order for [Company_Name]','Active','Syed Ayaz','2 Aug 2023 | 03:20:00 PM','<p>Hello,</p><p>A new work order has been raised for [Company_Name]. Please review it and confirm before [Effective_Date].</p>'+ET_SIGN),
  etSeed(6,'Consultant Onboarding','Consultant','Onboarding','Contractor','Plain','Welcome aboard, [First_Name]','Active','Syed Ayaz','21 Jun 2023 | 09:40:00 AM','<p>Hi [First_Name],</p><p>Your consulting agreement with [Company_Name] is active from [Effective_Date].</p>'+ET_SIGN),
  etSeed(5,'Document Change Notification','Admin','Compliance','All','Plain','Document Change Notification: Employee [Employee_Name]','Active','Tarak Swain','16 May 2023 | 06:00:00 PM','<p>Hello,</p><p>[Employee_Name] has changed a document on their profile. Please review it in HR Docs.</p>'+ET_SIGN),
  etSeed(4,'Admin Action Required','Admin','All','All','Plain','Action needed for [Company_Name]','Active','Tarak Swain','24 Apr 2023 | 12:00:00 PM','<p>Hello,</p><p>An item needs your attention for [Company_Name]. Please sign in to review it.</p><p><a href="[Login_Link]">Open ADT</a></p>'+ET_SIGN),
  etSeed(3,'Vendor Salary Processed','Vendor','Payroll','All','Plain','Salary processed for [Company_Name]','Active','Tarak Swain','12 May 2023 | 12:30:00 PM','<p>Hello,</p><p>The salary details for [Company_Name] have been processed for this cycle.</p>'+ET_SIGN),
  etSeed(2,'Vendor Payment Reminder','Vendor','Payroll','All','Plain','Payment reminder for [Company_Name]','Inactive','Meera Iyer','3 Mar 2023 | 09:15:00 AM','<p>Hello,</p><p>A payment for [Company_Name] is due on [Effective_Date].</p>'+ET_SIGN),
  etSeed(1,'Entity Verification','Admin','Compliance','EOR','Plain','Verify [Entity_Name]','Active','Tarak Swain','20 Jan 2023 | 10:00:00 AM','<p>Hello,</p><p>[Entity_Name] is waiting for verification. Please check its documents.</p>'+ET_SIGN)
];
let etNextId=13;

/* ── Derived values ────────────────────────────────────────────────────── */
function etRec(id){return emailTemplatesData.find(function(x){return x.id===id;})||null;}
function etByName(name){return emailTemplatesData.find(function(x){return x.status!=='Deleted'&&x.name===name;})||null;}
function etKey(t){return 'ET-'+String(t.key).padStart(3,'0');}
/* The live events that send this template. */
function etEvents(t){return typeof evForTemplate==='function'?evForTemplate(t.id):[];}
function etPlural(n,w){return n+' '+w+(n===1?'':'s');}
function etText(html){
  const d=document.createElement('div');d.innerHTML=html||'';
  return (d.textContent||'').replace(/\s+/g,' ').trim();
}
/* Merge fields read as tags. Only text is touched, never a tag's attributes:
   a link can point at [Login_Link]. */
function etMark(html){
  return String(html||'').replace(/(<[^>]*>)|\[[A-Za-z_]+\]/g,function(m,tag){return tag?tag:'<span class="et-tag">'+m+'</span>';});
}
/* The mail as it goes out, also shown on an event's Email tab. */
function etPreviewHTML(t,subject){
  return '<div class="et-mail">'
    +'<div class="et-mail-hd">'
      +'<div class="et-mail-row"><span>Subject</span><b>'+etMark(sbEsc(subject||t.subject))+'</b></div>'
      +'<div class="et-mail-row"><span>To</span><div>'+t.aud+' <span class="ax-sub">'+t.type+' email</span></div></div>'
    +'</div>'
    +'<div class="et-mail-body">'+etMark(t.content)+'</div>'
    +'</div>';
}

const ET_ICO={
  hero:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>',
  layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  undo:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>',
  redo:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>',
  left:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></svg>',
  center:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="5" y1="18" x2="19" y2="18"/></svg>',
  right:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="6" y1="18" x2="20" y2="18"/></svg>',
  ul:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
  ol:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><path d="M4 5l1.5-1v5"/><path d="M4 14h3l-3 4h3"/></svg>',
  link:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  image:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  clear:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7V4h16v3"/><line x1="12" y1="4" x2="9" y2="20"/><line x1="4" y1="20" x2="20" y2="4"/></svg>'
};

/* ── State ─────────────────────────────────────────────────────────────── */
let etSelectedId=null,etTab='basic-details';
let etForF='',etServiceF='',etTypeF='',etStatusF='',etQ='';
let etEditing=false,etDraft=null,etDraftOrig='',etModalOpen=false;
/* + Add from the event form: the template is made there, so saving goes back
   to that event's form with it picked instead of to this listing. */
let etFromEvent=false;
/* The form's preview: open or shut, never saved with the template. */
let etPreviewOpen=false;

/* ── Filters ───────────────────────────────────────────────────────────── */
function etRows(){
  return emailTemplatesData.filter(function(t){
    if(t.status==='Deleted')return false;
    if(etForF&&t.aud!==etForF)return false;
    if(etServiceF&&t.service!==etServiceF)return false;
    if(etTypeF&&t.type!==etTypeF)return false;
    if(etStatusF&&t.status!==etStatusF)return false;
    return true;
  });
}
/* Name, subject and key. Not the shared search: that reads every field, and
   the content field is markup, so "strong" would find half the templates. */
function etSearchRows(rows,q){
  const n=String(q||'').trim().toLowerCase();
  if(!n)return rows;
  return rows.filter(function(t){return (t.name+' '+t.subject+' '+etKey(t)).toLowerCase().indexOf(n)>=0;});
}
function etToggleStat(v){etStatusF=etStatusF===v?'':v;etSelectedId=null;renderADTPage();}
function applyEtFilters(){
  etForF=getCSValue('et-f-for');
  etServiceF=getCSValue('et-f-service');
  etTypeF=getCSValue('et-f-type');
  etQ=lpSearchValue('et-f-q');
  etSelectedId=null;renderADTPage();
}
function resetEtFilters(){etForF='';etServiceF='';etTypeF='';etStatusF='';etQ='';etSelectedId=null;renderADTPage();}

/* ── Detail panel ──────────────────────────────────────────────────────── */
function etDropEdit(){etEditing=false;etDraft=null;etPreviewOpen=false;}
function openEtSidebar(id,tab){
  if(etSelectedId!=null&&etSelectedId!==id&&sbLeaveGuard('et',function(){openEtSidebar(id,tab);}))return;
  if(etSelectedId!==id)etDropEdit();
  etTab=tab||sbKeepTab(etSelectedId,etTab);etSelectedId=id;
  const sb=document.getElementById('et-split-sb');if(sb)sb.classList.add('open');
  isbTab('et',renderEtSidebar);
  document.querySelectorAll('.et-row').forEach(function(r){r.classList.toggle('lp-row-selected',r.id==='et-row-'+id);});
}
function closeEtSidebar(){
  if(sbLeaveGuard('et',closeEtSidebar))return;
  etDropEdit();etSelectedId=null;
  const sb=document.getElementById('et-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.et-row').forEach(function(r){r.classList.remove('lp-row-selected');});
}
function navEtTab(t){if(etEditing&&!sbHasDraft('et'))etDropEdit();etTab=t;isbTab('et',renderEtSidebar);}
/* From an event's panel to the template it sends. */
function etGoTo(id){
  resetEtFilters();
  etSelectedId=id;etTab='template';
  navigatePage('email-templates');
}

function etSeedLogs(t){
  const p=String(t.createdAt).split(' | ');
  const fx=[{date:p[0],time:p[1]||'09:00:00 AM',user:t.createdBy,status:'Active',action:'Email template created.'}];
  if(t.status==='Inactive')fx.unshift({date:p[0],time:'06:00:00 PM',user:'Shaun Test1',status:'Inactive',action:'No longer in use.'});
  return seedLogs(t,fx);
}
const ET_STEP_TITLE={'Active':'Template Active','Inactive':'Template Inactive','Deleted':'Template Deleted'};
function etWorkflow(t){
  const done=wfDoneFromLogs(etSeedLogs(t),function(st){return ET_STEP_TITLE[st]||st;});
  const LEFT={'Inactive':[{title:'Mark Active or Delete',owner:'Company Admin'}]};
  return wfPlan(done,LEFT[t.status]||[]);
}
/* Deleting a template an event sends would leave that event with no email. */
function etMoves(t){
  return (ET_MOVES[t.status]||[]).filter(function(m){return m!=='Deleted'||!etEvents(t).length;});
}

function renderEtSidebar(){
  const t=etRec(etSelectedId);if(!t)return '';
  const used=etEvents(t);
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'template',label:'Template'},{id:'events',label:'Events'},{id:'logs',label:'Logs'},{id:'history',label:'History'},{id:'workflow',label:'Workflow'}];
  const tabBar=axTabBar('et',tabs,etTab,'navEtTab','closeEtSidebar');
  const hero=function(editing,edit){return sbHero({icon:ET_ICO.hero,name:sbEsc(t.name),meta:[etKey(t),t.aud,t.type],
    status:axBadge(statusTone(t.status),t.status),editing:editing,onEdit:edit});};
  let body='';
  if((etTab==='basic-details'||etTab==='template')&&etEditing){
    body=hero(true)+axInlineFormHTML(etFieldsHTML(),'etCancelEdit()','etSaveEdit()');
  }else if(etTab==='basic-details'){
    body=hero(false,'etStartEdit()')
      +'<div class="lp-sb-detail-grid">'
      +axField(AX_ICO.fTag,'Template Name',sbEsc(t.name))
      +axField(AX_ICO.fUser,'Template For',t.aud)
      +axField(ET_ICO.layers,'Process Type',t.process)
      +axField(AX_ICO.fBuild,'Service Group',t.service)
      +axField(AX_ICO.fBox,'Template Type',t.type)
      +axField(AX_ICO.fHash,'Events',used.length?etPlural(used.length,'event')+' <span class="ax-sub"><a class="rb-link" onclick="navEtTab(\'events\')">See the list</a></span>':'Not used by any event yet')
      +axField(AX_ICO.fMail,'Subject',etMark(sbEsc(t.subject)),true)
      +axField(AX_ICO.fUser,'Created By',t.createdBy)
      +axField(AX_ICO.fCal,'Created On',String(t.createdAt).split(' | ')[0])
      +'</div>';
  }else if(etTab==='template'){
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Template</span>'+sbEditBtn('etStartEdit()')+'</div>'+etPreviewHTML(t);
  }else if(etTab==='events'){
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Events Using This Template</span><span class="ax-count">'+etPlural(used.length,'event')+'</span></div>'
      +evUsedByHTML(used,'No event sends this template yet.');
  }else if(etTab==='logs'){
    body=lpLogsView(etSeedLogs(t),etLogFormHTML(t,etMoves(t)),{labels:ET_MOVE_LABELS});
  }else if(etTab==='history'){
    body=sbHistoryHTML(t);
  }else{
    body=wfTimelineHTML(etWorkflow(t));
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
function etLogFormHTML(t,moves){
  const n=etEvents(t).length;
  return '<div class="lp-logs-form">'
    +'<div class="lp-logs-form-header"><span class="lp-log-dot"></span>'+t.status+'</div>'
    +'<p class="lp-logs-form-sub">Mark this template active or inactive, or delete it, and say why'
      +(n?'. Delete is available once no event uses it - '+etPlural(n,'event')+' still '+(n===1?'sends':'send')+' it.':'')+'</p>'
    +lpLogStatusField('et-log-status-sel',t.status,[t.status].concat(moves))
    +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
    +'<textarea class="lp-logs-form-textarea" id="et-log-comment-inp" placeholder="Enter comment"></textarea>'
    +'<div style="display:flex;gap:10px;margin-top:12px">'
    +'<button class="ep-cancel-btn" style="flex:1" onclick="navEtTab(\'logs\')">Cancel</button>'
    +'<button class="lp-logs-save-btn" style="flex:1" onclick="etSaveLog('+t.id+')">Submit</button>'
    +'</div></div>';
}
function etSaveLog(id){
  const t=etRec(id);if(!t)return;
  etSeedLogs(t);
  if(!lpCommitLog(t,'et-log-status-sel','et-log-comment-inp',t.logs))return;
  if(t.status==='Deleted'){
    etDropEdit();etSelectedId=null;renderADTPage();
    showToast('Email template deleted','success',etKey(t)+' · '+t.name+' is no longer available.');return;
  }
  renderADTPage();
  const live=t.status==='Inactive'?etEvents(t).filter(function(e){return e.status==='Active';}).length:0;
  showToast('Log added','success',etKey(t)+' is now '+t.status+'.'+(live?' '+etPlural(live,'active event')+' can no longer send it.':''));
}

/* ── The editor ────────────────────────────────────────────────────────── */
function etBody(){return document.getElementById('et-e-body');}
/* Buttons act on mousedown with the default prevented, so the caret stays in
   the editor. */
function etTool(cmd,val,ico,title){
  return '<button type="button" class="csag-tool" title="'+title+'" onmousedown="event.preventDefault();etCmd(\''+cmd+'\''+(val?',\''+val+'\'':'')+')">'+ico+'</button>';
}
function etCmd(cmd,val){
  const b=etBody();if(!b)return;
  b.focus();
  document.execCommand(cmd,false,val||null);
}
/* A merge field goes wherever the caret is: the Subject box or the body. */
function etInsertField(name){
  const tag='['+name+']',s=document.activeElement;
  if(s&&s.id==='et-e-subject'){s.setRangeText(tag,s.selectionStart,s.selectionEnd,'end');etPreviewLive();return;}
  etCmd('insertText',tag);
}
function etPaste(e){
  e.preventDefault();
  document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain'));
}
/* The link box and the file picker take focus, so the selection is held here
   and put back before the command runs. */
let etRange=null;
function etKeepRange(){
  const sel=window.getSelection(),b=etBody();
  etRange=sel.rangeCount&&b&&b.contains(sel.anchorNode)?sel.getRangeAt(0).cloneRange():null;
}
function etPutRange(){
  const b=etBody();if(!b)return;
  b.focus();
  if(etRange){const sel=window.getSelection();sel.removeAllRanges();sel.addRange(etRange);}
}
function etLinkOpen(){
  etKeepRange();
  const bar=document.getElementById('et-linkbar');if(!bar)return;
  bar.classList.add('open');
  const inp=document.getElementById('et-link-url');inp.value='';inp.focus();
}
function etLinkClose(){const bar=document.getElementById('et-linkbar');if(bar)bar.classList.remove('open');}
function etLinkApply(){
  const url=document.getElementById('et-link-url').value.trim();
  if(!/^(https?:\/\/|mailto:|\[[A-Za-z_]+\]$)/i.test(url)){
    showToast('Enter a full link','error','Start with https:// or mailto:, or use a field like [Login_Link].');return;
  }
  etPutRange();
  /* Nothing selected: the address itself becomes the link's text. */
  if(window.getSelection().isCollapsed)document.execCommand('insertHTML',false,'<a href="'+attrSafe(url)+'">'+sbEsc(url)+'</a>');
  else document.execCommand('createLink',false,url);
  etLinkClose();
}
function etPickImage(input){
  const f=input.files&&input.files[0];input.value='';
  if(!f)return;
  if(!/^image\//.test(f.type)){showToast('Choose an image file','error');return;}
  const rd=new FileReader();
  rd.onload=function(){etPutRange();document.execCommand('insertImage',false,rd.result);};
  rd.readAsDataURL(f);
}
function etEditorHTML(html){
  const sep='<span class="csag-tool-sep"></span>';
  return '<div class="et-ed">'
    +'<div class="csag-tools et-tools">'
      +etTool('undo','',ET_ICO.undo,'Undo')+etTool('redo','',ET_ICO.redo,'Redo')+sep
      +'<button type="button" class="csag-tool" title="Paragraph" onmousedown="event.preventDefault();etCmd(\'formatBlock\',\'p\')">P</button>'
      +'<button type="button" class="csag-tool" title="Heading" onmousedown="event.preventDefault();etCmd(\'formatBlock\',\'h2\')">H1</button>'
      +'<button type="button" class="csag-tool" title="Subheading" onmousedown="event.preventDefault();etCmd(\'formatBlock\',\'h3\')">H2</button>'+sep
      +'<button type="button" class="csag-tool csag-tool-bold" title="Bold" onmousedown="event.preventDefault();etCmd(\'bold\')">B</button>'
      +'<button type="button" class="csag-tool csag-tool-italic" title="Italic" onmousedown="event.preventDefault();etCmd(\'italic\')">I</button>'
      +'<button type="button" class="csag-tool csag-tool-underline" title="Underline" onmousedown="event.preventDefault();etCmd(\'underline\')">U</button>'+sep
      +etTool('justifyLeft','',ET_ICO.left,'Align left')+etTool('justifyCenter','',ET_ICO.center,'Align centre')+etTool('justifyRight','',ET_ICO.right,'Align right')+sep
      +etTool('insertUnorderedList','',ET_ICO.ul,'Bulleted list')+etTool('insertOrderedList','',ET_ICO.ol,'Numbered list')+sep
      +'<button type="button" class="csag-tool" title="Link" onmousedown="event.preventDefault();etLinkOpen()">'+ET_ICO.link+'</button>'
      +'<button type="button" class="csag-tool" title="Image" onmousedown="event.preventDefault();etKeepRange();document.getElementById(\'et-img-inp\').click()">'+ET_ICO.image+'</button>'
      +'<input type="file" id="et-img-inp" accept="image/*" hidden onchange="etPickImage(this)">'
      +etTool('removeFormat','',ET_ICO.clear,'Clear formatting')
    +'</div>'
    +'<div class="et-linkbar" id="et-linkbar">'
      +'<input class="ep-form-input" id="et-link-url" placeholder="https://" onkeydown="if(event.key===\'Enter\'){event.preventDefault();etLinkApply();}else if(event.key===\'Escape\'){etLinkClose();}">'
      +'<button type="button" class="ep-save-btn ax-inline-btn" onclick="etLinkApply()">Add</button>'
      +'<button type="button" class="ep-cancel-btn ax-inline-btn" onclick="etLinkClose()">Cancel</button>'
    +'</div>'
    +'<div class="et-fields"><span class="et-fields-l">Insert field</span>'
      +ET_FIELDS.map(function(f){return '<button type="button" class="et-chip" onmousedown="event.preventDefault();etInsertField(\''+f+'\')">'+f+'</button>';}).join('')
    +'</div>'
    +'<div class="et-body" id="et-e-body" contenteditable="true" spellcheck="true" role="textbox" aria-multiline="true" data-ph="Write the email here" onpaste="etPaste(event)" oninput="etPreviewLive()">'+(html||'')+'</div>'
    +'</div>';
}

/* ── Preview in the form ───────────────────────────────────────────────────
   The mail as it stands, unsaved. It opens under the editor rather than in a
   popup, and only its own box is repainted, so the caret stays in the editor
   and the preview follows what is typed. */
function etPreviewBody(){
  const d=etDraft;
  if(!etPreviewOpen||!d)return '';
  const has=etText(d.content)||/<img/i.test(d.content);
  return etPreviewHTML({aud:d.aud||'Not selected',type:d.type,content:has?d.content:'<p>Nothing written yet.</p>'},d.subject||'No subject yet');
}
function etPreviewPaint(){
  const box=document.getElementById('et-pv'),btn=document.getElementById('et-pv-btn');
  if(box)box.innerHTML=etPreviewBody();
  if(btn)btn.textContent=etPreviewOpen?'Hide Preview':'Preview Email';
}
function etPreviewToggle(){
  etSync();
  etPreviewOpen=!etPreviewOpen;
  etPreviewPaint();
  if(etPreviewOpen)etPreviewShow('et-pv');
}
function etPreviewLive(){if(etPreviewOpen){etSync();etPreviewPaint();}}
/* It opens at the foot of a long form, so it is brought into view. */
function etPreviewShow(id){const el=document.getElementById(id);if(el)el.scrollIntoView({block:'nearest',behavior:'smooth'});}

/* ── The form: panel Edit and + Add share it ───────────────────────────── */
function etStartEdit(){
  const t=etRec(etSelectedId);if(!t)return;
  etEditing=true;
  etDraft={name:t.name,aud:t.aud,process:t.process,service:t.service,type:t.type,subject:t.subject,content:t.content};
  etDraftOrig=JSON.stringify(etDraft);
  renderADTPage();
}
function etCancelEdit(){etDropEdit();renderADTPage();}
function etSync(){
  if(!etDraft)return;
  [['name','et-e-name'],['subject','et-e-subject']].forEach(function(p){const el=document.getElementById(p[1]);if(el)etDraft[p[0]]=el.value.trim();});
  [['aud','et-e-for'],['process','et-e-process'],['service','et-e-service'],['type','et-e-type'],['status','et-e-status']]
    .forEach(function(p){if(document.getElementById('csw-'+p[1]))etDraft[p[0]]=getCSValue(p[1]);});
  const b=etBody();if(b)etDraft.content=b.innerHTML;
}
function etFieldsHTML(){
  const d=etDraft;
  const sel=function(id,label,opts,val,ph,req,hook){
    return '<div class="ep-form-group"><label class="ep-form-label">'+label+(req?' <span class="req">*</span>':'')+'</label>'+apCS(id,opts,val,ph,hook)+'</div>';
  };
  return '<div class="ep-form-group"><label class="ep-form-label" for="et-e-name">Template Name <span class="req">*</span></label>'
      +'<input class="ep-form-input" id="et-e-name" value="'+attrSafe(d.name)+'" placeholder="e.g. Employee Welcome"></div>'
    +sel('et-e-for','Template For',ET_FOR,d.aud,'Select Template For',true,'etPreviewLive')
    +sel('et-e-process','Process Type',ET_PROCESS,d.process,'Select Process Type')
    +sel('et-e-service','Service Group',ET_SERVICES,d.service,'Select Service Group',true)
    +sel('et-e-type','Template Type',ET_TYPES,d.type,'Select Template Type',true,'etPreviewLive')
    +(etModalOpen?sel('et-e-status','Status',ET_TILES,d.status,'Select Status',true):'')
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label" for="et-e-subject">Subject <span class="req">*</span></label>'
      +'<input class="ep-form-input" id="et-e-subject" value="'+attrSafe(d.subject)+'" placeholder="Template Subject" oninput="etPreviewLive()"></div>'
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label">Template Content <span class="req">*</span></label>'
      +etEditorHTML(d.content)+'</div>'
    +'<div class="ep-form-group ep-form-full et-pv-wrap">'
      +'<button type="button" class="btn-outline" id="et-pv-btn" onclick="etPreviewToggle()">'+(etPreviewOpen?'Hide Preview':'Preview Email')+'</button>'
      +'<div class="et-pv" id="et-pv">'+etPreviewBody()+'</div></div>';
}
function etCheck(d,selfId){
  const need=[['name','Template Name'],['aud','Template For'],['service','Service Group'],['type','Template Type'],['subject','Subject']];
  if(etModalOpen)need.push(['status','Status']);
  for(let i=0;i<need.length;i++){if(!String(d[need[i][0]]||'').trim()){showToast(need[i][1]+' is required','error');return false;}}
  /* The name is an option in the event form's dropdown, which cannot hold quotes. */
  if(/['"]/.test(d.name)){showToast('Quotes are not allowed in a template name','error');return false;}
  if(!etText(d.content)&&!/<img/i.test(d.content)){showToast('Template Content is required','error','Write the email before saving.');return false;}
  const twin=emailTemplatesData.find(function(x){return x.id!==selfId&&x.status!=='Deleted'&&x.name.toLowerCase()===d.name.toLowerCase();});
  if(twin){showToast('A template with this name already exists','error',etKey(twin)+' · '+twin.name);return false;}
  return true;
}
function etSaveEdit(){
  const t=etRec(etSelectedId);if(!t||!etDraft)return;
  etSync();
  const d=etDraft;
  if(!etCheck(d,t.id))return;
  Object.assign(t,{name:d.name,aud:d.aud,process:d.process||'All',service:d.service,type:d.type,subject:d.subject,content:d.content});
  etDropEdit();
  renderADTPage();
  const n=etEvents(t).length;
  showToast('Email template updated','success',etKey(t)+' saved'+(n?' - '+etPlural(n,'event')+' will send this version.':'.'));
}

/* ── + Add ─────────────────────────────────────────────────────────────── */
function startAddEt(fromEvent){
  etFromEvent=!!fromEvent;
  if(!etFromEvent&&page!=='email-templates')navigatePage('email-templates');
  if(!etFromEvent)etDropEdit();
  etDraft={name:'',aud:'',process:'All',service:'All',type:'Plain',status:'Inactive',subject:'',content:''};
  etPreviewOpen=false;
  etModalOpen=true;
  renderADTPage();
}
function cancelAddEt(){etModalOpen=false;etFromEvent=false;etDraft=null;etPreviewOpen=false;renderADTPage();}
function buildAddEtModalHTML(){
  return '<div class="ct-modal-overlay">'
    +'<div class="ct-modal ct-modal--form ax-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Add Email Template</span>'
      +'<button class="ct-modal-close" onclick="cancelAddEt()">'+AX_ICO.x+'</button></div>'
    +'<p class="ct-modal-sub">The email an event sends. Use fields like [First_Name] for what changes with each person. Fields marked <span class="req">*</span> are required.</p>'
    +'<div class="ep-form-grid" id="et-m-grid">'+etFieldsHTML()+'</div>'
    +'<div class="ct-modal-foot"><div class="ct-modal-btns">'
      +'<button class="ep-cancel-btn" onclick="cancelAddEt()">Cancel</button>'
      +'<button class="ep-save-btn" onclick="submitAddEt()">Add Email Template</button>'
    +'</div></div>'
    +'</div></div>';
}
function submitAddEt(){
  etSync();
  const d=etDraft;
  if(!etCheck(d,null))return;
  const s=stampNow(),id=etNextId++;
  const t=etSeed(id,d.name,d.aud,d.process||'All',d.service,d.type,d.subject,d.status,CURRENT_USER,axStamp(),d.content);
  t.logs=[{date:s.date,time:s.time,user:CURRENT_USER,status:t.status,action:'Email template created as '+t.status+'.'}];
  emailTemplatesData.unshift(t);
  const back=etFromEvent;
  etModalOpen=false;etFromEvent=false;etDraft=null;etPreviewOpen=false;
  if(back)evTemplateMade(t);else lpLanded('email-templates',t.id);
  renderADTPage();
  showToast('Email template added','success',etKey(t)+' · '+t.name+(back?' is selected on this event.':'.'));
}

/* ── Listing ───────────────────────────────────────────────────────────── */
/* Name, subject and audience. Service Group, Process Type, Template Type and
   the events using it are on the panel. */
function buildEmailTemplatesHTML(){
  const live=emailTemplatesData.filter(function(t){return t.status!=='Deleted';});
  const count=function(s){return live.filter(function(t){return t.status===s;}).length;};
  const shown=etSearchRows(etRows(),etQ);
  if(etSelectedId&&!shown.some(function(t){return t.id===etSelectedId;}))etSelectedId=null;
  const pgn=listPage('email-templates',[etForF,etServiceF,etTypeF,etStatusF,etQ].join('|'),shown.map(function(t,i){
    return '<tr class="et-row'+(etSelectedId===t.id?' lp-row-selected':'')+'" id="et-row-'+t.id+'" style="cursor:pointer" onclick="openEtSidebar('+t.id+')">'
      +'<td class="lp-c-n">'+(i+1)+'</td>'
      +'<td><div class="lp-c-main ax-c-link ax-c-trunc" title="'+attrSafe(t.name)+'">'+sbEsc(t.name)+'</div><div class="lp-c-sub">'+etKey(t)+'</div></td>'
      +'<td><div class="lp-c-plain ax-c-trunc" title="'+attrSafe(t.subject)+'">'+sbEsc(t.subject)+'</div></td>'
      +'<td><div class="lp-c-plain">'+t.aud+'</div></td>'
      +'<td>'+axBadge(statusTone(t.status),t.status)+'</td>'
      +'<td onclick="event.stopPropagation()">'+rowLogCell('email-templates',t.id)+'</td>'
      +'</tr>';
  }),'<tr><td colspan="6" style="padding:24px;text-align:center;color:var(--gray)">No email templates match this filter.</td></tr>');
  const stat=function(s){
    return '<div class="listing-stat'+(etStatusF===s?' stat-selected':'')+'" onclick="etToggleStat(\''+s+'\')">'
      +'<div class="listing-stat-count" style="color:var(--st-'+statusTone(s)+'-fg)">'+count(s)+'</div><div class="listing-stat-label">'+s+'</div></div>';
  };
  return '<div class="lp-page">'
    +dashboardBackHTML()
    +'<div class="exp-top et-top" style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:4px">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0">'
    +'<div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +lpSearchField('et-f-q',etQ,'Search name or subject','applyEtFilters()')
    +apCS('et-f-for',ET_FOR,etForF,'Template For')
    +apCS('et-f-service',ET_SERVICES,etServiceF,'Service Group')
    +apCS('et-f-type',ET_TYPES,etTypeF,'Template Type')
    +clearFiltersBtn([etForF,etServiceF,etTypeF,etStatusF,etQ],'resetEtFilters()')
    +'<button class="lp-pill-search" onclick="applyEtFilters()">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats">'+ET_TILES.map(stat).join('')+'</div></div>'
    +'<div class="lp-split-wrap ax-split-wrap" style="margin-top:14px" id="et-split-wrap"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table ax-table et-table"><thead><tr><th>S. No</th><th>Template</th><th>Subject</th><th>Template For</th>'
      +'<th>Status</th><th>Action</th></tr></thead>'
    +'<tbody>'+pgn.rows+'</tbody></table>'
    +pgn.pager
    +'</div></div>'
    +'<div class="lp-split-sb'+(etSelectedId?' open':'')+'" id="et-split-sb"><div class="lp-isb" id="et-isb-inner">'+(etSelectedId?sbRender(renderEtSidebar,'et'):'')+'</div></div>'
    +'</div></div>'
    +(etModalOpen?buildAddEtModalHTML():'');
}

/* ── Wiring ────────────────────────────────────────────────────────────── */
Object.assign(supportPageMeta,{'email-templates':{title:'Email Templates',context:'Email Templates',filters:[],columns:[],rows:[]}});
if(typeof LP_ROW_PREFIX!=='undefined')LP_ROW_PREFIX['email-templates']='et';
Object.assign(SB_STATUS_TONE,{deleted:'bad'});
sbDraftReg('et',{
  dirty:function(){
    if(!etEditing||etModalOpen)return false;
    etSync();
    return JSON.stringify(etDraft)!==etDraftOrig;
  },
  drop:etDropEdit});
