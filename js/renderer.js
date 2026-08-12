function dispatchAIContractWizardPage(el){
  if(page==='ai-contract-assistant'){el.innerHTML=buildAIContractAssistantHTML();return;}
  if(page==='ai-employee-created'){el.innerHTML=buildAIEmployeeCreatedHTML();return;}
  if(page==='contract-type-select'){el.innerHTML=buildContractTypeSelectHTML();return;}
  if(page==='contract-eor'){if(aiAssistedFlow){el.innerHTML=buildAIAssistedContractSplitHTML('EOR');initAICtChatPanel();return;}el.innerHTML=buildEORContractHTML();return;}
  if(page==='contract-peo'){if(aiAssistedFlow){el.innerHTML=buildAIAssistedContractSplitHTML('PEO');initAICtChatPanel();return;}el.innerHTML=buildPEOContractHTML();return;}
  if(page==='ai-proposal-created'){el.innerHTML=buildAIProposalCreatedHTML();aiScheduleAutoAdvance('ai-proposal-created',aiSendProposalForApproval,1300);return;}
  if(page==='ai-proposal-waiting-approval'){el.innerHTML=buildAIProposalWaitingApprovalHTML();return;}
  if(page==='ai-contract-document'){el.innerHTML=buildAIContractDocumentHTML();aiScheduleAutoAdvance('ai-contract-document',aiSendContractForApproval,1300);return;}
  if(page==='ai-contract-waiting-approval'){el.innerHTML=buildAIContractWaitingApprovalHTML();return;}
  if(page==='ai-onboarding-run'){el.innerHTML=buildAIOnboardingRunHTML();return;}
  if(page==='ai-journey-complete'){el.innerHTML=buildAIJourneyCompleteHTML();return;}
}
function renderPageContent(id){
  const el=document.getElementById(id);
  if(!el)return;
  if(isAIContractWizardPage(page)){
    const cjStage=aiCtJourneyStage();
    if(cjStage>=0){
      el.innerHTML='<div class="aicj-wrap">'+buildAIContractJourneyBarHTML(cjStage)+'<div id="aicj-inner"></div></div>';
      dispatchAIContractWizardPage(document.getElementById('aicj-inner'));
    }else{
      dispatchAIContractWizardPage(el);
    }
    return;
  }
  if(page==='cfg-overview'){el.innerHTML=buildCfgOverviewHTML();return;}
  if(page==='cfg-systems'){el.innerHTML=buildCfgSystemsHTML();return;}
  if(page==='cfg-system-detail'){el.innerHTML=buildCfgSystemDetailHTML();return;}
  if(page==='cfg-system-add'){el.innerHTML=buildCfgSystemAddHTML();return;}
  if(page==='cfg-data-foundation'){el.innerHTML=buildCfgDataFoundationHTML();return;}
  if(page==='cfg-model-detail'){el.innerHTML=buildCfgModelDetailHTML();return;}
  if(page==='cfg-model-add'){el.innerHTML=buildCfgModelAddHTML();return;}
  if(page==='cfg-context-journey'){el.innerHTML=buildCfgContextJourneyHTML();return;}
  if(page==='cfg-journey-detail'){el.innerHTML=buildCfgJourneyDetailHTML();return;}
  if(page==='cfg-agents'){el.innerHTML=buildCfgAgentsHTML();return;}
  if(page==='ai-executive'){el.innerHTML=buildAIExecutiveDashboardHTML();return;}
  if(page==='ai-journey-detail'){el.innerHTML=buildAIJourneyDetailHTML();return;}
  if(page==='ai-automate-form'){el.innerHTML=buildAutomateJourneyFormHTML();return;}
  if(page==='ai-active-automation'){el.innerHTML=buildAIActiveAutomationHTML();return;}
  if(page==='ai-run-detail'){el.innerHTML=buildAIRunDetailHTML();return;}
  if(page==='ai-journey-run'){el.innerHTML=buildAIJourneyRunHTML();return;}
  if(page==='cost-calculator'){el.innerHTML=buildCostCalculatorPageHTML();initCostCalcPage();return;}
  if(page==='leave-policies'){el.innerHTML=buildLeavePoliciesHTML();return;}
  if(page==='employees'){el.innerHTML=buildEmployeesHTML();return;}
  if(page==='timesheet'){el.innerHTML=buildTimesheetHTML();return;}
  if(page==='direct'){el.innerHTML=buildDirectListingHTML();return;}
  if(page==='global'){el.innerHTML=buildGlobalListingHTML();return;}
  if(page==='teams'){el.innerHTML=buildTeamsListingHTML();return;}
  if(page==='contracts'){el.innerHTML=buildContractsListingHTML();return;}
  if(page==='all-leaves'){el.innerHTML=buildAllLeavesHTML();return;}
  if(page==='leave-policy-edit'){el.innerHTML=buildEditLeavePolicyHTML();return;}
  if(page==='leave-policy-add'){el.innerHTML=buildAddLeavePolicyHTML();return;}
  if(page==='leave-add'){el.innerHTML=buildAddLeaveHTML();return;}
  if(page==='team-add'){el.innerHTML=buildAddTeamHTML();return;}
  if(page==='payments'){el.innerHTML=buildPaymentsHTML();return;}
  if(page==='compliance'){el.innerHTML=buildComplianceItemsHTML();return;}
  if(page==='rates-rules'){el.innerHTML=buildRatesRulesHTML();return;}
  if(page==='contract-templates'){el.innerHTML=buildContractTemplatesHTML();return;}
  if(page==='my-timesheet'){el.innerHTML=buildMyTimesheetHTML();return;}
  if(page==='all-timesheet'){el.innerHTML=buildAllTimesheetHTML();return;}
  if(page==='at-timesheet-view'){el.innerHTML=buildMyTimesheetHTML(true);return;}
  if(page==='settings'){el.innerHTML=buildCompanySettingsHTML();return;}
  if(page==='my-profile'){el.innerHTML=buildMyProfileHTML();return;}
  if(page==='switch-entity'){el.innerHTML=buildSwitchEntityHTML();return;}
  if(page==='support-tickets'){el.innerHTML=buildTicketsPageHTML();return;}
  if(page==='chats'){el.innerHTML=buildChatsPageHTML();return;}
  if(page==='dashboard'){
    el.innerHTML=dashboardContentHTML;
    // The snapshot always has the first tab active — restore the one the user was on.
    if(window.activeDashboardTab&&typeof switchDashboard==='function')switchDashboard(window.activeDashboardTab);
    return;
  }
  el.innerHTML=buildListingHTML(page);
}

