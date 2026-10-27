/* ══ LEAVES TAB ════════════════════════════════════════════════════════════
   Leave Balance is no longer a module of its own. A balance belongs to a
   person, so it is read where the person is:

     Employees → detail panel → Leaves   one employee, for HR
     My Profile → Leaves                 the signed-in person

   Both read the SAME calculation, lbRows() in js/leave-balance.js, so a
   number cannot differ between the panel, the profile and the balance shown
   while applying for leave.

   YEARLY / MONTHLY is one filter, not two tables stacked: yearly reads the
   leave year against each policy's yearly allowance (carry-forward
   included); monthly reads the picked month against the monthly one. */

/* One filter state per place the panel is drawn, so switching the profile to
   Monthly does not also switch the employee panel. */
const lhState={};
function lhSt(host){
  if(!lhState[host])lhState[host]={mode:'yearly',month:+LB_TODAY.split('-')[1]-1};
  return lhState[host];
}
/* How each host repaints just its own body. */
function lhRepaint(host){
  if(host==='de')isbTab('de',renderDeSidebar);
  else if(host==='ge')isbTab('ge',renderGeSidebar);
  else if(host==='prof')refreshProfile();
}
function lhSetMode(host,mode){const s=lhSt(host);if(s.mode===mode)return;s.mode=mode;lhRepaint(host);}
function lhPickMonth(val,csid){
  const host=String(csid||'').replace(/^lh-month-/,'');
  const i=LB_MONTHS.indexOf(String(val).split(' ')[0]);
  if(i<0)return;
  lhSt(host).month=i;lhRepaint(host);
}

/* Employee records and leave records spell names differently ("Pallavi
   Parate" here, "Pallavi P" in leave data). Exact name first, then first name
   plus last initial; no match means no balance, never someone else's. */
function lhResolve(name){
  if(!name)return null;
  const list=lbEmployees();
  const key=String(name).trim().toLowerCase();
  const exact=list.find(function(e){return e.name.toLowerCase()===key||String(e.empId).toLowerCase()===key;});
  if(exact)return exact.name;
  const w=key.split(/\s+/);
  if(w.length>1){
    const short=(w[0]+' '+w[w.length-1].charAt(0)).toLowerCase();
    const m=list.find(function(e){return e.name.toLowerCase()===short;});
    if(m)return m.name;
  }
  return null;
}

/* Totals for the filter in force. Monthly limits that do not exist are left
   out of the limit rather than counted as zero. */
function lhTotals(rows,mode){
  if(mode==='yearly'){const t=lbTotals(rows);return {limit:t.entitled,availed:t.availed,pending:t.pending,available:t.available};}
  const t={limit:0,availed:0,pending:0,available:0};
  rows.forEach(function(r){
    t.availed+=r.mAvailed;t.pending+=r.mPending;
    if(r.monthly!=null){t.limit+=r.monthly;t.available+=r.mAvailable;}
  });
  return t;
}

function lhToolbarHTML(host){
  const s=lhSt(host);
  const seg=function(id,label){
    return '<button type="button" class="seg-btn'+(s.mode===id?' active':'')+'" onclick="lhSetMode(\''+host+'\',\''+id+'\')"><span>'+label+'</span></button>';
  };
  return '<div class="lh-tools">'
    +'<div class="segmented is-compact">'+seg('yearly','Yearly')+seg('monthly','Monthly')+'</div>'
    +(s.mode==='monthly'
      ?apCS('lh-month-'+host,LB_MONTHS.map(function(m){return m+' '+LB_YEAR;}),LB_MONTHS[s.month]+' '+LB_YEAR,'Month','lhPickMonth')
      :'<span class="lh-period">1 Jan – 31 Dec '+LB_YEAR+'</span>')
  +'</div>';
}

