

window.initHomePage = async function() {
  animateCounters();
  makeDraggable(document.getElementById('memoriesScroll'));
  await loadHeroSection();
  await loadBentoEvents();
  await loadMemories();
};


async function loadHeroSection() {
  const titleSk   = document.getElementById('heroTitleSk');
  const titleText = document.getElementById('heroTitleText');
  const btnSk     = document.getElementById('heroBtnSk');
  const frame     = document.getElementById('heroImageFrame');
  if (!titleSk) return;

  let rows = cache.get('hero_section');
  if (!rows) {
    try {
      const { data, error } = await sb.from('hero_section')
        .select('id,type,hero_title,btn1_label,btn1_link,link_type,hero_image_url,updated_at')
        .eq('type', 'hero')
        .order('updated_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      rows = data || [];
      cache.set('hero_section', rows);
    } catch (err) {
      console.error('✗ Hero load failed:', err.message);
      rows = [];
    }
  }

  const hero      = rows[0];
  const title     = hero?.hero_title  || 'Where Technology Meets Excellence';
  const btnLabel  = hero?.btn1_label  || 'Explore Events';
  const btnLink   = hero?.btn1_link   || null;
  const linkType  = hero?.link_type   || 'page';
  const imageUrl  = hero?.hero_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80';

  
  if (titleText) {
    titleText.textContent = title;
    if (titleSk) titleSk.style.opacity = '0';
    setTimeout(() => {
      if (titleSk)   titleSk.hidden = true;
      if (titleText) titleText.hidden = false;
      if (typeof gsap !== 'undefined') gsap.from(titleText, { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out' });
    }, 180);
  }

  
  const existingBtn = document.getElementById('heroBtn1');
  if (existingBtn) {
    existingBtn.innerHTML = `<i class="fa-solid fa-calendar-days"></i> ${btnLabel}`;
    if (linkType === 'url' && btnLink) {
      existingBtn.href = '#';
      existingBtn.addEventListener('click', e => { e.preventDefault(); window.openRedirectConfirm(btnLink); });
    } else {
      existingBtn.href = '?page=events';
      existingBtn.addEventListener('click', e => { e.preventDefault(); window.navigateTo('events'); });
    }
  } else if (btnSk) {
    
    const btn = document.createElement('a');
    btn.className = 'btn-primary';
    btn.href = '#';
    btn.id = 'heroBtn1';
    btn.innerHTML = `<i class="fa-solid fa-calendar-days"></i> ${btnLabel}`;
    if (linkType === 'url' && btnLink) {
      btn.addEventListener('click', e => { e.preventDefault(); window.openRedirectConfirm(btnLink); });
    } else {
      btn.addEventListener('click', e => { e.preventDefault(); window.navigateTo('events'); });
    }
    setTimeout(() => { btnSk.replaceWith(btn); }, 180);
  }

  
  const heroImg = document.getElementById('heroImage');
  if (heroImg && frame) {
    let cardRevealed = false;
    const revealCard = () => {
      if (cardRevealed) return;
      cardRevealed = true;
      setTimeout(() => {
        frame.classList.remove('hero-card-sk', 'sk', 'sk-light');
        const front = document.getElementById('heroCardFront');
        if (front) front.hidden = false;
        if (typeof gsap !== 'undefined') {
          gsap.from(frame, { y: 50, opacity: 0, scale: 0.94, duration: 0.9, ease: 'power3.out', clearProps: 'all' });
          gsap.from('.hero-float-card', { scale: 0.8, opacity: 0, duration: 0.7, stagger: 0.2, delay: 0.25, ease: 'back.out(1.7)', clearProps: 'all' });
        }
        init3DTilt(frame);
      }, 80);
    };
    heroImg.onload = revealCard;
    heroImg.onerror = () => { heroImg.onerror = null; heroImg.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'; };
    heroImg.src = imageUrl;
    heroImg.alt = title;
    const badge = document.getElementById('heroBadgeTitle');
    if (badge) badge.textContent = hero ? 'Latest Drop' : 'Welcome';
    setTimeout(revealCard, 4000);
  }

  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-eyebrow, .hero-sub', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', clearProps: 'all' });
  }
}

function init3DTilt(el) {
  const stage = el.closest('.hero-3d-stage');
  if (!stage || stage.dataset.tiltBound) return;
  stage.dataset.tiltBound = '1';
  stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateZ(20px)`;
  });
  stage.addEventListener('mouseleave', () => {
    el.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)';
  });
}


async function loadBentoEvents() {
  const grid = document.getElementById('bentoBGrid');
  if (!grid) return;

  
  cache.clear('bento_events');
  let events = null;
  try {
    const { data, error } = await sb.from('events').select('id,title,date,slug,image_urls');
    if (error) throw error;
    events = data || [];
    cache.set('bento_events', events);
  } catch (err) {
    console.error('✗ Bento events:', err.message);
    events = [];
  }

  if (!events.length) {
    grid.innerHTML = '<div class="empty-state"><h3>No events yet</h3><p>Check back soon.</p></div>';
    return;
  }

  events = sortEventsByDate(events);

  grid.innerHTML = events.slice(0, 6).map((ev, i) => {
    const img = ev.image_urls?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80';
    return `<div class="bento-card bento-card-${i + 1}" data-slug="${ev.slug || ev.id}" data-aos="fade-up" data-aos-delay="${i * 60}">
      <img class="bento-img" src="${img}" alt="${ev.title}" loading="lazy">
      <div class="bento-overlay">
        <div class="bento-tag">Event</div>
        <div class="bento-title">${ev.title}</div>
        <div class="bento-date">${ev.date ? formatEventDate(ev.date, { year:'numeric', month:'short', day:'numeric' }) : ''}</div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('click', () => {
      window.pendingEventId = card.dataset.slug;
      window.navigateTo('event-detail');
    });
  });

  const floatEvents = document.getElementById('heroFloatEvents');
  const floatMembers = document.getElementById('heroFloatMembers');
  if (floatEvents)  floatEvents.textContent  = events.length + '+';
  if (floatMembers) floatMembers.textContent = '500+';
  if (typeof AOS !== 'undefined') AOS.refresh();
}


