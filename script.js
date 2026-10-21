(() => {
  'use strict';

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = motionQuery.matches;
  const menuButton = document.querySelector('#menu-button');
  const nav = document.querySelector('#site-nav');
  const progressBar = document.querySelector('#progress-bar');
  const navLinks = [...document.querySelectorAll('.site-nav a')];

  function closeMenu() {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (nav.classList.contains('open') && event.target && !nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });

  function updateProgress() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const progress = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
    progressBar.style.transform = `scaleX(${progress / 100})`;
  }

  let progressFrame = 0;
  function scheduleProgress() {
    if (progressFrame) return;
    progressFrame = requestAnimationFrame(() => {
      progressFrame = 0;
      updateProgress();
    });
  }

  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress, { passive: true });
  updateProgress();

  const revealItems = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -35px' });
    document.documentElement.classList.add('motion-ready');
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const handleMotionPreferenceChange = (event) => {
    if (!event.matches) return;
    document.documentElement.classList.remove('motion-ready');
    revealItems.forEach((item) => item.classList.add('in-view'));
    document.querySelectorAll('.orbit-card, .magnetic').forEach((item) => { item.style.transform = ''; });
  };
  if (typeof motionQuery.addEventListener === 'function') motionQuery.addEventListener('change', handleMotionPreferenceChange);
  else motionQuery.addListener(handleMotionPreferenceChange);

  const sections = document.querySelectorAll('main > section[id]');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', isCurrent);
          if (isCurrent) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-37% 0px -54% 0px', threshold: 0 });
    sections.forEach((section) => navObserver.observe(section));
  }

  const numbers = document.querySelectorAll('[data-count]');
  function animateNumber(element) {
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    if (motionQuery.matches) {
      element.textContent = `${target}${suffix}`;
      return;
    }
    const start = performance.now();
    const duration = 900;
    const update = (now) => {
      if (motionQuery.matches) {
        element.textContent = `${target}${suffix}`;
        return;
      }
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const numberObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateNumber(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .7 });
    numbers.forEach((number) => numberObserver.observe(number));
  }

  if (!reducedMotion) {
    const sparkles = document.querySelector('#sparkles');
    const positions = [[15,20],[74,15],[83,55],[19,70],[52,11],[63,82]];
    positions.forEach(([left, top], index) => {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle';
      sparkle.textContent = index % 2 ? '·' : '✦';
      sparkle.style.left = `${left}%`;
      sparkle.style.top = `${top}%`;
      sparkle.style.animationDelay = `${index * -.48}s`;
      sparkles.appendChild(sparkle);
    });

    const orbitCard = document.querySelector('.orbit-card');
    let tiltFrame = 0;
    let pendingPointer = null;
    orbitCard.addEventListener('pointermove', (event) => {
      if (motionQuery.matches || event.pointerType === 'touch') return;
      pendingPointer = event;
      if (tiltFrame) return;
      tiltFrame = requestAnimationFrame(() => {
        tiltFrame = 0;
        if (!pendingPointer || motionQuery.matches) return;
        const rect = orbitCard.getBoundingClientRect();
        const x = (pendingPointer.clientX - rect.left) / rect.width - .5;
        const y = (pendingPointer.clientY - rect.top) / rect.height - .5;
        orbitCard.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 5}deg)`;
        pendingPointer = null;
      });
    });
    orbitCard.addEventListener('pointerleave', () => {
      pendingPointer = null;
      if (tiltFrame) cancelAnimationFrame(tiltFrame);
      tiltFrame = 0;
      orbitCard.style.transform = '';
    });

    document.querySelectorAll('.magnetic').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        if (motionQuery.matches || event.pointerType === 'touch') return;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * .12}px, ${y * .16}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }
})();
