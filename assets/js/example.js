(function(){
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

      new window.Typed(`#${target.id}`, {
          strings: [phrase],
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
  const getFade = document.querySelectorAll('.fade-section');
  if(getFade){
    function setupScrollFades() {
      const sections = document.querySelectorAll('.fade-section');
      if (!sections.length) return;

      let lastScrollY = window.scrollY;

      // --- AUTO-STAGGER ADJACENT ITEMS ---
      let groupIndex = 0;
      sections.forEach((current, i) => {
        const prev = sections[i - 1];

        if (prev && prev.nextElementSibling === current) {
          groupIndex++;
        } else {
          groupIndex = 0;
        }

        current.style.transitionDelay = `${groupIndex * 120}ms`;
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target;
            const isScrollingUp = window.scrollY < lastScrollY;

            const fullyAboveViewport = entry.boundingClientRect.bottom <= 0;
            const fullyBelowViewport = entry.boundingClientRect.top >= window.innerHeight;

            // -----------------------------
            // ENTERING viewport
            // -----------------------------
            if (entry.isIntersecting) {
              // DOWN — normal animation
              if (!el.classList.contains("has-animated")) {
                el.classList.add("is-visible");
                el.classList.add("has-animated");
              }

              // UP — special animation class
              if (isScrollingUp) {
                el.classList.add("scrolling-up");
              } else {
                el.classList.remove("scrolling-up");
              }

              return;
            }

            // -----------------------------
            // LEAVING viewport
            // -----------------------------
            // Only hide when COMPLETELY out of view
            if (fullyAboveViewport || fullyBelowViewport) {
              el.classList.remove("is-visible");
              el.classList.remove("scrolling-up");
            }

            // Only reset animation lock when fully above + scrolling up
            if (isScrollingUp && fullyAboveViewport) {
              el.classList.remove("has-animated");
            }
          });

          lastScrollY = window.scrollY;
        },
        {
          threshold: 0.2,
          rootMargin: "0px 0px -10% 0px"
        }
      );

      sections.forEach(sec => observer.observe(sec));
    }

    setupScrollFades();
  }

})();
