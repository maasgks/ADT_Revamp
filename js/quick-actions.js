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

  /* Support tickets. */
  'support-tickets':function(id){
    var t=find(D().tickets,id);if(!t)return [];
    if(t.status==='closed')return [A('Reopen ticket',I.undo,'info','qaTicket('+id+',\'open\')')];
    var a=[];
    if(t.status==='open')a.push(A('Start work',I.play,'wait','qaTicket('+id+',\'in_progress\')'));
    a.push(A('Close ticket',I.check,'ok','qaTicket('+id+',\'closed\')',{lead:t.status==='in_progress'}));
    return a;
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

/* ── bulk ──────────────────────────────────────────────────────────────────
   Only pages where several rows plausibly need the SAME answer.           */
var BULK={
  'all-leaves':{
    label:'leave request',
    actions:[{label:'Approve all',icon:I.check,call:'qaBulkLeave(\'Approved\')'},
             {label:'Reject all',icon:I.x,call:'qaBulkLeave(\'Unapproved\')'}]
  },
  payments:{
    label:'invoice',
    actions:[{label:'Mark all paid',icon:I.cash,call:'qaBulkPayment(\'Paid\')'}]
  },
  compliance:{
    label:'requirement',
    actions:[{label:'Activate all',icon:I.check,call:'qaBulkCompliance(\'Active\')'},
             {label:'Deactivate all',icon:I.power,call:'qaBulkCompliance(\'Inactive\')'}]
  },
  'support-tickets':{
    label:'ticket',
    actions:[{label:'Close all',icon:I.check,call:'qaBulkTicket(\'closed\')'}]
  }
};
var selected=new Set();
var selectedPage=null;

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

function enhanceSelection(pg,tr){
  var cfg=BULK[pg];
  if(!cfg)return;                       /* page has no bulk action - leave the cell alone */
  var first=tr.cells&&tr.cells[0];
  if(!first)return;
  var id=rowIdFrom(tr);
  if(id==null)return;
  var wrap=first.querySelector('.qa-numwrap');
  if(!wrap){
    var text=first.textContent;
    first.textContent='';
    wrap=document.createElement('span');
    wrap.className='qa-numwrap';
    wrap.innerHTML='<span class="qa-num">'+esc(text)+'</span>'
      +'<button type="button" class="qa-check" aria-label="Select row" title="Select row">'+I.check+'</button>';
    first.appendChild(wrap);
    wrap.querySelector('.qa-check').addEventListener('click',function(e){
      e.stopPropagation();
      toggleSelect(pg,id,tr);
    });
  }
  var on=selectedPage===pg&&selected.has(String(id));
  wrap.querySelector('.qa-check').classList.toggle('on',on);
  tr.classList.toggle('qa-sel',on);
}

function toggleSelect(pg,id,tr){
  if(selectedPage!==pg){selected.clear();selectedPage=pg;}
  id=String(id);
  if(selected.has(id))selected.delete(id);else selected.add(id);
  var check=tr.querySelector('.qa-check');
  if(check)check.classList.toggle('on',selected.has(id));
  tr.classList.toggle('qa-sel',selected.has(id));
  syncBulkBar(pg);
}

function syncBulkBar(pg){
  var host=document.querySelector('#adt-content .lp-split-main')||document.querySelector('#adt-content .lp-table-card');
  var bar=document.getElementById('qa-bulkbar');
  var cfg=BULK[pg];
  var n=selectedPage===pg?selected.size:0;
  if(!cfg||!n||!host){if(bar)bar.remove();document.querySelectorAll('.qa-selecting').forEach(function(e){e.classList.remove('qa-selecting');});return;}
  host.classList.add('qa-selecting');
  /* Lives on <body>, not in the table: it is position:fixed, and any ancestor
     that is mid-transform (the page entrance animation) would silently become
     its containing block and drag it up the page. */
  if(!bar){
    bar=document.createElement('div');
    bar.id='qa-bulkbar';
    bar.className='qa-bulkbar';
    document.body.appendChild(bar);
  }
  bar.innerHTML='<span class="qa-bulk-count">'+n+' '+cfg.label+(n===1?'':'s')+' selected</span>'
    +'<span class="qa-bulk-sep"></span>'
    +cfg.actions.map(function(a){
      return '<button type="button" class="qa-bulk-btn" onclick="'+a.call+'">'+a.icon+a.label+'</button>';
    }).join('')
    +'<button type="button" class="qa-bulk-btn qa-bulk-clear" onclick="qaClearSelection()">Clear</button>';
}

window.qaClearSelection=function(){
  selected.clear();
  document.querySelectorAll('tr.qa-sel').forEach(function(r){r.classList.remove('qa-sel');});
  document.querySelectorAll('.qa-check.on').forEach(function(c){c.classList.remove('on');});
  syncBulkBar(selectedPage);
};
function selectedIds(){return Array.from(selected);}

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
  /* Drop a selection that belongs to a page we have navigated away from. */
  if(selectedPage&&selectedPage!==pg){selected.clear();selectedPage=null;}
  var rows=root.querySelectorAll('table tbody tr');
  for(var i=0;i<rows.length;i++){
    var tr=rows[i];
    if(!tr.querySelector(ANCHOR))continue;   /* empty-state row */
    enhanceRow(pg,tr);
    enhanceSelection(pg,tr);
  }
  syncBulkBar(pg);
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

/* ── action handlers ───────────────────────────────────────────────────── */
window.qaLeave=function(id,status){
  var l=find(D().leaves,id);if(!l)return;
  l.status=status;
  qaCommit('#al-row-'+id,status==='Approved'?'ok':status==='Pending'?'info':'bad');
  toast('Leave '+status.toLowerCase(),status==='Approved'?'success':status==='Pending'?'info':'error',
    l.name+' · '+l.leaveFrom+(l.leaveTo&&l.leaveTo!==l.leaveFrom?' to '+l.leaveTo:''));
};

window.qaPayment=function(id,status){
  var p=find(D().payments,id);if(!p)return;
  p.invoiceStatus=status;
  qaCommit('#pm-row-'+id,status==='Paid'?'ok':'info');
  toast('Invoice marked '+status.toLowerCase(),status==='Paid'?'success':'info',p.orderId+' · '+p.name+' · '+p.amountDue);
};

window.qaCompliance=function(id){
  var r=find(D().compliance,id);if(!r)return;
  r.status=r.status==='Active'?'Inactive':'Active';
  qaCommit('#cmp-row-'+id,r.status==='Active'?'ok':'bad');
  toast('Requirement '+r.status.toLowerCase(),r.status==='Active'?'success':'info',r.country+' · '+r.item);
};

window.qaPolicyToggle=function(id){
  var p=find(D().policies,id);if(!p)return;
  p.status=p.status==='Active'?'Inactive':'Active';
  qaCommit('#lp-row-'+id,p.status==='Active'?'ok':'bad');
  toast('Policy '+p.status.toLowerCase(),p.status==='Active'?'success':'info',p.type);
};
window.qaPolicyEdit=function(id){
  if(typeof leaveEditId!=='undefined')leaveEditId=id;
  page='leave-policy-edit';
  if(typeof renderADTPage==='function')renderADTPage();
};

window.qaTicket=function(id,status){
  var t=find(D().tickets,id);if(!t)return;
  t.status=status;
  qaCommit('#tk-row-'+id,status==='closed'?'ok':status==='in_progress'?'info':'info');
  var label=(typeof tkStatusLabel==='function')?tkStatusLabel(status):status;
  toast('Ticket '+label.toLowerCase(),'success',t.ticketId+' · '+t.title);
};

window.qaRateToggle=function(id){
  var r=find(D().rates,id);if(!r)return;
  r.status=r.status==='Active'?'Inactive':'Active';
  qaCommit('#rr-row-'+id,r.status==='Active'?'ok':'bad');
  toast('Rule '+r.status.toLowerCase(),r.status==='Active'?'success':'info',r.country+' · '+r.ruleName);
};

window.qaTemplateToggle=function(id){
  var t=find(D().templates,id);if(!t)return;
  t.status=t.status==='Active'?'Inactive':'Active';
  qaCommit('#ctp-row-'+id,t.status==='Active'?'ok':'bad');
  toast('Template '+t.status.toLowerCase(),t.status==='Active'?'success':'info',t.templateName+' · '+t.employmentType);
};

window.qaChat=function(id,status){
  var c=find(D().chats,id);if(!c)return;
  c.status=status;
  qaCommit('#chat-row-'+id,status==='inactive'?'idle':status==='active'?'ok':'info');
  var label=(typeof chatStatusLabel==='function')?chatStatusLabel(status):status;
  toast('Chat: '+label,'success',c.chatId+' · '+c.clientName);
};

window.qaTeamToggle=function(id){
  var t=find(D().teams,id);if(!t)return;
  t.status=t.status==='Active'?'Inactive':'Active';
  qaCommit('#tm-row-'+id,t.status==='Active'?'ok':'bad');
  toast('Team '+t.status.toLowerCase(),t.status==='Active'?'success':'info',t.name+' · '+t.dept);
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

window.qaGeneric=function(pg,id,status){
  var meta=getPageMeta(pg)||{};
  var cols=meta.columns||[],rows=meta.rows||[];
  var si=cols.findIndex(function(c){return c==='Status'||c==='status';});
  if(si<0)return;
  var row=null;
  for(var i=0;i<rows.length;i++)if(String(rows[i][0])===String(id)){row=rows[i];break;}
  if(!row)return;
  row[si]=status;
  qaCommit('tr[data-row-id="'+id+'"]',status==='Active'?'ok':'bad');
  var nameIdx=cols.length>1?1:0;
  toast('Marked '+status.toLowerCase(),status==='Active'?'success':'info',String(row[nameIdx]));
};

/* ── bulk handlers ─────────────────────────────────────────────────────── */
function bulkDone(n,verb,kind){
  qaClearSelection();
  qaCommit(null);
  toast(n+' '+(n===1?'record':'records')+' '+verb,kind||'success');
}
window.qaBulkLeave=function(status){
  var ids=selectedIds(),n=0;
  var arr=D().leaves;ids.forEach(function(id){var l=find(arr,id);if(l){l.status=status;n++;}});
  bulkDone(n,status.toLowerCase(),status==='Approved'?'success':'error');
};
window.qaBulkPayment=function(status){
  var ids=selectedIds(),n=0;
  var arr=D().payments;ids.forEach(function(id){var p=find(arr,id);if(p){p.invoiceStatus=status;n++;}});
  bulkDone(n,'marked '+status.toLowerCase());
};
window.qaBulkCompliance=function(status){
  var ids=selectedIds(),n=0;
  var arr=D().compliance;ids.forEach(function(id){var r=find(arr,id);if(r){r.status=status;n++;}});
  bulkDone(n,'marked '+status.toLowerCase());
};
window.qaBulkTicket=function(status){
  var ids=selectedIds(),n=0;
  var arr=D().tickets;ids.forEach(function(id){var t=find(arr,id);if(t){t.status=status;n++;}});
  bulkDone(n,'closed');
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
