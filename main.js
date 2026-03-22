// ── Theme ──────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('sp-theme');
if (savedTheme === 'light') document.body.classList.add('light');

function toggleTheme() {
  document.body.classList.toggle('light');
  localStorage.setItem('sp-theme', document.body.classList.contains('light') ? 'light' : 'dark');
}

// ── Nav inject + active link (must run together) ───────────────────
(function () {
  const nav = document.querySelector('nav[data-shared]');
  if (!nav) return;

  const page = location.pathname.split('/').pop() || 'index.html';

  nav.innerHTML = `
    <a class="nav-logo" href="index.html">SP.</a>
    <div class="nav-links">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="skills.html">Skills</a>
      <a href="projects.html">Projects</a>
      <a href="certifications.html">Certifications</a>
      <a href="contact.html">Contact</a>
    </div>
    <div class="nav-right">
      <button class="theme-btn" onclick="toggleTheme()"></button>
    </div>
  `;

  nav.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) {
      a.classList.add('active');
    }
  });
})();

// ── Custom cursor ──────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
if (cursor && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function animCursor() {
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
  })();
  document.querySelectorAll('a, button, .proj-card, .exp-card, .cert-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '20px'; cursor.style.height = '20px';
      ring.style.width = '50px'; ring.style.height = '50px'; ring.style.opacity = '.25';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '10px'; cursor.style.height = '10px';
      ring.style.width = '36px'; ring.style.height = '36px'; ring.style.opacity = '.45';
    });
  });
}

// ── Particle network canvas ────────────────────────────────────────
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function mkP() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.3 + 0.3,
      vx: (Math.random() - .5) * .22,
      vy: (Math.random() - .5) * .22,
      a: Math.random() * .55 + .1
    };
  }
  function init() { pts = Array.from({ length: 85 }, mkP); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const light = document.body.classList.contains('light');
    const col = light ? '91,79,240' : '123,110,246';
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col},${p.a * (light ? .22 : .48)})`;
      ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 115) {
          const alpha = (1 - d / 115) * (light ? .06 : .11);
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${col},${alpha})`; ctx.lineWidth = .6; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  resize(); init(); draw();
  window.addEventListener('resize', () => { resize(); init(); });
})();

// ── Scroll reveal ──────────────────────────────────────────────────
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      e.target.querySelectorAll('.skill-fill').forEach(f => {
        setTimeout(() => { f.style.width = f.dataset.w + '%'; }, 100);
      });
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(r => obs.observe(r));
})();

// ── Stagger children reveal ────────────────────────────────────────
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      Array.from(e.target.children).forEach((child, i) => {
        setTimeout(() => child.classList.add('visible'), i * 80);
      });
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.stagger-grid').forEach(g => {
    g.querySelectorAll(':scope > *').forEach(c => c.classList.add('reveal'));
    obs.observe(g);
  });
})();

// ── Modal ──────────────────────────────────────────────────────────
function openModal(data) {
  const overlay = document.getElementById('modal');
  if (!overlay) return;
  document.getElementById('modal-img-wrap').innerHTML = data.img
    ? `<img src="${data.img}" class="modal-img" alt="${data.title}">`
    : `<div class="modal-img-ph">${data.emoji || '&#128203;'}</div>`;
  document.getElementById('modal-title').textContent  = data.title;
  document.getElementById('modal-period').textContent = data.period || '';
  document.getElementById('modal-desc').textContent   = data.desc;
  document.getElementById('modal-tags').innerHTML     = (data.tags || []).map(t => `<span class="tag-accent">${t}</span>`).join('');
  document.getElementById('modal-highlights').innerHTML = (data.highlights || [])
    .map(h => `<div class="highlight-item"><div class="hl-dot"></div><span>${h}</span></div>`).join('');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const o = document.getElementById('modal');
  if (o) o.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });