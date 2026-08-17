/* ==========================================================================
   ROW QUICK ACTIONS  -  engine.

   HOW THIS ATTACHES.  Not by editing the twelve listing builders. Every one
   of them already ends its rows with the same thing: a <td> containing a
   .lp-action-btn whose onclick names the record's id. That is a reliable
   anchor, so this file is a POST-RENDER ENHANCER: a MutationObserver watches
   #adt-content, and whenever a listing is (re)painted it injects the cluster
   into that cell. Adding a listing page later needs no change here beyond an
   entry in REGISTRY, and a page with no entry is simply left alone.

   WHY AN OBSERVER RATHER THAN A CALL IN renderADTPage().  Panels, tabs and
   filters all repaint fragments of the page by writing innerHTML directly,
   without going through renderADTPage. An observer catches all of them; a
   single call site would catch about half and the bugs would be invisible
   until a user hit that one path.

   THE CONTRACT EVERY ACTION KEEPS.  An action mutates the data array, then
   calls qaCommit(). qaCommit repaints the page WITHOUT the entrance
   animation, then flashes the row it changed and pops the new badge. That is
   the whole feedback loop and it happens in the row you clicked, so the eye
   never leaves it. A toast is secondary - it names the record for the undo
   trail; the flash is what actually tells you it worked.

   WHAT DOES NOT GET A QUICK ACTION.  Anything irreversible, anything that
   costs money, and anything needing input beyond the click. Those still open
   the detail panel, which is the right place for a decision that deserves a
   form. Deactivating a record is reversible by the same button, so it counts
   as reversible.
   ========================================================================== */
