/* ============================================================
   public.js  —  CSI GRIET STATIC SITE (Supabase JS SDK)
   Read-only. No login. RLS enforced on Supabase side.
   ============================================================ */

// ── CONFIG — Supabase project values ────────────────────────
const SUPABASE_URL  = "https://flalymcjyikdofwaklgn.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWx5bWNqeWlrZG9md2FrbGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODYwOTEsImV4cCI6MjA5MDM2MjA5MX0.czvFwanHvGcqrmsXyQIEixlhRlRJBMbiNbgeAIpUOHQ";

// ── Init Supabase client ─────────────────────────────────────
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── LocalStorage cache helpers ──────────────────────────────
const CACHE_TTL = 5 * 60 * 1000;
function cacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch (_) {}
}
function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data;
  } catch (_) { return null; }
}

// ── Carousel factory ─────────────────────────────────────────
function initCarousel(wrap) {
  const track = wrap.querySelector(".carousel-track");
  const dots  = wrap.parentElement?.querySelector(".carousel-dots");
  if (!track) return;
  const slides = track.querySelectorAll("img");
  if (slides.length <= 1) { wrap.querySelector(".carousel-btn.prev")?.remove(); wrap.querySelector(".carousel-btn.next")?.remove(); return; }
  let cur = 0; const total = slides.length;
  if (dots) {
    dots.innerHTML = "";
    slides.forEach((_, i) => {
      const d = document.createElement("span");
      d.className = "dot" + (i === 0 ? " active" : "");
      d.onclick = () => goTo(i);
      dots.appendChild(d);
    });
  }
  function goTo(n) {
    cur = (n + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    if (dots) dots.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === cur));
  }
  wrap.querySelector(".carousel-btn.prev")?.addEventListener("click", () => goTo(cur - 1));
  wrap.querySelector(".carousel-btn.next")?.addEventListener("click", () => goTo(cur + 1));
  setInterval(() => goTo(cur + 1), 4500);
}

// Toggle event description Read More
function toggleEventDescription() {
  const descEl = document.getElementById("eventDescription");
  const btn = document.getElementById("eventReadMoreBtn");
  if (!descEl || !btn) return;
  
  if (descEl.dataset.truncated === "true") {
    descEl.textContent = descEl.dataset.fullText;
    descEl.dataset.truncated = "false";
    btn.textContent = "Read Less";
  } else {
    const fullText = descEl.dataset.fullText;
    descEl.textContent = fullText.substring(0, 300) + "...";
    descEl.dataset.truncated = "true";
    btn.textContent = "Read More";
  }
}

function buildCarousel(imageUrls) {
  const imgs = (imageUrls && imageUrls.length) ? imageUrls.map(u => `<img src="${u}" alt="event">`).join("") : `<img src="static/images/csi-logo.png" alt="placeholder">`;
  return `<div class="carousel-wrap"><div class="carousel-track">${imgs}</div><button class="carousel-btn prev">&#8249;</button><button class="carousel-btn next">&#8250;</button></div><div class="carousel-dots"></div>`;
}

function buildTimeline(steps) {
  if (!steps || !steps.length) return "";
  return `<div class="event-timeline-section"><h3>Event Timeline</h3><div class="timeline-list">${steps.map(s=>`<div class="timeline-item"><div class="tl-step">${s.step||""}</div><div class="tl-title">${s.title||""}</div><div class="tl-desc">${s.description||""}</div></div>`).join("")}</div></div>`;
}

