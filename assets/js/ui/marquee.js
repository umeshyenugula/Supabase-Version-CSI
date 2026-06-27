

(function initMarquee() {
  const ITEMS = [
    'Web Development', 'Machine Learning', 'Cloud Computing',
    'Cybersecurity', 'Open Source', 'Competitive Programming',
    'UI / UX Design', 'Data Science', 'Blockchain', 'DevOps',
    'Artificial Intelligence', 'Mobile Apps', 'System Design',
    'Hackathons', 'Research & Innovation',
  ];

  function build() {
    const track = document.getElementById('marqueeTrack');
    if (!track) return;

    
    const set = ITEMS.map(label =>
      `<span class="marquee-item">${label}<span class="marquee-dot"></span></span>`
    ).join('');

    
    track.innerHTML = set + set;
  }

  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

  
  document.addEventListener('page:loaded', build);
})();
