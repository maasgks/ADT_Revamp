/* ══ TIMESHEET BILLING — submit, approve, invoice ════════════════════════════
   What happens to a timesheet after it is locked, end to end:

     My Timesheet          the employee locks weeks and submits them
       (js/core.js)        Weekly billing: each week is its own period
                           Monthly billing: the whole month in one submission
     Sales Order           the approver reviews every week in a submission and
       › Timesheets        approves or rejects each one on its own. A rejected
                           week goes back to the employee with the reason, is
                           corrected and resubmitted ALONE - the rest of its
                           month is not sent again.
     Sales Order           approved weeks become an invoice draft per billing
       › Receivable        period, with the rate that applied on each day. A
                           week that runs across a rate change is split into
                           one line per rate rather than priced at either.

   Nothing on this page is typed twice. A week's status lives in tsWeekState
   (the timesheet and the approval queue both read it), and an invoice draft is
   DERIVED from the approved weeks every time it is drawn - only the act of
   generating the final invoice is stored.

   The payment cycle itself is a field on the order (Sales Details › Payment
   Cycle), not a settings screen of its own.
   ========================================================================== */

let tsbSubs=[];             // submissions, newest first
let tsbSeq=1000;
let tsbInvoices={};         // billing period key -> {no, date, total}
let tsbInvSeq=0;
let tsbModal=null;          // {kind:'reject', subId, key} | {kind:'preview', orderId, period}
/* Who decides on a timesheet - the same roles that may reopen one. */
const TS_APPROVE_ROLES=['Super Admin','Opendhi Admin','Admin','HR','Reporting Manager'];
function tsbCanApprove(){return TS_APPROVE_ROLES.indexOf(currentRole)>=0;}

