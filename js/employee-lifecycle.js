/* ══ EMPLOYEE LIFECYCLE: ELEVEN MAJOR STATUSES, ONE LOGS TAB, TWO MODULES ══
   Direct Employee and Global Employee both logged the same two words —
   "Created" and "Updated" — and offered the same two statuses. That is a
   record that something happened and no record of WHAT. An employee record
   actually walks eleven major statuses, each owned by a named team:

      1  Pending                     Onboarding   HR Team
      2  Onboarding                  Onboarding   HR Team
      3  Documents & Info Submitted  Onboarding   Automatic when saved
      4  Verification Completed      Onboarding   Compliance Team
         └ Verification Failed       Onboarding   Compliance Team   (branch)
      5  Onboarding Setup            Onboarding   HR + IT Teams
      6  Onboarding Setup Completed  Onboarding   HR + IT Teams
      7  Active                      Employment   HR / Authorized Admin
      8  Offboarding                 Offboarding  HR Team
      9  Exit Clearance              Offboarding  IT + Compliance + HR
     10  Exit Clearance Completed    Offboarding  IT + Compliance + HR
     11  Inactive                    Employment   HR / Authorized Admin

   EMPLOYMENT STATUS IS NOT A SECOND FIELD. emp.status IS the major status —
   all eleven of them. "Employment Status = Active" is not a value to mirror
   somewhere else; it is what standing on rung 7 MEANS. Two fields would need
   reconciling on every move and would let a record still in document
   verification call itself Active in the listing, which is the one column HR
   actually reads.

   The panel itself is the SAME Logs tab every other module has — the shared
   .lp-logs-* timeline on the left, lpLogStatusField() + a comment on the
   right, committed through lpCommitLog(). The one addition is the block that
   appears under the status dropdown asking for whatever THAT status actually
   needs before the record may move on: a tick-list, some fields, or — for
   seven of the eleven — nothing at all. Both employee modules render through
   renderEmpLogsTab(); if you find yourself copying this timeline into
   pages.js, this file has failed. */

/* ── The mandatory document set ────────────────────────────────────────────
   The list Compliance ticks against at Verification Failed: which documents
   came back. One list, so "which documents" cannot drift between the screens
   that talk about it. */
const EMP_LIFE_DOCS=['Identity Proof','Address Proof','Educational Certificate',
                     'Previous Employment Letter','Bank Account Proof'];
/* The spec's rejection reasons, verbatim and in its order. */
const EMP_DOC_REJECT_REASONS=['Incorrect / Invalid Document','Illegible / Unreadable','Expired Document',
                              'Information Mismatch','Incomplete / Missing Pages','Incorrect Document Type','Other'];
/* The spec's separation types, verbatim and in its order. */
const EMP_SEPARATION_TYPES=['Voluntary','Involuntary','Contract End','Retirement','Other'];

/* What is currently outstanding, written by the last Verification Failed entry
   and cleared by the next Verification Completed. It is derived from the log,
   not a second store to keep in step with it. */
function empDocsRejected(emp){return emp.failedDocs||[];}

/* ── The eleven statuses, plus the rejection branch ────────────────────────
   The ladder, in order:

     Pending -> Onboarding -> Documents & Info Submitted
             -> Verification Failed / Verification Completed
             -> Onboarding Setup -> Onboarding Setup Completed
             -> Active -> Offboarding
             -> Exit Clearance -> Exit Clearance Completed -> Inactive

   THE "...ED" STATUSES ARE NOT DUPLICATES OF THE ONES BEFORE THEM. Onboarding
   Setup is the state of doing the setup; Onboarding Setup Completed is the
   state of having finished it, and it is where the checklist is answered. Same
   pair at the exit: Exit Clearance, then Exit Clearance Completed. Both are
   single-user checklist steps - one person works the list and ticks it - not
   multi-team sign-offs, so there is one checklist and no per-item owner.

   `input` is what the log form asks for BEFORE the record may move on, and it
   is empty for most of them. Reading the spec's field table literally, only
   four statuses ask for anything at all:

     Verification Failed         which documents failed  + why  (checklist + select)
     Onboarding Setup Completed  four setup items               (checklist)
     Offboarding                 separation type, LWD, revocation date/time (fields)
     Exit Clearance Completed    five clearance items           (checklist)

   Every other status is a comment and nothing else. That restraint is the
   point: an earlier pass gave all of them something to fill in - uploads,
   per-document verdicts, readiness sign-offs - which turned "say what
   happened" into a form to get through, and asked people to tick a box
   asserting work the log had no way to check. */
