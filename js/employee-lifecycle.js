/* ══ EMPLOYEE LIFECYCLE: EIGHT MAJOR STATUSES, ONE LOGS TAB, TWO MODULES ═══
   Direct Employee and Global Employee both logged the same two words —
   "Created" and "Updated" — and offered the same two statuses. That is a
   record that something happened and no record of WHAT. An employee record
   actually walks eight major statuses, each owned by a named team:

     1  Onboarding                  Onboarding   HR Team
     2  Documents & Info Submitted  Onboarding   Automatic when saved
     3  Verification Completed      Onboarding   Compliance Team
     4  Onboarding Setup Completed  Onboarding   HR + IT Teams
     5  Active                      Employment   HR / Authorized Admin
     6  Offboarding                 Offboarding  HR Team
     7  Exit Clearance Completed    Offboarding  IT + Compliance + HR
     8  Inactive                    Employment   HR / Authorized Admin

   EMPLOYMENT STATUS IS NOT A SECOND FIELD. emp.status IS the major status —
   all eight of them. "Employment Status = Active" is not a value to mirror
   somewhere else; it is what standing on rung 5 MEANS. Two fields would need
   reconciling on every move and would let a record still in document
   verification call itself Active in the listing, which is the one column HR
   actually reads.

   The panel itself is the SAME Logs tab every other module has — the shared
   .lp-logs-* timeline on the left, lpLogStatusField() + a comment on the
   right, committed through lpCommitLog(). The lifecycle lives in the status
   vocabulary and in the seeded history, not in new furniture. Both employee
   modules render through renderEmpLogsTab(); if you find yourself copying this
   timeline into pages.js, this file has failed. */

/* `short` is the TABLE label. The full status is three and four words where
   the rest of the app's are one, and a pill that wraps to two lines makes its
   row taller than every other row in the listing - the column stops scanning
   as a column. So cells get the short form at a fixed width, and the full name
   stays on everything with room for it: the panel header, the status dropdown,
   the filter, and the cell's own tooltip. */
const EMP_LIFE_STAGES=[
  {status:'Onboarding',                 short:'Onboarding',     owner:'HR Team',              tone:'wait'},
  /* "Automatic when saved" is an owner in the spec, not a team — the employee
     saving their own details is what moves this one, so the entry is stamped
     System rather than pinned on whoever happened to be looking. */
  {status:'Documents & Info Submitted', short:'Docs Submitted', owner:'System',               tone:'info'},
  {status:'Verification Completed',     short:'Verified',       owner:'Compliance Team',      tone:'info'},
  {status:'Onboarding Setup Completed', short:'Setup Complete', owner:'HR + IT Teams',        tone:'info'},
  {status:'Active',                     short:'Active',         owner:'HR / Authorized Admin',tone:'ok'},
  {status:'Offboarding',                short:'Offboarding',    owner:'HR Team',              tone:'wait'},
  {status:'Exit Clearance Completed',   short:'Exit Cleared',   owner:'IT + Compliance + HR', tone:'wait'},
  {status:'Inactive',                   short:'Inactive',       owner:'HR / Authorized Admin',tone:'bad'}
];

/* One tone map for the whole app, so a lifecycle status reads the same in a
   log dot, a table badge and a detail panel. statusClass() is the same slugger
   the badges use, so 'Documents & Info Submitted' lands on
   .documents-info-submitted without a second naming scheme. */
EMP_LIFE_STAGES.forEach(function(s){SB_STATUS_TONE[statusClass(s.status)]=s.tone;});

/* The status dropdown and both listing filters read this. Offering only
   Active/Inactive cannot find a record stuck in verification, which is the
   search HR actually runs. */
const EMP_LIFE_STATUSES=EMP_LIFE_STAGES.map(function(s){return s.status;});

function empLifeStage(status){
  for(var i=0;i<EMP_LIFE_STAGES.length;i++)if(EMP_LIFE_STAGES[i].status===status)return EMP_LIFE_STAGES[i];
  return null;
}
/* Falls through to statusTone() so a record carrying some older status still
   gets a sensible colour rather than a missing class. */
function empLifeTone(status){var s=empLifeStage(status);return s?s.tone:statusTone(status);}

/* The status cell for both employee listings - a plain .lp-status-badge, the
   same pill at the same size as every other listing in the app. The short
   label is what makes that possible; the full status rides on the title, for
   the reader who needs to check exactly which "Completed" this is. */
function empLifeBadge(status){
  var st=empLifeStage(status),label=st?st.short:status;
  var full=String(status).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  return '<span class="lp-status-badge tone-'+empLifeTone(status)+'"'
    +(label===status?'':' title="'+full+'"')+'>'+label+'</span>';
}