function renderADTPage(){
  const title=document.getElementById('adt-page-title');
  if(title)title.textContent=getPageTitle(page);
  // Show/hide + button in topbar based on current page
  const addBtn=document.getElementById('tb-page-add-btn');
  if(addBtn){
    const noAddPages=['dashboard','cost-calculator','leave-policy-add','leave-policy-edit','team-add','leave-add','contract-type-select','contract-eor','contract-peo','timesheet','my-timesheet','all-timesheet','at-timesheet-view','settings','my-profile','support-tickets','chats','switch-entity','ai-executive','ai-journey-detail','ai-automate-form','ai-active-automation','ai-run-detail','ai-journey-run','ai-contract-assistant','ai-proposal-created','ai-proposal-waiting-approval','ai-employee-created','ai-contract-document','ai-contract-waiting-approval','ai-onboarding-run','ai-journey-complete','cfg-overview','cfg-systems','cfg-system-detail','cfg-system-add','cfg-data-foundation','cfg-model-detail','cfg-model-add','cfg-context-journey','cfg-journey-detail','cfg-agents'];
    const show=!noAddPages.includes(page);
    addBtn.style.display=show?'':'none';
    if(show){
      const specialHandlers={'leave-policies':()=>{selectedEmps=new Set();apFilterType='';apFilterValue='';page='leave-policy-add';renderADTPage();}};
      addBtn.onclick=specialHandlers[page]||(()=>addListingItem(page));
    }
  }
  const ccBtn=document.getElementById('tb-cost-calc-btn');
  if(ccBtn)ccBtn.style.display=page==='contracts'?'':'none';
  buildSidebar('adt-sidebar',adtSidebarCollapsed,getSidebarActivePage(page));
  const sidebar=document.getElementById('adt-sidebar');
  if(sidebar)sidebar.style.display=page==='cost-calculator'?'none':'';
  renderPageContent('adt-content');
  const content=document.getElementById('adt-content');
  if(content)content.scrollTop=0;
}

// ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ INIT ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬
const dashboardContentHTML=document.getElementById('adt-content').innerHTML;
renderADTPage();

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ COST CALCULATOR ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
const ccCountries=[
  {id:'nl',name:'Netherlands',flag:'NL',currency:'EUR',symbol:'ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬',salary:60000,
    items:[
      {label:'Base Salary',note:'Annual gross',val:60000,pct:null},
      {label:'Employer Social Security (AOW/WW/WAO)',note:'23% of gross',val:13800,pct:'23%'},
      {label:'Holiday Pay (Vakantiegeld)',note:'8% of gross',val:4800,pct:'8%'},
      {label:'Pension Contribution',note:'5% of gross',val:3000,pct:'5%'},
      {label:'Work-related Expenses Allowance',note:'Flat per employee per year',val:750,pct:null}
    ]},
  {id:'in',name:'India',flag:'IN',currency:'INR',symbol:'ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹',salary:1200000,
    items:[
      {label:'Base Salary (CTC)',note:'Annual gross',val:1200000,pct:null},
      {label:'Employer PF (Provident Fund)',note:'12% of basic salary',val:86400,pct:'12%'},
      {label:'Employer ESI',note:'3.25% on wages up to threshold',val:39000,pct:'3.25%'},
      {label:'Gratuity Provision',note:'4.81% of basic salary',val:34632,pct:'4.81%'},
      {label:'LWF & Professional Tax',note:'State levied, fixed amount',val:2400,pct:null}
    ]},
  {id:'de',name:'Germany',flag:'DE',currency:'EUR',symbol:'ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬',salary:55000,
    items:[
      {label:'Base Salary',note:'Annual gross',val:55000,pct:null},
      {label:'Pension Insurance (Rentenversicherung)',note:'9.3% of gross',val:5115,pct:'9.3%'},
      {label:'Unemployment Insurance',note:'1.2% of gross',val:660,pct:'1.2%'},
      {label:'Health Insurance (Krankenversicherung)',note:'7.3% of gross',val:4015,pct:'7.3%'},
      {label:'Long-term Care Insurance (Pflegeversicherung)',note:'1.775% of gross',val:976,pct:'1.775%'}
    ]}
];
let ccActive='nl';
let ccLoading=false;

