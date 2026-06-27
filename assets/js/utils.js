


window.cache = {
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify({ ts: Date.now(), v })); } catch(_){}
  },
  get(k) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) return null;
      const { ts, v } = JSON.parse(raw);
      if (Date.now() - ts > window.APP_CONFIG.CACHE_TTL_MS) {
        localStorage.removeItem(k);
        return null;
      }
      return v;
    } catch(_) { return null; }
  },
  clear(prefix) {
    Object.keys(localStorage)
      .filter(k => k.startsWith(prefix))
      .forEach(k => localStorage.removeItem(k));
  }
};


window.parseEventDate = function(raw) {
  if (!raw) return null;
  const direct = new Date(raw);
  if (!isNaN(direct)) return direct;
  const cleaned = raw.replace(/(\d+)(st|nd|rd|th)/gi, '$1').trim();
  const parsed = new Date(cleaned);
  return isNaN(parsed) ? null : parsed;
};

window.formatEventDate = function(raw, opts = { year:'numeric', month:'long', day:'numeric' }) {
  const d = parseEventDate(raw);
  if (!d) return raw || '—';
  return d.toLocaleDateString('en-IN', opts);
};


window.displayErrorBanner = function(message) {
  let banner = document.getElementById('error-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'error-banner';
    banner.style.cssText =
      'position:fixed;top:0;left:0;right:0;background:#fee;border-bottom:2px solid #c33;' +
      'color:#c33;padding:12px 16px;z-index:10000;font-family:monospace;font-size:0.85rem;display:none;';
    document.body.prepend(banner);
  }
  banner.innerHTML =
    `<strong>⚠ Error:</strong> ${message}
     <button onclick="this.parentElement.style.display='none'"
       style="margin-left:10px;cursor:pointer;background:none;border:1px solid #c33;color:#c33;padding:4px 8px;border-radius:3px;">
       Dismiss
     </button>`;
  banner.style.display = 'block';
};


window.applyReadMore = function(container, text, threshold = 180) {
  if (!container) return;
  if (!text || text.length <= threshold) {
    container.innerHTML = `<p style="color:var(--muted);line-height:1.8;">${text || ''}</p>`;
    return;
  }
  container.innerHTML = `
    <div class="readmore-wrap">
      <p class="readmore-text collapsed" style="color:var(--muted);line-height:1.8;">${text}</p>
      <div class="readmore-fade" id="rmFade"></div>
    </div>
    <button class="readmore-btn" id="rmBtn">
      <i class="fa-solid fa-chevron-down" style="font-size:0.7em"></i> Read more
    </button>`;
  const btn  = container.querySelector('#rmBtn');
  const pEl  = container.querySelector('.readmore-text');
  const fade = container.querySelector('#rmFade');
  let expanded = false;
  btn.addEventListener('click', () => {
    expanded = !expanded;
    pEl.classList.toggle('collapsed', !expanded);
    pEl.classList.toggle('expanded', expanded);
    fade.style.opacity = expanded ? '0' : '1';
    btn.innerHTML = expanded
      ? '<i class="fa-solid fa-chevron-up" style="font-size:0.7em"></i> Show less'
      : '<i class="fa-solid fa-chevron-down" style="font-size:0.7em"></i> Read more';
  });
};


window.buildCreativeGallery = function(container, imageUrls) {
  if (!container || !imageUrls?.length) return;
  container.className = 'gallery-grid-creative';
  container.innerHTML = imageUrls.map((src, i) => `
    <div class="gg-item" data-src="${src}">
      <img src="${src}" alt="Event photo ${i+1}" loading="lazy">
      <div class="gg-zoom-icon"><i class="fa-solid fa-expand"></i></div>
    </div>`).join('');
  container.querySelectorAll('.gg-item').forEach(item => {
    item.addEventListener('click', () => window.openLightbox(item.dataset.src));
  });
};


window.sortEventsByDate = function(events, desc = true) {
  return [...events].sort((a, b) => {
    const da = parseEventDate(a.date), db = parseEventDate(b.date);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return desc ? db - da : da - db;
  });
};


window.getURLParams = function() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
};
window.buildURL = function(page, extra = {}) {
  const params = new URLSearchParams({ page, ...extra });
  return `${window.location.pathname}?${params}`;
};