/* ── Panel plumbing ────────────────────────────────────────────────────────
   'de' and 'ge' are the two employee modules. Everything below takes that
   prefix and nothing else, which is the whole reason one renderer serves both
   panels. A third employee module would add one line here, not a second copy
   of the timeline. */
const EMP_LIFE_SCOPES={
  de:{list:function(){return directEmpData;},sel:function(){return deSelectedId;}},
  ge:{list:function(){return globalEmpData;},sel:function(){return geSelectedId;}}
};
function empLifeRec(kind){
  var s=EMP_LIFE_SCOPES[kind];if(!s)return null;
  var id=s.sel();
  return s.list().find(function(e){return e.id===id;})||null;
}

function empCancelLog(kind){
  var sel=document.getElementById(kind+'-log-status-sel');if(sel)sel.value='';
  var inp=document.getElementById(kind+'-log-comment-inp');if(inp)inp.value='';
}
function empSaveLog(kind){
  var emp=empLifeRec(kind);if(!emp)return;
  var was=emp.status;
  if(!lpCommitLog(emp,kind+'-log-status-sel',kind+'-log-comment-inp',EMP_LIFE_SEED[kind][emp.id]))return;
  renderADTPage();      // the listing row carries the status badge too
  showToast('Log added','success',emp.status!==was
    ?emp.name+' moved to '+emp.status+'.'
    :'Comment saved to '+emp.name+'.');
}

/* ── The Logs tab ──────────────────────────────────────────────────────────
   Deliberately the same shape as the Compliance, Rates & Rules, Payheads and
   Holidays logs tabs: timeline left, status + comment right, Cancel/Submit. */
function renderEmpLogsTab(kind,emp,fixture){
  const logs=seedLogs(emp,fixture||[]);
  const personSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const calSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const clkSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const timelineHTML=logs.length
    ?'<div class="lp-logs-timeline">'+logs.map((l,i,_all)=>{
      const sk=empLifeTone(l.status);
      return '<div class="lp-log-row">'
        +'<div class="lp-log-avatar-col"><div class="lp-log-avatar lp-log-avatar--'+logDotKey(_all,i,sk)+'">'+personSvg+'</div>'+(i<logs.length-1?'<div class="lp-log-connector"></div>':'')+'</div>'
        +'<div class="lp-log-card">'
        +logHeadRow(_all,i,sk,l.status)
        +'<div class="lp-log-meta-row"><span class="lp-log-meta-item">'+personSvg+'<span>'+l.user+'</span></span><span class="lp-log-meta-item">'+calSvg+'<span>'+l.date+'</span></span><span class="lp-log-meta-item">'+clkSvg+'<span>'+l.time+'</span></span></div>'
        +'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Comment:</span>'+l.action+'</div>'
        +'</div></div>';
    }).join('')+'</div>'
    :'<div class="lp-logs-empty">No activity logs yet.</div>';
  const formHTML='<div class="lp-logs-form">'
    +'<div class="lp-logs-form-header"><span class="lp-log-dot lp-log-dot--'+empLifeTone(emp.status)+'"></span>'+emp.status+'</div>'
    +'<p class="lp-logs-form-sub">Update employee status and add a comment</p>'
    +lpLogStatusField(kind+'-log-status-sel',emp.status,EMP_LIFE_STATUSES)
    +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
    +'<textarea class="lp-logs-form-textarea" id="'+kind+'-log-comment-inp" placeholder="Enter comment"></textarea>'
    +'<div style="display:flex;gap:10px;margin-top:12px">'
    +'<button class="ep-cancel-btn" style="flex:1" onclick="empCancelLog(\''+kind+'\')">Cancel</button>'
    +'<button class="lp-logs-save-btn" style="flex:1" onclick="empSaveLog(\''+kind+'\')">Submit</button>'
    +'</div></div>';
  return '<div class="lp-logs-wrap">'+timelineHTML+formHTML+'</div>';
}

/* ── Seeded histories ──────────────────────────────────────────────────────
   Newest first, like every other fixture in the app. The owning team is the
   entry's user — that is the Owner column, carried without any extra chrome —
   and the sub-activities that cleared under each status are named in the
   comment, which is where a log says what happened. */
function empLog(status,date,time,action,user){
  var st=empLifeStage(status);
  return {date:date,time:time,user:user||(st?st.owner:'Admin'),status:status,action:action};
}

