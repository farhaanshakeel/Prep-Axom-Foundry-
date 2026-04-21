// ── INTRO SCREEN
window.addEventListener('load', function() {
  setTimeout(function() {
    var intro = document.getElementById('intro-screen');
    if (intro) {
      intro.classList.add('intro-hide');
      setTimeout(function() {
        intro.style.display = 'none';
      }, 700);
    }
  }, 3200);
});

// ── PARTICLES
var container = document.getElementById('particles');
if (container) {
  for (var i = 0; i < 35; i++) {
    var p = document.createElement('div');
    p.className = 'particle';
    var size = Math.random() * 3 + 1;
    p.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (Math.random()*100) + '%;animation-duration:' + (Math.random()*20+15) + 's;animation-delay:' + (Math.random()*20) + 's;';
    container.appendChild(p);
  }
}

// ── HAMBURGER
var hamburger = document.getElementById('hamburger');
var sidebar = document.getElementById('sidebar');
if (hamburger && sidebar) {
  hamburger.addEventListener('click', function() { sidebar.classList.toggle('open'); });
  document.addEventListener('click', function(e) {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target))
      sidebar.classList.remove('open');
  });
}

// ── ACTIVE NAV ON SCROLL
var sections = document.querySelectorAll('section');
var navLinks = document.querySelectorAll('#sidebar nav a');
if (sections.length > 0) {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function(a) { a.classList.remove('active'); });
        var id = entry.target.id;
        var active = document.querySelector('#sidebar nav a[href="#' + id + '"]');
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(function(s) { observer.observe(s); });
}

// ── SCROLL REVEAL
var revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });

// ── COUNTERS
function animateCounter(el, target) {
  if (!el) return;
  var start = 0;
  var duration = 2000;
  var step = target / (duration / 16);
  var timer = setInterval(function() {
    start += step;
    if (start >= target) { el.textContent = target; clearInterval(timer); return; }
    el.textContent = Math.floor(start);
  }, 16);
}
setTimeout(function() {
  animateCounter(document.getElementById('counter-members'), 17);
  animateCounter(document.getElementById('counter-problems'), 3);
  animateCounter(document.getElementById('counter-countries'), 4);
}, 3400);

// ── SYLLABUS TABS
function switchTab(e, tab) {
  document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  var content = document.getElementById('tab-' + tab);
  if (content) content.classList.add('active');
  if (e && e.target) e.target.classList.add('active');
}

// ── SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    var target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    if (sidebar) sidebar.classList.remove('open');
  });
});
