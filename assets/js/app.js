(function(){
  // Full page transition
  (function setupPageFadeTransitions(){

    // Keep it snappy so it doesn't fight with your viewport animations
    const DURATION = 320;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'page-fade-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: #fff;
      pointer-events: none;
      opacity: 1;
      transition: opacity ${DURATION}ms ease;
      z-index: 2147483647;
    `;
    document.documentElement.appendChild(overlay);

    // Fade IN = reveal page (white -> transparent)
    function fadeIn() {
      // Ensure browser paints opacity:1 first
      requestAnimationFrame(() => {
        overlay.style.opacity = '0';
      });
    }

    // Fade OUT = hide page (transparent -> white), returns a Promise
    function fadeOut() {
      return new Promise((resolve) => {

        const done = () => {
          overlay.removeEventListener('transitionend', onEnd);
          resolve();
        };

        const onEnd = (e) => {
          if (e.propertyName === 'opacity') done();
        };

        overlay.addEventListener('transitionend', onEnd);

        // Trigger the fade
        requestAnimationFrame(() => {
          overlay.style.opacity = '1';
        });

        // Safety timeout
        setTimeout(done, DURATION + 80);
      });
    }

    // On first load, fade in from white
    // Use DOMContentLoaded so your other scripts can still set up normally
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fadeIn, { once: true });
    } else {
      fadeIn();
    }

    // Handle bfcache restores (Safari/Firefox back/forward cache)
    window.addEventListener('pageshow', (e) => {
      // Whether it's persisted or not, ensure we reveal the page
      // (some browsers keep the overlay state)
      overlay.style.transition = `opacity ${DURATION}ms ease`;
      fadeIn();
    });

    // Intercept same-origin navigations
    document.addEventListener('click', async (e) => {
      const a = e.target.closest('a');
      if (!a) return;

      // Ignore modified clicks / new tab / downloads / external / hashes-only
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;

      const href = a.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

      // Allow pure hash changes on same page without full transition
      const url = new URL(a.href, window.location.href);
      const samePageHashOnly =
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash &&
        url.hash !== window.location.hash;

      if (samePageHashOnly) return;

      // Only same-origin full navigations
      if (url.origin !== window.location.origin) return;

      e.preventDefault();

      // Fade to white, then navigate
      await fadeOut();
      window.location.href = url.toString();
    }, true);
  })();

  // Mobile Menu
  const nav = document.querySelector('nav');
  if(nav){
    const btn = document.querySelector('.menu-toggle');
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      nav.setAttribute('aria-expanded', String(!expanded));
    });
  }

  // Footer Clocks
  const getClocks = document.querySelector('.offices-grid');
  if(getClocks){

    const clocks = [
      { id: 'london', tz: 'Europe/London' },
      { id: 'dubai', tz: 'Asia/Dubai' },
      { id: 'shanghai', tz: 'Asia/Shanghai' }
    ];

    function makeTicks(id) {
      const group = document.getElementById('ticks-' + id);
      group.innerHTML = '';
      for (let i=0;i<12;i++){
        const angle = i * 30;
        const x1 = 50 + Math.sin(angle*Math.PI/180) * 34;
        const y1 = 50 - Math.cos(angle*Math.PI/180) * 34;
        const x2 = 50 + Math.sin(angle*Math.PI/180) * 30;
        const y2 = 50 - Math.cos(angle*Math.PI/180) * 30;
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('class','tick');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        group.appendChild(line);
      }
    }

    clocks.forEach(c => makeTicks(c.id));

    function getTimePartsForZone(timeZone) {
      const fmt = new Intl.DateTimeFormat('en-GB', {
        hour:'2-digit', minute:'2-digit', second:'2-digit',
        hour12:false, timeZone
      });
      const parts = fmt.formatToParts(new Date());
      let h=0, m=0, s=0;
      for (const p of parts) {
        if (p.type === 'hour') h = +p.value;
        if (p.type === 'minute') m = +p.value;
        if (p.type === 'second') s = +p.value;
      }
      return {hour:h, minute:m, second:s};
    }

    function updateClocks() {
      clocks.forEach(c => {
        const {hour, minute, second} = getTimePartsForZone(c.tz);
        const hourAngle = ((hour % 12) + minute/60 + second/3600) * 30;
        const minuteAngle = (minute + second/60) * 6;

        document.getElementById('hour-' + c.id).setAttribute('transform', `rotate(${hourAngle} 50 50)`);
        document.getElementById('minute-' + c.id).setAttribute('transform', `rotate(${minuteAngle} 50 50)`);

        const card = document.getElementById('card-' + c.id);
        const inOffice = hour >= 8 && hour < 17;
        card.classList.toggle('dim', !inOffice);
      });
    }
  
    updateClocks();
    setInterval(updateClocks, 60000); // minute accuracy now (no seconds hand)
  }

  // Hero Parallax
  const getHero = document.querySelector('.hero--home');
  if(getHero){
    // Parallax scrolling effect for the hero section
    window.addEventListener('scroll', () => {
      // Get the current scroll position
      const scrollPosition = window.scrollY;
      // Set a speed for the Parallax effect (0.5 means half the scroll speed)
      const parallaxSpeed = 0.2;
      const hero = document.querySelector('.hero--home');

      // Move the background image position based on scroll speed
      //hero.style.backgroundPositionY = `${scrollPosition *- parallaxSpeed}px`;
      hero.style.backgroundPosition = `center calc(50% + ${scrollPosition * -parallaxSpeed}px)`;
    });
  }

  // Typewriter Effect
  const getType = document.getElementById('hero-typewriter');
  if(getType) {
    function setupHeroTypewriter() {
      if (typeof window.Typed === 'undefined') return;
      const target = document.getElementById('hero-typewriter');
      if (!target) return;

      const phrase = target.dataset.typedText || target.textContent.trim();

      let phraseStrings;

      if(phrase === 'homepage'){
        phraseStrings = [
          "We open the world to China",
          "We've opened the world to China"
        ];
      } else {
        phraseStrings = [phrase];
      }

      new window.Typed(`#${target.id}`, {
          strings: phraseStrings,
          typeSpeed: 60,
          backSpeed: 30,
          backDelay: 3000,
          loop: true,
          smartBackspace: true,
          showCursor: true
      });
    }
    setupHeroTypewriter();
  }

  // Scroll Fading
  const getFade = document.querySelectorAll(".fade-section");
  if (getFade && getFade.length) {
    function setupScrollFades() {
      const sections = Array.from(document.querySelectorAll(".fade-section"));
      if (!sections.length) return;

      let lastScrollY = window.scrollY;

      // --------------------------------------------
      // AUTO-STAGGER ADJACENT ITEMS (your original)
      // --------------------------------------------
      let groupIndex = 0;
      sections.forEach((current, i) => {
        const prev = sections[i - 1];

        if (prev && prev.nextElementSibling === current) {
          groupIndex++;
        } else {
          groupIndex = 0;
        }

        current.style.transitionDelay = `${groupIndex * 320}ms`;
      });

      // --------------------------------------------
      // On initial page load: if multiple items are
      // already in viewport, stagger them by DOM order
      // (without requiring scroll)
      // --------------------------------------------
      const BASE_LOAD_STAGGER_MS = 320;

      function getIsInViewport(el, extraPx = 0) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const vw = window.innerWidth || document.documentElement.clientWidth;

        // Basic “in viewport” check with optional padding
        return (
          r.bottom >= 0 - extraPx &&
          r.right >= 0 &&
          r.top <= vh + extraPx &&
          r.left <= vw
        );
      }

      function staggerVisibleOnLoad() {
        // Find all currently visible fade-sections (DOM order)
        const visible = sections.filter((el) => getIsInViewport(el, 0));
        if (!visible.length) return;

        visible.forEach((el, idx) => {
          // override delay for initial-load reveal only
          el.style.transitionDelay = `${idx * BASE_LOAD_STAGGER_MS}ms`;

          // reveal them immediately, but staggered
          if (!el.classList.contains("has-animated")) {
            el.classList.add("is-visible");
            el.classList.add("has-animated");
          }
        });

        // After initial run, restore each element’s “adjacent group” delay
        // so scrolling behaviour remains consistent.
        // (small buffer to allow the stagger to complete)
        const restoreAfter = visible.length * BASE_LOAD_STAGGER_MS + 50;
        window.setTimeout(() => {
          // Re-apply your original adjacent grouping delays
          let gi = 0;
          sections.forEach((current, i) => {
            const prev = sections[i - 1];
            if (prev && prev.nextElementSibling === current) gi++;
            else gi = 0;
            current.style.transitionDelay = `${gi * 320}ms`;
          });
        }, restoreAfter);
      }

      // Run after layout is settled (images/fonts can shift things)
      // 1) ASAP
      requestAnimationFrame(staggerVisibleOnLoad);
      // 2) again on full load to catch late layout shifts
      window.addEventListener("load", staggerVisibleOnLoad, { once: true });

      // --------------------------------------------
      // IntersectionObserver (UPDATED STAGGER ON REVEAL)
      // --------------------------------------------

      const REVEAL_STAGGER_MS = 320;

      const observer = new IntersectionObserver(
        (entries) => {
          const isScrollingUp = window.scrollY < lastScrollY;

          // collect newly-intersecting entries that are not yet animated
          const entering = entries
            .filter((e) => e.isIntersecting && !e.target.classList.contains("has-animated"))
            .map((e) => e.target);

          // If multiple enter at once, stagger by DOM order
          if (entering.length) {
            // DOM order sort
            entering.sort((a, b) => {
              if (a === b) return 0;
              return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
                ? -1
                : 1;
            });

            entering.forEach((el, idx) => {
              // Capture any existing delay so we can restore it
              const baseDelay = el.dataset.baseDelay || el.style.transitionDelay || "0ms";
              el.dataset.baseDelay = baseDelay;

              // Apply per-batch stagger delay
              el.style.transitionDelay = `${idx * REVEAL_STAGGER_MS}ms`;

              el.classList.add("is-visible");
              el.classList.add("has-animated");

              if (isScrollingUp) el.classList.add("scrolling-up");
              else el.classList.remove("scrolling-up");

              // Restore original delay after this batch fires
              const restoreAfter = idx * REVEAL_STAGGER_MS + REVEAL_STAGGER_MS;
              window.setTimeout(() => {
                el.style.transitionDelay = baseDelay;
              }, restoreAfter);
            });
          }

          // Handle everything else (including elements that are already animated)
          entries.forEach((entry) => {
            const el = entry.target;

            const fullyAboveViewport = entry.boundingClientRect.bottom <= 0;
            const fullyBelowViewport = entry.boundingClientRect.top >= window.innerHeight;

            if (entry.isIntersecting) {
              // keep scrolling-up class accurate even after first reveal
              if (isScrollingUp) el.classList.add("scrolling-up");
              else el.classList.remove("scrolling-up");
              return;
            }

            // LEAVING viewport: only hide when fully out of view
            if (fullyAboveViewport || fullyBelowViewport) {
              el.classList.remove("is-visible");
              el.classList.remove("scrolling-up");
            }

            // reset lock only when fully above AND scrolling up
            if (isScrollingUp && fullyAboveViewport) {
              el.classList.remove("has-animated");
            }
          });

          lastScrollY = window.scrollY;
        },
        {
          threshold: 0.2,
          rootMargin: "0px 0px 0px 0px",
        }
      );

      // Observe all fade sections
      sections.forEach((sec) => observer.observe(sec));

      // If your footer is NOT also a .fade-section but you still want it
      // to trigger via the same logic, observe it too.
      const footer = document.querySelector(".site-footer");
      if (footer && !footer.classList.contains("fade-section")) {
        // Ensure the footer has the classes the logic expects
        footer.classList.add("fade-section");
        observer.observe(footer);
      }

      // Extra reliability: if you're at/near the bottom already (short pages),
      // force the footer visible.
      function ensureFooterVisibleIfNearBottom() {
        const footerEl = document.querySelector(".site-footer");
        if (!footerEl) return;

        const scrollBottom =
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 4;

        if (scrollBottom) {
          footerEl.classList.add("is-visible");
          footerEl.classList.add("has-animated");
        }
      }

      requestAnimationFrame(ensureFooterVisibleIfNearBottom);
      window.addEventListener("load", ensureFooterVisibleIfNearBottom, {
        once: true,
      });
      window.addEventListener("resize", ensureFooterVisibleIfNearBottom);
    }

    setupScrollFades();
  }

})();