const EMP_LIFE_SEED={
  de:{
    1:[
      empLog('Active','10 Jun 2025','03:30:00 PM','Job title updated to Software Engineer.','Admin'),
      empLog('Active','15 Jan 2025','09:00:00 AM','Final onboarding readiness check cleared on the date of joining. Employment Status set to Active.'),
      empLog('Onboarding Setup Completed','14 Jan 2025','04:20:00 PM','Payroll setup, leave-holiday setup, asset allocation and IT access setup all completed.'),
      empLog('Verification Completed','13 Jan 2025','11:10:00 AM','Document verification checklist cleared. Address proof was rejected once and re-submitted inside verification.'),
      empLog('Documents & Info Submitted','11 Jan 2025','06:05:00 PM','Mandatory information complete and mandatory documents uploaded by the employee.'),
      empLog('Onboarding','08 Jan 2025','09:30:00 AM','Onboarding initiated. Date of Joining set to 15 Jan 2025.')
    ],
    2:[
      empLog('Active','01 Jun 2025','02:00:00 PM','Department changed to HR.','Pallavi P.'),
      empLog('Active','20 Mar 2024','10:15:00 AM','Final onboarding readiness check cleared. Employment Status set to Active.'),
      empLog('Onboarding Setup Completed','19 Mar 2024','05:40:00 PM','Payroll setup, leave-holiday setup, asset allocation and HRMS access all completed.'),
      empLog('Verification Completed','18 Mar 2024','12:20:00 PM','Document verification checklist cleared on the first pass. No documents rejected.'),
      empLog('Documents & Info Submitted','15 Mar 2024','07:15:00 PM','Mandatory information complete and mandatory documents uploaded by the employee.'),
      empLog('Onboarding','12 Mar 2024','10:00:00 AM','Onboarding initiated. Date of Joining set to 20 Mar 2024.')
    ],
    3:[
      empLog('Active','05 Jun 2024','11:30:00 AM','Final onboarding readiness check cleared. Fixed-term contract signed. Employment Status set to Active.'),
      empLog('Onboarding Setup Completed','04 Jun 2024','06:00:00 PM','Contract payroll head, holiday calendar, asset allocation and IT access setup all completed.'),
      empLog('Verification Completed','03 Jun 2024','10:45:00 AM','Document verification checklist cleared on the first pass.'),
      empLog('Documents & Info Submitted','31 May 2024','08:20:00 PM','Mandatory information complete and mandatory documents uploaded by the employee.'),
      empLog('Onboarding','28 May 2024','09:15:00 AM','Onboarding initiated for a fixed-term engagement. Date of Joining set to 05 Jun 2024.')
    ],
    4:[
      empLog('Inactive','12 Feb 2025','02:00:00 PM','Final offboarding readiness check cleared. Employment Status set to Inactive.'),
      empLog('Exit Clearance Completed','11 Feb 2025','04:30:00 PM','KT/handover signed off, assets recovered, IT access revoked, compliance cleared and F&F settled.'),
      empLog('Offboarding','05 Feb 2025','10:00:00 AM','Separation details recorded. LWD 11 Feb 2025; revocation effective 11 Feb 2025, 06:00 PM.'),
      empLog('Active','01 Feb 2024','09:00:00 AM','Final onboarding readiness check cleared. Employment Status set to Active. Role: Product Manager.'),
      empLog('Onboarding Setup Completed','31 Jan 2024','05:10:00 PM','Payroll setup, leave-holiday setup, asset allocation and IT access setup all completed.'),
      empLog('Verification Completed','30 Jan 2024','11:00:00 AM','Document verification checklist cleared on the first pass.'),
      empLog('Documents & Info Submitted','28 Jan 2024','04:45:00 PM','Mandatory information complete and mandatory documents uploaded by the employee.'),
      empLog('Onboarding','25 Jan 2024','09:30:00 AM','Onboarding initiated. Date of Joining set to 01 Feb 2024.')
    ],
    /* Two records parked mid-ladder. Without them every employee in the app
       sits at a terminal rung and the six statuses between Onboarding and
       Active are never seen on a real row. */
    5:[
      empLog('Onboarding Setup Completed','31 Aug 2026','10:20:00 AM','Payroll setup and leave-holiday setup done. Asset allocation and IT access setup still open — laptop on order.'),
      empLog('Verification Completed','29 Aug 2026','03:05:00 PM','Document verification checklist cleared on the first pass.'),
      empLog('Documents & Info Submitted','27 Aug 2026','08:10:00 PM','Mandatory information complete and mandatory documents uploaded by the employee.'),
      empLog('Onboarding','25 Aug 2026','09:40:00 AM','Onboarding initiated. Date of Joining set to 10 Sep 2026.')
    ],
    6:[
      empLog('Onboarding','02 Sep 2026','09:15:00 AM','Onboarding initiated and invitation sent. Date of Joining set to 15 Sep 2026.')
    ]
  },
  ge:{
    1:[
      empLog('Active','14 May 2025','11:00:00 AM','Job title updated to Senior Developer.','Admin'),
      empLog('Active','10 Feb 2024','09:00:00 AM','Final onboarding readiness check cleared. Germany entity payroll activated. Employment Status set to Active.'),
      empLog('Onboarding Setup Completed','09 Feb 2024','03:30:00 PM','German payroll head, statutory leave calendar, asset allocation and IT access setup all completed.'),
      empLog('Verification Completed','07 Feb 2024','01:15:00 PM','Document verification checklist cleared. Work permit was rejected once and re-submitted inside verification.'),
      empLog('Documents & Info Submitted','05 Feb 2024','06:45:00 PM','Mandatory information complete and mandatory documents uploaded by the employee.'),
      empLog('Onboarding','01 Feb 2024','10:20:00 AM','EOR onboarding initiated via Dhi. Date of Joining set to 10 Feb 2024.')
    ],
    2:[
      empLog('Active','15 Apr 2024','10:30:00 AM','Final onboarding readiness check cleared. France entity payroll activated. Employment Status set to Active.'),
      empLog('Onboarding Setup Completed','12 Apr 2024','05:00:00 PM','French payroll head, leave calendar, asset allocation and IT access setup all completed.'),
      empLog('Verification Completed','10 Apr 2024','11:40:00 AM','Document verification checklist cleared for the France entity.'),
      empLog('Documents & Info Submitted','08 Apr 2024','07:30:00 PM','Mandatory information complete and mandatory documents uploaded by the employee.'),
      empLog('Onboarding','04 Apr 2024','09:45:00 AM','EOR onboarding initiated. Date of Joining set to 15 Apr 2024.')
    ],
    3:[
      empLog('Active','20 Nov 2024','02:15:00 PM','Contractor agreement renewed for 12 months.','HR'),
      empLog('Active','01 Mar 2024','09:00:00 AM','Final onboarding readiness check cleared. Contractor agreement signed. Employment Status set to Active.'),
      empLog('Onboarding Setup Completed','29 Feb 2024','04:10:00 PM','Contractor payment schedule, holiday calendar, asset allocation and IT access setup all completed.'),
      empLog('Verification Completed','27 Feb 2024','10:50:00 AM','Contractor documentation verified for the Italy entity.'),
      empLog('Documents & Info Submitted','24 Feb 2024','06:20:00 PM','Mandatory information complete and mandatory documents uploaded by the contractor.'),
      empLog('Onboarding','20 Feb 2024','09:10:00 AM','Contractor onboarding initiated. Start date set to 01 Mar 2024.')
    ],
    4:[
      empLog('Inactive','05 Jan 2025','03:00:00 PM','Final offboarding readiness check cleared. Employment Status set to Inactive.'),
      empLog('Exit Clearance Completed','03 Jan 2025','05:20:00 PM','KT/handover completed, assets recovered, UK entity access revoked, compliance cleared and F&F settled.'),
      empLog('Offboarding','20 Dec 2024','10:00:00 AM','Contract end confirmed. LWD 02 Jan 2025; revocation effective 02 Jan 2025, 06:00 PM.'),
      empLog('Active','01 Feb 2024','09:00:00 AM','Final onboarding readiness check cleared. UK entity payroll activated. Employment Status set to Active.'),
      empLog('Onboarding Setup Completed','31 Jan 2024','04:00:00 PM','UK payroll head, leave calendar, asset allocation and IT access setup all completed.'),
      empLog('Verification Completed','29 Jan 2024','12:30:00 PM','Right-to-work and document verification checklist cleared for the UK entity.'),
      empLog('Documents & Info Submitted','26 Jan 2024','07:00:00 PM','Mandatory information complete and mandatory documents uploaded by the employee.'),
      empLog('Onboarding','22 Jan 2024','09:20:00 AM','EOR onboarding initiated. Date of Joining set to 01 Feb 2024.')
    ],
    5:[
      empLog('Documents & Info Submitted','01 Sep 2026','07:40:00 PM','Mandatory information complete. Codice Fiscale document still outstanding, so verification has not started.'),
      empLog('Onboarding','28 Aug 2026','10:05:00 AM','EOR onboarding initiated for the Italy entity. Date of Joining set to 21 Sep 2026.')
    ],
    6:[
      empLog('Verification Completed','01 Sep 2026','12:35:00 PM','Document verification checklist cleared on the first pass. Onboarding Setup is now available.'),
      empLog('Documents & Info Submitted','30 Aug 2026','05:50:00 PM','Mandatory information complete and mandatory documents uploaded by the employee.'),
      empLog('Onboarding','26 Aug 2026','09:25:00 AM','EOR onboarding initiated for the Portugal entity. Date of Joining set to 14 Sep 2026.')
    ]
  }
};
