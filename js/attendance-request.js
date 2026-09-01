/* ══ ATTENDANCE REQUEST ON A NON-WORKING DAY ═══════════════════════════════
   Work happens on days the calendar says are closed. A release goes out on a
   Sunday, a shift is covered on Republic Day — and until now the timesheet had
   nowhere to put it: a weekly off and a public holiday were both simply blank
   cells, so the hours were either lost or typed into a day that never
   happened.

   THIS IS THE CLAIM, NOT THE ENTRY. A punch on a working day is a record of
   something the clock saw. A punch on a closed day is an ASSERTION that needs
   somebody to agree with it, which is why it carries a reason, an approver and
   a status rather than just two times. Nothing here writes to tsAttendance;
   the day stays a weekly off until the request is approved, and the calendar
   says "Pending" rather than pretending otherwise.

   IT IS GOVERNED BY THE ENTITY'S OWN SETTING. Company Settings → Attendance →
   "Attendance Request on Week Off / Holidays" is the switch that turns this
   whole feature on, and the Approver named beside it is who the request is
   sent to. Turn the switch off and the affordance disappears from every cell —
   which is the point of having put the switch there.

   WHICH DAYS QUALIFY: any day that is NOT a working day for this entity —
   a weekday outside csAtt.workingDays, or a date on the entity's holiday
   calendar. A working day already has an Add entry / Edit entry on it and
   needs no permission from anyone. */

const AR_REASON_MAX=255;
const AR_DAY_KEYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const AR_DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const AR_MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* date -> {kind,in,out,reason,status,requestedAt}. Keyed by date because one
   day can only be claimed once; a second claim is an edit of the first. */
let arRequests={};
let arOpenDate=null;      // the date whose drawer is showing
let arDraft=null;         // the form being filled in

// ── WHAT KIND OF DAY IS THIS ──
function arSettings(){
  return (typeof csAtt!=='undefined'&&csAtt)?csAtt:null;
}
function arEnabled(){
  const s=arSettings();
  return !!(s&&s.weekOffRequest);
}
function arApprover(){
  const s=arSettings();
  return (s&&s.weekOffApprover)||'HR / Manager';
}
function arWorkingDays(){
  const s=arSettings();
  return (s&&s.workingDays&&s.workingDays.length)?s.workingDays:['Mon','Tue','Wed','Thu','Fri'];
}
function arParse(iso){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');
  return m?new Date(+m[1],+m[2]-1,+m[3]):null;
}
// The entity's own holiday calendar — the same rows the Holidays listing shows
// and the export marks days against, so the three cannot disagree.
function arHolidayOn(iso){
  if(typeof tsxHolidayOn==='function')return tsxHolidayOn(iso);
  if(typeof holidaysData==='undefined')return null;
  const ent=(typeof hdCurrentEntityName==='function')?hdCurrentEntityName():'';
  return holidaysData.find(function(h){
    return h.date===iso&&(!ent||h.entity===ent)&&h.status!=='Inactive';
  })||null;
}
/* The one test the whole feature hangs off. Returns null on a working day and
   a description of the day otherwise, so every caller asks the question once
   and gets the label it needs to print with it. */
function arNonWorkingDay(iso){
  const d=arParse(iso);
  if(!d)return null;
  const hol=arHolidayOn(iso);
  const isWorkingWeekday=arWorkingDays().indexOf(AR_DAY_KEYS[d.getDay()])>=0;
  if(hol)return {kind:'Holiday',label:hol.name,both:!isWorkingWeekday};
  if(!isWorkingWeekday)return {kind:'Weekly Off',label:'Weekly Off',both:false};
  return null;
}
/* Requestable is narrower than non-working: the day also has to be one this
   sheet may still be changed on. The rules are the timesheet's own — this
   month, not the future, not inside a locked week, not somebody else's sheet —
   so a claim can never be filed against a week already sent for approval. */