const TSB_MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
function tsbCycle(p){return p&&p.sales&&p.sales.paymentCycle==='Weekly'?'Weekly':'Monthly';}
function tsbShort(iso){const p=iso.split('-');return (+p[2])+' '+TSB_MON[+p[1]-1].slice(0,3);}
function tsbMoney(cur,n){
  return (cur||'')+' '+Number(n||0).toLocaleString(cur==='INR'?'en-IN':'en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
}
// The billing period a week belongs to: the week itself, or its month.
function tsbPeriodKey(unitKey){return unitKey.indexOf('W:')===0?unitKey:'M:'+unitKey.slice(0,7);}
function tsbPeriodLabel(pk){
  if(pk.indexOf('M:')===0){const p=pk.slice(2).split('-');return TSB_MON[+p[1]-1]+' '+p[0];}
  const mon=pk.slice(2),sun=tsAddDays(mon,6);
  return tsbShort(mon)+' – '+tsbShort(sun)+' '+sun.slice(0,4);
}
// Every unit a period is made of - what has to be approved before it bills.
function tsbPeriodUnits(pk){
  if(pk.indexOf('W:')===0)return [pk];
  const p=pk.slice(2).split('-'),y=+p[0],m=+p[1]-1,out=[];
  for(let w=1;w<=tsWeekCount(y,m);w++)out.push(tsWeekKey(y,m,w));
  return out;
}
function tsbTally(dates){
  let h=0,d=0;
  dates.forEach(function(k){const a=tsAttendance[k];if(a&&a.status==='present'){h+=parseFloat(a.hours)||0;d++;}});
  return {hours:h,days:d};
}

/* ── Submitting (called from tsSubmitLockedWeeks in js/core.js) ─────────── */
function tsbSubmit(kind,units){
  const o=tsOrder(),id='TS-'+(++tsbSeq),st=stampNow();
  const weeks=units.map(function(u){
    const t=tsbTally(u.dates);
    return {key:u.key,w:u.w,y:u.y,m:u.m,from:u.dates[0],to:u.dates[u.dates.length-1],
      days:t.days,hours:t.hours,status:'pending',note:'',by:'',at:''};
  });
  const pk=tsbPeriodKey(units[0].key);
  tsbSubs.unshift({id:id,orderId:o?o.id:null,kind:kind,cycle:tsCycle(),period:pk,
    created:st.date+' | '+st.time,by:tsEmp.name,weeks:weeks});
  units.forEach(function(u){tsWeekState[u.key]='submitted';tsWeekMeta[u.key]={sub:id};});
  return id;
}
function tsbSubLabel(s){
  if(s.kind==='Monthly')return tsbPeriodLabel(s.period);
  const wk=s.weeks[0];
  return 'Week '+wk.w+' · '+tsbShort(wk.from)+' – '+tsbShort(wk.to);
}
// One status for a submission, derived from its weeks.
function tsbSubStatus(s){
  const n={pending:0,approved:0,rejected:0};
  s.weeks.forEach(function(w){n[w.status]++;});
  if(n.pending)return n.pending===s.weeks.length?{label:'Pending Approval',tone:'wait'}:{label:'Partly Reviewed',tone:'wait'};
  if(!n.rejected)return {label:'Approved',tone:'ok'};
  return n.approved?{label:'Partly Rejected',tone:'bad'}:{label:'Rejected',tone:'bad'};
}

/* ── Deciding ───────────────────────────────────────────────────────────── */
function tsbDecide(subId,key,status,note){
  const s=tsbSubs.find(function(x){return x.id===subId;});if(!s)return null;
  const wk=s.weeks.find(function(x){return x.key===key;});
  if(!wk||wk.status!=='pending')return null;
  const st=stampNow();
  wk.status=status;wk.note=note||'';wk.by=CURRENT_USER;wk.at=st.date+' | '+st.time;
  tsWeekState[key]=status;
  tsWeekMeta[key]={sub:s.id,reason:status==='rejected'?wk.note:''};
  return wk;
}
function tsbApprove(subId,key){
  if(!tsbCanApprove()){showToast('Approval not available','error','Only HR, a Manager, Admin, Opendhi Admin or Super Admin can approve timesheets.');return;}
  const wk=tsbDecide(subId,key,'approved','');
  if(!wk)return;
  isbTab('pm',renderPmSidebar);
  showToast('Week '+wk.w+' approved','success',tsbShort(wk.from)+' – '+tsbShort(wk.to)+' · '+wk.hours.toFixed(2)+'h. It now counts towards the invoice draft.');
}
function tsbApproveAll(subId){
  if(!tsbCanApprove())return;
  const s=tsbSubs.find(function(x){return x.id===subId;});if(!s)return;
  const done=s.weeks.filter(function(w){return w.status==='pending';}).map(function(w){tsbDecide(subId,w.key,'approved','');return w.w;});
  if(!done.length)return;
  isbTab('pm',renderPmSidebar);
  showToast(done.length+' week'+(done.length===1?'':'s')+' approved','success',s.id+' · Week '+done.join(', ')+'.');
}
function tsbOpenReject(subId,key){
  if(!tsbCanApprove())return;
  tsbModal={kind:'reject',subId:subId,key:key};tsbPaint();
  const t=document.getElementById('tsb-reject-note');if(t)t.focus();
}
function tsbConfirmReject(){
  const m=tsbModal;if(!m||m.kind!=='reject')return;
  const t=document.getElementById('tsb-reject-note'),note=t?t.value.trim():'';
  if(!note){
    const e=document.getElementById('tsb-reject-err');if(e)e.hidden=false;
    if(t)t.focus();
    return;
  }
  const wk=tsbDecide(m.subId,m.key,'rejected',note);
  tsbModal=null;tsbPaint();
  if(!wk)return;
  isbTab('pm',renderPmSidebar);
  showToast('Week '+wk.w+' sent back','info','The employee can correct and resubmit just this week.');
}

/* ── Sales Details: Payment Cycle ───────────────────────────────────────── */
function tsbCycleControlHTML(p){
  const c=tsbCycle(p);
  return '<div class="segmented is-compact tsb-cycle-seg" role="radiogroup" aria-label="Payment cycle">'
    +['Weekly','Monthly'].map(function(v){
      return '<button type="button" class="seg-btn'+(c===v?' active':'')+'" role="radio" aria-checked="'+(c===v)+'"'
        +' onclick="tsbSetCycle('+p.id+',\''+v+'\')">'+v+'</button>';
    }).join('')+'</div>';
}
function tsbSetCycle(id,v){
  const p=paymentsData.find(function(x){return x.id===id;});
  if(!p||tsbCycle(p)===v)return;
  // Changing how an order bills under a timesheet still being decided would
  // leave that submission belonging to neither cycle.
  const waiting=tsbSubs.some(function(s){return s.orderId===id&&s.weeks.some(function(w){return w.status==='pending';});});
  if(waiting){
    showToast('Payment cycle not changed','error','Timesheets on this order are waiting on approval. Approve or reject them first.');
    return;
  }
  p.sales.paymentCycle=v;
  if(id===TS_ORDER_ID){tsSel={};tsMonthSel=false;}
  isbTab('pm',renderPmSidebar);
  showToast('Payment cycle set to '+v,'success',v==='Weekly'
    ?'Each locked week is submitted and invoiced as its own period.'
    :'Timesheets are submitted and invoiced a whole month at a time.');
}
// "was INR 95,000.00 until 17 Jun" under the current rate, when it has changed.
function tsbRateNoteHTML(p){
  const rs=(p.sales&&p.sales.rateSchedule)||[];
  if(rs.length<2)return '';
  const cur=rs[rs.length-1],was=rs[rs.length-2];
  return '<span class="tsb-rate-note">from '+tsFmtDay(cur.from)+' · was '+tsbMoney(p.sales.currency,was.amount)+'</span>';
}

/* ── Rates and charges ──────────────────────────────────────────────────── */
function tsbRateOn(p,iso){
  let r=null;
  ((p.sales&&p.sales.rateSchedule)||[]).forEach(function(x){if(x.from<=iso)r=x.amount;});
  return r;
}
function tsbWorkingDays(ym){
  const p=ym.split('-'),y=+p[0],m=+p[1]-1,dim=new Date(y,m+1,0).getDate();
  let n=0;
  for(let d=1;d<=dim;d++){if(!arNonWorkingDay(y+'-'+tsPad(m+1)+'-'+tsPad(d)))n++;}
  return n;
}
/* The invoice lines for a set of approved days. Days are grouped by the rate
   in force on each one (and, on a monthly rate, by month, since the day rate
   is the month's rate over that month's working days) - so a week across a
   rate change bills as two lines, each at its own rate.
     Hourly   hours × rate
     Daily    days worked × rate
     Monthly  days worked × (monthly rate ÷ working days in that month) */
function tsbLines(p,dates){
  const rt=(p.sales&&p.sales.rateType)||'Monthly',cur=p.sales&&p.sales.currency;
  const segs=[],byKey={};
  dates.slice().sort().forEach(function(d){
    const a=tsAttendance[d];
    if(!a||a.status!=='present')return;
    const rate=tsbRateOn(p,d);if(rate==null)return;
    const k=rate+'|'+(rt==='Hourly'||rt==='Daily'?'':d.slice(0,7));
    let s=byKey[k];
    if(!s){s=byKey[k]={from:d,to:d,rate:rate,month:d.slice(0,7),days:0,hours:0};segs.push(s);}
    s.to=d;s.days++;s.hours+=parseFloat(a.hours)||0;
  });
  return segs.map(function(s){
    let qty,unit,qtyLbl,basis;
    if(rt==='Hourly'){qty=s.hours;unit=s.rate;qtyLbl=s.hours.toFixed(2)+' h';basis=tsbMoney(cur,s.rate)+' / hour';}
    else if(rt==='Daily'){qty=s.days;unit=s.rate;qtyLbl=s.days+' d';basis=tsbMoney(cur,s.rate)+' / day';}
    else{
      const wd=tsbWorkingDays(s.month);
      qty=s.days;unit=wd?s.rate/wd:0;qtyLbl=s.days+' d';
      basis=tsbMoney(cur,s.rate)+' / month ÷ '+wd+' working days';
    }
    const amount=Math.round(qty*unit*100)/100;
    return {from:s.from,to:s.to,qty:qty,qtyLbl:qtyLbl,unit:unit,basis:basis,amount:amount,rate:s.rate,hours:s.hours,days:s.days};
  });
}

/* ── Invoice drafts, derived from the approved weeks ────────────────────── */
function tsbDrafts(p){
  const map={},order=[];
  tsbSubs.filter(function(s){return s.orderId===p.id;}).forEach(function(s){
    s.weeks.forEach(function(wk){
      const pk=tsbPeriodKey(wk.key);
      if(!map[pk]){map[pk]={key:pk,cycle:pk.indexOf('W:')===0?'Weekly':'Monthly',weeks:{}};order.push(pk);}
      // Newest submission first, so the first outcome seen is the current one.
      if(!map[pk].weeks[wk.key])map[pk].weeks[wk.key]=Object.assign({sub:s.id},wk);
    });
  });
  // Newest billing period first, whatever order they were submitted in.
  const start=function(pk){return pk.indexOf('M:')===0?pk.slice(2)+'-01':pk.slice(2);};
  order.sort(function(a,b){return start(b).localeCompare(start(a));});
  return order.map(function(pk){
    const d=map[pk],units=tsbPeriodUnits(pk);
    const weeks=units.map(function(k){return d.weeks[k];}).filter(Boolean);
    const approved=weeks.filter(function(w){return w.status==='approved';});
    if(!approved.length)return null;
    const dates=[];
    approved.forEach(function(w){
      // Only the period's own dates - on Monthly billing the part of a week
      // inside the month, never the days either side of it.
      let x=w.from;while(x<=w.to){dates.push(x);x=tsAddDays(x,1);}
    });
    const lines=tsbLines(p,dates);
    const total=lines.reduce(function(t,l){return t+l.amount;},0);
    const subs=[];approved.forEach(function(w){if(subs.indexOf(w.sub)<0)subs.push(w.sub);});
    return {key:pk,label:tsbPeriodLabel(pk),cycle:d.cycle,units:units.length,approved:approved.length,
      ready:approved.length===units.length,lines:lines,total:total,subs:subs,
      weeks:approved.map(function(w){return w.w;}),inv:tsbInvoices[p.id+'|'+pk]||null};
  }).filter(Boolean);
}

/* ── Sales Order › Timesheets: the approval queue ───────────────────────── */
function tsbApprovalTabHTML(p){
  const subs=tsbSubs.filter(function(s){return s.orderId===p.id;});
  const n={all:0,pending:0,approved:0,rejected:0};
  subs.forEach(function(s){s.weeks.forEach(function(w){n.all++;n[w.status]++;});});
  const statCard=function(label,val,color){
    return '<div class="pm-ts-stat"><div class="pm-ts-stat-val" style="color:'+color+'">'+val+'</div><div class="pm-ts-stat-lbl">'+label+'</div></div>';};
  const can=tsbCanApprove(),s=p.sales||{};
  const rate=s.rate&&s.rateType?s.rate+' / '+s.rateType:(s.rate||'—');
  const badge=function(label,tone){return '<span class="lp-status-badge tone-'+tone+'">'+label+'</span>';};
  const wkBadge=function(w){
    return w.status==='approved'?badge('Approved','ok'):w.status==='rejected'?badge('Rejected','bad'):badge('Pending','wait');};
  const wkActions=function(sub,w){
    if(w.status!=='pending'){
      return '<span class="tsb-decided" title="'+attrSafe((w.by||'')+(w.at?' · '+w.at:''))+'">'
        +(w.status==='rejected'&&w.note?'“'+sbEsc(w.note)+'”':(w.by?'by '+w.by:''))+'</span>';
    }
    if(!can)return '<span class="tsb-decided">Awaiting approver</span>';
    return '<div class="tsb-acts">'
      +'<button class="hr-action-btn reject" onclick="tsbOpenReject(\''+sub.id+'\',\''+w.key+'\')">Reject</button>'
      +'<button class="hr-action-btn approve" onclick="tsbApprove(\''+sub.id+'\',\''+w.key+'\')">Approve</button></div>';
  };
  let rows='';
  subs.forEach(function(sub){
    const st=tsbSubStatus(sub),multi=sub.weeks.length>1;
    const days=sub.weeks.reduce(function(t,w){return t+w.days;},0);
    const hrs=sub.weeks.reduce(function(t,w){return t+w.hours;},0);
    const pend=sub.weeks.filter(function(w){return w.status==='pending';}).length;
    rows+='<tr class="tsb-sub-row">'
      +'<td class="csag-td"><b>'+sub.id+'</b><div class="tsb-sub">'+sub.kind+' · '+sub.created.split(' | ')[0]+'</div></td>'
      +'<td class="csag-td">'+tsbSubLabel(sub)+(multi?'<div class="tsb-sub">'+sub.weeks.length+' weeks</div>':'')+'</td>'
      +'<td class="csag-td">'+days+'</td>'
      +'<td class="csag-td tsb-num">'+hrs.toFixed(2)+'h</td>'
      +'<td class="csag-td">'+badge(st.label,st.tone)+'</td>'
      +'<td class="csag-td csag-act">'+(multi
        ?(can&&pend?'<button class="hr-action-btn approve" onclick="tsbApproveAll(\''+sub.id+'\')" title="Approve the '+pend+' pending week'+(pend===1?'':'s')+' below">Approve all</button>':'')
        :wkActions(sub,sub.weeks[0]))+'</td>'
      +'</tr>';
    /* A monthly submission is reviewed week by week: each of its weeks gets
       its own row, its own outcome and its own Approve / Reject, so one bad
       week does not hold the other four hostage. */
    if(multi)sub.weeks.forEach(function(w){
      rows+='<tr class="tsb-week-row">'
        +'<td class="csag-td"><span class="tsb-week-name">Week '+w.w+'</span></td>'
        +'<td class="csag-td">'+tsbShort(w.from)+' – '+tsbShort(w.to)+'</td>'
        +'<td class="csag-td">'+w.days+'</td>'
        +'<td class="csag-td tsb-num">'+w.hours.toFixed(2)+'h</td>'
        +'<td class="csag-td">'+wkBadge(w)+'</td>'
        +'<td class="csag-td csag-act">'+wkActions(sub,w)+'</td>'
        +'</tr>';
    });
  });
  if(!rows)rows='<tr><td colspan="6" class="csag-td csag-empty">No timesheets submitted on this order yet.'
    +(p.id===TS_ORDER_ID?' They arrive here from My Timesheet.':'')+'</td></tr>';
  return '<div class="pm-ts-stats">'
      +statCard('Weeks',n.all,'var(--navy)')+statCard('Pending',n.pending,'var(--gray)')
      +statCard('Approved',n.approved,'var(--green)')+statCard('Rejected',n.rejected,'var(--red)')
    +'</div>'
    +'<div class="tsb-cycle-line">Billed <b>'+tsbCycle(p)+'</b> at <b>'+rate+'</b> · set in Sales Details'
      +(can?'':' · <span>Approve / Reject needs HR, a Manager or an Admin role</span>')+'</div>'
    +'<div class="att-table-wrap csag-table-wrap"><table class="att-table csag-table tsb-table"><thead><tr>'
    +'<th>Timesheet</th><th>Period</th><th>Days</th><th>Total Hours</th><th>Status</th><th class="csag-act">Action</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table></div>';
}

/* ── Sales Order › Receivable: invoice drafts ───────────────────────────── */
function tsbReceivableHTML(p){
  const drafts=tsbDrafts(p),cur=p.sales&&p.sales.currency;
  if(!drafts.length){
    return '<div class="tsb-empty">No receivables yet. An invoice draft appears here as soon as a timesheet week on this order is approved.</div>';
  }
  const eye='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  const rows=drafts.map(function(d){
    const rates=[];d.lines.forEach(function(l){const r=tsbMoney(cur,l.unit);if(rates.indexOf(r)<0)rates.push(r);});
    const qty=d.lines.reduce(function(t,l){return t+l.days;},0);
    const hrs=d.lines.reduce(function(t,l){return t+l.hours;},0);
    const status=d.inv?'<span class="lp-status-badge tone-ok">Generated</span><div class="tsb-sub">'+d.inv.no+'</div>'
      :d.ready?'<span class="lp-status-badge tone-info">Draft</span>'
      :'<span class="lp-status-badge tone-wait">Draft</span><div class="tsb-sub">'+d.approved+' of '+d.units+' weeks approved</div>';
    return '<tr>'
      +'<td class="csag-td"><b>'+d.label+'</b><div class="tsb-sub">'+d.cycle+' billing</div></td>'
      +'<td class="csag-td">Order #'+p.orderId+'<div class="tsb-sub">'+d.subs.join(', ')+' · Wk '+d.weeks.join(', ')+'</div></td>'
      +'<td class="csag-td">'+qty+' d<div class="tsb-sub">'+hrs.toFixed(2)+'h</div></td>'
      +'<td class="csag-td">'+rates.map(function(r){return '<span class="tsb-num">'+r+'</span>';}).join('<br>')+(rates.length>1?'<div class="tsb-sub tsb-split">Rate changed in period</div>':'')+'</td>'
      +'<td class="csag-td tsb-num"><b>'+tsbMoney(cur,d.total)+'</b></td>'
      +'<td class="csag-td">'+status+'</td>'
      +'<td class="csag-td csag-act"><div class="tsb-acts">'
        +'<button class="at-sb-icon-btn" title="Preview invoice" onclick="tsbOpenPreview('+p.id+',\''+d.key+'\')">'+eye+'</button>'
        +(d.ready&&!d.inv?'<button class="btn-primary btn-sm" onclick="tsbGenerate('+p.id+',\''+d.key+'\')">Generate</button>':'')
      +'</div></td>'
      +'</tr>';
  }).join('');
  return '<div class="tsb-rcv-title">Invoice Drafts <span>from approved timesheets</span></div>'
    +'<div class="att-table-wrap csag-table-wrap"><table class="att-table csag-table tsb-table"><thead><tr>'
    +'<th>Billing Period</th><th>Source</th><th>Quantity</th><th>Rate</th><th>Charges</th><th>Status</th><th class="csag-act">Action</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function tsbFindDraft(orderId,pk){
  const p=paymentsData.find(function(x){return x.id===orderId;});if(!p)return null;
  const d=tsbDrafts(p).find(function(x){return x.key===pk;});
  return d?{p:p,d:d}:null;
}
function tsbGenerate(orderId,pk){
  const f=tsbFindDraft(orderId,pk);if(!f)return;
  if(f.d.inv)return;
  if(!f.d.ready){
    showToast('Invoice not generated','error',f.d.label+' has '+(f.d.units-f.d.approved)+' week'+(f.d.units-f.d.approved===1?'':'s')+' still to be approved.');
    return;
  }
  const st=stampNow();
  tsbInvoices[orderId+'|'+pk]={no:'INV-2026-'+String(++tsbInvSeq).padStart(4,'0'),date:st.date,total:f.d.total};
  if(tsbModal&&tsbModal.kind==='preview')tsbPaint();
  isbTab('pm',renderPmSidebar);
  showToast('Invoice generated','success',tsbInvoices[orderId+'|'+pk].no+' · '+f.d.label+' · '+tsbMoney(f.p.sales.currency,f.d.total)+'.');
}
function tsbOpenPreview(orderId,pk){tsbModal={kind:'preview',orderId:orderId,period:pk};tsbPaint();}

