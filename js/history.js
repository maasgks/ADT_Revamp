/* ==========================================================================
   HISTORY TAB  -  field-level change history for every action sidebar.

   Logs say what HAPPENED to a record ("moved to Active, because..."). History
   says what CHANGED in it, field by field: who, when, which field, the value
   before and the value after.

   HOW CHANGES ARE CAUGHT. Rather than teach every save function to report
   what it changed, this file wraps them. Each wrapped save snapshots the
   record's plain fields before it runs and again once it has finished - a
   microtask later, so a save that keeps writing after its log is committed
   (an asset's holder after its status) is caught whole - and every field
   whose value differs becomes one history row. The wrapped saves are the
   panel edit forms, every module's status-from-Logs commit (lpCommitLog,
   which they all go through) and the employee lifecycle's.

   History is held against the record OBJECT (a WeakMap), so it needs no key
   per module and goes when the record does. Loaded last: it wraps functions
   the other files define.
   ========================================================================== */
(function(){
'use strict';

const HIST=new WeakMap();      // record -> [{by,time,field,old,val}], newest first
/* Not fields a person edits: collections, generated text, and stamps that
   every save moves anyway. */
const SKIP={logs:1,history:1,workflow:1,attachments:1,reqDocs:1,membersList:1,image:1,imageName:1,updatedAt:1,
  lastUpdated:1,id:1,keyId:1,commercial:1,emp:1,sales:1,notified:1,details:1};
const LABELS={empId:'Employee ID',dept:'Department',joinDate:'Joining Date',desc:'Description',contact:'Contact Number',
  countryOfOp:'Country of Operation',empType:'Employment Type',empName:'Name',dob:'Date of Birth',jobDesc:'Job Description',
  workPermit:'Work Permit',payAmount:'Pay Amount',payFrequency:'Pay Frequency',workSchedule:'Work Schedule',empDuration:'Employment Duration',
  assignedTo:'Assigned To',assignedOn:'Assigned On',branch:'Branch / Location',code:'Asset ID / Code',serial:'Barcode / Serial Number',
  purchaseDate:'Purchase Date',warrantyStart:'Warranty Start Date',warrantyEnd:'Warranty End Date',cost:'Purchase Cost',
  empConfirm:'Employee Confirmation',accessType:'Access Type',login:'Work Email / Login ID',provisionedBy:'Provisioned By',
  mfa:'MFA Enabled',effective:'Effective Date',expiry:'Expiry / Review Date',revokedOn:'Revoked On',
  teamId:'Team ID',item:'Requirement',model:'Employment Model',payrollBlocking:'Payroll Blocking',evidenceRequired:'Evidence Required',
  ruleName:'Rule Name',applicableTo:'Applicable To',valueRate:'Value / Rate',templateName:'Template Name',employmentType:'Employment Type',
  templateId:'Template ID',orderId:'Order ID',entityName:'Entity Name',addedFrom:'Added From',courseId:'Course ID',courseName:'Course Name',
  startFrom:'Start From',endTo:'End To',workingCountry:'Working Country',orderCategory:'Order Category',invoiceStatus:'Invoice Status',
  orderStatus:'Order Status',amountDue:'Amount Due',yearly:'Yearly Count',monthly:'Monthly Limit',carryForward:'Carry Forward Limit',
  probation:'During Probation',prorate:'Prorate',recurring:'Repeats Every Year',branches:'Applies To',dailyHours:'Daily Work Hours',
  latePolicy:'Late Policy',shiftType:'Shift Type',overtimeAllowed:'Overtime Allowed',geolocation:'Geolocation',startTime:'Start Time',
  endTime:'End Time',workingDays:'Working Days',weekOffDays:'Week Off Days',allocationFrequency:'Allocation Frequency',
  approvalLevel:'Leave Approval Level',level1Approver:'Level 1 Approver',level2Approver:'Level 2 Approver',
  countWeeklyOff:'Count Weekly Off as Leave',countHoliday:'Count Holiday as Leave',periodFrom:'Leave Period From',periodTo:'Leave Period To'};
function human(k){
  if(LABELS[k])return LABELS[k];
  return String(k).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,function(c){return c.toUpperCase();});
}
/* A record's plain fields: text, numbers, yes/no, and lists of those. */
function snap(rec){
  const out={};
  if(!rec||typeof rec!=='object')return out;
  Object.keys(rec).forEach(function(k){
    if(SKIP[k]||k.charAt(0)==='_')return;
    const v=rec[k];
    if(v===null||v===undefined||typeof v==='string'||typeof v==='number'||typeof v==='boolean')out[k]=v;
    else if(Array.isArray(v)&&v.every(function(x){return x===null||typeof x!=='object';}))out[k]=v.join(', ');
  });
  return out;
}
function show(v){
  if(v===true)return 'Yes';
  if(v===false)return 'No';
  if(v===null||v===undefined||v===''||v==='--')return '';
  // A stored yyyy-mm-dd reads the way the app writes dates (8 Oct 2026).
  if(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&typeof cdLabel==='function')return cdLabel(v)||v;
  return String(v);
}
function stamp(){const s=stampNow();return s.date+', '+s.time;}
function record(rec,before,after,labels){
  const rows=[],keys={};
  Object.keys(before).concat(Object.keys(after)).forEach(function(k){keys[k]=1;});
  Object.keys(keys).forEach(function(k){
    const a=show(before[k]),b=show(after[k]);
    if(a===b)return;
    rows.push({by:CURRENT_USER,time:stamp(),field:(labels&&labels[k])||human(k),old:a,val:b});
  });
  if(!rows.length)return;
  const list=HIST.get(rec)||[];
  HIST.set(rec,rows.concat(list));
}

/* Wrap a global save: rec(args) is the record it works on, read BEFORE it
   runs (a save may clear its own selection). opt.state(rec) reads the
   fields from somewhere else (settings kept in a draft); opt.labels(rec,args)
   names fields the record itself cannot (a listing row's columns). */
function watch(name,getRec,opt){
  opt=opt||{};
  const orig=window[name];if(typeof orig!=='function')return;
  window[name]=function(){
    const args=arguments;let rec=null,before=null,labels=null;
    try{rec=getRec.apply(null,args);
      if(rec&&typeof rec==='object'){
        seed(rec);     // the creation row first, while the record still has its old values
        before=snap(opt.state?opt.state(rec):rec);labels=opt.labels?opt.labels(rec,args):null;}}catch(e){rec=null;}
    const out=orig.apply(this,args);
    if(before)Promise.resolve().then(function(){
      try{record(rec,before,snap(opt.state?opt.state(rec):rec),labels);}catch(e){}
    });
    return out;
  };
}

/* The company panel's record is the entity row; its fields live in the
   Attendance / Leave settings drafts. One stable object per entity holds
   its history. */
const CS_RECS={};
window.csHistRec=function(id){return CS_RECS[id]||(CS_RECS[id]={id:id});};

/* The oldest row: the record being created, where the record knows when and
   by whom. Added once, the first time the tab is opened. */
function seed(rec){
  if(HIST.has(rec))return;
  const by=rec.createdBy,at=rec.createdAt||rec.createdTime;
  HIST.set(rec,by&&at?[{by:by,time:String(at).replace(' | ',', '),field:rec.status?'Status':'Record',old:'',val:rec.status||'Created'}]:[]);
}
const dash='<span class="sb-dash">&mdash;</span>';
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function cell(v,cls){return '<td'+(cls?' class="'+cls+'"':'')+(v?' title="'+esc(v)+'"':'')+'>'+(v?esc(v):dash)+'</td>';}

/* The History tab: the same table the Assets panel uses for its assignment
   history, one row per changed field, newest first. */
window.sbHistoryHTML=function(rec){
  if(!rec||typeof rec!=='object')return '<div class="lp-wf-empty">No history for this record.</div>';
  seed(rec);
  const rows=HIST.get(rec)||[];
  const head='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Change History</span>'
    +'<span class="ax-count">'+rows.length+' change'+(rows.length===1?'':'s')+'</span></div>';
  if(!rows.length)return head+'<div class="lp-wf-empty">No field has changed yet. Every edit to this record is listed here, field by field.</div>';
  return head+'<div class="sb-hist-wrap"><table class="ax-hist sb-hist"><thead><tr>'
    +'<th>S. No</th><th>Update By</th><th>Update Time</th><th>Field Name</th><th>Old Value</th><th>New Value</th></tr></thead><tbody>'
    +rows.map(function(r,i){
      return '<tr><td class="sb-hist-n">'+(i+1)+'</td>'+cell(r.by)+cell(r.time,'sb-hist-time')+'<td><b>'+esc(r.field)+'</b></td>'
        +cell(r.old,'sb-hist-old')+cell(r.val,'sb-hist-new')+'</tr>';
    }).join('')+'</tbody></table></div>';
};

// ── What is watched ──
watch('saveDeEdit',function(){return directEmpData.find(function(e){return e.id===deSelectedId;});});
watch('saveGeEdit',function(){return globalEmpData.find(function(e){return e.id===geSelectedId;});});
// The shared panel edit form (Teams, Payments, Contracts, Compliance, Rates & Rules, Templates, generic rows).
watch('sbSaveEdit',function(key){
  if(!sbEditing||sbEditing.key!==key)return null;
  return SB_EDITORS[key].get(sbEditing.id);
},{labels:function(rec){
  const key=sbEditing&&sbEditing.key;if(!key)return null;
  const out={};sbEditFields(key,rec).forEach(function(f){out[f.k]=f.label;});return out;
}});
watch('saveHdEdit',function(){return holidaysData.find(function(h){return h.id===hdSelectedId;});});
watch('saveLPSidebarEdit',function(){return leavePoliciesData.find(function(p){return p.id===lpSidebarPolicyId;});});
watch('submitAddAsset',function(){return astEditId?assetsData.find(function(a){return a.id===astEditId;}):null;});
watch('submitAddItAccess',function(){return itaEditId?itAccessData.find(function(r){return r.id===itaEditId;}):null;});
watch('astConfirmReceipt',function(id){return assetsData.find(function(a){return a.id===id;});});
// Every module's status move from Logs goes through lpCommitLog(rec, ...); its
// after-snapshot waits for the rest of that save (an asset's holder, say).
watch('lpCommitLog',function(rec){return rec;},{labels:function(rec){
  if(!Array.isArray(rec)||typeof lstSelectedPg==='undefined')return null;
  const out={};(getPageMeta(lstSelectedPg).columns||[]).forEach(function(c,i){out[i]=c;});return out;
}});
watch('empCommitLog',function(pk){return empPkRec(pk);});
// Company settings: the tabs keep their values in drafts; history goes on the entity.
watch('csAttSave',function(){return csHistRec(csSelectedItem);},{state:function(){return csAtt;}});
watch('cslSave',function(){return csHistRec(csSelectedItem);},{state:function(){return csLeave;}});
})();