function arCanRequest(iso){
  if(!arEnabled())return false;
  if(!arNonWorkingDay(iso))return false;
  return (typeof tsDayEditable==='function')?tsDayEditable(iso):true;
}
function arGet(iso){return arRequests[iso]||null;}
function arPendingCount(){
  let n=0;
  Object.keys(arRequests).forEach(function(k){
    if(arRequests[k].status==='Pending Approval'&&typeof tsInRange==='function'?tsInRange(k):true)n++;
  });
  return n;
}
// Pending requests inside the month the grid is showing — the figure the
// header chip quotes, so it counts what is on screen and not the whole year.
function arPendingInView(){
  if(typeof tsMonth==='undefined')return 0;
  const pre=tsMonth.year+'-'+(tsMonth.month<9?'0':'')+(tsMonth.month+1);
  let n=0;
  Object.keys(arRequests).forEach(function(k){
    if(k.indexOf(pre)===0&&arRequests[k].status==='Pending Approval')n++;
  });
  return n;
}

// ── TIME HELPERS ──
function arMins(t){
  const m=/^(\d{1,2}):(\d{2})$/.exec(String(t||'').trim());
  return m?(+m[1])*60+(+m[2]):null;
}
function arTime12(t){
  const m=/^(\d{1,2}):(\d{2})$/.exec(String(t||'').trim());
  if(!m)return '—';
  let h=+m[1];
  const ap=h>=12?'PM':'AM';
  h=h%12||12;
  return h+':'+m[2]+' '+ap;
}
// "9h 00m" rather than "9.00h": this figure is read by a person deciding
// whether to approve it, not summed by a spreadsheet.
function arSpan(inT,outT){
  const a=arMins(inT),b=arMins(outT);
  if(a==null||b==null||b<=a)return null;
  const mins=b-a;
  return {mins:mins,text:Math.floor(mins/60)+'h '+String(mins%60).padStart(2,'0')+'m'};
}
function arDateLabel(iso){
  const d=arParse(iso);
  if(!d)return '—';
  return d.getDate()+' '+AR_MON[d.getMonth()]+' '+d.getFullYear()
    +' ('+AR_DAY_NAMES[d.getDay()]+')';
}
function arNowLabel(){
  const d=new Date();
  let h=d.getHours();
  const ap=h>=12?'PM':'AM';
  h=h%12||12;
  return d.getDate()+' '+AR_MON[d.getMonth()]+' '+d.getFullYear()+', '
    +h+':'+String(d.getMinutes()).padStart(2,'0')+' '+ap;
}
function arEsc(s){
  return (typeof attrSafe==='function')?attrSafe(s)
    :String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
}

/* ══ WHAT THE TIMESHEET SHOWS ══════════════════════════════════════════════
   Two insertions into the month grid, both of which return an empty string on
   a day that has nothing to say — so a working day's cell is byte-for-byte
   what it was before this file existed. */
const AR_ICO={
  plus:'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  clock:'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  send:'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  info:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  cal:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  close:'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};
const AR_STATUS_TONE={'Pending Approval':'wait','Approved':'ok','Rejected':'bad'};

// The chip or link that sits at the foot of a non-working day's cell.
function arCellHTML(iso){
  const req=arGet(iso);
  if(req){
    return '<span class="ar-cell-chip tone-'+(AR_STATUS_TONE[req.status]||'idle')+'" '
      +'title="'+arEsc(req.status+' · '+arTime12(req.in)+' – '+arTime12(req.out))+'">'
      +(req.status==='Pending Approval'?'Pending':req.status)+'</span>';
  }
  if(!arCanRequest(iso))return '';
  /* ALWAYS VISIBLE, AND SHORT ENOUGH TO FIT. It was revealed on hover, which
     made the only route into the feature something you had to find by waving
     the pointer at a blank cell. It is a standing control now — and it reads
     "Request", not "Request Attendance", because the Sat and Sun columns are
     84px wide and the longer label could not be set on one line in them. The
     full sentence is on the tooltip and in the day panel behind it.

     stopPropagation, because the cell itself opens the day panel: the button
     is a shortcut past that panel, not a second way of opening it. */
  return '<button type="button" class="ar-cell-link" onclick="event.stopPropagation();arOpen(\''+iso+'\')" '
    +'title="Request attendance for this closed day">'+AR_ICO.plus+'Request</button>';
}
// The month header's count of what is waiting on somebody else.
function arHeaderChipHTML(){
  const n=arPendingInView();
  if(!n)return '';
  return '<span class="ar-head-chip" title="Attendance requests waiting for approval this month">'
    +AR_ICO.clock+n+' Pending Request'+(n===1?'':'s')+'</span>';
}
/* The block the day panel shows on a closed day, in place of the Add entry
   button a working day gets. Three states: the entity does not allow it, no
   request yet, or one already filed. */