/* The invoice document, in the payslip's printed style (css/at-salary.css
   .psl-*) so the two documents the app produces read as one family. A draft
   says DRAFT where the number goes; the period, the source timesheets and
   every rate line are on it either way. */
function tsbInvoiceHTML(p,d){
  const cur=p.sales.currency,co=(typeof AT_COMPANY!=='undefined')?AT_COMPANY:{name:'Open Dhi Private Limited',formerly:'',address:''};
  const kv=function(k,v){return '<div class="psl-kv"><span>'+k+'</span><b>'+v+'</b></div>';};
  const rates=[];d.lines.forEach(function(l){if(rates.indexOf(l.rate)<0)rates.push(l.rate);});
  const body=d.lines.map(function(l,i){
    return '<tr><td>'+(i+1)+'</td>'
      +'<td>Timesheet services · '+p.emp.name+'<div class="tsb-inv-basis">'+l.basis+'</div></td>'
      +'<td>'+tsbShort(l.from)+' – '+tsbShort(l.to)+'</td>'
      +'<td class="psl-num">'+l.qtyLbl+'</td>'
      +'<td class="psl-num">'+tsbMoney(cur,l.unit)+'</td>'
      +'<td class="psl-num">'+tsbMoney(cur,l.amount)+'</td></tr>';
  }).join('');
  return '<div class="psl tsb-inv">'
    +'<div class="psl-head"><img src="assets/Opendhilogo.png" alt="OpenDhi" class="psl-logo">'
      +'<div class="psl-co"><b>'+co.name+'</b><span>'+(co.formerly||'')+'</span></div></div>'
    +(co.address?'<div class="psl-addr">'+co.address+'</div>':'')
    +'<div class="psl-title">'+(d.inv?'Tax Invoice':'Invoice Draft')+' · '+d.cycle+' billing period <b>'+d.label+'</b></div>'
    +'<div class="psl-info">'
      +'<div>'+kv('Bill To',p.sales.companyName)+kv('Contact',p.sales.contactPersonName)+kv('Work Location',p.sales.workLocation)+'</div>'
      +'<div>'+kv('Invoice No.',d.inv?d.inv.no:'DRAFT')+kv('Invoice Date',d.inv?d.inv.date:'—')+kv('Payment Term',(p.sales.paymentTerm||'0')+' days')+'</div>'
      +'<div>'+kv('Sales Order','#'+p.orderId)+kv('Timesheets',d.subs.join(', '))+kv('Rate Type',p.sales.rateType)+'</div>'
    +'</div>'
    +'<table class="psl-table"><thead><tr><th>#</th><th>Description</th><th>Period</th><th class="psl-num">Qty</th><th class="psl-num">Rate</th><th class="psl-num">Amount</th></tr></thead>'
      +'<tbody>'+body+'</tbody>'
      +'<tfoot><tr><td colspan="5">Total ('+cur+')</td><td class="psl-num">'+tsbMoney(cur,d.total)+'</td></tr></tfoot></table>'
    +(rates.length>1?'<div class="psl-net">The rate changed during this period, so it is billed in '+d.lines.length+' lines - each day at the rate in force on that day.</div>':'')
    +'<div class="psl-foot">'+(d.inv?'This is a system-generated invoice.':'Draft - not issued. Figures update as timesheet weeks are approved.')+'</div>'
    +'</div>';
}

