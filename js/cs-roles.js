/* ══ COMPANY SETTINGS · ROLES & ACCESS TAB ══════════════════════════════════
   Who holds which admin role in this entity. "+ Add Role" (and each row's
   Edit) opens one inline form above the table, the same way the RBAC
   Workspaces panel adds a team:

     Assign to   [ Client user | Opendhi staff ]
     Admin Role  (searchable)      Member Name (searchable)
                                         Cancel   Save

   The Assign-to strip decides which roles and which people are offered, so a
   client user can never be handed an Opendhi-only role and vice versa. */

const CS_ROLE_SETS={
  'Client user':['Entity Super Admin','HR Admin','Finance/Billing Admin','Manager','EOR Employee','Direct Employee'],
  'Opendhi staff':['Opendhi Super Admin','Global Account Manager','Global Sales Head']
};
/* What each role can reach - shown as the row's Access Scope. */
const CS_ROLE_SCOPE={
  'Opendhi Super Admin':'Every entity on the platform',
  'Global Account Manager':'Accounts and contracts of this entity',
  'Global Sales Head':'Sales orders and pricing',
  'Entity Super Admin':'Full access to this entity',
  'HR Admin':'People, leave, attendance, HR docs',
  'Finance/Billing Admin':'Payroll, payments, invoices',
  'Manager':'Their team\'s requests and timesheets',
  'EOR Employee':'Own profile, timesheet, leave',
  'Direct Employee':'Own profile, timesheet, leave'
};
const CS_ROLE_TONE={'Opendhi Super Admin':'ok','Entity Super Admin':'ok','Global Account Manager':'info','Global Sales Head':'info',
  'HR Admin':'info','Finance/Billing Admin':'info','Manager':'info','EOR Employee':'idle','Direct Employee':'idle'};
const CS_STAFF=[
  {name:'Pallavi Parate',email:'pallavi.parate@opendhi.com'},
  {name:'Shaun Varghese',email:'shaun.varghese@opendhi.com'},
  {name:'Neha Sharma',email:'neha.sharma@opendhi.com'},
  {name:'Aman Singh',email:'aman.singh@opendhi.com'}
];

let csRoles=[
  {id:1,kind:'Client user',role:'Entity Super Admin',user:'Shaun Test1',  email:'shaun@testemp.com',  added:'12 Apr 2026'},
  {id:2,kind:'Client user',role:'Direct Employee',   user:'Antar Testemp',email:'antar@testemp.com',  added:'18 Apr 2026'},
  {id:3,kind:'Client user',role:'Direct Employee',   user:'Shaun J',      email:'shaun.j@testemp.com',added:'22 Apr 2026'},
  {id:4,kind:'Client user',role:'Direct Employee',   user:'Default Name', email:'default@testemp.com',added:'30 Apr 2026'}
];
let csRoleNext=5;
let csRoleForm=null;   // null, or {id: null for add / row id for edit, kind, role, user}

function csRolePeople(kind){
  if(kind==='Opendhi staff')return CS_STAFF.map(function(s){return s.name;});
  return typeof axEmpNames==='function'?axEmpNames():[];
}
function csRoleEmail(kind,name){
  if(kind==='Opendhi staff'){const s=CS_STAFF.find(function(x){return x.name===name;});return s?s.email:'';}
  return name.toLowerCase().replace(/[^a-z]+/g,'.').replace(/^\.|\.$/g,'')+'@opendhi-client.com';
}
function csRoleToday(){
  return new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
}
/* The last Entity Super Admin cannot be removed - the entity would be left
   with nobody who can manage it. */
function csRoleIsLastSuper(r){
  return r.role==='Entity Super Admin'&&csRoles.filter(function(x){return x.role==='Entity Super Admin';}).length<=1;
}

function csRoleOpen(id){
  const r=id!=null?csRoles.find(function(x){return x.id===id;}):null;
  csRoleForm=r?{id:r.id,kind:r.kind,role:r.role,user:r.user}:{id:null,kind:'Client user',role:'',user:''};
  refreshCsSidebar();
}
function csRoleClose(){csRoleForm=null;refreshCsSidebar();}
/* Switching who it is for empties the role and member: neither list carries over. */
function csRoleKind(kind){
  if(!csRoleForm||csRoleForm.kind===kind)return;
  csRoleForm.kind=kind;csRoleForm.role='';csRoleForm.user='';
  refreshCsSidebar();
}