function openCostCalculator_popup(){
  const el=document.getElementById('cost-calc-overlay');
  if(!el)return;
  el.classList.remove('hidden');
  renderCCTabs();
  renderCCContent(ccActive,false);
}
function closeCostCalculator(){
  const el=document.getElementById('cost-calc-overlay');
  if(el)el.classList.add('hidden');
}
function renderCCTabs(){
  const el=document.getElementById('cc-tabs');
  if(!el)return;
  el.innerHTML=ccCountries.map(c=>`<button class="cc-tab${c.id===ccActive?' active':''}" onclick="selectCCCountry('${c.id}')">${c.flag === 'NL' ? '&#127475;&#127473;' : c.flag === 'IN' ? '&#127470;&#127475;' : '&#127465;&#127466;'} ${c.name}</button>`).join('');
}
function selectCCCountry(id){
  if(ccLoading||id===ccActive)return;
  ccActive=id;
  renderCCTabs();
  renderCCContent(id,true);
}
function renderCCContent(id,animated){
  const loader=document.getElementById('cc-loader');
  const body=document.getElementById('cc-content');
  if(!loader||!body)return;
  if(animated){
    ccLoading=true;
    loader.classList.remove('hidden');
    body.classList.add('hidden');
    setTimeout(()=>{
      loader.classList.add('hidden');
      body.classList.remove('hidden');
      buildCCBody(id,body);
      ccLoading=false;
    },1800);
  }else{
    loader.classList.add('hidden');
    body.classList.remove('hidden');
    buildCCBody(id,body);
  }
}
function buildCCBody(id,el){
  const c=ccCountries.find(x=>x.id===id);
  if(!c)return;
  const total=c.items.reduce((a,b)=>a+b.val,0);
  const overhead=c.items.filter(x=>x.val!==c.salary).reduce((a,b)=>a+b.val,0);
  const overheadPct=Math.round((overhead/c.salary)*100);
  const fmt=v=>c.symbol+v.toLocaleString();
  el.innerHTML=`<div class="cc-summary"><div><div class="cc-summary-label">Estimated Annual Employer Cost</div><div class="cc-summary-val">${fmt(total)}</div><div class="cc-summary-note">${c.currency} &bull; All figures are estimates</div></div><div style="text-align:right"><div class="cc-summary-label">Base Salary</div><div style="font-size:20px;font-weight:700">${fmt(c.salary)}</div><div class="cc-summary-note">Overhead: +${overheadPct}% above salary</div></div></div><div class="cc-breakdown"><div class="cc-breakdown-title">Cost Breakdown</div>${c.items.map(item=>`<div class="cc-row"><div><div class="cc-row-label">${item.label}</div><div class="cc-row-note">${item.note}</div></div><div style="text-align:right"><div class="cc-row-val">${fmt(item.val)}</div>${item.pct?`<div class="cc-row-pct">${item.pct}</div>`:''}</div></div>`).join('')}<div class="cc-total-row"><span class="cc-total-label">Total Annual Cost to Employer</span><span class="cc-total-val">${fmt(total)}</span></div></div><div class="cc-disclaimer">Estimates based on standard rates from ADT Compliance Hub. Actual costs vary by salary band, contract type, and local regulations. Last updated: May 2026.</div>`;
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeCostCalculator();});function openCostCalculator(){ccActiveCountry='nl';navigatePage('cost-calculator');}

/* ── COST CALCULATOR PAGE ──────────────────────────────────────────────
   Three states: 'empty' (nothing chosen yet) → 'loading' (rates being
   fetched) → 'ready' (results on screen). The page opens empty on purpose:
   no numbers are shown until the user has actually asked for them.
   Rates are per-country, against gross monthly salary. `flat` lines are
   fixed monthly amounts rather than a percentage of gross.               */
