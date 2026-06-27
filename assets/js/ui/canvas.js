
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  function createParticles() {
    particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.4 + 0.1
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(41,121,255,${p.o})`; ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(41,121,255,${0.08 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  resize(); createParticles(); draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
  const hero = document.getElementById('hero');
  const frame = document.getElementById('heroImageFrame');
  hero?.addEventListener('mousemove', e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.height / 2) / rect.height;
    if (frame) frame.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
  });
  hero?.addEventListener('mouseleave', () => { if (frame) frame.style.transform = ''; });
})();