function arDayPanelHTML(iso){
  const day=arNonWorkingDay(iso);
  if(!day)return '';
  const req=arGet(iso);
  if(req){
    return '<div class="ar-panel-block">'
      +'<div class="ar-panel-head"><span class="ar-panel-kind">'+arEsc(day.label)+'</span>'
        +'<span class="ar-chip tone-'+(AR_STATUS_TONE[req.status]||'idle')+'">'+arEsc(req.status)+'</span></div>'
      +'<div class="ar-panel-times">'+arTime12(req.in)+' – '+arTime12(req.out)
        +(arSpan(req.in,req.out)?' · '+arSpan(req.in,req.out).text:'')+'</div>'
      +'<button class="ts-sb-btn is-wide" onclick="arOpen(\''+iso+'\')">View request</button>'
    +'</div>';
  }
  if(!arEnabled()){
    return '<div class="ar-panel-block is-off">'
      +'<div class="ar-panel-head"><span class="ar-panel-kind">'+arEsc(day.label)+'</span></div>'
      +'<p class="ar-panel-note">This entity does not allow attendance requests on week offs and '
      +'holidays. An administrator can turn it on in Company Settings &rarr; Attendance.</p>'
    +'</div>';
  }
  if(!arCanRequest(iso)){
    return '<div class="ar-panel-block is-off">'
      +'<div class="ar-panel-head"><span class="ar-panel-kind">'+arEsc(day.label)+'</span></div>'
      +'<p class="ar-panel-note">This day is outside the sheet you can change, so no request can be filed against it.</p>'
    +'</div>';
  }
  return '<div class="ar-panel-block">'
    +'<div class="ar-panel-head"><span class="ar-panel-kind">'+arEsc(day.label)+'</span></div>'
    +'<p class="ar-panel-note">Worked on this closed day? Claim the hours and '+arEsc(arApprover())
      +' will be asked to approve them.</p>'
    +'<button class="ts-sb-btn is-wide is-primary" onclick="arOpen(\''+iso+'\')">'
      +AR_ICO.plus+'Request Attendance</button>'
  +'</div>';
}

/* ══ THE DRAWER ════════════════════════════════════════════════════════════
   Appended to the body rather than rendered into the timesheet, for the same
   reason the export drawer is: a keystroke in the reason box must not repaint
   the month behind it. It sits above the day panel, so opening it from there
   leaves that panel where it was to go back to. */