const ccPageData={
  nl:{name:'Netherlands',sym:'&#8364;',cur:'EUR',def:5000,min:2000,max:25000,step:100,updated:'Jul 2026',
    groups:[
      {key:'social',label:'Employer social security',items:[
        {label:'Unemployment insurance',note:'WW / Awf',rate:0.0274},
        {label:'Disability insurance',note:'WIA / WGA',rate:0.0627},
        {label:'Accident / return-to-work',note:'Whk differentiated premium',rate:0.0152},
        {label:'Childcare levy',note:'Wko',rate:0.0050},
        {label:'Health insurance',note:'Zvw employer levy',rate:0.0428}]},
      {key:'benefits',label:'Mandatory benefits',items:[
        {label:'Holiday allowance',note:'Vakantiegeld, accrued monthly, paid in May',rate:0.08}]}
    ]},
  in:{name:'India',sym:'&#8377;',cur:'INR',def:100000,min:20000,max:500000,step:5000,updated:'Jun 2026',
    groups:[
      {key:'social',label:'Employer social security',items:[
        {label:'Provident fund',note:'12% of basic salary',rate:0.06},
        {label:'Employee state insurance',note:'ESI, on wages up to threshold',rate:0.0325},
        {label:'Gratuity provision',note:'4.81% of basic salary',rate:0.0231}]},
      {key:'benefits',label:'Statutory levies',items:[
        {label:'Labour welfare fund & professional tax',note:'State levied, fixed amount',flat:200}]}
    ]},
  de:{name:'Germany',sym:'&#8364;',cur:'EUR',def:5000,min:1500,max:20000,step:100,updated:'Jul 2026',
    groups:[
      {key:'social',label:'Employer social security',items:[
        {label:'Pension insurance',note:'Rentenversicherung',rate:0.093},
        {label:'Unemployment insurance',note:'Arbeitslosenversicherung',rate:0.012},
        {label:'Health insurance',note:'Krankenversicherung',rate:0.073},
        {label:'Long-term care insurance',note:'Pflegeversicherung',rate:0.01775}]},
      {key:'benefits',label:'Mandatory benefits',items:[]}
    ]}
};
let ccActiveCountry='';      // nothing preselected — the user must choose
let ccSalary=0;
let ccState='empty';         // 'empty' | 'loading' | 'ready'
let ccTimers=[];

function buildCostCalculatorPageHTML(){
  const opts=Object.keys(ccPageData).map(k=>`<option value="${k}">${ccPageData[k].name}</option>`).join('');
  return `<div class="ccp">
  <div class="ccp-topbar">
    <div class="ccp-topbar-l">
      <button class="ccp-back" onclick="navigatePage('contracts')" aria-label="Back to contracts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="17" height="17"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg></button>
      <div>
        <div class="ccp-title">Cost calculator</div>
        <div class="ccp-sub">What an employee actually costs you, by country</div>
      </div>
    </div>
    <button class="btn-primary" id="cc-export" style="display:none" onclick="ccExportPDF()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export PDF</button>
  </div>

  <div class="ccp-body">

    <section class="ccp-card ccp-inputs">
      <div class="ccp-inputs-row">
        <div class="ccp-fld ccp-fld-country">
          <label class="ccp-lbl" for="cc-country">Country of employment</label>
          <select class="ccp-select" id="cc-country" onchange="ccChangeCountry(this.value)">
            <option value="" selected>Select a country&hellip;</option>${opts}
          </select>
        </div>
        <div class="ccp-fld ccp-fld-salary off" id="cc-salary-fld">
          <label class="ccp-lbl" for="cc-salary">Gross monthly salary</label>
          <div class="ccp-money">
            <span class="ccp-money-sym" id="cc-sym">&mdash;</span>
            <input class="ccp-money-inp" id="cc-salary" type="text" inputmode="numeric" autocomplete="off" disabled
                   oninput="ccOnSalaryInput(this)" onblur="ccOnSalaryBlur(this)">
          </div>
        </div>
      </div>
      <div class="ccp-slider off" id="cc-slider-wrap">
        <input type="range" class="ccp-range" id="cc-range" aria-label="Gross monthly salary" disabled oninput="ccUpdateFromSlider(this.value)">
        <div class="ccp-scale"><span id="cc-min">&nbsp;</span><span id="cc-max">&nbsp;</span></div>
      </div>
      <div class="ccp-calc-row" id="cc-calc-row"></div>
    </section>

    <div id="cc-stage"></div>

    <section class="ccp-results" id="cc-results">
      <div class="ccp-result">
        <div class="ccp-result-top">
          <div>
            <div class="ccp-result-lbl">Total employer cost &middot; per month</div>
            <div class="ccp-result-val" id="cc-total"></div>
            <div class="ccp-result-note" id="cc-total-note"></div>
          </div>
          <div class="ccp-stats">
            <div>
              <div class="ccp-stat-lbl">Gross salary</div>
              <div class="ccp-stat-val" id="cc-stat-gross"></div>
              <div class="ccp-stat-sub">Paid to the employee</div>
            </div>
            <div>
              <div class="ccp-stat-lbl">Employer add-on</div>
              <div class="ccp-stat-val" id="cc-stat-add"></div>
              <div class="ccp-stat-sub" id="cc-stat-add-sub"></div>
            </div>
          </div>
        </div>
        <div class="ccp-bar" id="cc-bar"></div>
        <div class="ccp-legend" id="cc-legend"></div>
      </div>

      <div class="ccp-card">
        <div class="ccp-card-hdr">
          <div class="ccp-card-ttl">Cost breakdown</div>
          <div class="ccp-card-sub" id="cc-bd-sub"></div>
        </div>
        <table class="ccp-tbl">
          <thead><tr>
            <th>Cost line</th>
            <th class="r ccp-w-rate">Rate</th>
            <th class="r ccp-w-num">Monthly</th>
            <th class="r ccp-w-num">Annual</th>
          </tr></thead>
          <tbody id="cc-bd-body"></tbody>
        </table>
        <div class="ccp-foot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span id="cc-foot-txt"></span>
        </div>
      </div>
    </section>

  </div>
</div>`;
}

