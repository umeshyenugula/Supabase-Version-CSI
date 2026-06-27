

window.initEventsPage = async function() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;
  

  let events = cache.get('all_events');
  if (!events) {
    try {
      const { data, error } = await sb.from('events').select('*');
      if (error) throw error;
      events = data || [];
      cache.set('all_events', events);
    } catch (err) {
      console.error('✗ Events load failed:', err.message);
      grid.innerHTML = `<div class="empty-state"><h3>⚠ Failed to load events</h3><p>${err.message}</p></div>`;
      return;
    }
  }

  if (!events.length) {
    grid.innerHTML = '<div class="empty-state"><h3>No events yet.</h3><p>Check back soon!</p></div>';
    return;
  }

  events = sortEventsByDate(events);

  
  grid.className = '';
  grid.style.cssText = '';
  grid.removeAttribute('aria-busy');
  grid.innerHTML = events.map((ev, i) => {
    const img     = ev.image_urls?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=75';
    const dateStr = ev.date ? formatEventDate(ev.date, { year:'numeric', month:'long', day:'numeric' }) : '';
    return `<div class="event-card-full" data-slug="${ev.slug || ev.id}" data-aos="fade-up" data-aos-delay="${(i % 3) * 80}">
      <div class="event-card-image"><img src="${img}" alt="${ev.title}" loading="lazy"></div>
      <div class="event-card-body">
        <h3>${ev.title}</h3>
        <p class="event-date"><i class="fa-regular fa-calendar" style="margin-right:5px;color:var(--csi-accent)"></i>${dateStr}</p>
        <div class="event-card-stats">
          ${ev.participants ? `<div class="event-stat-chip"><i class="fa-solid fa-users"></i>${ev.participants} Participants</div>` : ''}
          ${ev.teams       ? `<div class="event-stat-chip"><i class="fa-solid fa-trophy"></i>${ev.teams} Teams</div>` : ''}
        </div>
        <div class="see-more-btn">View Details <i class="fa-solid fa-arrow-right" style="font-size:0.75em"></i></div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.event-card-full').forEach(card => {
    card.addEventListener('click', () => {
      window.pendingEventId = card.dataset.slug;
      window.navigateTo('event-detail');
    });
  });

  if (typeof AOS !== 'undefined') AOS.refresh();
};


window.initEventDetailPage = async function() {
  const id = window.pendingEventId;
  if (!id) return;

  const cacheKey = `event_${id}`;
  let ev = cache.get(cacheKey);
  if (!ev) {
    try {
      let result = await sb.from('events').select('*').eq('slug', id).maybeSingle();
      if (!result.data) result = await sb.from('events').select('*').eq('id', id).maybeSingle();
      if (result.error) throw result.error;
      ev = result.data;
      if (ev) cache.set(cacheKey, ev);
    } catch (err) {
      console.error('✗ Event detail load failed:', err.message);
      const titleEl = document.getElementById('eventTitle');
      if (titleEl) titleEl.textContent = 'Failed to load event';
      return;
    }
  }
  if (!ev) return;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  
  const titleSk   = document.getElementById('eventTitleSk');
  const titleText = document.getElementById('eventTitleText');
  if (titleSk)   { titleSk.remove(); }
  if (titleText) { titleText.textContent = ev.title || ''; titleText.removeAttribute('hidden'); }
  else           { setEl('eventTitle', ev.title || ''); }
  setEl('eventDate',  ev.date  ? formatEventDate(ev.date, { year:'numeric', month:'long', day:'numeric' }) : '—');
  setEl('eventParticipants',    ev.participants ?? '—');
  setEl('eventTeams',           ev.teams        ?? '—');
  setEl('sidebarParticipants',  ev.participants ?? '—');
  setEl('sidebarTeams',         ev.teams        ?? '—');
  
  const descSk = document.getElementById('eventDescSk');
  const descEl = document.getElementById('eventDescription');
  if (descSk) descSk.remove();
  if (descEl) descEl.removeAttribute('hidden');
  applyReadMore(descEl, ev.description || 'No description available.');

  
  ['eventTimelineSlot','eventCarouselSlot'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  const gallerySection = document.getElementById('gallerySection');
  const galleryGrid    = document.getElementById('eventGalleryGrid');
  if (gallerySection) gallerySection.style.display = 'none';
  if (galleryGrid)    galleryGrid.innerHTML = '';

  
  const heroBg = document.getElementById('eventHeroBg');
  if (heroBg && ev.image_urls?.[0]) heroBg.src = ev.image_urls[0];

  
  if (gallerySection && galleryGrid && ev.image_urls?.length > 1) {
    gallerySection.style.display = 'block';
    buildCreativeGallery(galleryGrid, ev.image_urls);
  }

  
  const tlSlot = document.getElementById('eventTimelineSlot');
  if (tlSlot && ev.timeline?.length) {
    tlSlot.innerHTML = `<h3 style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;margin-bottom:1rem;">Event Timeline</h3>
      <div class="timeline-list">${ev.timeline.map((s, i) => `
        <div class="timeline-item">
          <div class="tl-step">${i + 1}</div>
          <div class="tl-content">
            <div class="tl-title">${s.title || ''}</div>
            <div class="tl-desc">${s.description || ''}</div>
          </div>
        </div>`).join('')}
      </div>`;
  }

  if (typeof gsap !== 'undefined') {
    gsap.from('.event-hero-content > *', { y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' });
    gsap.from('.event-stat-card',        { y: 30, opacity: 0, scale: 0.95, duration: 0.7, stagger: 0.15, delay: 0.3, ease: 'back.out(1.4)' });
  }
};
