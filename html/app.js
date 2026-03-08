(function () {
  'use strict';

  // 1. Init DOM from CONFIG

  var videoEl = document.getElementById('bg-video');
  if (CONFIG.videoUrl) {
    var source = document.createElement('source');
    source.src = CONFIG.videoUrl;
    source.type = CONFIG.videoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4';
    videoEl.appendChild(source);
  }

  // 1b. Background carousel

  var carouselContainer = document.getElementById('carousel-container');
  var carouselTrack = document.getElementById('carousel-track');
  var carouselDotsEl = document.getElementById('carousel-dots');
  var carouselCfg = CONFIG.carousel || {};
  var carouselImgs = carouselCfg.images || [];
  var carouselActive = !CONFIG.videoUrl && carouselImgs.length > 0;
  var carouselIndex = 0;
  var carouselSlides = [];
  var carouselInterval = carouselCfg.interval || 7000;
  var carouselTransDur = carouselCfg.transitionDuration || 1.5;
  var carouselKenBurns = carouselCfg.kenBurns !== false;
  var carouselAutoTimer = null;
  var carouselTimerTween = null;
  var kbOrigins = ['center', '20% 20%', '80% 80%', '80% 20%', '20% 80%', '50% 20%', '50% 80%'];

  if (carouselActive) {
    document.querySelector('.video-container').style.display = 'none';
    carouselContainer.style.display = 'block';

    carouselImgs.forEach(function (img, i) {
      var slide = document.createElement('div');
      slide.className = 'carousel-slide';
      var imgEl = document.createElement('img');
      imgEl.src = img.src;
      imgEl.alt = img.alt || '';
      imgEl.draggable = false;
      slide.appendChild(imgEl);
      carouselTrack.appendChild(slide);
      carouselSlides.push({ el: slide, img: imgEl });

      if (i === 0) gsap.set(slide, { opacity: 1 });

      var dot = document.createElement('span');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      var fill = document.createElement('span');
      fill.className = 'dot-fill';
      dot.appendChild(fill);
      (function (idx) {
        dot.addEventListener('click', function () { goToSlide(idx); });
      })(i);
      carouselDotsEl.appendChild(dot);
    });
  }

  var kbTweens = [];

  function carouselKB(idx) {
    if (!carouselKenBurns || !carouselActive) return;
    if (kbTweens[idx]) kbTweens[idx].kill();
    var img = carouselSlides[idx].img;
    kbTweens[idx] = gsap.fromTo(img,
      { scale: 1.0, transformOrigin: kbOrigins[idx % kbOrigins.length] },
      { scale: 1.1, duration: carouselInterval / 1000 + 2, ease: 'none' }
    );
  }

  function carouselTimerStart() {
    if (!carouselActive || carouselSlides.length < 2) return;
    var dots = carouselDotsEl.children;
    for (var i = 0; i < dots.length; i++) {
      var f = dots[i].querySelector('.dot-fill');
      gsap.killTweensOf(f);
      gsap.set(f, { height: '0%' });
    }
    var activeFill = dots[carouselIndex].querySelector('.dot-fill');
    if (carouselTimerTween) carouselTimerTween.kill();
    carouselTimerTween = gsap.fromTo(activeFill,
      { height: '0%' },
      { height: '100%', duration: carouselInterval / 1000, ease: 'none' }
    );
  }

  function goToSlide(idx) {
    if (idx === carouselIndex || !carouselActive) return;
    var prev = carouselIndex;
    carouselIndex = idx;
    var dots = carouselDotsEl.children;
    dots[prev].classList.remove('active');
    dots[idx].classList.add('active');

    carouselKB(idx);

    gsap.to(carouselSlides[idx].el, { opacity: 1, duration: carouselTransDur, ease: 'power2.inOut' });
    gsap.to(carouselSlides[prev].el, {
      opacity: 0, duration: carouselTransDur, ease: 'power2.inOut',
      onComplete: function () { if (kbTweens[prev]) { kbTweens[prev].kill(); kbTweens[prev] = null; } }
    });

    scheduleCarousel();
  }

  function scheduleCarousel() {
    if (carouselAutoTimer) clearTimeout(carouselAutoTimer);
    carouselTimerStart();
    carouselAutoTimer = setTimeout(function () {
      var next = (carouselIndex + 1) % carouselSlides.length;
      goToSlide(next);
    }, carouselInterval);
  }

  var musicEl = document.getElementById('bg-music');
  var volumeBtn = document.getElementById('volume-toggle');
  var volumeTrack = document.getElementById('volume-track');
  var volumeFill = document.getElementById('volume-fill');
  var volumeThumb = document.getElementById('volume-thumb');
  var volumeControl = document.getElementById('volume-control');
  var musicReady = false;

  var savedVolume = localStorage.getItem('ea_volume');
  var savedMuted = localStorage.getItem('ea_muted');
  var initialVolume = savedVolume !== null ? parseFloat(savedVolume) : (CONFIG.musicVolume || 0.3);
  var musicMuted = savedMuted === 'true';

  if (CONFIG.musicUrl) {
    musicEl.src = CONFIG.musicUrl;
    musicEl.volume = initialVolume;
    setSliderVisual(initialVolume);
    if (musicMuted) {
      volumeBtn.textContent = '\u266A';
      volumeBtn.classList.add('muted');
    }
    musicReady = true;
  } else {
    volumeControl.style.display = 'none';
  }

  var logoGraphic = document.getElementById('logo-graphic');
  var logoGlow = document.getElementById('logo-glow');
  logoGraphic.src = CONFIG.logoUrl;
  logoGlow.src = CONFIG.logoUrl;

  document.getElementById('title-top').textContent = CONFIG.serverName;
  document.getElementById('title-bottom').textContent = CONFIG.serverName;
  document.getElementById('loader-prefix').textContent = CONFIG.loaderPrefix;

  var topNav = document.getElementById('top-nav');
  CONFIG.navItems.forEach(function (item) {
    var div = document.createElement('div');
    div.className = 'nav-item';
    div.textContent = item.label;
    div.dataset.key = item.key;
    topNav.appendChild(div);
  });

  var discordLink = document.getElementById('discord-link');
  if (CONFIG.discordUrl) {
    discordLink.href = CONFIG.discordUrl;
  } else {
    discordLink.style.display = 'none';
  }

  // 2. Load progress

  var entranceAnimDone = false;
  var latestLoadFraction = 0;

  var loaderPercent = document.getElementById('loader-percent');
  var loaderStatus = document.getElementById('loader-status');
  var realProgressBar = document.getElementById('real-progress-bar');

  var digitSlots = [];

  function createDigitSlot(type, initialChar) {
    var slot = document.createElement('span');
    slot.className = 'digit-slot';

    if (type === 'static') {
      var reel = document.createElement('span');
      reel.className = 'digit-reel';
      var span = document.createElement('span');
      span.textContent = initialChar;
      reel.appendChild(span);
      slot.appendChild(reel);
      return { el: slot, reel: reel, type: 'static', currentValue: initialChar };
    }

    var reel = document.createElement('span');
    reel.className = 'digit-reel';
    for (var d = 0; d < 10; d++) {
      var span = document.createElement('span');
      span.textContent = d;
      reel.appendChild(span);
    }
    slot.appendChild(reel);

    var idx = parseInt(initialChar, 10) || 0;
    gsap.set(reel, { y: -(idx * 1.2) + 'em' });

    return { el: slot, reel: reel, type: 'numeric', currentValue: idx };
  }

  function buildSlots() {
    loaderPercent.innerHTML = '';
    digitSlots.length = 0;

    var s0 = createDigitSlot('numeric', '0');
    var s1 = createDigitSlot('numeric', '0');
    var s2 = createDigitSlot('static', '%');

    digitSlots.push(s0, s1, s2);
    loaderPercent.appendChild(s0.el);
    loaderPercent.appendChild(s1.el);
    loaderPercent.appendChild(s2.el);
  }

  buildSlots();

  var lastRounded = 0;

  function updateLoaderDisplay(fraction) {
    var pct = Math.min(Math.max(fraction, 0), 1) * 100;
    var rounded = Math.round(pct);
    realProgressBar.style.width = pct + '%';

    if (rounded === lastRounded) return;
    lastRounded = rounded;

    if (rounded === 100 && digitSlots.length === 3) {
      loaderPercent.innerHTML = '';
      digitSlots.length = 0;

      var s0 = createDigitSlot('numeric', '1');
      var s1 = createDigitSlot('numeric', '0');
      var s2 = createDigitSlot('numeric', '0');
      var s3 = createDigitSlot('static', '%');

      digitSlots.push(s0, s1, s2, s3);
      loaderPercent.appendChild(s0.el);
      loaderPercent.appendChild(s1.el);
      loaderPercent.appendChild(s2.el);
      loaderPercent.appendChild(s3.el);
      return;
    }

    if (rounded >= 100) return;

    rollTo(digitSlots[0], Math.floor(rounded / 10), 0);
    rollTo(digitSlots[1], rounded % 10, 0.08);
  }

  function rollTo(slot, targetIdx, delay) {
    if (slot.type !== 'numeric' || slot.currentValue === targetIdx) return;
    slot.currentValue = targetIdx;

    gsap.to(slot.reel, {
      y: -(targetIdx * 1.2) + 'em',
      duration: 0.5,
      delay: delay,
      ease: 'back.out(1.4)',
      overwrite: true
    });
  }

  function updateStatusText(text) {
    if (loaderStatus) loaderStatus.textContent = text;
  }

  // 3. Entrance animation

  gsap.registerPlugin(SplitText);
  var splitTop = new SplitText('.top-half', { type: 'chars' });
  var splitBottom = new SplitText('.bottom-half', { type: 'chars' });

  gsap.set(splitTop.chars, { y: -40, opacity: 0 });
  gsap.set(splitBottom.chars, { y: 40, opacity: 0 });
  gsap.set('#brand-block', { autoAlpha: 1, xPercent: -50, yPercent: -50 });

  var tl = gsap.timeline();

  tl.fromTo('#logo-graphic',
    { opacity: 0, scale: 0.5 },
    { opacity: 1, scale: 2.8, duration: 2.2, ease: 'power2.inOut' }, 'start'
  )
    .fromTo('#logo-glow',
      { opacity: 0, scale: 1 },
      { opacity: 1, scale: 3.5, duration: 2.2, ease: 'power2.inOut' }, 'start'
    );

  tl.add('burst', '+=1');

  tl.to('#logo-graphic', {
    scale: 1, duration: 1.5, ease: 'expo.out'
  }, 'burst')
    .to('#logo-glow', {
      opacity: 0.3, scale: 1.5, duration: 1.5, ease: 'expo.out'
    }, 'burst')
    .to('#text-mask', {
      width: 'auto', marginLeft: 25,
      duration: 1.8, ease: 'expo.out'
    }, 'burst')
    .to(splitTop.chars, {
      y: 0, opacity: 1, duration: 1.0, stagger: 0.04, ease: 'back.out(1.2)'
    }, 'burst+=0.1')
    .to(splitBottom.chars, {
      y: 0, opacity: 1, duration: 1.0, stagger: 0.04, ease: 'back.out(1.2)'
    }, 'burst+=0.1');

  tl.call(function () { if (musicReady) tryPlayMusic(); }, null, 'burst+=2.6');
  tl.to('#tear-head', { opacity: 1, duration: 0.2 }, 'burst+=2.6');

  var zipper = { progress: 0 };
  tl.to(zipper, {
    progress: 115,
    duration: 1.8,
    ease: 'power2.inOut',
    onUpdate: function () {
      var x = zipper.progress;
      var tail = Math.max(0, x - 15);
      var gap = 4;

      document.getElementById('bg-top').style.clipPath =
        'polygon(0% 0%, 100% 0%, 100% 100%, ' + x + '% 100%, ' + tail + '% calc(100% - ' + gap + 'vh), 0% calc(100% - ' + gap + 'vh))';

      document.getElementById('bg-bottom').style.clipPath =
        'polygon(0% ' + gap + 'vh, ' + tail + '% ' + gap + 'vh, ' + x + '% 0%, 100% 0%, 100% 100%, 0% 100%)';

      document.getElementById('tear-head').style.left = Math.min(x, 100) + '%';

      if (x > 95) {
        document.getElementById('tear-head').style.opacity = Math.max(0, 1 - (x - 95) / 20);
      }
    }
  }, 'burst+=2.6');

  tl.add('open', 'burst+=4.2');

  tl.to('#bg-top', { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, 'open')
    .to('#bg-bottom', { yPercent: 100, duration: 1.2, ease: 'expo.inOut' }, 'open');

  if (carouselActive) {
    var cBri = carouselCfg.brightness != null ? carouselCfg.brightness : 0.92;
    var cCon = carouselCfg.contrast != null ? carouselCfg.contrast : 1.02;
    tl.to('.carousel-slide img', { filter: 'brightness(' + cBri + ') contrast(' + cCon + ')', duration: 1.5, ease: 'power2.out' }, 'open');
    tl.call(function () { carouselKB(0); }, null, 'open');
  } else {
    tl.to('.video-bg', { filter: 'brightness(0.7) contrast(1.1)', scale: 1, duration: 1.5, ease: 'power2.out' }, 'open');
  }

  tl.call(function () {
    var el = document.getElementById('brand-block');
    var rect = el.getBoundingClientRect();
    gsap.set(el, {
      transformOrigin: 'left top',
      top: rect.top,
      left: rect.left,
      xPercent: 0,
      yPercent: 0
    });
  }, null, 'open');

  tl.to('#brand-block', {
    top: 'clamp(16px, 3.7vh, 64px)', left: 'clamp(16px, 2.1vw, 64px)',
    scale: 0.55,
    duration: 1.2, ease: 'expo.inOut'
  }, 'open+=0.05')
    .to('.title-main', { textShadow: 'none', color: 'rgba(255, 255, 255, 0.9)', duration: 0.5 }, 'open+=0.4')
    .to('#logo-glow', { opacity: 0, duration: 0.5 }, 'open+=0.4');

  tl.fromTo('.nav-item',
    { opacity: 0, y: -10 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
    'open+=0.6'
  );

  if (CONFIG.discordUrl) {
    tl.fromTo('#discord-link',
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      'open+=0.9'
    );
  }

  if (musicReady) {
    tl.to('#volume-control', { opacity: 1, duration: 0.4 }, 'open+=0.8');
  }

  tl.to('#loader-container', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 'open+=1.0')
    .to('#real-progress', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 'open+=1.0')
    .to('#announce', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 'open+=1.2');

  if (carouselActive && carouselSlides.length > 1) {
    tl.to('#carousel-dots', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 'open+=1.0');
  }

  tl.call(function () {
    entranceAnimDone = true;
    updateLoaderDisplay(latestLoadFraction);
    if (carouselActive && carouselSlides.length > 1) {
      scheduleCarousel();
    }
  });

  // 4. Music control

  var musicStarted = false;

  function tryPlayMusic() {
    if (!musicReady || musicMuted || musicStarted) return;
    musicEl.play().then(function () {
      musicStarted = true;
    }).catch(function () {
      function resumeOnInteract() {
        if (musicStarted || musicMuted) return;
        musicEl.play().then(function () { musicStarted = true; }).catch(function () { });
        document.removeEventListener('click', resumeOnInteract);
        document.removeEventListener('keydown', resumeOnInteract);
        document.removeEventListener('pointerdown', resumeOnInteract);
      }
      document.addEventListener('click', resumeOnInteract, { once: true });
      document.addEventListener('keydown', resumeOnInteract, { once: true });
      document.addEventListener('pointerdown', resumeOnInteract, { once: true });
    });
  }

  function saveMusicPrefs() {
    localStorage.setItem('ea_volume', musicEl.volume);
    localStorage.setItem('ea_muted', musicMuted);
  }

  function setSliderVisual(vol) {
    var pct = Math.round(vol * 100) + '%';
    volumeFill.style.width = pct;
    volumeThumb.style.left = pct;
  }

  function applyVolume(vol) {
    vol = Math.min(1, Math.max(0, vol));
    musicEl.volume = vol;
    setSliderVisual(vol);
    if (vol === 0 && !musicMuted) {
      musicMuted = true;
      volumeBtn.textContent = '\u266A';
      volumeBtn.classList.add('muted');
    } else if (vol > 0 && musicMuted) {
      musicMuted = false;
      volumeBtn.textContent = '\u266B';
      volumeBtn.classList.remove('muted');
      musicEl.play().catch(function () { });
    }
    saveMusicPrefs();
  }

  volumeBtn.addEventListener('click', function () {
    musicMuted = !musicMuted;
    if (musicMuted) {
      musicEl.pause();
      volumeBtn.textContent = '\u266A';
      volumeBtn.classList.add('muted');
    } else {
      musicEl.play().then(function () { musicStarted = true; }).catch(function () { });
      volumeBtn.textContent = '\u266B';
      volumeBtn.classList.remove('muted');
    }
    saveMusicPrefs();
  });

  function volFromPointer(e) {
    var rect = volumeTrack.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  }

  volumeTrack.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    volumeThumb.classList.add('dragging');
    volumeControl.classList.add('active');
    volumeTrack.setPointerCapture(e.pointerId);
    applyVolume(volFromPointer(e));

    function onMove(ev) { applyVolume(volFromPointer(ev)); }
    function onUp() {
      volumeThumb.classList.remove('dragging');
      volumeTrack.removeEventListener('pointermove', onMove);
      volumeTrack.removeEventListener('pointerup', onUp);
      setTimeout(function () { volumeControl.classList.remove('active'); }, 300);
    }
    volumeTrack.addEventListener('pointermove', onMove);
    volumeTrack.addEventListener('pointerup', onUp);
  });

  // 5. FiveM load progress

  window.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.eventName) {
      case 'loadProgress':
        latestLoadFraction = data.loadFraction;
        if (entranceAnimDone) updateLoaderDisplay(latestLoadFraction);
        break;
      case 'startInitFunction':
        updateStatusText('Initializing core \u2026');
        break;
      case 'initFunctionInvoking':
        updateStatusText('Loading ' + (data.type || 'module') + ' \u2026');
        break;
      case 'startDataFileEntries':
        updateStatusText('Processing data files \u2026');
        break;
      case 'performMapLoadFunction':
        updateStatusText('Loading map \u2026');
        break;
      case 'endInitFunction':
        updateStatusText('Finishing up \u2026');
        break;
    }
  });

  if (!window.invokeNative && !window.nuiHandoverData) {
    var mockSteps = [
      { at: 0,     frac: 0,    status: 'Initializing core \u2026' },
      { at: 800,   frac: 0.05, status: 'Loading CORE module \u2026' },
      { at: 1800,  frac: 0.12, status: 'Loading MAP module \u2026' },
      { at: 3000,  frac: 0.25, status: 'Processing data files \u2026' },
      { at: 4500,  frac: 0.40, status: 'Loading VEHICLE module \u2026' },
      { at: 6000,  frac: 0.55, status: 'Loading WEAPON module \u2026' },
      { at: 7500,  frac: 0.70, status: 'Loading PLAYER module \u2026' },
      { at: 9000,  frac: 0.82, status: 'Loading map \u2026' },
      { at: 10500, frac: 0.91, status: 'Finishing up \u2026' },
      { at: 12000, frac: 1.0,  status: 'Complete' }
    ];
    mockSteps.forEach(function (step) {
      setTimeout(function () {
        window.postMessage({ eventName: 'loadProgress', loadFraction: step.frac }, '*');
        updateStatusText(step.status);
      }, step.at);
    });
  }

  // 6. Announcement ticker

  var announceBody = document.getElementById('announce-body');
  var announcements = CONFIG.announcements || [];
  var announceIdx = 0;
  var announceWidths = [];

  function createAnnounceEl(text) {
    var el = document.createElement('div');
    el.className = 'announce-item';
    el.textContent = text;
    return el;
  }

  if (announcements.length) {
    var measurer = document.createElement('div');
    measurer.style.cssText = 'position:fixed;visibility:hidden;white-space:nowrap;'
      + 'font-family:Geist,sans-serif;font-size:' + getComputedStyle(announceBody).fontSize;
    document.body.appendChild(measurer);
    announcements.forEach(function (item) {
      measurer.textContent = item.text;
      announceWidths.push(measurer.offsetWidth);
    });
    measurer.remove();

    announceBody.style.width = announceWidths[0] + 'px';

    var currentEl = createAnnounceEl(announcements[0].text);
    announceBody.appendChild(currentEl);

    if (announcements.length > 1) {
      setInterval(function () {
        announceIdx = (announceIdx + 1) % announcements.length;
        var newEl = createAnnounceEl(announcements[announceIdx].text);
        announceBody.appendChild(newEl);
        var outEl = currentEl;

        announceBody.style.width = announceWidths[announceIdx] + 'px';

        gsap.set(newEl, { yPercent: 100, opacity: 0 });
        gsap.to(outEl, {
          yPercent: -100, opacity: 0, duration: 0.4, ease: 'power2.inOut',
          onComplete: function () { outEl.remove(); }
        });
        gsap.to(newEl, {
          yPercent: 0, opacity: 1, duration: 0.4, ease: 'power2.inOut'
        });

        currentEl = newEl;
      }, CONFIG.announcementInterval || 5000);
    }
  }

  // 7. Panel renderers

  var panelRenderers = {
    about: function (cfg) {
      var stats = cfg.stats.map(function (s) {
        return '<div class="stat-item">'
          + '<div class="stat-value">' + s.value + '</div>'
          + '<div class="stat-label">' + s.label + '</div>'
          + '</div>';
      }).join('');
      return '<span class="panel-index">001 \u2014 ABOUT</span>'
        + '<h2 class="panel-title">' + cfg.title + '<br><span class="panel-title-thin">' + cfg.subtitle + '</span></h2>'
        + '<div class="panel-line"></div>'
        + '<p class="panel-desc">' + cfg.description + '</p>'
        + '<div class="stats-row">' + stats + '</div>';
    },

    news: function (items) {
      var list = items.map(function (n) {
        return '<div class="news-item">'
          + '<div class="news-date">' + n.date + '</div>'
          + '<div class="news-title">' + n.title + '</div>'
          + '<div class="news-summary">' + n.summary + '</div>'
          + '</div>';
      }).join('');
      return '<span class="panel-index">002 \u2014 NEWS</span>'
        + '<h2 class="panel-title">LATEST<br><span class="panel-title-thin">UPDATES</span></h2>'
        + '<div class="panel-line"></div>'
        + '<div class="news-list">' + list + '</div>';
    },

    gallery: function (items) {
      var grid = items.map(function (g) {
        return '<div class="gallery-item">'
          + '<img src="' + g.src + '" alt="' + g.alt + '" loading="lazy">'
          + '</div>';
      }).join('');
      return '<span class="panel-index">003 \u2014 GALLERY</span>'
        + '<h2 class="panel-title">CAPTURED<br><span class="panel-title-thin">MOMENTS</span></h2>'
        + '<div class="panel-line"></div>'
        + '<div class="gallery-grid">' + grid + '</div>';
    }
  };

  // 8. Navigation

  var overlay = document.getElementById('content-overlay');
  var panelContent = document.getElementById('panel-content');
  var closeBtn = document.getElementById('panel-close');
  var navItemEls = document.querySelectorAll('.nav-item');
  var activePanel = null;
  var panelTl = null;

  function getConfigData(key) {
    if (key === 'news') return CONFIG.news;
    if (key === 'gallery') return CONFIG.gallery;
    return CONFIG.about;
  }

  function openPanel(key) {
    if (activePanel === key) { closePanel(); return; }
    activePanel = key;

    panelContent.innerHTML = panelRenderers[key](getConfigData(key));

    navItemEls.forEach(function (el) {
      el.classList.toggle('active', el.dataset.key === key);
    });

    if (panelTl) panelTl.kill();
    overlay.scrollTop = 0;
    panelTl = gsap.timeline();
    panelTl
      .to(overlay, { autoAlpha: 1, duration: 0.45, ease: 'power2.out' })
      .to(closeBtn, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 0.2)
      .from(panelContent.children, {
        y: 25, opacity: 0, duration: 0.55,
        stagger: 0.07, ease: 'power2.out'
      }, 0.15);
  }

  function closePanel() {
    if (!activePanel) return;
    activePanel = null;
    navItemEls.forEach(function (el) { el.classList.remove('active'); });

    if (panelTl) panelTl.kill();
    panelTl = gsap.timeline();
    panelTl
      .to(closeBtn, { autoAlpha: 0, duration: 0.2 })
      .to(overlay, { autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.05);
  }

  navItemEls.forEach(function (el) {
    el.addEventListener('click', function () { openPanel(el.dataset.key); });
  });

  closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePanel();
  });

})();
