/* ══ COMPANY SETTINGS → LEAVES ═════════════════════════════════════════════
   The tab used to state four facts about the leave year and list the leave
   types. It now also carries the three rules that decide what a leave request
   actually costs and who has to agree to it:

     · LEAVE RESTRICTIONS  the longest unbroken stretch anyone may take
     · SANDWICH RULE       whether the days OFF inside a stretch of leave are
                           counted as leave too. Take Friday and Monday and the
                           weekend between them is either free or four days
                           gone — this is the switch that decides which, and it
                           is the single most argued-about setting in leave.
     · APPROVAL WORKFLOW   how many people sign a request off, and who

   VIEW FIRST, THEN EDIT — the same shape as every sibling tab, and built from
   the same parts: .lp-sb-view-header with the Edit button in it,
   .lp-sb-detail-grid over .lp-sb-field-card to read, and the sidebar's
   standard .lp-sb-edit-form / .lp-sb-edit-section / .lp-sb-form-grid to
   change. Nothing here draws a control of its own.

   THE FOUR ORIGINAL FACTS ARE KEPT and are now editable rather than hard-coded
   into the markup, along with the leave-type table that has always sat under
   them. */

const CSL_FREQ=['Yearly','Half-Yearly','Quarterly','Monthly'];
const CSL_YESNO=['Yes','No'];
const CSL_LEVELS=['No Approval','1 Level Approval','2 Level Approval'];
/* Separate from the attendance approvers on purpose: who signs off a leave and
   who signs off a claim for a worked holiday are two different questions, and
   an entity may well answer them differently. */
const CSL_APPROVERS=['Manager','Reporting Manager','HR','Department Head','Entity Admin'];

let csLeave={
  // the four the tab has always shown
  periodFrom:'2026-01-14',
  periodTo:'2027-04-14',
  allocationFrequency:'Yearly',
  probationMonths:1,
  lopAllowed:true,
  // leave restrictions
  maxConsecutive:15,
  // sandwich rule
  sandwichEnabled:true,
  countWeeklyOff:'Yes',
  countHoliday:'No',
  // approval workflow
  approvalLevel:'2 Level Approval',
  level1Approver:'HR',
  level2Approver:'Manager'
};
let csLeaveEdit=false;
let csLeaveDraft=null;
let csLeaveDirty=false;

function cslClone(o){return JSON.parse(JSON.stringify(o));}
function cslInt(v,fallback){
  const n=parseInt(v,10);
  return isNaN(n)?fallback:Math.max(0,n);
}
function cslLevels(){
  const l=csLeave.approvalLevel;
  return l==='2 Level Approval'?2:l==='1 Level Approval'?1:0;
}
// "14/01/2026", the format this tab has always printed the leave period in.
function cslDate(iso){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');
  return m?(m[3]+'/'+m[2]+'/'+m[1]):'—';
}
function cslOnChange(){
  if(!csLeaveEdit)return;
  csLeaveDirty=true;
  const el=document.getElementById('csl-dirty');
  if(el)el.classList.add('is-on');
}
// apCD hands its onpick hook the ISO value only, so one named wrapper per
// field — and they must be declarations to be reachable as window.<name>.
function cslPickFrom(v){if(csLeaveDraft)csLeaveDraft.periodFrom=v;cslOnChange();}
function cslPickTo(v){if(csLeaveDraft)csLeaveDraft.periodTo=v;cslOnChange();}

const CSL_ICO={
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  doc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  stack:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  edit:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
};

/* The four small helpers below are the Attendance tab's — .csa-unit for a
   number that carries its unit, .csa-sub for the line between grids, .csa-hint
   and .csa-check. They are generic Company-Settings form parts rather than
   anything to do with attendance, and are borrowed rather than copied so the
   two tabs cannot drift apart. See css/attendance-settings.css. */