/* ── helpers ───────────────────────────────────────────────────────────── */
function ccFmt(v){const d=ccPageData[ccActiveCountry];return (d?d.sym:'')+'&nbsp;'+Math.round(v).toLocaleString('en-US');}
function ccSet(id,html){const el=document.getElementById(id);if(el)el.innerHTML=html;}
function ccEl(id){return document.getElementById(id);}
function ccClamp(v){const d=ccPageData[ccActiveCountry];if(!d)return v;return Math.max(d.min,Math.min(d.max,v));}
function ccClearTimers(){ccTimers.forEach(clearTimeout);ccTimers=[];}
function ccAfter(ms,fn){ccTimers.push(setTimeout(fn,ms));}

/* ── lifecycle ─────────────────────────────────────────────────────────── */
// The page always opens cold: no country, no salary, no numbers.
function initCostCalcPage(){
  ccClearTimers();
  ccState='empty';
  const sel=ccEl('cc-country');if(sel)sel.value='';
  ccChangeCountry('');   // single reset path: disables the fields, shows the empty state
}

/* The Calculate button is a gate for the *first* run, not a permanent control.
   Once results are on screen the whole form is live, so a button that merely
   recomputes what already updates itself would be dead weight — it is replaced
   by a live indicator that explains why no button is needed.                */
function ccSetCalcRow(mode){
  const gate=(label,hint,disabled)=>
    '<span class="ccp-hint">'+hint+'</span>'+
    '<button class="btn-primary" id="cc-run"'+(disabled?' disabled':'')+' onclick="ccRunEstimate()">'+
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="8" y2="11"/><line x1="12" y1="11" x2="12" y2="11"/><line x1="16" y1="11" x2="16" y2="17"/><line x1="8" y1="17" x2="12" y2="17"/></svg>'+
    label+'</button>';
  const rows={
    locked: gate('Calculate cost','Select a country to begin',true),
    armed:  gate('Calculate cost','Set the salary, then run the estimate',false),
    busy:   '<button class="btn-primary" id="cc-run" disabled><span class="ccp-spin"></span>Calculating&hellip;</button>',
    live:   '<span class="ccp-live"><span class="ccp-live-dot"></span>Live estimate &mdash; the figures below follow this form as you change it</span>'
  };
  ccSet('cc-calc-row',rows[mode]);
}

function ccShowEmpty(){
  ccState='empty';
  const res=ccEl('cc-results');if(res)res.classList.remove('on');
  const exp=ccEl('cc-export');if(exp)exp.style.display='none';
  const tick='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>';
  ccSet('cc-stage',`<div class="ccp-empty">
    <div class="ccp-empty-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="8" y2="11"/><line x1="12" y1="11" x2="12" y2="11"/><line x1="16" y1="11" x2="16" y2="11"/><line x1="8" y1="16" x2="12" y2="16"/></svg></div>
    <div>
      <div class="ccp-empty-ttl">Your estimate will appear here</div>
      <div class="ccp-empty-txt">Pick a country and a gross monthly salary above, then run the estimate.</div>
      <div class="ccp-empty-list">
        <span class="ccp-empty-li">${tick}Statutory employer contributions</span>
        <span class="ccp-empty-li">${tick}Mandatory benefits and levies</span>
        <span class="ccp-empty-li">${tick}Monthly and annual figures</span>
      </div>
    </div>
  </div>`);
}

