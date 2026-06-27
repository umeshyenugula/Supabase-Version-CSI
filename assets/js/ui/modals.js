
window.openTeamModal = function(member) {
  const modal = document.getElementById('teamModal');
  if (!modal) return;
  const avatarURL = name => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=162848&color=90caf9&bold=true&font-size=0.38`;
  document.getElementById('tmPhoto').src = member.image_url || avatarURL(member.name);
  document.getElementById('tmPhoto').alt = member.name;
  document.getElementById('tmName').textContent  = member.name || '';
  document.getElementById('tmRole').textContent  = member.role || '';
  document.getElementById('tmDept').textContent  = member.department || (member.role_group ? `${member.role_group} Division` : '');
  document.getElementById('tmGroup').textContent = member.category === 'faculty' ? 'Faculty Coordinator' : (member.role_group || member.category || 'Team');
  const links = [];
  if (member.linkedin)  links.push(`<a class="tm-link-btn linkedin"  href="${member.linkedin}"  target="_blank" rel="noopener"><i class="fa-brands fa-linkedin-in"></i> LinkedIn</a>`);
  if (member.instagram) links.push(`<a class="tm-link-btn instagram" href="${member.instagram}" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i> Instagram</a>`);
  if (member.github)    links.push(`<a class="tm-link-btn github"    href="${member.github}"    target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> GitHub</a>`);
  document.getElementById('tmLinks').innerHTML = links.length
    ? links.join('')
    : '<span style="color:rgba(255,255,255,0.3);font-size:0.8rem;">No links added</span>';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

function closeTeamModal() {
  document.getElementById('teamModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('click', e => {
  if (e.target.closest('#tmClose'))    closeTeamModal();
  if (e.target.id === 'teamModal')     closeTeamModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTeamModal(); });


let pendingRedirectUrl = null;

window.openRedirectConfirm = function(url) {
  pendingRedirectUrl = url;
  const modal = document.getElementById('redirectModal');
  const urlEl = document.getElementById('redirectModalUrl');
  if (urlEl) urlEl.textContent = url;
  if (modal) modal.classList.add('open');
};
window.initRedirectModal = function() {
  document.addEventListener('click', e => {
    const cancel   = e.target.closest('#redirectCancelBtn,#redirectModalClose');
    const proceed  = e.target.closest('#redirectContinueBtn');
    const overlay  = e.target.id === 'redirectModal';
    if (cancel || overlay) {
      document.getElementById('redirectModal')?.classList.remove('open');
      pendingRedirectUrl = null;
    }
    if (proceed && pendingRedirectUrl) {
      window.open(pendingRedirectUrl, '_blank', 'noopener,noreferrer');
      document.getElementById('redirectModal')?.classList.remove('open');
      pendingRedirectUrl = null;
    }
  });
};
