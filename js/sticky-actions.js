/* ==========================================================================
   STICKY ACTION COLUMN  -  the one line of state CSS cannot work out itself.

   css/quick-actions.css pins the last column of every listing table to the
   right edge of its card. That is entirely CSS and works with this file
   absent; nothing here is required for the buttons to be reachable.

   What CSS cannot express is WHETHER ANYTHING IS CURRENTLY HIDDEN behind that
   column, and that is the only thing the edge shadow should be answering. A
   shadow that is always on claims a depth that isn't there: on a table narrow
   enough not to scroll it is just a stray vertical line down one column, and
   on a table scrolled to its end there is genuinely nothing underneath. So
   this adds .sa-cut to a scrolling card for exactly as long as content
   remains to its right, and takes it off again the moment there isn't any.

   Scroll containers appear and disappear on every repaint (renderADTPage
   rewrites #adt-content wholesale), so rather than bind and unbind per card:
     - scroll is caught in the CAPTURE phase on document, since scroll events
       do not bubble. One listener, forever, for every card there will ever be.
     - a MutationObserver picks up new cards after a repaint. It watches
       childList only, and everything this file writes is a class - which a
       childList observer cannot see - so there is no feedback loop to close.
   ========================================================================== */
(function(){
'use strict';

/* Every horizontally scrolling surface that holds a listing table. .lp-split-main
   does not normally overflow (its card child is width:100%) but is listed so a
   page that ever puts a table straight into it behaves the same. */
var SCROLLERS='.lp-table-card,.listing-card,.at-card,.lp-split-main';

function sync(el){
  /* > 1 rather than > 0: sub-pixel layout widths round against us and would
     otherwise leave the shadow on at the far end of every scroll. */
  var hidden=el.scrollWidth-el.clientWidth-el.scrollLeft;
  el.classList.toggle('sa-cut',hidden>1);
}

function syncAll(){
  var root=document.getElementById('adt-content');
  if(!root)return;
  var els=root.querySelectorAll(SCROLLERS);
  for(var i=0;i<els.length;i++)sync(els[i]);
}

var queued=false;
function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(function(){queued=false;syncAll();});
}

/* The detail panel opens by animating .lp-split-sb from width:0 to 68% over
   280ms, which narrows the card under it the whole time - so the answer at
   the start of that transition is not the answer at the end. One more pass
   once it has landed. */
function settle(){schedule();setTimeout(syncAll,320);}

document.addEventListener('scroll',function(e){
  var el=e.target;
  if(el&&el.nodeType===1&&el.matches&&el.matches(SCROLLERS))sync(el);
},true);

window.addEventListener('resize',schedule);

function start(){
  var root=document.getElementById('adt-content');
  if(!root){setTimeout(start,50);return;}
  new MutationObserver(settle).observe(root,{childList:true,subtree:true});
  settle();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();

})();