function cslFc(icon,label,value,wide){
  return '<div class="lp-sb-field-card'+(wide?' is-wide':'')+'">'
    +'<div class="lp-sb-field-icon">'+icon+'</div>'
    +'<div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div>'
    +'<div class="lp-sb-field-value">'+(value!=null&&value!==''?value:'<span style="color:#9ca3af">-</span>')+'</div></div>'
  +'</div>';
}
function cslSub(text,action){return '<div class="csa-sub">'+text+(action||'')+'</div>';}
function cslGroup(label,control,full,hint){
  return '<div class="lp-sb-field'+(full?' ep-form-full':'')+'">'
    +'<label>'+label+'</label>'+control
    +(hint?'<span class="csa-hint">'+hint+'</span>':'')
  +'</div>';
}
function cslSelect(id,opts,value){
  return '<select class="ep-form-select" id="'+id+'" onchange="cslOnChange()">'
    +opts.map(function(o){
      return '<option value="'+attrSafe(o)+'"'+(o===value?' selected':'')+'>'+attrSafe(o)+'</option>';
    }).join('')
  +'</select>';
}
function cslCheck(id,on,text){
  return '<label class="hd-check csa-check"><input type="checkbox" id="'+id+'"'+(on?' checked':'')
    +' onchange="cslOnChange()"><span>'+text+'</span></label>';
}
function cslUnit(id,value,unit,min,max){
  return '<div class="csa-unit">'
    +'<input type="number" class="ep-form-input" id="'+id+'" value="'+attrSafe(value)+'"'
      +' min="'+(min==null?0:min)+'"'+(max!=null?' max="'+max+'"':'')+' step="1" oninput="cslOnChange()">'
    +'<span class="csa-unit-tag">'+unit+'</span>'
  +'</div>';
}

/* ── The leave-type table, unchanged in substance ──────────────────────────
   It was written inline in renderCsSidebar with its styles repeated on every
   cell; it is the same table, moved here so the tab has one owner. */
const cslTypes=[
  {name:'Casual Leave',yearly:24,monthly:5,cf:10,probation:'Yes',prorate:'No',status:'Active'},
  {name:'Sick Leave',yearly:12,monthly:2,cf:6,probation:'Yes',prorate:'Yes',status:'Active'},
  {name:'Earned Leave',yearly:18,monthly:1.5,cf:30,probation:'No',prorate:'Yes',status:'Active'}
];
function cslTableHTML(){
  const thS='padding:7px 9px;text-align:left;font-size:10.5px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border)';
  const tdS='padding:8px 9px;font-size:12.5px;color:var(--navy);border-bottom:1px solid #f1f5f9';
  const editSvg='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  const yn=function(v){
    return '<span style="color:'+(v==='Yes'?'var(--st-ok-fg)':'var(--gray)')+';font-weight:600">'+v+'</span>';
  };
  return '<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden;font-size:12px">'
    +'<thead><tr><th style="'+thS+'">SR</th><th style="'+thS+'">Type</th><th style="'+thS+'">Yearly</th>'
    +'<th style="'+thS+'">Monthly</th><th style="'+thS+'">CF Limit</th><th style="'+thS+'">Probation</th>'
    +'<th style="'+thS+'">Prorate</th><th style="'+thS+'">Status</th><th style="'+thS+'">Action</th></tr></thead>'
    +'<tbody>'+cslTypes.map(function(t,i){
      return '<tr>'
        +'<td style="'+tdS+';font-weight:600;color:var(--navy)">'+(i+1)+'</td>'
        +'<td style="'+tdS+';font-weight:600">'+attrSafe(t.name)+'</td>'
        +'<td style="'+tdS+'">'+t.yearly+'</td><td style="'+tdS+'">'+t.monthly+'</td>'
        +'<td style="'+tdS+'">'+t.cf+'</td>'
        +'<td style="'+tdS+'">'+yn(t.probation)+'</td>'
        +'<td style="'+tdS+'">'+yn(t.prorate)+'</td>'
        +'<td style="'+tdS+'"><span style="color:var(--st-ok-fg);font-weight:600">'+t.status+'</span></td>'
        +'<td style="'+tdS+'"><button style="background:none;border:none;cursor:pointer;color:var(--navy);padding:2px;line-height:0" title="Edit '+attrSafe(t.name)+'">'+editSvg+'</button></td>'
      +'</tr>';
    }).join('')+'</tbody></table>';
}

