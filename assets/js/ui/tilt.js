
function initTiltEffects() {
  document.querySelectorAll('.bento-card, .event-card-full, .faculty-card').forEach(card => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = '1';
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}
document.addEventListener('page:loaded', initTiltEffects);
setTimeout(initTiltEffects, 800);


(function buildMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  const items = ['Hackathons','Workshops','Technical Talks','Industry Connect','Coding Challenges','Project Showcases','Guest Lectures','Team Building'];
  const html  = items.map(i => `<span class="marquee-item"><span class="marquee-dot"></span>${i}</span>`).join('');
  track.innerHTML = html + html;
})();


(function initScrollParallax() {
  const sections = document.querySelectorAll('.events-section, .stats-section, .memories-section');
  if (!sections.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)';
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  sections.forEach(s => { s.style.opacity = '0'; s.style.transform = 'translateY(24px)'; io.observe(s); });
})();