function arOpen(iso){
  const day=arNonWorkingDay(iso);
  if(!day)return;
  arClose();
  const req=arGet(iso);
  arOpenDate=iso;
  /* Seeded, never blank, and from the best thing available in this order: the
     request already filed, then a punch the clock did record on the day (a
     badge still reads on a holiday), then the entity's own shift — because the
     common case is a normal day worked on an abnormal date. */
  const punch=(typeof tsAttendance!=='undefined')?tsAttendance[iso]:null;
  const from24=function(t){return (typeof tsTo24==='function')?tsTo24(t):'';};
  arDraft=req
    ? {kind:req.kind,in:req.in,out:req.out,reason:req.reason}
    : {kind:day.kind,
       in:(punch&&from24(punch.in))||(arSettings()&&arSettings().startTime)||'09:00',
       out:(punch&&from24(punch.out))||(arSettings()&&arSettings().endTime)||'18:00',
       reason:''};
  const host=document.createElement('div');
  host.id='ar-host';
  host.innerHTML=arDrawerHTML(iso);
  document.body.appendChild(host);
  document.addEventListener('keydown',arKey);
  const ta=document.getElementById('ar-reason');
  if(ta&&!req)ta.focus();
}
function arClose(){
  const host=document.getElementById('ar-host');
  if(host)host.remove();
  arOpenDate=null;arDraft=null;
  document.removeEventListener('keydown',arKey);
}
function arKey(e){if(e.key==='Escape')arClose();}
function arRead(){
  if(!arDraft)return;
  const v=function(id){const el=document.getElementById(id);return el?el.value:null;};
  const k=v('ar-kind'),i=v('ar-in'),o=v('ar-out'),r=v('ar-reason');
  if(k!=null)arDraft.kind=k;
  if(i!=null)arDraft.in=i;
  if(o!=null)arDraft.out=o;
  if(r!=null)arDraft.reason=r;
}
// The total and the counter are the only things that move as you type, so they
// are the only things repainted — the rest of the drawer holds still.
function arSync(){
  arRead();
  const span=arSpan(arDraft.in,arDraft.out);
  const tot=document.getElementById('ar-total');
  if(tot){
    tot.textContent=span?span.text:'—';
    tot.classList.toggle('is-none',!span);
  }
  const warn=document.getElementById('ar-time-warn');
  if(warn)warn.classList.toggle('is-on',!span&&!!arDraft.in&&!!arDraft.out);
  const c=document.getElementById('ar-count');
  if(c)c.textContent=arDraft.reason.length+' / '+AR_REASON_MAX;
}
function arDrawerHTML(iso){
  const day=arNonWorkingDay(iso);
  const req=arGet(iso);
  const d=arDraft;
  const span=arSpan(d.in,d.out);
  /* A holiday that also falls on a week off is genuinely both, so the type is
     a choice on those days and a statement on every other. */
  const kinds=day.both?['Holiday','Weekly Off']:[day.kind];
  const kindField=kinds.length>1
    ? '<select class="ep-form-select" id="ar-kind" onchange="arSync()">'
      +kinds.map(function(k){return '<option value="'+k+'"'+(k===d.kind?' selected':'')+'>'+k+'</option>';}).join('')
      +'</select>'
    : '<input type="hidden" id="ar-kind" value="'+arEsc(d.kind)+'">'
      +'<div class="ar-static">'+arEsc(d.kind)+'</div>';

  const statusBlock=req
    ? '<div class="ar-status">'
        +'<span class="ar-status-label">Current Status</span>'
        +'<span class="ar-chip tone-'+(AR_STATUS_TONE[req.status]||'idle')+'">'+arEsc(req.status)+'</span>'
        +'<span class="ar-status-meta">Requested on '+arEsc(req.requestedAt)+'</span>'
      +'</div>'
    : '';

  const foot=req&&req.status==='Pending Approval'
    ? '<button class="ar-btn-ghost" onclick="arWithdraw()">Withdraw</button>'
      +'<button class="ar-btn" onclick="arSubmit()">'+AR_ICO.send+'Update Request</button>'
    : req
      ? '<button class="ar-btn-ghost" onclick="arClose()">Close</button>'
      : '<button class="ar-btn-ghost" onclick="arClose()">Cancel</button>'
        +'<button class="ar-btn" onclick="arSubmit()">'+AR_ICO.send+'Submit Request</button>';

  const readOnly=!!(req&&req.status!=='Pending Approval');
  const dis=readOnly?' disabled':'';

  return '<div class="ar-overlay">'
    +'<div class="ar-bg" onclick="arClose()"></div>'
    +'<aside class="ar-panel" role="dialog" aria-modal="true" aria-labelledby="ar-title">'
      +'<header class="ar-head">'
        +'<div><h2 class="ar-title" id="ar-title">Attendance Request</h2>'
          +'<p class="ar-sub">Request attendance on a weekly off or holiday.</p></div>'
        +'<button class="ar-close" onclick="arClose()" title="Close" aria-label="Close">'+AR_ICO.close+'</button>'
      +'</header>'
      +'<div class="ar-body">'
        +'<div class="ar-note">'+AR_ICO.info+'<span>Attendance will be counted only after approval from '
          +arEsc(arApprover())+'.</span></div>'

        +'<div class="ar-date">'+AR_ICO.cal
          +'<span class="ar-date-txt"><span class="ar-date-label">Selected Date</span>'
          +'<span class="ar-date-val">'+arDateLabel(iso)+'</span></span>'
          +'<span class="ar-chip tone-'+(day.kind==='Holiday'?'info':'idle')+'">'+arEsc(day.label)+'</span>'
        +'</div>'

        +'<div class="lp-sb-form-grid ar-grid">'
          +'<div class="lp-sb-field ep-form-full"><label>Request Type</label>'+kindField+'</div>'
          +'<div class="lp-sb-field"><label>Clock In Time</label>'
            +'<input type="time" class="ep-form-input" id="ar-in" value="'+arEsc(d.in)+'" oninput="arSync()"'+dis+'></div>'
          +'<div class="lp-sb-field"><label>Clock Out Time</label>'
            +'<input type="time" class="ep-form-input" id="ar-out" value="'+arEsc(d.out)+'" oninput="arSync()"'+dis+'></div>'
          +'<div class="lp-sb-field ep-form-full"><label>Total Hours <span class="ar-auto">Auto</span></label>'
            /* Derived, so it is a read-out and not a field. Typing a total that
               disagrees with the two times either side of it is the one thing
               an approver cannot resolve. */
            +'<div class="ar-total'+(span?'':' is-none')+'" id="ar-total">'+(span?span.text:'—')+'</div>'
            +'<span class="ar-warn" id="ar-time-warn">Clock out must be after clock in.</span></div>'
          +'<div class="lp-sb-field ep-form-full"><label>Reason <span class="ar-req">*</span></label>'
            +'<textarea class="ep-form-input ar-textarea" id="ar-reason" rows="3" maxlength="'+AR_REASON_MAX+'"'
              +' placeholder="Why were you working on this day?" oninput="arSync()"'+dis+'>'
              +arEsc(d.reason)+'</textarea>'
            +'<span class="ar-count" id="ar-count">'+d.reason.length+' / '+AR_REASON_MAX+'</span></div>'
          +'<div class="lp-sb-field ep-form-full"><label>Approver / Sent to</label>'
            +'<div class="ar-static">Sent to '+arEsc(arApprover())+' for approval</div></div>'
        +'</div>'
        +statusBlock
      +'</div>'
      +'<footer class="ar-foot">'+foot+'</footer>'
    +'</aside>'
  +'</div>';
}