const EMP_LIFE_STAGES=[
  {status:'Pending',short:'Pending',owner:'HR Team',type:'Onboarding',tone:'wait',
   next:'Onboarding',behaviour:'Record created; onboarding has not started yet'},

  {status:'Onboarding',short:'Onboarding',owner:'HR Team',type:'Onboarding',tone:'wait',
   next:'Documents & Info Submitted',behaviour:'Employee completes information / documents'},

  /* "Automatic when saved" is an owner in the spec, not a team - the employee
     saving their own details is what moves this one, so it is stamped System. */
  {status:'Documents & Info Submitted',short:'Docs Submitted',owner:'System',type:'Onboarding',tone:'info',
   next:'Verification Completed',behaviour:'Compliance verification begins'},

  /* The branch, not a rung. Rejection is handled inside verification, so this
     does not knock the record back to Documents & Info Submitted and lose the
     documents that were fine - it holds the record while the failed ones come
     back. Which failed is a tick-list; WHY is one reason for the batch, which
     is what the spec asks for: one dropdown, not one per document. */
  {status:'Verification Failed',short:'Verify Failed',owner:'Compliance Team',type:'Onboarding',tone:'bad',
   branch:true,next:'Verification Completed',behaviour:'Failed documents are re-submitted and verified again',
   input:{
     checklist:{role:'failed',min:1,label:'Failed / rejected document(s)',
       items:EMP_LIFE_DOCS.map(function(n){return {label:n};})},
     fields:[{k:'why',label:'Rejection Reason',type:'select',req:true,opts:EMP_DOC_REJECT_REASONS}]}},

  {status:'Verification Completed',short:'Verified',owner:'Compliance Team',type:'Onboarding',tone:'info',
   next:'Onboarding Setup',behaviour:'Onboarding Setup becomes available'},

  {status:'Onboarding Setup',short:'Setup',owner:'HR + IT Teams',type:'Onboarding',tone:'wait',
   next:'Onboarding Setup Completed',behaviour:'Payroll, leave, asset and IT access setup is carried out'},

  {status:'Onboarding Setup Completed',short:'Setup Complete',owner:'HR + IT Teams',type:'Onboarding',tone:'info',
   next:'Active',behaviour:'Active becomes available once every item is ticked',
   input:{checklist:{label:'Onboarding setup checklist',items:[
     {label:'Payroll Setup Done',mandatory:true},
     {label:'Leave / Holiday Setup Done',mandatory:true},
     {label:'Asset Allocation Done',mandatory:true},
     {label:'IT Access Setup Done',mandatory:true}
   ]}}},

  {status:'Active',short:'Active',owner:'HR / Authorized Admin',type:'Employment',tone:'ok',
   next:'Offboarding',behaviour:'Employment Status = Active'},

  {status:'Offboarding',short:'Offboarding',owner:'HR Team',type:'Offboarding',tone:'wait',
   next:'Exit Clearance',behaviour:'Exit Clearance becomes available',
   input:{fields:[
     {k:'septype',label:'Separation Type',type:'select',req:true,opts:EMP_SEPARATION_TYPES},
     {k:'lwd',label:'Last Working Date',type:'date',req:true},
     {k:'revoke',label:'Access Revocation Effective Date/Time',type:'datetime',req:true}
   ]}},

  {status:'Exit Clearance',short:'Exit Clearance',owner:'IT + Compliance + HR',type:'Offboarding',tone:'wait',
   next:'Exit Clearance Completed',behaviour:'KT, assets, access, compliance and F&F are worked through'},

  {status:'Exit Clearance Completed',short:'Exit Cleared',owner:'IT + Compliance + HR',type:'Offboarding',tone:'wait',
   next:'Inactive',behaviour:'Inactive becomes available once every item is ticked',
   input:{checklist:{label:'Exit clearance checklist',items:[
     {label:'KT / Handover Done',mandatory:true},
     {label:'Asset Recovery Done',mandatory:true},
     {label:'IT Access Revocation Done',mandatory:true},
     {label:'Compliance Clearance Done',mandatory:true},
     {label:'F&F Settlement Done',mandatory:true}
   ]}}},

  {status:'Inactive',short:'Inactive',owner:'HR / Authorized Admin',type:'Employment',tone:'bad',
   next:'',behaviour:'Employment Status = Inactive'}
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
function empLifeHtml(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
/* Every control inside a status block is addressed by kind + status + key, so
   nine blocks can sit in the DOM at once without colliding. */
function empFid(kind,status,k){return kind+'-f-'+statusClass(status)+'-'+k;}
function empBlock(kind){return document.querySelector('#'+kind+'-isb-inner .emp-log-input:not([hidden])');}

/* ── The per-status input block ────────────────────────────────────────────
   Every status's block is rendered up front and all but one is `hidden`;
   changing the dropdown just swaps which is shown. Re-rendering on change
   would throw away a comment already being typed, and this way anything
   entered before changing your mind is still there if you change back.

   Only the VISIBLE block is ever read, by empLogCollect(). */
const EMP_LOG_ICONS={
  tick:'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4"><polyline points="20 6 9 17 4 12"/></svg>',
  warn:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16.5" x2="12" y2="16.6"/></svg>'
};

/* Every status's block is in the DOM at once and all but one is hidden, so the
   dropdown swaps them without a re-render and anything typed before changing
   your mind is still there if you change back.

   THE BLOCK IS NOT A PANEL OF ITS OWN. It used to be a grey sub-card with the
   status repeated as a heading, the owning team as a chip and a footnote
   saying what the move unlocks - three pieces of chrome no other module's log
   form has. What is left is plain fields sitting in the form between Status
   and Comment, wearing the same .lp-logs-form-label as the two controls they
   sit between, so the panel reads as one form rather than a form with a
   different product embedded in the middle of it. */
function empLogInputs(kind,emp,current){
  return '<div class="emp-log-input-wrap">'+EMP_LIFE_STAGES.map(function(s){
    return '<div class="emp-log-input" data-status="'+empLifeHtml(s.status)+'"'
      +(s.status===current?'':' hidden')+'>'
      +empLogInputBody(kind,emp,s)
      +'</div>';
  }).join('')+'</div>';
}

/* A status asks for a checklist, some fields, both, or - for seven of the
   eleven - neither, and then the form is Status and Comment and nothing in
   between, exactly like Teams or Leave Policies. */
function empLogInputBody(kind,emp,s){
  var inp=s.input;
  if(!inp)return '';
  return (inp.checklist?empLogChecklist(kind,s,inp.checklist):'')
        +(inp.fields?empLogFields(kind,s,inp.fields):'');
}

/* The tick-lists. Two shapes share this:

   role 'done' (the default) - Onboarding Setup Completed and Exit Clearance
   Completed. Every item is mandatory, and the ticks are the evidence the
   status was actually reached, so they are read back into the entry.

   role 'failed' - Verification Failed. The ticks are not work completed, they
   are which documents came back, so at least ONE has to be ticked and none is
   mandatory on its own. They are recorded as the outstanding set, not as
   "Recorded: Identity Proof", which would read as an achievement. */
function empLogChecklist(kind,s,c){
  var role=c.role||'done';
  /* .lp-logs-form-label / -req, the SAME heading the Status and Comment
     controls above and below wear - not a label class of this module's own. */
  return '<div class="lp-logs-form-label">'+empLifeHtml(c.label)
      +' <span class="lp-logs-form-req">*</span></div>'
    +'<div class="emp-log-list" data-role="'+role+'" data-min="'+(c.min||0)+'"'
    +' data-list-label="'+empLifeHtml(c.label)+'">'
    +c.items.map(function(i){
      return '<label class="emp-log-check">'
        +'<input type="checkbox" data-label="'+empLifeHtml(i.label)+'"'+(i.mandatory?' data-req="1"':'')+'>'
        +'<span class="emp-log-box">'+EMP_LOG_ICONS.tick+'</span>'
        +'<span>'+empLifeHtml(i.label)+'</span></label>';
    }).join('')+'</div>';
}

/* Values someone types or picks. apCS and apCD, so the controls match the rest
   of the app rather than being raw browser widgets in a panel - with one
   exception: 'datetime' pairs apCD with a native <input type="time">, which is
   the same pairing the attendance screens already use for a clock time. */
function empLogFields(kind,s,items){
  return '<div class="emp-log-fields">'+items.map(function(f){
    var id=empFid(kind,s.status,f.k);
    var ctl;
    if(f.type==='date')ctl=apCD(id,'','Select date');
    else if(f.type==='datetime')ctl='<div class="emp-log-dt">'+apCD(id,'','Select date')
      +'<input class="emp-log-text emp-log-time" id="'+id+'-t" type="time"></div>';
    else if(f.type==='select')ctl=apCS(id,f.opts,'','Select');
    else if(f.type==='textarea')ctl='<textarea class="emp-log-textarea" id="'+id+'" data-label="'+empLifeHtml(f.label)+'" placeholder="'+empLifeHtml(f.ph||'')+'"></textarea>';
    else ctl='<input class="emp-log-text" id="'+id+'" type="text" data-label="'+empLifeHtml(f.label)+'" placeholder="'+empLifeHtml(f.ph||'')+'">';
    return '<div class="emp-log-field" data-fk="'+f.k+'" data-ftype="'+f.type+'" data-fid="'+id+'"'
      +' data-label="'+empLifeHtml(f.label)+'"'+(f.req?' data-req="1"':'')+'>'
      +'<div class="lp-logs-form-label">'+empLifeHtml(f.label)
      +(f.req?' <span class="lp-logs-form-req">*</span>':'')+'</div>'+ctl+'</div>';
  }).join('')+'</div>';
}

/* Native <input type="time"> speaks 24h; this panel prints a clock time the
   way the rest of the app does. */
function empTime12(t){
  var m=/^(\d{1,2}):(\d{2})$/.exec(String(t||'').trim());
  if(!m)return '';
  var h=+m[1],ap=h>=12?'PM':'AM';
  return (h%12||12)+':'+m[2]+' '+ap;
}

/* Called by the status dropdown's onchange. Every status's block is in the DOM
   at once and all but one is hidden, so switching back to a status you had
   started filling in still has what you entered. */
function empLogSwapInput(kind,status){
  var wrap=document.querySelector('#'+kind+'-isb-inner .emp-log-input-wrap');
  if(!wrap)return;
  wrap.querySelectorAll('.emp-log-input').forEach(function(b){
    b.hidden=b.getAttribute('data-status')!==status;
  });
}

/* ── Reading the visible block ─────────────────────────────────────────────
   Returns what was entered, and what is still missing. `missing` is the gate:
   a status whose mandatory work is not done has not actually been reached, so
   the entry is refused rather than written with holes in it. */
function empLogCollect(kind,emp,status){
  var out={details:[],failed:[],reason:'',missing:[]};
  var block=empBlock(kind);
  var s=empLifeStage(status);
  if(!block||!s)return out;

  block.querySelectorAll('.emp-log-list').forEach(function(list){
    var role=list.getAttribute('data-role')||'done';
    var min=+list.getAttribute('data-min')||0;
    var ticked=0;
    list.querySelectorAll('input[type=checkbox]').forEach(function(i){
      var label=i.getAttribute('data-label');
      if(i.checked){
        ticked++;
        /* A 'failed' tick is not an achievement - it names a document that
           came back. It goes to the outstanding set, not to "Recorded:". */
        if(role==='failed')out.failed.push(label);
        else out.details.push({label:label,value:'Done'});
      }else if(i.getAttribute('data-req'))out.missing.push(label);
    });
    if(min&&ticked<min)out.missing.push(list.getAttribute('data-list-label')||'At least one item');
  });

  block.querySelectorAll('.emp-log-field').forEach(function(f){
    var id=f.getAttribute('data-fid'),type=f.getAttribute('data-ftype'),label=f.getAttribute('data-label');
    var v='';
    if(type==='date'){var h=document.getElementById(id);v=h&&h.value?cdLabel(h.value):'';}
    else if(type==='datetime'){
      var hd=document.getElementById(id),ht=document.getElementById(id+'-t');
      var d=hd&&hd.value?cdLabel(hd.value):'',t=ht?empTime12(ht.value):'';
      /* Both halves or neither - a revocation date with no time is not an
         effective date/time, it is half of one. */
      v=(d&&t)?d+', '+t:'';
    }
    else if(type==='select')v=getCSValue(id);
    else{var el=document.getElementById(id);v=el?el.value.trim():'';}
    if(v)out.details.push({label:label,value:v});
    else if(f.getAttribute('data-req'))out.missing.push(label);
    if(f.getAttribute('data-fk')==='why')out.reason=v;
  });

  return out;
}

function empCancelLog(kind){
  var sel=document.getElementById(kind+'-log-status-sel');if(sel)sel.value='';
  var inp=document.getElementById(kind+'-log-comment-inp');if(inp)inp.value='';
  /* Setting .value in code does not fire onchange, so the block has to be
     cleared by hand — otherwise Cancel leaves "Select Status" sitting above a
     half-filled form for a status nobody has chosen. */
  document.querySelectorAll('#'+kind+'-isb-inner .emp-log-input input[type=checkbox]')
    .forEach(function(i){i.checked=false;});
  empLogSwapInput(kind,'');
}

function empSaveLog(kind){
  var emp=empLifeRec(kind);if(!emp)return;
  var sel=document.getElementById(kind+'-log-status-sel');
  var picked=sel?sel.value:'';
  var was=emp.status;
  var got=picked?empLogCollect(kind,emp,picked):{missing:[],details:[],failed:[],reason:''};

  /* The spec's gate, checked BEFORE the entry is written: a status whose
     mandatory work is not done has not actually been reached. */
  if(picked&&got.missing.length){
    showToast('Not complete yet','error',got.missing.length+' item'+(got.missing.length===1?'':'s')
      +' outstanding — first: '+got.missing[0]+'.');
    return;
  }
  if(!lpCommitLog(emp,kind+'-log-status-sel',kind+'-log-comment-inp',EMP_LIFE_SEED[kind][emp.id]))return;

  /* lpCommitLog writes the five fields every module shares and moves the
     record onto the status that was picked. Everything below is what THIS
     module adds to that entry. */
  var entry=emp.logs[0];
  if(got.details.length)entry.details=got.details;

  /* The outstanding set is the log's, not a second store: the last
     Verification Failed entry writes it, Verification Completed clears it. */
  if(got.failed.length){
    entry.rejected=got.failed.map(function(n){return {name:n,reason:got.reason};});
    emp.failedDocs=entry.rejected;
  }
  if(emp.status==='Verification Completed')emp.failedDocs=[];

  renderADTPage();      // the listing row carries the status badge too
  showToast(got.failed.length?'Verification failed':'Log added',
    got.failed.length?'error':'success',
    got.failed.length
      ?got.failed.length+' document'+(got.failed.length===1?'':'s')+' sent back to '+emp.name+' for re-submission.'
      :(emp.status!==was?emp.name+' moved to '+emp.status+'.':'Comment saved to '+emp.name+'.'));
}

/* ── The Logs tab ──────────────────────────────────────────────────────────
   Deliberately the same shape as the Compliance, Rates & Rules, Payheads and
   Holidays logs tabs: timeline left, status + comment right, Cancel/Submit.
   The addition is the block under the status dropdown that asks for whatever
   that particular status actually needs. */
function renderEmpLogsTab(kind,emp,fixture){
  const logs=seedLogs(emp,fixture||[]);
  const personSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const calSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const clkSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const timelineHTML=logs.length
    ?'<div class="lp-logs-timeline">'+logs.map(function(l,i,_all){
      const sk=empLifeTone(l.status);
      return '<div class="lp-log-row">'
        +'<div class="lp-log-avatar-col"><div class="lp-log-avatar lp-log-avatar--'+logDotKey(_all,i,sk)+'">'+personSvg+'</div>'+(i<logs.length-1?'<div class="lp-log-connector"></div>':'')+'</div>'
        +'<div class="lp-log-card">'
        +logHeadRow(_all,i,sk,l.status)
        +'<div class="lp-log-meta-row"><span class="lp-log-meta-item">'+personSvg+'<span>'+l.user+'</span></span><span class="lp-log-meta-item">'+calSvg+'<span>'+l.date+'</span></span><span class="lp-log-meta-item">'+clkSvg+'<span>'+l.time+'</span></span></div>'
        +'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Comment:</span>'+l.action+'</div>'
        /* What the form actually captured, in the same row shape as the
           comment so an entry reads as one card and not two. */
        +(l.details&&l.details.length
          ?'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Recorded:</span>'
            +l.details.map(function(d){return empLifeHtml(d.label)+(d.value==='Done'?'':': '+empLifeHtml(d.value));}).join(' · ')
            +'</div>':'')
        +(l.rejected&&l.rejected.length
          ?'<div class="lp-log-comment-row is-bad"><span class="lp-log-comment-label">To re-submit:</span>'
            +l.rejected.map(function(d){return empLifeHtml(d.name)+(d.reason?' ('+empLifeHtml(d.reason)+')':'');}).join(' · ')
            +'</div>':'')
        +'</div></div>';
    }).join('')+'</div>'
    :'<div class="lp-logs-empty">No activity logs yet.</div>';

  const bad=empDocsRejected(emp);
  const formHTML='<div class="lp-logs-form">'
    +'<div class="lp-logs-form-header"><span class="lp-log-dot lp-log-dot--'+empLifeTone(emp.status)+'"></span>'+emp.status+'</div>'
    +'<p class="lp-logs-form-sub">Update employee status and add a comment</p>'
    /* A record holding rejected documents says so at the top of the form, not
       only inside the one status that lists them. */
    +(bad.length?'<div class="emp-log-alert">'+EMP_LOG_ICONS.warn+'<span><b>'+bad.length+' document'
      +(bad.length===1?'':'s')+'</b> awaiting re-submission: '+bad.map(function(d){return empLifeHtml(d.name);}).join(', ')+'</span></div>':'')
    +lpLogStatusField(kind+'-log-status-sel',emp.status,EMP_LIFE_STATUSES,
       'empLogSwapInput(\''+kind+'\',this.value)')
    +empLogInputs(kind,emp,emp.status)
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
