// Kingdom Web · First-player onboarding flow.
// Steps: commander → kingdom → civilization → region → review → village placeholder.
// Self-contained: app.js only calls window.KingdomOnboarding.mount(root, options).
(function(){
  'use strict';

  /** @typedef {import('./models').OnboardingDraft} OnboardingDraft */
  /** @typedef {import('./models').OnboardingStepId} OnboardingStepId */
  /** @typedef {import('./models').OnboardingResult} OnboardingResult */
  /** @typedef {import('./models').Civilization} Civilization */
  /** @typedef {import('./models').StartingRegion} StartingRegion */
  /** @typedef {import('./models').ResourceAmounts} ResourceAmounts */

  const ns=window.KingdomOnboarding;
  if(!ns.data||!ns.store) throw new Error('onboarding/data.js and onboarding/store.js must load first');
  const data=ns.data;
  const store=ns.store;

  /** @type {{id:OnboardingStepId,label:string,title:string,hint:string}[]} */
  const STEPS=[
    {id:'commander',label:'Komutan',title:'Seni nasıl çağıralım?',hint:'Bu ad diğer oyunculara, ittifak sohbetlerinde ve savaş raporlarında görünür.'},
    {id:'kingdom',label:'Krallık',title:'Krallığına bir ad ver',hint:'Dünya haritasında sancağının altında bu ad yazacak.'},
    {id:'civilization',label:'Medeniyet',title:'Hangi halkı yöneteceksin?',hint:'Medeniyet oyun tarzını belirler. Bonuslar kalıcıdır.'},
    {id:'region',label:'Bölge',title:'Nereye yerleşeceksin?',hint:'Bölge başlangıç kaynaklarını ve komşularını belirler.'},
    {id:'review',label:'Onay',title:'Son bir bakış',hint:'Onayladıktan sonra medeniyet ve bölge değiştirilemez.'}
  ];

  /** @type {{root:HTMLElement|null,options:OnboardingMountOptions,draft:OnboardingDraft,busy:boolean}} */
  const ui={
    root:null,
    options:{},
    draft:{step:'commander',commanderName:'',kingdomName:'',civilizationId:null,regionId:null},
    busy:false
  };

  // ---------- helpers ----------

  /** @param {unknown} value */
  function esc(value){
    return String(value??'').replace(/[&<>"']/g,c=>/** @type {Record<string,string>} */({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c]);
  }

  /** @param {() => void} fn */
  function transition(fn){
    const doc=/** @type {any} */(document);
    if(doc.startViewTransition) doc.startViewTransition(fn); else fn();
  }

  /** @param {string|null} id @returns {Civilization|undefined} */
  const civById=id=>data.CIVILIZATIONS.find(c=>c.id===id);
  /** @param {string|null} id @returns {StartingRegion|undefined} */
  const regionById=id=>data.REGIONS.find(r=>r.id===id);

  const stepIndex=()=>Math.max(0,STEPS.findIndex(s=>s.id===ui.draft.step));

  /** @param {number} value @param {'percent'|'flat'} unit */
  function formatBonus(value,unit){
    const sign=value>0?'+':'';
    return unit==='percent'?`${sign}${value}%`:`${sign}${value}`;
  }

  /** @param {number} mod */
  function formatModifier(mod){
    const pct=Math.round(mod*100);
    return `${pct>0?'+':''}${pct}%`;
  }

  function persist(){ store.repository.saveDraft(ui.draft); }

  /** @returns {string|null} error for the current step */
  function stepError(){
    const d=ui.draft;
    switch(d.step){
      case 'commander': return store.validateCommanderName(d.commanderName);
      case 'kingdom': return store.validateKingdomName(d.kingdomName);
      case 'civilization': return d.civilizationId?null:'Devam etmek için bir medeniyet seç.';
      case 'region': return d.regionId?null:'Devam etmek için bir bölge seç.';
      default: return null;
    }
  }

  function suggestKingdomName(){
    const {first,second}=data.KINGDOM_NAME_PARTS;
    const pick=/** @param {string[]} a */a=>a[Math.floor(Math.random()*a.length)];
    return `${pick(first)} ${pick(second)}`;
  }

  // ---------- banner (live preview) ----------

  function bannerHtml(){
    const d=ui.draft;
    const civ=civById(d.civilizationId);
    const region=regionById(d.regionId);
    const idx=stepIndex();
    return `
      <div class="ob-banner" style="--banner:${civ?civ.color:'#2c4034'}">
        <div class="ob-pennant">
          <span class="ob-pennant-emblem" aria-hidden="true">${civ?esc(civ.emblem):'♜'}</span>
          <strong class="ob-pennant-name" data-live="kingdom">${esc(d.kingdomName.trim()||'Adsız krallık')}</strong>
          <span class="ob-pennant-meta" data-live="commander">${esc(d.commanderName.trim()||'Komutan')}</span>
          <span class="ob-pennant-meta ob-pennant-region">${region?esc(region.name):'Bölge seçilmedi'}</span>
        </div>
      </div>
      <ol class="ob-steps" aria-label="Kurulum adımları">
        ${STEPS.map((s,i)=>`
          <li class="${i<idx?'done':''} ${i===idx?'current':''}" ${i===idx?'aria-current="step"':''}>
            <span class="ob-step-num">${i<idx?'✓':i+1}</span><span class="ob-step-label">${s.label}</span>
          </li>`).join('')}
      </ol>`;
  }

  function refreshBannerText(){
    const root=ui.root; if(!root) return;
    const k=root.querySelector('[data-live="kingdom"]');
    const c=root.querySelector('[data-live="commander"]');
    if(k) k.textContent=ui.draft.kingdomName.trim()||'Adsız krallık';
    if(c) c.textContent=ui.draft.commanderName.trim()||'Komutan';
  }

  // ---------- step bodies ----------

  function commanderStep(){
    return `
      <label class="field ob-field">Komutan adı
        <input id="obInput" data-bind="commanderName" value="${esc(ui.draft.commanderName)}" autocomplete="nickname" maxlength="20" placeholder="Örn. Fatih" enterkeyhint="next" />
        <small>3–20 karakter. Harf, rakam, boşluk, - ve _ kullanılabilir.</small>
      </label>`;
  }

  function kingdomStep(){
    const chips=Array.from({length:3},()=>suggestKingdomName());
    return `
      <label class="field ob-field">Krallık adı
        <input id="obInput" data-bind="kingdomName" value="${esc(ui.draft.kingdomName)}" autocomplete="off" maxlength="28" placeholder="Örn. Kuzey Diyarı" enterkeyhint="next" />
        <small>3–28 karakter.</small>
      </label>
      <div class="ob-chips" aria-label="Ad önerileri">
        ${[...new Set(chips)].map(n=>`<button type="button" class="ob-chip" data-suggest="${esc(n)}">${esc(n)}</button>`).join('')}
        <button type="button" class="ob-chip ob-chip-ghost" data-action="reroll">Başka öner</button>
      </div>`;
  }

  /** @param {Civilization} civ */
  function civDetail(civ){
    const groups=data.BONUS_CATEGORIES
      .filter(cat=>civ.bonuses[cat].length)
      .map(cat=>`
        <div class="ob-bonus-group">
          <span class="ob-bonus-cat" data-cat="${cat}">${data.BONUS_LABELS[cat]}</span>
          <ul>${civ.bonuses[cat].map(b=>`<li><span>${esc(b.label)}</span><b class="good">${formatBonus(b.value,b.unit)}</b></li>`).join('')}</ul>
        </div>`).join('');
    return `
      <div class="ob-detail" style="--accent:${civ.color}">
        <h3><span aria-hidden="true">${esc(civ.emblem)}</span> ${esc(civ.name)}</h3>
        <p>${esc(civ.description)}</p>
        <div class="ob-bonuses">${groups}</div>
      </div>`;
  }

  function civilizationStep(){
    const selected=civById(ui.draft.civilizationId);
    return `
      <div class="ob-split">
        <div class="ob-grid" role="radiogroup" aria-label="Medeniyetler">
          ${data.CIVILIZATIONS.map(c=>`
            <button type="button" role="radio" aria-checked="${c.id===ui.draft.civilizationId}" class="ob-card ob-civ" data-civ="${c.id}" style="--accent:${c.color}">
              <span class="ob-civ-emblem" aria-hidden="tru