/* ══ FILING IT ═════════════════════════════════════════════════════════════
   Every refusal names the field that fixes it. A claim with no reason on it is
   the one an approver has to come back and ask about, which costs both people
   a day — so it is refused here rather than sent. */
function arSubmit(){
  arRead();
  const iso=arOpenDate,d=arDraft;
  if(!iso||!d)return;
  if(!arCanRequest(iso)&&!arGet(iso)){
    showToast('This day cannot be claimed','error','It is outside the sheet you can change.');return;
  }
  const span=arSpan(d.in,d.out);
  if(!d.in||!d.out){showToast('Enter both times','error','Clock In and Clock Out are needed.');return;}
  if(!span){showToast('Clock out must be after clock in','error','Check the two times.');return;}
  if(!d.reason.trim()){showToast('A reason is required','error','Say why you worked on this day.');return;}
  if(d.reason.trim().length<5){showToast('Give a fuller reason','error','A few words the approver can act on.');return;}
  const existing=arGet(iso);
  arRequests[iso]={
    kind:d.kind,in:d.in,out:d.out,reason:d.reason.trim(),
    status:'Pending Approval',
    requestedAt:arNowLabel(),
    approver:arApprover()
  };
  arClose();
  if(typeof renderADTPage==='function')renderADTPage();
  showToast(existing?'Request updated':'Attendance request submitted','success',
    arDateLabel(iso)+' · '+span.text+' · sent to '+arApprover());
}
function arWithdraw(){
  const iso=arOpenDate;
  if(!iso||!arGet(iso))return;
  delete arRequests[iso];
  arClose();
  if(typeof renderADTPage==='function')renderADTPage();
  showToast('Request withdrawn','info',arDateLabel(iso)+' is a closed day again.');
}
