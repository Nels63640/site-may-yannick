/* ═══════════════════════════════════════════════════════════════════════════
   SAS MAY YANNICK — Plombier Chauffagiste
   script.js — Interactions & animations

   ⚙️  CONFIGURATION EMAIL — Web3Forms (gratuit, sans serveur)
   Les demandes de devis arrivent directement sur l'email ci-dessous.

     1. Aller sur https://web3forms.com
     2. Entrer l'email de destination (yannickmay@orange.fr)
     3. Coller la clé reçue par mail dans WEB3FORMS_ACCESS_KEY ci-dessous.

   Tant que la clé n'est pas renseignée, le formulaire ouvre le client mail
   du visiteur (fallback mailto) : rien n'est cassé.
   ═══════════════════════════════════════════════════════════════════════════ */

const WEB3FORMS_ACCESS_KEY = 'VOTRE_CLE_WEB3FORMS';  // ← À remplir (clé Web3Forms de yannickmay@orange.fr)
const DESTINATAIRE_EMAIL   = 'yannickmay@orange.fr'; // Email de Yannick

/* ────────────────────────────── Preloader ──────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
  }, 1900);
});

/* ──────────────────────────── Header scroll ────────────────────────────── */
const header = document.getElementById('header');
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 60);
  scrollTopBtn.classList.toggle('show', y > 400);
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ──────────────────────────── Mobile nav ───────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ──────────────────────────── Typing effect ────────────────────────────── */
const typedEl    = document.getElementById('typedText');
let typedWords = ['les services depuis 20 ans', 'les Combrailles', 'le Puy-de-Dôme', 'la région'];
let wordIdx = 0, charIdx = 0, deleting = false, typingDelay = 120;

function typeLoop() {
  const word = typedWords[wordIdx];
  if (!deleting) {
    typedEl.textContent = word.substring(0, charIdx + 1);
    charIdx++;
    if (charIdx === word.length) {
      deleting = true;
      setTimeout(typeLoop, 2200);
      return;
    }
  } else {
    typedEl.textContent = word.substring(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      deleting = false;
      wordIdx = (wordIdx + 1) % typedWords.length;
      setTimeout(typeLoop, 400);
      return;
    }
  }
  setTimeout(typeLoop, deleting ? 60 : typingDelay);
}
setTimeout(typeLoop, 2200);

/* Allow smy-content.js to update the typed words after content.json loads */
window.SMY_setTypedWords = function (words) {
  if (words && words.length) { typedWords = words; wordIdx = 0; charIdx = 0; deleting = false; }
};

