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
              <span class="ob-civ-emblem" aria-hidden="true">${esc(c.emblem)}</span>
              <span class="ob-card-text">
                <span class="ob-focus">${data.BONUS_LABELS[c.focus]}</span>
                <strong>${esc(c.name)}</strong>
                <span>${esc(c.tagline)}</span>
              </span>
            </button>`).join('')}
        </div>
        ${selected?civDetail(selected):'<div class="ob-detail ob-detail-empty"><p>Bonuslarını görmek için bir medeniyet seç.</p></div>'}
      </div>`;
  }

  /** @param {StartingRegion} region */
  function regionDetail(region){
    const res=store.startingResources(region.id);
    const civ=civById(ui.draft.civilizationId);
    const recommended=civ&&region.recommendedCivilizationIds.includes(civ.id);
    const keys=/** @type {(keyof ResourceAmounts)[]} */(Object.keys(data.RESOURCES));
    return `
      <div class="ob-detail" data-terrain="${region.terrain}">
        <h3>${esc(region.name)}</h3>
        <p>${esc(region.description)}</p>
        <div class="ob-tags">
          <span class="ob-tag" data-difficulty="${region.difficulty}">Zorluk: ${data.DIFFICULTY_LABELS[region.difficulty]}</span>
          ${recommended?`<span class="ob-tag ob-tag-good">${esc(civ.name)} için uygun</span>`:''}
        </div>
        <ul class="ob-res">
          ${keys.map(k=>{
            const mod=region.resourceModifiers[k]||0;
            return `<li><span>${data.RESOURCES[k].icon} ${data.RESOURCES[k].label}</span><b>${res[k]}</b>${mod?`<em class="${mod>0?'good':'bad'}">${formatModifier(mod)}</em>`:'<em></em>'}</li>`;
          }).join('')}
        </ul>
      </div>`;
  }

  function regionStep(){
    const selected=regionById(ui.draft.regionId);
    const civ=civById(ui.draft.civilizationId);
    return `
      <div class="ob-split">
        <div class="ob-grid" role="radiogroup" aria-label="Başlangıç bölgeleri">
          ${data.REGIONS.map(r=>`
            <button type="button" role="radio" aria-checked="${r.id===ui.draft.regionId}" class="ob-card ob-region" data-region="${r.id}" data-terrain="${r.terrain}">
              <span class="ob-card-text">
                <strong>${esc(r.name)}</strong>
                <span>${data.DIFFICULTY_LABELS[r.difficulty]}${civ&&r.recommendedCivilizationIds.includes(civ.id)?' · Önerilen':''}</span>
              </span>
            </button>`).join('')}
        </div>
        ${selected?regionDetail(selected):'<div class="ob-detail ob-detail-empty"><p>Başlangıç kaynaklarını görmek için bir bölge seç.</p></div>'}
      </div>`;
  }

  function reviewStep(){
    const d=ui.draft;
    const civ=civById(d.civilizationId);
    const region=regionById(d.regionId);
    const res=region?store.startingResources(region.id):null;
    const keys=/** @type {(keyof ResourceAmounts)[]} */(Object.keys(data.RESOURCES));
    /** @param {string} label @param {string} value @param {OnboardingStepId} step */
    const row=(label,value,step)=>`
      <div class="ob-review-row">
        <span>${label}</span><strong>${value}</strong>
        <button type="button" class="ob-edit" data-goto="${step}" aria-label="${label} düzenle">Düzenle</button>
      </div>`;
    return `
      <div class="ob-review">
        <div class="ob-review-list">
          ${row('Komutan',esc(d.commanderName.trim()),'commander')}
          ${row('Krallık',esc(d.kingdomName.trim()),'kingdom')}
          ${row('Medeniyet',civ?`${esc(civ.emblem)} ${esc(civ.name)}`:'—','civilization')}
          ${row('Bölge',region?esc(region.name):'—','region')}
        </div>
        ${res?`
        <div class="ob-review-res">
          <span>Başlangıç kaynakları</span>
          <ul>${keys.map(k=>`<li>${data.RESOURCES[k].icon}<b>${res[k]}</b></li>`).join('')}</ul>
        </div>`:''}
      </div>`;
  }

  /** @param {OnboardingStepId} step */
  function stepBody(step){
    switch(step){
      case 'commander': return commanderStep();
      case 'kingdom': return kingdomStep();
      case 'civilization': return civilizationStep();
      case 'region': return regionStep();
      default: return reviewStep();
    }
  }

  // ---------- render ----------

  function renderFlow(){
    const root=ui.root; if(!root) return;
    const idx=stepIndex();
    const step=STEPS[idx];
    const last=idx===STEPS.length-1;
    root.innerHTML=`
      <section class="screen ob-screen">
        <div class="scene-noise"></div>
        <aside class="ob-rail">${bannerHtml()}</aside>
        <div class="ob-main">
          <header class="ob-head">
            <span class="ob-count">Adım ${idx+1} / ${STEPS.length}</span>
            <h2 id="obTitle" tabindex="-1">${step.title}</h2>
            <p>${step.hint}</p>
          </header>
          <div class="ob-body">${stepBody(step.id)}</div>
          <footer class="ob-foot">
            <div id="obError" class="form-error ob-error" role="alert" aria-live="polite"></div>
            <div class="ob-actions">
              <button type="button" class="ghost ob-back" data-action="back">${idx===0?'Çıkış':'Geri'}</button>
              <button type="button" class="cta ob-next" data-action="next" ${ui.busy?'disabled':''}>
                <span>${last?'Krallığı kur':'Devam'}</span>
              </button>
            </div>
          </footer>
        </div>
      </section>`;
    bindFlow();
    const title=/** @type {HTMLElement|null} */(root.querySelector('#obTitle'));
    title?.focus({preventScroll:true});
  }

  /** @param {string} message */
  function showError(message){
    const el=ui.root?.querySelector('#obError');
    if(el) el.textContent=message;
  }

  /** @param {OnboardingStepId} step */
  function goTo(step){
    ui.draft.step=step;
    persist();
    transition(renderFlow);
  }

  async function next(){
    if(ui.busy) return;
    const error=stepError();
    if(error){ showError(error); return; }
    const idx=stepIndex();
    if(idx<STEPS.length-1){ goTo(STEPS[idx+1].id); return; }

    ui.busy=true;
    try{
      const result=await store.repository.complete(ui.draft);
      transition(()=>renderVillage(result));
    }catch(err){
      showError(err instanceof Error?err.message:'Krallık kurulamadı. Seçimlerini kontrol edip tekrar dene.');
    }finally{
      ui.busy=false;
    }
  }

  function back(){
    const idx=stepIndex();
    if(idx===0){ ui.options.onExit?.(); return; }
    goTo(STEPS[idx-1].id);
  }

  function bindFlow(){
    const root=ui.root; if(!root) return;

    root.querySelectorAll('[data-action="next"]').forEach(b=>b.addEventListener('click',next));
    root.querySelectorAll('[data-action="back"]').forEach(b=>b.addEventListener('click',back));

    const input=/** @type {HTMLInputElement|null} */(root.querySelector('#obInput'));
    if(input){
      const key=/** @type {'commanderName'|'kingdomName'} */(input.dataset.bind);
      input.addEventListener('input',()=>{
        ui.draft[key]=input.value;
        showError('');
        refreshBannerText();
        persist();
      });
      input.addEventListener('keydown',e=>{
        if(e.key==='Enter'){ e.preventDefault(); input.blur(); next(); }
      });
    }

    root.querySelectorAll('[data-suggest]').forEach(btn=>btn.addEventListener('click',()=>{
      const name=/** @type {HTMLElement} */(btn).dataset.suggest||'';
      ui.draft.kingdomName=name;
      if(input) input.value=name;
      showError('');
      refreshBannerText();
      persist();
    }));

    root.querySelector('[data-action="reroll"]')?.addEventListener('click',()=>{
      const chips=root.querySelectorAll('[data-suggest]');
      chips.forEach(chip=>{
        const n=suggestKingdomName();
        /** @type {HTMLElement} */(chip).dataset.suggest=n;
        chip.textContent=n;
      });
    });

    root.querySelectorAll('[data-civ]').forEach(btn=>btn.addEventListener('click',()=>{
      ui.draft.civilizationId=/** @type {HTMLElement} */(btn).dataset.civ||null;
      persist();
      renderFlow();
      /** @type {HTMLElement|null} */(root.querySelector(`[data-civ="${ui.draft.civilizationId}"]`))?.focus({preventScroll:true});
    }));

    root.querySelectorAll('[data-region]').forEach(btn=>btn.addEventListener('click',()=>{
      ui.draft.regionId=/** @type {HTMLElement} */(btn).dataset.region||null;
      persist();
      renderFlow();
      /** @type {HTMLElement|null} */(root.querySelector(`[data-region="${ui.draft.regionId}"]`))?.focus({preventScroll:true});
    }));

    root.querySelectorAll('[data-goto]').forEach(btn=>btn.addEventListener('click',()=>{
      goTo(/** @type {OnboardingStepId} */(/** @type {HTMLElement} */(btn).dataset.goto));
    }));

    // Arrow-key navigation inside radio groups.
    root.querySelectorAll('[role="radiogroup"]').forEach(group=>group.addEventListener('keydown',e=>{
      const ev=/** @type {KeyboardEvent} */(e);
      if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(ev.key)) return;
      const items=/** @type {HTMLElement[]} */(Array.from(group.querySelectorAll('[role="radio"]')));
      const i=items.indexOf(/** @type {HTMLElement} */(document.activeElement));
      if(i<0) return;
      ev.preventDefault();
      const dir=ev.key==='ArrowRight'||ev.key==='ArrowDown'?1:-1;
      items[(i+dir+items.length)%items.length].click();
    }));
  }

  // ---------- village placeholder ----------

  /** @param {OnboardingResult} result */
  function renderVillage(result){
    const root=ui.root; if(!root) return;
    const {profile,kingdom}=result;
    const civ=civById(kingdom.civilizationId);
    const region=regionById(kingdom.regionId);
    const keys=/** @type {(keyof ResourceAmounts)[]} */(Object.keys(data.RESOURCES));
    root.innerHTML=`
      <section class="screen ob-village" data-terrain="${region?region.terrain:'plains'}" style="--banner:${civ?civ.color:'#2c4034'}">
        <div class="scene-noise"></div>
        <header class="ob-village-bar">
          <div class="ob-village-id">
            <span class="ob-village-emblem" aria-hidden="true">${civ?esc(civ.emblem):'♜'}</span>
            <div><strong>${esc(kingdom.name)}</strong><span>${esc(profile.commanderName)} · Seviye ${kingdom.level}</span></div>
          </div>
          <ul class="ob-village-res" aria-label="Kaynaklar">
            ${keys.map(k=>`<li title="${data.RESOURCES[k].label}">${data.RESOURCES[k].icon} <b>${kingdom.resources[k]}</b></li>`).join('')}
          </ul>
        </header>
        <div class="ob-village-ground" aria-hidden="true"><div class="ob-village-plot"></div><span class="ob-village-keep">♜</span></div>
        <div class="ob-village-card">
          <h2>İlk köyün hazır</h2>
          <p>${civ?esc(civ.name):''} halkı ${region?esc(region.name):''} bölgesine yerleşti. Bina yerleşimi ve inşaat bir sonraki aşamada bu ekrana gelecek.</p>
          <div class="placeholder-actions">
            <button type="button" class="ghost" data-action="exit">Giriş ekranına dön</button>
            <button type="button" class="danger-ghost" data-action="restart">Kurulumu baştan yap</button>
          </div>
        </div>
      </section>`;

    root.querySelector('[data-action="exit"]')?.addEventListener('click',()=>ui.options.onExit?.());
    root.querySelector('[data-action="restart"]')?.addEventListener('click',async()=>{
      await store.repository.reset();
      ui.draft={step:'commander',commanderName:ui.options.commanderName||'',kingdomName:'',civilizationId:null,regionId:null};
      transition(renderFlow);
    });
  }

  // ---------- public entry ----------

  /**
   * Mount onboarding into `root`. Shows the village placeholder if onboarding
   * was already completed, otherwise resumes (or starts) the flow.
   * @param {HTMLElement} root
   * @param {OnboardingMountOptions} [options]
   */
  async function mount(root,options={}){
    ui.root=root;
    ui.options=options;
    const [result,draft]=await Promise.all([store.repository.loadResult(),store.repository.loadDraft()]);
    if(result&&result.profile&&result.profile.onboardingCompleted){ renderVillage(result); return; }

    const prefill=(options.commanderName||'').trim();
    ui.draft=draft&&STEPS.some(s=>s.id===draft.step)
      ?draft
      :{step:'commander',commanderName:prefill==='Misafir Komutan'?'':prefill,kingdomName:'',civilizationId:null,regionId:null};
    renderFlow();
  }

  ns.mount=mount;
})();