(function(){
'use strict';

/* ── icons ─────────────────────────────────────────────────────────────── */
var I={
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  undo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
  pencil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  power:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  cash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="8" y1="4" x2="8" y2="20"/><line x1="16" y1="4" x2="16" y2="20"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
};

/* ── helpers ───────────────────────────────────────────────────────────── */
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
function find(arr,id){if(!arr)return null;for(var i=0;i<arr.length;i++)if(String(arr[i].id)===String(id))return arr[i];return null;}
function toast(t,kind,sub){if(typeof showToast==='function')showToast(t,kind||'success',sub);}
/* The page data arrays are `const` at the top level of core.js, which puts
   them in SCRIPT scope: reachable by name from this file, but NOT present on
   `window`. Everything below therefore goes through D(), which names each
   identifier literally and guards it with typeof. A window['allLeavesData']
   probe returns undefined for every one of them, which is a silent failure -
   the enhancer runs, finds no record, and renders no actions at all. */
function D(){
  return {
    leaves:    typeof allLeavesData      !=='undefined'?allLeavesData      :null,
    payments:  typeof paymentsData       !=='undefined'?paymentsData       :null,
    compliance:typeof complianceItemsData!=='undefined'?complianceItemsData:null,
    policies:  typeof leavePoliciesData  !=='undefined'?leavePoliciesData  :null,
    tickets:   typeof ticketsData        !=='undefined'?ticketsData        :null,
    contracts: typeof contractsData      !=='undefined'?contractsData      :null,
    teams:     typeof teamsData          !=='undefined'?teamsData          :null,
    direct:    typeof directEmpData      !=='undefined'?directEmpData      :null,
    global:    typeof globalEmpData      !=='undefined'?globalEmpData      :null,
    rates:     typeof ratesRulesData     !=='undefined'?ratesRulesData     :null,
    templates: typeof contractTemplatesData!=='undefined'?contractTemplatesData:null,
    chats:     typeof chatsData          !=='undefined'?chatsData          :null,
    ctFlow:    typeof ctFlow             !=='undefined'?ctFlow             :null
  };
}

/* An action descriptor. `lead:true` promotes it to the labelled pill - see
   the "one per row, maximum" rule in quick-actions.css. */
function A(label,icon,tone,call,opts){
  opts=opts||{};
  return {label:label,icon:icon,tone:tone,call:call,lead:!!opts.lead,dot:!!opts.dot};
}

/* ── the registry ──────────────────────────────────────────────────────────
   page id -> function(rowId, trElement) -> array of actions.
   Return [] to leave a page's rows exactly as they were.                  */
var REGISTRY={

  /* Leave requests. The queue this whole feature was written for. */
  'all-leaves':function(id){
    var l=find(D().leaves,id);if(!l)return [];
    if(l.status==='Pending')return [
      A('Approve',I.check,'ok','qaLeave('+id+',\'Approved\')',{lead:true,dot:true}),
      A('Reject',I.x,'bad','qaLeave('+id+',\'Unapproved\')')
    ];
    if(l.status==='Approved')return [A('Move back to pending',I.undo,'wait','qaLeave('+id+',\'Pending\')')];
    return [A('Approve',I.check,'ok','qaLeave('+id+',\'Approved\')')];
  },

  /* Invoices. "Paid" is the only state anyone is ever hunting for. */
  payments:function(id){
    var p=find(D().payments,id);if(!p)return [];
    if(p.invoiceStatus==='Paid')return [A('Reopen invoice',I.undo,'wait','qaPayment('+id+',\'Pending\')')];
    if(p.invoiceStatus==='Closed')return [];
    return [A('Mark paid',I.cash,'ok','qaPayment('+id+',\'Paid\')',{lead:true,dot:p.invoiceStatus==='Unpaid'})];
  },

  /* Compliance requirements. Reversible both ways, so both directions get
     an icon rather than a pill - neither is "the thing you are waiting for". */
  compliance:function(id){
    var r=find(D().compliance,id);if(!r)return [];
    return r.status==='Active'
      ? [A('Deactivate',I.power,'bad','qaCompliance('+id+')')]
      : [A('Activate',I.power,'ok','qaCompliance('+id+')')];
  },

  /* Leave policies. Editing is the whole reason anyone opens this table, and
     it was behind the panel like everything else. */
  'leave-policies':function(id){
    var p=find(D().policies,id);if(!p)return [];
    return [
      A('Edit policy',I.pencil,'nav','qaPolicyEdit('+id+')'),
      p.status==='Active'
        ? A('Deactivate',I.power,'bad','qaPolicyToggle('+id+')')
        : A('Activate',I.power,'ok','qaPolicyToggle('+id+')')
    ];
  },

  /* Support tickets. The row offers exactly the moves TK_FLOW allows out of
     the state the ticket is actually in - so there is no Close button on an
     unresolved ticket to click by mistake. The pill goes on the move that WE
     owe: an open ticket needs picking up, a resolved one is the client's to
     confirm and gets no pill, because nothing there is waiting on us. */
  'support-tickets':function(id){
    var t=find(D().tickets,id);if(!t)return [];
    if(typeof tkMoves!=='function')return [];
    var ours=t.status==='open'||t.status==='in_progress';
    return tkMoves(t).map(function(mv,i){
      return A(mv.label,I[mv.icon]||I.arrow,mv.tone,'qaTicket('+id+',\''+mv.to+'\')',
               {lead:ours&&i===0,dot:t.status==='open'&&i===0});
    });
  },

  /* Contracts. The pipeline dropdown in this table already lets you PICK a
     stage; what it does not do is answer "just move it along", which is what
     is wanted on nearly every row. One click to the next stage's form. */
  contracts:function(id){
    var d=D();
    var c=find(d.contracts,id);if(!c||!d.ctFlow)return [];
    var i=d.ctFlow.indexOf(c.status);
    if(i<0||i>=d.ctFlow.length-1)return [];
    /* Icon-only, deliberately. Stage names here run to 18 characters, and the
       row already carries the current stage twice (badge + dropdown) - a
       third full-width label would be the widest thing in the row while
       saying the least. The tooltip carries the destination. */
    return [A('Move to '+d.ctFlow[i+1],I.arrow,'nav','qaContractAdvance('+id+')')];
  },

  /* Employees. Nothing here is safely one-click reversible, so both actions
     navigate rather than commit - the win is skipping a module hop, not
     skipping a decision. */
  direct:function(id){return empActions(D().direct,id);},
  global:function(id){return empActions(D().global,id);},

  /* Teams. */
  teams:function(id){
    var t=find(D().teams,id);if(!t)return [];
    return t.status==='Active'
      ? [A('Deactivate team',I.power,'bad','qaTeamToggle('+id+')')]
      : [A('Activate team',I.power,'ok','qaTeamToggle('+id+')')];
  },

  /* Rates & rules and contract templates. Same shape, same one reversible
     decision anyone ever makes from the table: is this in force or not. */
  'rates-rules':function(id){
    var r=find(D().rates,id);if(!r)return [];
    return r.status==='Active'
      ? [A('Deactivate rule',I.power,'bad','qaRateToggle('+id+')')]
      : [A('Activate rule',I.power,'ok','qaRateToggle('+id+')')];
  },
  'contract-templates':function(id){
    var t=find(D().templates,id);if(!t)return [];
    return t.status==='Active'
      ? [A('Deactivate template',I.power,'bad','qaTemplateToggle('+id+')')]
      : [A('Activate template',I.power,'ok','qaTemplateToggle('+id+')')];
  },

  /* Messages. The only status here that means "someone is waiting on US" is
     waiting_csm, so that is the one that earns the pill. */
  chats:function(id){
    var c=find(D().chats,id);if(!c)return [];
    if(c.status==='waiting_csm')return [
      A('Mark replied',I.check,'ok','qaChat('+id+',\'waiting_client\')',{lead:true,dot:true}),
      A('Close chat',I.x,'idle','qaChat('+id+',\'inactive\')')
    ];
    if(c.status==='inactive')return [A('Reopen chat',I.undo,'info','qaChat('+id+',\'active\')')];
    return [A('Close chat',I.x,'idle','qaChat('+id+',\'inactive\')')];
  }
};

/* Employees in both listings share a shape, so they share their actions. */
function empActions(data,id){
  var e=find(data,id);if(!e)return [];
  var acts=[];
  if(typeof atViewCalendar==='function'){
    var initials=String(e.name||'').split(/\s+/).map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase();
    acts.push(A('Open timesheet',I.cal,'nav',
      'qaEmpTimesheet(\''+esc(e.empId||'')+'\',\''+esc(e.name||'')+'\',\''+initials+'\',\''+esc(e.jobTitle||'Employee')+'\')'));
  }
  return acts;
};

/* Generic listings (People, Pay Runs, Users, Payheads, Settings, Support…)
   are arrays-of-arrays behind getPageMeta, with a Status column somewhere.
   One rule covers all of them: flip that column. */
function genericActions(pg,id){
  if(typeof getPageMeta!=='function')return [];
  var meta=getPageMeta(pg)||{};
  var cols=meta.columns||[],rows=meta.rows||[];
  var si=cols.findIndex(function(c){return c==='Status'||c==='status';});
  if(si<0)return [];
  var row=null;
  for(var i=0;i<rows.length;i++)if(String(rows[i][0])===String(id)){row=rows[i];break;}
  if(!row)return [];
  var st=String(row[si]);
  /* A row mid-flight (Pending) is the one asking a question - give it the
     pill. A settled row just gets the reversible toggle. */
  if(st==='Pending')return [
    A('Mark active',I.check,'ok','qaGeneric(\''+pg+'\','+id+',\'Active\')',{lead:true,dot:true}),
    A('Mark inactive',I.x,'bad','qaGeneric(\''+pg+'\','+id+',\'Inactive\')')
  ];
  return st==='Active'
    ? [A('Mark inactive',I.power,'bad','qaGeneric(\''+pg+'\','+id+',\'Inactive\')')]
    : [A('Mark active',I.power,'ok','qaGeneric(\''+pg+'\','+id+',\'Active\')')];
}

/* Pages that render through the shared buildListingHTML and have no bespoke
   builder of their own. Teams/contracts/payments deliberately are NOT here:
   they share a name with a generic meta entry but render their own table, and
   they already have a REGISTRY entry keyed to their real data. */
var GENERIC=['people','leaves','payroll','support','payheads','all-users','settings'];

function actionsFor(pg,id,tr){
  if(REGISTRY[pg])return REGISTRY[pg](id,tr)||[];
  if(GENERIC.indexOf(pg)>=0)return genericActions(pg,id);
  return [];
}

/* Row selection and the bulk bar used to live here. They only ever reached
   four of the ~19 listings - the four with an obvious bulk verb - which made
   the hover checkbox read as an accident on the pages that had it rather than
   a feature the pages without it were missing. The per-row cluster below is
   uniform across every listing, so that is the whole interaction now. */

/* ── injection ─────────────────────────────────────────────────────────── */
/* Every listing's ACTION cell ends in one of these two: the hamburger that
   opens the detail panel, or - on Contracts, which shows a stage dropdown
   instead - the dots button next to it. Anchoring on them is what lets this
   file stay out of the twelve builders. */
var ANCHOR='.lp-action-btn,.ct-dots-btn';

function rowIdFrom(tr){
  if(tr.hasAttribute('data-row-id'))return tr.getAttribute('data-row-id');
  /* Bespoke builders stamp id="<prefix>-row-<id>" on every row. */
  var m=/(?:^|-)row-(\w+)$/.exec(tr.id||'');
  if(m)return m[1];
  /* Last resort - and the only route for Company Settings, whose rows carry
     neither an id nor data-row-id: the record id is already an argument in
     the anchor button's own onclick. */
  var btn=tr.querySelector(ANCHOR);
  var oc=btn&&btn.getAttribute('onclick');
  var n=oc&&/\((\d+)/.exec(oc);
  return n?n[1]:null;
}

function buildCluster(actions){
  var span=document.createElement('span');
  span.className='qa-cluster';
  span.setAttribute('data-qa','1');
  span.innerHTML=actions.map(function(a){
    var lead=a.lead?' qa-lead':'';
    /* A lead button carries EITHER the breathing dot or its icon, never both.
       The dot says "waiting on you" and the label says what to do; adding a
       tick between them is a third thing saying nothing new. */
    var glyph=(a.lead&&a.dot)?'<span class="qa-dot"></span>':a.icon;
    return '<button type="button" class="qa-btn qa-'+a.tone+lead+'" title="'+esc(a.label)+'" aria-label="'+esc(a.label)+'"'
      +' onclick="event.stopPropagation();'+a.call+'">'
      +glyph
      +(a.lead?'<span>'+esc(a.label)+'</span>':'')
      +'</button>';
  }).join('');
  return span;
}

function enhanceRow(pg,tr){
  var btn=tr.querySelector(ANCHOR);
  if(!btn)return;
  var cell=btn.closest('td');
  if(!cell)return;
  /* On Contracts the anchor is nested inside .ct-action-wrap, so the anchor
     itself is not a child of the cell and insertBefore(anchor) throws. Walk
     up to whichever direct child of the cell contains it - which also puts
     the cluster to the LEFT of the whole stage control rather than inside
     it, keeping "existing controls stay put" true on that page too. */
  var before=btn;
  while(before.parentElement&&before.parentElement!==cell)before=before.parentElement;
  if(before.parentElement!==cell)return;

  /* Mark the table BEFORE deciding whether this row gets any actions. The
     class right-aligns the ACTION column, which is what keeps the hamburger
     on a single vertical line across the whole table: clusters differ in
     width row to row, so a left-aligned column would push the one control
     the user's hand already knows to a different x on every row. Marking
     only rows that got actions would re-create exactly that problem. */
  var table=tr.closest('table');
  if(table)table.classList.add('qa-right');
  if(!cell.hasAttribute('data-qa-cell')){
    cell.setAttribute('data-qa-cell','1');
    /* The cell must swallow clicks on our buttons: some builders put the
       stopPropagation on the button, others on the cell, and a stray click
       would open the detail panel on top of the action just taken. */
    cell.addEventListener('click',function(e){if(e.target.closest('[data-qa]'))e.stopPropagation();});
  }

  var existing=cell.querySelector(':scope > [data-qa]');
  if(existing)existing.remove();
  var id=rowIdFrom(tr);
  if(id==null)return;
  var actions=actionsFor(pg,id,tr);
  if(!actions.length)return;
  cell.insertBefore(buildCluster(actions),before);
}

/* ── the enhancer ──────────────────────────────────────────────────────────
   enhance() WRITES to the same subtree the observer WATCHES, so it has to
   close the loop itself: takeRecords() at the end throws away the records its
   own writes just queued. Without that line every listing repaint becomes an
   infinite rAF loop that pins a core. A boolean guard is not enough - records
   are delivered as a microtask after enhance() has already returned.      */
var scheduled=false,observer=null;
function enhance(){
  scheduled=false;
  var pg=(typeof page!=='undefined')?page:null;
  var root=document.getElementById('adt-content');
  if(!pg||!root){if(observer)observer.takeRecords();return;}
  var rows=root.querySelectorAll('table tbody tr');
  for(var i=0;i<rows.length;i++){
    var tr=rows[i];
    if(!tr.querySelector(ANCHOR))continue;   /* empty-state row */
    enhanceRow(pg,tr);
  }
  if(observer)observer.takeRecords();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(enhance);}

/* ── commit + feedback ─────────────────────────────────────────────────── */
/* Repaint without the entrance animation, then confirm in the row itself.
   Suppressing the animation is the point: a full page fade-up after a single
   inline click reads as "the page reloaded", which is precisely the feeling
   this whole feature exists to remove. */
window.qaCommit=function(rowSelector,tone){
  var content=document.getElementById('adt-content');
  if(content)content.classList.add('m-quiet');
  if(typeof renderADTPage==='function')renderADTPage();
  requestAnimationFrame(function(){
    enhance();
    var tr=rowSelector?document.querySelector(rowSelector):null;
    if(tr){
      tr.classList.add('m-flash-'+(tone||'ok'));
      var badge=tr.querySelector('.lp-status-badge,.status-pill,.ct-sb-badge');
      if(badge)badge.classList.add('m-changed');
      setTimeout(function(){tr.classList.remove('m-flash-'+(tone||'ok'));},950);
    }
    setTimeout(function(){if(content)content.classList.remove('m-quiet');},60);
  });
};

/* ── the confirm step ──────────────────────────────────────────────────────
   Every inline action goes through here, and every one of them requires a
   comment. That is the whole point: a click on a tick is a keystroke, and a
   keystroke is not a decision anyone can audit later. The dialog states what
   is about to change, takes the reason, and only then commits - so the row's
   history and the row's status can never disagree, and no status in the app
   can be reached without a line in the log saying who moved it and why.

   Some moves need more than a comment (which agent is picking this up, which
   party we are blocked on). Those come through as `fields`. */
var askState=null;

function fieldHTML(f){
  var lab='<label class="qa-ask-label" for="qa-ask-f-'+f.key+'">'+esc(f.label)
    +(f.required===false?'':' <span class="qa-ask-req">*</span>')+'</label>';
  if(f.type==='select'){
    return lab+'<select class="qa-ask-input" id="qa-ask-f-'+f.key+'">'
      +'<option value="">'+esc(f.placeholder||'Select…')+'</option>'
      +(f.options||[]).map(function(o){
        return '<option value="'+esc(o)+'"'+(o===f.value?' selected':'')+'>'+esc(o)+'</option>';
      }).join('')+'</select>';
  }
  return lab+'<textarea class="qa-ask-input qa-ask-area" id="qa-ask-f-'+f.key+'"'
    +' placeholder="'+esc(f.placeholder||'')+'">'+esc(f.value||'')+'</textarea>';
}

function closeAsk(){
  var o=document.getElementById('qa-ask');
  if(o)o.remove();
  document.removeEventListener('keydown',askKey);
  askState=null;
}
function askKey(e){if(e.key==='Escape')closeAsk();}

/* opts: {title, subject, from, to, tone, confirmLabel, fields[], onConfirm(vals)} */
function qaAsk(opts){
  closeAsk();
  askState=opts;
  var fields=opts.fields||[];
  var wrap=document.createElement('div');
  wrap.id='qa-ask';
  wrap.className='qa-ask-overlay';
  wrap.innerHTML='<div class="qa-ask-card" role="dialog" aria-modal="true" aria-label="'+esc(opts.title)+'">'
    +'<div class="qa-ask-head">'
    +'<div class="qa-ask-title">'+esc(opts.title)+'</div>'
    +(opts.subject?'<div class="qa-ask-subject">'+esc(opts.subject)+'</div>':'')
    +'</div>'
    +(opts.to?'<div class="qa-ask-move">'
      +'<span class="qa-ask-chip">'+esc(opts.from||'')+'</span>'
      +'<span class="qa-ask-arrow">'+I.arrow+'</span>'
      +'<span class="qa-ask-chip qa-ask-chip-'+(opts.tone||'ok')+'">'+esc(opts.to)+'</span>'
      +'</div>':'')
    +'<div class="qa-ask-body">'
    +fields.map(fieldHTML).join('')
    +'<label class="qa-ask-label" for="qa-ask-comment">'+esc(opts.commentLabel||'Comment')+' <span class="qa-ask-req">*</span></label>'
    +'<textarea class="qa-ask-input qa-ask-area" id="qa-ask-comment" placeholder="'
      +esc(opts.commentPlaceholder||'Why are you making this change?')+'"></textarea>'
    +'<div class="qa-ask-hint" id="qa-ask-hint">Saved to this record’s Logs and Workflow. It cannot be edited later.</div>'
    +'</div>'
    +'<div class="qa-ask-foot">'
    +'<button type="button" class="qa-ask-btn qa-ask-cancel" id="qa-ask-cancel">Cancel</button>'
    +'<button type="button" class="qa-ask-btn qa-ask-go" id="qa-ask-go">'+esc(opts.confirmLabel||'Confirm')+'</button>'
    +'</div></div>';
  document.body.appendChild(wrap);

  var hint=wrap.querySelector('#qa-ask-hint');
  var flash=function(el,msg){
    if(el){el.classList.add('qa-ask-bad');setTimeout(function(){el.classList.remove('qa-ask-bad');},1400);el.focus();}
    if(hint){hint.textContent=msg;hint.classList.add('qa-ask-hint-bad');
      setTimeout(function(){hint.classList.remove('qa-ask-hint-bad');},1400);}
  };

  wrap.querySelector('#qa-ask-cancel').addEventListener('click',closeAsk);
  wrap.addEventListener('mousedown',function(e){if(e.target===wrap)closeAsk();});
  document.addEventListener('keydown',askKey);

  wrap.querySelector('#qa-ask-go').addEventListener('click',function(){
    var vals={},i,f,el;
    for(i=0;i<fields.length;i++){
      f=fields[i];
      el=document.getElementById('qa-ask-f-'+f.key);
      vals[f.key]=el?String(el.value||'').trim():'';
      if(f.required!==false&&!vals[f.key]){flash(el,f.label+' is required.');return;}
    }
    var c=document.getElementById('qa-ask-comment');
    vals.comment=c?c.value.trim():'';
    if(!vals.comment){flash(c,'A comment is required to record this action.');return;}
    closeAsk();
    opts.onConfirm(vals);
  });

  requestAnimationFrame(function(){
    var first=wrap.querySelector('.qa-ask-input');
    if(first)first.focus();
  });
}

/* ── where each page keeps its history ─────────────────────────────────────
   `wf` is the Workflow-tab timeline (keyed by record id); `logs` is the
   Logs-tab fixture that seedLogs() copies onto the record on first read.
   Named accessors rather than a string lookup for the same reason D() uses
   them: these are script-scope consts and are not reachable off `window`.
   A page may have one store, both, or neither - the comment is required
   either way, because the confirm step is what makes the action deliberate,
   not what happens to be persisted afterwards. */
var HISTORY={
  'all-leaves':{row:'#al-row-',
    wf:function(){return typeof alWorkflowData!=='undefined'?alWorkflowData:null;},
    logs:function(id){return (typeof alLogsData!=='undefined'&&alLogsData[id])||[];}},
  payments:{row:'#pm-row-',
    wf:function(){return typeof pmWorkflowData!=='undefined'?pmWorkflowData:null;},
    logs:function(id){return (typeof pmLogsData!=='undefined'&&pmLogsData[id])||[];}},
  compliance:{row:'#cmp-row-',
    wf:function(){return null;},
    logs:function(id){return (typeof complianceLogsData!=='undefined'&&complianceLogsData[id])||[];}},
  'leave-policies':{row:'#lp-row-',
    wf:function(){return typeof lpWorkflowData!=='undefined'?lpWorkflowData:null;},
    logs:function(id){return (typeof lpLogsData!=='undefined'&&lpLogsData[id])||[];}},
  'support-tickets':{row:'#tk-row-',
    wf:function(){return typeof tkWorkflowData!=='undefined'?tkWorkflowData:null;},
    logs:function(id){return (typeof tkLogsData!=='undefined'&&tkLogsData[id])||[];}},
  teams:{row:'#tm-row-',
    wf:function(){return typeof tmWorkflowData!=='undefined'?tmWorkflowData:null;},
    logs:function(id){return (typeof tmLogsData!=='undefined'&&tmLogsData[id])||[];}},
  'rates-rules':{row:'#rr-row-',
    wf:function(){return null;},
    logs:function(id){return (typeof ratesRulesLogsData!=='undefined'&&ratesRulesLogsData[id])||[];}},
  'contract-templates':{row:'#ctp-row-',
    wf:function(){return null;},
    logs:function(id){return (typeof ctpLogsData!=='undefined'&&ctpLogsData[id])||[];}},
  chats:{row:'#chat-row-',
    wf:function(){return typeof chatWorkflowData!=='undefined'?chatWorkflowData:null;},
    logs:function(){return [];}}
};

/* Write the action into both histories the record has, then repaint. */
function record(pg,rec,id,o){
  var h=HISTORY[pg];
  if(h){
    if(typeof wfPush==='function')wfPush(h.wf(),id,o.title,o.comment);
    if(typeof logPush==='function')logPush(rec,h.logs(id),o.statusLabel,o.comment);
  }
  qaCommit((h?h.row:'#row-')+id,o.tone);
  toast(o.toastTitle,o.toastKind||'success',o.toastSub);
}

/* ── action handlers ───────────────────────────────────────────────────── */
window.qaLeave=function(id,status){
  var l=find(D().leaves,id);if(!l)return;
  var span=l.leaveFrom+(l.leaveTo&&l.leaveTo!==l.leaveFrom?' to '+l.leaveTo:'');
  var tone=status==='Approved'?'ok':status==='Pending'?'info':'bad';
  qaAsk({
    title:status==='Approved'?'Approve leave request':status==='Pending'?'Move back to pending':'Reject leave request',
    subject:l.name+' · '+span,
    from:l.status,to:status,tone:tone,
    confirmLabel:status==='Approved'?'Approve':status==='Pending'?'Move back':'Reject',
    onConfirm:function(v){
      l.status=status;
      record('all-leaves',l,id,{
        title:'Leave '+status,comment:v.comment,statusLabel:status,tone:tone,
        toastTitle:'Leave '+status.toLowerCase(),
        toastKind:status==='Approved'?'success':status==='Pending'?'info':'error',
        toastSub:l.name+' · '+span});
    }});
};

window.qaPayment=function(id,status){
  var p=find(D().payments,id);if(!p)return;
  qaAsk({
    title:status==='Paid'?'Mark invoice paid':'Reopen invoice',
    subject:p.orderId+' · '+p.name+' · '+p.amountDue,
    from:p.invoiceStatus,to:status,tone:status==='Paid'?'ok':'wait',
    confirmLabel:status==='Paid'?'Mark paid':'Reopen',
    onConfirm:function(v){
      p.invoiceStatus=status;
      record('payments',p,id,{
        title:'Invoice '+status,comment:v.comment,statusLabel:status,
        tone:status==='Paid'?'ok':'info',
        toastTitle:'Invoice marked '+status.toLowerCase(),
        toastKind:status==='Paid'?'success':'info',
        toastSub:p.orderId+' · '+p.name+' · '+p.amountDue});
    }});
};

window.qaCompliance=function(id){
  var r=find(D().compliance,id);if(!r)return;
  var to=r.status==='Active'?'Inactive':'Active';
  qaAsk({
    title:to==='Active'?'Activate requirement':'Deactivate requirement',
    subject:r.country+' · '+r.item,
    from:r.status,to:to,tone:to==='Active'?'ok':'bad',
    confirmLabel:to==='Active'?'Activate':'Deactivate',
    onConfirm:function(v){
      r.status=to;
      record('compliance',r,id,{
        title:'Requirement '+to,comment:v.comment,statusLabel:to,
        tone:to==='Active'?'ok':'bad',
        toastTitle:'Requirement '+to.toLowerCase(),
        toastKind:to==='Active'?'success':'info',
        toastSub:r.country+' · '+r.item});
    }});
};

window.qaPolicyToggle=function(id){
  var p=find(D().policies,id);if(!p)return;
  var to=p.status==='Active'?'Inactive':'Active';
  qaAsk({
    title:to==='Active'?'Activate policy':'Deactivate policy',
    subject:p.type,
    from:p.status,to:to,tone:to==='Active'?'ok':'bad',
    confirmLabel:to==='Active'?'Activate':'Deactivate',
    onConfirm:function(v){
      p.status=to;
      record('leave-policies',p,id,{
        title:'Policy '+to,comment:v.comment,statusLabel:to,
        tone:to==='Active'?'ok':'bad',
        toastTitle:'Policy '+to.toLowerCase(),
        toastKind:to==='Active'?'success':'info',toastSub:p.type});
    }});
};
window.qaPolicyEdit=function(id){
  if(typeof leaveEditId!=='undefined')leaveEditId=id;
  page='leave-policy-edit';
  if(typeof renderADTPage==='function')renderADTPage();
};

/* Tickets move by NAMED MOVE, not by "set the status to X". The move has to
   be one the flow allows from where the ticket actually is, which is what
   stops a listing click from closing a ticket that nobody has resolved: the
   only move into `closed` lives on `resolved`, and `resolved` is the client's
   to confirm. An out-of-date row (someone else moved it in another tab) fails
   the lookup here rather than silently applying. */
window.qaTicket=function(id,to){
  var t=find(D().tickets,id);if(!t)return;
  if(typeof tkMoves!=='function')return;
  var moves=tkMoves(t),mv=null,i;
  for(i=0;i<moves.length;i++)if(moves[i].to===to)mv=moves[i];
  if(!mv){toast('That is no longer possible','error',t.ticketId+' is now '+lbl(t.status));return;}

  var fields=[];
  if(mv.needs.indexOf('assignee')>=0)fields.push({
    key:'assignee',label:'Assign to',type:'select',placeholder:'Choose an agent…',
    options:(typeof TK_AGENTS!=='undefined'?TK_AGENTS:[]),value:t.assignedTo});
  if(mv.needs.indexOf('waitingOn')>=0)fields.push({
    key:'waitingOn',label:'Waiting on',type:'select',placeholder:'Who are we blocked on?…',
    options:(typeof TK_BLOCKERS!=='undefined'?TK_BLOCKERS:[]),value:t.waitingOn});
  qaAsk({
    title:mv.label,subject:t.ticketId+' · '+t.title,
    from:lbl(t.status),to:lbl(mv.to),tone:mv.tone,confirmLabel:mv.label,fields:fields,
    /* The comment IS the record of what happened, so each move asks its own
       question rather than a generic "why". On the move to Resolved that
       question is "what did you do to resolve this?", and the answer is what
       the panel later shows as the resolution. */
    commentLabel:mv.commentLabel||'Comment',commentPlaceholder:mv.ask,
    onConfirm:function(v){ tkApply(t,id,mv,v); }});
};

/* Shared by the row action, the panel's move buttons and the Logs form, so
   all three produce identical history for the same move. */
function tkApply(t,id,mv,v){
  if(v.assignee)t.assignedTo=v.assignee;
  /* waitingOn only means anything while blocked - carrying a stale value onto
     an unblocked ticket would make the panel lie about who owes it. */
  t.waitingOn=mv.to==='blocked'?v.waitingOn:'';
  t.status=mv.to;
  var owner=(typeof tkOwner==='function')?tkOwner(t):'';
  record('support-tickets',t,id,{
    title:mv.title,statusLabel:lbl(mv.to),tone:mv.tone,
    comment:v.comment+(t.waitingOn?' (Waiting on: '+t.waitingOn+')':''),
    toastTitle:'Ticket '+lbl(mv.to).toLowerCase(),
    toastKind:mv.tone==='bad'?'error':mv.tone==='ok'?'success':'info',
    toastSub:t.ticketId+' · next: '+owner});
}
/* The Logs form lives in pages.js but must commit through exactly this path. */
window.qaTicketApply=function(id,to,vals){
  var t=find(D().tickets,id);if(!t||typeof tkMoves!=='function')return false;
  var moves=tkMoves(t),mv=null,i;
  for(i=0;i<moves.length;i++)if(moves[i].to===to)mv=moves[i];
  if(!mv)return false;
  tkApply(t,id,mv,vals||{});
  return true;
};
function lbl(s){return (typeof tkStatusLabel==='function')?tkStatusLabel(s):s;}

/* The four status toggles are the same shape: one reversible flag, a comment,
   and a line in the record's own history. */
function toggleAsk(pg,rec,id,noun,subject,extra){
  var to=rec.status==='Active'?'Inactive':'Active';
  qaAsk({
    title:(to==='Active'?'Activate ':'Deactivate ')+noun,
    subject:subject,from:rec.status,to:to,tone:to==='Active'?'ok':'bad',
    confirmLabel:to==='Active'?'Activate':'Deactivate',
    onConfirm:function(v){
      rec.status=to;
      record(pg,rec,id,{
        title:(extra||noun.charAt(0).toUpperCase()+noun.slice(1))+' '+to,
        comment:v.comment,statusLabel:to,tone:to==='Active'?'ok':'bad',
        toastTitle:noun.charAt(0).toUpperCase()+noun.slice(1)+' '+to.toLowerCase(),
        toastKind:to==='Active'?'success':'info',toastSub:subject});
    }});
}

window.qaRateToggle=function(id){
  var r=find(D().rates,id);if(!r)return;
  toggleAsk('rates-rules',r,id,'rule',r.country+' · '+r.ruleName);
};

window.qaTemplateToggle=function(id){
  var t=find(D().templates,id);if(!t)return;
  toggleAsk('contract-templates',t,id,'template',t.templateName+' · '+t.employmentType);
};

window.qaChat=function(id,status){
  var c=find(D().chats,id);if(!c)return;
  var cl=function(s){return (typeof chatStatusLabel==='function')?chatStatusLabel(s):s;};
  var tone=status==='inactive'?'idle':status==='active'?'ok':'info';
  qaAsk({
    title:status==='inactive'?'Close chat':status==='active'?'Reopen chat':'Mark replied',
    subject:c.chatId+' · '+c.clientName,
    from:cl(c.status),to:cl(status),tone:status==='inactive'?'bad':'ok',
    confirmLabel:status==='inactive'?'Close chat':status==='active'?'Reopen':'Mark replied',
    onConfirm:function(v){
      c.status=status;
      record('chats',c,id,{
        title:'Chat '+cl(status),comment:v.comment,statusLabel:cl(status),tone:tone,
        toastTitle:'Chat: '+cl(status),
        toastKind:status==='inactive'?'info':'success',
        toastSub:c.chatId+' · '+c.clientName});
    }});
};

window.qaTeamToggle=function(id){
  var t=find(D().teams,id);if(!t)return;
  toggleAsk('teams',t,id,'team',t.name+' · '+t.dept);
};

/* Contracts do not commit from the row: advancing a stage needs a note and a
   document, so this lands you IN that form with the next stage preselected -
   one click instead of row, dropdown, stage, tab. */
window.qaContractAdvance=function(id){
  var d=D();
  var c=find(d.contracts,id);if(!c||!d.ctFlow)return;
  var i=d.ctFlow.indexOf(c.status);
  if(i<0||i>=d.ctFlow.length-1)return;
  if(typeof ctPickStatus==='function')ctPickStatus(id,d.ctFlow[i+1]);
};

window.qaEmpTimesheet=function(empId,name,initials,role){
  if(typeof atViewCalendar==='function')atViewCalendar(empId,name,initials,role);
};

/* The generic listings hold rows as plain arrays behind getPageMeta(), with
   no record object and no history store, so there is nowhere to file a log
   entry. The comment is still required and still shown back in the toast -
   an action that cannot be justified should not be one click here either. */
window.qaGeneric=function(pg,id,status){
  var meta=getPageMeta(pg)||{};
  var cols=meta.columns||[],rows=meta.rows||[];
  var si=cols.findIndex(function(c){return c==='Status'||c==='status';});
  if(si<0)return;
  var row=null;
  for(var i=0;i<rows.length;i++)if(String(rows[i][0])===String(id)){row=rows[i];break;}
  if(!row)return;
  var nameIdx=cols.length>1?1:0;
  var name=String(row[nameIdx]);
  qaAsk({
    title:status==='Active'?'Mark active':'Mark inactive',
    subject:name,from:String(row[si]),to:status,tone:status==='Active'?'ok':'bad',
    confirmLabel:status==='Active'?'Mark active':'Mark inactive',
    onConfirm:function(v){
      row[si]=status;
      qaCommit('tr[data-row-id="'+id+'"]',status==='Active'?'ok':'bad');
      toast('Marked '+status.toLowerCase(),status==='Active'?'success':'info',name+' · '+v.comment);
    }});
};

/* ── boot ──────────────────────────────────────────────────────────────── */
function start(){
  var root=document.getElementById('adt-content');
  if(!root){setTimeout(start,50);return;}
  observer=new MutationObserver(schedule);
  observer.observe(root,{childList:true,subtree:true});
  schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();

})();