// ── VIEW MODE ──
function csLeavesTabHTML(){
  return csLeaveEdit?cslEditHTML():cslViewHTML();
}
function cslViewHTML(){
  const m=csLeave;
  const lv=cslLevels();
  const editBtn='<button class="lp-sb-view-edit-btn" onclick="cslStartEdit()">'
    +CSL_ICO.edit+' Edit</button>';

  let out='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Leave Settings</span>'
    +editBtn+'</div>'
    +'<div class="lp-sb-detail-grid">'
    +cslFc(CSL_ICO.cal,'Leave Period',cslDate(m.periodFrom)+' - '+cslDate(m.periodTo),true)
    +cslFc(CSL_ICO.doc,'Allocation Frequency',attrSafe(m.allocationFrequency))
    +cslFc(CSL_ICO.clock,'Probation Period',m.probationMonths+' Month'+(m.probationMonths===1?'':'s'))
    +cslFc(CSL_ICO.doc,'LOP Allowed',m.lopAllowed?'Yes':'No')
    +'</div>';

  out+=cslSub('Leave Restrictions')
    +'<div class="lp-sb-detail-grid">'
    +cslFc(CSL_ICO.stack,'Maximum Consecutive Leaves',m.maxConsecutive+' Days',true)
    +'</div>'
    +'<p class="csa-hint csa-hint-block">Maximum continuous leave days allowed in a single request.</p>';

  /* The two "count as leave" rows are what the switch governs, so with it off
     they are stated as not applying rather than left showing a Yes nobody is
     acting on. */
  out+=cslSub('Sandwich Rule')
    +'<div class="lp-sb-detail-grid">'
    +cslFc(CSL_ICO.layers,'Sandwich Rule',m.sandwichEnabled?'Enabled':'Disabled')
    +cslFc(CSL_ICO.cal,'Count Weekly Off as Leave',m.sandwichEnabled?attrSafe(m.countWeeklyOff):'—')
    +cslFc(CSL_ICO.cal,'Count Holiday as Leave',m.sandwichEnabled?attrSafe(m.countHoliday):'—',true)
    +'</div>';

  out+=cslSub('Approval Workflow')
    +'<div class="lp-sb-detail-grid">'
    +cslFc(CSL_ICO.check,'Leave Approval Level',attrSafe(m.approvalLevel),true)
    +cslFc(CSL_ICO.user,'Level 1 Approver',lv>=1?attrSafe(m.level1Approver):'—')
    +cslFc(CSL_ICO.user,'Level 2 Approver',lv>=2?attrSafe(m.level2Approver):'—')
    +'</div>';

  out+=cslSub('Leaves List',
      '<button type="button" class="csa-add-btn" onclick="cslAddType()">+ Add Leave Type</button>')
    +cslTableHTML();
  return '<div class="csl-view">'+out+'</div>';
}

// ── EDIT MODE ──
function cslEditHTML(){
  const m=csLeaveDraft;
  const sec=function(title,body){
    return '<div class="lp-sb-edit-section">'
      +'<div class="lp-sb-section-title csa-sec-title">'+title+'</div>'+body
    +'</div>';
  };

  let out='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Edit Leave Settings</span>'
    +'<span class="csa-dirty" id="csl-dirty">Unsaved changes</span></div>';

  out+=sec('Leave Period','<div class="lp-sb-form-grid">'
    +cslGroup('Period From',apCD('csl-from',m.periodFrom,'Start date','cslPickFrom'))
    +cslGroup('Period To',apCD('csl-to',m.periodTo,'End date','cslPickTo'))
    +cslGroup('Allocation Frequency',cslSelect('csl-freq',CSL_FREQ,m.allocationFrequency))
    +cslGroup('Probation Period',cslUnit('csl-prob',m.probationMonths,'months',0,36))
    +cslGroup('Loss of Pay',cslCheck('csl-lop',m.lopAllowed,'LOP allowed'),true)
  +'</div>');

  out+=sec('Leave Restrictions','<div class="lp-sb-form-grid">'
    +cslGroup('Maximum Consecutive Leaves',cslUnit('csl-maxcons',m.maxConsecutive,'days',1,365),true,
      'Maximum continuous leave days allowed in a single request.')
  +'</div>');

  out+=sec('Sandwich Rule','<div class="lp-sb-form-grid">'
    +cslGroup('Sandwich Rule',cslCheck('csl-sandwich',m.sandwichEnabled,'Enable sandwich rule'),true)
    +cslGroup('Count Weekly Off as Leave',cslSelect('csl-cwo',CSL_YESNO,m.countWeeklyOff))
    +cslGroup('Count Holiday as Leave',cslSelect('csl-chol',CSL_YESNO,m.countHoliday))
  +'</div>'
  +'<p class="csa-hint csa-hint-block">With the rule on, days off that fall between two leave days are '
  +'counted against the balance too &mdash; leave on a Friday and the following Monday costs four days, not two.</p>');

  out+=sec('Approval Workflow','<div class="lp-sb-form-grid">'
    +cslGroup('Leave Approval Level',cslSelect('csl-level',CSL_LEVELS,m.approvalLevel),true)
    +cslGroup('Level 1 Approver',cslSelect('csl-l1',CSL_APPROVERS,m.level1Approver))
    +cslGroup('Level 2 Approver',cslSelect('csl-l2',CSL_APPROVERS,m.level2Approver))
  +'</div>');

  out+='<div class="lp-sb-form-actions">'
    +'<button class="ep-cancel-btn" onclick="cslCancelEdit()">Cancel</button>'
    +'<button class="ep-save-btn" onclick="cslSave()">Save Changes</button>'
  +'</div>';
  return '<div class="lp-sb-edit-form csl-form">'+out+'</div>';
}

