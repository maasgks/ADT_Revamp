
// ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ STATE ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬
let view='adt',mode='agent',page='dashboard',agent='contractor',adtSidebarCollapsed=false,agentSidebarCollapsed=true,notifOpen=false,notifShowUnread=true,agentMsgs=[{role:'bot',text:"Hi John! I'm your ADT Agent. What would you like to do today?"}],formStep=-1,returnToReview=false,cw=360,selectedAIJourneyId='contract-creation',aiEventDrawerIdx=-1;
let aiContractPrefill=null,aiAssistedFlow=false,aiCtNotFoundOpen=false,aiProposalDraft=null,aiCtChatMsgs=[],aiWizardFormData={},aiCreatedContractId=null;
const aiDealManager={name:'Karan Mehta',role:'Deal Manager',initials:'KM'};
const aiOpsManager={name:'Priya Nair',role:'Ops Manager',initials:'PN'};
let aiCtAnimatedStage=-1,aiCtPendingEmpType='',aiCtJourneyEmployee=null;
const aiPayrollManager={name:'Meera Iyer',role:'Finance Approver',initials:'MI'};
let aiPayrollAnimatedStage=-1,aiPayrollData={};
let selectedAIRunId='RUN-2001';
let aiJourneyDetailSelectedStage=-1;
const aiAutomationRuns={
  'contract-creation':[
    {runId:'RUN-2001',client:'Rashi Singh',country:'Netherlands',contractType:'EOR',currentStepIdx:2,status:'Waiting for Approval',lastActivity:'3 hours ago'},
    {runId:'RUN-2002',client:'Rajdeep Singh',country:'Netherlands',contractType:'EOR',currentStepIdx:4,status:'Exception',lastActivity:'1 hour ago',exceptionNote:'Signed document could not be verified against the approved contract terms.'},
    {runId:'RUN-2003',client:'Emma Schmidt',country:'Germany',contractType:'EOR',currentStepIdx:6,status:'Completed',lastActivity:'2 days ago'}
  ],
  'payroll-creation':[
    {runId:'RUN-3001',client:'Testemp Antar',country:'India',contractType:'Direct Employee',currentStepIdx:3,status:'Waiting for Approval',lastActivity:'4 hours ago'},
    {runId:'RUN-3002',client:'Anika Shah',country:'India',contractType:'Direct Employee',currentStepIdx:2,status:'Exception',lastActivity:'45 minutes ago',exceptionNote:'Statutory rate mismatch detected during salary calculation — needs Finance review.'},
    {runId:'RUN-3003',client:'Pallavi Parate',country:'India',contractType:'Direct Employee',currentStepIdx:1,status:'Active',lastActivity:'20 minutes ago'}
  ],
  'h2r-lifecycle':[
    {runId:'RUN-4001',client:'Sofia Romano',country:'Italy',contractType:'Contractor',currentStepIdx:3,status:'Waiting for Approval',lastActivity:'6 hours ago'},
    {runId:'RUN-4002',client:'Lucas Dubois',country:'France',contractType:'EOR',currentStepIdx:1,status:'Exception',lastActivity:'2 hours ago',exceptionNote:'Compliance Hub could not return statutory requirements for France — missing country configuration.'},
    {runId:'RUN-4003',client:'James Wilson',country:'United Kingdom',contractType:'EOR',currentStepIdx:4,status:'Completed',lastActivity:'3 days ago'}
  ]
};

