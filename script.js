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

// ── FIREBASE EXAM DEMO
(function() {
  var examContainer = document.getElementById('examContainer');
  var examStatus = document.getElementById('examStatus');
  var examResult = document.getElementById('examResult');
  var authStatus = document.getElementById('authStatus');
  var signInBtn = document.getElementById('signInBtn');
  var startExamBtn = document.getElementById('startExamBtn');
  var leaderboardList = document.getElementById('leaderboardList');
  var currentUser = null;
  var currentTimer = null;
  var remainingSeconds = 300;
  var selectedAnswers = {};
  var examQuestions = [
    {
      id: 'q1',
      text: 'A projectile is launched at 30° above the horizontal with speed 20 m/s. What is the approximate maximum height?',
      options: [
        '5.1 m',
        '7.6 m',
        '10.3 m',
        '12.5 m'
      ],
      answer: 1
    },
    {
      id: 'q2',
      text: 'Which number is a prime factor of 221?',
      options: [
        '11',
        '13',
        '17',
        '19'
      ],
      answer: 0
    },
    {
      id: 'q3',
      text: 'In a chemical equilibrium, increasing temperature shifts the balance to the side that is',
      options: [
        'less exothermic',
        'more exothermic',
        'lower pressure',
        'higher concentration'
      ],
      answer: 0
    }
  ];

  function isFirebaseConfigValid(config) {
    return config && config.apiKey && !config.apiKey.includes('YOUR_');
  }

  function updateAuthUi() {
    if (!authStatus) return;
    if (currentUser) {
      authStatus.textContent = 'Signed in as ' + currentUser.displayName;
      signInBtn.textContent = 'Sign out';
      startExamBtn.disabled = false;
    } else {
      authStatus.textContent = 'Sign in with Google to save your score.';
      signInBtn.textContent = 'Sign in with Google';
      startExamBtn.disabled = false;
    }
  }

  function showMessage(message) {
    if (examStatus) examStatus.textContent = message;
  }

  function renderExam() {
    if (!examContainer) return;
    examContainer.classList.remove('hidden');
    examContainer.innerHTML = '';
    var timerBar = document.createElement('div');
    timerBar.id = 'examTimer';
    timerBar.className = 'exam-status';
    timerBar.textContent = formatTime(remainingSeconds);
    examContainer.appendChild(timerBar);

    examQuestions.forEach(function(question, index) {
      var q = document.createElement('div');
      q.className = 'exam-question';
      q.innerHTML = '<h3>Question ' + (index + 1) + '</h3>' +
        '<p>' + question.text + '</p>';

      question.options.forEach(function(option, optIndex) {
        var label = document.createElement('label');
        label.className = 'exam-option';
        label.innerHTML = '<input type="radio" name="' + question.id + '" value="' + optIndex + '"> ' + option;
        label.addEventListener('click', function() {
          selectedAnswers[question.id] = optIndex;
        });
        q.appendChild(label);
      });
      examContainer.appendChild(q);
    });

    var submitBtn = document.createElement('button');
    submitBtn.className = 'btn-primary exam-submit';
    submitBtn.textContent = 'Submit Exam';
    submitBtn.addEventListener('click', submitExam);
    examContainer.appendChild(submitBtn);
    showMessage('Exam started. You have 5 minutes. Good luck!');
  }

  function formatTime(seconds) {
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;
    return 'Time left: ' + String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  function startTimer() {
    if (currentTimer) clearInterval(currentTimer);
    currentTimer = setInterval(function() {
      remainingSeconds--;
      var timer = document.getElementById('examTimer');
      if (timer) timer.textContent = formatTime(remainingSeconds);
      if (remainingSeconds <= 0) {
        clearInterval(currentTimer);
        submitExam();
      }
    }, 1000);
  }

  function calculateScore() {
    var score = 0;
    examQuestions.forEach(function(question) {
      if (selectedAnswers[question.id] === question.answer) score += 1;
    });
    return score;
  }

  function submitExam() {
    if (currentTimer) {
      clearInterval(currentTimer);
      currentTimer = null;
    }
    var score = calculateScore();
    var message = 'You scored ' + score + ' out of ' + examQuestions.length + '.';
    if (examResult) {
      examResult.classList.remove('hidden');
      examResult.textContent = message;
    }
    showMessage('Exam complete. ' + (currentUser ? 'Saving score...' : 'Sign in to save your result.'));
    if (currentUser && window.db) {
      window.db.collection('examAttempts').add({
        uid: currentUser.uid,
        name: currentUser.displayName || 'Anonymous',
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        showMessage('Score saved to Firebase. Check the leaderboard below.');
        loadLeaderboard();
      }).catch(function(err) {
        console.error('Firestore save failed:', err);
        showMessage('Exam complete. Failed to save score to Firebase.');
      });
    }
  }

  function loadLeaderboard() {
    if (!leaderboardList) return;
    if (!window.db) {
      leaderboardList.textContent = 'Leaderboard unavailable until Firebase is configured.';
      return;
    }
    window.db.collection('examAttempts')
      .orderBy('score', 'desc')
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get()
      .then(function(snapshot) {
        if (snapshot.empty) {
          leaderboardList.innerHTML = '<div class="leaderboard-item"><span>No attempts yet.</span></div>';
          return;
        }
        leaderboardList.innerHTML = '';
        snapshot.forEach(function(doc) {
          var data = doc.data();
          var item = document.createElement('div');
          item.className = 'leaderboard-item';
          item.innerHTML = '<strong>' + (data.name || 'Guest') + '</strong><span>' + (data.score || 0) + '/' + examQuestions.length + '</span>';
          leaderboardList.appendChild(item);
        });
      }).catch(function(err) {
        console.error('Leaderboard error:', err);
        leaderboardList.textContent = 'Unable to load leaderboard right now.';
      });
  }

  function initFirebaseExam() {
    if (!signInBtn || !startExamBtn || !authStatus) return;

    var firebaseConfig = {
      apiKey: "AIzaSyBuculpQXW1j_2eaWSOhO5mer--XwcwkmE",
      authDomain: "prepaxiomfoundry-d4a79.firebaseapp.com",
      projectId: "prepaxiomfoundry-d4a79",
      storageBucket: "prepaxiomfoundry-d4a79.firebasestorage.app",
      messagingSenderId: "851208226756",
      appId: "1:851208226756:web:5bdde19467ddf9e0eb4691",
      measurementId: "G-R3GQ6M07ZJ"
    };

    if (!isFirebaseConfigValid(firebaseConfig)) {
      authStatus.textContent = 'Firebase config required in script.js to enable auth and saving.';
      leaderboardList.textContent = 'Configure Firebase in script.js and reload to show leaderboard.';
      startExamBtn.disabled = false;
      signInBtn.addEventListener('click', function() {
        showMessage('Edit script.js and paste your Firebase config values, then reload the page.');
      });
      startExamBtn.addEventListener('click', function() {
        remainingSeconds = 300;
        selectedAnswers = {};
        renderExam();
        startTimer();
      });
      return;
    }

    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
    var provider = new firebase.auth.GoogleAuthProvider();

    signInBtn.addEventListener('click', function() {
      if (currentUser) {
        firebase.auth().signOut();
      } else {
        firebase.auth().signInWithPopup(provider).catch(function(err) {
          console.error('Sign in failed:', err);
          showMessage('Google sign-in failed. Please try again.');
        });
      }
    });

    startExamBtn.addEventListener('click', function() {
      remainingSeconds = 300;
      selectedAnswers = {};
      renderExam();
      startTimer();
    });

    firebase.auth().onAuthStateChanged(function(user) {
      currentUser = user;
      updateAuthUi();
      if (user) {
        loadLeaderboard();
      }
    });

    loadLeaderboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebaseExam);
  } else {
    initFirebaseExam();
  }
})();