// ── MODE + PERSISTENCE ──
function cslStartEdit(){
  csLeaveDraft=cslClone(csLeave);
  csLeaveEdit=true;csLeaveDirty=false;
  isbTab('cs',renderCsSidebar);
}
function cslCancelEdit(){
  csLeaveEdit=false;csLeaveDraft=null;
  const wasDirty=csLeaveDirty;csLeaveDirty=false;
  isbTab('cs',renderCsSidebar);
  if(wasDirty)showToast('Changes discarded','info','Leave settings are unchanged.');
}
/* Read the whole form in one pass. The two dates are already in the draft —
   apCD writes them through its onpick hook as they are picked. */
function cslReadForm(){
  const d=csLeaveDraft;
  if(!d)return;
  const val=function(id){const el=document.getElementById(id);return el?el.value:null;};
  const on=function(id){const el=document.getElementById(id);return !!(el&&el.checked);};
  d.allocationFrequency=val('csl-freq')||d.allocationFrequency;
  d.probationMonths=cslInt(val('csl-prob'),d.probationMonths);
  d.lopAllowed=on('csl-lop');
  d.maxConsecutive=Math.max(1,cslInt(val('csl-maxcons'),d.maxConsecutive));
  d.sandwichEnabled=on('csl-sandwich');
  d.countWeeklyOff=val('csl-cwo')||d.countWeeklyOff;
  d.countHoliday=val('csl-chol')||d.countHoliday;
  d.approvalLevel=val('csl-level')||d.approvalLevel;
  d.level1Approver=val('csl-l1')||d.level1Approver;
  d.level2Approver=val('csl-l2')||d.level2Approver;
}
/* Refused before anything is written, and each refusal names the field that
   fixes it. The two-approver test is the one worth having: the same person at
   both levels is a two-level workflow that only ever asks one person, which is
   a one-level workflow that has been made to look stricter than it is. */
function cslSave(){
  cslReadForm();
  const d=csLeaveDraft;
  if(!d.periodFrom||!d.periodTo){showToast('Set both period dates','error','Leave Period');return;}
  if(d.periodFrom>=d.periodTo){showToast('Period end must be after the start','error','Leave Period');return;}
  if(d.maxConsecutive<1){showToast('Maximum consecutive leaves must be at least 1','error','Leave Restrictions');return;}
  const lv=d.approvalLevel==='2 Level Approval'?2:d.approvalLevel==='1 Level Approval'?1:0;
  if(lv===2&&d.level1Approver===d.level2Approver){
    showToast('Both levels have the same approver','error',
      d.level1Approver+' cannot approve a request twice. Pick a different Level 2.');
    return;
  }
  csLeave=cslClone(d);
  csLeaveEdit=false;csLeaveDraft=null;csLeaveDirty=false;
  isbTab('cs',renderCsSidebar);
  const summary=lv===0?'No approval required'
    :lv===1?('One level · '+csLeave.level1Approver)
    :('Two levels · '+csLeave.level1Approver+' then '+csLeave.level2Approver);
  showToast('Leave settings saved','success',
    summary+' · sandwich rule '+(csLeave.sandwichEnabled?'on':'off'));
}
// Prototype stand-in, same as the button has always been — it now says so
// rather than doing nothing at all.
function cslAddType(){
  showToast('Add Leave Type','info','Leave types are managed from the Leave Policies module.');
}
