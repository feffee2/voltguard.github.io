'use strict';
/* ════════════════════════════════
   FEFFE PHONE — app.js
   ════════════════════════════════ */

// ── STATE ─────────────────────────────────────────────────────────────────────
let cart = [];

// ── NAVBAR ────────────────────────────────────────────────────────────────────
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navDrawer = document.getElementById('navDrawer');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('opaque', window.scrollY > 10);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const open = navDrawer.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

navDrawer.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navDrawer.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ── CART OPEN / CLOSE ─────────────────────────────────────────────────────────
const cartDrawer = document.getElementById('cartDrawer');
const overlay    = document.getElementById('overlay');
const cartBtn    = document.getElementById('cartBtn');

cartBtn.addEventListener('click', openCart);

function openCart() {
  cartDrawer.classList.add('show');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
  cartDrawer.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  cartDrawer.classList.remove('show');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  cartDrawer.setAttribute('aria-hidden', 'true');
}
window.closeCart = closeCart;

// ── ADD TO CART ───────────────────────────────────────────────────────────────
window.addToCart = function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  renderCart();
  showToast(`${name} aggiunto al carrello`);
};

// ── CHANGE QTY ────────────────────────────────────────────────────────────────
window.changeQty = function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
};

// ── RENDER CART ───────────────────────────────────────────────────────────────
function renderCart() {
  const listEl  = document.getElementById('cartList');
  const footEl  = document.getElementById('cartFoot');
  const totalEl = document.getElementById('cartTotal');
  const badge   = document.getElementById('cartBadge');

  const count = cart.reduce((s, i) => s + i.qty, 0);
  badge.classList.toggle('show', count > 0);

  if (cart.length === 0) {
    listEl.innerHTML = `
      <div class="cart-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <p>Il carrello è vuoto</p>
      </div>`;
    footEl.hidden = true;
    return;
  }

  footEl.hidden = false;

  listEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="ci-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="5" y="2" width="14" height="20" rx="3"/>
          <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2"/>
        </svg>
      </div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">€${(item.price * item.qty).toLocaleString('it-IT')}</div>
      </div>
      <div class="ci-qty">
        <button class="q-btn" onclick="changeQty(${i},-1)" aria-label="Rimuovi uno">−</button>
        <span class="q-num">${item.qty}</span>
        <button class="q-btn" onclick="changeQty(${i},1)"  aria-label="Aggiungi uno">+</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  totalEl.textContent = `€${total.toLocaleString('it-IT')}`;
}

// ── CHECKOUT ──────────────────────────────────────────────────────────────────
window.doCheckout = function doCheckout() {
  cart = [];
  renderCart();
  closeCart();
  showToast('Ordine confermato! Grazie per il tuo acquisto 🎉');
};

// ── TOAST ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  document.getElementById('toastTxt').textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── FILTER TABS ───────────────────────────────────────────────────────────────
const filts = document.querySelectorAll('.filt');
const cards = document.querySelectorAll('.card');

filts.forEach(btn => {
  btn.addEventListener('click', () => {
    filts.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected','true');

    const f = btn.dataset.f;
    let delay = 0;
    cards.forEach(card => {
      const tags = card.dataset.tags || '';
      const visible = f === 'all' || tags.includes(f);
      if (visible) {
        card.classList.remove('hidden');
        card.style.animationDelay = `${delay * 40}ms`;
        card.style.animation = 'none';
        void card.offsetHeight;
        card.style.animation = 'cardIn 0.35s var(--ease) both';
        delay++;
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ── COLOR SWATCHES ────────────────────────────────────────────────────────────
document.querySelectorAll('.card-swatches, .spot-colors-grid').forEach(group => {
  const items = group.querySelectorAll('.sw, .color-thumb');
  items.forEach(swatch => {
    swatch.addEventListener('click', () => {
      items.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });
});

// ── CONTACT FORM ──────────────────────────────────────────────────────────────
window.submitForm = function submitForm(e) {
  e.preventDefault();
  const btn = document.getElementById('fsubmit');
  btn.disabled = true;
  btn.textContent = 'Invio in corso…';
  setTimeout(() => {
    e.target.reset();
    btn.textContent = '✓ Messaggio inviato!';
    btn.style.background = 'var(--green)';
    showToast('Messaggio inviato. Ti risponderemo presto!');
    setTimeout(() => {
      btn.textContent = 'Invia messaggio';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }, 1200);
};

// ── SCROLL REVEAL ─────────────────────────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) {
      target.classList.add('in');
      revealObs.unobserve(target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.card, .svc-card, .spot-text, .spot-imgs, .contact-info, .contact-form').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 60}ms`;
  revealObs.observe(el);
});

// ── SMOOTH SCROLL ─────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + scrollY - 60;
    scrollTo({ top, behavior: 'smooth' });
  });
});

// ── CARD ANIMATION KEYFRAME (runtime inject) ──────────────────────────────────
const s = document.createElement('style');
s.textContent = `
  @keyframes cardIn {
    from { opacity:0; transform:translateY(16px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
`;
document.head.appendChild(s);

// ── INIT ──────────────────────────────────────────────────────────────────────
renderCart();