/* ──────────────────────────── Gouttes d'eau ───────────────────────────── */
function createRain(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const drop = document.createElement('div');
    drop.className = 'water-drop';
    const w = 2 + Math.random() * 5;
    const h = w * (2.8 + Math.random() * 2.8);
    drop.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${w}px;
      height: ${h}px;
      animation-duration: ${5 + Math.random() * 11}s;
      animation-delay: ${-Math.random() * 18}s;
    `;
    container.appendChild(drop);
  }
}
createRain('particles',      48);
createRain('certifRain',     36);
createRain('zoneRain',       36);
createRain('contactRain',    30);

/* ──────────────────────────── Scroll reveal ────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || '0');
      setTimeout(() => el.classList.add('revealed'), delay);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ──────────────────────────── Counters ─────────────────────────────────── */
function animateCount(el, target, duration = 1600) {
  const startTime = performance.now();
  const update = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCount(el, parseInt(el.dataset.target));
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.count').forEach(el => counterObserver.observe(el));

/* ──────────────────────────── Gallery filter ───────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');

function applyGalleryFilter(filter) {
  document.querySelectorAll('.gal-item').forEach(item => {
    const show = filter === 'all' || item.dataset.cat === filter;
    item.style.transition = 'opacity .3s ease, transform .3s ease';
    if (show) {
      item.style.display = '';
      requestAnimationFrame(() => { item.style.opacity = '1'; item.style.transform = ''; });
    } else {
      item.style.opacity = '0';
      item.style.transform = 'scale(.95)';
      setTimeout(() => { item.style.display = 'none'; }, 300);
    }
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyGalleryFilter(btn.dataset.filter);
  });
});

/* Re-apply active filter when gallery is rebuilt by smy-content.js */
window.addEventListener('smy:gallery-ready', function () {
  const active = document.querySelector('.filter-btn.active');
  if (active) applyGalleryFilter(active.dataset.filter);
});

/* ──────────────────────────── Lightbox ─────────────────────────────────── */
const lightbox  = document.getElementById('lightbox');
const lbTitle   = document.getElementById('lbTitle');
const lbLoc     = document.getElementById('lbLoc');
const lbImage   = document.getElementById('lbImage');
const lbClose   = document.getElementById('lbClose');
const lbPrev    = document.getElementById('lbPrev');
const lbNext    = document.getElementById('lbNext');

let lbItems = [], lbCurrent = 0;

function buildLbItems() {
  lbItems = [];
  document.querySelectorAll('.gal-item').forEach(item => {
    if (item.style.display !== 'none') {
      const btn = item.querySelector('.gal-zoom');
      if (btn) lbItems.push({ title: btn.dataset.title, loc: btn.dataset.loc, img: btn.dataset.img });
    }
  });
}

function openLightbox(idx) {
  buildLbItems();
  lbCurrent = idx;
  updateLightbox();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateLightbox() {
  const item = lbItems[lbCurrent];
  if (!item) return;
  lbImage.src = item.img || '';
  lbImage.alt = item.title || '';
  lbTitle.textContent = item.title;
  lbLoc.textContent   = item.loc;
  lbPrev.disabled = lbCurrent === 0;
  lbNext.disabled = lbCurrent === lbItems.length - 1;
  lbPrev.style.opacity = lbCurrent === 0 ? '.3' : '1';
  lbNext.style.opacity = lbCurrent === lbItems.length - 1 ? '.3' : '1';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

/* Event delegation — works for items added dynamically by smy-content.js */
const galleryGrid = document.getElementById('galleryGrid');
if (galleryGrid) {
  galleryGrid.addEventListener('click', function (e) {
    const btn = e.target.closest('.gal-zoom');
    if (!btn) return;
    e.stopPropagation();
    const items = Array.from(document.querySelectorAll('.gal-item'));
    const idx = items.indexOf(btn.closest('.gal-item'));
    openLightbox(idx >= 0 ? idx : 0);
  });
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => { if (lbCurrent > 0) { lbCurrent--; updateLightbox(); } });
lbNext.addEventListener('click', () => { if (lbCurrent < lbItems.length - 1) { lbCurrent++; updateLightbox(); } });
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft' && lbCurrent > 0) { lbCurrent--; updateLightbox(); }
  if (e.key === 'ArrowRight' && lbCurrent < lbItems.length - 1) { lbCurrent++; updateLightbox(); }
});

/* ──────────────────────────── Testimonials slider ──────────────────────── */
const track     = document.getElementById('testiTrack');
const dotsEl    = document.getElementById('testiDots');
const prevBtn   = document.getElementById('testiPrev');
const nextBtn   = document.getElementById('testiNext');
const cards     = track ? track.querySelectorAll('.testi-card') : [];

let current = 0, autoplayTimer, visibleCount = 3;
let isDragging = false, dragStartX = 0, dragDelta = 0;

function getVisible() {
  const w = window.innerWidth;
  if (w < 768) return 1;
  if (w < 1000) return 2;
  return 3;
}

function buildDots() {
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  const total = Math.ceil(cards.length / getVisible());
  for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'testi-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Avis ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  }
}

function goTo(idx) {
  if (!track) return;
  visibleCount = getVisible();
  const total = Math.ceil(cards.length / visibleCount);
  current = Math.max(0, Math.min(idx, total - 1));
  const cardW = track.querySelector('.testi-card').offsetWidth + 24;
  track.style.transform = `translateX(-${current * visibleCount * cardW}px)`;
  document.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === current));
}

function next() { goTo(current + 1); resetAutoplay(); }
function prev() { goTo(current - 1); resetAutoplay(); }
function resetAutoplay() {
  clearInterval(autoplayTimer);
  autoplayTimer = setInterval(() => {
    const total = Math.ceil(cards.length / getVisible());
    goTo((current + 1) % total);
  }, 5000);
}

if (prevBtn) prevBtn.addEventListener('click', prev);
if (nextBtn) nextBtn.addEventListener('click', next);

if (track) {
  track.addEventListener('touchstart', e => { dragStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    dragDelta = e.changedTouches[0].clientX - dragStartX;
    if (dragDelta < -50) next();
    else if (dragDelta > 50) prev();
  }, { passive: true });
}

window.addEventListener('resize', () => { buildDots(); goTo(0); }, { passive: true });
buildDots();
resetAutoplay();

/* ──────────────────────────── Active nav link ──────────────────────────── */
const sections   = document.querySelectorAll('section[id], div[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.classList.toggle('active-nav', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => activeObserver.observe(s));

/* ──────────────────────────── Form submission ──────────────────────────── */
const form       = document.getElementById('devisForm');
const submitBtn  = document.getElementById('submitBtn');
const loader     = document.getElementById('btnLoader');
const successEl  = document.getElementById('formSuccess');
const errorEl    = document.getElementById('formError');

function showMsg(el, show) {
  document.querySelectorAll('.form-msg').forEach(m => m.style.display = 'none');
  if (show && el) { el.style.display = 'flex'; el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

function validateForm(formData) {
  let valid = true;
  ['fPrenom','fNom','fPhone','fEmail','fService','fMessage'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.value.trim();
    const empty = val === '' || val === '— Sélectionnez une prestation —';
    el.classList.toggle('error', empty);
    if (empty) valid = false;
  });
  const emailEl = document.getElementById('fEmail');
  if (emailEl && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.classList.add('error'); valid = false;
  }
  const rgpd = document.getElementById('fRgpd');
  if (rgpd && !rgpd.checked) valid = false;
  return valid;
}

/* Remove error class on input */
form && form.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('input', () => el.classList.remove('error'));
});

/* ──── Web3Forms ──── */
function web3formsReady() {
  return WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== 'VOTRE_CLE_WEB3FORMS';
}

async function sendWithWeb3Forms(data) {
  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `Demande de devis — ${data.service} — ${data.prenom} ${data.nom}`,
    from_name: 'Site SAS MAY YANNICK',
    Prénom:    data.prenom,
    Nom:       data.nom,
    Téléphone: data.telephone,
    Email:     data.email,
    Commune:   data.adresse || 'Non renseigné',
    Prestation: data.service,
    Urgence:   data.urgence,
    Message:   data.message,
  };
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || 'Web3Forms error');
  return json;
}

/* ──── Fallback mailto ──── */
function sendMailto(data) {
  const subject = encodeURIComponent(`Demande de devis — ${data.service} — ${data.prenom} ${data.nom}`);
  const body = encodeURIComponent(
    `Nouvelle demande de devis reçue depuis le site :\n\n` +
    `Nom      : ${data.prenom} ${data.nom}\n` +
    `Téléphone: ${data.telephone}\n` +
    `Email    : ${data.email}\n` +
    `Adresse  : ${data.adresse || 'Non renseigné'}\n` +
    `Service  : ${data.service}\n` +
    `Urgence  : ${data.urgence}\n\n` +
    `Message :\n${data.message}`
  );
  window.location.href = `mailto:${DESTINATAIRE_EMAIL}?subject=${subject}&body=${body}`;
}

/* ──── Main submit handler ──── */
form && form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showMsg(null, false);

  if (!validateForm()) {
    const firstError = form.querySelector('.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const data = {
    prenom:    document.getElementById('fPrenom').value.trim(),
    nom:       document.getElementById('fNom').value.trim(),
    telephone: document.getElementById('fPhone').value.trim(),
    email:     document.getElementById('fEmail').value.trim(),
    adresse:   document.getElementById('fAdresse').value.trim(),
    service:   document.getElementById('fService').value,
    urgence:   form.querySelector('[name="urgence"]:checked')?.value || 'Normal',
    message:   document.getElementById('fMessage').value.trim(),
  };

  submitBtn.disabled = true;
  loader.classList.add('show');

  try {
    /* Priorité : Web3Forms → mailto fallback */
    if (web3formsReady()) {
      await sendWithWeb3Forms(data);
    } else {
      /* Fallback : ouvre le client mail */
      sendMailto(data);
      showMsg(successEl, true);
      form.reset();
      submitBtn.disabled = false;
      loader.classList.remove('show');
      return;
    }

    showMsg(successEl, true);
    form.reset();
  } catch (err) {
    console.error('Erreur envoi:', err);
    showMsg(errorEl, true);
    /* Dernier recours : mailto */
    setTimeout(() => sendMailto(data), 1500);
  } finally {
    submitBtn.disabled = false;
    loader.classList.remove('show');
  }
});


/* ──────────────────────────── Smooth anchor scroll ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ──────────────────────────── Mentions légales ─────────────────────────── */
const mentionsModal = document.getElementById('mentionsModal');
document.getElementById('openMentions').addEventListener('click', () => {
  mentionsModal.classList.add('open');
  document.body.style.overflow = 'hidden';
});
document.getElementById('closeMentions').addEventListener('click', () => {
  mentionsModal.classList.remove('open');
  document.body.style.overflow = '';
});
mentionsModal.addEventListener('click', (e) => {
  if (e.target === mentionsModal) {
    mentionsModal.classList.remove('open');
    document.body.style.overflow = '';
  }
});

