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
  /** @param {string|null} id @returns {StartingRegion|undefin