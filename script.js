/* ═══════════════════════════════════════════════════════
   PREP AXIOM FOUNDRY — CORE LOGIC ARCHITECTURE
   Unified State Engine · Real-time Matrix Systems
   ═══════════════════════════════════════════════════════ */

// ── GLOBAL ARCHITECTURE & STATE CONFIGURATION
(function() {
  var firebaseConfig = {
    apiKey: "AIzaSyBuculpQXW1j_2eaWSOhO5mer--XwcwkmE",
    authDomain: "prepaxiomfoundry-d4a79.firebaseapp.com",
    projectId: "prepaxiomfoundry-d4a79",
    storageBucket: "prepaxiomfoundry-d4a79.firebasestorage.app",
    messagingSenderId: "851208226756",
    appId: "1:851208226756:web:5bdde19467ddf9e0eb4691",
    measurementId: "G-R3GQ6M07ZJ"
  };

  // Safe Single-Instance Initialization Engine
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    // Fixed: Explicitly binding legacy compat interface to the custom "default" storage instance
    window.db = firebase.firestore.prototype.constructor(firebase.apps[0], "default");
  } else {
    window.db = null;
  }

  window.globalCurrentUser = null;
  var storedUser = sessionStorage.getItem('currentUser');
  if (storedUser) {
    window.globalCurrentUser = JSON.parse(storedUser);
  }
})();

// ── INTRO SCREEN + SKIP BUTTON
window.addEventListener('load', function() {
  var intro = document.getElementById('intro-screen');
  if (!intro) return;

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

  var autoTimer = setTimeout(hideIntro, 3200);

  skipBtn.addEventListener('click', function() {
    clearTimeout(autoTimer);
    hideIntro();
  });
});

// ── GLOBAL LOGIN INTERACTION MANAGEMENT
document.addEventListener('DOMContentLoaded', function() {
  var loginToggle = document.getElementById('globalLoginToggle');
  var loginForm = document.getElementById('globalLoginForm');
  var loginCancel = document.getElementById('globalLoginCancel');
  var loginBtn = document.getElementById('globalLoginBtn');
  var logoutBtn = document.getElementById('globalLogoutBtn');
  var loginError = document.getElementById('globalLoginError');
  var usernameInput = document.getElementById('globalLoginUsername');
  var passwordInput = document.getElementById('globalLoginPassword');

  function updateGlobalLoginUI() {
    var loginWidget = document.getElementById('globalLoginWidget');
    var userDisplay = document.getElementById('globalUserDisplay');
    var statusBlock = document.getElementById('globalLoginStatus');

    if (!loginWidget) return;

    if (window.globalCurrentUser) {
      if (loginToggle) loginToggle.style.display = 'none';
      if (loginForm) loginForm.style.display = 'none';
      if (statusBlock) statusBlock.style.display = 'block';
      if (userDisplay) userDisplay.textContent = window.globalCurrentUser.name;
    } else {
      if (loginToggle) loginToggle.style.display = 'block';
      if (statusBlock) statusBlock.style.display = 'none';
      if (loginForm) loginForm.style.display = 'none';
    }
  }

  if (loginToggle && loginForm) {
    loginToggle.addEventListener('click', function() {
      loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  if (loginCancel && loginForm) {
    loginCancel.addEventListener('click', function() {
      loginForm.style.display = 'none';
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      var username = usernameInput.value.trim();
      var password = passwordInput.value.trim();

      if (!window.db) {
        loginError.textContent = 'Authentication unavailable: Database disconnected.';
        loginError.style.display = 'block';
        return;
      }

      if (!username || !password) {
        loginError.textContent = 'Please enter username and password.';
        loginError.style.display = 'block';
        return;
      }

      window.db.collection('registeredUsers')
        .where('username', '==', username)
        .where('password', '==', password)
        .get()
        .then(function(snapshot) {
          if (snapshot.empty) {
            loginError.textContent = 'Invalid username or password.';
            loginError.style.display = 'block';
            return;
          }

          var userData = snapshot.docs[0].data();
          window.globalCurrentUser = {
            uid: snapshot.docs[0].id,
            name: userData.name,
            username: userData.username
          };
          sessionStorage.setItem('currentUser', JSON.stringify(window.globalCurrentUser));
          loginError.style.display = 'none';
          usernameInput.value = '';
          passwordInput.value = '';
          loginForm.style.display = 'none';
          updateGlobalLoginUI();
          
          if (typeof window.syncExamAuthSession === 'function') {
            window.syncExamAuthSession();
          }
        })
        .catch(function(err) {
          loginError.textContent = 'Error: ' + err.message;
          loginError.style.display = 'block';
        });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      window.globalCurrentUser = null;
      sessionStorage.removeItem('currentUser');
      updateGlobalLoginUI();
      if (typeof window.syncExamAuthSession === 'function') {
        window.syncExamAuthSession();
      }
    });
  }

  updateGlobalLoginUI();
});

// ── PARTICLES GENERATION ENGINE
(function() {
  var container = document.getElementById('particles');
  if (!container) return;
  for (var i = 0; i < 35; i++) {
    var p = document.createElement('div');
    p.className = 'particle';
    var size = Math.random() * 3 + 1;
    p.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (Math.random()*100) + '%;animation-duration:' + (Math.random()*20+15) + 's;animation-delay:' + (Math.random()*20) + 's;';
    container.appendChild(p);
  }
})();

// ── HAMBURGER NAVIGATION SYSTEMS
(function() {
  var hamburger = document.getElementById('hamburger');
  var sidebar = document.getElementById('sidebar');
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', function() { sidebar.classList.toggle('open'); });
    document.addEventListener('click', function(e) {
      if (!sidebar.contains(e.target) && !hamburger.contains(e.target))
        sidebar.classList.remove('open');
    });
  }
})();

// ── SCROLL-BOUND NAVIGATION TRACKING
(function() {
  var sections = document.querySelectorAll('section');
  var navLinks = document.querySelectorAll('#sidebar nav a');
  if (sections.length > 0 && typeof IntersectionObserver !== 'undefined') {
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
})();

// ── SCROLL REVEAL UTILITY
(function() {
  if (typeof IntersectionObserver === 'undefined') return;
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });
})();

// ── DYNAMIC COUNTERS ANIMATION ENGINE
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
    var target = parseInt(el.getAttribute('data-target'), 10);
    if (!isNaN(target)) animateCounter(el, target);
  });
}, 3400);

