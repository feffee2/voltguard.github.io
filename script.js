/* ===================================================================
   VOLTGUARD — script principale
=================================================================== */

/* ============ CONFIGURAZIONE ============
   Modifica solo questi due valori quando il bot è pronto:

   1) DISCORD_INVITE_URL: il link OAuth2 reale generato in
      Discord Developer Portal → la tua app → OAuth2 → URL Generator
      (scope "bot" + i permessi elencati nel README del bot).
      Formato: https://discord.com/oauth2/authorize?client_id=IL_TUO_CLIENT_ID&permissions=...&scope=bot

   2) SUPPORT_SERVER_URL: il link di invito al tuo server Discord di supporto.
*/
const DISCORD_INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=INSERISCI_QUI_IL_CLIENT_ID&permissions=270032214&scope=bot%20applications.commands';
const SUPPORT_SERVER_URL = 'https://discord.gg/INSERISCI_QUI_IL_TUO_INVITO';

function wireDiscordLinks() {
  document.querySelectorAll('.invite-link').forEach(a => { a.href = DISCORD_INVITE_URL; });
  document.querySelectorAll('.support-link').forEach(a => { a.href = SUPPORT_SERVER_URL; });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  wireDiscordLinks();
  initNavbar();
  initMobileMenu();
  initNavIndicator();
  initReveal();
  initBackgroundCanvas();
  initStatCounters();
  initScanConsole();
  initReviews();
  initFaqAccordion();
  initBentoTilt();
  initBackToTop();
  initPayPalButtons();
});

/* -------------------------------------------------------------
   Navbar: sfondo sfumato allo scroll
------------------------------------------------------------- */
function initNavbar(){
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 24) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
}

/* -------------------------------------------------------------
   Menu mobile
------------------------------------------------------------- */
function initMobileMenu(){
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    mobile.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    mobile.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

/* -------------------------------------------------------------
   Indicatore fluido della navbar (segue link attivo/hover)
------------------------------------------------------------- */
function initNavIndicator(){
  const nav = document.getElementById('navLinks');
  const indicator = document.getElementById('navIndicator');
  const links = Array.from(nav.querySelectorAll('a[data-nav]'));
  if (!links.length) return;

  const moveTo = (el) => {
    const navRect = nav.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    indicator.style.width = rect.width + 'px';
    indicator.style.transform = `translateX(${rect.left - navRect.left - 6}px)`;
    indicator.style.opacity = '1';
  };

  let activeEl = null;

  links.forEach(link => {
    link.addEventListener('mouseenter', () => moveTo(link));
  });
  nav.addEventListener('mouseleave', () => {
    if (activeEl) moveTo(activeEl); else indicator.style.opacity = '0';
  });

  // Evidenzia la sezione visibile durante lo scroll
  const sections = links.map(l => document.querySelector(l.getAttribute('href')));
  const setActive = () => {
    let current = null;
    sections.forEach((sec, i) => {
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 140 && rect.bottom > 140) current = links[i];
    });
    if (current && current !== activeEl){
      links.forEach(l => l.classList.remove('active'));
      current.classList.add('active');
      activeEl = current;
      moveTo(current);
    }
  };
  window.addEventListener('scroll', setActive, { passive:true });
  window.addEventListener('resize', () => activeEl && moveTo(activeEl));
  setTimeout(setActive, 300);
}

/* -------------------------------------------------------------
   Reveal on scroll (IntersectionObserver)
------------------------------------------------------------- */
function initReveal(){
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  items.forEach(item => io.observe(item));
}