/* ── Modals: reject reason, invoice preview ─────────────────────────────── */
function tsbClose(){tsbModal=null;tsbPaint();}
function tsbPaint(){
  let host=document.getElementById('tsb-modal');
  if(!tsbModal){if(host)host.remove();return;}
  if(!host){host=document.createElement('div');host.id='tsb-modal';document.body.appendChild(host);}
  const m=tsbModal;
  const x='<button class="ct-modal-close" onclick="tsbClose()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
  let inner='';
  if(m.kind==='reject'){
    const s=tsbSubs.find(function(z){return z.id===m.subId;});
    const w=s&&s.weeks.find(function(z){return z.key===m.key;});
    if(!w){tsbModal=null;host.remove();return;}
    inner='<div class="ct-modal" onclick="event.stopPropagation()">'
      +'<div class="ct-modal-hdr"><span class="ct-modal-title">Reject week '+w.w+'</span>'+x+'</div>'
      +'<p class="ct-modal-sub">'+tsbShort(w.from)+' – '+tsbShort(w.to)+' goes back to '+s.by+' to correct. Only this week is sent back'
        +(s.weeks.length>1?' - the other weeks of '+s.id+' keep their outcome.':'.')+' Say what is wrong; they will see this.</p>'
      +'<label class="ep-form-label" for="tsb-reject-note">Reason for rejection <span class="req">*</span></label>'
      +'<textarea class="lp-logs-form-textarea" id="tsb-reject-note" placeholder="e.g. 16 Jun shows 9.25h but the client log has 7h - please correct the clock-out"></textarea>'
      +'<div class="tsb-err" id="tsb-reject-err" hidden>A reason is required to reject a week.</div>'
      +'<div class="ct-modal-foot"><div class="ct-modal-btns"><button class="btn-outline" onclick="tsbClose()">Cancel</button>'
        +'<button class="btn-primary" onclick="tsbConfirmReject()">Reject week</button></div></div>'
      +'</div>';
  }else{
    const f=tsbFindDraft(m.orderId,m.period);
    if(!f){tsbModal=null;host.remove();return;}
    inner='<div class="ct-modal ct-modal--form atsal-slip-modal" onclick="event.stopPropagation()">'
      +'<div class="ct-modal-hdr"><span class="ct-modal-title">'+(f.d.inv?'Invoice '+f.d.inv.no:'Invoice preview')+' — '+f.d.label
        +' <span class="lp-status-badge tone-'+(f.d.inv?'ok':'info')+'">'+(f.d.inv?'Generated':'Draft')+'</span></span>'+x+'</div>'
      +'<div class="atsal-slip-scroll">'+tsbInvoiceHTML(f.p,f.d)+'</div>'
      +'<div class="ct-modal-foot"><span class="atsal-hint">'+(f.d.ready?'':f.d.approved+' of '+f.d.units+' weeks approved - it can be generated once all are.')+'</span>'
        +'<div class="ct-modal-btns"><button class="btn-outline" onclick="tsbClose()">Close</button>'
        +(f.d.ready&&!f.d.inv?'<button class="btn-primary" onclick="tsbGenerate('+f.p.id+',\''+f.d.key+'\')">Generate Invoice</button>':'')
        +'</div></div>'
      +'</div>';
  }
  host.innerHTML='<div class="ct-modal-overlay" onclick="tsbClose()">'+inner+'</div>';
}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&tsbModal)tsbClose();});
