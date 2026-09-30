// Kingdom Web · Onboarding local prototype store.
// Implements OnboardingRepository (models.ts) on top of localStorage.
// Replace `repository` with a Supabase-backed implementation later;
// the UI only talks to this interface.
(function(){
  'use strict';

  /** @typedef {import('./models').OnboardingDraft} OnboardingDraft */
  /** @typedef {import('./models').OnboardingResult} OnboardingResult */
  /** @typedef {import('./models').OnboardingRepository} OnboardingRepository */
  /** @typedef {import('./models').ResourceAmounts} ResourceAmounts */

  const ns=window.KingdomOnboarding;
  if(!ns.data) throw new Error('onboarding/data.js must load before store.js');
  const data=ns.data;

  const KEYS={
    draft:'kingdom.onboarding.draft.v1',
    result:'kingdom.onboarding.result.v1'
  };

  /** @param {string} key */
  function readJson(key){
    try{
      const raw=localStorage.getItem(key);
      return raw?JSON.parse(raw):null;
    }catch{ return null; }
  }

  /** @param {string} key @param {unknown} value */
  function writeJson(key,value){
    try{ localStorage.setItem(key,JSON.stringify(value)); }catch{ /* storage full or blocked: prototype keeps running in memory */ }
  }

  /** @param {string} key */
  function remove(key){
    try{ localStorage.removeItem(key); }catch{ /* ignore */ }
  }

  /** @param {string} prefix */
  function makeId(prefix){
    const rand=(globalThis.crypto&&'randomUUID' in crypto)
      ?crypto.randomUUID()
      :Date.now().toString(36)+Math.random().toString(36).slice(2,10);
    return `${prefix}_${rand}`;
  }

  const NAME_PATTERN=/^[\p{L}\p{N} '_-]+$/u;

  /** @param {string} value @returns {string|null} error message or null */
  function validateCommanderName(value){
    const v=value.trim();
    if(v.length<3) return 'Komutan adı en az 3 karakter olmalı.';
    if(v.length>20) return 'Komutan adı en fazla 20 karakter olabilir.';
    if(!NAME_PATTERN.test(v)) return 'Sadece harf, rakam, boşluk, - ve _ kullanabilirsin.';
    return null;
  }

  /** @param {string} value @returns {string|null} */
  function validateKingdomName(value){
    const v=value.trim();
    if(v.length<3) return 'Krallık adı en az 3 karakter olmalı.';
    if(v.length>28) return 'Krallık adı en fazla 28 karakter olabilir.';
    if(!NAME_PATTERN.test(v)) return 'Sadece harf, rakam, boşluk, - ve _ kullanabilirsin.';
    return null;
  }

  /** @param {string} regionId @returns {ResourceAmounts} */
  function startingResources(regionId){
    const region=data.REGIONS.find(r=>r.id===regionId);
    const mods=region?region.resourceModifiers:{};
    /** @type {ResourceAmounts} */
    const out={...data.BASE_RESOURCES};
    for(const key of /** @type {(keyof ResourceAmounts)[]} */(Object.keys(out))){
      out[key]=Math.round(out[key]*(1+(mods[key]||0)));
    }
    return out;
  }

  /** @type {OnboardingRepository} */
  const repository={
    async loadDraft(){ return readJson(KEYS.draft); },
    async saveDraft(draft){ writeJson(KEYS.draft,draft); },

    async complete(draft){
      const nameError=validateCommanderName(draft.commanderName)||validateKingdomName(draft.kingdomName);
      if(nameError) throw new Error(nameError);
      if(!data.CIVILIZATIONS.some(c=>c.id===draft.civilizationId)) throw new Error('Geçerli bir medeniyet seç.');
      if(!data.REGIONS.some(r=>r.id===draft.regionId)) throw new Error('Geçerli bir başlangıç bölgesi seç.');

      const now=new Date().toISOString();
      const profileId=makeId('player');
      const kingdomId=makeId('kingdom');
      /** @type {OnboardingResult} */
      const result={
        profile:{
          id:profileId,
          commanderName:draft.commanderName.trim(),
          kingdomId,
          onboardingCompleted:true,
          createdAt:now,
          updatedAt:now
        },
        kingdom:{
          id:kingdomId,
          name:draft.kingdomName.trim(),
          ownerId:profileId,
          civilizationId:/** @type {string} */(draft.civilizationId),
          regionId:/** @type {string} */(draft.regionId),
          level:1,
          resources:startingResources(/** @type {string} */(draft.regionId)),
          createdAt:now
        }
      };
      writeJson(KEYS.result,result);
      remove(KEYS.draft);
      return result;
    },

    async loadResult(){ return readJson(KEYS.result); },

    async reset(){
      remove(KEYS.draft);
      remove(KEYS.result);
    }
  };

  ns.store={repository,validateCommanderName,validateKingdomName,startingResources};
})();
