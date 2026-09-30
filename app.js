const app=document.querySelector('#app');

const state={
  screen:'loading',
  authMode:'login',
  loadingProgress:0,
  loadingStep:0,
  playerName:localStorage.getItem('kingdomPlayerName')||'',
  rememberMe:localStorage.getItem('kingdomRememberMe')==='1'
};

const loadingSteps=[
  'Dünya verileri hazırlanıyor',
  'Krallık haritası oluşturuluyor',
  'Savunma sistemleri yükleniyor',
  'Ordular hazırlanıyor',
  'Bağlantı kontrol ediliyor'
];

const transition=(callback)=>{
  if(document.startViewTransition){
    document.startViewTransition(callback);
  }else{
    callback();
  }
};

function setScreen(screen){
  transition(()=>{state.screen=screen;render();});
}

function render(){
  if(state.screen==='loading') return renderLoading();
  if(state.screen==='auth') return renderAuth();
  return renderGameShell();
}

function renderLoading(){
  app.innerHTML=`
    <section class="screen loading-screen">
      <div class="scene-noise"></div>
      <div class="mountains layer-back"></div>
      <div class="mountains layer-front"></div>
      <div class="embers" aria-hidden="true">
        ${Array.from({length:28},(_,i)=>`<i style="--i:${i};--x:${(i*37)%100}%;--d:${2.5+(i%7)*.45}s;--s:${2+(i%4)}px"></i>`).join('')}
      </div>

      <div class="brand-mark" aria-label="Kingdom">
        <div class="crest" aria-hidden="true"><span>♜</span></div>
        <div class="brand-title">KINGDOM</div>
        <div class="brand-subtitle">Age of Conquest</div>
      </div>

      <div class="loading-panel">
        <div class="loading-meta">
          <span id="loadingStep">${loadingSteps[0]}</span>
          <strong id="loadingPercent">0%</strong>
        </div>
        <div class="loading-track" aria-label="Yükleniyor"><span id="loadingBar"></span></div>
        <div class="loading-footer">
          <span>v0.1.0 · Foundation</span>
          <span>Sunucu: Otomatik</span>
        </div>
      </div>
    </section>
  `;

  const bar=document.querySelector('#loadingBar');
  const percent=document.querySelector('#loadingPercent');
  const step=document.querySelector('#loadingStep');
  let progress=0;

  const timer=setInterval(()=>{
    const remaining=100-progress;
    const inc=Math.max(1,Math.min(remaining,Math.round(remaining*.16+Math.random()*4)));
    progress=Math.min(100,progress+inc);
    state.loadingProgress=progress;
    state.loadingStep=Math.min(loadingSteps.length-1,Math.floor(progress/(100/loadingSteps.length)));
    bar.style.width=progress+'%';
    percent.textContent=progress+'%';
    step.textContent=loadingSteps[state.loadingStep];

    if(progress>=100){
      clearInterval(timer);
      setTimeout(()=>setScreen(state.playerName&&state.rememberMe?'game':'auth'),380);
    }
  },110);
}

function authFields(mode){
  if(mode==='register'){
    return `
      <div class="field-row">
        <label class="field">Komutan adı
          <input id="playerName" name="playerName" autocomplete="nickname" placeholder="Örn. Fatih" required maxlength="20" />
          <small>Oyunda görünen adın.</small>
        </label>
        <label class="field">E-posta
          <input name="email" type="email" autocomplete="email" placeholder="komutan@eposta.com" required />
          <small>Hesap kurtarma için kullanılır.</small>
        </label>
      </div>
      <div class="field-row">
        <label class="field password-field">Şifre
          <span class="input-wrap">
            <input id="password" name="password" type="password" autocomplete="new-password" placeholder="En az 8 karakter" minlength="8" required />
            <button type="button" class="peek" data-peek="password" aria-label="Şifreyi göster">◉</button>
          </span>
          <span class="strength"><i id="strengthBar"></i></span>
        </label>
        <label class="field password-field">Şifre tekrar
          <span class="input-wrap">
            <input id="passwordConfirm" name="passwordConfirm" type="password" autocomplete="new-password" placeholder="Şifreyi tekrar gir" minlength="8" required />
            <button type="button" class="peek" data-peek="passwordConfirm" aria-label="Şifreyi göster">◉</button>
          </span>
          <small id="passwordMatch">Şifreleri eşleştir.</small>
        </label>
      </div>
    `;
  }

  return `
    <label class="field">E-posta
      <input name="email" type="email" autocomplete="email" placeholder="komutan@eposta.com" required />
    </label>
    <label class="field password-field">Şifre
      <span class="input-wrap">
        <input id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••••" minlength="8" required />
        <button type="button" class="peek" data-peek="password" aria-label="Şifreyi göster">◉</button>
      </span>
    </label>
    <div class="auth-options">
      <label class="remember"><input id="rememberMe" type="checkbox" ${state.rememberMe?'checked':''}/> <span>Beni hatırla</span></label>
      <button type="button" class="link-btn" id="forgotBtn">Şifremi unuttum</button>
    </div>
  `;
}

function renderAuth(){
  const login=state.authMode==='login';
  app.innerHTML=`
    <section class="screen auth-screen">
      <div class="scene-noise"></div>
      <div class="castle-silhouette" aria-hidden="true"></div>
      <div class="auth-layout">
        <aside class="auth-copy">
          <span class="eyebrow">YENİ NESİL STRATEJİ DÜNYASI</span>
          <h1>${login?'Krallığın seni bekliyor.':'Bir köy değil, bir çağ kur.'}</h1>
          <p>${login
            ?'Şehrini büyüt, ordunu yönet ve dünya haritasında gerçek oyuncularla mücadele et.'
            :'Sıfırdan başlayan bir yerleşimi kalelere, ordulara ve yaşayan bir imparatorluğa dönüştür.'}</p>
          <div class="feature-strip">
            <span><b>01</b> Kalıcı dünya</span>
            <span><b>02</b> Gerçek zamanlı savaş</span>
            <span><b>03</b> İttifak sistemi</span>
          </div>
        </aside>

        <form class="auth-card" id="authForm" novalidate>
          <div class="auth-card-head">
            <div>
              <span class="mini-crest">♜</span>
              <strong>KINGDOM ID</strong>
            </div>
            <span class="secure-pill">● Güvenli oturum</span>
          </div>

          <div class="auth-tabs" role="tablist" aria-label="Hesap işlemleri">
            <button type="button" role="tab" aria-selected="${login}" data-mode="login" class="${login?'active':''}">Giriş Yap</button>
            <button type="button" role="tab" aria-selected="${!login}" data-mode="register" class="${!login?'active':''}">Kayıt Ol</button>
          </div>

          <div class="form-body">
            ${authFields(state.authMode)}
            <div id="formError" class="form-error" role="alert" aria-live="polite"></div>

            <button class="cta" type="submit">
              <span>${login?'Krallığa Gir':'Hesabı Oluştur'}</span>
              <b>→</b>
            </button>

            <div class="auth-divider"><span>veya</span></div>

            <div class="alt-actions">
              <button class="social" type="button" data-provider="google"><span>G</span> Google ile devam et</button>
              <button class="guest" type="button" id="guestBtn">Misafir olarak başla</button>
            </div>

            <p class="legal">Devam ederek Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmiş olursun.</p>
          </div>
        </form>
      </div>
    </section>
  `;

  bindAuth();
}