// ── Partials (inline HTML — no server needed) ────────────────
const PARTIALS = {

  main: () => `
    <section class="hero" aria-labelledby="heroTitle">
      <div class="blobs" aria-hidden="true"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div>
      <div class="hero-inner container">
        <div class="hero-right"><img id="heroImage" src="static/images/csi-logo.png" alt="Event highlight"></div>
        <div class="hero-left">
          <h2 id="heroTitle">Welcome to CSI GRIET</h2>
          <p>Join hackathons, technical games. Build projects, learn together, and network with peers.</p>
          <div class="hero-ctas"><a id="heroBtn1" class="btn" href="#">Learn More</a></div>
        </div>
      </div>
    </section>
    <section class="gallery" aria-labelledby="galleryTitle">
      <div class="container"><h3 id="galleryTitle">Previous Events</h3><div class="grid-2x2" id="grid2x2" aria-live="polite"></div></div>
    </section>
    <section class="vam-section glassy">
      <div class="container"><div class="vam-grid">
        <div class="vam-card glass"><h4>Vision</h4><p>Our group aims to develop skills among students in all aspects, spotlighting the latest technology from across the globe.</p></div>
        <div class="vam-card glass"><h4>About Us</h4><p>Formed in 1965, CSI is the first and largest body of computer professionals in India. GRIET CSISB, established 2014, now has 500+ members.</p></div>
        <div class="vam-card glass"><h4>Mission</h4><p>CSI Student Chapter organises events full of knowledge, learning and fun — building social responsibility and innovation among students.</p></div>
      </div></div>
    </section>`,

  events: () => `
    <section class="events-page">
      <div class="team-hero" style="min-height:220px;"><div class="hero-overlay"></div><div class="hero-content"><h1>Previous Events</h1><p>Explore all events organised by CSI GRIET.</p></div></div>
      <div class="container" style="padding-top:40px;padding-bottom:60px;">
        <div class="events-grid" id="eventsGrid" aria-live="polite"><p style="color:var(--muted)">Loading events…</p></div>
      </div>
    </section>`,

  "event-detail": () => `
    <section class="event-hero" style="min-height:320px;background:#1a1a2e;position:relative;">
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45);"></div>
      <div class="hero-content" style="position:relative;z-index:2;padding:60px 24px 40px;">
        <h1 id="eventTitle">Event</h1>
        <p id="eventDate" style="font-size:16px;opacity:0.85;margin-top:8px;"></p>
      </div>
    </section>
    <div class="container" style="padding-top:36px;padding-bottom:60px;">
      <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:32px;">
        <div class="stat-card" style="flex:1;min-width:130px;text-align:center;background:#fff;padding:20px;border-radius:14px;box-shadow:0 10px 28px rgba(20,20,40,.06);">
          <div style="font-size:13px;color:var(--muted);font-weight:600;">Participants</div>
          <div style="font-size:32px;font-weight:900;background:linear-gradient(90deg,#7b61ff,#4ac3ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;" id="eventParticipants">—</div>
        </div>
        <div class="stat-card" style="flex:1;min-width:130px;text-align:center;background:#fff;padding:20px;border-radius:14px;box-shadow:0 10px 28px rgba(20,20,40,.06);">
          <div style="font-size:13px;color:var(--muted);font-weight:600;">Teams</div>
          <div style="font-size:32px;font-weight:900;background:linear-gradient(90deg,#7b61ff,#4ac3ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;" id="eventTeams">—</div>
        </div>
      </div>
      <div id="eventCarouselSlot" style="margin-bottom:32px;"></div>
      <div class="event-description">
        <h3 style="font-size:18px;font-weight:800;margin-bottom:14px;">About this Event</h3>
        <p id="eventDescription" style="color:var(--muted);line-height:1.75;"></p>
      </div>
      <div id="eventTimelineSlot"></div>
      <div style="margin-top:32px;"><button class="btn" onclick="loadSection('events')">← Back to Events</button></div>
    </div>`,

  "our-team": () => `
    <main class="team-page">
      <section class="team-hero"><div class="hero-overlay"></div><div class="hero-content"><h1>Meet Our Team</h1><p>Guided by excellence, powered by innovation.</p></div></section>
      <section class="faculty-section"><div class="container"><div class="team-header"><h2>Our Faculty Advisors</h2></div><div class="faculty-grid"></div></div></section>
      <section class="core-section"><div class="container"><div class="team-header"><h2>Our Core Committee</h2></div><div class="core-groups"></div></div></section>
    </main>`,

  alumni: () => `
    <main class="alumni-page">
      <section class="alumni-hero"><div class="hero-overlay"></div><div class="alumni-hero-content"><h1>Our Proud Alumni</h1><p>Hover to reveal their names and designations.</p></div></section>
      <section class="alumni-grid-section"><div class="section-header"><h2>Alumni Spotlight</h2></div><div class="alumni-grid" id="alumniGrid"></div></section>
    </main>`,

  "about-us": () => `
    <main class="about-page">
      <section class="about-hero"><div class="hero-overlay"></div><div class="about-hero-content"><h1>About CSI GRIET</h1><p>Empowering students to innovate, collaborate, and lead.</p></div></section>
      <section class="about-wrapper"><div class="about-header"><h2>Who We Are</h2></div>
      <div class="about-cards">
        <div class="about-card"><h4>About the Computer Society of India</h4><p>The <strong>Computer Society of India (CSI)</strong> was established in 1965 as the first and largest body of computer professionals in India. With over 72 chapters and 500+ student branches, CSI has shaped India's IT landscape.</p></div>
        <div class="about-card"><h4>About GRIET Student Branch</h4><p>Founded in <strong>2014</strong>, the GRIET Student Branch has consistently worked to make students aware of emerging technologies. With over <strong>500+ active members</strong>, the branch organises hackathons, seminars, and tech initiatives.</p></div>
        <div class="about-card about-objectives"><h4>Our Objectives</h4><ul><li>Encourage students to explore cutting-edge technologies</li><li>Promote innovation through projects and teamwork</li><li>Provide platforms for showcasing talent and ideas</li><li>Build bridges between academia and industry</li></ul></div>
      </div></section>
      <section class="values-wrapper"><div class="values-header"><h3>Our Core Values</h3></div>
      <div class="values-grid">
        <div class="value-card"><img src="static/images/Innovation.png" alt="Innovation"><div class="value-overlay"></div><div class="value-title"><span>Innovation</span></div></div>
        <div class="value-card"><img src="static/images/collabration.png" alt="Collaboration"><div class="value-overlay"></div><div class="value-title"><span>Collaboration</span></div></div>
        <div class="value-card"><img src="static/images/leadership.png" alt="Leadership"><div class="value-overlay"></div><div class="value-title"><span>Leadership</span></div></div>
      </div></section>
    </main>`,

  certificates: () => `
    <main class="certificates-page">
      <section class="events-hero"><div class="hero-blobs"><div class="blob b1"></div><div class="blob b2"></div></div><div class="events-hero-content"><h1>Certificates Portal</h1><p>Access and verify your participation certificates.</p></div></section>
      <section class="cert-search">
        <h2>Download Your Certificate</h2>
        <div class="form-group"><label>Year</label><select id="certYear"><option value="">Select Year</option></select></div>
        <div class="form-group"><label>Event</label><select id="certEvent"><option value="">Select Event</option></select></div>
        <div class="form-group autocomplete"><label>Your Name</label><input type="text" id="certName" placeholder="Start typing your name" autocomplete="off"><div id="nameSuggestions" class="suggestions"></div></div>
        <button id="previewCertBtn" class="btn">View Certificate</button>
      </section>
      <section id="certificatePreviewSection" style="display:none;">
        <div id="certificatePreview" class="certificate-root">
          <div class="cert-header">
            <img src="static/images/csi-logo.png" class="cert-logo left" alt="CSI">
            <div class="cert-title"><h1>Computer Society of India</h1><h2>Gokaraju Rangaraju Institute of Engineering and Technology</h2></div>
            <img src="static/images/griet-logo.png" class="cert-logo right" alt="GRIET">
          </div>
          <hr class="cert-divider">
          <div class="cert-body">
            <h3 class="cert-type" id="certPreviewPosition">Certificate of Participation</h3>
            <p class="cert-text">This is to certify that</p>
            <h2 class="cert-name" id="certPreviewName">Participant Name</h2>
            <p class="cert-text">has successfully participated in the event</p>
            <h3 class="cert-event" id="certPreviewEvent">Event Name</h3>
            <p class="cert-year">conducted in the year <span id="certPreviewYear">2025</span></p>
          </div>
          <div class="cert-footer">
            <div class="cert-sign"><strong>CSI GRIET</strong> Faculty Coordinator</div>
            <div class="cert-verified">This certificate is system generated and verified</div>
          </div>
        </div>
        <div style="text-align:center;margin:30px 0;"><button id="downloadCertBtn" class="btn">Download Certificate</button></div>
      </section>
    </main>`
};

