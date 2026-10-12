/* ══ EMPLOYEE DASHBOARD: ANNOUNCEMENTS ════════════════════════════════════
   What HR and the employee's manager have posted, under Key Metrics: an
   "Announcements" band, then a Latest Updates panel built like every other
   dashboard section (.hr-section).

   Two states, and the empty one is designed, not left blank. An employee who
   opens the dashboard to an empty box cannot tell "nothing has been posted"
   from "this failed to load". So the empty panel says, in words and with its
   own small piece of art, that they are caught up and where updates will
   come from.

   The data is empAnnouncements (js/core.js, beside the other dashboard
   fixtures). Every string in a post came from a person typing it, so all of
   it goes through sbEsc before it reaches the page.

   Mounted by renderADTPage on every visit to the dashboard, the same way
   empDashRender fills the lifecycle tracker: the dashboard is re-injected
   from a snapshot, so the panel has to be drawn again each time. */

const ANN_ICO={
  megaphone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
};
const ANN_ROLE={hr:'HR',manager:'Manager'};

/* "2 hours ago", "Yesterday", "3 days ago", "1 week ago" - and a date once a
   post is older than a month, when a count of weeks stops meaning anything. */
function annAgo(iso){
  const t=Date.parse(iso);if(isNaN(t))return '';
  const mins=Math.max(0,Math.round((Date.now()-t)/60000));
  if(mins<1)return 'Just now';
  if(mins<60)return mins+' min'+(mins===1?'':'s')+' ago';
  const hrs=Math.floor(mins/60);
  if(hrs<24)return hrs+' hour'+(hrs===1?'':'s')+' ago';
  const days=Math.floor(hrs/24);
  if(days===1)return 'Yesterday';
  if(days<7)return days+' days ago';
  if(days<31){const w=Math.floor(days/7);return w+' week'+(w===1?'':'s')+' ago';}
  return cdLabel(iso.slice(0,10));
}
function annInitials(name){
  return String(name||'').trim().split(/\s+/).slice(0,2).map(function(w){return w.charAt(0);}).join('').toUpperCase();
}
function annSorted(){
  return (typeof empAnnouncements!=='undefined'?empAnnouncements:[]).slice()
    .sort(function(a,b){return (Date.parse(b.when)||0)-(Date.parse(a.when)||0);});
}

/* One row per post: initials, title and its tags, two lines of text, then
   who posted it and when. */
function annListHTML(list){
  return '<ul class="ann-list">'+list.map(function(a){
    const from=a.from==='manager'?'manager':'hr';
    const tags=(a.pinned?'<span class="ann-tag is-pinned">Pinned</span>':'')
      +(a.isNew?'<span class="ann-tag is-new">New</span>':'')
      +(a.category?'<span class="ann-tag">'+sbEsc(a.category)+'</span>':'');
    return '<li class="ann-row">'
      +'<span class="ann-av is-'+from+'" aria-hidden="true">'+sbEsc(annInitials(a.author))+'</span>'
      +'<div class="ann-body">'
        +'<div class="ann-head"><span class="ann-title">'+sbEsc(a.title)+'</span>'+tags+'</div>'
        +'<p class="ann-text">'+sbEsc(a.text)+'</p>'
        +'<div class="ann-meta"><b>'+sbEsc(a.author)+'</b><span>'+ANN_ROLE[from]+'</span>'
          +'<span class="ann-dot" aria-hidden="true"></span><time datetime="'+sbEsc(a.when)+'">'+annAgo(a.when)+'</time></div>'
      +'</div>'
    +'</li>';
  }).join('')+'</ul>';
}

/* The caught-up state. The art is layered: a dashed outer ring, a solid inner
   ring, a raised disc carrying the megaphone, two sound waves leaving it, a
   check badge, and four dots drifting around - all decoration, so all of it is
   aria-hidden and the words carry the message. */
function annEmptyHTML(){
  return '<div class="ann-empty" role="status">'
    +'<div class="ann-art" aria-hidden="true">'
      +'<span class="ann-ring-out"></span><span class="ann-ring-in"></span>'
      +'<span class="ann-wave"></span><span class="ann-wave is-late"></span>'
      +'<span class="ann-disc"><span class="ann-mega">'+ANN_ICO.megaphone+'</span></span>'
      +'<span class="ann-badge">'+ANN_ICO.check+'</span>'
      +'<span class="ann-fx is-amber"></span><span class="ann-fx is-blue"></span>'
      +'<span class="ann-fx is-violet"></span><span class="ann-fx is-ring"></span>'
    +'</div>'
    +'<div class="ann-empty-title">You’re all caught up</div>'
    +'<p class="ann-empty-sub">There are no announcements right now. When HR or your manager shares an update, it will show up here first.</p>'
    +'<div class="ann-empty-chips"><span class="ann-chip is-hr">HR updates</span><span class="ann-chip is-manager">Manager notes</span></div>'
  +'</div>';
}

function announcementsHTML(){
  const list=annSorted();
  return '<div class="hr-band"><span class="hr-band-title">Announcements</span><span class="hr-band-rule"></span>'
      +'<span class="hr-band-meta">From HR &amp; your manager</span></div>'
    +'<div class="hr-section ann-panel">'
      +'<div class="hr-section-header"><div class="hr-section-title">Latest Updates'
        +(list.length?'<span class="ann-count">'+list.length+'</span>':'')+'</div></div>'
      +(list.length?annListHTML(list):annEmptyHTML())
    +'</div>';
}
function annRender(root){
  const scope=root||document;
  const host=scope.querySelector?scope.querySelector('#emp-ann-dash'):null;
  if(host)host.innerHTML=announcementsHTML();
}