/* Optional holidays this person has left in the leave year: the entity's
   allowance (Company Settings → Leaves → Optional Holidays) less those taken
   or waiting - optional-holiday leave requests, plus, for the signed-in
   employee, the ones claimed on the Optional Holidays calendar. A yearly
   allowance, so the card reads the same under Yearly and Monthly. */
function lhOptionalLeft(who){
  const allowed=typeof ohEntitlement==='function'?ohEntitlement():0;
  let used=0;
  if(who){
    const yLo=new Date(LB_YEAR,0,1),yHi=new Date(LB_YEAR,11,31);
    allLeavesData.forEach(function(l){
      if(l.name===who&&/optional holiday/i.test(l.leaveType)&&(l.status==='Approved'||LB_PENDING.indexOf(l.status)>=0))used+=lbDays(l,yLo,yHi);
    });
    if(who===LB_ME&&typeof ohUsed==='function')used+=ohUsed(LB_YEAR);
  }
  return {allowed:allowed,left:Math.max(0,allowed-used)};
}
function lhFiguresHTML(t,mode,who){
  const fig=function(label,val,cls,of){
    return '<div class="lh-fig"><div class="lh-fig-val'+(cls||'')+'">'+lbFmt(val)
      +(of!=null?'<span class="lb-stat-unit">of '+lbFmt(of)+' left</span>':'<span class="lb-stat-unit">days</span>')
      +'</div><div class="lh-fig-label">'+label+'</div></div>';
  };
  const oh=lhOptionalLeft(who);
  return '<div class="lh-figs">'
    +fig(mode==='yearly'?'Total':'Monthly Limit',t.limit)
    +fig('Availed',t.availed)
    +fig('Pending',t.pending,t.pending?' is-wait':'')
    +fig('Available',t.available,' is-ok')
    +fig('Optional Holidays',oh.left,oh.left<=0&&oh.allowed?' is-out':'',oh.allowed)
  +'</div>';
}

/* The tab itself. name: the person as the host knows them. */
function lhPanelHTML(host,name){
  const s=lhSt(host);
  const who=lhResolve(name);
  const rows=who?lbRows(who,s.month):[];
  const t=lhTotals(rows,s.mode);
  return '<div class="lh-panel">'
    +lhToolbarHTML(host)
    +'<div class="lh-sec-hd"><div class="lh-sec-title">Leave Balance</div>'
      +'<div class="lh-sec-sub">'+(s.mode==='yearly'
        ?'Against each policy&rsquo;s yearly limit · carried-forward days are used first'
        :'Against each policy&rsquo;s monthly limit for '+LB_MONTHS[s.month]+' '+LB_YEAR)+'</div></div>'
    +(rows.length?lhFiguresHTML(t,s.mode,who):'')
    +(s.mode==='yearly'?lbYearTableHTML(rows):lbMonthTableHTML(rows))
    +'<p class="lb-foot">Leave is counted in working days: weekends and holidays inside a request are not deducted, and a half day counts as 0.5.</p>'
  +'</div>';
}

/* ── The balance while applying for leave ────────────────────────────────
   Shown under Leave Type the moment a type is picked, for the employee in
   the form - or, for an employee filing their own, for them. */
function alSelectedType(){
  const w=document.getElementById('csw-al-type');
  const v=w?w.querySelector('.cs-value').textContent.trim():'';
  return v&&v!=='Select'?v:'';
}
/* The balance line for one person and one leave type, as {cls, html}.
   who: a leave-data name or null; typed: what was typed for the employee
   ('' when filing for yourself); from: ISO date, which month to read. */