// ── CARD GLOW INTERACTIONS
document.addEventListener('DOMContentLoaded', function() {
  var selectors = '.hof-card, .feature-card, .team-card, .member-card, .hero-card, .grid-card';
  var cards = document.querySelectorAll(selectors);
  if (!cards || cards.length === 0) return;

  function triggerGlow(el) {
    if (!el) return;
    el.classList.add('glow');
    if (el._glowTimeout) clearTimeout(el._glowTimeout);
    el._glowTimeout = setTimeout(function() { el.classList.remove('glow'); }, 800);
  }

  cards.forEach(function(card) {
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    card.addEventListener('click', function() { triggerGlow(card); });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerGlow(card);
      }
    });
  });
});

// ── ACADEMIC SYLLABUS INTERACTIVE TABS
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

// ── OUTBOUND FORM UTILITY MANAGEMENT (FORMSPREE)
document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('contactForm');
  var banner = document.getElementById('successBanner');
  var errorBanner = document.getElementById('errorBanner');
  var submitBtn = form ? form.querySelector('.form-submit') : null;

  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
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
        if (banner) banner.style.display = 'block';
        if (errorBanner) errorBanner.style.display = 'none';
        form.reset();
      } else {
        return response.json().then(function(data) {
          throw new Error(data.errors ? data.errors.map(function(e){ return e.message; }).join(', ') : 'Server error');
        });
      }
    })
    .catch(function(err) {
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

// ── INTER-PAGE SMOOTH SCROLL ROUTERS
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    var target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    var sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  });
});

