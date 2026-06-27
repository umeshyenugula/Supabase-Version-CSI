

window.initTeamPage = async function() {
  const facultyGrid = document.getElementById('facultyGrid');
  const coreSection = document.getElementById('coreSection');

  let members = cache.get('team_members');
  if (!members) {
    try {
      const { data, error } = await sb.from('team_members')
        .select('*')
        .order('order', { ascending: true, nullsFirst: false });
      if (error) {
        const fallback = await sb.from('team_members').select('*');
        if (fallback.error) throw fallback.error;
        members = fallback.data || [];
      } else {
        members = data || [];
      }
      cache.set('team_members', members);
    } catch (err) {
      console.error('✗ Team load failed:', err.message);
      displayErrorBanner('Failed to load team: ' + err.message);
      members = [];
    }
  }

  const faculty = members.filter(m => m.category === 'faculty');
  const core    = members.filter(m => m.category !== 'faculty');
  const avatarURL = name => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=120&background=162848&color=90caf9&bold=true&font-size=0.38`;

  
  if (facultyGrid) {
    if (!faculty.length) {
      facultyGrid.innerHTML = '<div class="empty-state"><h3>Coming soon</h3></div>';
    } else {
      facultyGrid.innerHTML = faculty.map((m, i) => `
        <div class="faculty-card" data-aos="fade-up" data-aos-delay="${i * 70}"
             data-member-idx="${members.indexOf(m)}" style="cursor:pointer;">
          <div class="faculty-photo">
            <img src="${m.image_url || avatarURL(m.name)}" alt="${m.name}" loading="lazy">
          </div>
          <h4 style="font-family:var(--font-display);font-size:0.95rem;font-weight:700;color:var(--ink);margin-bottom:4px;">${m.name}</h4>
          <p class="designation" style="font-size:0.78rem;color:var(--muted);line-height:1.5;">${m.role}${m.department ? `<br><span style="color:var(--csi-accent);font-size:0.7rem;font-weight:600;">${m.department}</span>` : ''}</p>
          <div style="margin-top:10px;font-size:0.7rem;color:rgba(255,255,255,0.3);">Click to view profile</div>
        </div>`).join('');
      facultyGrid.querySelectorAll('.faculty-card').forEach(card => {
        const idx = +card.dataset.memberIdx;
        card.addEventListener('click', () => openTeamModal(members[idx]));
      });
    }
  }

  
  if (coreSection) {
    if (!core.length) {
      coreSection.innerHTML = '<div class="empty-state"><h3>Coming soon</h3></div>';
    } else {
      const groups = {};
      core.forEach(m => {
        const g = m.role_group || 'General';
        (groups[g] = groups[g] || []).push(m);
      });

      const ROLE_PRIORITY = [
        /principal\s*convener|principal\s*convenor/i,
        /executive\s*convener|executive\s*convenor/i,
        /secretary/i, /vice\s*president|vp/i, /president/i,
        /treasurer/i, /lead/i, /head/i, /co[\s-]?lead|co[\s-]?head/i,
      ];
      const roleWeight = role => {
        for (let i = 0; i < ROLE_PRIORITY.length; i++) if (ROLE_PRIORITY[i].test(role || '')) return i;
        return ROLE_PRIORITY.length;
      };
      Object.keys(groups).forEach(g => groups[g].sort((a, b) => roleWeight(a.role) - roleWeight(b.role)));

      const GROUP_ORDER = ['advisors','senior management','management','technical','finance'];
      const sortedGroupNames = Object.keys(groups).sort((a, b) => {
        const ai = GROUP_ORDER.indexOf(a.toLowerCase()), bi = GROUP_ORDER.indexOf(b.toLowerCase());
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1; if (bi !== -1) return 1;
        return a.localeCompare(b);
      });

      coreSection.innerHTML =
        `<div class="team-flip-hint" data-aos="fade-up"><span><i class="fa-solid fa-hand-pointer"></i> Click any card to view full profile</span></div>` +
        sortedGroupNames.map(groupName => `
          <div class="role-group-section" data-aos="fade-up">
            <div class="role-group-label">${groupName}</div>
            <div class="role-group-grid">
              ${groups[groupName].map(m => `
                <div class="core-card" data-member-name="${m.name}">
                  <div class="core-card-inner">
                    <div class="core-card-front">
                      <div class="core-photo"><img src="${m.image_url || avatarURL(m.name)}" alt="${m.name}" loading="lazy"></div>
                      <h4>${m.name}</h4>
                      <p class="role">${m.role || ''}</p>
                    </div>
                    <div class="core-card-back">
                      <div style="width:52px;height:52px;border-radius:50%;overflow:hidden;margin-bottom:10px;border:2px solid rgba(255,255,255,0.25);position:relative;z-index:1;">
                        <img src="${m.image_url || avatarURL(m.name)}" alt="${m.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
                      </div>
                      <h4>${m.name}</h4>
                      <p class="role-back">${m.role || ''}</p>
                      <div class="socials">
                        ${m.linkedin  ? `<a href="${m.linkedin}"  target="_blank" rel="noopener" title="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>` : ''}
                        ${m.instagram ? `<a href="${m.instagram}" target="_blank" rel="noopener" title="Instagram"><i class="fa-brands fa-instagram"></i></a>` : ''}
                        ${m.github    ? `<a href="${m.github}"    target="_blank" rel="noopener" title="GitHub"><i class="fa-brands fa-github"></i></a>` : ''}
                      </div>
                      <div style="margin-top:10px;font-size:0.68rem;color:rgba(255,255,255,0.4);cursor:pointer;">Click for full profile</div>
                    </div>
                  </div>
                </div>`).join('')}
            </div>
          </div>`).join('');

      coreSection.querySelectorAll('.core-card').forEach(card => {
        card.addEventListener('click', () => {
          const m = core.find(x => x.name === card.dataset.memberName);
          if (m) openTeamModal(m);
        });
      });
    }
  }
  if (typeof AOS !== 'undefined') AOS.refresh();
};