function lhTypeBal(who,type,typed,from){
  if(!type)return {cls:'al-type-bal',html:''};
  if(!who)return {cls:'al-type-bal is-on is-note',html:typed
    ?'No leave record found for &ldquo;'+sbEsc(typed)+'&rdquo;.'
    :'Select an employee to see their <b>'+sbEsc(type)+'</b> balance.'};
  const month=from&&+from.slice(0,4)===LB_YEAR?+from.slice(5,7)-1:+LB_TODAY.split('-')[1]-1;
  const r=lbRows(who,month).find(function(x){return x.type===type;});
  if(!r)return {cls:'al-type-bal is-on is-note is-bad',
    html:'<b>'+sbEsc(type)+'</b> is not in '+(typed?sbEsc(who)+'&rsquo;s':'your')+' active leave policy &mdash; this request would be loss of pay.'};
  /* Four figures in a row, in ink. Only Available takes a tone, and only when
     it is low (amber) or gone (red). */
  const left=r.yAvailable+r.cfBalance,total=r.yearly+r.cfOpen;
  const tone=left<=0?' is-out':left<=2?' is-low':'';
  const fig=function(val,of,label,cls,tip){
    return '<div class="al-bal-fig"'+(tip?' title="'+tip+'"':'')+'><div class="al-bal-val'+(cls||'')+'">'+val
      +(of!=null?'<span class="al-bal-of"> / '+of+'</span>':'')+'</div><div class="al-bal-lbl">'+label+'</div></div>';
  };
  return {cls:'al-type-bal is-on',
    html:fig(lbFmt(left),lbFmt(total),'Available',tone,r.cfBalance?'Includes '+lbFmt(r.cfBalance)+' carried forward':'')
      +fig(lbFmt(r.yAvailed+r.cfUsed),null,'Availed')
      +fig(lbFmt(r.yPending),null,'Pending')
      +(r.monthly!=null
        ?fig(lbFmt(r.mAvailable),lbFmt(r.monthly),LB_MONTHS[month].slice(0,3)+' left')
        :fig('—',null,LB_MONTHS[month].slice(0,3)+' · no limit'))};
}
function lhPaintBal(box,b){box.className=b.cls;box.innerHTML=b.html;}

/* Leave Requests → Create New Leave: for the employee typed into the form,
   or for an employee filing their own. */
/* The Select Employee menu: everyone the leave roster knows, as "Name (ID)". */
function alEmpLabel(e){return e.name+(e.empId&&e.empId!=='—'?' ('+e.empId+')':'');}
function alEmpOptions(){return lbEmployees().map(alEmpLabel);}
function alSelectedEmp(){
  const t=document.querySelector('[data-csid="al-emp"]');
  if(!t||t.classList.contains('cs-placeholder'))return null;
  const v=t.querySelector('.cs-value').textContent.trim();
  return lbEmployees().find(function(e){return alEmpLabel(e)===v;})||null;
}
/* apCS hook: picking an employee fills their email (from their last leave
   request) when the field is still empty, and redraws the balance. */
function alPickEmp(){
  const e=alSelectedEmp();
  const mail=document.getElementById('al-email-input');
  if(e&&mail&&!mail.value){
    const rec=allLeavesData.find(function(l){return l.name===e.name&&l.email;});
    if(rec)mail.value=rec.email;
  }
  alRefreshBal();
}
function alRefreshBal(){
  const box=document.getElementById('al-type-bal');if(!box)return;
  const e=alSelectedEmp();
  const own=typeof currentRole!=='undefined'&&currentRole==='Employee';
  const who=e?e.name:(own?LB_ME:null);
  const from=(document.getElementById('al-from-date')||{}).value||'';
  lhPaintBal(box,lhTypeBal(who,alSelectedType(),e?e.name:'',from));
}
/* Apply Application (the employee's own form): always the signed-in person. */
function aaBalHTML(){
  const f=typeof aaForm!=='undefined'&&aaForm;
  const b=lhTypeBal(LB_ME,f?f.leaveType:'','',f?f.from:'');
  return '<div class="'+b.cls+'" id="aa-type-bal">'+b.html+'</div>';
}
function aaRefreshBal(){
  const box=document.getElementById('aa-type-bal');if(!box||!aaForm)return;
  lhPaintBal(box,lhTypeBal(LB_ME,aaForm.leaveType,'',aaForm.from));
}
