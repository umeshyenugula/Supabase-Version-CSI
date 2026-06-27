

window.initAlumniPage = async function() {
  const grid = document.getElementById('alumniGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-spinner" style="grid-column:1/-1"><div class="spinner"></div></div>';

  let alumni = cache.get('alumni');
  if (!alumni) {
    try {
      const { data, error } = await sb.from('alumni').select('*').order('batch', { ascending: false });
      if (error) throw error;
      alumni = data || [];
      cache.set('alumni', alumni);
    } catch (err) {
      console.error('✗ Alumni load failed:', err.message);
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>⚠ Failed to load alumni</h3><p>${err.message}</p></div>`;
      return;
    }
  }

  if (!alumni.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h3>Alumni profiles coming soon.</h3></div>';
    return;
  }

  const tilts = ['-1.5deg','1deg','-0.8deg','1.8deg','0deg','-1.2deg'];
  grid.innerHTML = alumni.map((a, i) => {
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&size=200&background=e8f0fe&color=0a2463&bold=true&font-size=0.4`;
    return `<div class="alumni-card" style="--tilt:${tilts[i % tilts.length]}" data-aos="fade-up" data-aos-delay="${(i % 4) * 60}">
      <div class="alumni-card-img"><img src="${a.image_url || avatar}" alt="${a.name}" loading="lazy"></div>
      <div class="alumni-card-info">
        <h4>${a.name}</h4>
        ${a.position ? `<p style="font-weight:500;color:var(--ink-2);font-size:0.78rem;">${a.position}</p>` : ''}
        ${a.company  ? `<p style="color:var(--muted);font-size:0.72rem;margin-top:2px;"><i class="fa-solid fa-building" style="color:var(--csi-accent);margin-right:4px;font-size:0.65rem;"></i>${a.company}</p>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;flex-wrap:wrap;gap:6px;">
          ${a.batch    ? `<div class="alumni-badge"><i class="fa-solid fa-graduation-cap" style="margin-right:3px;font-size:0.6rem;"></i>Batch ${a.batch}</div>` : ''}
          ${a.linkedin ? `<a href="${a.linkedin}" target="_blank" rel="noopener"
               style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,var(--csi-blue),var(--csi-accent));color:white;font-size:0.65rem;text-decoration:none;transition:transform 0.2s ease;flex-shrink:0;"
               onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
               <i class="fa-brands fa-linkedin-in"></i></a>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');

  if (typeof AOS !== 'undefined') AOS.refresh();
};