// ── INTEGRATED LIVE EVALUATION SYSTEMS (EXAMS)
(function() {
  var examContainer = document.getElementById('examContainer');
  var examStatus = document.getElementById('examStatus');
  var examResult = document.getElementById('examResult');
  var authStatus = document.getElementById('authStatus');
  var signInBtn = document.getElementById('signInBtn');
  var startExamBtn = document.getElementById('startExamBtn');
  var leaderboardList = document.getElementById('leaderboardList');
  
  var currentTimer = null;
  var remainingSeconds = 300;
  var selectedAnswers = {};
  var currentQuestionIndex = 0;
  
  var examQuestions = [
    {
      id: 'q1',
      text: 'A projectile is launched at 30° above the horizontal with speed 20 m/s. What is the approximate maximum height?',
      options: ['5.1 m', '7.6 m', '10.3 m', '12.5 m'],
      answer: 1
    },
    {
      id: 'q2',
      text: 'Which number is a prime factor of 221?',
      options: ['11', '13', '17', '19'],
      answer: 1
    },
    {
      id: 'q3',
      text: 'In a chemical equilibrium, increasing temperature shifts the balance to the side that is',
      options: ['less exothermic', 'more exothermic', 'lower pressure', 'higher concentration'],
      answer: 0
    }
  ];

  window.syncExamAuthSession = function() {
    var sessionData = sessionStorage.getItem('currentUser');
    window.globalCurrentUser = sessionData ? JSON.parse(sessionData) : null;
    
    if (!authStatus) return;
    var loginForm = document.getElementById('examLoginForm');
    
    if (window.globalCurrentUser) {
      authStatus.textContent = 'Logged in as ' + window.globalCurrentUser.name;
      if (signInBtn) signInBtn.textContent = 'Log Out';
      if (startExamBtn) startExamBtn.disabled = false;
      if (loginForm) loginForm.style.display = 'none';
    } else {
      authStatus.textContent = 'Log in with your credentials to take the exam.';
      if (signInBtn) signInBtn.textContent = 'Log In';
      if (startExamBtn) startExamBtn.disabled = true;
      if (loginForm) loginForm.style.display = 'none';
    }
  };

  function showMessage(message) {
    if (examStatus) examStatus.textContent = message;
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

  function submitExam() {
    if (currentTimer) {
      clearInterval(currentTimer);
      currentTimer = null;
    }
    
    var score = 0;
    examQuestions.forEach(function(question) {
      if (selectedAnswers[question.id] === question.answer) score += 1;
    });

    var message = 'You scored ' + score + ' out of ' + examQuestions.length + '.';
    if (examResult) {
      examResult.classList.remove('hidden');
      examResult.textContent = message;
    }
    if (examContainer) examContainer.classList.add('hidden');
    showMessage('Exam complete. ' + (window.globalCurrentUser ? 'Saving score...' : 'Log in to save your result.'));
    
    if (window.globalCurrentUser && window.db) {
      window.db.collection('examAttempts').add({
        uid: window.globalCurrentUser.uid,
        name: window.globalCurrentUser.name,
        username: window.globalCurrentUser.username,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        showMessage('Score saved to Firebase. Check the leaderboard below.');
        loadLeaderboard();
      }).catch(function(err) {
        console.error('Firestore save failed:', err);
        showMessage('Exam complete. Failed to save score.');
      });
    }
    currentQuestionIndex = 0;
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

    var progressBar = document.createElement('div');
    progressBar.style.cssText = 'background:rgba(0,170,255,0.1); border:1px solid rgba(0,170,255,0.2); height:8px; margin:15px 0; border-radius:4px; overflow:hidden;';
    var progressFill = document.createElement('div');
    progressFill.style.cssText = 'background:#0af; height:100%; width:' + ((currentQuestionIndex + 1) / examQuestions.length * 100) + '%;';
    progressBar.appendChild(progressFill);
    examContainer.appendChild(progressBar);
    
    var progressText = document.createElement('div');
    progressText.style.cssText = 'font-size:11px; color:rgba(122,154,181,0.7); margin-bottom:20px; text-align:center;';
    progressText.textContent = 'Question ' + (currentQuestionIndex + 1) + ' of ' + examQuestions.length;
    examContainer.appendChild(progressText);

    var question = examQuestions[currentQuestionIndex];
    var q = document.createElement('div');
    q.className = 'exam-question';
    q.innerHTML = '<h3>Question ' + (currentQuestionIndex + 1) + '</h3><p>' + question.text + '</p>';

    question.options.forEach(function(option, optIndex) {
      var label = document.createElement('label');
      label.className = 'exam-option';
      label.innerHTML = '<input type="radio" name="' + question.id + '" value="' + optIndex + '"> ' + option;
      
      var radioInput = label.querySelector('input');
      if(selectedAnswers[question.id] === optIndex) {
        radioInput.checked = true;
      }

      radioInput.addEventListener('change', function() {
        selectedAnswers[question.id] = optIndex;
        setTimeout(function() {
          if (currentQuestionIndex < examQuestions.length - 1) {
            currentQuestionIndex++;
            renderExam();
          }
        }, 300);
      });
      q.appendChild(label);
    });
    examContainer.appendChild(q);

    var navDiv = document.createElement('div');
    navDiv.style.cssText = 'display:flex; gap:10px; margin-top:20px; justify-content:space-between;';
    
    if (currentQuestionIndex > 0) {
      var prevBtn = document.createElement('button');
      prevBtn.className = 'btn-secondary exam-submit';
      prevBtn.textContent = '← Previous';
      prevBtn.addEventListener('click', function() {
        currentQuestionIndex--;
        renderExam();
      });
      navDiv.appendChild(prevBtn);
    }

    if (currentQuestionIndex < examQuestions.length - 1) {
      var nextBtn = document.createElement('button');
      nextBtn.className = 'btn-secondary exam-submit';
      nextBtn.textContent = 'Next →';
      nextBtn.addEventListener('click', function() {
        currentQuestionIndex++;
        renderExam();
      });
      navDiv.appendChild(nextBtn);
    } else {
      var submitBtn = document.createElement('button');
      submitBtn.className = 'btn-primary exam-submit';
      submitBtn.textContent = 'Submit Exam';
      submitBtn.addEventListener('click', submitExam);
      navDiv.appendChild(submitBtn);
    }
    
    examContainer.appendChild(navDiv);
    showMessage('Question ' + (currentQuestionIndex + 1) + '. Answer and it will auto-advance.');
  }

  function loadLeaderboard() {
    if (!leaderboardList) return;
    if (!window.db) {
      leaderboardList.textContent = 'Leaderboard unavailable until database syncs.';
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
        leaderboardList.textContent = 'Unable to load leaderboard.';
      });
  }

  function initFirebaseExam() {
    if (!signInBtn || !startExamBtn || !authStatus) return;

    signInBtn.addEventListener('click', function() {
      if (window.globalCurrentUser) {
        window.globalCurrentUser = null;
        sessionStorage.removeItem('currentUser');
        window.syncExamAuthSession();
        showMessage('Logged out.');
      } else {
        var loginForm = document.getElementById('examLoginForm');
        if (loginForm) {
          loginForm.style.display = (loginForm.style.display === 'none' || loginForm.style.display === '') ? 'block' : 'none';
        }
      }
    });

    var examLoginBtn = document.getElementById('examLoginBtn');
    var examLoginUsername = document.getElementById('examLoginUsername');
    var examLoginPassword = document.getElementById('examLoginPassword');
    var examLoginError = document.getElementById('examLoginError');

    if (examLoginBtn) {
      examLoginBtn.addEventListener('click', function() {
        var username = examLoginUsername.value.trim();
        var password = examLoginPassword.value.trim();

        if (!username || !password) {
          examLoginError.textContent = 'Please enter username and password.';
          examLoginError.style.display = 'block';
          return;
        }

        if (!window.db) {
          examLoginError.textContent = 'Database offline.';
          examLoginError.style.display = 'block';
          return;
        }

        window.db.collection('registeredUsers')
          .where('username', '==', username)
          .where('password', '==', password)
          .get()
          .then(function(snapshot) {
            if (snapshot.empty) {
              examLoginError.textContent = 'Invalid username or password.';
              examLoginError.style.display = 'block';
              return;
            }

            var userData = snapshot.docs[0].data();
            window.globalCurrentUser = {
              uid: snapshot.docs[0].id,
              name: userData.name,
              username: userData.username
            };
            sessionStorage.setItem('currentUser', JSON.stringify(window.globalCurrentUser));
            window.syncExamAuthSession();
            showMessage('Logged in successfully!');
            examLoginError.style.display = 'none';
            examLoginUsername.value = '';
            examLoginPassword.value = '';
          })
          .catch(function(err) {
            examLoginError.textContent = 'Error: ' + err.message;
            examLoginError.style.display = 'block';
          });
      });
    }

    window.syncExamAuthSession();
    loadLeaderboard();

    startExamBtn.addEventListener('click', function() {
      remainingSeconds = 300;
      selectedAnswers = {};
      currentQuestionIndex = 0;
      renderExam();
      startTimer();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebaseExam);
  } else {
    initFirebaseExam();
  }
})();