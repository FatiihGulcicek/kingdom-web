// Kingdom Web · Onboarding static content (prototype).
// Later this can be served by the backend; the shape follows models.ts.
(function(){
  'use strict';

  /** @typedef {import('./models').Civilization} Civilization */
  /** @typedef {import('./models').StartingRegion} StartingRegion */
  /** @typedef {import('./models').BonusCategory} BonusCategory */
  /** @typedef {import('./models').ResourceAmounts} ResourceAmounts */

  /** @type {BonusCategory[]} */
  const BONUS_CATEGORIES=['economy','military','defense','research'];

  /** @type {Record<BonusCategory,string>} */
  const BONUS_LABELS={
    economy:'Ekonomi',
    military:'Askeri',
    defense:'Savunma',
    research:'Araştırma'
  };

  /** @type {Record<keyof ResourceAmounts,{label:string,icon:string}>} */
  const RESOURCES={
    wood:{label:'Odun',icon:'🪵'},
    stone:{label:'Taş',icon:'🪨'},
    food:{label:'Yemek',icon:'🌾'},
    gold:{label:'Altın',icon:'🪙'}
  };

  /** Base starting stock before region modifiers. @type {ResourceAmounts} */
  const BASE_RESOURCES={wood:600,stone:450,food:700,gold:200};

  /** @type {Civilization[]} */
  const CIVILIZATIONS=[
    {
      id:'iron-dynasty',
      name:'Demir Hanedanı',
      tagline:'Ocakta dövülen ordular',
      description:'Demirhaneleri hiç sönmeyen bir soy. Askerleri daha hızlı yetişir, erken çatışmalarda öne geçer.',
      emblem:'⚔',
      color:'#a8453a',
      focus:'military',
      bonuses:{
        economy:[],
        military:[
          {id:'mil-train-speed',category:'military',label:'Asker eğitim hızı',stat:'train.speed',value:15,unit:'percent'},
          {id:'mil-infantry-atk',category:'military',label:'Piyade saldırısı',stat:'infantry.attack',value:8,unit:'percent'}
        ],
        defense:[],
        research:[
          {id:'res-smithing',category:'research',label:'Demircilik araştırması',stat:'research.smithing',value:10,unit:'percent'}
        ]
      }
    },
    {
      id:'gilded-guilds',
      name:'Altın Loncalar',
      tagline:'Her yol pazara çıkar',
      description:'Tüccar loncalarının yönettiği bir krallık. Kaynak toplar, ticaret yapar, savaşı parayla çözer.',
      emblem:'⚖',
      color:'#c49a3c',
      focus:'economy',
      bonuses:{
        economy:[
          {id:'eco-gold-income',category:'economy',label:'Altın geliri',stat:'income.gold',value:15,unit:'percent'},
          {id:'eco-trade-fee',category:'economy',label:'Ticaret komisyonu',stat:'trade.fee',value:-20,unit:'percent'}
        ],
        military:[],
        defense:[],
        research:[
          {id:'res-cost',category:'research',label:'Araştırma maliyeti',stat:'research.cost',value:-5,unit:'percent'}
        ]
      }
    },
    {
      id:'stonewardens',
      name:'Taş Muhafızlar',
      tagline:'Surlar önce, sonra şehir',
      description:'Dağ geçitlerini yüzyıllardır tutan bir halk. Duvarları sağlamdır, kuşatmalara uzun dayanır.',
      emblem:'⛨',
      color:'#6d7f86',
      focus:'defense',
      bonuses:{
        economy:[
          {id:'eco-gather-stone',category:'economy',label:'Taş toplama hızı',stat:'gather.stone',value:10,unit:'percent'}
        ],
        military:[],
        defense:[
          {id:'def-wall-hp',category:'defense',label:'Sur dayanıklılığı',stat:'wall.hp',value:20,unit:'percent'},
          {id:'def-tower-range',category:'defense',label:'Kule menzili',stat:'tower.range',value:1,unit:'flat'}
        ],
        research:[]
      }
    },
    {
      id:'star-seers',
      name:'Yıldız Kâhinleri',
      tagline:'Göğü okuyan, geleceği kuran',
      description:'Rasathaneler etrafında büyümüş bir krallık. Teknolojiyi herkesten önce açar.',
      emblem:'✶',
      color:'#4f6fa3',
      focus:'research',
      bonuses:{
        economy:[],
        military:[],
        defense:[
          {id:'def-scout',category:'defense',label:'Düşman erken uyarısı',stat:'scout.warning',value:30,unit:'percent'}
        ],
        research:[
          {id:'res-speed',category:'research',label:'Araştırma hızı',stat:'research.speed',value:20,unit:'percent'},
          {id:'res-slots',category:'research',label:'Eşzamanlı araştırma',stat:'research.queue',value:1,unit:'flat'}
        ]
      }
    }
  ];

  /** @type {StartingRegion[]} */
  const REGIONS=[
    {
      id:'emerald-plains',
      name:'Zümrüt Ovaları',
      terrain:'plains',
      description:'Verimli, açık araziler. Tarım kolay, ama saklanacak yer az.',
      difficulty:'easy',
      resourceModifiers:{food:.3,wood:-.1},
      recommendedCivilizationIds:['gilded-guilds','iron-dynasty']
    },
    {
      id:'northern-woods',
      name:'Kuzey Ormanları',
      terrain:'forest',
      description:'Sık ağaçlar erken inşaatı hızlandırır, yollar ise dar.',
      difficulty:'normal',
      resourceModifiers:{wood:.35,food:-.1},
      recommendedCivilizationIds:['iron-dynasty','star-seers']
    },
    {
      id:'granite-heights',
      name:'Granit Tepeler',
      terrain:'highlands',
      description:'Doğal bir kale. Taş bol, yiyecek kıt.',
      difficulty:'hard',
      resourceModifiers:{stone:.4,food:-.2},
      recommendedCivilizationIds:['stonewardens']
    },
    {
      id:'salt-coast',
      name:'Tuz Kıyısı',
      terrain:'coast',
      description:'Limanlar ve tuz yolları. Altın akar, saldırı her yönden gelir.',
      difficulty:'normal',
      resourceModifiers:{gold:.5,stone:-.15},
      recommendedCivilizationIds:['gilded-guilds','star-seers']
    }
  ];

  /** @type {Record<import('./models').RegionDifficulty,string>} */
  const DIFFICULTY_LABELS={easy:'Kolay',normal:'Orta',hard:'Zor'};

  const KINGDOM_NAME_PARTS={
    first:['Kuzey','Altın','Demir','Gümüş','Çınar','Şimşek','Ay','Güneş','Rüzgâr','Kartal'],
    second:['Diyarı','Beyliği','Sancağı','Tahtı','Kalesi','Yurdu','Hanlığı']
  };

  window.KingdomOnboarding=window.KingdomOnboarding||{};
  window.KingdomOnboarding.data={
    BONUS_CATEGORIES,BONUS_LABELS,RESOURCES,BASE_RESOURCES,
    CIVILIZATIONS,REGIONS,DIFFICULTY_LABELS,KINGDOM_NAME_PARTS
  };
})();