let openDropdowns=new Set();
let activeSidebarItem='dashboard';
const sidebarItems=[
  {id:'dashboard',label:'Dashboard',color:'orange',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'},
  {dropdown:'Employee',color:'blue',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',children:[
    {id:'direct',label:'Direct Employee',color:'blue',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},
    {id:'global',label:'Global Employee',color:'blue',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'}
  ]},
  {id:'teams',label:'Teams',color:'purple',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},
  {dropdown:'Workforce Operations',color:'teal',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',children:[
    {id:'contracts',label:'Contracts',color:'teal',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>'},
    {id:'my-timesheet',label:'My Timesheet',color:'teal',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'},
    {id:'all-timesheet',label:'All Timesheet',color:'teal',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>'},
    {id:'payheads',label:'Payheads',color:'teal',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/></svg>'},
    {id:'payroll',label:'Payroll',color:'teal',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'}
  ]},
  {dropdown:'Leaves',color:'green',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>',children:[
    {id:'all-leaves',label:'All Leaves',color:'green',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>'},
    {id:'leave-policies',label:'Leave Policies',color:'green',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>'}
  ]},
  {dropdown:'Finance',color:'green',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M6 15h2"/><path d="M12 15h4"/></svg>',children:[
    {id:'payments',label:'Payments',color:'green',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M6 15h2"/></svg>'}
  ]},
  {dropdown:'Compliance Hub',color:'amber',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',children:[
    {id:'compliance',label:'Compliance Items',color:'amber',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>'},
    {id:'rates-rules',label:'Rates & Rules',color:'amber',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>'},
    {id:'contract-templates',label:'Contract Templates',color:'amber',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>'}
  ]},
  {dropdown:'Support',color:'indigo',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>',children:[
    {id:'chats',label:'Chats',color:'indigo',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 10h8"/><path d="M8 14h5"/></svg>'},
    {id:'support-tickets',label:'Tickets',color:'indigo',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3z"/><path d="M13 5v14"/></svg>'}
  ]},
  {id:'all-users',label:'All Users',color:'slate',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>'},
  {id:'settings',label:'Company Settings',color:'slate',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'}
];


function getSidebarItems(){return sidebarItems;}

const ctxMap={dashboard:'You\'re on the <b>Dashboard</b>. I can help you understand metrics, navigate sections, or start any workflow.',people:'You\'re viewing <b>People</b>. I can help search employees, filter by country, or explain statuses.',contracts:'You\'re on <b>Contracts</b>. I can help create, review, or modify contracts.',payroll:'You\'re viewing <b>Payroll</b>. I can help with salary calculations or running payroll.',compliance:'You\'re on the <b>Compliance Hub</b>. I can check requirements for specific countries.',settings:'You\'re in <b>Company Settings</b>. I can help configure account or manage permissions.',teams:'You\'re viewing <b>Teams</b>. I can help manage team structures.',leaves:'You\'re on <b>Leaves</b>. I can help with leave policies and applications.',payments:'You\'re viewing <b>Payments</b>. I can help track invoices and payment history.',support:'You\'re on <b>Support</b>. I\'m here to help with any questions.'};

const sidebarToggleSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="5" width="16" height="14" rx="2"/><line x1="15" y1="5" x2="15" y2="19"/></svg>';
const chevronSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="6 9 12 15 18 9"/></svg>';
const rowActionSvg='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';
const supportPageMeta={
  dashboard:{title:'Dashboard',context:'Dashboard',filters:['Country','Team','Status'],columns:['S. No','Metric','Scope','Value','Trend','Status'],rows:[[1,'Headcount','All entities','247','+12 this month','Active'],[2,'Active Teams','6 countries','18','Stable','Active'],[3,'Open Tasks','Operations','24','Needs review','Pending'],[4,'Invoices','Finance','10','Generated','Active'],[5,'Compliance Checks','Global','14','3 due soon','Pending'],[6,'Contracts','Workforce','25','15 drafts','Active']]},
  people:{title:'People',context:'People',filters:['Country','Worker Type','Status'],columns:['S. No','Name','Country','Worker Type','Team','Status'],rows:[[1,'Anika Shah','Netherlands','EOR','Engineering','Active'],[2,'Rahul Mehta','India','Contractor','Product','Active'],[3,'Maya Vos','Netherlands','PEO','Finance','Inactive'],[4,'Luis Martin','Spain','EOR','Sales','Active'],[5,'Nora Kim','Germany','Contractor','Design','Pending'],[6,'Owen Clark','United Kingdom','EOR','Operations','Active']]},
  teams:{title:'Teams',context:'Teams',filters:['Country','Department','Status'],columns:['S. No','Team','Department','Country','Members','Status'],rows:[[1,'Core Payroll','Finance','Netherlands','18','Active'],[2,'People Ops','HR','India','12','Active'],[3,'Compliance Desk','Legal','Germany','7','Active'],[4,'Entity Setup','Operations','Spain','9','Pending'],[5,'Customer Success','Support','United Kingdom','21','Active'],[6,'Local Admin','Admin','Netherlands','4','Inactive']]},
  contracts:{title:'Contracts',context:'Contracts',filters:['Country','Type','Status'],columns:['S. No','Contract Name','Country','Worker Type','Start Date','Status'],rows:[[1,'Netherlands EOR - Anika','Netherlands','EOR','12 May 2026','Active'],[2,'India Contractor - Rahul','India','Contractor','18 Apr 2026','Active'],[3,'Germany PEO - Nora','Germany','PEO','Pending','Pending'],[4,'Spain EOR - Luis','Spain','EOR','01 May 2026','Active'],[5,'UK EOR - Owen','United Kingdom','EOR','15 Mar 2026','Active'],[6,'Netherlands PEO - Maya','Netherlands','PEO','Expired','Inactive']]},
  leaves:{title:'Leaves',context:'Leaves',filters:['Country','Leave Type','Status'],columns:['S. No','Employee','Country','Leave Type','Dates','Status'],rows:[[1,'Anika Shah','Netherlands','Annual Leave','20-24 May','Active'],[2,'Rahul Mehta','India','Sick Leave','09 May','Pending'],[3,'Luis Martin','Spain','Parental Leave','Jun-Jul','Active'],[4,'Nora Kim','Germany','Annual Leave','14-18 May','Pending'],[5,'Owen Clark','United Kingdom','Holiday','27 May','Active'],[6,'Maya Vos','Netherlands','Sick Leave','Closed','Inactive']]},
  payroll:{title:'Payroll',context:'Payroll',filters:['Country','Cycle','Status'],columns:['S. No','Cycle','Country','Employees','Gross Pay','Status'],rows:[[1,'May 2026','Netherlands','41','EUR 184,200','Active'],[2,'May 2026','India','83','INR 9,840,000','Pending'],[3,'April 2026','Germany','19','EUR 92,450','Active'],[4,'April 2026','Spain','22','EUR 78,110','Active'],[5,'March 2026','United Kingdom','28','GBP 116,700','Active'],[6,'March 2026','Netherlands','39','EUR 176,900','Inactive']]},
  payments:{title:'Payments',context:'Payments',filters:['Country','Category','Status'],columns:['S. No','Invoice','Country','Category','Amount','Status'],rows:[[1,'INV-2048','Netherlands','Payroll','EUR 184,200','Active'],[2,'INV-2047','India','Contractor','INR 2,410,000','Pending'],[3,'INV-2046','Germany','Compliance','EUR 4,250','Active'],[4,'INV-2045','Spain','Payroll','EUR 78,110','Active'],[5,'INV-2044','United Kingdom','Benefits','GBP 8,720','Inactive'],[6,'INV-2043','Netherlands','Entity Setup','EUR 12,600','Active']]},
  settings:{title:'Company Settings',context:'Company Settings',filters:['Area','Owner','Status'],columns:['S. No','Setting','Area','Owner','Updated','Status'],rows:[[1,'Entity Profile','Company','Pallavi Parate','Today','Active'],[2,'Bank Details','Finance','Finance Ops','Yesterday','Pending'],[3,'Permissions','Access','Admin','06 May 2026','Active'],[4,'Notifications','Workspace','People Ops','02 May 2026','Active'],[5,'Billing Contacts','Finance','Admin','29 Apr 2026','Inactive'],[6,'Audit Logs','Security','System','Live','Active']]},
  support:{title:'Support',context:'Support',filters:['Topic','Priority','Status'],columns:['S. No','Ticket','Topic','Owner','Updated','Status'],rows:[[1,'SUP-1018','Payroll question','ADT Support','Today','Active'],[2,'SUP-1017','Contract review','Legal Desk','Yesterday','Pending'],[3,'SUP-1016','Compliance rates','Compliance Desk','06 May 2026','Active'],[4,'SUP-1015','Payment proof','Finance Ops','04 May 2026','Active'],[5,'SUP-1014','Account access','Admin','Closed','Inactive'],[6,'SUP-1013','Entity setup','Operations','01 May 2026','Active']]},
  'all-leaves':{title:'All Leaves',context:'All Leaves',filters:['Leave Type','Status'],columns:['S.No','Key Id','Full Name','Leave Hours','From Date','To Date','Status'],rows:[
    [1,'2014','Shaun J','Full Day','14-04-2026','16-04-2026','Approved'],
    [2,'2019','Pallavi P','Half Day','18-04-2026','18-04-2026','Pending'],
    [3,'2021','Anika Shah','Full Day','20-04-2026','22-04-2026','Approved'],
    [4,'2025','Rahul Mehta','Full Day','25-04-2026','27-04-2026','Unapproved'],
    [5,'2031','Nora Kim','Half Day','28-04-2026','28-04-2026','Pending'],
    [6,'2033','Luis Martin','Full Day','02-05-2026','04-05-2026','Approved']
  ]}
};

function getPageMeta(pg){if(pg==='cfg-overview')return{title:'Overview',context:'Configure',filters:[],columns:[],rows:[]};if(pg==='cfg-systems')return{title:'Systems',context:'Configure',filters:[],columns:[],rows:[]};if(pg==='cfg-system-detail'){const s=cfgSystems.find(x=>x.id===selectedCfgSystemId);return{title:s?s.name:'System',context:'Configure',filters:[],columns:[],rows:[]};}if(pg==='cfg-system-add')return{title:'Add Custom System',context:'Configure',filters:[],columns:[],rows:[]};if(pg==='cfg-data-foundation')return{title:'Data Foundation',context:'Configure',filters:[],columns:[],rows:[]};if(pg==='cfg-model-detail'){const m=cfgModels.find(x=>x.id===selectedCfgModelId);return{title:m?m.name:'Model',context:'Configure',filters:[],columns:[],rows:[]};}if(pg==='cfg-model-add')return{title:'New Model',context:'Configure',filters:[],columns:[],rows:[]};if(pg==='cfg-context-journey')return{title:'Context & Journey',context:'Configure',filters:[],columns:[],rows:[]};if(pg==='cfg-journey-detail'){const j=cfgJourneys.find(x=>x.id===selectedCfgJourneyId);return{title:j?j.name:'Journey',context:'Configure',filters:[],columns:[],rows:[]};}if(pg==='cfg-agents')return{title:'Agents',context:'Configure',filters:[],columns:[],rows:[]};if(pg==='ai-executive')return{title:'AI Executive',context:'AI Executive',filters:[],columns:[],rows:[]};if(pg==='ai-journey-detail'){const j=aiJourneys.find(x=>x.id===selectedAIJourneyId);return{title:j?j.name:'Journey Detail',context:'AI Executive',filters:[],columns:[],rows:[]};}if(pg==='ai-automate-form'){const j=aiJourneys.find(x=>x.id===selectedAIJourneyId);return{title:'Automate Journey',context:j?j.name:'AI Executive',filters:[],columns:[],rows:[]};}if(pg==='ai-contract-assistant')return{title:'AI Contract Assistant',context:'Contracts',filters:[],columns:[],rows:[]};if(pg==='ai-proposal-created')return{title:'Proposal Created',context:'Contracts',filters:[],columns:[],rows:[]};if(pg==='ai-proposal-waiting-approval')return{title:'Waiting for Approval',context:'Contracts',filters:[],columns:[],rows:[]};if(pg==='contract-eor'||pg==='contract-peo'||pg==='contract-type-select')return{title:'Create a Contract',context:'Contracts',filters:[],columns:[],rows:[]};if(pg==='ai-employee-created')return{title:'Employee Created',context:'Contracts',filters:[],columns:[],rows:[]};if(pg==='ai-contract-document')return{title:'Contract Document',context:'Contracts',filters:[],columns:[],rows:[]};if(pg==='ai-contract-waiting-approval')return{title:'Waiting for Approval',context:'Contracts',filters:[],columns:[],rows:[]};if(pg==='ai-onboarding-run')return{title:'Onboarding',context:'Contracts',filters:[],columns:[],rows:[]};if(pg==='ai-journey-complete')return{title:'Journey Complete',context:'Contracts',filters:[],columns:[],rows:[]};if(pg==='ai-active-automation'){const j=aiJourneys.find(x=>x.id===selectedAIJourneyId);return{title:j?j.name+' Automation':'Active Automation',context:'AI Executive',filters:[],columns:[],rows:[]};}if(pg==='ai-run-detail')return{title:'Run '+selectedAIRunId,context:'AI Executive',filters:[],columns:[],rows:[]};if(pg==='ai-journey-run'){const flow=aiRunFlows[aiRunFlowJourneyId];return{title:flow?flow.entryLabel:'AI Executive',context:'AI Executive',filters:[],columns:[],rows:[]};}if(pg==='cost-calculator')return{title:'Cost Calculator',context:'Cost Calculator',filters:[],columns:[],rows:[]};if(pg==='leave-policies')return{title:'Leave Policies',context:'Leave Policies',filters:[],columns:[],rows:[]};if(pg==='leave-policy-edit')return{title:'Edit Leave Policy',context:'Leave Policy',filters:[],columns:[],rows:[]};if(pg==='leave-policy-add')return{title:'Add Leave Policy',context:'Leave Policy',filters:[],columns:[],rows:[]};if(pg==='team-add')return{title:'Create New Team',context:'Teams',filters:[],columns:[],rows:[]};if(pg==='direct')return{title:'Direct Employee',context:'Direct Employee',filters:[],columns:[],rows:[]};if(pg==='global')return{title:'Global Employee',context:'Global Employee',filters:[],columns:[],rows:[]};if(pg==='my-timesheet')return{title:'My Timesheet',context:'My Timesheet',filters:[],columns:[],rows:[]};if(pg==='all-timesheet')return{title:'All Timesheet',context:'All Timesheet',filters:[],columns:[],rows:[]};if(pg==='my-profile')return{title:'My Profile',context:'My Profile',filters:[],columns:[],rows:[]};if(pg==='support-tickets')return{title:'Tickets',context:'Tickets',filters:[],columns:[],rows:[]};if(pg==='chats')return{title:'Chats',context:'Chats',filters:[],columns:[],rows:[]};if(pg==='switch-entity')return{title:'Switch Entity',context:'Switch Entity',filters:[],columns:[],rows:[]};if(pg==='compliance')return{title:'Compliance Items',context:'Compliance Items',filters:[],columns:[],rows:[]};if(pg==='rates-rules')return{title:'Rates & Rules',context:'Rates & Rules',filters:[],columns:[],rows:[]};if(pg==='contract-templates')return{title:'Contract Templates',context:'Contract Templates',filters:[],columns:[],rows:[]};return supportPageMeta[pg]||supportPageMeta.dashboard;}
function getPageTitle(pg){return getPageMeta(pg).title;}
function statusClass(v){return String(v).toLowerCase().replace(/[^a-z0-9]+/g,'-');}
function titleForAdd(pg){return pg==='dashboard'?'Dashboard':getPageTitle(pg);}
function getSidebarActivePage(pg){if(pg==='cfg-journey-detail')return 'cfg-context-journey';if(pg==='cfg-system-detail'||pg==='cfg-system-add')return 'cfg-systems';if(pg==='cfg-model-detail'||pg==='cfg-model-add')return 'cfg-data-foundation';if(pg==='team-add')return 'teams';if(pg==='leave-policy-add'||pg==='leave-policy-edit')return 'leave-policies';if(pg==='ai-journey-detail'||pg==='ai-automate-form'||pg==='ai-active-automation'||pg==='ai-run-detail'||pg==='ai-journey-run')return 'ai-executive';if(pg==='ai-contract-assistant'||pg==='ai-proposal-created'||pg==='ai-proposal-waiting-approval'||pg==='contract-type-select'||pg==='contract-eor'||pg==='contract-peo'||pg==='ai-employee-created'||pg==='ai-contract-document'||pg==='ai-contract-waiting-approval'||pg==='ai-onboarding-run'||pg==='ai-journey-complete')return 'contracts';return pg;}

function attrSafe(v){return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;');}
function customSelect(id,selected,options,placeholder,variant){
  const safeId=String(id).replace(/[^a-zA-Z0-9_-]/g,'-');
  const opts=(options||[]).map(o=>String(o));
  const current=selected||placeholder||opts[0]||'Select';
  const optHtml=opts.map(o=>`<button type="button" class="custom-select-option ${o===current?'selected':''}" data-value="${attrSafe(o)}" onclick="selectCustomOption(event,this)"><span class="custom-select-text">${o}</span><span class="custom-select-check">&#10003;</span></button>`).join('');
  const muted=current===(placeholder||'');
  return `<div class="custom-select ${variant||''}" id="${safeId}" data-value="${attrSafe(current)}"><button type="button" class="custom-select-trigger" onclick="toggleCustomSelect(event,'${safeId}')"><span class="${muted?'placeholder':''}">${current}</span><svg class="custom-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="6 9 12 15 18 9"/></svg></button><div class="custom-select-menu">${optHtml}</div></div>`;
}
function closeCustomSelects(exceptId){document.querySelectorAll('.custom-select.open').forEach(s=>{if(!exceptId||s.id!==exceptId)s.classList.remove('open');});}
function toggleCustomSelect(event,id){
  event.stopPropagation();
  const root=document.getElementById(id);if(!root)return;
  const open=root.classList.contains('open');
  closeCustomSelects(id);
  root.classList.toggle('open',!open);
  if(!open){
    const trigger=root.querySelector('.custom-select-trigger');
    const menu=root.querySelector('.custom-select-menu');
    if(trigger&&menu){
      const r=trigger.getBoundingClientRect();
      const menuH=Math.min(280,menu.scrollHeight||280);
      const spaceBelow=window.innerHeight-r.bottom-8;
      menu.style.left=r.left+'px';
      menu.style.width=r.width+'px';
      if(spaceBelow>=menuH||spaceBelow>=window.innerHeight-r.top-8){
        menu.style.top=(r.bottom+8)+'px';
        menu.style.bottom='auto';
      }else{
        menu.style.bottom=(window.innerHeight-r.top+8)+'px';
        menu.style.top='auto';
      }
    }
  }
}
function selectCustomOption(event,opt){event.stopPropagation();const root=opt.closest('.custom-select');if(!root)return;const label=opt.querySelector('.custom-select-text');const trigger=root.querySelector('.custom-select-trigger span');root.dataset.value=label?label.textContent.trim():opt.textContent.trim();if(trigger&&label){trigger.innerHTML=label.innerHTML;trigger.classList.remove('placeholder');}root.querySelectorAll('.custom-select-option').forEach(o=>o.classList.remove('selected'));opt.classList.add('selected');root.classList.remove('open');}
function getCustomSelectValue(id){const root=document.getElementById(id);if(!root)return'';const span=root.querySelector('.custom-select-trigger span');if(span&&span.classList.contains('placeholder'))return'';return root.dataset.value||'';}
document.addEventListener('click',e=>{if(!e.target.closest('.custom-select'))closeCustomSelects();if(!e.target.closest('.cs-wrap')){document.querySelectorAll('.cs-dropdown.cs-open').forEach(d=>{d.classList.remove('cs-open');const t=d.previousElementSibling;if(t)t.classList.remove('cs-open');});}if(!e.target.closest('.ct-action-wrap'))document.querySelectorAll('.ct-action-menu.open').forEach(m=>m.classList.remove('open'));if(!e.target.closest('.se-dd-wrap')){const p=document.getElementById('se-dd-panel');if(p)p.classList.remove('open');}});
const filterOptionMap={Country:['Country','Netherlands','India','Germany','Spain','United Kingdom'],Status:['Status','Active','Pending','Inactive'],Team:['Team','Engineering','Product','Finance','Operations'],Department:['Department','Finance','HR','Legal','Operations','Support'],Area:['Area','Company','Finance','Access','Workspace','Security'],Owner:['Owner','Pallavi Parate','Finance Ops','Admin','System'],Topic:['Topic','Payroll question','Contract review','Compliance rates','Payment proof'],Priority:['Priority','High','Medium','Low'],Category:['Category','Payroll','Contractor','Compliance','Benefits'],Cycle:['Cycle','May 2026','April 2026','March 2026'],Type:['Type','EOR','PEO','Contractor'],'Worker Type':['Worker Type','EOR','PEO','Contractor'],'Leave Type':['Leave Type','Annual Leave','Sick Leave','Parental Leave','Holiday']};
function getFilterOptions(label){return filterOptionMap[label]||[label,'All','Active','Pending','Inactive'];}
function isCreateContractRequest(text){const q=String(text).toLowerCase();return q.includes('create')&&q.includes('contract');}
function isNetherlandsContractRequest(text){
  const q=String(text).toLowerCase();
  // Explicit: "create contract in netherlands"
  if(isCreateContractRequest(q)&&q.includes('netherland'))return true;
  // Shorthand: "create in netherlands", "create netherlands", "netherlands contract"
  if((q.includes('create')||q.includes('make')||q.includes('start')||q.includes('open')||q.includes('setup')||q.includes('set up')||q.includes('new'))&&q.includes('netherland'))return true;
  // Affirmative after suggestion: "yes netherlands", "ok netherlands", "proceed netherlands", "netherlands please", "netherlands" alone, "yes proceed", "proceed"
  if(q.includes('netherland'))return true;
  return false;
}
function showWorkspaceEmpty(){
  const col=document.getElementById('form-col');if(!col)return;
  col.style.display='flex';
  col.innerHTML=`<div class="workspace-empty"><div class="workspace-empty-inner"><svg class="workspace-mural" viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="4" fill="#6b7280"/><circle cx="57" cy="82" r="3" fill="#9ca3af"/><circle cx="126" cy="71" r="3" fill="#9ca3af"/><circle cx="139" cy="101" r="2" fill="#c3c8d1"/><circle cx="72" cy="134" r="2" fill="#c3c8d1"/><path d="M45 94c0-28 18-51 45-56" stroke="#d4d8df" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="26 18"/><path d="M133 126c-16 19-45 25-68 12" stroke="#d4d8df" stroke-width="1.5" stroke-linecap="round"/><path d="M118 49c23 10 38 32 38 58" stroke="#d4d8df" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="22 16"/><path d="M70 66c18-12 43-8 56 10" stroke="#c5cad3" stroke-width="1.5" stroke-linecap="round"/><path d="M118 117c-16 15-42 15-58 0" stroke="#c5cad3" stroke-width="1.5" stroke-linecap="round"/><circle cx="90" cy="90" r="36" stroke="#dde1e7" stroke-width="1.5"/><circle cx="90" cy="90" r="20" stroke="#cbd1db" stroke-width="1.5" stroke-dasharray="20 14"/><path d="M90 77l4 9 9 4-9 4-4 9-4-9-9-4 9-4 4-9z" stroke="#8d95a3" stroke-width="1.6" stroke-linejoin="round"/><path d="M83 100l14-20" stroke="#b5bbc6" stroke-width="1.3" stroke-linecap="round"/></svg><div class="workspace-title">Your workspace will appear here</div><div class="workspace-copy">As you chat, I'll show relevant data, templates and previews on this side.</div></div></div>`;
  const chatCol=document.getElementById('agent-chat-col');if(chatCol)chatCol.style.flex='0 0 380px';
}
function startNetherlandsContract(){returnToReview=false;formStep=0;const chatCol=document.getElementById('agent-chat-col');if(chatCol)chatCol.style.flex='0 0 380px';buildForm(0);}
function ensureAgentModuleContent(){
  let el=document.getElementById('agent-module-content');
  if(!el){
    el=document.createElement('div');
    el.id='agent-module-content';
    el.className='agent-module-content';
    const area=document.querySelector('#v-agent-active .content-area');
    if(area)area.appendChild(el);
  }
  return el;
}
function getAgentWorkspaceButton(){
  let btn=document.getElementById('agent-workspace-btn');
  if(!btn){
    btn=document.createElement('button');
    btn.id='agent-workspace-btn';
    btn.className='agent-workspace-btn';
    btn.title='Back to Agent workspace';
    btn.setAttribute('aria-label','Back to Agent workspace');
    btn.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>';
    btn.onclick=restoreAgentWorkspace;
    document.body.appendChild(btn);
  }
  return btn;
}
function setAgentWorkspaceButton(show){const btn=getAgentWorkspaceButton();btn.style.display=show?'flex':'none';}
function restoreAgentWorkspace(){
  const moduleEl=ensureAgentModuleContent();
  moduleEl.style.display='none';
  const chatCol=document.getElementById('agent-chat-col');
  const formCol=document.getElementById('form-col');
  if(chatCol)chatCol.style.display='flex';
  renderChat('agent-chat',agentMsgs);buildInput('inp-active');
  if(formStep>=0){if(formCol)formCol.style.display='flex';buildForm(formStep);}else{showWorkspaceEmpty();}
  setAgentWorkspaceButton(false);
}
function showAgentModule(pg){
  buildSidebar('agent-sb',agentSidebarCollapsed,pg);
  const chatCol=document.getElementById('agent-chat-col');
  const formCol=document.getElementById('form-col');
  if(chatCol)chatCol.style.display='none';
  if(formCol)formCol.style.display='none';
  const moduleEl=ensureAgentModuleContent();
  moduleEl.style.display='block';
  moduleEl.innerHTML=pg==='dashboard'?dashboardContentHTML:buildListingHTML(pg);
  setAgentWorkspaceButton(true);
}
function hideAgentWorkspaceButton(){const btn=document.getElementById('agent-workspace-btn');if(btn)btn.style.display='none';}

const formSteps=[
  {title:'Eligibility',short:'Eligibility',sub:'Confirm where the employee will work and their authorization status.'},
  {title:'Employee Information',short:'Profile',sub:'Tell us a bit about the new hire so we can prepare the paperwork.'},
  {title:'Job Details',short:'Job',sub:'Define the role, schedule, and compensation for this contract.'},
  {title:'Other Details',short:'Leaves',sub:'Set leave entitlements, probation, and notice period pre-filled to local minimums.'},
  {title:'Review & Submit',short:'Review',sub:'Quick check before we draft the contract. You can edit anything below.'},
  {title:'Success',short:'Done',sub:''}
];

// -- SIDEBAR BUILDER --
function buildSidebar(id,collapsed,activePg){
  const el=document.getElementById(id);if(!el)return;
  el.className='sidebar'+(collapsed?' collapsed':'');el.innerHTML='';
  const scope=id==='adt-sidebar'?'adt':'agent';
  const top=document.createElement('div');top.className='sb-top';
  top.innerHTML=(collapsed?'':'<span class="sb-menu-label">Menu</span>')+'<button class="sidebar-toggle" onclick="toggleSidebar(\''+scope+'\')" title="Toggle sidebar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="5" width="16" height="14" rx="2"/><line x1="15" y1="5" x2="15" y2="19"/></svg></button>';
  el.appendChild(top);
  const items=scope==='adt'?getSidebarItems():sidebarItems;
  items.forEach(item=>{
    if(item.section){if(!collapsed){const s=document.createElement('div');s.className='sb-section';s.textContent=item.section;el.appendChild(s);}return;}
    if(item.dropdown){
      const isOpen=openDropdowns.has(item.dropdown);
      const hasActiveChild=(item.children||[]).some(c=>c.id===activePg);
      if(!collapsed){
        const parentBtn=document.createElement('button');parentBtn.type='button';
        parentBtn.className='sb-parent'+(isOpen?' open':'')+(hasActiveChild?' has-active':'');
        parentBtn.innerHTML='<div class="sb-ico-wrap">'+(item.icon||'')+'</div><span>'+item.dropdown+'</span><svg class="sb-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
        parentBtn.title=item.dropdown;
        const childrenDiv=document.createElement('div');childrenDiv.className='sb-children';childrenDiv.style.maxHeight=isOpen?'600px':'0';
        (item.children||[]).forEach(child=>{
          const cd=document.createElement('button');cd.type='button';
          cd.className='sb-item'+(child.id===activePg?' active':'');
          cd.innerHTML='<div class="sb-ico-wrap">'+(child.icon||'')+'</div><span>'+child.label+'</span>';
          cd.title=child.label;
          cd.onclick=()=>{activeSidebarItem=child.id;navigatePage(child.id);};
          childrenDiv.appendChild(cd);
        });
        parentBtn.onclick=()=>{
          if(collapsed){if(scope==='adt'){adtSidebarCollapsed=false;openDropdowns.clear();openDropdowns.add(item.dropdown);buildSidebar(id,false,activeSidebarItem);}return;}
          if(openDropdowns.has(item.dropdown)){openDropdowns.delete(item.dropdown);childrenDiv.style.maxHeight='0';parentBtn.classList.remove('open');}
          else{el.querySelectorAll('.sb-parent.open').forEach(b=>b.classList.remove('open'));el.querySelectorAll('.sb-children').forEach(c=>c.style.maxHeight='0');openDropdowns.clear();openDropdowns.add(item.dropdown);childrenDiv.style.maxHeight='600px';parentBtn.classList.add('open');}
        };
        el.appendChild(parentBtn);el.appendChild(childrenDiv);
      }else{
        const d=document.createElement('button');d.type='button';d.className='sb-parent'+(hasActiveChild?' has-active':'');
        d.innerHTML='<div class="sb-ico-wrap">'+(item.icon||'')+'</div>';
        d.title=item.dropdown;
        d.onclick=()=>{adtSidebarCollapsed=false;openDropdowns.clear();openDropdowns.add(item.dropdown);buildSidebar(id,false,activeSidebarItem);};
        el.appendChild(d);
      }
      return;
    }
    const d=document.createElement('button');
    d.type='button';
    d.className='sb-item'+(item.id===activePg?' active':'')+(item.id==='ai-executive'?' sb-item-ai':'');
    d.innerHTML='<div class="sb-ico-wrap">'+(item.icon||'')+'</div><span>'+item.label+'</span>';
    d.title=item.label;
    d.onclick=item.placeholder?()=>{}:()=>{activeSidebarItem=item.id;navigatePage(item.id);};
    el.appendChild(d);
  });
}
const defaultChildIcon='<svg class="sb-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/></svg>';

// ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ NOTIFICATION POPOVER ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬
const notifData=[
  {name:'Your Invoice is ready for review',cid:'234',time:'22 sec ago',pending:true},
  {name:'Your contract is created',cid:'544',time:'1 min ago',pending:false},
  {name:'Your Invoice is ready for review',cid:'467',time:'2 min ago',pending:true},
  {name:'Your contract is created',cid:'321',time:'5 hrs ago',pending:false},
  {name:'Your Invoice is ready for review',cid:'675',time:'1 day ago',pending:true}
];
function toggleNotif(e){if(e)e.stopPropagation();notifOpen=!notifOpen;renderNotif();}
function renderNotif(){
  const el=document.getElementById('notif-pop');if(!el)return;
  if(!notifOpen){el.classList.add('hidden');return;}
  el.classList.remove('hidden');
  const list=notifShowUnread?notifData.filter(n=>n.pending):notifData;
  el.innerHTML=`<div class="np-head"><div class="np-title">Notifications</div><div class="np-actions"><button class="np-iconbtn" title="Refresh"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button><button class="np-iconbtn" onclick="toggleNotif()" title="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div></div>
  <div class="np-controls"><button class="np-mark">Mark all as read</button><div class="np-toggle-row"><span>Only Show Unread</span><button class="np-switch ${notifShowUnread?'on':''}" onclick="event.stopPropagation();notifShowUnread=!notifShowUnread;renderNotif()"></button></div></div>
  <div class="np-list">${list.map(n=>`<div class="np-item"><div class="np-avatar">N</div><div class="np-body"><div class="np-row1"><div class="np-text">${n.name}</div><div class="np-time">${n.time}</div></div><div class="np-row2">Contract ID - ${n.cid}${n.pending?'<span class="np-pending">Pending</span>':''}</div></div></div>`).join('')||'<div style="padding:24px;text-align:center;color:var(--gray);font-size:12px">No unread notifications</div>'}</div>`;
}
document.getElementById('notif-pop')?.addEventListener('click',e=>e.stopPropagation());
document.addEventListener('click',e=>{if(notifOpen&&!e.target.closest('#notif-pop')&&!e.target.closest('#notif-trigger')){notifOpen=false;renderNotif();}});

// ── HEADER DROPDOWNS ──
function toggleHdrDD(id){
  const panel=document.getElementById(id);
  if(!panel)return;
  const isOpen=panel.classList.contains('open');
  closeAllHdrDD();
  if(!isOpen){
    panel.classList.add('open');
    const trigger=panel.previousElementSibling||panel.parentElement.querySelector('.company-sel,.user-sel');
    if(trigger){const chev=trigger.querySelector('.hdr-dd-chev');if(chev)chev.style.transform='rotate(180deg)';}
  }
}
function closeAllHdrDD(){
  document.querySelectorAll('.hdr-dd-panel.open').forEach(p=>{
    p.classList.remove('open');
    const wrap=p.closest('.hdr-dd-wrap');
    if(wrap){const chev=wrap.querySelector('.hdr-dd-chev');if(chev)chev.style.transform='';}
  });
}
document.addEventListener('click',e=>{
  if(!e.target.closest('.hdr-dd-wrap'))closeAllHdrDD();
});

// ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ TOPBAR BUILDER ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬
function buildTopbar(id,m){
  const el=document.getElementById(id);
  const pageLeft=`<div class="adt-logo"><img src="${window.__resources?.logo||'assets/logo.png'}" alt="Opendhi"></div><span class="topbar-page">${getPageTitle(page)}</span><button class="page-add-btn" title="Add ${titleForAdd(page)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>`;
  const agentLeft=`<div class="adt-logo"><img src="${window.__resources?.logo||'assets/logo.png'}" alt="Opendhi"></div><span style="font-size:13px;font-weight:600">Agent Mode</span><span class="badge">BETA</span>`;
  el.innerHTML=`<div class="topbar-left">${m==='agent'?agentLeft:pageLeft}</div>
  <div class="topbar-center"></div>
  <div class="topbar-right">
    <button class="tb-icon" onclick="openSearch()" title="Search (Ctrl+K)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
    <button class="tb-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
    <div class="company-sel" style="font-size:12px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg> Dhi Hyperlocal <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></div>
    <div class="user-sel" style="font-size:12px"><div class="user-avatar-sm" style="width:24px;height:24px;font-size:9px">PP</div> Pallavi Parate</div>
    <button class="close-btn" onclick="closeAgent()" title="Exit Agent Mode"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Close</button>
  </div>`;
}

// -- INPUT BAR BUILDER --
function buildInput(id,ph){
  const el=document.getElementById(id);
  el.innerHTML=`<div class="input-row">
    <div class="icon-btn" onclick="togglePlus('${id}')" style="position:relative"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <div class="plus-dd" id="pdd-${id}">
        <div class="plus-dd-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload File</div>
        <div class="plus-dd-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Share Link</div>
        <div class="plus-dd-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Add URL</div>
      </div>
    </div>
    <input class="input-field" placeholder="${ph||'Ask anything or describe what you need...'}" onkeydown="if(event.key==='Enter')sendMsg('${id}')">
    <div style="position:relative">
      <div class="agent-sel" onclick="toggleAgent('${id}')"><svg class="agent-sp-icon" width="13" height="13" viewBox="0 0 24 24" fill="var(--orange)" stroke="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg><span class="agent-sel-dot" style="width:5px;height:5px;border-radius:50%;background:${agent==='contractor'?'var(--green)':'var(--gray)'};flex-shrink:0"></span><span class="agent-label">${agent==='contractor'?'Contractor Agent':'Payroll Agent'}</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></div>
      <div class="agent-dd" id="add-${id}">
        <div class="agent-dd-hdr">Select Agent</div>
        <div class="agent-dd-item ${agent==='contractor'?'active':''}" onclick="pickAgent('contractor','${id}')"><span style="width:6px;height:6px;border-radius:50%;background:var(--green)"></span><div><div class="nm">Contractor Agent</div><div class="desc">Contracts, onboarding & compliance</div></div>${agent==='contractor'?'<span style="margin-left:auto;color:var(--orange);font-weight:700">&#10003;</span>':''}</div>
        <div class="agent-dd-item disabled"><span style="width:6px;height:6px;border-radius:50%;background:var(--gray)"></span><div><div class="nm">Payroll Agent</div><div class="desc">Salary, deductions & payslips</div></div><span class="coming-tag">Coming Soon</span></div>
      </div>
    </div>
    <button class="icon-btn" onclick="sendMsg('${id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
  </div>`;
}

function togglePlus(id){const d=document.getElementById('pdd-'+id);d.classList.toggle('open');setTimeout(()=>document.addEventListener('click',function h(){d.classList.remove('open');document.removeEventListener('click',h);}),10);}
function toggleAgent(id){const d=document.getElementById('add-'+id);d.classList.toggle('open');setTimeout(()=>document.addEventListener('click',function h(){d.classList.remove('open');document.removeEventListener('click',h);}),10);}
function pickAgent(a,id){agent=a;document.getElementById('add-'+id).classList.remove('open');rebuildInputs();}
function rebuildInputs(){if(view==='agent-empty')buildInput('inp-empty');if(view==='agent-active')buildInput('inp-active');}

// ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ RENDER CHAT ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬
// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ RENDER CHAT ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function renderChat(area,msgs){
  const el=document.getElementById(area);el.innerHTML='';
  msgs.forEach(m=>{const r=document.createElement('div');r.className='msg-row '+(m.role==='user'?'user':'');
    if(m.role==='bot')r.innerHTML=`<div class="bot-av"><svg width="12" height="12" viewBox="0 0 24 24" fill="var(--orange)" stroke="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg></div>`;
    const b=document.createElement('div');b.className='bubble '+(m.role==='user'?'user':'bot');b.innerHTML=m.text;r.appendChild(b);
    if(m.role==='user')r.innerHTML+=`<div class="user-av">PP</div>`;
    el.appendChild(r);
  });el.scrollTop=el.scrollHeight;
}
function showTyping(area){const el=document.getElementById(area);const r=document.createElement('div');r.className='msg-row';r.id='typing';r.innerHTML=`<div class="bot-av"><svg width="12" height="12" viewBox="0 0 24 24" fill="var(--orange)" stroke="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg></div><div class="bubble bot typing-dots"><span></span><span></span><span></span></div>`;el.appendChild(r);el.scrollTop=el.scrollHeight;}
function hideTyping(){const t=document.getElementById('typing');if(t)t.remove();}

// ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ FORM BUILDER ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬
function buildStepper(active){
  const labels=['Eligibility','Profile','Job','Leaves','Review'];
  let html='<div class="stepper">';
  labels.forEach((l,i)=>{
    const cls=i<active?'done':(i===active?'active':'');
    const num=i<active?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':(i+1);
    html+=`<div class="step-dot ${cls}"><div class="sd-circle">${num}</div><div class="sd-label">${l}</div></div>`;
    if(i<labels.length-1)html+=`<div class="step-line ${i<active?'done':''}"></div>`;
  });
  html+='</div>';
  return html;
}
function selRadio(card){const grid=card.parentElement;[...grid.querySelectorAll('.choice-card')].forEach(c=>c.classList.remove('selected'));card.classList.add('selected');const inp=card.querySelector('input');if(inp)inp.checked=true;}
function selSeg(btn){const grp=btn.parentElement;[...grp.querySelectorAll('.seg-btn')].forEach(b=>b.classList.remove('active'));btn.classList.add('active');}
function buildForm(step){
  const col=document.getElementById('form-col');col.style.display='flex';col.innerHTML='';
  const fp=document.createElement('div');fp.className='form-panel';
  const s=formSteps[step];
  if(step===5){fp.innerHTML=`<div class="success-card"><div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><div class="success-meta">&#10022; Created by Contractor Agent</div><h2 style="font-size:24px;font-weight:700;margin-bottom:8px;letter-spacing:-.3px">Contract Created Successfully!</h2><p style="font-size:13px;color:var(--gray);margin-bottom:8px;max-width:380px;line-height:1.55">Your contract is ready. We've sent it to the employee for signature and notified your team.</p><div style="font-size:12.5px;color:var(--navy);margin-bottom:24px;font-weight:500"><span style="color:var(--gray)">Contract ID</span> <span style=ÃƒÂ¢Ã¢â€šÂ¬Ã‚Âfont-weight:700ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â>#342124</span> &middot; Netherlands &middot; EOR &mdash; Employee</div><div style=ÃƒÂ¢Ã¢â€šÂ¬Ã‚Âdisplay:flex;gap:10px;justify-content:centerÃƒÂ¢Ã¢â€šÂ¬Ã‚Â><button class=ÃƒÂ¢Ã¢â€šÂ¬Ã‚Âbtn btn-primaryÃƒÂ¢Ã¢â€šÂ¬Ã‚Â>View Contract &#8594;</button><button class="btn btn-secondary">All Contracts</button></div></div>`;col.appendChild(fp);return;}
  let header=`<div class="fp-shell">${buildStepper(step)}<div class="fp-title-row"><div class="fp-eyebrow">Step ${step+1} of 5 &middot; ${s.short}</div><div class="fp-h1">${s.title}</div><div class="fp-sub">${s.sub}</div></div></div>`;
  let body='';
  if(step===0){body=`<div class="section-block"><div class="section-head">Country & Nationality</div><div class="form-grid"><div class="form-field"><label class="form-label">Employee Nationality <span class="req">*</span></label>${customSelect('employee-nationality','Select country',['Select country','Netherlands','India','Germany'],'Select country')}</div><div class="form-field"><label class="form-label">Working from <span class="req">*</span></label><input class="form-input readonly" value="&#127475;&#127473; Netherlands" readonly><span class="field-prefill">&#10022; Pre-filled by Agent</span></div></div></div><div class="section-block"><div class="section-head">Work Authorization</div><div class="choice-grid"><label class="choice-card selected" onclick="selRadio(this)"><input type="radio" name="auth" checked><div class="choice-radio"></div><div class="choice-body"><div class="choice-title">Yes, employee has a work permit</div><div class="choice-desc">They already hold a valid permit & BSN to work in Netherlands.</div></div></label><label class="choice-card" onclick="selRadio(this)"><input type="radio" name="auth"><div class="choice-radio"></div><div class="choice-body"><div class="choice-title">ADT to assist with work visa</div><div class="choice-desc">We'll handle visa sponsorship & onboarding paperwork on your behalf.</div></div></label></div></div><div class="info-box tip"><div class="ib-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div><div><strong>Netherlands compliance note</strong>All employees need a BSN (Citizen Service Number) and a valid work permit before their start date.</div></div>`;}
  else if(step===1){body=`<div class="section-block"><div class="section-head">Personal details</div><div class="form-grid"><div class="form-field"><label class="form-label">First name <span class="req">*</span></label><input class="form-input" placeholder="e.g. Anika"></div><div class="form-field"><label class="form-label">Last name <span class="req">*</span></label><input class="form-input" placeholder="e.g. Shah"></div><div class="form-field"><label class="form-label">Gender <span class="req">*</span></label>${customSelect('employee-gender','Select gender',['Select gender','Female','Male','Non-binary','Prefer not to say'],'Select gender')}</div><div class="form-field"><label class="form-label">Date of birth <span class="req">*</span></label><input class="form-input" placeholder="DD / MM / YYYY"></div></div></div><div class="section-block"><div class="section-head">Contact</div><div class="form-grid"><div class="form-field"><label class="form-label">Email address <span class="req">*</span></label><input class="form-input" placeholder="name@company.com"></div><div class="form-field"><label class="form-label">Mobile number <span class="req">*</span></label><input class="form-input" placeholder="+91  Enter mobile number"></div></div><div class="form-grid full" style="margin-top:16px"><div class="form-field"><label class="form-label">Address</label><input class="form-input" placeholder="Street, city, postal code, country"></div></div></div>`;}
  else if(step===2){body=`<div class="section-block"><div class="section-head">Role</div><div class="form-grid"><div class="form-field"><label class="form-label">Job title <span class="req">*</span></label><input class="form-input" placeholder="e.g. Senior Software Engineer"></div><div class="form-field"><label class="form-label">Primary skill <span class="req">*</span></label><input class="form-input" placeholder="e.g. Backend, Python"></div></div><div class="form-grid full" style="margin-top:16px"><div class="form-field"><label class="form-label">Job description</label><input class="form-input" placeholder="Briefly describe responsibilities (max 100 words)"><span class="field-hint">A short summary of duties and expectations.</span></div></div></div><div class="section-block"><div class="section-head">Employment type</div><div class="form-grid"><div class="form-field"><label class="form-label">Employment term</label><div class="segmented"><button class="seg-btn active" type="button" onclick="selSeg(this)">Permanent</button><button class="seg-btn" type="button" onclick="selSeg(this)">Fixed term</button></div></div><div class="form-field"><label class="form-label">Employee type</label><div class="segmented"><button class="seg-btn active" type="button" onclick="selSeg(this)">Full time</button><button class="seg-btn" type="button" onclick="selSeg(this)">Part time</button></div></div></div><div class="form-grid" style="margin-top:16px"><div class="form-field"><label class="form-label">From date <span class="req">*</span></label><input class="form-input" placeholder="DD / MM / YYYY"></div><div class="form-field"><label class="form-label">To date</label><input class="form-input" placeholder="Optional &middot; DD / MM / YYYY"></div></div></div><div class="section-block"><div class="section-head">Schedule & compensation</div><div class="form-grid"><div class="form-field"><label class="form-label">Work schedule</label><div class="input-suffix"><input value="40"><span class="sfx">hours / week</span></div></div><div class="form-field"><label class="form-label">Pay frequency <span class="req">*</span></label>${customSelect('pay-frequency','Monthly',['Monthly','Bi-weekly','Weekly'],'')}</div></div><div class="form-grid full" style="margin-top:16px"><div class="form-field"><label class="form-label">Pay amount <span class="req">*</span></label><div class="pay-group">${customSelect('pay-currency','INR &#8377;',['INR &#8377;','EUR &#8364;','USD $'],'','currency-select')}<input value="70,000"></div><span class="field-hint">Gross pay before taxes & deductions.</span></div></div></div>`;}
  else if(step===3){body=`<div class="section-block"><div class="section-head">Leave entitlement</div><p style="font-size:12px;color:var(--gray);margin-bottom:14px;line-height:1.5">Pre-filled to Netherlands statutory minimums. Add more days if you'd like to offer above the legal floor.</p><table class="leave-table"><thead><tr><th>Leave type</th><th>Mandatory</th><th>Additional</th><th style="text-align:right">Total</th></tr></thead><tbody><tr><td class="lt-name">Annual leaves</td><td>18 days</td><td class="lt-add">+ Add days</td><td class="lt-total" style="text-align:right">18 days</td></tr><tr><td class="lt-name">Sick leaves</td><td>12 days</td><td>06 days</td><td class="lt-total" style="text-align:right">18 days</td></tr><tr><td class="lt-name">Maternity leaves</td><td>36 weeks</td><td>02 weeks</td><td class="lt-total" style="text-align:right">38 weeks</td></tr></tbody></table><button class="add-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add another leave type</button></div><div class="section-block"><div class="section-head">Probation & notice</div><div class="form-grid"><div class="form-field"><label class="form-label">Probation period</label><div class="input-suffix"><input value="3"><span class="sfx">months</span></div><span class="field-hint">A 1-month gross salary deposit will be invoiced.</span></div><div class="form-field"><label class="form-label">Notice period</label><div class="input-suffix"><input value="3"><span class="sfx">months</span></div><span class="field-hint">Standard for Netherlands EOR contracts.</span></div></div></div>`;}
  else if(step===4){body=`<div class="review-section"><div class="review-title">Eligibility <button class="review-edit" onclick="editReviewStep(0)">Edit &#8599;</button></div><div class="review-grid"><div class="review-row"><div class="rr-label">Employee Nationality</div><div class="rr-val">Netherlands</div></div><div class="review-row"><div class="rr-label">Working from</div><div class="rr-val">Netherlands</div></div><div class="review-row"><div class="rr-label">Work authorization</div><div class="rr-val">Has work permit</div></div></div></div><div class="review-section"><div class="review-title">Employee Information <button class="review-edit" onclick="editReviewStep(1)">Edit &#8599;</button></div><div class="review-grid"><div class="review-row"><div class="rr-label">Full name</div><div class="rr-val empty">to be filled</div></div><div class="review-row"><div class="rr-label">Email</div><div class="rr-val empty">to be filled</div></div><div class="review-row"><div class="rr-label">Mobile</div><div class="rr-val empty">to be filled</div></div><div class="review-row"><div class="rr-label">Date of birth</div><div class="rr-val empty">to be filled</div></div></div></div><div class="review-section"><div class="review-title">Job Details <button class="review-edit" onclick="editReviewStep(2)">Edit &#8599;</button></div><div class="review-grid"><div class="review-row"><div class="rr-label">Employment</div><div class="rr-val">Permanent &middot; Full time</div></div><div class="review-row"><div class="rr-label">Pay amount</div><div class="rr-val">INR 70,000 / Monthly</div></div><div class="review-row"><div class="rr-label">Work schedule</div><div class="rr-val">40 hours / week</div></div><div class="review-row"><div class="rr-label">Job title</div><div class="rr-val empty">to be filled</div></div></div></div><div class="review-section"><div class="review-title">Other Details <button class="review-edit" onclick="editReviewStep(3)">Edit &#8599;</button></div><div class="review-grid"><div class="review-row"><div class="rr-label">Annual leaves</div><div class="rr-val">18 days</div></div><div class="review-row"><div class="rr-label">Sick leaves</div><div class="rr-val">18 days</div></div><div class="review-row"><div class="rr-label">Probation</div><div class="rr-val">3 months</div></div><div class="review-row"><div class="rr-label">Notice period</div><div class="rr-val">3 months</div></div></div></div><div class="info-box tip"><div class="ib-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg></div><div><strong>You're almost there</strong>Submit to draft this contract &mdash; we'll send it for signature &amp; notify your team.</div></div>`;}
  const isLast=step===4;
  const backBtn=step>0?'<button class="btn btn-secondary" onclick="prevStep()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg> Back</button>':'<span></span>';
  const nextLabel=isLast?'Submit Contract':'Continue';
  const nextCls=isLast?'btn btn-success':'btn btn-primary';
  const prefill=step===0?'<div class="prefill-text"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg> Agent pre-filled Netherlands for you</div>':'<div style="font-size:11.5px;color:var(--gray)">Step '+(step+1)+' of 5</div>';
  const _ck=String.fromCharCode(10003),_ar=String.fromCharCode(8594);const footer='<div class="fp-foot"><div class="form-footer">'+backBtn+prefill+'<button class="'+nextCls+'" onclick="nextStep()">'+nextLabel+(isLast?' '+_ck:' '+_ar)+'</button></div></div>';
  fp.innerHTML=header+'<div class="fp-body">'+body+'</div>'+footer;col.appendChild(fp);
}

function editReviewStep(step){returnToReview=true;formStep=step;buildForm(step);}
function nextStep(){if(returnToReview&&formStep<4){returnToReview=false;formStep=4;buildForm(4);return;}formStep++;if(formStep<=5){if(formStep===5){const col=document.getElementById('form-col');col.style.display='flex';col.innerHTML='<div class="contract-loader"><div class="cl-spinner"></div><div class="cl-title">Creating Contract...</div><div class="cl-sub">Setting up EOR agreement for Netherlands</div></div>';setTimeout(()=>{buildForm(5);agentMsgs.push({role:'bot',text:String.fromCodePoint(127881)+' Contract created successfully! Contract ID: <b>#342124</b> for Netherlands (EOR). You can view it anytime from the Contracts page.'});renderChat('agent-chat',agentMsgs);},2500);}else{buildForm(formStep);}}}
function prevStep(){if(formStep>0){formStep--;buildForm(formStep);}}

// ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ NAVIGATION ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬
function showView(v){document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));document.getElementById('v-'+v).classList.add('active');view=v;}

function toggleSidebar(scope){
  if(scope==='adt'){adtSidebarCollapsed=!adtSidebarCollapsed;buildSidebar('adt-sidebar',adtSidebarCollapsed,getSidebarActivePage(page));return;}
  agentSidebarCollapsed=!agentSidebarCollapsed;buildSidebar('agent-sb',agentSidebarCollapsed,page);buildTopbar('agent-topbar-active','agent');
}

function openAgent(){hideAgentWorkspaceButton();showView('agent-empty');mode='agent';buildTopbar('agent-topbar-empty','agent');buildInput('inp-empty');buildQuickActions();setTimeout(initAmThreeJS,80);}
function closeAgent(){stopAmThreeJS();hideAgentWorkspaceButton();showView('adt');renderADTPage();}

function navigatePage(pg){
  page=pg;
  if(view==='adt'){renderADTPage();return;}
  if(view==='agent-active'){showAgentModule(pg);return;}
}

function buildQuickActions(){
  const g=document.getElementById('qa-grid');g.innerHTML='';
  [{l:'Cost Calculator',d:'Estimate costs across countries',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/></svg>'},{l:'Create Contract',display:'Onboard an Employee',d:'Create contract for employee',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'}].forEach(a=>{
    const c=document.createElement('div');c.className='action-card';
    c.innerHTML=`<div class="ac-icon">${a.i}</div><div><div class="ac-label">${a.display||a.l}</div><div class="ac-desc">${a.d}</div></div>`;
    c.onclick=()=>quickAction(a.l);g.appendChild(c);
  });
}

function quickAction(label){
  formStep=-1;
  const txt=label==='Create Contract'?'Create Contract':`I want to use ${label}`;
  agentMsgs.push({role:'user',text:txt});
  showView('agent-active');buildTopbar('agent-topbar-active','agent');buildSidebar('agent-sb',agentSidebarCollapsed,page);renderChat('agent-chat',agentMsgs);buildInput('inp-active');showWorkspaceEmpty();
  showTyping('agent-chat');
  setTimeout(()=>{hideTyping();
    if(label==='Create Contract'){
      agentMsgs.push({role:'bot',text:'Sure. Which country should I use for this contract? Type something like <b>create contract in Netherlands</b> and I will open the workspace.'});
    }else{agentMsgs.push({role:'bot',text:`Sure! Let me set up the ${label} for you. Which country would you like to start with?`});}
    renderChat('agent-chat',agentMsgs);
  },1200);
}
// == CONTEXT-AWARE RESPONSE ENGINE ==
function isDataQuery(t){const q=t.toLowerCase();return(q.includes('how many')||q.includes('count')||q.includes('total')||q.includes('show')||q.includes('list')||q.includes('pending')||q.includes('active')||q.includes('inactive')||q.includes('status'))&&!isCreateContractRequest(q);}

function getContextualAnswer(text,pg){
  const q=text.toLowerCase().trim();
  const meta=getPageMeta(pg);
  const rows=meta.rows||[];
  const cols=meta.columns||[];
  if(!rows.length)return 'I can help you with the <b>'+meta.title+'</b> page. What would you like to know?';
  const statusIdx=cols.findIndex(function(c){return c.toLowerCase()==='status';});
  const nameIdx=1;
  const countryIdx=cols.findIndex(function(c){return c.toLowerCase()==='country';});
  const byStatus=function(s){return statusIdx>=0?rows.filter(function(r){return String(r[statusIdx]||'').toLowerCase()===s.toLowerCase();}):[];};
  const fmtList=function(items,max){max=max||4;var ns=items.slice(0,max).map(function(r){return'<b>'+r[nameIdx]+'</b>';}).join(', ');return items.length>max?ns+' and <b>'+(items.length-max)+' more</b>':ns;};
  const pending=byStatus('pending');
  const active=byStatus('active');
  const inactive=byStatus('inactive');
  const isCount=q.includes('how many')||q.includes('count')||q.includes('total')||q.includes('number of');
  const isList=q.includes('list')||q.includes('show')||q.includes('which')||q.includes('all')||q.includes('what are');
  const nm=meta.title.toLowerCase();
  if(q.includes('pending')&&(isCount||isList)){
    if(pending.length===0)return 'There are <b>no pending</b> '+nm+' on this page right now.';
    return 'There '+(pending.length===1?'is':'are')+' <b>'+pending.length+' pending</b> '+nm+(pending.length>0?': '+fmtList(pending):'')+'.';}
  if(q.includes('active')&&!q.includes('inactive')&&(isCount||isList)){
    return 'There '+(active.length===1?'is':'are')+' <b>'+active.length+' active</b> '+nm+(active.length>0?': '+fmtList(active):'')+'.';}
  if((q.includes('inactive')||q.includes('closed'))&&(isCount||isList)){
    return 'There '+(inactive.length===1?'is':'are')+' <b>'+inactive.length+' inactive/closed</b> '+nm+(inactive.length>0?': '+fmtList(inactive):'')+'.';}
  if(isCount){
    var statStr=statusIdx>=0?' - <span style="color:var(--green)">'+active.length+' active</span>, <span style="color:#b45309">'+pending.length+' pending</span>, <span style="color:var(--gray)">'+inactive.length+' inactive</span>':'';
    return 'The <b>'+meta.title+'</b> page shows <b>'+rows.length+' total</b> records'+statStr+'.';}
  if(countryIdx>=0){
    var cmap={netherlands:'Netherlands',india:'India',germany:'Germany',spain:'Spain','united kingdom':'United Kingdom',uk:'United Kingdom'};
    var ckeys=Object.keys(cmap);
    for(var ci=0;ci<ckeys.length;ci++){var k=ckeys[ci];if(q.includes(k)){var v=cmap[k];var filt=rows.filter(function(r){return String(r[countryIdx]||'').toLowerCase().includes(k==='uk'?'kingdom':k);});if(filt.length===0)return 'No '+nm+' found for <b>'+v+'</b> on this page.';return 'Found <b>'+filt.length+' '+nm+'</b> for <b>'+v+'</b>: '+fmtList(filt,5)+'.';}}
  }
  var kws=q.split(/\s+/).filter(function(w){return w.length>3&&['what','which','when','where','does','have','this','that','there','from','with','about','many'].indexOf(w)<0;});
  if(kws.length>0){var matches=rows.filter(function(r){return kws.some(function(kw){return r.join(' ').toLowerCase().includes(kw);});});if(matches.length>0&&matches.length<rows.length)return 'Found <b>'+matches.length+' matching record'+(matches.length>1?'s':'')+'</b> on <b>'+meta.title+'</b>: '+fmtList(matches,4)+'.';}
  var defStat=statusIdx>=0?' - <span style="color:var(--green)">'+active.length+' active</span>, <span style="color:#b45309">'+pending.length+' pending</span>, <span style="color:var(--gray)">'+inactive.length+' inactive</span>. Try asking <i>"How many are pending?"</i> or <i>"Show active '+nm+'"</i>':'';
  return 'The <b>'+meta.title+'</b> page currently has <b>'+rows.length+' records</b>'+defStat+'.';}

function agentReply(t){
  var q=t.toLowerCase().trim();
  var unsupportedCountries=['russia','india','germany','spain','france','italy','usa','united states','uk','united kingdom','england','scotland','wales','ireland','northern ireland','china','australia','canada','brazil','mexico','japan','poland','portugal','sweden','norway','denmark','finland','austria','switzerland','belgium','singapore','dubai','uae','emirates','turkey','vietnam','thailand','malaysia','indonesia','philippines','south korea','korea','taiwan','hong kong','new zealand','south africa','nigeria','kenya','egypt','saudi arabia','saudi','qatar','bahrain','oman','kuwait','israel','greece','czech','hungary','romania','ukraine','croatia','serbia','slovakia','bulgaria','latvia','lithuania','estonia','iceland','luxembourg','malta','cyprus','bangladesh','pakistan','sri lanka','nepal','myanmar','cambodia','laos','mongolia','kazakhstan','uzbekistan','azerbaijan','georgia','armenia','ghana','ethiopia','tanzania','uganda','rwanda','senegal','cameroon','ivory coast','morocco','algeria','tunisia','libya','sudan','angola','mozambique','zimbabwe','zambia','botswana','namibia','madagascar','mauritius','colombia','argentina','chile','peru','venezuela','ecuador','bolivia','uruguay','paraguay','guatemala','cuba','dominican republic','costa rica','panama','jamaica'];
  var foundCountry=unsupportedCountries.find(function(c){return q.includes(c);});
  var capCountry=foundCountry?foundCountry.split(' ').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1);}).join(' '):'';
  // Check if last bot message was suggesting Netherlands - if user says yes/proceed, start form
  var lastBot=agentMsgs.filter(function(m){return m.role==='bot';});
  var lastBotText=lastBot.length>0?lastBot[lastBot.length-1].text.toLowerCase():'';
  var botSuggestedNetherlands=lastBotText.includes('netherland');
  var userAffirms=/^(yes|yeah|yep|yup|ok|okay|sure|proceed|go ahead|do it|alright|fine|sounds good|let'?s go|let'?s do it|create it|make it|start it)[\s!.]*$/.test(q);
  if(botSuggestedNetherlands&&userAffirms){setTimeout(function(){startNetherlandsContract();},100);return 'Great! Opening the Netherlands contract workspace now.';}
  // Greeting detection
  var isPureGreeting=/^(hi+|hello+|hey+|howdy|greetings|good morning|good afternoon|good evening)[\s!.]*$/i.test(q);
  var isHowAreYou=/how are you|how'?s it going|how do you do|what'?s up/i.test(q);
  if(isPureGreeting){return "Hello! I'm your ADT Agent. I can help you create contracts, manage employees, check payroll, and more. What would you like to do today?";}
  if(isHowAreYou){return "I'm doing great, thanks for asking! Ready to help. I can create contracts, look up employee data, assist with payroll, and more. What do you need?";}

  // Netherlands contract - start immediately
  if(isNetherlandsContractRequest(t)){return null;}
  // Create contract with unsupported country
  if(isCreateContractRequest(t)&&foundCountry){return 'Contracts for <b>'+capCountry+'</b> are not yet supported in this workspace. We currently support <b>Netherlands</b> contracts. Would you like me to <b>create a Netherlands contract</b> instead?';}
  // Create contract generic
  if(isCreateContractRequest(t)){return 'Got it! We currently support <b>Netherlands</b> contracts. Type <b>create contract in Netherlands</b> to get started right away.';}
  // Mentioned an unsupported country in any context
  if(foundCountry){return 'Contracts for <b>'+capCountry+'</b> are not yet available. Currently, we support <b>Netherlands</b> contracts. Say <b>create contract in Netherlands</b> if you want to proceed.';}
  // Data / page queries
  if(isDataQuery(t)){return getContextualAnswer(t,page);}
  // Wants to create or set something up generically
  if(q.includes('contract')||q.includes('create')||q.includes('new')||q.includes('add')||q.includes('hire')||q.includes('onboard')){return 'I can help with that! Currently I support creating <b>Netherlands contracts</b>. Just say <b>create contract in Netherlands</b> to open the workspace.';}
  // Fallback - helpful generic
  return 'I can help you with contracts, payroll, compliance, and more. Try <b>create contract in Netherlands</b>, or ask me about any data on this page like <i>"How many contracts are active?"</i>';}

function sendMsg(id){
  const inp=document.querySelector('#'+id+' .input-field');const t=inp.value.trim();if(!t)return;inp.value='';
  if(view==='agent-empty'||view==='agent-active'){
    const startsContract=isNetherlandsContractRequest(t);
    agentMsgs.push({role:'user',text:t});
    if(view==='agent-empty'){stopAmThreeJS();showView('agent-active');buildTopbar('agent-topbar-active','agent');buildSidebar('agent-sb',agentSidebarCollapsed,page);buildInput('inp-active');if(formStep<0)showWorkspaceEmpty();}
    else if(formStep<0){showWorkspaceEmpty();}
    renderChat('agent-chat',agentMsgs);showTyping('agent-chat');
    setTimeout(()=>{hideTyping();
      if(startsContract){agentMsgs.push({role:'bot',text:"Great! I'll open the Netherlands contract workspace now."});startNetherlandsContract();}
      else{var reply=agentReply(t);if(reply){agentMsgs.push({role:'bot',text:reply});if(formStep<0)showWorkspaceEmpty();}}
      renderChat('agent-chat',agentMsgs);
    },1000);
  }
}

function buildListingCell(cell,column){
  if(column==='Status'||column==='status')return `<td><span class="lp-status-badge ${statusClass(cell)}">${cell}</span></td>`;
  if(column==='S.No'||column==='S. No')return `<td style="font-weight:700;color:var(--gray)">${cell}</td>`;
  return `<td>${cell}</td>`;
}

function buildListingHTML(pg){
  const meta=getPageMeta(pg);
  const allRows=meta.rows||[];
  const cols=meta.columns||[];
  const statusIdx=cols.findIndex(c=>c==='Status'||c==='status');
  const statusFilter=listStatusFilters[pg]||'';
  const rows=statusFilter&&statusIdx>=0?allRows.filter(r=>String(r[statusIdx]||'')===statusFilter):allRows;
  const isLeavePg=(pg==='all-leaves'||pg==='leaves');
  const s1Key=isLeavePg?'approved':'active';
  const s2Key=isLeavePg?'unapproved':'inactive';
  const s1Label=isLeavePg?'Approved':'Active';
  const s2Label=isLeavePg?'Unapproved':'Inactive';
  const s1Count=statusIdx>=0?allRows.filter(r=>String(r[statusIdx]||'').toLowerCase()===s1Key).length:0;
  const s2Count=statusIdx>=0?allRows.filter(r=>String(r[statusIdx]||'').toLowerCase()===s2Key).length:0;
  const s3Count=statusIdx>=0?allRows.filter(r=>String(r[statusIdx]||'').toLowerCase()==='pending').length:0;
  const pgSlug=pg.replace(/[^a-z0-9]/g,'-');
  const filters=meta.filters.map((f,i)=>apCS(`lst-${pgSlug}-f${i}`,getFilterOptions(f).slice(1),f==='Status'?statusFilter:'',f)).join('');
  const hamburger='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const headers=cols.map(c=>`<th>${c}</th>`).join('')+'<th>ACTION</th>';
  const tableRows=rows.length?rows.map(row=>`<tr>${row.map((cell,i)=>buildListingCell(cell,cols[i])).join('')}<td><button class="lp-action-btn" title="More actions">${hamburger}</button></td></tr>`).join(''):`<tr><td colspan="${cols.length+1}" style="padding:24px;text-align:center;color:var(--gray)">No records match this filter.</td></tr>`;
  return `<div class="listing-page">`
    +`<div class="listing-top">`
      +`<div class="lp-filter-bar" style="flex:1;min-width:0"><div class="lp-filter-bar-label">Select Filter</div><div class="lp-filter-bar-row">${filters}<button class="lp-pill-reset" onclick="resetListingFilters('${pg}')">Reset</button><button class="lp-pill-search" onclick="applyListingFilters('${pg}')">Search</button></div></div>`
      +`<div class="listing-stats">`
        +`<div class="listing-stat ${s1Key}${statusFilter===s1Label?' stat-selected':''}" onclick="toggleListingStatFilter('${pg}','${s1Label}')"><div class="listing-stat-count">${s1Count}</div><div class="listing-stat-label">${s1Label}</div></div>`
        +`<div class="listing-stat ${s2Key}${statusFilter===s2Label?' stat-selected':''}" onclick="toggleListingStatFilter('${pg}','${s2Label}')"><div class="listing-stat-count">${s2Count}</div><div class="listing-stat-label">${s2Label}</div></div>`
        +`<div class="listing-stat pending${statusFilter==='Pending'?' stat-selected':''}" onclick="toggleListingStatFilter('${pg}','Pending')"><div class="listing-stat-count">${s3Count}</div><div class="listing-stat-label">Pending</div></div>`
      +`</div>`
    +`</div>`
    +`<div class="listing-card"><table class="lp-table" style="min-width:700px"><thead><tr>${headers}</tr></thead><tbody>${tableRows}</tbody></table>`
    +`<div class="pagination"><button class="page-btn">&lt;</button><button class="page-btn">1</button><button class="page-btn active">2</button><button class="page-btn">3</button><button class="page-btn">4</button><button class="page-btn">...</button><button class="page-btn">86</button><button class="page-btn">&gt;</button></div>`
    +`</div></div>`;
}

function applyListingFilters(pg){
  const slug=pg.replace(/[^a-z0-9]/g,'-');
  const meta=getPageMeta(pg);
  const idx=(meta.filters||[]).findIndex(f=>f==='Status'||f==='status');
  const status=idx>=0?getCSValue('lst-'+slug+'-f'+idx):'';
  if(status&&status!=='Status')listStatusFilters[pg]=status;else delete listStatusFilters[pg];
  renderADTPage();
}
function resetListingFilters(pg){
  delete listStatusFilters[pg];
  renderADTPage();
}
function toggleListingStatFilter(pg,value){
  if(listStatusFilters[pg]===value)delete listStatusFilters[pg];
  else listStatusFilters[pg]=value;
  renderADTPage();
}

// -- LEAVE POLICIES DATA & PAGES --
const leavePoliciesData=[
  {id:1, type:'Casual Leave',        yearly:24, monthly:5,    carryForward:10,  probation:true,  prorate:false, status:'Active',   assignBy:'Department',  assignValue:'Engineering', employees:['Anika Shah','Shaun J']},
  {id:2, type:'Sick Leave',          yearly:12, monthly:2,    carryForward:5,   probation:true,  prorate:true,  status:'Active',   assignBy:'Designation', assignValue:'Developer',   employees:['Rahul Mehta','Pallavi P']},
  {id:3, type:'Earned Leave',        yearly:18, monthly:1,    carryForward:15,  probation:false, prorate:true,  status:'Active',   assignBy:'Branch',      assignValue:'Hyderabad',   employees:['Nora Kim']},
  {id:4, type:'Maternity Leave',     yearly:26, monthly:null, carryForward:null,probation:true,  prorate:false, status:'Inactive', assignBy:'Department',  assignValue:'HR',          employees:['Luis Martin']},
  {id:5, type:'Paternity Leave',     yearly:10, monthly:null, carryForward:null,probation:false, prorate:false, status:'Active',   assignBy:'Department',  assignValue:'Engineering', employees:['Shaun J','Rahul Mehta']},
  {id:6, type:'Bereavement Leave',   yearly:5,  monthly:null, carryForward:null,probation:true,  prorate:false, status:'Active',   assignBy:'Branch',      assignValue:'Mumbai',      employees:['Pallavi P']},
  {id:7, type:'Marriage Leave',      yearly:7,  monthly:null, carryForward:null,probation:false, prorate:false, status:'Active',   assignBy:'Department',  assignValue:'Sales',       employees:['Luis Martin']},
  {id:8, type:'Compensatory Leave',  yearly:12, monthly:3,    carryForward:6,   probation:true,  prorate:true,  status:'Active',   assignBy:'Designation', assignValue:'Developer',   employees:['Anika Shah','Nora Kim']},
  {id:9, type:'Privilege Leave',     yearly:15, monthly:2,    carryForward:10,  probation:false, prorate:true,  status:'Active',   assignBy:'Branch',      assignValue:'Delhi',       employees:['Rahul Mehta']},
  {id:10,type:'Unpaid Leave',        yearly:30, monthly:10,   carryForward:null,probation:true,  prorate:false, status:'Active',   assignBy:'Department',  assignValue:'Product',     employees:['Shaun J']},
  {id:11,type:'Study Leave',         yearly:10, monthly:null, carryForward:5,   probation:false, prorate:true,  status:'Inactive', assignBy:'Designation', assignValue:'HR Manager',  employees:[]},
  {id:12,type:'Sabbatical Leave',    yearly:90, monthly:null, carryForward:null,probation:false, prorate:false, status:'Inactive', assignBy:'Department',  assignValue:'Workforce',   employees:[]},
  {id:13,type:'Adoption Leave',      yearly:20, monthly:null, carryForward:null,probation:true,  prorate:false, status:'Active',   assignBy:'Branch',      assignValue:'Bangalore',   employees:['Pallavi P','Luis Martin']},
  {id:14,type:'Half Day Leave',      yearly:24, monthly:4,    carryForward:8,   probation:true,  prorate:true,  status:'Active',   assignBy:'Department',  assignValue:'Design',      employees:['Nora Kim']},
  {id:15,type:'Optional Holiday',    yearly:3,  monthly:1,    carryForward:null,probation:false, prorate:false, status:'Active',   assignBy:'Branch',      assignValue:'Chennai',     employees:['Anika Shah']},
  {id:16,type:'Work From Home Leave',yearly:20, monthly:5,    carryForward:null,probation:true,  prorate:true,  status:'Active',   assignBy:'Designation', assignValue:'Recruiter',   employees:['Rahul Mehta','Pallavi P']},
  {id:17,type:'Quarantine Leave',    yearly:14, monthly:null, carryForward:null,probation:true,  prorate:false, status:'Inactive', assignBy:'Department',  assignValue:'Operations',  employees:[]},
];
let leaveEditId=1;
const empPool=[
  {id:'EMP001',name:'Shaun J',key:'CLOCLO11755'},
  {id:'EMP002',name:'Pallavi P',key:'CLO0002'},
  {id:'EMP003',name:'Anika Shah',key:'CLO0003'},
  {id:'EMP004',name:'Rahul Mehta',key:'CLO0004'},
  {id:'EMP005',name:'Nora Kim',key:'CLO0005'},
  {id:'EMP006',name:'Luis Martin',key:'CLO0006'}
];
const empPoolExt={
  EMP001:{dept:'Workforce',desig:'HR Manager',branch:'Hyderabad'},
  EMP002:{dept:'HR',desig:'Recruiter',branch:'Hyderabad'},
  EMP003:{dept:'Engineering',desig:'Developer',branch:'Mumbai'},
  EMP004:{dept:'Product',desig:'Product Manager',branch:'Delhi'},
  EMP005:{dept:'Design',desig:'UX Designer',branch:'Hyderabad'},
  EMP006:{dept:'Sales',desig:'Sales Executive',branch:'Mumbai'}
};
const filterData={
  Department:['Engineering','Product','Finance','Sales','Design','Operations','HR','Workforce'],
  Designation:['Developer','Product Manager','Recruiter','UX Designer','HR Manager','Sales Executive'],
  Branch:['Hyderabad','Mumbai','Delhi','Bangalore','Chennai']
};
let selectedEmps=new Set();
let apFilterType='',apFilterValue='';
let lpSidebarPolicyId=null,lpSidebarTab='basic-details',lpSidebarEditMode=false,lpEmpEditMode=false;
let lpFilterField='',lpFilterStatus='',lpCurrentPage=1;
let listStatusFilters={},alStatusFilter='',pmInvoiceStatusFilter='';
let ctQuickStatusFilter='',atTsQuickFilter='',tkQuickStatusFilter='',chatQuickStatusFilter='';
const LP_PAGE_SIZE=10;
const lpLogsData={
  1:[
    {date:'22 Apr 2026',time:'05:44:07 PM',user:'Admin',status:'Active',action:'Policy reactivated after review'},
    {date:'01 Dec 2025',time:'10:32:19 AM',user:'Rahul M.',status:'Updated',action:'Yearly count updated to 24'},
    {date:'10 Nov 2025',time:'09:15:44 AM',user:'Admin',status:'Created',action:'Policy created'}
  ],
  2:[
    {date:'05 Oct 2025',time:'11:28:08 AM',user:'Admin',status:'Created',action:'Policy created'}
  ],
  3:[
    {date:'15 Nov 2025',time:'02:10:55 PM',user:'Anika S.',status:'Updated',action:'Carry forward limit updated to 15'},
    {date:'01 Sep 2025',time:'11:02:44 AM',user:'Admin',status:'Created',action:'Policy created'}
  ],
  4:[
    {date:'10 Jan 2026',time:'03:45:32 PM',user:'Admin',status:'Inactive',action:'Status changed to Inactive ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â policy retired'},
    {date:'20 Aug 2025',time:'01:30:00 PM',user:'Admin',status:'Created',action:'Policy created'}
  ],
  5:[
    {date:'15 Mar 2026',time:'10:10:00 AM',user:'Admin',status:'Active',action:'Policy activated for Engineering'},
    {date:'02 Jan 2026',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Policy created'}
  ],
  6:[
    {date:'11 Feb 2026',time:'04:20:00 PM',user:'Shaun J',status:'Updated',action:'Eligible branches updated'},
    {date:'05 Dec 2025',time:'11:00:00 AM',user:'Admin',status:'Created',action:'Policy created'}
  ],
  7:[{date:'20 Nov 2025',time:'02:00:00 PM',user:'Admin',status:'Created',action:'Policy created'}],
  8:[
    {date:'18 Apr 2026',time:'01:15:00 PM',user:'Rahul M.',status:'Updated',action:'Monthly limit revised to 3'},
    {date:'01 Jan 2026',time:'08:30:00 AM',user:'Admin',status:'Created',action:'Policy created'}
  ],
  9:[{date:'22 Feb 2026',time:'03:45:00 PM',user:'Admin',status:'Created',action:'Policy created for Delhi branch'}],
  10:[{date:'10 Mar 2026',time:'09:20:00 AM',user:'Admin',status:'Created',action:'Policy created'}],
  11:[
    {date:'05 Apr 2026',time:'11:30:00 AM',user:'Admin',status:'Inactive',action:'Policy deactivated pending review'},
    {date:'14 Oct 2025',time:'10:00:00 AM',user:'Admin',status:'Created',action:'Policy created'}
  ],
  12:[
    {date:'01 May 2026',time:'09:00:00 AM',user:'Admin',status:'Inactive',action:'Sabbatical policy suspended for this cycle'},
    {date:'30 Sep 2025',time:'03:00:00 PM',user:'Admin',status:'Created',action:'Policy created'}
  ],
  13:[{date:'28 Jan 2026',time:'02:30:00 PM',user:'Admin',status:'Created',action:'Policy created for Bangalore branch'}],
  14:[
    {date:'12 Apr 2026',time:'10:45:00 AM',user:'Nora K.',status:'Updated',action:'Carry forward limit set to 8'},
    {date:'03 Nov 2025',time:'11:00:00 AM',user:'Admin',status:'Created',action:'Policy created'}
  ],
  15:[{date:'07 Mar 2026',time:'08:00:00 AM',user:'Admin',status:'Created',action:'Optional holiday policy created for Chennai'}],
  16:[
    {date:'20 Apr 2026',time:'04:00:00 PM',user:'Pallavi P.',status:'Updated',action:'Monthly limit revised to 5'},
    {date:'15 Jan 2026',time:'10:30:00 AM',user:'Admin',status:'Created',action:'Policy created'}
  ],
  17:[
    {date:'01 Jun 2026',time:'01:00:00 PM',user:'Admin',status:'Inactive',action:'Policy deactivated ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no longer required'},
    {date:'20 Apr 2020',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Quarantine leave policy created during COVID period'}
  ]
};
const lpWorkflowData={
  1:[
    {title:'Policy Activated',user:'Admin',date:'22 Apr 2026',time:'05:44:07 PM',description:'Policy set to Active after review. Yearly count confirmed at 24 days.'},
    {title:'Approval Step Added',user:'Rahul M.',date:'01 Dec 2025',time:'10:32:19 AM',description:'Manager approval step added to the leave request workflow.'},
    {title:'Workflow Initialized',user:'Admin',date:'10 Nov 2025',time:'09:15:44 AM',description:'Default single-step workflow created for Casual Leave policy.'}
  ],
  2:[
    {title:'Workflow Initialized',user:'Admin',date:'05 Oct 2025',time:'11:28:08 AM',description:'HR approval workflow created for Sick Leave policy.'}
  ],
  3:[
    {title:'Final Approver Updated',user:'Anika S.',date:'15 Nov 2025',time:'02:10:55 PM',description:'HR Head added as final approver for escalated leave requests.'},
    {title:'Workflow Initialized',user:'Admin',date:'01 Sep 2025',time:'11:02:44 AM',description:'Two-step workflow created: Manager review followed by HR Head approval.'}
  ],
  4:[
    {title:'Workflow Suspended',user:'Admin',date:'10 Jan 2026',time:'03:45:32 PM',description:'Workflow suspended as Maternity Leave policy was set to Inactive status.'},
    {title:'Workflow Initialized',user:'Admin',date:'20 Aug 2025',time:'01:30:00 PM',description:'HR approval workflow created for Maternity Leave policy.'}
  ],
  5:[
    {title:'Workflow Initialized',user:'Admin',date:'02 Jan 2026',time:'09:00:00 AM',description:'Single-step Manager approval workflow created for Paternity Leave.'}
  ],
  6:[
    {title:'Approver Updated',user:'Shaun J',date:'11 Feb 2026',time:'04:20:00 PM',description:'HR Head set as approver for Bereavement Leave requests.'},
    {title:'Workflow Initialized',user:'Admin',date:'05 Dec 2025',time:'11:00:00 AM',description:'Workflow created for Bereavement Leave ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â auto-approve for up to 3 days.'}
  ],
  7:[{title:'Workflow Initialized',user:'Admin',date:'20 Nov 2025',time:'02:00:00 PM',description:'Single-step HR approval workflow created for Marriage Leave.'}],
  8:[
    {title:'Approval Rule Updated',user:'Rahul M.',date:'18 Apr 2026',time:'01:15:00 PM',description:'Monthly comp-off limit approval updated to require manager sign-off.'},
    {title:'Workflow Initialized',user:'Admin',date:'01 Jan 2026',time:'08:30:00 AM',description:'Two-step approval workflow created for Compensatory Leave.'}
  ],
  9:[{title:'Workflow Initialized',user:'Admin',date:'22 Feb 2026',time:'03:45:00 PM',description:'Manager approval workflow initialized for Privilege Leave ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Delhi branch.'}],
  10:[{title:'Workflow Initialized',user:'Admin',date:'10 Mar 2026',time:'09:20:00 AM',description:'Unpaid leave workflow created with mandatory HR approval for all requests.'}],
  11:[
    {title:'Workflow Paused',user:'Admin',date:'05 Apr 2026',time:'11:30:00 AM',description:'Workflow paused as Study Leave policy is under policy review.'},
    {title:'Workflow Initialized',user:'Admin',date:'14 Oct 2025',time:'10:00:00 AM',description:'Study Leave approval workflow initialized with L&D Head as approver.'}
  ],
  12:[
    {title:'Workflow Suspended',user:'Admin',date:'01 May 2026',time:'09:00:00 AM',description:'Sabbatical Leave workflow suspended for this financial year.'},
    {title:'Workflow Initialized',user:'Admin',date:'30 Sep 2025',time:'03:00:00 PM',description:'Long-leave workflow created requiring CEO approval for sabbatical requests.'}
  ],
  13:[{title:'Workflow Initialized',user:'Admin',date:'28 Jan 2026',time:'02:30:00 PM',description:'Adoption Leave workflow created ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â HR + Manager dual approval required.'}],
  14:[
    {title:'Step Updated',user:'Nora K.',date:'12 Apr 2026',time:'10:45:00 AM',description:'Half Day Leave workflow updated to allow self-approval for up to 2 instances/month.'},
    {title:'Workflow Initialized',user:'Admin',date:'03 Nov 2025',time:'11:00:00 AM',description:'Workflow initialized for Half Day Leave ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â single Manager approval.'}
  ],
  15:[{title:'Workflow Initialized',user:'Admin',date:'07 Mar 2026',time:'08:00:00 AM',description:'Optional Holiday workflow created ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â employee self-select with HR visibility.'}],
  16:[
    {title:'Approver Changed',user:'Pallavi P.',date:'20 Apr 2026',time:'04:00:00 PM',description:'Reporting Manager replaced HR as primary approver for WFH Leave requests.'},
    {title:'Workflow Initialized',user:'Admin',date:'15 Jan 2026',time:'10:30:00 AM',description:'Work From Home Leave workflow created with team-lead approval step.'}
  ],
  17:[
    {title:'Workflow Deactivated',user:'Admin',date:'01 Jun 2026',time:'01:00:00 PM',description:'Quarantine Leave workflow deactivated ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â policy retired post-COVID guidelines.'},
    {title:'Workflow Initialized',user:'Admin',date:'20 Apr 2020',time:'09:00:00 AM',description:'Emergency quarantine leave workflow created with auto-approval for first 7 days.'}
  ]
};
function yn(v){return '<option'+(v?' selected':'')+'>Yes</option><option'+(!v?' selected':'')+'>No</option>';}
function statusOpts(v){return '<option'+(v==='Active'?' selected':'')+'>Active</option><option'+(v==='Inactive'?' selected':'')+'>Inactive</option>';}
function apCS(id,opts,defVal,placeholder){
  const sel=opts.find(o=>o===defVal)||'';
  const isEmpty=!sel;
  const optStr=opts.map(o=>`<div class="cs-option${sel===o?' cs-selected':''}" onclick="csSelect(this,'${o}','${id}')"><span>${o}</span><svg class="cs-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>`).join('');
  return `<div class="cs-wrap" id="csw-${id}"><button type="button" class="cs-trigger${isEmpty?' cs-placeholder':''}" onclick="csToggle(this)" data-csid="${id}"><span class="cs-value">${sel||placeholder}</span><svg class="cs-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button><div class="cs-dropdown" id="csd-${id}">${optStr}</div></div>`;
}
function csToggle(btn){
  document.querySelectorAll('.cs-dropdown.cs-open').forEach(d=>{if(d.id!==btn.dataset.csid+'__drop'){d.classList.remove('cs-open');const t=d.previousElementSibling;if(t)t.classList.remove('cs-open');}});
  const drop=document.getElementById('csd-'+btn.dataset.csid);if(!drop)return;
  const open=drop.classList.toggle('cs-open');btn.classList.toggle('cs-open',open);
}
function csSelect(opt,val,csid){
  const drop=document.getElementById('csd-'+csid);if(!drop)return;
  drop.querySelectorAll('.cs-option').forEach(o=>o.classList.remove('cs-selected'));
  opt.classList.add('cs-selected');
  const trigger=document.querySelector(`[data-csid="${csid}"]`);
  if(trigger){trigger.querySelector('.cs-value').textContent=val;trigger.classList.remove('cs-placeholder','cs-open');}
  drop.classList.remove('cs-open');
  if(csid==='ap-filter-type')setApFilterType(val);
  else if(csid==='ap-filter-value')apFilterValue=val;
  else if(csid==='lp-filter-field')lpFilterField=val;
  else if(csid==='lp-filter-status')lpFilterStatus=val;
}
function markApFormDirty(){}
function cancelAddPolicy(){selectedEmps=new Set();apFilterType='';apFilterValue='';page='leave-policies';renderADTPage();}
function resetLpFilters(){lpFilterField='';lpFilterStatus='';lpCurrentPage=1;renderADTPage();}
function lpGoToPage(n){lpCurrentPage=n;renderADTPage();}
function addListingItem(pg){if(pg==='contracts'){const j=aiJourneys.find(x=>x.id==='contract-creation');aiAssistedFlow=false;aiContractPrefill=null;aiCtAnimatedStage=-1;aiCtPendingEmpType='';aiCtJourneyEmployee=null;page=(j&&j.status==='Active')?'ai-contract-assistant':'contract-type-select';renderADTPage();}else if(pg==='teams'){page='team-add';renderADTPage();}else if(pg==='all-leaves'){page='leave-add';renderADTPage();}else if(pg==='compliance'){complianceModalOpen=true;renderADTPage();}else if(pg==='rates-rules'){ratesRuleModalOpen=true;renderADTPage();}}

// -- DIRECT EMPLOYEE PAGE --
const directEmpData=[
  {id:1,name:'Testemp Antar',empId:'EMP001',dept:'Engineering',branch:'Punjab',jobTitle:'Software Engineer',joinDate:'15 Jan 2025',desc:'Full time employee',contact:'+91 9999999996',email:'antar@testemp.com',status:'Active'},
  {id:2,name:'Pallavi Parate',empId:'EMP002',dept:'HR',branch:'Hyderabad',jobTitle:'HR Manager',joinDate:'20 Mar 2024',desc:'Full time employee',contact:'+91 8888888888',email:'pallavi@testemp.com',status:'Active'},
  {id:3,name:'Anika Shah',empId:'EMP003',dept:'Engineering',branch:'Mumbai',jobTitle:'Developer',joinDate:'05 Jun 2024',desc:'Contract employee',contact:'+91 7777777777',email:'anika@testemp.com',status:'Active'},
  {id:4,name:'Rahul Mehta',empId:'EMP004',dept:'Product',branch:'Delhi',jobTitle:'Product Manager',joinDate:'--',desc:'--',contact:'--',email:'rahul@testemp.com',status:'Inactive'},
];
const deLogsData={
  1:[
    {date:'10 Jun 2025',time:'03:30:00 PM',user:'Admin',status:'Updated',action:'Job title updated to Software Engineer'},
    {date:'15 Jan 2025',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Employee profile created'}
  ],
  2:[
    {date:'01 Jun 2025',time:'02:00:00 PM',user:'Pallavi P.',status:'Updated',action:'Department changed to HR'},
    {date:'20 Mar 2024',time:'10:15:00 AM',user:'Admin',status:'Created',action:'Employee profile created'}
  ],
  3:[
    {date:'05 Jun 2024',time:'11:30:00 AM',user:'Admin',status:'Created',action:'Employee profile created'}
  ],
  4:[
    {date:'12 Feb 2025',time:'02:00:00 PM',user:'Admin',status:'Inactive',action:'Employee status set to Inactive'},
    {date:'01 Feb 2024',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Employee profile created'}
  ]
};
const deWorkflowData={
  1:[
    {title:'Onboarding Complete',user:'HR',date:'15 Jan 2025',time:'09:00:00 AM',description:'Employee onboarding checklist completed and access provisioned.'},
    {title:'Background Verification Cleared',user:'Admin',date:'10 Jan 2025',time:'03:00:00 PM',description:'Background verification cleared. Employee cleared for joining.'}
  ],
  2:[
    {title:'Onboarding Complete',user:'Admin',date:'20 Mar 2024',time:'10:15:00 AM',description:'HR Manager onboarding completed. Access to HR systems granted.'}
  ],
  3:[
    {title:'Contract Signed',user:'HR',date:'05 Jun 2024',time:'11:30:00 AM',description:'Contract signed by employee. Contract type: Fixed term.'}
  ],
  4:[
    {title:'Exit Initiated',user:'Admin',date:'12 Feb 2025',time:'02:00:00 PM',description:'Offboarding workflow initiated. Final settlement pending review.'},
    {title:'Onboarding Complete',user:'Admin',date:'01 Feb 2024',time:'09:00:00 AM',description:'Employee onboarded. Role: Product Manager.'}
  ]
};
let deSelectedId=null,deTab='basic-details';
const globalEmpData=[
  {id:1,name:'Emma Schmidt',empId:'GEP001',dept:'Engineering',country:'Germany',jobTitle:'Senior Developer',workerType:'EOR',joinDate:'10 Feb 2024',desc:'Full time employee',contact:'+49 152 0000 0001',email:'emma@testemp.com',status:'Active'},
  {id:2,name:'Lucas Dubois',empId:'GEP002',dept:'Finance',country:'France',jobTitle:'Finance Analyst',workerType:'EOR',joinDate:'15 Apr 2024',desc:'Full time employee',contact:'+33 6 12 34 56 78',email:'lucas@testemp.com',status:'Active'},
  {id:3,name:'Sofia Romano',empId:'GEP003',dept:'HR',country:'Italy',jobTitle:'HR Specialist',workerType:'Contractor',joinDate:'01 Mar 2024',desc:'Contract employee',contact:'+39 347 000 0001',email:'sofia@testemp.com',status:'Active'},
  {id:4,name:'James Wilson',empId:'GEP004',dept:'Operations',country:'United Kingdom',jobTitle:'Ops Manager',workerType:'EOR',joinDate:'--',desc:'--',contact:'+44 7000 000001',email:'james@testemp.com',status:'Inactive'},
];
let geStatusFilter='';
const geLogsData={
  1:[
    {date:'14 May 2025',time:'11:00:00 AM',user:'Admin',status:'Updated',action:'Job title updated to Senior Developer'},
    {date:'10 Feb 2024',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Employee profile created'}
  ],
  2:[
    {date:'15 Apr 2024',time:'10:30:00 AM',user:'Admin',status:'Created',action:'Employee profile created'}
  ],
  3:[
    {date:'20 Nov 2024',time:'02:15:00 PM',user:'Admin',status:'Updated',action:'Contract renewed for 12 months'},
    {date:'01 Mar 2024',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Employee profile created'}
  ],
  4:[
    {date:'05 Jan 2025',time:'03:00:00 PM',user:'Admin',status:'Inactive',action:'Employee status set to Inactive — contract ended'},
    {date:'01 Feb 2024',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Employee profile created'}
  ]
};
const geWorkflowData={
  1:[
    {title:'Onboarding Complete',user:'HR',date:'10 Feb 2024',time:'09:00:00 AM',description:'EOR onboarding via Dhi completed. Access provisioned for Germany entity.'},
    {title:'Contract Signed',user:'Admin',date:'05 Feb 2024',time:'04:00:00 PM',description:'EOR employment contract signed by employee and Dhi.'}
  ],
  2:[
    {title:'Onboarding Complete',user:'Admin',date:'15 Apr 2024',time:'10:30:00 AM',description:'EOR onboarding complete. France entity payroll activated.'}
  ],
  3:[
    {title:'Contract Renewed',user:'HR',date:'20 Nov 2024',time:'02:15:00 PM',description:'Contractor agreement renewed for 12 months.'},
    {title:'Contract Signed',user:'Admin',date:'01 Mar 2024',time:'09:00:00 AM',description:'Initial contractor agreement signed.'}
  ],
  4:[
    {title:'Offboarding Initiated',user:'Admin',date:'05 Jan 2025',time:'03:00:00 PM',description:'Offboarding workflow started. Final settlement and access revocation pending.'},
    {title:'Onboarding Complete',user:'Admin',date:'01 Feb 2024',time:'09:00:00 AM',description:'EOR onboarding complete. UK entity payroll activated.'}
  ]
};
let geSelectedId=null,geTab='basic-details';
const teamsData=[
  {id:1,teamId:'2881',name:'Core Payroll',dept:'Finance',country:'Netherlands',members:18,email:'corepayroll@testemp.com',createdBy:'Admin',joinDate:'From: 01 Jan 2025',status:'Active',
   membersList:[{name:'Emma Schmidt',role:'Reporting Manager',desig:'Finance Head'},{name:'Lucas Dubois',role:'Member',desig:'Payroll Analyst'},{name:'Sofia Romano',role:'Member',desig:'--'}]},
  {id:2,teamId:'2882',name:'People Ops',dept:'HR',country:'India',members:12,email:'peopleops@testemp.com',createdBy:'Pallavi Parate',joinDate:'From: 15 Feb 2025',status:'Active',
   membersList:[{name:'Pallavi Parate',role:'Reporting Manager',desig:'HR Manager'},{name:'Anika Shah',role:'Member',desig:'HR Specialist'}]},
  {id:3,teamId:'2883',name:'Compliance Desk',dept:'Legal',country:'Germany',members:7,email:'compliance@testemp.com',createdBy:'Tarak Swain',joinDate:'From: 01 Mar 2025',status:'Active',
   membersList:[{name:'James Wilson',role:'Reporting Manager',desig:'Legal Head'},{name:'Emma Schmidt',role:'Member',desig:'Compliance Analyst'}]},
  {id:4,teamId:'2884',name:'Entity Setup',dept:'Operations',country:'Spain',members:9,email:'entitysetup@testemp.com',createdBy:'Admin',joinDate:'From: 10 Apr 2025',status:'Pending',
   membersList:[{name:'Rahul Mehta',role:'Reporting Manager',desig:'Ops Manager'}]},
  {id:5,teamId:'2885',name:'Customer Success',dept:'Support',country:'United Kingdom',members:21,email:'customersuccess@testemp.com',createdBy:'Admin',joinDate:'From: 01 May 2025',status:'Active',
   membersList:[{name:'Nora Kim',role:'Reporting Manager',desig:'CS Lead'},{name:'Luis Martin',role:'Member',desig:'CS Specialist'},{name:'Testemp Antar',role:'Member',desig:'--'}]},
  {id:6,teamId:'2886',name:'Local Admin',dept:'Admin',country:'Netherlands',members:4,email:'localadmin@testemp.com',createdBy:'Admin',joinDate:'From: 01 Jun 2025',status:'Inactive',
   membersList:[]}
];
const tmLogsData={
  1:[{date:'10 Jun 2025',time:'11:00:00 AM',user:'Admin',status:'Updated',action:'Team members updated. Count changed to 18.'},{date:'01 Jan 2025',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Team Core Payroll created.'}],
  2:[{date:'15 Feb 2025',time:'10:00:00 AM',user:'Admin',status:'Created',action:'Team People Ops created.'}],
  3:[{date:'01 Mar 2025',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Team Compliance Desk created.'}],
  4:[{date:'10 Apr 2025',time:'02:00:00 PM',user:'Admin',status:'Updated',action:'Team status set to Pending — approval awaited.'},{date:'10 Apr 2025',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Team Entity Setup created.'}],
  5:[{date:'20 May 2025',time:'03:00:00 PM',user:'Admin',status:'Updated',action:'New members added to Customer Success team.'},{date:'01 May 2025',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Team Customer Success created.'}],
  6:[{date:'15 Jul 2025',time:'04:00:00 PM',user:'Admin',status:'Inactive',action:'Team status changed to Inactive.'},{date:'01 Jun 2025',time:'09:00:00 AM',user:'Admin',status:'Created',action:'Team Local Admin created.'}]
};
const tmWorkflowData={
  1:[{title:'Team Activated',user:'Admin',date:'01 Jan 2025',time:'09:00:00 AM',description:'Team setup complete. Finance payroll team activated with 18 members.'},{title:'Members Assigned',user:'Admin',date:'01 Jan 2025',time:'10:00:00 AM',description:'Initial member assignment completed for Core Payroll team.'}],
  2:[{title:'Team Activated',user:'Admin',date:'15 Feb 2025',time:'10:00:00 AM',description:'People Ops team set up. HR workflows initialised.'}],
  3:[{title:'Team Activated',user:'Tarak Swain',date:'01 Mar 2025',time:'09:00:00 AM',description:'Compliance Desk team activated for Germany entity.'}],
  4:[{title:'Approval Pending',user:'Admin',date:'10 Apr 2025',time:'02:00:00 PM',description:'Entity Setup team pending approval from regional head.'},{title:'Team Created',user:'Admin',date:'10 Apr 2025',time:'09:00:00 AM',description:'Entity Setup team created and submitted for approval.'}],
  5:[{title:'Team Activated',user:'Admin',date:'01 May 2025',time:'09:00:00 AM',description:'Customer Success team activated for UK entity.'}],
  6:[{title:'Team Deactivated',user:'Admin',date:'15 Jul 2025',time:'04:00:00 PM',description:'Local Admin team deactivated. Members reassigned.'},{title:'Team Activated',user:'Admin',date:'01 Jun 2025',time:'09:00:00 AM',description:'Local Admin team created for Netherlands entity.'}]
};
let tmSelectedId=null,tmTab='basic-details';
const ctFlow=['Submitted','Quotation Approved','Proposal Sent','Proposal Approved','Contract Sent','Contract Approved','Onboarding','Ready for Payroll'];
const contractsData=[
  {id:1,contractId:'94135',empName:'TestEmp Antar',empDesig:'Business Analyst',country:'Netherlands',type:'EOR',date:'2026-06-11 15:17:26',status:'Submitted',
   nationality:'India',countryOfOp:'Netherlands',workPermit:false,gender:'MALE',email:'antar@testemp.com',contact:'+91 9999999996',dob:'2010-01-01',jobTitle:'Business Analyst',skill:'JIRA',empDuration:'2026-06-11 – 2026-12-15',empType:'EOR',workSchedule:'7',payAmount:'100000',currency:'INR',jobDesc:'job desc',payFrequency:'Monthly',
   commercial:{adtFee:'549',annualGross:'0.05',baseGross:'0.07',holidayBonus:'0.07',month13:'0.07',monthlyGrossNet:'0.02',monthlyInvoice:'0.03',monthlySalary12:'0.06',monthlySalary1392:'0.07',netPay:'0.13',socialPremAmt:'0.06',socialPremPct:'26.02',totalMonthlyGross:'0.06'},
   complianceItems:[{item:'EOR NL Proposal',note:'Optional',status:'Pending',doc:null}]},
  {id:2,contractId:'94134',empName:'Rashi Singh',empDesig:'java',country:'Netherlands',type:'EOR',date:'2026-06-06 15:05:48',status:'Proposal Sent',
   nationality:'India',countryOfOp:'Netherlands',workPermit:false,gender:'FEMALE',email:'rashi@testemp.com',contact:'+91 8888888888',dob:'1995-03-15',jobTitle:'Java Developer',skill:'Java, Spring Boot',empDuration:'2026-06-06 – 2026-12-06',empType:'EOR',workSchedule:'8',payAmount:'85000',currency:'INR',jobDesc:'Java backend development',payFrequency:'Monthly',
   commercial:{adtFee:'549',annualGross:'0.04',baseGross:'0.06',holidayBonus:'0.06',month13:'0.06',monthlyGrossNet:'0.02',monthlyInvoice:'0.02',monthlySalary12:'0.05',monthlySalary1392:'0.06',netPay:'0.10',socialPremAmt:'0.05',socialPremPct:'26.02',totalMonthlyGross:'0.05'},
   complianceItems:[{item:'EOR NL Proposal',note:'Optional',status:'Pending',doc:null}]},
  {id:3,contractId:'94133',empName:'Deepak Singh',empDesig:'java',country:'Netherlands',type:'EOR',date:'2026-06-06 14:07:35',status:'Inactive',
   nationality:'India',countryOfOp:'Netherlands',workPermit:false,gender:'MALE',email:'deepak@testemp.com',contact:'+91 7777777777',dob:'1993-07-22',jobTitle:'Java Developer',skill:'Java',empDuration:'2026-06-06 – 2026-12-06',empType:'EOR',workSchedule:'8',payAmount:'78000',currency:'INR',jobDesc:'Java development',payFrequency:'Monthly',
   commercial:{adtFee:'549',annualGross:'0.04',baseGross:'0.05',holidayBonus:'0.05',month13:'0.05',monthlyGrossNet:'0.01',monthlyInvoice:'0.02',monthlySalary12:'0.04',monthlySalary1392:'0.05',netPay:'0.09',socialPremAmt:'0.04',socialPremPct:'26.02',totalMonthlyGross:'0.04'},
   complianceItems:[{item:'EOR NL Proposal',note:'Optional',status:'Inactive',doc:null}]},
  {id:4,contractId:'94132',empName:'Rajdeep Singh',empDesig:'java developer',country:'Netherlands',type:'EOR',date:'2026-06-06 12:34:17',status:'Proposal Sent',
   nationality:'India',countryOfOp:'Netherlands',workPermit:false,gender:'MALE',email:'rajdeep@testemp.com',contact:'+91 6666666666',dob:'1990-11-10',jobTitle:'Java Developer',skill:'Java, Microservices',empDuration:'2026-06-06 – 2026-12-06',empType:'EOR',workSchedule:'8',payAmount:'90000',currency:'INR',jobDesc:'java developer',payFrequency:'Monthly',
   commercial:{adtFee:'549',annualGross:'0.05',baseGross:'0.06',holidayBonus:'0.06',month13:'0.06',monthlyGrossNet:'0.02',monthlyInvoice:'0.02',monthlySalary12:'0.05',monthlySalary1392:'0.06',netPay:'0.11',socialPremAmt:'0.05',socialPremPct:'26.02',totalMonthlyGross:'0.05'},
   complianceItems:[{item:'EOR NL Proposal',note:'Optional',status:'Pending',doc:null}]}
];
const ctLogsData={
  1:[{date:'2026-06-11',time:'15:17:26',user:'Admin',status:'Submitted',action:'Contract submitted for review and quotation.'}],
  2:[{date:'2026-06-06',time:'15:05:48',user:'Admin',status:'Proposal Sent',action:'EOR proposal sent to employee for review.'},{date:'2026-06-06',time:'14:00:00',user:'Manager',status:'Quotation Approved',action:'Quotation approved by manager. Proceeding to proposal.'},{date:'2026-06-06',time:'13:00:00',user:'Admin',status:'Submitted',action:'Contract submitted for review.'}],
  3:[{date:'2026-06-06',time:'14:07:35',user:'Admin',status:'Inactive',action:'Contract set to Inactive.'}],
  4:[{date:'2026-06-06',time:'12:34:17',user:'Admin',status:'Proposal Sent',action:'EOR proposal sent to employee.'},{date:'2026-06-06',time:'11:00:00',user:'Admin',status:'Submitted',action:'Contract submitted for review.'}]
};
const ctWorkflowData={
  1:[{title:'Contract Submitted',user:'Admin',date:'2026-06-11',time:'15:17:26',description:'EOR contract for TestEmp Antar submitted for quotation and review.'}],
  2:[{title:'Proposal Sent',user:'Admin',date:'2026-06-06',time:'15:05:48',description:'EOR proposal dispatched to Rashi Singh for review and acceptance.'},{title:'Quotation Approved',user:'Manager',date:'2026-06-06',time:'14:00:00',description:'Quotation approved. Proposal stage initiated.'},{title:'Contract Submitted',user:'Admin',date:'2026-06-06',time:'13:00:00',description:'EOR contract submitted for review.'}],
  3:[{title:'Contract Inactive',user:'Admin',date:'2026-06-06',time:'14:07:35',description:'Contract for Deepak Singh set to Inactive.'}],
  4:[{title:'Proposal Sent',user:'Admin',date:'2026-06-06',time:'12:34:17',description:'EOR proposal sent to Rajdeep Singh.'},{title:'Contract Submitted',user:'Admin',date:'2026-06-06',time:'11:00:00',description:'EOR contract submitted for review.'}]
};
let ctSelectedId=null,ctTab='basic-details';

// -- AI EXECUTIVE MODULE --
const aiJourneys=[
  {id:'contract-creation',name:'Contract Creation Journey',desc:'Automates the flow from deal creation through proposal, contract signing, onboarding, and payroll readiness.',modules:['Deal Desk','Employee Profile','Proposal','Contracts','Onboarding','Payroll'],coverage:72,humanSteps:2,aiSteps:5,status:'Inactive',risk:'Medium',updated:'02 Jul 2026, 10:20 AM',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>'},
  {id:'payroll-creation',name:'Payroll Creation Journey',desc:'Automates payroll runs end-to-end from a prompt through attendance capture, salary calculation, approval, and salary slip creation.',modules:['Payroll','Timesheet','Payheads','Compliance Hub','Finance'],coverage:83,humanSteps:1,aiSteps:5,status:'Active',risk:'Medium',updated:'03 Jul 2026, 4:30 PM',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="14" rx="2.5"/><path d="M2 10h20"/><circle cx="17" cy="15" r="1.6"/></svg>'},
  {id:'h2r-lifecycle',name:'Hire to Retire (H2R) Journey',desc:'Automates the full employee lifecycle from creation through country-specific compliance and leave policy setup to eventual offboarding.',modules:['Employee Profile','Compliance Hub','Leave','Onboarding'],coverage:65,humanSteps:1,aiSteps:4,status:'Inactive',risk:'Medium',updated:'28 Jun 2026, 11:00 AM',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>'}
];

const aiJourneyEvents={
  'contract-creation':[
    {name:'Deal Created (Employee Created)',chips:['AI Automated','Deal Desk','Employee'],source:'AI Prompt Parser',desc:"AI parses a natural-language prompt to create the deal and, if the person doesn't already exist, creates or matches the Employee record in the same step.",validation:'Employee name and ID are matched or created against existing records.',human:'None — fully automated.',failure:'Ambiguous name matches are flagged for manual employee selection.',next:'Proposal Sent',fields:['Employee Name','Employee ID','Country','Client','Contract Type']},
    {name:'Proposal Sent',chips:['AI Automated','Proposal'],source:'AI Contract Assistant',desc:'AI drafts commercial terms and compliance items, then sends the proposal for internal approval.',validation:'Commercial terms are validated against country rate rules.',human:'None — AI-supported drafting.',failure:'Missing rate data blocks the send and raises an exception.',next:'Proposal Approved',fields:['Billing Rate','Pay Rate','Margin %','Compliance Checklist']},
    {name:'Proposal Approved',chips:['Human Required','Approval Required'],source:'Deal Manager',desc:'Deal Manager reviews commercial terms and the compliance checklist, then approves the proposal.',validation:'Manual review sign-off is recorded.',human:'Required — Deal Manager approval.',failure:'Rejection routes back to Proposal Sent for correction.',next:'Contract Sent',fields:['Approver Name','Approval Timestamp']},
    {name:'Contract Sent',chips:['AI Automated','Docuseal'],source:'AI + Docuseal',desc:'AI generates the contract from the approved proposal and sends it for signature via Docuseal.',validation:'Contract fields are auto-filled from the proposal and the signature request is tracked.',human:'None — AI assisted generation.',failure:'A signature bounce or timeout raises an exception for resend.',next:'Contract Approved',fields:['Contract Number','Signatory Email','Docuseal Status']},
    {name:'Contract Approved',chips:['Human Required','Approval Required'],source:'Ops Manager',desc:'Ops Manager confirms the signed contract and marks it approved internally.',validation:'The signed document is verified against the contract terms.',human:'Required — Ops Manager approval.',failure:'A discrepancy sends the contract back for correction.',next:'Onboarding',fields:['Approver Name','Signed Document ID']},
    {name:'Onboarding',chips:['AI Automated','Onboarding'],source:'AI Onboarding Engine',desc:'AI runs the onboarding checklist — documents, compliance checks, system access provisioning.',validation:'All onboarding checklist items are marked complete.',human:'None — fully automated.',failure:'A missing document flags an exception for HR follow-up.',next:'Ready for Payroll',fields:['Onboarding Checklist','Document Status','Compliance Status']},
    {name:'Ready for Payroll',chips:['AI Automated','Payroll'],source:'AI Payroll Readiness Check',desc:'AI validates that all payroll-required fields are complete and marks the employee ready for the next payroll cycle.',validation:'Bank details, tax info, and compensation mapping are all present.',human:'None — fully automated.',failure:'Incomplete payroll data blocks readiness and raises an exception.',next:'Journey Complete — Ready for Payroll',fields:['Bank Details','Compensation Mapping','Tax Info']}
  ],
  'payroll-creation':[
    {name:'Prompt Given (Name, ID, etc.)',chips:['AI Automated','Prompt'],source:'AI Prompt Parser',desc:'AI parses a prompt containing the employee name/ID and the payroll period to initiate the run.',validation:'Employee identity is resolved against Employee records.',human:'None — AI assisted parsing.',failure:'An unresolved employee ID raises an exception for manual lookup.',next:'Attendance Capture',fields:['Employee Name','Employee ID','Pay Period']},
    {name:'Attendance Capture',chips:['AI Automated','Timesheet'],source:'AI Timesheet Sync',desc:'AI pulls attendance and timesheet records for the pay period.',validation:'Attendance days are reconciled against leave records.',human:'None — fully automated.',failure:'Missing attendance data raises an exception.',next:'Salary Calculation',fields:['Days Present','Days on Leave','Overtime Hours']},
    {name:'Salary Calculation',chips:['AI Automated','Calculation'],source:'AI Payroll Engine',desc:'AI calculates gross/net salary using payheads, statutory deductions, and country compliance rates.',validation:'The calculation is cross-checked against compliance rate rules.',human:'None — fully automated.',failure:'A rate mismatch raises an exception for finance review.',next:'Approval',fields:['Gross Pay','Deductions','Net Pay']},
    {name:'Approval',chips:['Human Required','Approval Required'],source:'Finance Approver',desc:'Finance reviews the calculated payroll and approves it for disbursement.',validation:'Manual sign-off is recorded.',human:'Required — Finance approval.',failure:'Rejection routes back to Salary Calculation.',next:'Salary Slip',fields:['Approver Name','Approval Timestamp']},
    {name:'Salary Slip Template',chips:['AI Automated','Payslip'],source:'AI Payslip Generator',desc:'AI creates a salary slip template and populates it with employee, attendance, and salary details.',validation:'Payslip totals match the approved calculation.',human:'None — fully automated.',failure:'A generation failure raises an exception for retry.',next:'Salary Slip Created',fields:['Payslip ID','Net Pay','Issue Date']},
    {name:'Salary Slip Created',chips:['AI Automated','Payroll'],source:'AI Payroll Archive',desc:'AI marks the salary slip as created and stores it against the employee record.',validation:'The generated salary slip is available in payroll documents.',human:'None — fully automated.',failure:'A storage failure raises an exception for retry.',next:'Journey Complete — Salary Slip Created',fields:['Payslip ID','Employee ID','Created Date']}
  ],
  'h2r-lifecycle':[
    {name:'Employee Creation',chips:['AI Automated','Employee'],source:'AI Prompt Parser',desc:'AI creates the employee record from a prompt with name, role, and country.',validation:'A duplicate check is run against existing employee records.',human:'None — AI assisted.',failure:'A duplicate match raises an exception for manual resolution.',next:'Fetch Country Details (Compliance Hub)',fields:['Employee Name','Role','Country','Employment Type']},
    {name:'Fetch Country Details (Compliance Hub)',chips:['AI Automated','Compliance Hub'],source:'AI Compliance Hub Sync',desc:"AI fetches statutory and compliance requirements for the employee's country from the Compliance Hub.",validation:'Country rate rules and statutory requirements are retrieved.',human:'None — fully automated.',failure:'A missing country config raises an exception for the compliance team.',next:'Show Leave Policies',fields:['Country Rate Rules','Statutory Requirements','Tax Bands']},
    {name:'Show Leave Policies',chips:['AI Automated','Leave'],source:'AI Leave Policy Engine',desc:"AI matches and displays the applicable leave policy for the employee's country and entity.",validation:"The leave policy is matched to the employee's country and entity.",human:'None — AI assisted display.',failure:'No matching policy raises an exception for HR to configure one.',next:'Ask for Approval if Required',fields:['Leave Policy Name','Leave Types','Annual Entitlement']},
    {name:'Ask for Approval if Required',chips:['Human Required','Approval Required'],source:'HR Manager',desc:'If the leave policy or compliance setup deviates from standard, HR reviews and approves before finalizing.',validation:'Manual sign-off is recorded when a deviation is detected.',human:'Required only on deviation — otherwise auto-skipped.',failure:'Rejection routes back to Show Leave Policies for reconfiguration.',next:'Offboarding',fields:['Approver Name','Deviation Reason']},
    {name:'Offboarding',chips:['AI Automated','Offboarding'],source:'AI Offboarding Engine',desc:"AI runs the offboarding checklist — access revocation, final settlement calculation, exit compliance checks — when the employee's exit is triggered.",validation:'All offboarding checklist items are marked complete.',human:'None — fully automated.',failure:'A pending final settlement raises an exception for finance.',next:'Journey Complete — Offboarding',fields:['Exit Date','Final Settlement Amount','Access Revocation Status']}
  ]
};

// -- Configure: Systems (full parity with reference config console) --
const cfgSystems=[
  {id:'sap',name:'SAP S/4HANA',type:'SAP',method:'REST / OData',endpoint:'https://lnt-s4.vyoma.local/sap/odata/',auth:'OAuth 2.0',apis:142,lastTested:'3 hrs ago',status:'Connected',
    apiList:[
      {name:'API_PRODUCT_SRV · Product',dir:'rw'},
      {name:'API_BUSINESS_PARTNER · Supplier',dir:'rw'},
      {name:'API_PURCHASEORDER_PROCESS',dir:'r'},
      {name:'API_MATERIAL_DOCUMENT · GR',dir:'r'},
      {name:'API_SUPPLIERINVOICE',dir:'r'}
    ]},
  {id:'infor',name:'Infor ERP',type:'Infor',method:'Web Network',endpoint:'https://infor-wn.vyoma.local/',auth:'API Key',apis:38,lastTested:'yesterday',status:'Connected',
    apiList:[
      {name:'SupplierMaster · Vendor',dir:'rw'},
      {name:'PurchaseOrder · Read',dir:'r'},
      {name:'GoodsReceipt · Read',dir:'r'}
    ]},
  {id:'portal',name:'Vendor Portal',type:'3rd-party',method:'REST',endpoint:'https://vendors.vyoma.local/api/',auth:'OAuth 2.0',apis:12,lastTested:'2 days ago',status:'Connected',
    apiList:[
      {name:'VendorInvite · Onboarding',dir:'rw'},
      {name:'VendorDocuments · Read',dir:'r'}
    ]}
];

// -- Configure: Data models (full parity: Material + Vendor, each with mapping/enrichment/rules/test) --
const cfgModels=[
  {id:'material',name:'Material',source:'SAP',desc:'Standard fields from SAP, plus enrichment fields held in Data Foundation.',
    mapped:[['Material ID','Product','string'],['Description','ProductDescription','string'],['Base unit','BaseUnit','string'],['Base price','NetPriceAmount','decimal']],
    enrichment:[{name:'Site',type:'string'},{name:'Project code',type:'string'},{name:'Compliance',type:'string'},{name:'Preferred vendor',type:'string'},{name:'Lead time',type:'string'}],
    rules:{makerChecker:true,validation:'Base price must be greater than zero'},
    sample:[['Material ID','MAT-100482'],['Description','TMT Steel Grade X'],['Base unit','TON'],['Base price','₹52,000 / T'],['Site','Hyderabad Metro'],['Compliance','IS 1786']]},
  {id:'vendor',name:'Vendor',source:'SAP + Infor',desc:'Supplier master unified across SAP and Infor.',
    mapped:[['Vendor ID','SupplierID','string'],['Vendor Name','SupplierName','string'],['Country','Country','string'],['Payment Terms','PaymentTerms','string'],['Rating','VendorRating','decimal'],['Bank Details','BankInfo','object']],
    enrichment:[{name:'Risk Category',type:'string'},{name:'ESG Score',type:'string'},{name:'Preferred Status',type:'string'}],
    rules:{makerChecker:true,validation:'Vendor rating ≥ 3.0'},
    sample:[['Vendor ID','VEN-2044'],['Vendor Name','Bharat Steel Traders'],['Country','India'],['Payment Terms','Net 30'],['Rating','4.2'],['Bank Details','HDFC •••• 2210']]}
];
let cfgModelTested={};
let cfgModelEditing=false;
let cfgModelDraft=null;

// -- Configure: Context & Journey (ADT's real business journeys — same set as AI Executive) --
const cfgJourneys=[
  {id:'contract-creation',name:'Contract Creation Journey',desc:'Automates the flow from deal creation through proposal, contract signing, onboarding, and payroll readiness.',status:'Inactive',tags:['7 steps','Deal Desk, Contracts'],
    steps:[
      {name:'Create Deal & Employee Record',src:'AI Prompt Parser',type:'src'},
      {name:'Send Proposal',src:'AI Contract Assistant',type:'src'},
      {name:'Proposal Approval',src:'Deal Manager',type:'rule'},
      {name:'Send Contract for Signature',src:'AI + Docuseal',type:'src'},
      {name:'Contract Approval',src:'Ops Manager',type:'rule'},
      {name:'Run Onboarding',src:'AI Onboarding Engine',type:'src'},
      {name:'Check Payroll Readiness',src:'AI Payroll Readiness Check',type:'src'}
    ]},
  {id:'payroll-creation',name:'Payroll Creation Journey',desc:'Automates payroll runs end-to-end from a prompt through attendance capture, salary calculation, approval, and salary slip creation.',status:'Active',tags:['6 steps','Payroll, Compliance Hub'],
    steps:[
      {name:'Parse Prompt (Name, ID, etc.)',src:'AI Prompt Parser',type:'src'},
      {name:'Capture Attendance',src:'AI Timesheet Sync',type:'src'},
      {name:'Calculate Salary',src:'AI Payroll Engine',type:'src'},
      {name:'Payroll Approval',src:'Finance Approver',type:'rule'},
      {name:'Generate Salary Slip',src:'AI Payslip Generator',type:'src'},
      {name:'Finalize Salary Slip',src:'AI Payroll Archive',type:'src'}
    ]},
  {id:'h2r-lifecycle',name:'Hire to Retire (H2R) Journey',desc:'Automates the full employee lifecycle from creation through country-specific compliance and leave policy setup to eventual offboarding.',status:'Inactive',tags:['5 steps','Compliance Hub, Leave'],
    steps:[
      {name:'Create Employee Record',src:'AI Prompt Parser',type:'src'},
      {name:'Fetch Country Compliance Details',src:'AI Compliance Hub Sync',type:'src'},
      {name:'Show Leave Policy',src:'AI Leave Policy Engine',type:'src'},
      {name:'HR Approval (if Required)',src:'HR Manager',type:'rule'},
      {name:'Run Offboarding',src:'AI Offboarding Engine',type:'src'}
    ]}
];

// -- Configure: Agents — one per AI-driven step across Contract Creation / Payroll Creation / H2R Lifecycle --
const cfgAgents=[
  {name:'AI Prompt Parser',type:'Transaction agent',desc:"Parses a natural-language prompt to extract the employee's name, ID, and other key details needed to kick off the journey.",model:'Bharat GPT',usedIn:'Contract Creation, Payroll Creation, H2R Lifecycle',guardrail:'Fully automated',
    skillMd:`# AI Prompt Parser — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: Contract Creation Journey, Payroll Creation Journey, H2R Lifecycle Journey
Guardrail: Fully automated

## Role
Parses a natural-language prompt to extract the employee's name, ID, and other key details needed to kick off a journey.

## Context: Contract Creation Journey
Step: Create Deal & Employee Record
Fields read: Employee Name, Employee ID, Country, Client, Contract Type
Validation: Employee name and ID are matched or created against existing records.
On failure: Ambiguous name matches are flagged for manual employee selection.

## Context: Payroll Creation Journey
Step: Parse Prompt (Name, ID, etc.)
Fields read: Employee Name, Employee ID, Pay Period
Validation: Employee identity is resolved against Employee records.
On failure: An unresolved employee ID raises an exception for manual lookup.

## Context: H2R Lifecycle Journey
Step: Create Employee Record
Fields read: Employee Name, Role, Country, Employment Type
Validation: A duplicate check is run against existing employee records.
On failure: A duplicate match raises an exception for manual resolution.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`},
  {name:'AI Contract Assistant',type:'Transaction agent',desc:'Drafts commercial terms and compliance items, then prepares the proposal for approval.',model:'Bharat GPT',usedIn:'Contract Creation Journey',guardrail:'Human approves next step',
    skillMd:`# AI Contract Assistant — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: Contract Creation Journey
Guardrail: Human approves next step

## Role
Drafts commercial terms and compliance items, then prepares the proposal for approval.

## Step
Send Proposal

## Fields read
Billing Rate, Pay Rate, Margin %, Compliance Checklist

## Validation
Commercial terms are validated against country rate rules.

## On failure
Missing rate data blocks the send and raises an exception.

## Governance
The next step, Proposal Approval, is owned by the Deal Manager and must be signed off before the journey continues.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`},
  {name:'AI + Docuseal',type:'Transaction agent',desc:'Generates the contract from the approved proposal and sends it for signature via Docuseal.',model:'Bharat GPT',usedIn:'Contract Creation Journey',guardrail:'Human approves next step',
    skillMd:`# AI + Docuseal — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: Contract Creation Journey
Guardrail: Human approves next step

## Role
Generates the contract from the approved proposal and sends it for signature via Docuseal.

## Step
Send Contract for Signature

## Fields read
Contract Number, Signatory Email, Docuseal Status

## Validation
Contract fields are auto-filled from the proposal and the signature request is tracked.

## On failure
A signature bounce or timeout raises an exception for resend.

## Governance
The next step, Contract Approval, is owned by the Ops Manager and must be signed off before onboarding begins.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`},
  {name:'AI Onboarding Engine',type:'Transaction agent',desc:'Runs the onboarding checklist — documents, compliance checks, and system access provisioning.',model:'Bharat GPT',usedIn:'Contract Creation Journey',guardrail:'Fully automated',
    skillMd:`# AI Onboarding Engine — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: Contract Creation Journey
Guardrail: Fully automated

## Role
Runs the onboarding checklist — documents, compliance checks, and system access provisioning.

## Step
Run Onboarding

## Fields read
Onboarding Checklist, Document Status, Compliance Status

## Validation
All onboarding checklist items are marked complete.

## On failure
A missing document flags an exception for HR follow-up.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`},
  {name:'AI Payroll Readiness Check',type:'Transaction agent',desc:'Validates that bank details, tax info, and compensation mapping are complete before the next payroll cycle.',model:'Bharat GPT',usedIn:'Contract Creation Journey',guardrail:'Fully automated',
    skillMd:`# AI Payroll Readiness Check — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: Contract Creation Journey
Guardrail: Fully automated

## Role
Validates that bank details, tax info, and compensation mapping are complete before the next payroll cycle.

## Step
Check Payroll Readiness

## Fields read
Bank Details, Compensation Mapping, Tax Info

## Validation
Bank details, tax info, and compensation mapping are all present.

## On failure
Incomplete payroll data blocks readiness and raises an exception.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`},
  {name:'AI Timesheet Sync',type:'Transaction agent',desc:'Pulls attendance and timesheet records for the pay period.',model:'Bharat GPT',usedIn:'Payroll Creation Journey',guardrail:'Fully automated',
    skillMd:`# AI Timesheet Sync — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: Payroll Creation Journey
Guardrail: Fully automated

## Role
Pulls attendance and timesheet records for the pay period.

## Step
Capture Attendance

## Fields read
Days Present, Days on Leave, Overtime Hours

## Validation
Attendance days are reconciled against leave records.

## On failure
Missing attendance data raises an exception.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`},
  {name:'AI Payroll Engine',type:'Transaction agent',desc:'Calculates gross/net salary using payheads, statutory deductions, and country compliance rates.',model:'Bharat GPT',usedIn:'Payroll Creation Journey',guardrail:'Human approves next step',
    skillMd:`# AI Payroll Engine — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: Payroll Creation Journey
Guardrail: Human approves next step

## Role
Calculates gross/net salary using payheads, statutory deductions, and country compliance rates.

## Step
Calculate Salary

## Fields read
Gross Pay, Deductions, Net Pay

## Validation
The calculation is cross-checked against compliance rate rules.

## On failure
A rate mismatch raises an exception for finance review.

## Governance
The next step, Payroll Approval, is owned by the Finance Approver and must be signed off before the salary slip is generated.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`},
  {name:'AI Payslip Generator',type:'Transaction agent',desc:'Creates a salary slip template and populates it with employee, attendance, and salary details.',model:'Bharat GPT',usedIn:'Payroll Creation Journey',guardrail:'Fully automated',
    skillMd:`# AI Payslip Generator — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: Payroll Creation Journey
Guardrail: Fully automated

## Role
Creates a salary slip template and populates it with employee, attendance, and salary details.

## Step
Generate Salary Slip

## Fields read
Payslip ID, Net Pay, Issue Date

## Validation
Payslip totals match the approved calculation.

## On failure
A generation failure raises an exception for retry.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`},
  {name:'AI Payroll Archive',type:'Transaction agent',desc:'Finalizes the salary slip and stores it against the employee record.',model:'Bharat GPT',usedIn:'Payroll Creation Journey',guardrail:'Fully automated',
    skillMd:`# AI Payroll Archive — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: Payroll Creation Journey
Guardrail: Fully automated

## Role
Finalizes the salary slip and stores it against the employee record.

## Step
Finalize Salary Slip

## Fields read
Payslip ID, Employee ID, Created Date

## Validation
The generated salary slip is available in payroll documents.

## On failure
A storage failure raises an exception for retry.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`},
  {name:'AI Compliance Hub Sync',type:'Transaction agent',desc:"Fetches statutory and compliance requirements for the employee's country from the Compliance Hub.",model:'Bharat GPT',usedIn:'H2R Lifecycle Journey',guardrail:'Fully automated',
    skillMd:`# AI Compliance Hub Sync — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: H2R Lifecycle Journey
Guardrail: Fully automated

## Role
Fetches statutory and compliance requirements for the employee's country from the Compliance Hub.

## Step
Fetch Country Compliance Details

## Fields read
Country Rate Rules, Statutory Requirements, Tax Bands

## Validation
Country rate rules and statutory requirements are retrieved.

## On failure
A missing country config raises an exception for the compliance team.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`},
  {name:'AI Leave Policy Engine',type:'Transaction agent',desc:"Matches and displays the applicable leave policy for the employee's country and entity.",model:'Bharat GPT',usedIn:'H2R Lifecycle Journey',guardrail:'Human approves on deviation',
    skillMd:`# AI Leave Policy Engine — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: H2R Lifecycle Journey
Guardrail: Human approves on deviation

## Role
Matches and displays the applicable leave policy for the employee's country and entity.

## Step
Show Leave Policy

## Fields read
Leave Policy Name, Leave Types, Annual Entitlement

## Validation
The leave policy is matched to the employee's country and entity.

## On failure
No matching policy raises an exception for HR to configure one.

## Governance
If the matched policy deviates from standard, the next step, HR Approval (if Required), is owned by the HR Manager and must sign off before the journey continues. Otherwise this step is auto-skipped.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`},
  {name:'AI Offboarding Engine',type:'Transaction agent',desc:'Runs the offboarding checklist — access revocation, final settlement, and exit compliance checks.',model:'Bharat GPT',usedIn:'H2R Lifecycle Journey',guardrail:'Fully automated',
    skillMd:`# AI Offboarding Engine — skill.md

Model: Bharat GPT
Type: Transaction agent
Used in: H2R Lifecycle Journey
Guardrail: Fully automated

## Role
Runs the offboarding checklist — access revocation, final settlement, and exit compliance checks.

## Step
Run Offboarding

## Fields read
Exit Date, Final Settlement Amount, Access Revocation Status

## Validation
All offboarding checklist items are marked complete.

## On failure
A pending final settlement raises an exception for finance.

## Audit
Every action this agent takes is logged with timestamp, data source, and outcome for compliance audit.`}
];
const cfgAgentsOriginalSkill=cfgAgents.map(function(a){return a.skillMd;});
let cfgAgentSkillModalIdx=-1;
let cfgAgentSkillEditing=false;

// -- Configure: Overview recent activity (copied from reference console) --
const cfgRecentActivity=[
  {title:'Material model updated',sub:'2 enrichment fields added',when:'12 min ago'},
  {title:'Procure-to-Pay journey activated',sub:'6 steps · live on sandbox',when:'1 hr ago'},
  {title:'SAP S/4HANA connection tested',sub:'142 released APIs available',when:'3 hrs ago'},
  {title:'Infor ERP connected',sub:'via Infor Web Network',when:'yesterday'}
];

// -- Configure: shared UI state --
let selectedCfgSystemId=null,selectedCfgModelId=null,selectedCfgJourneyId=null;
let cfgSystemEditing=false;
let cfgSystemDraft=null;
let cfgStepAssignments={};
let cfgDrawerJourneyId=null,cfgDrawerStepIdx=-1;

// -- AI Executive: live run flows for activated journeys (Create Contract / Create Employee / Run Payroll) --
let aiRunFlowJourneyId=null,aiRunFlowStep=-1,aiRunFlowData={};
const aiRunFlows={
  'h2r-lifecycle':{
    entryLabel:'Create Employee',
    entryDesc:'Tell me who you\'re onboarding — I\'ll create the employee record and walk through country compliance and leave policy setup automatically.',
    promptPlaceholder:'e.g. Create an employee for Rahul Mehta in India as Product Manager',
    steps:[
      {label:'Employee Creation',running:'Creating employee record…',type:'ai'},
      {label:'Fetch Country Details',running:'Fetching compliance details from the Compliance Hub…',type:'ai'},
      {label:'Leave Policy Match',running:'Matching the applicable leave policy…',type:'ai'},
      {label:'Approval Check',running:'Checking for policy deviations…',type:'auto-skip',skipNote:'No deviation detected — step skipped automatically.'},
      {label:'Employee Onboarded',running:'Finalizing employee profile…',type:'ai'}
    ]
  },
  'payroll-creation':{
    entryLabel:'Run Payroll',
    entryDesc:'Tell me who you\'re running payroll for — I\'ll gather their details, capture attendance, calculate salary, and generate the slip automatically.',
    promptPlaceholder:'e.g. Run payroll for Anika Shah for this month',
    steps:[
      {label:'Employee Fetch',running:'Fetching employee details…',type:'fetch'},
      {label:'Attendance Capture',running:'Capturing attendance records…',type:'ai'},
      {label:'Salary Calculation',running:'Calculating gross and net salary…',type:'ai'},
      {label:'Approval',running:'Waiting for Finance approval…',type:'manual'},
      {label:'Salary Slip Template',running:'Generating salary slip template…',type:'slip'},
      {label:'Salary Slip Created',running:'Creating salary slip…',type:'complete'}
    ]
  }
};
const allLeavesData=[
  {id:1,empId:'CLOCLO11755',name:'Shaun J',leaveId:'2014',leaveType:'Casual Leave',leaveFrom:'14-04-2026',leaveTo:'16-04-2026',leaveHours:'Full Day',description:'I need leave',email:'shaun.varghese1805@gmail.com',appliedDate:'14 Apr, 2026 23:40:25',createdBy:'Self',status:'Approved',subStatus:'Paid'},
  {id:2,empId:'CLOCLO11756',name:'Pallavi P',leaveId:'2019',leaveType:'Sick Leave',leaveFrom:'18-04-2026',leaveTo:'18-04-2026',leaveHours:'Half Day',description:'Not feeling well',email:'pallavi.p@maaserp.com',appliedDate:'17 Apr, 2026 10:15:00',createdBy:'Self',status:'Pending',subStatus:'Unpaid'},
  {id:3,empId:'CLOCLO11757',name:'Anika Shah',leaveId:'2021',leaveType:'Casual Leave',leaveFrom:'20-04-2026',leaveTo:'22-04-2026',leaveHours:'Full Day',description:'Personal work',email:'anika.shah@maaserp.com',appliedDate:'19 Apr, 2026 09:00:00',createdBy:'Self',status:'Approved',subStatus:'Paid'},
  {id:4,empId:'CLOCLO11758',name:'Rahul Mehta',leaveId:'2025',leaveType:'Earned Leave',leaveFrom:'25-04-2026',leaveTo:'27-04-2026',leaveHours:'Full Day',description:'Family function',email:'rahul.mehta@maaserp.com',appliedDate:'22 Apr, 2026 14:30:00',createdBy:'Self',status:'Unapproved',subStatus:'Unpaid'},
  {id:5,empId:'CLOCLO11759',name:'Nora Kim',leaveId:'2031',leaveType:'Sick Leave',leaveFrom:'28-04-2026',leaveTo:'28-04-2026',leaveHours:'Half Day',description:'Doctor appointment',email:'nora.kim@maaserp.com',appliedDate:'27 Apr, 2026 08:45:00',createdBy:'Self',status:'Pending',subStatus:'Unpaid'},
  {id:6,empId:'CLOCLO11760',name:'Luis Martin',leaveId:'2033',leaveType:'Casual Leave',leaveFrom:'02-05-2026',leaveTo:'04-05-2026',leaveHours:'Full Day',description:'Vacation trip',email:'luis.martin@maaserp.com',appliedDate:'30 Apr, 2026 11:20:00',createdBy:'Self',status:'Approved',subStatus:'Paid'}
];
const alLogsData={
  1:[{date:'14 Apr, 2026',time:'23:40:25',user:'Shaun J',status:'Approved',action:'Leave applied and approved by manager.'}],
  2:[{date:'17 Apr, 2026',time:'10:15:00',user:'Pallavi P',status:'Pending',action:'Leave application submitted, awaiting approval.'}],
  3:[{date:'19 Apr, 2026',time:'09:00:00',user:'Anika Shah',status:'Approved',action:'Leave applied and approved by manager.'}],
  4:[{date:'22 Apr, 2026',time:'14:30:00',user:'Rahul Mehta',status:'Unapproved',action:'Leave application rejected by manager.'}],
  5:[{date:'27 Apr, 2026',time:'08:45:00',user:'Nora Kim',status:'Pending',action:'Leave application submitted, awaiting approval.'}],
  6:[{date:'30 Apr, 2026',time:'11:20:00',user:'Luis Martin',status:'Approved',action:'Leave applied and approved by manager.'}]
};
let alSelectedId=null,alTab='basic-details';
const paymentsData=[
  {id:1,orderId:'1116',name:'TestEmp Antar',amountDue:'INR 0.00',type:'EOR - Employee',orderStatus:'Onboarding',invoiceStatus:'Unpaid',
   key:'1116',dealId:'94130',entityName:'Closedhi',addedFrom:'agency',createdTime:'02 Jun 2026 | 10:43 am',courseId:'2981',courseName:'JIRA',lastUpdated:'--',startFrom:'01 Jun 2026',endTo:'01 Aug 2026',workingCountry:'Belgium',orderCategory:'international',
   emp:{empId:'8691456',name:'TestEmp Antar',email:'antar@testemp.com',mobile:'+91 9999999996',status:'Pending Onboarding',createdOn:'01 Jun 2026 | 02:54 pm'},
   sales:{companyId:'27659',companyName:'Closedhi',contactPersonId:'46518',contactPersonName:'shaun test1',rateType:'Monthly',days:'0',rate:'INR 1,00,000.00',totalAmount:'INR 1,00,000.00',contractPeriod:'61',workLocation:'Belgium',tsPeriodDate:'—',paymentTerm:'0'},
   user:{
     company:{userId:'27659',concernPersonName:'shaun test1',companyName:'Closedhi',firstName:'shaun',lastName:'test1',email:'shaun.varghese@opendhi.com',mobile:'+91 9949860707',altMobile:'—',website:'—',address:'Flat No: 41204, Olive Block Indu Fortune Fields, Railway Station, Gardenia, near HITECH city, Phase 13, Kukatpally Housing Board Colony, Kukatpally, Hyderabad, Telangana 500085, India'},
     concern:{key:'46518',name:'shaun test1',mobile:'+91 9949860707',email:'shaun.varghese@opendhi.com',date:'12 Apr 2026 | 08:53 pm',createBy:'shaun test1',address:'—'}
   },
   attachments:[]},
  {id:2,orderId:'1114',name:'Elon Musk',amountDue:'EUR 0.00',type:'EOR - Employee',orderStatus:'Onboarding',invoiceStatus:'Unpaid',
   key:'1114',dealId:'94128',entityName:'SpaceX EOR Ltd.',addedFrom:'agency',createdTime:'01 Jun 2026 | 09:00 am',courseId:'2975',courseName:'Python',lastUpdated:'--',startFrom:'01 Jun 2026',endTo:'31 Dec 2026',workingCountry:'USA',orderCategory:'international',
   emp:{empId:'8691455',name:'Elon Musk',email:'elon@spacex.com',mobile:'+1 555 000 0000',status:'Pending Onboarding',createdOn:'01 Jun 2026 | 09:30 am'},
   sales:{companyId:'27660',companyName:'SpaceX EOR Ltd.',contactPersonId:'46520',contactPersonName:'Gwynne Shotwell',rateType:'Monthly',days:'0',rate:'EUR 8,500.00',totalAmount:'EUR 8,500.00',contractPeriod:'184',workLocation:'USA',tsPeriodDate:'—',paymentTerm:'0'},
   user:{
     company:{userId:'27660',concernPersonName:'Gwynne Shotwell',companyName:'SpaceX EOR Ltd.',firstName:'Gwynne',lastName:'Shotwell',email:'gwynne@spacex.com',mobile:'+1 555 000 0001',altMobile:'—',website:'—',address:'1 Rocket Rd, Hawthorne, CA 90250, United States'},
     concern:{key:'46520',name:'Gwynne Shotwell',mobile:'+1 555 000 0001',email:'gwynne@spacex.com',date:'03 Jun 2026 | 11:20 am',createBy:'Gwynne Shotwell',address:'—'}
   },
   attachments:[]}
];
const pmWorkflowData={
  1:[{title:'Order Created',user:'Admin',date:'02 Jun 2026',time:'10:43 am',description:'EOR order created for TestEmp Antar in Belgium.'}],
  2:[{title:'Order Created',user:'Admin',date:'01 Jun 2026',time:'09:00 am',description:'EOR order created for Elon Musk in USA.'}]
};
const pmLogsData={1:[],2:[]};
const pmLogStatusOptions=['Follow Up','Onboarding','Closed','Inactive','Logistic Terminated','Logistic Completed','Offboarding','Finance Termination','Finance Completed','Confirmation Vendor','initial discussion done','Order Extension','Revision'];
const pmInvoiceFlow=['Unpaid','Pending','Paid','Closed'];
let pmSelectedId=null,pmTab='basic-details',pmUserSubTab='company-details';

// ── COMPLIANCE ITEMS DATA & STATE ──
const complianceItemsData=[
  {id:1,country:'Netherlands',item:'test',model:'EOR',status:'Active',category:'Onboarding',createdBy:'Pritam Rai',createdAt:'15 Jun 2026 | 01:30:34 PM',attachments:[],logs:[]},
  {id:2,country:'Belgium',item:'antar compliance test',model:'EOR',status:'Active',category:'Onboarding',createdBy:'Pritam Rai',createdAt:'12 Jun 2026 | 11:05:02 AM',attachments:[],logs:[]},
  {id:3,country:'India',item:'peo india',model:'PEO',status:'Active',category:'Statutory',createdBy:'Neha Sharma',createdAt:'10 Jun 2026 | 04:22:40 PM',attachments:[],logs:[]},
  {id:4,country:'Netherlands',item:'Final Settlement Approval',model:'PEO',status:'Active',category:'Offboarding',createdBy:'Neha Sharma',createdAt:'08 Jun 2026 | 09:15:11 AM',attachments:[],logs:[]},
  {id:5,country:'India',item:'Provident Fund Registration',model:'EOR',status:'Active',category:'Statutory',createdBy:'Aman Singh',createdAt:'05 Jun 2026 | 02:48:57 PM',attachments:[],logs:[]},
  {id:6,country:'Germany',item:'direct - onboarding',model:'Direct',status:'Active',category:'Onboarding',createdBy:'Aman Singh',createdAt:'03 Jun 2026 | 10:30:19 AM',attachments:[],logs:[]},
  {id:7,country:'Germany',item:'test with no evidence in germany',model:'PEO',status:'Active',category:'Onboarding',createdBy:'Pritam Rai',createdAt:'01 Jun 2026 | 05:52:03 PM',attachments:[],logs:[]},
  {id:8,country:'Spain',item:'Work Permit Verification',model:'EOR',status:'Inactive',category:'Statutory',createdBy:'Rahul Mehta',createdAt:'28 May 2026 | 03:10:45 PM',attachments:[],logs:[]},
  {id:9,country:'India',item:'Gratuity Registration',model:'PEO',status:'Inactive',category:'Statutory',createdBy:'Rahul Mehta',createdAt:'25 May 2026 | 12:40:22 PM',attachments:[],logs:[]}
];
let complianceNextId=10;
let complianceCountryFilter='',complianceModelFilter='',complianceStatusFilter='';
let complianceModalOpen=false;
let complianceSelectedId=null,complianceTab='basic-details';

// ── RATES & RULES DATA & STATE ──
const ratesRulesData=[
  {id:1,country:'Netherlands',ruleName:'Minimum Wage',category:'General',applicableTo:'EOR / PEO',valueRate:'EUR 14.71',status:'Active',createdBy:'Tarak Swain',createdAt:'02 Mar 2026 | 02:53:47 PM',logs:[]},
  {id:2,country:'Netherlands',ruleName:'Income Tax Bracket 1',category:'Income Tax',applicableTo:'EOR',valueRate:'35.75%',status:'Inactive',createdBy:'Tarak Swain',createdAt:'02 Mar 2026 | 02:55:10 PM',logs:[]},
  {id:3,country:'Netherlands',ruleName:'Unemployment Insurance',category:'Social Security',applicableTo:'EOR',valueRate:'2.74%',status:'Active',createdBy:'Neha Sharma',createdAt:'28 Feb 2026 | 11:20:00 AM',logs:[]},
  {id:4,country:'Netherlands',ruleName:'Disability Insurance',category:'Social Security',applicableTo:'EOR',valueRate:'6.27%',status:'Inactive',createdBy:'Neha Sharma',createdAt:'28 Feb 2026 | 11:25:40 AM',logs:[]},
  {id:5,country:'Netherlands',ruleName:'Holiday Allowance',category:'Benefits',applicableTo:'EOR / PEO',valueRate:'8.00%',status:'Active',createdBy:'Aman Singh',createdAt:'25 Feb 2026 | 04:10:15 PM',logs:[]},
  {id:6,country:'Netherlands',ruleName:'Health Insurance Levy',category:'Health Ins.',applicableTo:'PEO',valueRate:'6.10%',status:'Inactive',createdBy:'Aman Singh',createdAt:'25 Feb 2026 | 04:15:30 PM',logs:[]},
  {id:7,country:'Netherlands',ruleName:'Childcare Levy',category:'Social Security',applicableTo:'PEO',valueRate:'0.50%',status:'Inactive',createdBy:'Rahul Mehta',createdAt:'20 Feb 2026 | 09:40:00 AM',logs:[]}
];
let ratesRuleSelectedId=null,ratesRuleTab='basic-details';
let ratesRuleCountryFilter='',ratesRuleCategoryFilter='',ratesRuleStatusFilter='';
let ratesRuleNextId=8;
let ratesRuleModalOpen=false;
let ratesRuleSuccessName='';

// ── CONTRACT TEMPLATES DATA & STATE ──
const contractTemplatesData=[
  {id:1,templateName:'SHIV TEST',employmentType:'EOR',templateId:'16',status:'Active',country:'Netherlands',category:'Proposal',createdBy:'Tarak Swain',createdAt:'02 Mar 2026 | 02:53:47 PM',attachments:[],logs:[]},
  {id:2,templateName:'NL EOR Standard',employmentType:'EOR',templateId:'12',status:'Active',country:'Netherlands',category:'Contract',createdBy:'Neha Sharma',createdAt:'28 Feb 2026 | 11:20:00 AM',attachments:[],logs:[]},
  {id:3,templateName:'India PEO Draft',employmentType:'PEO',templateId:'9',status:'Inactive',country:'India',category:'Proposal',createdBy:'Aman Singh',createdAt:'25 Feb 2026 | 04:10:15 PM',attachments:[],logs:[]},
  {id:4,templateName:'Germany Direct Onboarding',employmentType:'Direct',templateId:'7',status:'Active',country:'Germany',category:'Onboarding',createdBy:'Rahul Mehta',createdAt:'20 Feb 2026 | 09:40:00 AM',attachments:[],logs:[]}
];
let ctpSelectedId=null,ctpTab='basic-details';
let ctpCountryFilter='',ctpCategoryFilter='',ctpStatusFilter='';
let ctpNextId=5;

// ── SUPPORT: TICKETS & CHATS DATA ──
const ticketsData=[
  {id:1,ticketId:'TCK-1021',clientName:'John Doe',title:'Issue with compliance doc',category:'Compliance',createdAt:'Jun 12, 2026',status:'open',clientEmail:'john.doe@example.com',clientPhone:'+1 555-0101',country:'United States',assignedTo:'Pallavi Parate',description:'Client reported missing compliance documentation for Q2 audit. Follow-up required with legal team.'},
  {id:2,ticketId:'TCK-1025',clientName:'Thijs Verbeek',title:'Salary document missing',category:'Document',createdAt:'Jun 14, 2026',status:'blocked',clientEmail:'thijs.verbeek@example.com',clientPhone:'+31 20 000 0000',country:'Netherlands',assignedTo:'Rahul Mehta',description:'Monthly salary document not uploaded for May 2026. Awaiting finance team confirmation.'},
  {id:3,ticketId:'TCK-1019',clientName:'Alice Smith',title:'Contract renewal request',category:'Contract',createdAt:'Jun 10, 2026',status:'open',clientEmail:'alice.smith@example.com',clientPhone:'+44 20 0000 0000',country:'United Kingdom',assignedTo:'Aman Singh',description:'Client has requested renewal of EOR contract expiring July 2026.'},
  {id:4,ticketId:'TCK-1100',clientName:'Mark Lee',title:'Tax form not received',category:'Compliance',createdAt:'Jun 18, 2026',status:'in_progress',clientEmail:'mark.lee@example.com',clientPhone:'+49 30 000000',country:'Germany',assignedTo:'Pallavi Parate',description:'Client has not received the annual tax form for the 2025-26 fiscal year. Currently being processed.'},
  {id:5,ticketId:'TCK-1201',clientName:'Thijs Verbeek',title:'Contract draft review',category:'Contract',createdAt:'Jun 20, 2026',status:'open',clientEmail:'thijs.verbeek@example.com',clientPhone:'+31 20 000 0000',country:'Netherlands',assignedTo:'Neha Sharma',description:'New EOR contract draft sent for client review. Awaiting feedback.'},
  {id:6,ticketId:'TCK-1298',clientName:'Alice Smith',title:'Missing compliance certificate',category:'Compliance',createdAt:'Jun 22, 2026',status:'blocked',clientEmail:'alice.smith@example.com',clientPhone:'+44 20 0000 0000',country:'United Kingdom',assignedTo:'Rahul Mehta',description:'Certificate of compliance for UK operations not obtained. Blocked pending local authority approval.'},
  {id:7,ticketId:'TCK-1921',clientName:'Mark Lee',title:'Invoice document request',category:'Document',createdAt:'Jun 25, 2026',status:'closed',clientEmail:'mark.lee@example.com',clientPhone:'+49 30 000000',country:'Germany',assignedTo:'Aman Singh',description:'Client requested invoice copies for Q1 2026. All documents sent and acknowledged.'}
];
const chatsData=[
  {id:1,chatId:'CHAT-1045',clientName:'John Doe',assignedTo:'Pallavi Parate',lastActivity:'53 min ago',status:'waiting_csm',country:'United States',clientEmail:'john.doe@example.com',startedAt:'Jun 26, 2026 | 09:00 AM',linkedTickets:['TCK-1021']},
  {id:2,chatId:'CHAT-1044',clientName:'Priya Sharma',assignedTo:'Rahul Mehta',lastActivity:'2 days ago',status:'waiting_client',country:'India',clientEmail:'priya.sharma@example.com',startedAt:'Jun 24, 2026 | 02:30 PM',linkedTickets:[]},
  {id:3,chatId:'CHAT-1043',clientName:'Ramesh Patel',assignedTo:'Neha Sharma',lastActivity:'1 week ago',status:'active',country:'India',clientEmail:'ramesh.patel@example.com',startedAt:'Jun 19, 2026 | 11:15 AM',linkedTickets:['TCK-1019']},
  {id:4,chatId:'CHAT-1042',clientName:'Aisha Verma',assignedTo:'Olivia Clark',lastActivity:'2 months ago',status:'inactive',country:'Spain',clientEmail:'aisha.verma@example.com',startedAt:'Apr 26, 2026 | 04:00 PM',linkedTickets:[]},
  {id:5,chatId:'CHAT-1041',clientName:'Sophie Dubois',assignedTo:'Aman Singh',lastActivity:'3 months ago',status:'active',country:'France',clientEmail:'sophie.dubois@example.com',startedAt:'Mar 26, 2026 | 10:00 AM',linkedTickets:[]},
  {id:6,chatId:'CHAT-1040',clientName:'Luca Bianchi',assignedTo:'Pallavi Parate',lastActivity:'3 months ago',status:'waiting_client',country:'Italy',clientEmail:'luca.bianchi@example.com',startedAt:'Mar 12, 2026 | 03:45 PM',linkedTickets:['TCK-1100']},
  {id:7,chatId:'CHAT-1039',clientName:'Hannah Müller',assignedTo:'Rahul Mehta',lastActivity:'4 months ago',status:'waiting_csm',country:'Germany',clientEmail:'hannah.muller@example.com',startedAt:'Feb 26, 2026 | 09:30 AM',linkedTickets:['TCK-1298']}
];
let tkSelectedId=null,tkTab='basic-details';
let chatSelectedId=null,chatTab='basic-details';
let chatStatusFilter='all';
let profTab='basic-details';
let seSelectedEntity='dhi-hyperlocal';
const entitiesData=[
  {id:'dhi-hyperlocal',initials:'DH',name:'Dhi Hyperlocal',entityId:'ENT-00421',type:'EOR Entity',country:'India',plan:'Enterprise',employees:142,active:true},
  {id:'closedhi',initials:'CL',name:'Closedhi',entityId:'ENT-00293',type:'PEO Entity',country:'India',plan:'Professional',employees:38,active:false}
];

// ── TIMESHEET STATE & DATA ──
let tsSelectedDay=null;
let tsMonth={year:2026,month:5}; // 0-indexed (5=June)
let tsEmp={name:'Shaun Test1',initials:'ST',role:'Entity Super Admin'};
const tsAttendance={
  '2026-06-01':{in:'09:00 AM',out:'06:15 PM',loc:'Hyderabad',hours:'9.25h',src:'Auto',status:'present'},
  '2026-06-02':{in:'09:15 AM',out:'06:30 PM',loc:'Hyderabad',hours:'9.25h',src:'Manual',status:'present'},
  '2026-06-03':{in:'09:00 AM',out:'06:00 PM',loc:'Hyderabad',hours:'9.00h',src:'Auto',status:'present'},
  '2026-06-04':{in:'08:55 AM',out:'06:00 PM',loc:'Remote',hours:'9.08h',src:'Auto',status:'present'},
  '2026-06-05':{in:'09:30 AM',out:'07:00 PM',loc:'Hyderabad',hours:'9.50h',src:'Manual',status:'present'},
  '2026-06-09':{in:'09:10 AM',out:'06:20 PM',loc:'Hyderabad',hours:'9.17h',src:'Auto',status:'present'},
  '2026-06-10':{in:'09:00 AM',out:'06:00 PM',loc:'Hyderabad',hours:'9.00h',src:'Auto',status:'present'},
  '2026-06-11':{in:'09:45 AM',out:'06:30 PM',loc:'Hyderabad',hours:'8.75h',src:'Manual',status:'present'},
  '2026-06-12':{in:'09:00 AM',out:'06:00 PM',loc:'Hyderabad',hours:'9.00h',src:'Auto',status:'present'},
  '2026-06-13':{in:'10:00 AM',out:'04:00 PM',loc:'Hyderabad',hours:'6.00h',src:'Manual',status:'present'},
  '2026-06-16':{in:'09:15 AM',out:'06:30 PM',loc:'Hyderabad',hours:'9.25h',src:'Auto',status:'present'},
  '2026-06-17':{in:'09:00 AM',out:'06:00 PM',loc:'Remote',hours:'9.00h',src:'Auto',status:'present'},
  '2026-06-18':{in:'09:30 AM',out:'06:45 PM',loc:'Hyderabad',hours:'9.25h',src:'Manual',status:'present'},
  '2026-06-19':{in:'09:00 AM',out:'06:15 PM',loc:'Hyderabad',hours:'9.25h',src:'Auto',status:'present'},
  '2026-06-20':{in:'09:10 AM',out:'05:50 PM',loc:'Hyderabad',hours:'8.67h',src:'Auto',status:'present'},
  '2026-06-23':{in:'09:10 AM',out:'06:00 PM',loc:'Hyderabad',hours:'8.83h',src:'Auto',status:'present'},
  '2026-06-24':{in:'09:02 AM',out:'--',loc:'Hyderabad',hours:'--',src:'Manual',status:'inprog'}
};
function tsOpenDay(d){tsSelectedDay=d;renderADTPage();}
function tsCloseDay(){tsSelectedDay=null;renderADTPage();}

// ── TIMESHEET MONTH PICKER ──
let tsMpOpen=false;
let tsMpYear=tsMonth.year;
function tsToggleMonthPicker(ev){if(ev)ev.stopPropagation();tsMpOpen=!tsMpOpen;tsMpYear=tsMonth.year;renderADTPage();}
function tsCloseMonthPicker(){if(!tsMpOpen)return;tsMpOpen=false;renderADTPage();}
function tsMpNavYear(delta,ev){if(ev)ev.stopPropagation();tsMpYear+=delta;renderADTPage();}
function tsMpSelectMonth(monthIdx,ev){if(ev)ev.stopPropagation();tsMonth={year:tsMpYear,month:monthIdx};tsMpOpen=false;tsSelectedDay=null;renderADTPage();}
function tsMpThisMonth(ev){if(ev)ev.stopPropagation();tsMonth={year:2026,month:5};tsMpOpen=false;tsSelectedDay=null;renderADTPage();}

// ── ALL TIMESHEET DATA & ACTIONS ──
const allTsData=[
  {id:1,empId:'11803',name:'Antar Testemp',country:'-',empStatus:'Active',tsStatus:'Unfilled',role:'Employer of Record',initials:'AT'},
  {id:2,empId:'11755',name:'Shaun J',country:'-',empStatus:'Active',tsStatus:'Unfilled',role:'Direct Employee',initials:'SJ'},
  {id:3,empId:'11754',name:'Shaun Test1',country:'-',empStatus:'Active',tsStatus:'Unfilled',role:'Entity Super Admin',initials:'ST'}
];
function atViewCalendar(empId,name,initials,role){
  tsEmp={name:name,initials:initials,role:role||'Employee'};
  tsSelectedDay=null;
  page='my-timesheet';
  renderADTPage();
}

// ── COMPANY SETTINGS STATE & DATA ──
let csTab='basic-details';
let csStructureTab='branch';
let csSelectedItem=null;
const csLogsData=[
  {date:'22 Apr 2026',time:'05:44:07 PM',user:'Shaun Test1',status:'Active',action:'Hvj'},
  {date:'14 Apr 2026',time:'11:28:08 PM',user:'Shaun Test1',status:'Pending',action:'Yes'},
  {date:'14 Apr 2026',time:'11:02:44 PM',user:'Shaun Test1',status:'Active',action:'Yes'}
];
function openCsSidebar(item){csSelectedItem=item;csTab='basic-details';renderADTPage();}
function closeCsSidebar(){csSelectedItem=null;renderADTPage();}
function refreshCsSidebar(){const inner=document.getElementById('cs-isb-inner');if(inner){inner.innerHTML=renderCsSidebar();requestAnimationFrame(function(){const nt=document.getElementById('cs-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});}}
function csSetTab(tab){csTab=tab;refreshCsSidebar();}
function csSetStructureTab(tab){csStructureTab=tab;refreshCsSidebar();}
function csSaveLog(){
  const sel=document.getElementById('cs-log-status-sel');
  const inp=document.getElementById('cs-log-comment-inp');
  if(!sel||!inp)return;
  const status=sel.value;
  const comment=inp.value.trim();
  if(!status){sel.style.borderColor='#ef4444';setTimeout(()=>{sel.style.borderColor='';},1500);return;}
  if(!comment){inp.style.borderColor='#ef4444';setTimeout(()=>{inp.style.borderColor='';},1500);return;}
  const now=new Date();
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr=now.getDate()+' '+months[now.getMonth()]+' '+now.getFullYear();
  const h=now.getHours(),mm=now.getMinutes(),ss=now.getSeconds();
  const timeStr=(h%12||12)+':'+(mm<10?'0'+mm:mm)+':'+(ss<10?'0'+ss:ss)+' '+(h>=12?'PM':'AM');
  csLogsData.unshift({date:dateStr,time:timeStr,user:'Shaun Test1',status,action:comment});
  refreshCsSidebar();
}
