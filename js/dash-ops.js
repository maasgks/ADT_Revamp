/* ══ OPERATIONAL DASHBOARD CARDS ═══════════════════════════════════════════
   Three cards drawn from live data on every dashboard render (renderer.js,
   page==='dashboard'), the same way annRender() and empDashRender() fill
   their hosts. The dashboard markup is a snapshot of index.html, so anything
   typed into it would freeze; these hosts start empty and are filled here.

     #emp-week-dash   Employee · "This week"                  (Timesheets)
     #hr-ops-dash     HR · "Attendance today"                 (Attendance)
                      HR · "Expiring & incomplete records"

   DASH_MODULES (core.js) hides a card whose module is off. A hidden card
   leaves no gap: the Employee host is emptied, and the HR row is written
   with only the cards that remain — one card takes the full width.

   CLICKABLE ONLY WHERE A LISTING SHOWS EXACTLY THOSE RECORDS (the
   DASH_CARD_LINK rule). An expiring/incomplete row opens that employee's own
   record, so it is a door. The attendance buckets are not: no listing filters
   leave to "approved and covering today", or anything to "late in today", so
   they stay static text rather than opening a list that would disagree. */

const DOPS_MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOPS_DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function dopsDate(iso){const p=iso.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function dopsISO(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dopsFmt(iso){const d=dopsDate(iso);return d.getDate()+' '+DOPS_MON[d.getMonth()]+' '+d.getFullYear();}
function dopsDayLbl(iso){const d=dopsDate(iso);return DOPS_DOW[d.getDay()]+' '+d.getDate()+' '+DOPS_MON[d.getMonth()];}
// "31.5h", never "31.50h" or "32.0h".
function dopsHrs(n){return (Math.round(n*10)/10)+'h';}
function dopsBadge(tone,label){return '<span class="lp-status-badge tone-'+tone+'">'+label+'</span>';}
function dopsEmpty(title,sub,link){
  return '<div class="dops-empty"><b>'+title+'</b>'+(sub?'<span>'+sub+'</span>':'')+(link||'')+'</div>';
}

/* ── 1A · EMPLOYEE · THIS WEEK ─────────────────────────────────────────────
   The Monday–Sunday week holding TS_TODAY, read with the timesheet's own
   week maths (tsWeekOf / tsWeekDates) so "week 4" here is week 4 on the grid.
   Target counts only days the entity asks for — holidays and weekly offs are
   excluded via arNonWorkingDay, as the spec for this card states. */
function dopsWeek(){
  const p=TS_TODAY.split('-'),y=+p[0],m=+p[1]-1,w=tsWeekOf(TS_TODAY);
  const days=tsWeekDates(y,m,w);
  const a=function(d){return tsAttendance[d]||null;};
  const hrs=function(d){const r=a(d);return r&&r.status==='present'?(parseFloat(r.hours)||0):0;};
  const working=days.filter(function(d){return !(typeof arNonWorkingDay==='function'&&arNonWorkingDay(d));});
  const daily=(typeof csAtt!=='undefined'&&+csAtt.dailyHours)||8;
  const logged=days.reduce(function(s,d){return s+hrs(d);},0);
  const target=daily*working.length;
  const elapsed=working.filter(function(d){return d<TS_TODAY;}).length;   // today is not over yet
  // The calendar week for the meta line, Monday to Sunday even across a month end.
  const t=dopsDate(TS_TODAY),mon=new Date(t);mon.setDate(t.getDate()-((t.getDay()+6)%7));
  const sun=new Date(mon);sun.setDate(mon.getDate()+6);
  const meta='Mon '+mon.getDate()+(mon.getMonth()!==sun.getMonth()?' '+DOPS_MON[mon.getMonth()]:'')
    +' – Sun '+sun.getDate()+' '+DOPS_MON[sun.getMonth()];
  return {y:y,m:m,w:w,days:days,working:working,logged:logged,target:target,daily:daily,
    loggedDays:working.filter(function(d){return hrs(d)>0;}).length,
    behind:logged<daily*elapsed,
    hasEntries:days.some(function(d){const r=a(d);return r&&(r.status==='present'||r.status==='inprog');}),
    status:tsWeekStatus(y,m,w),startable:tsWeekStartable(y,m,w),meta:meta};
}
function dopsWeekHTML(){
  const k=dopsWeek();
  const link='<a href="javascript:void(0)" class="hr-section-link" onclick="dopsOpenTimesheet()">Open timesheet</a>';
  const head='<div class="hr-section-header"><div class="dops-hd-l"><div class="hr-section-title">This week</div>'
    +'<span class="dops-meta">'+k.meta+'</span></div>'+link+'</div>';
  if(!k.hasEntries){
    return '<div class="hr-section dops-week-card">'+head
      +dopsEmpty('No hours logged this week yet','Add your hours on the timesheet, then submit the week.')+'</div>';
  }
  const ST={open:['idle','Open'],locked:['info','Locked'],submitted:['ok','Submitted']}[k.status]||['idle','Open'];
  const pct=k.target?Math.min(100,k.logged/k.target*100):0;
  const canSubmit=k.status!=='submitted'&&k.startable;
  return '<div class="hr-section dops-week-card">'+head
    +'<div class="dops-week">'
      +'<div class="dops-week-main">'
        +'<div class="dops-week-fig"><b>'+dopsHrs(k.logged)+'</b><span>of '+dopsHrs(k.target)+'</span>'
          +(k.behind?'<span class="dops-week-flag">Behind for the days so far</span>':'')+'</div>'
        +'<div class="dops-prog'+(k.behind?' is-behind':'')+'" role="progressbar" aria-valuemin="0" aria-valuemax="'+k.target+'" aria-valuenow="'+(Math.round(k.logged*10)/10)+'">'
          +'<i data-w="'+pct.toFixed(1)+'"></i></div>'
        +'<div class="dops-week-sub">'+k.loggedDays+' of '+k.working.length+' working days logged</div>'
      +'</div>'
      +'<div class="dops-week-act">'+dopsBadge(ST[0],ST[1])
        +(canSubmit?'<button type="button" class="btn-primary btn-sm" onclick="dopsSubmitWeek()">Submit timesheet</button>':'')
      +'</div>'
    +'</div></div>';
}
function dopsOpenTimesheet(){
  if(typeof tsSubTab!=='undefined')tsSubTab='my';
  navigatePage('timesheet',true);
}
/* Submit from the dashboard runs the timesheet's OWN flow — tsLockWeek then
   tsSubmitWeek — against the week of TS_TODAY, whatever month the timesheet
   page was last left on. Their two toasts are collected and replaced by one:
   "locked … unlock to fill them in" would be wrong advice a moment before the
   same click submits the week. Gaps are still allowed and still said out loud,
   by name this time. */
function dopsSubmitWeek(){
  const k=dopsWeek();
  if(k.status==='submitted'||!k.startable)return;
  const keep={month:tsMonth,ro:tsReadOnly,toast:showToast},said=[];
  tsMonth={year:k.y,month:k.m};tsReadOnly=false;
  showToast=function(t,ty,sub){said.push([t,ty,sub]);};
  try{
    if(k.status==='open')tsLockWeek(k.w);
    tsSubmitWeek(k.w);
  }finally{showToast=keep.toast;tsMonth=keep.month;tsReadOnly=keep.ro;}
  if(tsWeekStatus(k.y,k.m,k.w)!=='submitted'){said.forEach(function(s){showToast(s[0],s[1],s[2]);});return;}
  const gaps=k.working.filter(function(d){
    if(d>TS_TODAY)return false;
    const r=tsAttendance[d];return !r||r.status!=='present';
  }).map(function(d){
    const r=tsAttendance[d];
    return dopsDayLbl(d)+(r&&r.status==='leave'?' ('+(r.leaveType||'Leave')+')':r&&r.status==='inprog'?' (in progress)':'');
  });
  showToast('Week '+k.w+' submitted','success',dopsHrs(k.logged)+' sent for approval.'
    +(gaps.length?' No hours on '+gaps.join(', ')+'.':''));
}

/* ── 2A · HR · ATTENDANCE TODAY ────────────────────────────────────────────
   TODAY IS THE CLOCK'S, not TS_TODAY: this card is about the workforce now.
   Each Active direct employee lands in exactly one bucket, in this order:
     On leave    an Approved leave request covers today (allLeavesData)
     Remote      punched in today, remote
     On time /   punched in at the office, judged against csAtt.startTime +
     Late in     clockInGrace with dsShift() — the dsClassify rule
     Not yet in  no punch. Bad only once start + grace has passed; before
                 that nobody is late yet, so it reads as idle.
   A seeded punch later than the current time has not happened yet. */
function dopsLeaveISO(s){const p=String(s||'').split('-');return p.length===3?p[2]+'-'+p[1]+'-'+p[0]:'';}
function dopsAttendance(){
  const now=new Date(),iso=dopsISO(now),nowM=now.getHours()*60+now.getMinutes();
  const shift=dsShift(),cutoff=shift.start+shift.graceIn;
  const closed=(typeof arNonWorkingDay==='function')?arNonWorkingDay(iso):null;
  const people=directEmpData.filter(function(e){return e.status==='Active';});
  const onLeave=allLeavesData.filter(function(l){
    return l.status==='Approved'&&dopsLeaveISO(l.leaveFrom)<=iso&&iso<=dopsLeaveISO(l.leaveTo);
  }).map(function(l){return l.name;});
  const B={ontime:[],late:[],notin:[],leave:[],remote:[]};
  people.forEach(function(e){
    if(onLeave.indexOf(e.name)>=0){B.leave.push(e.name);return;}
    const p=hrAttendanceToday[e.id];
    const inM=p?dsMins(p.in):null;
    if(inM==null||inM>nowM){B.notin.push(e.name);return;}
    if(p.mode==='remote'){B.remote.push(e.name);return;}
    (inM>cutoff?B.late:B.ontime).push(e.name);
  });
  const due=nowM>cutoff;
  return {iso:iso,closed:closed,total:people.length,cutoff:cutoff,due:due,
    buckets:[
      {key:'ontime',label:'On time',tone:'ok',names:B.ontime},
      {key:'late',label:'Late in',tone:'wait',names:B.late},
      {key:'notin',label:'Not yet in',tone:due?'bad':'idle',names:B.notin,
        note:due?'':'Due by '+dsClock(cutoff)},
      {key:'leave',label:'On leave',tone:'info',names:B.leave},
      {key:'remote',label:'Remote',tone:'idle',names:B.remote}
    ]};
}
function dopsNames(list,max){
  if(!list.length)return '<span class="dops-none">Nobody</span>';
  return list.slice(0,max).map(sbEsc).join(', ')+(list.length>max?' <span class="dops-plus">+'+(list.length-max)+' more</span>':'');
}
function dopsAttendanceHTML(){
  const k=dopsAttendance();
  const d=new Date();
  const head='<div class="hr-section-header"><div class="dops-hd-l"><div class="hr-section-title">Attendance today</div>'
    +'<span class="dops-meta">'+DOPS_DOW[d.getDay()]+', '+dopsFmt(k.iso)+' · Updated just now</span></div></div>';
  if(k.closed||!k.total){
    const sub=k.closed?dopsDayLbl(k.iso)+' is '+(k.closed.kind==='Holiday'?'a holiday — '+sbEsc(k.closed.label):'a weekly off')+'.'
      :'There are no active employees to expect.';
    const link=k.closed
      ?'<a href="javascript:void(0)" class="hr-section-link" onclick="navigatePage(\'holidays\',true)">View holidays</a>'
      :'<a href="javascript:void(0)" class="hr-section-link" onclick="navigatePage(\'employees\',true)">Open Employees</a>';
    return '<div class="hr-section dops-att-card">'+head+dopsEmpty('Nobody is expected in today',sub,link)+'</div>';
  }
  const inNow=k.buckets.filter(function(b){return b.key==='ontime'||b.key==='late'||b.key==='remote';})
    .reduce(function(s,b){return s+b.names.length;},0);
  const bar='<div class="dops-bar" role="img" aria-label="'+k.buckets.map(function(b){return b.label+' '+b.names.length;}).join(', ')+'">'
    +k.buckets.map(function(b){
      return b.names.length?'<i class="dops-seg tone-'+b.tone+'" data-w="'+(b.names.length/k.total*100).toFixed(2)+'"></i>':'';
    }).join('')+'</div>';
  const rows=k.buckets.map(function(b){
    return '<div class="dops-bucket">'
      // An empty bucket is not an exception, so its pill goes quiet.
      +'<span class="dops-bucket-lbl">'+dopsBadge(b.names.length?b.tone:'idle',b.label)+'</span>'
      +'<b class="dops-bucket-n">'+b.names.length+'</b>'
      +'<span class="dops-bucket-names">'+(b.note&&b.names.length?'<span class="dops-note">'+b.note+' · </span>':'')+dopsNames(b.names,3)+'</span>'
    +'</div>';
  }).join('');
  return '<div class="hr-section dops-att-card">'+head
    +'<div class="dops-att-top"><div class="dops-att-total"><b>'+k.total+'</b><span>expected · '+inNow+' in</span></div>'+bar+'</div>'
    +'<div class="dops-buckets">'+rows+'</div>'
    +'</div>';
}

/* ── 2B · HR · EXPIRING & INCOMPLETE RECORDS ───────────────────────────────
   Two lists over every non-Inactive Direct and Global record: dated items
   falling inside the chosen window (soonest first), and records missing bank
   details or a compliance snapshot. Five rows a group, then "+N more". */
let dopsExpWindow=30;
const DOPS_EXP_FIELDS=[['idProofExpiry','ID proof'],['visaExpiry','Visa'],['contractEnd','Contract end'],['probationEnd','Probation end']];
const DOPS_CAP=5;
function dopsPeople(){
  return directEmpData.map(function(e){return {e:e,tab:'direct'};})
    .concat(globalEmpData.map(function(e){return {e:e,tab:'global'};}))
    .filter(function(x){return x.e.status!=='Inactive';});
}
function dopsRecords(win){
  const today=dopsDate(dopsISO(new Date()));
  const exp=[],inc=[];
  dopsPeople().forEach(function(x){
    DOPS_EXP_FIELDS.forEach(function(f){
      if(f[0]==='visaExpiry'&&x.tab!=='global')return;   // visas are EOR / global only
      const v=x.e[f[0]];if(!v)return;
      const days=Math.round((dopsDate(v)-today)/864e5);
      if(days>=0&&days<=win)exp.push({x:x,what:f[1],date:v,days:days});
    });
    const miss=[];
    if(x.e.bankDetailsMissing)miss.push('Bank details');
    if(x.e.complianceSnapshotMissing)miss.push('Compliance snapshot');
    if(miss.length)inc.push({x:x,miss:miss});
  });
  exp.sort(function(a,b){return a.days-b.days;});
  return {exp:exp,inc:inc};
}
function dopsRowAttrs(x){
  const call='dopsOpenEmp(\''+x.tab+'\','+x.e.id+')';
  return ' class="dops-row" role="button" tabindex="0" title="Open '+sbEsc(x.e.name)+'’s record"'
    +' onclick="'+call+'" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();'+call+'}"';
}
function dopsWho(x){
  return '<td><span class="dops-who"><b>'+sbEsc(x.e.name)+'</b><span>'+sbEsc(x.e.empId)+'</span></span></td>';
}
function dopsMore(n){return n>DOPS_CAP?'<div class="dops-more">+'+(n-DOPS_CAP)+' more</div>':'';}
function dopsExpBodyHTML(){
  const r=dopsRecords(dopsExpWindow);
  const expRows=r.exp.slice(0,DOPS_CAP).map(function(it){
    const lbl=it.days===0?'today':'in '+it.days+' day'+(it.days===1?'':'s');
    return '<tr'+dopsRowAttrs(it.x)+'>'+dopsWho(it.x)
      +'<td>'+it.what+'</td><td class="dops-date">'+dopsFmt(it.date)+'</td>'
      +'<td class="dops-r">'+dopsBadge(it.days<=7?'bad':'wait',lbl)+'</td></tr>';
  }).join('');
  const incRows=r.inc.slice(0,DOPS_CAP).map(function(it){
    return '<tr'+dopsRowAttrs(it.x)+'>'+dopsWho(it.x)
      +'<td colspan="3" class="dops-miss">Missing: '+it.miss.join(', ')+'</td></tr>';
  }).join('');
  return '<div class="dops-group-h">Expiring · '+r.exp.length+'</div>'
    +(r.exp.length
      ?'<table class="hr-leave-table dops-table"><tbody>'+expRows+'</tbody></table>'+dopsMore(r.exp.length)
      :dopsEmpty('Nothing expiring in the next '+dopsExpWindow+' days','Try a longer window above to plan further ahead.'))
    +'<div class="dops-group-h">Incomplete · '+r.inc.length+'</div>'
    +(r.inc.length
      ?'<table class="hr-leave-table dops-table"><tbody>'+incRows+'</tbody></table>'+dopsMore(r.inc.length)
      :dopsEmpty('All records complete','Bank details and compliance snapshots are on file for everyone.'));
}
function dopsExpiringHTML(){
  const seg='<div class="segmented is-compact dops-seg-ctl" role="tablist" aria-label="Window">'
    +[15,30,45].map(function(n){
      return '<button type="button" role="tab" aria-selected="'+(dopsExpWindow===n)+'" class="seg-btn'+(dopsExpWindow===n?' active':'')+'" data-win="'+n+'" onclick="dopsSetWindow('+n+')">'+n+' days</button>';
    }).join('')+'</div>';
  return '<div class="hr-section dops-exp-card">'
    +'<div class="hr-section-header"><div class="hr-section-title">Expiring &amp; incomplete records</div></div>'
    +seg+'<div id="dops-exp-body">'+dopsExpBodyHTML()+'</div></div>';
}
// Only the list is rewritten; the segmented bar stays, so tab-slide.js moves
// its marker instead of rebuilding it.
function dopsSetWindow(n){
  dopsExpWindow=n;
  document.querySelectorAll('.dops-seg-ctl .seg-btn').forEach(function(b){
    const on=+b.getAttribute('data-win')===n;
    b.classList.toggle('active',on);b.setAttribute('aria-selected',on);
  });
  const body=document.getElementById('dops-exp-body');
  if(body)body.innerHTML=dopsExpBodyHTML();
}
/* The record, opened where it lives: Employees, on its Direct or Global tab,
   with its panel on Basic Details. Filters are cleared so the row is on screen
   — a panel must belong to a row you can see. */
function dopsOpenEmp(tab,id){
  empSubTab=tab;
  if(tab==='global'){
    geStatusFilter='';geSearchQuery='';geSelectedId=id;geTab='basic-details';
    if(typeof geEditMode!=='undefined')geEditMode=false;
  }else{
    deDeptFilter='';deBranchFilter='';deStatusFilter='';deSearchQuery='';
    deSelectedId=id;deTab='basic-details';
    if(typeof deEditMode!=='undefined')deEditMode=false;
  }
  navigatePage('employees',true);
}

/* ── Render entry, called from renderer.js ─────────────────────────────── */
function dashOpsRender(root){
  const scope=root||document;
  if(!scope.querySelector)return;
  const wk=scope.querySelector('#emp-week-dash');
  if(wk)wk.innerHTML=DASH_MODULES.timesheets?dopsWeekHTML():'';
  const ops=scope.querySelector('#hr-ops-dash');
  if(ops){
    const cards=[];
    if(DASH_MODULES.attendance)cards.push(dopsAttendanceHTML());
    cards.push(dopsExpiringHTML());
    ops.innerHTML='<div class="hr-grid-2'+(cards.length===1?' is-single':'')+'">'+cards.join('')+'</div>';
  }
  /* Bars start at 0 and widen on the next frame — the cost calculator's
     composition bar does the same. Reduced motion drops the transition in
     CSS, so the width simply lands. */
  const bars=scope.querySelectorAll('.dops-prog i[data-w], .dops-seg[data-w]');
  if(!bars.length)return;
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    bars.forEach(function(el){el.style.width=el.getAttribute('data-w')+'%';});
  });});
}