/* ── input handling ────────────────────────────────────────────────────── */
function ccChangeCountry(id){
  ccClearTimers();
  ccActiveCountry=id;
  const fld=ccEl('cc-salary-fld'),wrap=ccEl('cc-slider-wrap'),inp=ccEl('cc-salary'),sl=ccEl('cc-range');

  if(!id){ // back to "Select a country…"
    ccSalary=0;
    if(fld)fld.classList.add('off');
    if(wrap)wrap.classList.add('off');
    if(inp){inp.disabled=true;inp.value='';}
    if(sl)sl.disabled=true;
    ccSet('cc-sym','&mdash;');ccSet('cc-min','&nbsp;');ccSet('cc-max','&nbsp;');
    ccSetCalcRow('locked');
    ccShowEmpty();
    return;
  }

  const d=ccPageData[id];
  ccSalary=d.def;
  if(fld)fld.classList.remove('off');
  if(wrap)wrap.classList.remove('off');
  if(inp){inp.disabled=false;inp.value=ccSalary.toLocaleString('en-US');}
  if(sl){sl.disabled=false;sl.min=d.min;sl.max=d.max;sl.step=d.step;sl.value=ccSalary;}
  ccSet('cc-sym',d.sym);ccSet('cc-min',ccFmt(d.min));ccSet('cc-max',ccFmt(d.max));
  ccSyncSlider();

  // Rates differ per country, so an existing result is no longer valid:
  // re-run the lookup rather than leaving stale numbers on screen.
  if(ccState==='ready'||ccState==='loading'){ccRunEstimate();}
  else{ccSetCalcRow('armed');}
}

function ccUpdateFromSlider(v){
  ccSalary=parseInt(v,10);
  const inp=ccEl('cc-salary');if(inp)inp.value=ccSalary.toLocaleString('en-US');
  ccSyncSlider();
  ccLiveUpdate();
}
// While typing we keep the raw digits so the caret never jumps; the value is
// only clamped and re-formatted once the field loses focus.
function ccOnSalaryInput(el){
  const digits=el.value.replace(/[^0-9]/g,'');
  el.value=digits;
  ccSalary=parseInt(digits,10)||0;
  const sl=ccEl('cc-range');if(sl)sl.value=ccClamp(ccSalary);
  ccSyncSlider();
  ccLiveUpdate();
}
function ccOnSalaryBlur(el){
  if(!ccActiveCountry)return;
  ccSalary=ccClamp(parseInt(el.value.replace(/[^0-9]/g,''),10)||ccPageData[ccActiveCountry].def);
  el.value=ccSalary.toLocaleString('en-US');
  const sl=ccEl('cc-range');if(sl)sl.value=ccSalary;
  ccSyncSlider();
  ccLiveUpdate();
}
// Once an estimate is on screen the slider stays live — re-pressing Calculate
// for every drag would be busywork. Only a country switch re-fetches rates.
function ccLiveUpdate(){if(ccState==='ready')ccRender(false);}

function ccSyncSlider(){
  const sl=ccEl('cc-range'),d=ccPageData[ccActiveCountry];
  if(!sl||!d)return;
  sl.style.setProperty('--fill',((ccClamp(ccSalary)-d.min)/(d.max-d.min))*100+'%');
}

/* ── the estimate run: loader, then reveal ─────────────────────────────── */
const ccSteps=[
  {t:'Connecting to Compliance Hub',p:18},
  {t:'Fetching statutory rates',p:58},
  {t:'Calculating employer cost',p:88}
];
function ccRunEstimate(){
  if(!ccActiveCountry)return;
  ccClearTimers();
  ccState='loading';

  const res=ccEl('cc-results');if(res)res.classList.remove('on');
  const exp=ccEl('cc-export');if(exp)exp.style.display='none';
  ccSetCalcRow('busy');

  ccSet('cc-stage',`<div class="ccp-loading">
    <div class="ccp-ring"></div>
    <div class="ccp-step" id="cc-step">${ccSteps[0].t}<span class="ccp-step-dots"><span>.</span><span>.</span><span>.</span></span></div>
    <div class="ccp-progress"><i id="cc-prog"></i></div>
  </div>`);
  const prog=ccEl('cc-prog');
  if(prog)requestAnimationFrame(()=>{prog.style.width=ccSteps[0].p+'%';});

  ccSteps.slice(1).forEach((s,i)=>{
    ccAfter(520*(i+1),()=>{
      ccSet('cc-step',s.t+'<span class="ccp-step-dots"><span>.</span><span>.</span><span>.</span></span>');
      const p=ccEl('cc-prog');if(p)p.style.width=s.p+'%';
    });
  });

  ccAfter(1560,()=>{
    const p=ccEl('cc-prog');if(p)p.style.width='100%';
    ccState='ready';
    ccSet('cc-stage','');
    if(res)res.classList.add('on');
    if(exp)exp.style.display='';
    ccSetCalcRow('live');
    ccRender(true);
  });
}

/* ── calculation ───────────────────────────────────────────────────────── */
// Every line is rounded first and the totals are summed from the rounded
// lines, so what the user reads down the column always adds up.
function ccCompute(){
  const d=ccPageData[ccActiveCountry],s=Math.max(0,ccSalary);
  const groups=d.groups
    .map(g=>{
      const items=g.items.map(i=>({...i,amt:i.flat!=null?i.flat:Math.round(s*i.rate)}));
      return {label:g.label,key:g.key,items:items,total:items.reduce((a,b)=>a+b.amt,0)};
    })
    .filter(g=>g.items.length);
  const addOn=groups.reduce((a,g)=>a+g.total,0);
  return {d:d,s:s,groups:groups,addOn:addOn,total:s+addOn};
}