async function loadMemories() {
  const scroll = document.getElementById('memoriesScroll');
  if (!scroll) return;
  const events = cache.get('bento_events') || [];
  const allImgs = events.flatMap(e => e.image_urls || []).filter(Boolean).slice(0, 12);
  if (!allImgs.length) {
    scroll.innerHTML = [
      'photo-1511578314322-379afb476865','photo-1527529482837-4698179dc6ce',
      'photo-1475721027785-f74eccf877e2','photo-1540575467063-178a50c2df87'
    ].map(id => `<div class="memory-card" role="listitem"><img src="https://images.unsplash.com/${id}?w=600&q=75" alt="CSI Memory" loading="lazy"></div>`).join('');
    return;
  }
  scroll.innerHTML = allImgs.map(src =>
    `<div class="memory-card" role="listitem"><img src="${src}" alt="CSI Memory" loading="lazy"></div>`
  ).join('');
}


function animateCounters() {
  const els = document.querySelectorAll('.stat-count');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.target;
      const parent = el.closest('.stat-item');
      const startTime = performance.now();
      const duration  = 1800;
      function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
        else { el.textContent = target.toLocaleString(); parent?.classList.add('animated'); }
      }
      requestAnimationFrame(update);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
}


function makeDraggable(el) {
  if (!el) return;
  let isDown = false, startX, scrollLeft;
  el.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; });
  el.addEventListener('mouseleave', () => isDown = false);
  el.addEventListener('mouseup',    () => isDown = false);
  el.addEventListener('mousemove',  e => {
    if (!isDown) return;
    e.preventDefault();
    el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX);
  });
}
