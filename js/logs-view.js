/* ══ THE LOGS TAB ══════════════════════════════════════════════════════════
   One layout for every Logs tab in the app, top to bottom:

     1. HEAD    - "Current status" bar: the record's status, who the next move
                  is with, and one button per move the record can make.
                  When no move is open it is a status card instead
                  (waiting / completed / rejected).
     2. COMPOSER - clicking a move turns the bar into one card: "<current> →
                  [move]", the module's own fields, Cancel and a submit button
                  named after the move. The table hides while it is open.
     3. TABLE   - every entry, oldest first: S.No | Status | Remarks |
                  Created By | Create Time.

   Nothing about WHAT a module records changed. Each module still builds the
   form it always built - its status options, its extra fields, its Save and
   Cancel handlers - and passes it to lpLogsView(). The status dropdown in that
   form is kept (hidden) and set by the move buttons, so every xxSaveLog()
   reads exactly the values it read before. */

const LPL_ICO={
  x:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  wait:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22"/><path d="M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/></svg>',
  done:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  bad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  chev:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>'
};
/* How many move buttons sit in the bar before the rest fold into "More". */
const LPL_MAX_BTNS=4;
/* Moves that undo, refuse or stop a record read as the outlined, amber kind. */
const LPL_BACK_RE=/^(reject|return|revert|cancel|decline|unapprov|inactive|block|move back|withdraw|terminat|suspend|hold|reopen)/i;

function lplEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function lplAttr(s){return lplEsc(s).replace(/'/g,'&#39;');}

/* Stored times are "05:44:07 PM" (stampNow) or "14:05:09"; the table shows
   "05:44 PM" - minutes are the precision anyone reads a log at. */
function lplTime(t){
  const m=String(t||'').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if(!m)return t||'';
  let h=+m[1],ap=m[3];
  if(!ap){ap=h>=12?'PM':'AM';h=h%12||12;}
  return (h<10?'0'+h:h)+':'+m[2]+' '+ap.toUpperCase();
}

/* Modules store entries in two shapes: {status, action} almost everywhere,
   {label, comment} in Contracts. One reader for both. */
function lplRow(l){
  return {
    status:l.label||l.status||'Updated',
    user:l.user||'System',
    role:l.role||(l.actorType==='SYSTEM'||l.system?'System':''),
    date:l.date||'',time:l.time||'',portal:l.portal||'',
    reason:l.reason||'',
    comment:l.comment!=null?l.comment:(l.action||'')
  };
}

/* ── 3. The table ──────────────────────────────────────────────────────── */
/* logs: newest first, as every module stores them.
   o.statusLabel  header of the status column ("Leave Status")
   o.rowExtra     fn(entry, indexInStoredList) -> extra markup in Remarks
   o.rowClass     fn(entry, indexInStoredList) -> a class for the row ('is-bad') */
function lplTableHTML(logs,o){
  o=o||{};
  if(!logs||!logs.length)return '<div class="lp-logs-empty">No activity logs yet.</div>';
  const n=logs.length;
  const rows=logs.slice().reverse().map(function(raw,k){
    const l=lplRow(raw),i=n-1-k;
    const extra=o.rowExtra?o.rowExtra(raw,i)||'':'';
    const rem=(l.reason?'<span class="lpl-reason">Reason: '+l.reason+'</span>':'')
      +(l.comment||(!l.reason&&!extra?'&mdash;':''))
      +extra;
    const cls=o.rowClass?o.rowClass(raw,i)||'':'';
    return '<tr'+(cls?' class="'+cls+'"':'')+'>'
      +'<td class="lpl-sno">'+(k+1)+'</td>'
      +'<td class="lpl-st">'+l.status+'</td>'
      +'<td class="lpl-rem">'+rem+'</td>'
      +'<td>'+l.user+(l.role?'<span class="lpl-sub">'+l.role+'</span>':'')+'</td>'
      +'<td>'+l.date+'<span class="lpl-sub">'+lplTime(l.time)
        +(l.portal&&l.portal!=='Web'?' &middot; '+l.portal+' portal':'')+'</span></td>'
      +'</tr>';
  }).join('');
  return '<div class="lpl-table-wrap"><table class="lpl-table"><thead><tr>'
    +'<th>S.No</th><th>'+(o.statusLabel||'Status')+'</th><th>Remarks</th><th>Created By</th><th>Create Time</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table></div>';
}

/* ── 2b. A status card, for when there is nothing to do here ───────────────
   kind: 'wait' | 'done' | 'bad'. */
function lplCardHTML(kind,title,sub,o){
  o=o||{};
  return '<div class="lpl-state is-'+kind+'">'
    +(o.current?'<div class="lpl-state-cur"><span>Current status</span><b>'+o.current+'</b></div>':'')
    +'<div class="lpl-state-ico">'+LPL_ICO[kind]+'</div>'
    +'<div class="lpl-state-title">'+title+'</div>'
    +(sub?'<div class="lpl-state-sub">'+sub+'</div>':'')
    +(o.button||'')
    +'</div>';
}

/* ── 1. The current-status bar ─────────────────────────────────────────── */
/* actions: [{label, onclick, back, danger, disabled, title}] already decided by
   the caller. o.maxBtns: how many show as buttons before the rest fold into More. */
function lplBarHTML(current,sub,actions,o){
  o=o||{};
  const max=o.maxBtns||LPL_MAX_BTNS;
  const shown=actions.slice(0,max),more=actions.slice(max);
  const btn=function(a){
    return '<button type="button" class="'+(a.back||a.quiet?'btn-outline':'btn-primary')+' lpl-btn'+(a.danger?' is-danger':'')+'"'
      +(a.data||'')+(a.disabled?' disabled title="'+lplAttr(a.title||'')+'"':' onclick="'+a.onclick+'"')+'>'+a.label+'</button>';
  };
  const moreHTML=more.length
    ?'<div class="lpl-more"><button type="button" class="btn-outline lpl-btn" onclick="lplToggleMore(this,event)">More '+LPL_ICO.chev+'</button>'
      +'<div class="lpl-more-menu">'+more.map(function(a){
        return '<button type="button" class="lpl-more-item'+(a.back?' is-back':'')+'"'+(a.data||'')
          +(a.disabled?' disabled title="'+lplAttr(a.title||'')+'"':' onclick="lplCloseMore();'+a.onclick+'"')+'>'+a.label+'</button>';
      }).join('')+'</div></div>'
    :'';
  return '<div class="lpl-bar">'
    +'<div class="lpl-bar-main">'
      +'<div class="lpl-eyebrow">Current status</div>'
      +'<div class="lpl-status"><span class="lpl-dot"></span>'+current+(o.chip||'')+'</div>'
      +(sub?'<p class="lpl-sub-line">'+sub+'</p>':'')
    +'</div>'
    +((shown.length||o.lead)?'<div class="lpl-actions">'+(o.lead||'')+shown.map(btn).join('')+moreHTML+'</div>':'')
    +'</div>';
}

/* ── The whole tab, from a module's existing form ──────────────────────────
   logs      the record's entries, newest first
   formHTML  the module's .lp-logs-form markup, unchanged
   o.owner       who the next move is with -> "Next action is pending with X."
   o.open        a move to open the composer on straight away (a decision
                 carried in from a dashboard or a row menu)
   o.isBack      fn(option) -> true for moves that go backwards
   o.side        markup between the head and the table (document strips…)
   o.labels      {status: 'verb'} - what each move is called on screen when
                 the status it writes reads differently ('Approved' -> 'Approve')
   o.select      true: the moves are one 'Select action' dropdown instead of a
                 row of buttons; picking one opens the composer the same way.
                 'auto': the dropdown only when the moves would not fit as
                 buttons (more than o.maxBtns) - no row-plus-More overflow
   o.noAction    {title, sub}: with no form, the card to show instead of the
                 generic one - for a user who may not act on this record
   o.aiFields    fn(move) -> [{label, from, to, obj, key, group, info, hidden}]:
                 the record fields this move writes, for the composer's "AI
                 fetched results" section. A row with obj/key is written on
                 Submit (and undone if the save is refused); one without is
                 written by the module's own save. `to` may be a function,
                 read again as the form changes. See lplAiRows().
   o.aiContext   fn(move) -> null | {title, rows:[{label, value, state, note, wide}]}:
                 the few facts THIS move depends on, read off the record and
                 shown above the changes. null (a comment, a revert, a move
                 nothing informs) draws no section. state 'ok'/'warn' marks a
                 check; `note` says why; `wide` spans a long value. Blank
                 values are left out. See lplAiContext().
   o.aiLogStatus fn(move) -> the status the log entry stores, when it is not
                 the move's own value
   o.aiUser      who the log entry is signed by (default CURRENT_USER)
   o.statusLabel / o.rowExtra   passed to the table */
function lpLogsView(logs,formHTML,o){
  o=o||{};
  logs=logs||[];
  const tpl=document.createElement('div');
  tpl.innerHTML=formHTML||'';
  const form=tpl.querySelector('.lp-logs-form');
  const latest=logs[0]?lplRow(logs[0]).status:'';
  let head='';

  if(form){
    const hdr=form.querySelector('.lp-logs-form-header');
    const subEl=form.querySelector('.lp-logs-form-sub');
    const current=o.current||(hdr?hdr.textContent.trim():'')||latest||'—';
    const sub=o.owner
      ?'Next action is pending with <b>'+o.owner+'</b>.'
      :(o.sub!=null?o.sub:(subEl?subEl.innerHTML:''));
    if(hdr)hdr.remove();
    if(subEl)subEl.remove();

    /* The status dropdown: kept in the DOM (the save handler reads it), hidden,
       and driven by the move buttons. */
    const wrap=form.querySelector('.cs-wrap');
    const selId=wrap?wrap.id.replace(/^csw-/,''):'';
    const opts=wrap?Array.prototype.map.call(wrap.querySelectorAll('.cs-option > span'),function(s){return s.textContent;}):[];
    if(wrap){
      const lab=wrap.previousElementSibling;
      if(lab&&lab.classList.contains('lp-logs-form-label'))lab.remove();
      wrap.classList.add('lpl-hidden-sel');
    }

    /* Save / Cancel move into the composer foot. */
    const save=form.querySelector('.lp-logs-save-btn');
    const cancel=form.querySelector('.ep-cancel-btn');
    const saveJs=save?save.getAttribute('onclick')||'':'';
    const cancelJs=cancel?cancel.getAttribute('onclick')||'':'';
    [save,cancel].forEach(function(b){
      if(!b)return;
      const p=b.parentElement;
      if(p&&p!==form&&!p.querySelector('textarea,.cs-wrap,input'))p.remove();else b.remove();
    });

    const isBack=function(v){return o.isBack?o.isBack(v):(LPL_BACK_RE.test(v)||statusTone(v)==='bad');};
    /* One button per status the record can MOVE to. Staying on the current
       status is not offered: every move already opens the comment box. */
    const actions=opts.filter(function(v){return v!==current;}).map(function(v){
      const back=isBack(v),label=(o.labels&&o.labels[v])||v;
      return {label:lplEsc(label),text:label,value:v,back:back,danger:/^reject/i.test(v),onclick:'lplPick(this)',
        data:' data-v="'+lplAttr(v)+'" data-l="'+lplAttr(label)+'"'+(back?' data-back="1"':'')};
    });
    /* Forward moves lead, backward moves follow - in a button row. A dropdown
       keeps the caller's order: it is a list somebody chose the order of. */
    const useSelect=o.select==='auto'?actions.length>(o.maxBtns||LPL_MAX_BTNS):!!o.select;
    if(!useSelect)actions.sort(function(a,b){return (a.back?1:0)-(b.back?1:0);});

    /* Dropdown mode: the moves still exist as buttons - they carry the value,
       label and direction lplPick reads - but hidden, and the dropdown presses
       the one picked. */
    const picker=useSelect&&actions.length
      ?apCS('lpl-act-'+selId,actions.map(function(a){return a.text;}),'','Select action','lplSelectPick')
        +'<span hidden>'+actions.map(function(a){return '<button type="button" class="lpl-btn"'+a.data+' onclick="lplPick(this)">'+a.label+'</button>';}).join('')+'</span>'
      :'';
    head=!actions.length?lplNoMoveCard(current,logs)
      :picker?lplBarHTML(current,sub,[],{lead:picker})
      :lplBarHTML(current,sub,actions);

    const fields=form.innerHTML;
    const aiId=lplAiRegister(current,o);
    head+='<div class="lpl-composer" hidden>'
      +'<div class="lpl-c-head"><div class="lpl-c-move"><span class="lpl-c-from">'+current+'</span>'
        +'<span class="lpl-c-arrow">&rarr;</span><span class="lpl-c-to"></span></div>'
        +'<button type="button" class="lpl-c-x" aria-label="Close" onclick="lplClose(this);'+lplAttr(cancelJs)+'">'+LPL_ICO.x+'</button></div>'
      +'<div class="lpl-c-body">'+(aiId?'<div class="lpl-ai" data-ai="'+aiId+'"></div>':'')+fields+'</div>'
      +'<div class="lpl-c-foot"><span class="lpl-c-hint"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit</span>'
        +'<div class="lpl-c-btns"><button type="button" class="btn-outline lpl-btn" onclick="lplClose(this);'+lplAttr(cancelJs)+'">Cancel</button>'
        +'<button type="button" class="btn-primary lpl-btn lpl-c-submit" onclick="'+lplAttr(saveJs?'lplAiCommit(this);try{'+saveJs+'}finally{lplAiSettle(this);}':'')+'">Submit</button></div></div>'
      +'</div>';

    return '<div class="lpl" data-sel="'+lplAttr(selId)+'"'+(o.open?' data-open="'+lplAttr(o.open)+'"':'')+'>'
      +head+(o.side||'')
      +'<div class="lpl-log-list">'+lplTableHTML(logs,o)+'</div>'
      +'</div>'
      +(o.open?lplAutoOpen():'');
  }

  /* No form at all: the record takes no more moves - or none from this user,
     in which case o.noAction says who does take them. */
  const cur=o.current||latest||'—';
  return '<div class="lpl">'+(o.noAction?lplCardHTML('wait',o.noAction.title,o.noAction.sub,{current:lplEsc(cur)}):lplNoMoveCard(cur,logs))+(o.side||'')
    +'<div class="lpl-log-list">'+lplTableHTML(logs,o)+'</div></div>';
}

/* The card shown when a record offers no move. Its tone follows the status:
   a settled-good record reads "completed", a refused one "rejected". */
function lplNoMoveCard(current,logs){
  const last=logs&&logs[0]?lplRow(logs[0]):null;
  const by=last?' on '+last.date+' by '+last.user:'';
  const tone=statusTone(current);
  if(tone==='bad')return lplCardHTML('bad',lplEsc(current),'Moved to '+lplEsc(current)+by+'. No further steps.');
  if(tone==='ok'||/closed|complete|resolved/i.test(current))
    return lplCardHTML('done','Completed','All steps are done. '+lplEsc(current)+by+'.');
  return lplCardHTML('wait','No action available','There is nothing to record on this record right now.',{current:lplEsc(current)});
}

/* A composer asked to open on render (o.open) is opened once the markup is in
   the page: the move button it presses must exist before it can be pressed. */
function lplAutoOpen(){
  setTimeout(function(){
    document.querySelectorAll('.lpl[data-open]').forEach(function(root){
      const v=root.getAttribute('data-open');root.removeAttribute('data-open');
      const b=Array.prototype.find.call(root.querySelectorAll('[data-v]'),function(x){return x.getAttribute('data-v')===v;});
      if(b)b.click();else lplOpen(root,v,v);
    });
  },0);
  return '';
}

/* ── Interaction ───────────────────────────────────────────────────────── */
function lplPick(btn){
  const root=btn.closest('.lpl');if(!root)return;
  lplOpen(root,btn.getAttribute('data-v'),btn.getAttribute('data-l'),btn.hasAttribute('data-back'));
}
function lplOpen(root,value,label,back){
  const selId=root.getAttribute('data-sel');
  if(selId){
    const drop=document.getElementById('csd-'+selId);
    const opt=drop&&Array.prototype.find.call(drop.querySelectorAll('.cs-option'),function(x){return x.textContent.trim()===value;});
    if(opt)csSelect(opt,value,selId);
  }
  const comp=root.querySelector('.lpl-composer');if(!comp)return;
  if(back==null)back=LPL_BACK_RE.test(value)||statusTone(value)==='bad';
  comp.classList.toggle('is-back',back);
  comp.querySelector('.lpl-c-to').textContent=label;
  const sub=comp.querySelector('.lpl-c-submit');
  sub.textContent=label;
  sub.classList.toggle('is-danger',/^reject/i.test(value));
  comp.setAttribute('data-v',value);
  lplAiRender(comp);
  root.classList.add('is-composing');
  comp.hidden=false;
  const ta=comp.querySelector('textarea');
  if(ta)setTimeout(function(){ta.focus();},30);
}
function lplSelectPick(val,csid){
  const wrap=document.getElementById('csw-'+csid),root=wrap&&wrap.closest('.lpl');if(!root)return;
  const btn=Array.prototype.find.call(root.querySelectorAll('[data-l]'),function(b){return b.getAttribute('data-l')===val;});
  if(btn)lplPick(btn);
}
function lplClose(el){
  const root=el.closest('.lpl');if(!root)return;
  const comp=root.querySelector('.lpl-composer');
  if(comp){comp.hidden=true;const ta=comp.querySelector('textarea');if(ta)ta.value='';}
  root.classList.remove('is-composing');
}
function lplToggleMore(btn,e){
  if(e)e.stopPropagation();
  const m=btn.nextElementSibling;const open=!m.classList.contains('open');
  lplCloseMore();
  if(open)m.classList.add('open');
}
function lplCloseMore(){document.querySelectorAll('.lpl-more-menu.open').forEach(function(m){m.classList.remove('open');});}
document.addEventListener('click',function(e){if(!e.target.closest('.lpl-more'))lplCloseMore();});
/* Ctrl / Cmd + Enter in the composer submits it. */
document.addEventListener('keydown',function(e){
  if(e.key!=='Enter'||!(e.ctrlKey||e.metaKey))return;
  const comp=e.target.closest&&e.target.closest('.lpl-composer');
  if(!comp||comp.hidden)return;
  e.preventDefault();
  const b=comp.querySelector('.lpl-c-submit');if(b)b.click();
});

/* ── AI fetched results ────────────────────────────────────────────────────
   A section at the top of the composer listing the exact fields this log
   writes: the record's own fields (o.aiFields) and the log entry's. The values
   are read from the record itself - there is no AI service behind this demo -
   and refresh as the form is filled in. */
const LPL_AI={},LPL_AI_ICO='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>';
let lplAiSeq=0;
function lplAiRegister(current,o){
  const id='ai'+(++lplAiSeq);
  delete LPL_AI['ai'+(lplAiSeq-40)];   // older tabs are long gone from the page
  LPL_AI[id]={current:current,fields:o.aiFields,logStatus:o.aiLogStatus,user:o.aiUser,statusLabel:o.statusLabel,
    context:o.aiContext};
  return id;
}
/* Context for the move being logged - NOT the whole record. Each module
   answers one question per move: what does the person need in front of them
   to make THIS step? Sending a contract needs who it goes to and what it
   commits to; approving a leave needs the dates and whether they clash. A
   comment, a revert, or a move nothing extra informs returns null and the
   section is not drawn at all. Rows may carry a check (state 'ok' | 'warn')
   so a gap - a pending compliance item, money still due - is flagged before
   Submit rather than discovered after. */
function lplAiContext(reg,v){
  const c=reg.context&&v?reg.context(v):null;
  if(!c||!c.rows)return null;
  const rows=c.rows.map(function(r){return {label:r.label,value:lplAiVal(r.value),state:r.state||'',note:r.note||'',wide:!!r.wide};})
    .filter(function(r){return r.value!=null&&String(r.value).trim()!==''&&!/^[—–-]+$/.test(String(r.value).trim());});
  return rows.length?{title:c.title||'Context for this step',rows:rows}:null;
}
function lplAiCtxVal(x){
  return (x.state?'<span class="lpl-ai-ck is-'+x.state+'" aria-label="'+(x.state==='ok'?'Check passed':'Needs attention')+'"></span>':'')
    +lplEsc(x.value)+(x.note?'<span class="lpl-ai-note">'+lplEsc(x.note)+'</span>':'');
}
/* The context in the same shape as the layout picked below it. */
const LPL_AI_CTX_LAYOUT={
  grid:function(rows){
    return '<dl class="lpl-ai-grid">'+rows.map(function(x){
      return '<div class="lpl-ai-row'+(x.wide?' is-wide':'')+(x.state?' is-'+x.state:'')+'"><dt>'+lplEsc(x.label)+'</dt><dd>'+lplAiCtxVal(x)+'</dd></div>';
    }).join('')+'</dl>';
  },
  table:function(rows){
    return '<div class="lpl-ai-tbl-wrap"><table class="lpl-ai-tbl"><tbody>'+rows.map(function(x){
      return '<tr'+(x.state?' class="is-'+x.state+'"':'')+'><td class="lpl-ai-k">'+lplEsc(x.label)+'</td><td>'+lplAiCtxVal(x)+'</td></tr>';
    }).join('')+'</tbody></table></div>';
  },
  compact:function(rows){
    return '<p class="lpl-ai-line">'+rows.map(function(x,i){
      return (i?'<span class="lpl-ai-dot">&middot;</span>':'')+lplEsc(x.label)+' <b>'+lplAiCtxVal(x)+'</b>';
    }).join(' ')+'</p>';
  }
};
function lplAiContextHTML(ctx,view){
  if(!ctx)return '';
  const warn=ctx.rows.filter(function(x){return x.state==='warn';}).length;
  return '<div class="lpl-ai-ctx">'
    +'<div class="lpl-ai-ctx-h"><span class="lpl-ai-group">'+lplEsc(ctx.title)+'</span>'
    +(warn?'<span class="lpl-ai-ctx-flag">'+warn+' to check</span>':'')+'</div>'
    +LPL_AI_CTX_LAYOUT[view==='table'?'table':view==='compact'?'compact':'grid'](ctx.rows)
    +'</div>';
}
function lplAiVal(x){return typeof x==='function'?x():x;}
/* Record rows first, then the log entry: its status, any extra log fields the
   module adds (group:'log'), who signs it and when. */
function lplAiRows(reg,v){
  const all=(reg.fields?reg.fields(v)||[]:[]);
  const st=stampNow();
  return {
    record:all.filter(function(r){return r.group!=='log';}),
    log:[{label:reg.statusLabel||'Status',to:reg.logStatus?reg.logStatus(v):v}]
      .concat(all.filter(function(r){return r.group==='log';}))
      .concat([{label:'Created By',to:reg.user||(typeof CURRENT_USER!=='undefined'?CURRENT_USER:'You')},
               {label:'Create Time',to:st.date+' · '+lplTime(st.time)}])
  };
}
/* Four layouts for the same rows, picked from the tabs in the section's head
   and remembered per browser. */
const LPL_AI_VIEWS=[{id:'cards',label:'Cards'},{id:'table',label:'Table'},{id:'compact',label:'Compact'},{id:'split',label:'Before / After'}];
let lplAiViewId=(function(){try{return localStorage.getItem('lpl-ai-view')||'cards';}catch(e){return 'cards';}})();
function lplAiSetView(id){
  lplAiViewId=id;
  try{localStorage.setItem('lpl-ai-view',id);}catch(e){}
  document.querySelectorAll('.lpl-composer:not([hidden])').forEach(lplAiRender);
}
/* A row resolved for display: its value now, what it was, and whether it moves. */
function lplAiResolve(r){
  const to=lplAiVal(r.to),from=r.info?null:lplAiVal(r.from);
  const blank=to==null||to==='';
  return {label:r.label,to:to,from:from,info:!!r.info,blank:blank,
    moved:!r.info&&from!=null&&from!==''&&String(from)!==String(to),
    added:!r.info&&(from==null||from==='')};
}
function lplAiTo(x){
  return x.blank?'<span class="lpl-ai-empty">Pick it in the form below</span>':lplEsc(x.to);
}
function lplAiChange(x){
  return (x.moved?'<span class="lpl-ai-chip">'+lplEsc(x.from)+'</span><span class="lpl-ai-arrow">&rarr;</span>':'')
    +(x.blank?lplAiTo(x):'<span class="lpl-ai-chip'+(x.info?'':' is-to')+'">'+lplEsc(x.to)+'</span>');
}
const LPL_AI_LAYOUT={
  /* Changes as full-width rows, the log entry as a compact grid. */
  cards:function(rec,log){
    return (rec.length?'<div class="lpl-ai-group">Record</div><div class="lpl-ai-diff">'+rec.map(function(x){
        return '<div class="lpl-ai-diff-row'+(x.info?' is-info':'')+'"><span class="lpl-ai-k">'+lplEsc(x.label)+'</span><span class="lpl-ai-v">'+lplAiChange(x)+'</span></div>';
      }).join('')+'</div>':'')
      +'<div class="lpl-ai-group">Log entry</div><dl class="lpl-ai-grid">'+log.map(function(x){
        return '<div class="lpl-ai-row"><dt>'+lplEsc(x.label)+'</dt><dd>'+lplAiTo(x)+'</dd></div>';
      }).join('')+'</dl>';
  },
  /* One table: field, current value, new value. */
  table:function(rec,log){
    const tr=function(x){
      return '<tr'+(x.moved?' class="is-moved"':'')+'><td class="lpl-ai-k">'+lplEsc(x.label)+'</td>'
        +'<td class="lpl-ai-cur">'+(x.info?lplEsc(x.to):x.from!=null&&x.from!==''?lplEsc(x.from):'&mdash;')+'</td>'
        +'<td class="lpl-ai-new">'+(x.info?'<span class="lpl-ai-same">No change</span>':x.moved||x.added?lplAiTo(x):'<span class="lpl-ai-same">No change</span>')+'</td></tr>';
    };
    const sec=function(t,list){return list.length?'<tr class="lpl-ai-sec"><td colspan="3">'+t+'</td></tr>'+list.map(tr).join(''):'';};
    return '<div class="lpl-ai-tbl-wrap"><table class="lpl-ai-tbl"><thead><tr><th>Field</th><th>Current</th><th>New</th></tr></thead><tbody>'
      +sec('Record',rec)+sec('Log entry',log)+'</tbody></table></div>';
  },
  /* The changes as chips, the log entry as one line of text. */
  compact:function(rec,log){
    const by=log.filter(function(x){return x.label==='Created By';})[0],at=log.filter(function(x){return x.label==='Create Time';})[0];
    const rest=log.filter(function(x){return x!==by&&x!==at;});
    return (rec.length?'<div class="lpl-ai-chips">'+rec.map(function(x){
        return '<span class="lpl-ai-pill"><b>'+lplEsc(x.label)+'</b>'+lplAiChange(x)+'</span>';
      }).join('')+'</div>':'')
      +'<p class="lpl-ai-line">Logged as '+rest.map(function(x,i){
        return (i?'<span class="lpl-ai-dot">&middot;</span>'+lplEsc(x.label)+' ':'')+'<b>'+lplAiTo(x)+'</b>';
      }).join(' ')
      +(by?' by <b>'+lplAiTo(by)+'</b>':'')+(at?' on <b>'+lplAiTo(at)+'</b>':'')+'</p>';
  },
  /* The record as it is and as it will be, side by side. */
  split:function(rec,log){
    const all=rec.concat(log);
    const col=function(t,cls,f){
      return '<div class="lpl-ai-side '+cls+'"><div class="lpl-ai-side-h">'+t+'</div>'+all.map(function(x){
        return '<div class="lpl-ai-side-row'+(x.moved||x.added?' is-moved':'')+'"><span>'+lplEsc(x.label)+'</span><b>'+f(x)+'</b></div>';
      }).join('')+'</div>';
    };
    return '<div class="lpl-ai-split">'
      +col('Before','is-before',function(x){return x.info?lplEsc(x.to):x.from!=null&&x.from!==''?lplEsc(x.from):'<span class="lpl-ai-same">&mdash;</span>';})
      +col('After','is-after',function(x){return lplAiTo(x);})
      +'</div>';
  }
};
function lplAiRender(comp){
  const box=comp&&comp.querySelector('.lpl-ai'),reg=box&&LPL_AI[box.getAttribute('data-ai')];
  if(!reg)return;
  const rows=lplAiRows(reg,comp.getAttribute('data-v')||'');
  const shown=function(list){return list.filter(function(r){return !r.hidden;}).map(lplAiResolve);};
  const rec=shown(rows.record),log=shown(rows.log);
  const changes=rec.concat(log).filter(function(x){return x.moved||x.added;}).length;
  const view=LPL_AI_LAYOUT[lplAiViewId]?lplAiViewId:'cards';
  const ctx=lplAiContext(reg,comp.getAttribute('data-v')||''),ctxHTML=lplAiContextHTML(ctx,view);
  const warn=ctx?ctx.rows.filter(function(x){return x.state==='warn';}).length:0;
  box.className='lpl-ai is-'+view;
  box.innerHTML='<div class="lpl-ai-head"><span class="lpl-ai-ico">'+LPL_AI_ICO+'</span>'
      +'<div class="lpl-ai-title-wrap"><span class="lpl-ai-title">AI fetched results</span>'
      +'<span class="lpl-ai-meta">'+changes+' field'+(changes===1?'':'s')+' will be updated on submit'
      +(warn?' &middot; '+warn+' thing'+(warn===1?'':'s')+' to check first':'')+'</span></div>'
      +'<div class="lpl-ai-tabs" role="tablist">'+LPL_AI_VIEWS.map(function(v){
        return '<button type="button" role="tab" class="lpl-ai-tab'+(v.id===view?' active':'')+'" aria-selected="'+(v.id===view)+'" onclick="lplAiSetView(\''+v.id+'\')">'+v.label+'</button>';
      }).join('')+'</div></div>'
    +'<div class="lpl-ai-body">'+ctxHTML
      +(ctxHTML?'<div class="lpl-ai-changes"><div class="lpl-ai-group">Changes on submit</div>':'')
      +LPL_AI_LAYOUT[view](rec,log)+(ctxHTML?'</div>':'')+'</div>';
}
/* Submit writes the record rows that carry obj/key, then runs the module's
   save. A save that succeeds adds a row to the log and closes the composer
   (renderADTPage patches the tab in place, so the button itself may survive);
   one that is refused - an empty comment - does neither, and the writes are
   undone. */
function lplAiLogCount(btn){
  const root=btn.isConnected&&btn.closest('.lpl');
  return root?root.querySelectorAll('.lpl-table tbody tr').length:-1;
}
function lplAiCommit(btn){
  const comp=btn.closest('.lpl-composer'),box=comp&&comp.querySelector('.lpl-ai'),reg=box&&LPL_AI[box.getAttribute('data-ai')];
  btn._aiUndo=[];
  btn._aiRows=lplAiLogCount(btn);
  if(!reg)return;
  lplAiRows(reg,comp.getAttribute('data-v')||'').record.forEach(function(r){
    const to=lplAiVal(r.to);
    if(!r.obj||!r.key||to==null||to==='')return;
    btn._aiUndo.push([r.obj,r.key,r.obj[r.key]]);
    r.obj[r.key]=to;
  });
}
function lplAiSettle(btn){
  const undo=btn._aiUndo||[];btn._aiUndo=null;
  const comp=btn.isConnected&&btn.closest('.lpl-composer');
  const saved=!comp||comp.hidden||lplAiLogCount(btn)>btn._aiRows;
  if(!saved){undo.reverse().forEach(function(u){u[0][u[1]]=u[2];});return;}
  // Saved: the listing may show a field written here, so it is redrawn too.
  if(undo.length&&typeof renderADTPage==='function')renderADTPage();
}
/* Values picked or typed further down the form (an assignee, a blocker) are
   read again as they change. */
['input','click'].forEach(function(ev){
  document.addEventListener(ev,function(){
    // Any click: a dropdown's menu may sit outside the composer it belongs to.
    setTimeout(function(){
      document.querySelectorAll('.lpl-composer:not([hidden])').forEach(lplAiRender);
    },0);
  });
});
