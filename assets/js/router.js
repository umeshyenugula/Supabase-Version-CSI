

const VALID_PAGES  = ['home','about','events','event-detail','team','alumni','certificates','help'];
const PARTIAL_BASE = '/partials/';


const _loadedPartials = new Set();

const _initialisedPages = new Map(); 

let currentPage    = null;
let pendingEventId = null;
window.pendingEventId = null;


function pathnameToPage(pathname) {
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/');
  const seg = parts[0] || 'home';
  if (seg === 'event-detail') {
    if (parts[1]) window.pendingEventId = parts[1];
    return 'event-detail';
  }
  return VALID_PAGES.includes(seg) ? seg : 'home';
}


function pageToPath(pageId) {
  return pageId === 'home' ? '/' : `/${pageId}`;
}


function _runInjectedScripts(container) {
  container.querySelectorAll('script').forEach(old => {
    const fresh = document.createElement('script');
    for (const attr of old.attributes) fresh.setAttribute(attr.name, attr.value);
    fresh.textContent = old.textContent;
    old.replaceWith(fresh);
  });
}


async function loadPartial(containerId, file) {
  if (_loadedPartials.has(file)) return;
  const el = document.getElementById(containerId);
  if (!el) return;
  const shellUrl = window.location.origin + PARTIAL_BASE + file;
  try {
    const res = await fetch(shellUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${shellUrl}`);
    el.innerHTML = await res.text();
    _loadedPartials.add(file);
    if (file === 'nav.html' || file === 'mobile-menu.html') bindNavClicks();
    _runInjectedScripts(el);
  } catch (err) {
    console.error(`Failed to load partial ${file}:`, err.message);
  }
}


async function loadShellPartials() {
  await Promise.all([
    loadPartial('nav-placeholder',            'nav.html'),
    loadPartial('mobile-menu-placeholder',    'mobile-menu.html'),
    loadPartial('cookie-placeholder',         'cookie.html'),
    loadPartial('redirect-modal-placeholder', 'redirect-modal.html'),
    loadPartial('footer-placeholder',         'footer.html'),
    loadPartial('team-modal-placeholder',     'team-modal.html'),
  ]);
}


async function loadPagePartial(pageId) {
  const file = `${pageId}.html`;
  const containerId = `page-${pageId}`;
  if (_loadedPartials.has(file)) return;
  const el = document.getElementById(containerId);
  if (!el) return;
  
  const url = window.location.origin + PARTIAL_BASE + file;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
    el.innerHTML = await res.text();
    _loadedPartials.add(file);
    _runInjectedScripts(el);
  } catch (err) {
    console.error(`Failed to load page partial ${file}:`, err.message);
    el.innerHTML = `<div class="empty-state"><h3>Page failed to load</h3><p>${err.message}</p></div>`;
  }
}


function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');
}


function updateNavActive(pageId) {
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pageId);
  });
}


const transition = () => document.getElementById('page-transition');

window.navigateTo = async function(pageId, push = true) {
  if (!VALID_PAGES.includes(pageId)) pageId = 'home';

  if (pageId === currentPage && pageId !== 'home' && pageId !== 'event-detail') return;

  const tr = transition();
  if (tr) { tr.classList.add('in'); await new Promise(r => setTimeout(r, 180)); }

  
  let targetPath = pageToPath(pageId);
  if (push) {
    if (pageId === 'event-detail' && window.pendingEventId) {
      targetPath = `/event-detail/${window.pendingEventId}`;
    }
    history.pushState({ page: pageId, eventId: window.pendingEventId || null }, '', targetPath);
  }

  await loadPagePartial(pageId);

  showPage(pageId);
  currentPage = pageId;
  updateNavActive(pageId);
  window.scrollTo({ top: 0, behavior: 'instant' });

  
  const forceRefresh = (pageId === 'home' || pageId === 'event-detail');
  if (forceRefresh || !_initialisedPages.has(pageId)) {
    await initPage(pageId);
    _initialisedPages.set(pageId, true);
  }

  if (tr) tr.classList.remove('in');
  if (typeof AOS !== 'undefined') AOS.refresh();
  setTimeout(() => document.dispatchEvent(new Event('page:loaded')), 300);
};


async function initPage(id) {
  switch (id) {
    case 'home':         await window.initHomePage?.();         break;
    case 'events':       await window.initEventsPage?.();       break;
    case 'event-detail': await window.initEventDetailPage?.();  break;
    case 'team':         await window.initTeamPage?.();         break;
    case 'alumni':       await window.initAlumniPage?.();       break;
    case 'certificates': window.initCertificatesPage?.();       break;
  }
}


function bindNavClicks() {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.replaceWith(el.cloneNode(true));
  });
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      closeMobileMenu();
      window.navigateTo(el.dataset.page);
    });
  });
}


function openMobileMenu() {
  document.getElementById('mobile-menu')?.classList.add('open');
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
  }
  document.body.classList.add('menu-open');
}
function closeMobileMenu() {
  document.getElementById('mobile-menu')?.classList.remove('open');
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
  }
  document.body.classList.remove('menu-open');
}
window.closeMobileMenu = closeMobileMenu;

document.addEventListener('click', e => {
  const hamburger = document.getElementById('hamburger');
  if (hamburger && e.target.closest('#hamburger')) {
    const isOpen = document.getElementById('mobile-menu')?.classList.contains('open');
    isOpen ? closeMobileMenu() : openMobileMenu();
    return;
  }
  
  if (e.target.closest('#mobile-close-bottom')) closeMobileMenu();
});


document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});


window.addEventListener('scroll', () => {
  document.getElementById('nav')?.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


window.addEventListener('popstate', e => {
  if (e.state?.eventId) window.pendingEventId = e.state.eventId;
  const pageId = e.state?.page || pathnameToPage(window.location.pathname);
  window.navigateTo(pageId, false);
});


(async function boot() {
  
  
  let startPage = pathnameToPage(window.location.pathname);
  if (startPage === 'home') {
    
    const params = new URLSearchParams(window.location.search);
    const legacyPage = params.get('page');
    if (legacyPage && VALID_PAGES.includes(legacyPage)) {
      startPage = legacyPage;
      
      history.replaceState({ page: startPage }, '', pageToPath(startPage));
    }
  }

  
  const params = new URLSearchParams(window.location.search);
  window.UTM = {
    source:   params.get('utm_source')   || '',
    medium:   params.get('utm_medium')   || '',
    campaign: params.get('utm_campaign') || '',
    ref:      params.get('ref')          || '',
  };

  await loadShellPartials();
  bindNavClicks();

  window.initCookieConsent?.();
  window.initRedirectModal?.();
  window.initLightbox?.();

  await window.navigateTo(startPage, false);

  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
  }

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, offset: 60, easing: 'ease-out-cubic' });
  }

  const fyEl = document.getElementById('footerYear');
  if (fyEl) fyEl.textContent = new Date().getFullYear();
})();
