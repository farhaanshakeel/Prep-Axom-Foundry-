// ── PARTICLES
const container = document.getElementById('particles');
for (let i = 0; i < 35; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 3 + 1;
  p.style.cssText = `
    width:${size}px; height:${size}px;
    left:${Math.random()*100}%;
    animation-duration:${Math.random()*20+15}s;
    animation-delay:${Math.random()*20}s;
  `;
  container.appendChild(p);
}

// ── HAMBURGER
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));
document.addEventListener('click', e => {
  if (!sidebar.contains(e.target) && !hamburger.contains(e.target))
    sidebar.classList.remove('open');
});

// ── ACTIVE NAV ON SCROLL
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('#sidebar nav a');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const id = entry.target.id;
      const active = document.querySelector(`#sidebar nav a[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => observer.observe(s));

// ── SCROLL REVEAL
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── TYPING EFFECT (available for future use)
function typeWriter(element, text, speed = 60) {
  let i = 0;
  element.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'typed-cursor';
  element.parentNode.appendChild(cursor);
  const interval = setInterval(() => {
    element.textContent += text[i++];
    if (i >= text.length) {
      clearInterval(interval);
      setTimeout(() => cursor.remove(), 2000);
    }
  }, speed);
}

// ── COUNTERS
// To update numbers: change the values below (e.g. 42, 150, 12)
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target; clearInterval(timer); return; }
    el.textContent = Math.floor(start);
  }, 16);
}
setTimeout(() => {
  animateCounter(document.getElementById('counter-members'), 0);   // ← change 0 to real number
  animateCounter(document.getElementById('counter-problems'), 0);  // ← change 0 to real number
  animateCounter(document.getElementById('counter-countries'), 0); // ← change 0 to real number
}, 1200);

// ── SYLLABUS TABS
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  event.target.classList.add('active');
}

// ── SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    sidebar.classList.remove('open');
  });
});