function bindAuth(){
  document.querySelectorAll('[data-mode]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      state.authMode=btn.dataset.mode;
      renderAuth();
    });
  });

  document.querySelectorAll('[data-peek]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const input=document.getElementById(btn.dataset.peek);
      const show=input.type==='password';
      input.type=show?'text':'password';
      btn.textContent=show?'◎':'◉';
      btn.setAttribute('aria-label',show?'Şifreyi gizle':'Şifreyi göster');
    });
  });

  const password=document.querySelector('#password');
  const strengthBar=document.querySelector('#strengthBar');
  const confirm=document.querySelector('#passwordConfirm');
  const match=document.querySelector('#passwordMatch');

  if(password&&strengthBar){
    password.addEventListener('input',()=>{
      strengthBar.dataset.level=String(passwordStrength(password.value));
    });
  }

  if(confirm&&match){
    const updateMatch=()=>{
      const same=password.value&&confirm.value&&password.value===confirm.value;
      match.textContent=confirm.value?(same?'Şifreler eşleşiyor.':'Şifreler eşleşmiyor.'):'Şifreleri eşleştir.';
      match.className=same?'match-ok':confirm.value?'match-bad':'';
    };
    password.addEventListener('input',updateMatch);
    confirm.addEventListener('input',updateMatch);
  }

  const forgot=document.querySelector('#forgotBtn');
  if(forgot) forgot.addEventListener('click',()=>showToast('Şifre sıfırlama Supabase bağlantısında aktif olacak.'));

  document.querySelector('[data-provider="google"]').addEventListener('click',()=>showToast('Google girişi Supabase Auth aşamasında bağlanacak.'));

  document.querySelector('#guestBtn').addEventListener('click',()=>{
    state.playerName='Misafir Komutan';
    state.rememberMe=false;
    showToast('Misafir oturumu başlatıldı.');
    setTimeout(()=>setScreen('game'),350);
  });

  document.querySelector('#authForm').addEventListener('submit',(event)=>{
    event.preventDefault();
    const error=document.querySelector('#formError');
    const data=new FormData(event.currentTarget);
    error.textContent='';

    if(!event.currentTarget.checkValidity()){
      error.textContent='Lütfen zorunlu alanları doğru şekilde doldur.';
      event.currentTarget.reportValidity();
      return;
    }

    if(state.authMode==='register'){
      const pass=String(data.get('password')||'');
      const confirmPass=String(data.get('passwordConfirm')||'');
      if(pass!==confirmPass){
        error.textContent='Şifreler eşleşmiyor.';
        return;
      }
      if(passwordStrength(pass)<3){
        error.textContent='Daha güçlü bir şifre seç. Harf, sayı ve sembol kullan.';
        return;
      }
      state.playerName=String(data.get('playerName')||'Komutan').trim();
      localStorage.setItem('kingdomPlayerName',state.playerName);
      state.rememberMe=true;
      localStorage.setItem('kingdomRememberMe','1');
      showToast('Hesap arayüzü hazır. Backend sonraki aşamada bağlanacak.');
    }else{
      state.playerName=localStorage.getItem('kingdomPlayerName')||'Komutan';
      state.rememberMe=Boolean(document.querySelector('#rememberMe')?.checked);
      localStorage.setItem('kingdomRememberMe',state.rememberMe?'1':'0');
      showToast('Giriş arayüzü doğrulandı.');
    }

    setTimeout(()=>setScreen('game'),380);
  });
}

function passwordStrength(value){
  let score=0;
  if(value.length>=8) score++;
  if(value.length>=12) score++;
  if(/[a-z]/.test(value)&&/[A-Z]/.test(value)) score++;
  if(/\d/.test(value)) score++;
  if(/[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(4,score);
}

function renderGameShell(){
  app.innerHTML=`
    <section class="screen game-shell">
      <div class="game-placeholder">
        <span class="eyebrow">FOUNDATION · AUTH FLOW</span>
        <h1>Hoş geldin, ${escapeHtml(state.playerName||'Komutan')}</h1>
        <p>Loading, giriş, kayıt, misafir oturumu ve yatay ekran akışı tamamlandı. Sıradaki milestone gerçek hesap sistemi.</p>
        <div class="placeholder-actions">
          <button id="backAuth" class="ghost">Giriş ekranına dön</button>
          <button id="logoutBtn" class="danger-ghost">Oturumu temizle</button>
        </div>
      </div>
    </section>
  `;

  document.querySelector('#backAuth').addEventListener('click',()=>setScreen('auth'));
  document.querySelector('#logoutBtn').addEventListener('click',()=>{
    localStorage.removeItem('kingdomPlayerName');
    localStorage.removeItem('kingdomRememberMe');
    state.playerName='';
    state.rememberMe=false;
    state.authMode='login';
    setScreen('auth');
  });
}

function showToast(message){
  const old=document.querySelector('.toast');
  if(old) old.remove();
  const toast=document.createElement('div');
  toast.className='toast';
  toast.textContent=message;
  document.body.appendChild(toast);
  requestAnimationFrame(()=>toast.classList.add('show'));
  setTimeout(()=>toast.remove(),2200);
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

render();
