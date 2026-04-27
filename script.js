// ── INTRO SCREEN + SKIP BUTTON
window.addEventListener('load', function() {
  var intro = document.getElementById('intro-screen');
  if (!intro) return;

  // Create skip button
  var skipBtn = document.createElement('button');
  skipBtn.textContent = 'Skip';
  skipBtn.style.cssText = [
    'position:absolute', 'bottom:32px', 'right:32px',
    'background:transparent', 'border:1px solid rgba(0,170,255,0.4)',
    'color:#0af', 'font-family:"Share Tech Mono",monospace',
    'font-size:11px', 'letter-spacing:2px', 'text-transform:uppercase',
    'padding:8px 20px', 'cursor:pointer', 'transition:all 0.2s',
    'z-index:10000'
  ].join(';');
  skipBtn.addEventListener('mouseenter', function() {
    skipBtn.style.background = 'rgba(0,170,255,0.12)';
    skipBtn.style.borderColor = '#0af';
  });
  skipBtn.addEventListener('mouseleave', function() {
    skipBtn.style.background = 'transparent';
    skipBtn.style.borderColor = 'rgba(0,170,255,0.4)';
  });
  intro.appendChild(skipBtn);

  function hideIntro() {
    intro.classList.add('intro-hide');
    setTimeout(function() { intro.style.display = 'none'; }, 700);
  }

  // Auto-hide after 3.2s
  var autoTimer = setTimeout(hideIntro, 3200);

  // Skip button hides immediately
  skipBtn.addEventListener('click', function() {
    clearTimeout(autoTimer);
    hideIntro();
  });
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
// Reads target values from data-target attributes on the counter elements
// To update counts: change data-target="X" in index.html, no JS changes needed
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
  var els = [
    document.getElementById('counter-members'),
    document.getElementById('counter-problems'),
    document.getElementById('counter-countries')
  ];
  els.forEach(function(el) {
    if (!el) return;
    // Read from data-target attribute — update the number in HTML, not here
    var target = parseInt(el.getAttribute('data-target'), 10);
    if (!isNaN(target)) animateCounter(el, target);
  });
}, 3400);

// ── SYLLABUS TABS — event listeners, no inline onclick needed
document.addEventListener('DOMContentLoaded', function() {
  var tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var tab = btn.getAttribute('data-tab');
      if (!tab) return;
      document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      var content = document.getElementById('tab-' + tab);
      if (content) content.classList.add('active');
      btn.classList.add('active');
    });
  });
});

// ── CONTACT FORM — tied to actual Formspree response
document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('contactForm');
  var banner = document.getElementById('successBanner');
  var errorBanner = document.getElementById('errorBanner');
  var submitBtn = form ? form.querySelector('.form-submit') : null;

  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Show loading state
    if (submitBtn) {
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
    }

    var data = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
    .then(function(response) {
      if (response.ok) {
        // SUCCESS
        if (banner) banner.style.display = 'block';
        if (errorBanner) errorBanner.style.display = 'none';
        form.reset();
      } else {
        // SERVER ERROR
        return response.json().then(function(data) {
          throw new Error(data.errors ? data.errors.map(function(e){ return e.message; }).join(', ') : 'Server error');
        });
      }
    })
    .catch(function(err) {
      // NETWORK / FORMSPREE ERROR
      if (errorBanner) errorBanner.style.display = 'block';
      if (banner) banner.style.display = 'none';
      console.error('Form error:', err);
    })
    .finally(function() {
      if (submitBtn) {
        submitBtn.textContent = 'Send Message →';
        submitBtn.disabled = false;
      }
    });
  });
});

// ── SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    var target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    if (sidebar) sidebar.classList.remove('open');
  });
});