/* -------------------------------------------------------------
   Sfondo animato: griglia di sicurezza che reagisce al mouse
------------------------------------------------------------- */
function initBackgroundCanvas(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr;
  let nodes = [];
  const mouse = { x: -9999, y: -9999 };
  const SPACING = 74;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGrid();
  }

  function buildGrid(){
    nodes = [];
    const cols = Math.ceil(w / SPACING) + 2;
    const rows = Math.ceil(h / SPACING) + 2;
    for (let y = 0; y < rows; y++){
      for (let x = 0; x < cols; x++){
        nodes.push({
          x: x * SPACING,
          y: y * SPACING,
          ox: x * SPACING,
          oy: y * SPACING,
          vx: 0, vy: 0
        });
      }
    }
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive:true });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]){ mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
  }, { passive:true });

  function step(){
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes){
      const dx = n.ox - mouse.x;
      const dy = n.oy - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const radius = 220;
      if (dist < radius){
        const force = (1 - dist / radius) * 18;
        const angle = Math.atan2(dy, dx);
        n.vx += Math.cos(angle) * force * 0.06;
        n.vy += Math.sin(angle) * force * 0.06;
      }
      // richiamo elastico verso la posizione originale
      n.vx += (n.ox - n.x) * 0.02;
      n.vy += (n.oy - n.y) * 0.02;
      n.vx *= 0.86;
      n.vy *= 0.86;
      n.x += n.vx;
      n.y += n.vy;
    }

    ctx.lineWidth = 1;
    const cols = Math.ceil(w / SPACING) + 2;
    for (let i = 0; i < nodes.length; i++){
      const n = nodes[i];
      const right = nodes[i + 1];
      const down = nodes[i + cols];
      const distMouse = Math.hypot(n.x - mouse.x, n.y - mouse.y);
      const glow = Math.max(0, 1 - distMouse / 260);

      if (right && (i + 1) % cols !== 0){
        ctx.strokeStyle = `rgba(76,201,240,${0.035 + glow * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      }
      if (down){
        ctx.strokeStyle = `rgba(47,107,255,${0.035 + glow * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(down.x, down.y);
        ctx.stroke();
      }
      if (glow > 0.06){
        ctx.fillStyle = `rgba(150,210,255,${glow})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6 + glow * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  step();
  if (reduceMotion) { ctx.clearRect(0,0,w,h); }
}

/* -------------------------------------------------------------
   Contatori statistiche animati
------------------------------------------------------------- */
function initStatCounters(){
  const stats = document.querySelectorAll('.stat-num');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const decimal = el.dataset.decimal === 'true';
      const duration = 1800;
      const start = performance.now();

      function tick(now){
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = target * eased;
        el.textContent = (decimal ? value.toFixed(2) : Math.floor(value).toLocaleString('it-IT')) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = (decimal ? target.toFixed(2) : target.toLocaleString('it-IT')) + suffix;
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  stats.forEach(s => io.observe(s));
}

/* -------------------------------------------------------------
   Console di scansione animata nell'hero
------------------------------------------------------------- */
function initScanConsole(){
  const body = document.getElementById('scanBody');
  if (!body) return;

  const lines = [
    { tag: '[join]', text: 'utente_2481 verificato', cls: 'ok' },
    { tag: '[scan]', text: '14 messaggi analizzati', cls: '' },
    { tag: '[raid]', text: '9 join sospetti rilevati', cls: 'warn' },
    { tag: '[auto]', text: 'quarantena applicata', cls: 'block' },
    { tag: '[spam]', text: 'link malevolo bloccato', cls: 'block' },
    { tag: '[ok]', text: 'server stabile · 0 minacce', cls: 'ok' },
  ];

  let i = 0;
  function renderNext(){
    if (i >= lines.length){
      // reset con dissolvenza
      Array.from(body.children).forEach(c => c.style.transition = 'opacity .4s ease');
      Array.from(body.children).forEach(c => c.style.opacity = '0');
      setTimeout(() => { body.innerHTML = ''; i = 0; renderNext(); }, 500);
      return;
    }
    const l = lines[i];
    const row = document.createElement('div');
    row.className = 'scan-line';
    row.innerHTML = `<span class="tag">${l.tag}</span><span class="${l.cls}">${l.text}</span>`;
    body.appendChild(row);
    i++;
    setTimeout(renderNext, 900);
  }
  renderNext();
}

/* -------------------------------------------------------------
   Recensioni: generazione marquee a doppia riga
------------------------------------------------------------- */
function initReviews(){
  const reviews = [
    { name:'Marco R.', role:'Admin · Nova Gaming (18k membri)', text:'Da quando abbiamo attivato Voltguard i raid sono spariti. Il rilevamento è istantaneo e la dashboard è chiarissima.' },
    { name:'Giulia F.', role:'Moderatrice · Studio Arte IT', text:'L\'anti-spam adattivo ha ridotto il lavoro di moderazione dell\'80%. Finalmente possiamo dormire la notte.' },
    { name:'Luca B.', role:'Owner · Crypto Talk Italia', text:'Bloccato un raid di 400 account falsi in meno di un minuto. Non avevo mai visto una reazione così rapida.' },
    { name:'Sara T.', role:'Community Manager · Indie Devs', text:'La verifica utenti ha eliminato quasi tutti gli account alt. Setup fatto in 5 minuti, zero complicazioni.' },
    { name:'Davide P.', role:'Admin · Server Universitario', text:'I log in tempo reale ci hanno permesso di capire subito chi violava le regole. Trasparenza totale per lo staff.' },
    { name:'Elena M.', role:'Founder · Fashion Community', text:'Il piano Pro vale ogni centesimo. L\'auto-moderazione IA intercetta cose che noi umani ci saremmo persi.' },
    { name:'Andrea V.', role:'Moderatore · Server Musica', text:'Passati da 3 moderatori sempre online a uno part-time. Voltguard fa il lavoro pesante da solo.' },
    { name:'Chiara N.', role:'Admin · RolePlay Hub', text:'Il backup automatico ci ha salvato dopo un errore umano che aveva cancellato mezzo server. Impagabile.' },
    { name:'Federico S.', role:'Owner · Server Trading', text:'Supporto rapidissimo e bot stabilissimo. In 6 mesi zero downtime percepito dagli utenti.' },
    { name:'Alice C.', role:'Community Lead · Anime Italia', text:'La configurazione anti-raid con soglie personalizzate è perfetta per i nostri eventi con picchi di ingresso.' },
  ];

  function initials(name){
    return name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();
  }

  function cardHTML(r){
    return `
      <article class="review-card">
        <div class="review-top">
          <span class="review-avatar">${initials(r.name)}</span>
          <div>
            <div class="review-name">${r.name}</div>
            <div class="review-role">${r.role}</div>
          </div>
          <span class="review-stars">★★★★★</span>
        </div>
        <p class="review-text">"${r.text}"</p>
      </article>`;
  }

  const rowA = document.getElementById('reviewRowA');
  const rowB = document.getElementById('reviewRowB');
  const half = Math.ceil(reviews.length / 2);
  const setA = reviews.slice(0, half);
  const setB = reviews.slice(half);

  // duplichiamo il set per creare un loop infinito senza scatti
  const htmlA = setA.map(cardHTML).join('') + setA.map(cardHTML).join('');
  const htmlB = setB.map(cardHTML).join('') + setB.map(cardHTML).join('');
  rowA.innerHTML = htmlA;
  rowB.innerHTML = htmlB;
}

/* -------------------------------------------------------------
   FAQ: chiude gli altri elementi quando se ne apre uno
------------------------------------------------------------- */
function initFaqAccordion(){
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open){
        items.forEach(other => { if (other !== item) other.open = false; });
      }
    });
  });
}

/* -------------------------------------------------------------
   Effetto luce che segue il mouse sulle card bento
------------------------------------------------------------- */
function initBentoTilt(){
  const cards = document.querySelectorAll('.bento-card, .review-card, .price-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });
}

/* -------------------------------------------------------------
   Pulsante "torna su"
------------------------------------------------------------- */
function initBackToTop(){
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 700);
  }, { passive:true });
  btn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

/* -------------------------------------------------------------
   Pulsanti PayPal (Pro & Enterprise)
   NOTE: il client-id "sb" è quello sandbox di test di PayPal.
   Per andare in produzione, sostituisci "sb" nel tag <script> in
   index.html con il tuo Client ID reale, ottenibile su
   https://developer.paypal.com/dashboard/applications
------------------------------------------------------------- */
function initPayPalButtons(){
  if (typeof paypal === 'undefined'){
    // Se lo SDK non è ancora pronto, riprova tra poco
    setTimeout(initPayPalButtons, 300);
    return;
  }

  const style = {
    layout: 'vertical',
    color: 'blue',
    shape: 'pill',
    label: 'pay',
    height: 44
  };

  const renderPlan = (containerId, amount, label) => {
    const el = document.getElementById(containerId);
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = 'true';

    paypal.Buttons({
      style,
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            description: `Abbonamento Voltguard — ${label}`,
            amount: { value: amount, currency_code: 'EUR' }
          }]
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then((details) => {
          el.innerHTML = `<div class="paypal-success">✔ Pagamento completato, grazie ${details.payer.name.given_name}! Riceverai un'email di conferma.</div>`;
        });
      },
      onError: (err) => {
        console.error('Errore PayPal:', err);
        el.innerHTML = `<div class="paypal-error">Si è verificato un errore con il pagamento. Riprova tra poco.</div>`;
      }
    }).render('#' + containerId);
  };

  renderPlan('paypal-pro', '4.99', 'Pro');
  renderPlan('paypal-enterprise', '14.99', 'Enterprise');
}