// Counts the headline figure up on a fresh reveal; live slider edits just set
// it, because a counter re-firing on every drag frame reads as jitter.
function ccCountUp(id,to){
  const el=ccEl(id);if(!el)return;
  const dur=650,t0=Date.now();
  const tick=()=>{
    if(ccState!=='ready')return;
    const k=Math.min(1,(Date.now()-t0)/dur);
    const e=1-Math.pow(1-k,3);
    el.innerHTML=ccFmt(to*e);
    if(k<1)requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function ccRender(reveal){
  if(!ccActiveCountry)return;
  const c=ccCompute(),s=c.s,total=c.total;
  const pct=s>0?(c.addOn/s*100):0;
  const mult=s>0?(total/s):0;

  if(reveal)ccCountUp('cc-total',total); else ccSet('cc-total',ccFmt(total));
  ccSet('cc-total-note',ccFmt(total*12)+' per year &middot; '+mult.toFixed(2)+'&times; the gross salary');
  ccSet('cc-stat-gross',ccFmt(s));
  ccSet('cc-stat-add','+ '+ccFmt(c.addOn));
  ccSet('cc-stat-add-sub',pct.toFixed(1)+'% on top of gross');
  ccSet('cc-bd-sub','Gross monthly salary of '+ccFmt(s)+' in '+c.d.name+', with employer contributions shown monthly and annualised.');
  ccSet('cc-foot-txt','Rates sourced live from the Compliance Hub &middot; '+c.d.name+' verified '+c.d.updated+'. Estimates only — actual cost varies with salary band, contract type and local rules.');

  // composition bar + legend (segments start at 0 and widen on the next frame)
  const seg=v=>total>0?(v/total*100):0;
  const cls=['g','s','b'];
  const widths=[seg(s)];
  let bar='<div class="ccp-seg g"></div>';
  let legend='<span class="ccp-lg"><span class="ccp-dot g"></span>Gross salary '+ccFmt(s)+'</span>';
  c.groups.forEach((g,i)=>{
    const k=cls[Math.min(i+1,2)];
    widths.push(seg(g.total));
    bar+='<div class="ccp-seg '+k+'"></div>';
    legend+='<span class="ccp-lg"><span class="ccp-dot '+k+'"></span>'+g.label+' '+ccFmt(g.total)+'</span>';
  });
  ccSet('cc-bar',bar);
  ccSet('cc-legend',legend);
  const barEl=ccEl('cc-bar');
  if(barEl){
    const paint=()=>Array.prototype.forEach.call(barEl.children,(el,i)=>{el.style.width=widths[i]+'%';});
    reveal?requestAnimationFrame(()=>requestAnimationFrame(paint)):paint();
  }

  // breakdown table
  let rows='<tr class="ccp-r-base"><td>Gross salary<span class="sub">Paid to the employee</span></td>'+
           '<td class="r rate">&mdash;</td><td class="r num">'+ccFmt(s)+'</td><td class="r num">'+ccFmt(s*12)+'</td></tr>';
  c.groups.forEach(g=>{
    // A one-line group would repeat its own subtotal, so the header stays bare.
    const gPct=s>0?(g.total/s*100):0;
    const single=g.items.length===1;
    rows+='<tr class="ccp-r-grp"><td>'+g.label+'</td>'+
          (single?'<td></td><td></td><td></td>'
                 :'<td class="r">'+gPct.toFixed(2)+'%</td><td class="r num">'+ccFmt(g.total)+'</td><td class="r num">'+ccFmt(g.total*12)+'</td>')+
          '</tr>';
    g.items.forEach(i=>{
      rows+='<tr class="ccp-r-item"><td class="line">'+i.label+(i.note?'<span class="sub">'+i.note+'</span>':'')+'</td>'+
            '<td class="r rate">'+(i.flat!=null?'Fixed':(i.rate*100).toFixed(2)+'%')+'</td>'+
            '<td class="r num">'+ccFmt(i.amt)+'</td><td class="r num">'+ccFmt(i.amt*12)+'</td></tr>';
    });
  });
  rows+='<tr class="ccp-r-total"><td>Total employer cost</td><td class="r">'+(pct?'+'+pct.toFixed(1)+'%':'&mdash;')+'</td>'+
        '<td class="r num">'+ccFmt(total)+'</td><td class="r num">'+ccFmt(total*12)+'</td></tr>';
  ccSet('cc-bd-body',rows);

  // stagger the rows in on a fresh reveal only
  const body=ccEl('cc-bd-body');
  if(body)Array.prototype.forEach.call(body.children,(tr,i)=>{tr.style.animationDelay=reveal?(0.13+i*0.035)+'s':'0s';});
}

function ccExportPDF(){
  if(ccState!=='ready')return;
  const c=ccCompute();
  showToast('Cost estimate exported','success',c.d.name+' &middot; '+ccFmt(c.total)+' per employee, per month');
}
// == SEARCH OVERLAY ==
function openSearch(){
  var ov=document.getElementById('search-overlay');
  if(!ov)return;
  ov.classList.add('open');
  var inp=document.getElementById('search-input');
  if(inp){inp.value='';setTimeout(function(){inp.focus();},80);}
  var clr=document.getElementById('search-clear-btn');
  if(clr)clr.classList.remove('visible');
}
function closeSearch(){
  var ov=document.getElementById('search-overlay');
  if(ov)ov.classList.remove('open');
}
function clearSearch(){
  var inp=document.getElementById('search-input');
  if(inp){inp.value='';inp.focus();}
  var clr=document.getElementById('search-clear-btn');
  if(clr)clr.classList.remove('visible');
}
function onSearchInput(inp){
  var clr=document.getElementById('search-clear-btn');
  if(clr)clr.classList.toggle('visible',inp.value.length>0);
}
function fillSearch(text){
  var inp=document.getElementById('search-input');
  if(inp){inp.value=text;inp.focus();onSearchInput(inp);}
}
function executeSearch(text){
  var inp=document.getElementById('search-input');
  var q=String(text||(inp&&inp.value)||'').trim().toLowerCase().replace(/\s+/g,' ');
  if(!q)return;
  var target='';
  var status=q.includes('pending')?'Pending':q.includes('inactive')?'Inactive':q.includes('active')?'Active':'';
  if(q.includes('inactive employee')){geStatusFilter='Inactive';empSubTab='global';target='employees';}
  else if(q.includes('active employee')){geStatusFilter='Active';empSubTab='global';target='employees';}
  else if(q.includes('direct employee')){empSubTab='direct';target='employees';}
  else if(q.includes('global employee')||q==='employees'||q==='employee listing'){geStatusFilter='';empSubTab='global';target='employees';}
  else if(q.includes('timesheet')){tsSubTab=q.includes('my')?'my':'all';target='timesheet';}
  else if(q.includes('contract')){target='contracts';}
  else if(q.includes('payroll')){if(status)listStatusFilters.payroll=status;else delete listStatusFilters.payroll;target='payroll';}
  else if(q.includes('compliance')){if(status)listStatusFilters.compliance=status;else delete listStatusFilters.compliance;target='compliance';}
  else if(q.includes('leave request')||q.includes('leave requests')){alStatusFilter=status||'';target='all-leaves';}
  else if(q.includes('payment')||q.includes('invoice')){pmInvoiceStatusFilter=status==='Active'?'Paid':status||'';target='payments';}
  if(target){closeSearch();navigatePage(target);}
}
function onSearchKeydown(e){
  if(e.key==='Enter'){e.preventDefault();executeSearch();}
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){closeSearch();}
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openSearch();}
});
// --- ATTENDANCE CLOCK ---
var _clockedIn=false,_clockTimer=null,_clockSecs=0;
function toggleClock(){_clockedIn?_doClockOut():_doClockIn();}
function _doClockIn(){
  _clockedIn=true;
  var now=new Date();
  var timeStr=now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
  document.getElementById('att-clockin-time').textContent=timeStr;
  document.getElementById('att-status-row').style.display='block';
  _clockSecs=0;
  _clockTimer=setInterval(function(){
    _clockSecs++;
    var h=Math.floor(_clockSecs/3600),m=Math.floor((_clockSecs%3600)/60),s=_clockSecs%60;
    document.getElementById('att-logged-time').textContent='Logged Time - '+String(h).padStart(2,'0')+'h:'+String(m).padStart(2,'0')+'m:'+String(s).padStart(2,'0')+'s';
  },1000);
  var btn=document.getElementById('att-clock-btn');
  btn.textContent='Clock Out';btn.classList.add('out');
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(p){
      var lat=p.coords.latitude.toFixed(4),lng=p.coords.longitude.toFixed(4);
      document.getElementById('att-location').textContent=lat+', '+lng;
      document.getElementById('att-in-badge').style.display='inline-flex';
    },function(){
      document.getElementById('att-location').textContent='Hyderabad';
      document.getElementById('att-in-badge').style.display='inline-flex';
    });
  } else {
    document.getElementById('att-location').textContent='Hyderabad';
    document.getElementById('att-in-badge').style.display='inline-flex';
  }
}
function _doClockOut(){
  _clockedIn=false;
  clearInterval(_clockTimer);_clockTimer=null;
  document.getElementById('att-status-row').style.display='none';
  document.getElementById('att-clockin-time').textContent='--:-- --';
  document.getElementById('att-location').textContent='--';
  document.getElementById('att-in-badge').style.display='none';
  document.getElementById('att-logged-time').textContent='Logged Time - 00h:00m';
  var btn=document.getElementById('att-clock-btn');
  btn.textContent='Clock In';btn.classList.remove('out');
}