function csRoleFormHTML(){
  const f=csRoleForm,edit=f.id!=null;
  const seg='<div class="segmented is-compact csr-seg">'
    +['Client user','Opendhi staff'].map(function(k){
      return '<button type="button" class="seg-btn'+(f.kind===k?' active':'')+'" onclick="csRoleKind(\''+k+'\')">'+k+'</button>';
    }).join('')+'</div>';
  return '<div class="csr-add">'
    +'<div class="csr-add-hd"><span class="lp-sb-section-title">'+(edit?'Edit Role':'Add Role')+'</span></div>'
    +'<div class="ep-form-group csr-kind"><label class="ep-form-label">Assign to</label>'+seg
      +'<div class="ea-hint">'+(f.kind==='Opendhi staff'
        ?'An Opendhi team member who works on this entity\'s account.'
        :'Someone from this entity - an admin or an employee.')+'</div></div>'
    +'<div class="ep-form-grid">'
      +'<div class="ep-form-group"><label class="ep-form-label">Admin Role <span class="req">*</span></label>'
        +axCS('csr-role',CS_ROLE_SETS[f.kind],f.role,'Select Role')+'</div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Member Name <span class="req">*</span></label>'
        +axCS('csr-user',(function(){   // the current holder is always offered, so Edit shows them
          const p=csRolePeople(f.kind);return f.user&&p.indexOf(f.user)<0?[f.user].concat(p):p;})(),f.user,'Select Member')+'</div>'
    +'</div>'
    +'<div class="lp-sb-form-actions"><button class="ep-cancel-btn" onclick="csRoleClose()">Cancel</button>'
    +'<button class="ep-save-btn" onclick="csRoleSave()">'+(edit?'Save changes':'Save')+'</button></div>'
  +'</div>';
}

function csRoleSave(){
  const f=csRoleForm;if(!f)return;
  const role=getCSValue('csr-role'),user=getCSValue('csr-user');
  if(!role){showToast('Admin Role is required','error');return;}
  if(!user){showToast('Member Name is required','error');return;}
  if(csRoles.some(function(r){return r.id!==f.id&&r.user===user&&r.role===role;})){
    showToast(user+' already has this role','error');return;}
  if(f.id!=null){
    const r=csRoles.find(function(x){return x.id===f.id;});if(!r)return;
    if(csRoleIsLastSuper(r)&&role!=='Entity Super Admin'){
      showToast('Keep one Entity Super Admin','error','Give the role to someone else first, then change '+r.user+'.');return;}
    const was=r.role;
    const email=user===r.user?r.email:(csRoleEmail(f.kind,user)||r.email);   // same person keeps their address
    Object.assign(r,{kind:f.kind,role:role,user:user,email:email});
    csRoleForm=null;refreshCsSidebar();
    showToast('Role updated','success',user+(was!==role?': '+was+' → '+role:' · '+role));
    return;
  }
  csRoles.push({id:csRoleNext++,kind:f.kind,role:role,user:user,email:csRoleEmail(f.kind,user),added:csRoleToday()});
  csRoleForm=null;refreshCsSidebar();
  showToast('Role added','success',user+' is now '+role+'.');
}
function csRoleRemove(id){
  const r=csRoles.find(function(x){return x.id===id;});if(!r)return;
  if(csRoleIsLastSuper(r)){showToast('Keep one Entity Super Admin','error');return;}
  csRoles=csRoles.filter(function(x){return x.id!==id;});
  if(csRoleForm&&csRoleForm.id===id)csRoleForm=null;
  refreshCsSidebar();
  showToast('Role removed','success',r.user+' no longer has '+r.role+'.');
}

function csRolesTabHTML(){
  const editSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  const binSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
  const plusSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  const initials=function(n){return n.split(/\s+/).map(function(w){return w[0];}).slice(0,2).join('').toUpperCase();};
  return (csRoleForm?csRoleFormHTML()
      :'<div class="att-bar csag-bar"><div class="att-bar-actions"><button class="att-link" onclick="csRoleOpen()">'+plusSvg+'Add Role</button></div></div>')
    +'<div class="att-table-wrap csag-table-wrap"><table class="att-table csag-table"><thead><tr>'
      +'<th>Sr. No</th><th>User</th><th>Role</th><th>Access Scope</th><th>Added On</th><th class="csag-act">Action</th>'
    +'</tr></thead><tbody>'
    +csRoles.map(function(r,i){
      return '<tr'+(csRoleForm&&csRoleForm.id===r.id?' class="csr-editing"':'')+'>'
        +'<td class="csag-td csag-num">'+(i+1)+'</td>'
        +'<td class="csag-td"><div class="csag-file">'
          +'<span class="cs-role-av">'+initials(r.user)+'</span>'
          +'<div class="csag-file-txt"><div class="lp-c-main">'+sbEsc(r.user)+'</div>'
          +'<div class="lp-c-sub">'+sbEsc(r.email)+(r.kind==='Opendhi staff'?' · Opendhi staff':'')+'</div></div></div></td>'
        +'<td class="csag-td"><span class="lp-status-badge tone-'+(CS_ROLE_TONE[r.role]||'info')+'">'+sbEsc(r.role)+'</span></td>'
        +'<td class="csag-td cs-role-scope">'+sbEsc(CS_ROLE_SCOPE[r.role]||'')+'</td>'
        +'<td class="csag-td">'+sbEsc(r.added)+'</td>'
        +'<td class="csag-td csag-act">'
          +'<button class="att-row-btn" title="Edit role" onclick="csRoleOpen('+r.id+')">'+editSvg+'</button>'
          +(csRoleIsLastSuper(r)?''   /* the last super admin cannot be removed, so no button promises it */
            :'<button class="att-row-btn is-danger" title="Remove role" onclick="csRoleRemove('+r.id+')">'+binSvg+'</button>')
        +'</td></tr>';
    }).join('')
    +'</tbody></table></div>';
}