// ─────────────────────────────────────────────────────────────
//  MAIN INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const main  = document.querySelector("#main-content");
  const links = document.querySelectorAll(".nav-link, .sidebar nav a");

  const PAGE_INIT = {
    main:           loadMainPage,
    events:         loadEventsPage,
    "event-detail": initEventDetailPage,
    "our-team":     initOurTeamPage,
    alumni:         loadAlumniPublic,
    certificates:   initCertificatesPage,
  };

  async function getPartialHtml(page) {
    const candidates = [
      `partials/${page}.html`,
      `./partials/${page}.html`,
      `/partials/${page}.html`
    ];

    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) return await res.text();
      } catch (_) {
        // Ignore fetch/path failures and try the next candidate.
      }
    }

    return PARTIALS[page] ? PARTIALS[page]() : "<section style='padding:60px;text-align:center;'><h2>Page not found</h2></section>";
  }

  async function loadSection(page, clickedLink = null) {
    if (!page || page === "home") page = "main";
    main.innerHTML = await getPartialHtml(page);
    if (PAGE_INIT[page]) await PAGE_INIT[page]();
    if (typeof gsap !== "undefined") gsap.from(main, { opacity: 0, y: 20, duration: 0.35 });
    links.forEach(l => l.classList.remove("active"));
    if (clickedLink) clickedLink.classList.add("active");
    history.pushState({ page }, "", `#${page}`);
  }
  window.loadSection = loadSection;

  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) loadSection(page, link);
    });
  });

  window.addEventListener("popstate", e => {
    const page = e.state?.page || location.hash.replace("#","") || "main";
    loadSection(page, null);
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // Sidebar
  const overlay = document.getElementById("overlay");
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.getElementById("hamburger");
  const sidebarClose = document.getElementById("sidebarClose");

  function openSidebar() { sidebar.classList.add("open"); overlay.classList.add("show"); document.body.style.overflow="hidden"; }
  function closeSidebar() { sidebar.classList.remove("open"); overlay.classList.remove("show"); document.body.style.overflow=""; }
  window.closeSidebar = closeSidebar;

  function updateMobileUI() {
    const hb = document.getElementById("hamburger");
    if (hb) hb.style.display = window.innerWidth <= 720 ? "inline-flex" : "none";
    const rl = document.getElementById("rightLogo");
    if (rl) rl.style.display = window.innerWidth <= 720 ? "none" : "";
  }
  updateMobileUI();
  window.addEventListener("resize", updateMobileUI);

  if (hamburger) hamburger.addEventListener("click", () => sidebar.classList.contains("open") ? closeSidebar() : openSidebar());
  if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeSidebar(); });

  const initialPage = location.hash.replace("#","") || "main";
  loadSection(initialPage);

  // ── MAIN PAGE ──────────────────────────────────────────────
  async function loadMainPage() {
    try {
      let hero = cacheGet("hero");
      if (!hero) {
        const { data } = await sb.from("hero_section").select("*").eq("type","hero").maybeSingle();
        hero = data;
        if (hero) cacheSet("hero", hero);
      }
      if (hero) {
        if (hero.hero_title)    document.querySelector("#heroTitle").textContent = hero.hero_title;
        if (hero.btn1_label) {
          const btn = document.querySelector("#heroBtn1");
          btn.textContent = hero.btn1_label;
          btn.href = hero.btn1_link || "#";
        }
        if (hero.hero_image_url) document.querySelector("#heroImage").src = hero.hero_image_url;
      }
    } catch (_) {}
    await loadPreviousEvents();
  }

  async function loadPreviousEvents() {
    const grid = document.getElementById("grid2x2");
    if (!grid) return;
    try {
      let events = cacheGet("latest_events");
      if (!events) {
        const { data } = await sb.from("events").select("id,title,slug,date,image_urls").order("created_at",{ascending:false}).limit(6);
        events = data || [];
        cacheSet("latest_events", events);
      }
      grid.innerHTML = "";
      events.forEach(ev => {
        const imgUrl = (ev.image_urls && ev.image_urls[0]) || "static/images/csi-logo.png";
        const item = document.createElement("div");
        item.className = "grid-item in-view";
        item.dataset.slug = ev.slug || "";
        item.innerHTML = `
          <div class="event-flip-inner">
            <div class="event-flip-face event-flip-front">
              <img src="${imgUrl}" alt="${ev.title}">
            </div>
            <div class="event-flip-face event-flip-back">
              <div class="event-flip-back-content">
                <h4>${ev.title}</h4>
                <p class="date">${ev.date || ""}</p>
                <button type="button" class="btn btn-see-more" data-slug="${ev.slug || ""}">View More</button>
              </div>
            </div>
          </div>`;

        const openEventDetail = () => {
          if (ev.slug) {
            sessionStorage.setItem("pendingEventSlug", ev.slug);
            loadSection("event-detail");
          }
        };

        const button = item.querySelector(".btn-see-more");
        if (button) {
          button.addEventListener("click", (e) => {
            e.stopPropagation();
            openEventDetail();
          });
        }

        item.addEventListener("click", () => {
          openEventDetail();
        });
        grid.appendChild(item);
      });
    } catch (err) { console.error(err); }
  }

  // ── EVENTS PAGE ────────────────────────────────────────────
  let allEvents = [];

  async function loadEventsPage() {
    const grid = document.getElementById("eventsGrid");
    if (!grid) return;
    const eventColorThemes = [
      { accent: "#6c63ff", accentSoft: "#ebe9ff", accentDeep: "#4f46e5" },
      { accent: "#ff6b8a", accentSoft: "#ffe7ee", accentDeep: "#e11d48" },
      { accent: "#00b8a9", accentSoft: "#e6fffb", accentDeep: "#0f766e" },
      { accent: "#f59e0b", accentSoft: "#fff5de", accentDeep: "#b45309" },
      { accent: "#4a90e2", accentSoft: "#e8f3ff", accentDeep: "#1d4ed8" },
      { accent: "#a855f7", accentSoft: "#f3e8ff", accentDeep: "#7e22ce" }
    ];
    try {
      let events = cacheGet("all_events");
      if (!events) {
        const { data } = await sb.from("events").select("id,title,slug,date,description,participants,teams,image_urls,timeline").order("created_at",{ascending:false});
        events = data || [];
        cacheSet("all_events", events);
      }
      allEvents = events;
      grid.innerHTML = "";
      events.forEach(ev => {
        const imgUrl = (ev.image_urls && ev.image_urls[0]) || "static/images/csi-logo.png";
        const card = document.createElement("div");
        const seed = String(ev.id || ev.slug || ev.title || "").split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        const theme = eventColorThemes[seed % eventColorThemes.length];
        card.className = "event-card team-like-event-card";
        card.style.setProperty("--event-accent", theme.accent);
        card.style.setProperty("--event-accent-soft", theme.accentSoft);
        card.style.setProperty("--event-accent-deep", theme.accentDeep);
        card.innerHTML = `
          <div class="event-flip-inner">
            <div class="event-flip-face event-flip-front">
              <div class="event-image"><img src="${imgUrl}" alt="${ev.title}"><div class="event-hover-overlay"><span>${ev.title}</span></div></div>
              <div class="event-info">
                <h3>${ev.title}</h3>
                <p class="date">${ev.date||""}</p>
                <button type="button" class="btn btn-see-more" data-slug="${ev.slug||""}">See More</button>
              </div>
            </div>
            <div class="event-flip-face event-flip-back">
              <div class="event-flip-back-content">
                <h3>${ev.title}</h3>
                <p class="date">${ev.date||""}</p>
                <button type="button" class="btn btn-see-more" data-slug="${ev.slug||""}">See More</button>
              </div>
            </div>
          </div>`;
        card.querySelectorAll("button").forEach((btn) => {
          btn.addEventListener("click", () => {
            sessionStorage.setItem("pendingEventSlug", ev.slug);
            loadSection("event-detail");
          });
        });
        grid.appendChild(card);
      });
    } catch (err) { grid.innerHTML = "<p>Failed to load events.</p>"; console.error(err); }
  }

  // ── EVENT DETAIL ───────────────────────────────────────────
  async function initEventDetailPage() {
    const slug = sessionStorage.getItem("pendingEventSlug");
    if (!slug) return;
    try {
      let ev = cacheGet(`event_${slug}`);
      if (!ev) {
        const { data } = await sb.from("events").select("*").eq("slug", slug).maybeSingle();
        ev = data;
        if (ev) cacheSet(`event_${slug}`, ev);
      }
      if (!ev) return;
      const eventTitleEl = document.getElementById("eventTitle");
      if (eventTitleEl) eventTitleEl.textContent = ev.title || "";
      const eventDateEl = document.getElementById("eventDate");
      if (eventDateEl) eventDateEl.textContent = ev.date || "";
      const eventParticipantsEl = document.getElementById("eventParticipants");
      if (eventParticipantsEl) eventParticipantsEl.textContent = ev.participants ?? "-";
      const eventTeamsEl = document.getElementById("eventTeams");
      if (eventTeamsEl) eventTeamsEl.textContent = ev.teams ?? "-";
      const eventDescriptionEl = document.getElementById("eventDescription");
      if (eventDescriptionEl) {
        const desc = ev.description || "";
        const maxLength = 300;
        const readMoreBtn = document.getElementById("eventReadMoreBtn");
        if (desc.length > maxLength) {
          eventDescriptionEl.textContent = desc.substring(0, maxLength) + "...";
          eventDescriptionEl.dataset.fullText = desc;
          eventDescriptionEl.dataset.truncated = "true";
          if (readMoreBtn) {
            readMoreBtn.style.display = "inline-block";
            readMoreBtn.textContent = "Read More";
          }
        } else {
          eventDescriptionEl.textContent = desc;
          eventDescriptionEl.dataset.truncated = "false";
          if (readMoreBtn) readMoreBtn.style.display = "none";
        }
      }
      const hero = document.querySelector(".event-hero");
      if (hero && ev.image_urls && ev.image_urls[0]) {
        hero.style.backgroundImage = `url('${ev.image_urls[0]}')`;
        hero.style.backgroundSize = "contain";
        hero.style.backgroundRepeat = "no-repeat";
        hero.style.backgroundPosition = "center";
        hero.style.backgroundColor = "#ffffff";
      }
      const cSlot = document.getElementById("eventCarouselSlot");
      if (cSlot) { cSlot.innerHTML = buildCarousel(ev.image_urls); cSlot.querySelectorAll(".carousel-wrap").forEach(initCarousel); }
      const tSlot = document.getElementById("eventTimelineSlot");
      if (tSlot) tSlot.innerHTML = buildTimeline(ev.timeline);
      if (typeof gsap !== "undefined") {
        gsap.from(".stat-card", { opacity:0, y:40, scale:0.95, duration:0.8, stagger:0.15, delay:0.3, ease:"back.out(1.4)" });
      }
    } catch (err) { console.error(err); }
  }

  // ── OUR TEAM ───────────────────────────────────────────────
  async function initOurTeamPage() {
    const facultyGrid = document.querySelector(".faculty-grid");
    const coreSection = document.querySelector(".core-section");
    const teamColorThemes = [
      { accent: "#6c63ff", accentSoft: "#ebe9ff", accentDeep: "#4f46e5" },
      { accent: "#ff6b8a", accentSoft: "#ffe7ee", accentDeep: "#e11d48" },
      { accent: "#00b8a9", accentSoft: "#e6fffb", accentDeep: "#0f766e" },
      { accent: "#f59e0b", accentSoft: "#fff5de", accentDeep: "#b45309" },
      { accent: "#4a90e2", accentSoft: "#e8f3ff", accentDeep: "#1d4ed8" },
      { accent: "#a855f7", accentSoft: "#f3e8ff", accentDeep: "#7e22ce" }
    ];

    const getThemeForSeed = (seedInput) => {
      const seed = String(seedInput || "")
        .split("")
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      return teamColorThemes[seed % teamColorThemes.length];
    };
    try {
      let members = cacheGet("team_members");
      if (!Array.isArray(members) || members.length === 0) {
        const { data, error } = await sb
          .from("team_members")
          .select("name,role,role_group,category,department,image_url,linkedin,instagram,sort_order")
          .order("category")
          .order("role_group")
          .order("sort_order");
        if (error) {
          console.error("team_members fetch failed:", error);
          members = Array.isArray(members) ? members : [];
        } else {
          members = Array.isArray(data) ? data : [];
          if (members.length > 0) cacheSet("team_members", members);
        }
      }
      if (!Array.isArray(members)) members = [];

      const isFaculty = (m) => {
        const category = (m?.category || "").toString().trim().toLowerCase();
        const roleGroup = (m?.role_group || "").toString().trim().toLowerCase();
        return category.includes("faculty") || roleGroup.includes("faculty");
      };

      const isLeadRole = (member) => {
        const roleText = String(member?.role || "").trim().toLowerCase();
        return /\b(lead|leader|head|chair|co-?lead)\b/.test(roleText);
      };
      const byLeadThenOrderThenName = (a, b) => {
        const aLead = isLeadRole(a) ? 0 : 1;
        const bLead = isLeadRole(b) ? 0 : 1;
        if (aLead !== bLead) return aLead - bLead;

        const aOrder = Number.isFinite(Number(a?.sort_order)) ? Number(a.sort_order) : Number.MAX_SAFE_INTEGER;
        const bOrder = Number.isFinite(Number(b?.sort_order)) ? Number(b.sort_order) : Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;

        return String(a?.name || "").localeCompare(String(b?.name || ""));
      };
      const isSeniorManagementGroup = (groupName) => {
        const normalized = String(groupName || "").trim().toLowerCase();
        return normalized.includes("senior management");
      };
      const getSeniorManagementRolePriority = (member) => {
        const roleText = String(member?.role || "").trim().toLowerCase();
        if (roleText.includes("principal")) return 0;
        if (roleText.includes("executive")) return 1;
        if (roleText.includes("convenor") || roleText.includes("convener")) return 2;
        if (/(secretary|secretory|secstory)/.test(roleText)) return 3;
        return Number.MAX_SAFE_INTEGER;
      };
      const bySeniorManagementPriorityThenDefault = (a, b) => {
        const aPriority = getSeniorManagementRolePriority(a);
        const bPriority = getSeniorManagementRolePriority(b);
        if (aPriority !== bPriority) return aPriority - bPriority;
        return byLeadThenOrderThenName(a, b);
      };

      const faculty = members.filter(isFaculty).sort(byLeadThenOrderThenName);
      const core = members.filter(m => !isFaculty(m));

      if (facultyGrid) {
        facultyGrid.innerHTML = "";
        if (faculty.length === 0) {
          facultyGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted);">No faculty members available yet.</p>`;
        } else {
          faculty.forEach(m => {
            const facultyGroupSeed = m.role_group || m.category || "faculty";
            const theme = getThemeForSeed(facultyGroupSeed);
            facultyGrid.insertAdjacentHTML("beforeend", `<div class="faculty-card team-color-card" style="--team-accent:${theme.accent};--team-accent-soft:${theme.accentSoft};--team-accent-deep:${theme.accentDeep};"><div class="faculty-photo"><img src="${m.image_url||"static/images/csi-logo.png"}" alt="${m.name}"></div><h4>${m.name}</h4><p class="designation">${m.role||""}${m.department?", "+m.department:""}</p></div>`);
          });
        }
      }
      if (coreSection) {
        const coreContainer = coreSection.querySelector(".core-groups");
        if (coreContainer) {
          coreContainer.innerHTML = "";
          if (core.length === 0) {
            coreContainer.innerHTML = `<p style="text-align:center;color:var(--muted);">No core members available yet.</p>`;
            return;
          }
          const groups = {};
          core.forEach(m => { const g = m.role_group||"General"; groups[g]=groups[g]||[]; groups[g].push(m); });
          const roleGroupPriority = [
            "returning",
            "advisor",
            "senior management",
            "management",
            "technical"
          ];
          const getGroupPriority = (groupName) => {
            const normalized = String(groupName || "").trim().toLowerCase();
            const idx = roleGroupPriority.findIndex((key) => normalized.includes(key));
            return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
          };
          const sortedGroupEntries = Object.entries(groups).sort(([a], [b]) => {
            const pa = getGroupPriority(a);
            const pb = getGroupPriority(b);
            if (pa !== pb) return pa - pb;
            return a.localeCompare(b);
          });

          sortedGroupEntries.forEach(([groupName, groupMembers]) => {
            const sec = document.createElement("div");
            sec.className = "role-group-section";
            sec.innerHTML = `<div class="role-group-label">${groupName}</div><div class="role-group-grid"></div>`;
            const g = sec.querySelector(".role-group-grid");
            const groupTheme = getThemeForSeed(groupName);
            const memberSorter = isSeniorManagementGroup(groupName)
              ? bySeniorManagementPriorityThenDefault
              : byLeadThenOrderThenName;
            groupMembers
              .slice()
              .sort(memberSorter)
              .forEach(m => {
              g.insertAdjacentHTML("beforeend", `
                <div class="core-card team-color-card" style="--team-accent:${groupTheme.accent};--team-accent-soft:${groupTheme.accentSoft};--team-accent-deep:${groupTheme.accentDeep};">
                  <div class="core-card-inner">
                    <div class="core-card-front">
                      <div class="core-photo">
                        <img src="${m.image_url||"static/images/csi-logo.png"}" alt="${m.name}" loading="lazy">
                      </div>
                      <h4>${m.name}</h4>
                      <p class="role">${m.role||""}</p>
                    </div>
                    <div class="core-card-back">
                      <h4>${m.name}</h4>
                      <p class="role-back">${m.role||""}</p>
                      <div class="socials">
                        ${m.linkedin?`<a href="${m.linkedin}" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin-in"></i></a>`:""}
                        ${m.instagram?`<a href="${m.instagram}" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i></a>`:""}
                      </div>
                    </div>
                  </div>
                </div>`);
              });
            coreContainer.appendChild(sec);
          });
        }
      }
    } catch (err) { console.error(err); }
  }

  // ── ALUMNI ─────────────────────────────────────────────────
  async function loadAlumniPublic() {
    const grid = document.getElementById("alumniGrid");
    if (!grid) return;
    try {
      let alumni = cacheGet("alumni");
      if (!Array.isArray(alumni) || alumni.length === 0) {
        const { data, error } = await sb.from("alumni").select("name,position,batch,image_url").order("batch",{ascending:false});
        if (error) {
          console.error("alumni fetch failed:", error);
          alumni = Array.isArray(alumni) ? alumni : [];
        } else {
          alumni = Array.isArray(data) ? data : [];
          if (alumni.length > 0) cacheSet("alumni", alumni);
        }
      }
      grid.innerHTML = "";
      if (!Array.isArray(alumni) || alumni.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted);">No alumni records available yet.</p>`;
        return;
      }
      alumni.forEach(a => {
        grid.insertAdjacentHTML("beforeend", `
          <div class="alumni">
            <div class="alumni-flip-inner">
              <div class="alumni-flip-face alumni-flip-front">
                <img src="${a.image_url||"static/images/csi-logo.png"}" alt="${a.name}">
                <div class="overlay"><h3>${a.name}</h3>${a.position?`<p>${a.position}</p>`:""}${a.batch?`<p>${a.batch}</p>`:""}</div>
              </div>
              <div class="alumni-flip-face alumni-flip-back">
                <div class="overlay overlay-back"><h3>${a.name}</h3>${a.position?`<p>${a.position}</p>`:""}${a.batch?`<p>${a.batch}</p>`:""}</div>
              </div>
            </div>
          </div>`);
      });
    } catch (err) { console.error(err); }
  }

  // ── CERTIFICATES ───────────────────────────────────────────
  async function initCertificatesPage() {
    const certYear  = document.getElementById("certYear");
    const certEvent = document.getElementById("certEvent");
    const certName  = document.getElementById("certName");
    const suggestionsBox = document.getElementById("nameSuggestions");
    const previewBtn     = document.getElementById("previewCertBtn");
    const previewSection = document.getElementById("certificatePreviewSection");
    if (!certYear) return;

    let certData = {};
    let currentNames = [];

    // Load years from Supabase
    const { data: evs } = await sb.from("certificate_events").select("id,year,event_name").order("year",{ascending:false});
    (evs||[]).forEach(ev => { certData[ev.year]=certData[ev.year]||[]; certData[ev.year].push({id:ev.id,name:ev.event_name}); });

    certYear.innerHTML = `<option value="">Select Year</option>`;
    Object.keys(certData).sort().reverse().forEach(y => { certYear.innerHTML += `<option value="${y}">${y}</option>`; });

    certYear.addEventListener("change", () => {
      certEvent.innerHTML = `<option value="">Select Event</option>`;
      certName.value = ""; suggestionsBox.innerHTML = "";
      if (previewSection) previewSection.style.display = "none";
      (certData[certYear.value]||[]).forEach(ev => { certEvent.innerHTML += `<option value="${ev.id}">${ev.name}</option>`; });
    });

    certEvent.addEventListener("change", async () => {
      certName.value = ""; suggestionsBox.innerHTML = "";
      if (previewSection) previewSection.style.display = "none";
      if (!certEvent.value) return;
      const { data: parts } = await sb.from("certificate_participants").select("name").eq("event_id", certEvent.value);
      currentNames = (parts||[]).map(p => p.name);
    });

    certName.addEventListener("input", () => {
      const val = certName.value.toLowerCase();
      suggestionsBox.innerHTML = "";
      if (!val) { suggestionsBox.style.display="none"; return; }
      const matches = currentNames.filter(n => n.toLowerCase().includes(val));
      if (!matches.length) { suggestionsBox.style.display="none"; return; }
      matches.forEach(name => {
        const d = document.createElement("div");
        d.textContent = name;
        d.onclick = () => { certName.value = name; suggestionsBox.style.display="none"; };
        suggestionsBox.appendChild(d);
      });
      suggestionsBox.style.display = "block";
    });

    document.addEventListener("click", e => { if (!e.target.closest(".autocomplete")) suggestionsBox.style.display="none"; });

    previewBtn?.addEventListener("click", async () => {
      const year=certYear.value, eventId=certEvent.value, name=certName.value.trim();
      if (!year||!eventId||!name) { alert("Please select year, event and enter your name"); return; }

      // Validate via Supabase directly (RLS: public read on certificate_participants)
      const { data: parts } = await sb.from("certificate_participants").select("name,position").eq("event_id", eventId).ilike("name", name).limit(1);
      const participant = parts && parts[0];
      if (!participant) { alert("No participant found. Contact admin."); if (previewSection) previewSection.style.display="none"; return; }

      const pos = (participant.position||"").toLowerCase();
      const isWinner = ["first","second","third","1","2","3"].includes(pos);
      document.getElementById("certPreviewPosition").innerText = isWinner ? "Certificate of Appreciation" : "Certificate of Participation";
      document.getElementById("certPreviewName").innerText  = participant.name;
      document.getElementById("certPreviewEvent").innerText = certEvent.options[certEvent.selectedIndex].text;
      document.getElementById("certPreviewYear").innerText  = year;
      if (previewSection) { previewSection.style.display="block"; previewSection.scrollIntoView({behavior:"smooth"}); }
    });

    document.addEventListener("click", e => {
      if (e.target?.id === "downloadCertBtn") {
        const year=certYear.value,eventId=certEvent.value,name=certName.value.trim();
        if (!year||!eventId||!name) { alert("Year, Event and Name are mandatory"); return; }
        // For static site: open certificate-template.html (which fetches from Supabase)
        const url = `certificate-template.html?name=${encodeURIComponent(name)}&event=${encodeURIComponent(certEvent.options[certEvent.selectedIndex].text)}&year=${encodeURIComponent(year)}&event_id=${encodeURIComponent(eventId)}`;
        window.open(url, "_blank");
      }
    });
  }

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from("footer > *", { opacity:0, y:30, duration:0.8, stagger:0.2, scrollTrigger:{trigger:"footer",start:"top 90%"} });
  }
});
