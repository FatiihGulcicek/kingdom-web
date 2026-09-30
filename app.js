const app=document.querySelector('#app');

const state={
  screen:'loading',
  authMode:'login',
  loadingProgress:0,
  playerName:localStorage.getItem('kingdomPlayerName')||''
};

function setScreen(screen){
  state.screen=screen;
  render();
}

function render(){
  if(state.screen==='loading') return renderLoading();
  if(state.screen==='auth') return renderAuth();
  return renderGameShell();
}

function renderLoading(){
  app.innerHTML=`
    <section class="screen loading-screen">
      <div class="loading-vignette"></div>
      <div class="brand-mark" aria-label="Kingdom">
        <div class="crown">♛</div>
        <h1>KINGDOM</h1>
        <p>Rise of Empires</p>
      </div>
      <div class="loading-panel">
        <div class="loading-text"><span>Krallık hazırlanıyor</span><strong id="loadingPercent">0%</strong></div>
        <div class="loading-track"><span id="loadingBar"></span></div>
        <small>© 2026 Kingdom Project</small>
      </div>
    </section>
  `;

  const bar=document.querySelector('#loadingBar');
  const percent=document.querySelector('#loadingPercent');
  const timer=setInterval(()=>{
    state.loadingProgress=Math.min(100,state.loadingProgress+Math.ceil(Math.random()*8));
    bar.style.width=state.loadingProgress+'%';
    percent.textContent=state.loadingProgress+'%';
    if(state.loadingProgress>=100){
      clearInterval(timer);
      setTimeout(()=>setScreen(state.playerName?'game':'auth'),300);
    }
  },120);
}

function authPanel(mode){
  const login=mode==='login';
  return `
    <div class="auth-copy">
      <span class="eyebrow">KRALLIĞINA DÖN</span>
      <h1>${login?'Komutan, hoş geldin.':'Yeni bir krallık kur.'}</h1>
      <p>${login?'Orduların seni bekliyor. Hesabına giriş yap ve kaldığın yerden devam et.':'Adını tarihe yaz. Hesabını oluştur ve ilk şehrini kurmaya başla.'}</p>
    </div>
    <form class="auth-card" id="authForm">
      <div class="auth-tabs">
        <button type="button" data-mode="login" class="${login?'active':''}">Giriş Yap</button>
        <button type="button" data-mode="register" class="${!login?'active':''}">Kayıt Ol</button>
      </div>
      ${!login?'<label>Komutan adı<input id="playerName" name="playerName" autocomplete="nickname" placeholder="Örn. Fatih" required maxlength="20"/></label>':''}
      <label>E-posta<input name="email" type="email" autocomplete="email" placeholder="komutan@kingdom.com" required/></label>
      <label>Şifre<input name="password" type="password" autocomplete="${login?'current-password':'new-password'}" placeholder="••••••••" minlength="6" required/></label>
      ${!login?'<label>Şifre tekrar<input name="passwordConfirm" type="password" autocomplete="new-password" placeholder="••••••••" minlength="6" required/></label>':''}
      <button class="cta" type="submit">${login?'Krallığa Gir':'Krallığı Kur'}</button>
      <div class="auth-divider"><span>veya</span></div>
      <button class="social" type="button">G Google ile devam et</button>
      <p class="legal">Devam ederek kullanım koşullarını ve gizlilik politikasını kabul etmiş olursun.</p>
    </form>
  `;
}

function renderAuth(){
  app.innerHTML=`
    <section class="screen auth-screen">
      <div class="auth-backdrop"></div>
      <div class="auth-layout">
        ${authPanel(state.authMode)}
      </div>
    </section>
  `;

  document.querySelectorAll('[data-mode]').forEach(btn=>{
    btn.onclick=()=>{
      state.authMode=btn.dataset.mode;
      renderAuth();
    };
  });

  document.querySelector('#authForm').onsubmit=(event)=>{
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    if(state.authMode==='register'){
      if(data.get('password')!==data.get('passwordConfirm')){
        showToast('Şifreler eşleşmiyor.');
        return;
      }
      state.playerName=(data.get('playerName')||'Komutan').trim();
    } else {
      state.playerName=localStorage.getItem('kingdomPlayerName')||'Komutan';
    }
    localStorage.setItem('kingdomPlayerName',state.playerName);
    showToast(state.authMode==='register'?'Krallığın kuruldu.':'Giriş başarılı.');
    setTimeout(()=>setScreen('game'),450);
  };
}

function renderGameShell(){
  app.innerHTML=`
    <section class="screen game-shell">
      <div class="game-placeholder">
        <span class="eyebrow">AŞAMA 1 TAMAMLANDI</span>
        <h1>Hoş geldin, ${escapeHtml(state.playerName||'Komutan')}</h1>
        <p>Bir sonraki adımda ana köy ekranını burada kuracağız.</p>
        <button id="logoutBtn" class="ghost">Çıkış yap</button>
      </div>
    </section>
  `;
  document.querySelector('#logoutBtn').onclick=()=>{
    localStorage.removeItem('kingdomPlayerName');
    state.playerName='';
    state.authMode='login';
    setScreen('auth');
  };
}

function showToast(message){
  const old=document.querySelector('.toast');
  if(old) old.remove();
  const toast=document.createElement('div');
  toast.className='toast';
  toast.textContent=message;
  document.body.appendChild(toast);
  requestAnimationFrame(()=>toast.classList.add('show'));
  setTimeout(()=>toast.remove(),1800);
}

function escapeHtml(value){
  return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

render();
