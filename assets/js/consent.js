/* The cookie choice for qumin.com. No Google tag is on any page: this file loads them, and only after the visitor presses
   Accept, so nothing reaches Google before a yes, not even a cookieless ping. It loads with defer and the bar is fixed to
   the screen, so it blocks no paint and moves no layout. The landing page form carries the choice to /api/inbound, which
   sends a lead to Google Ads only with a yes. The form's own conversion calls do nothing while the tags are absent. */
(function () {
  var KEY = 'qumin-cookies';
  var SIX_MONTHS = 15552000000;
  var TAG_MANAGER = 'GTM-WSFMBF7';
  var ADS = 'AW-958023660';
  var ANALYTICS = 'G-NC3M359HWM';
  var TYPES = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'];
  var EASE = 'cubic-bezier(.35,1,.45,1)';
  var bar = null;
  var tagsLoaded = false;

  function saved() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      return c && (c.choice === 'granted' || c.choice === 'denied') && Date.now() - c.at < SIX_MONTHS ? c.choice : null;
    } catch (e) { return null; }
  }

  function remember(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, at: Date.now() })); } catch (e) {}
  }

  function consentState(value) {
    var state = {};
    TYPES.forEach(function (t) { state[t] = t === 'ad_personalization' ? 'denied' : value; });
    return state;
  }

  function addScript(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  function loadGoogle() {
    if (tagsLoaded) return;
    tagsLoaded = true;
    var dl = window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dl.push(arguments); };
    // The consent signal goes first in the queue, ahead of anything the form put there, and before any tag loads.
    window.gtag('consent', 'default', consentState('granted'));
    dl.unshift(dl.pop());
    dl.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    addScript('https://www.googletagmanager.com/gtm.js?id=' + TAG_MANAGER);
    // The landing pages also carry the Google Ads tag and a direct line to analytics for the lead event.
    if (document.getElementById('lp-form')) {
      addScript('https://www.googletagmanager.com/gtag/js?id=' + ADS);
      window.gtag('js', new Date());
      window.gtag('config', ADS);
      window.gtag('config', ANALYTICS, { send_page_view: false });
    }
  }

  // Without a yes no Google cookie stays: this also takes back what the site set before it asked.
  function clearGoogleCookies() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl)/.test(name)) return;
      ['', ';domain=qumin.com', ';domain=.qumin.com'].forEach(function (d) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + d;
      });
    });
  }

  function stampForm(value) {
    var form = document.getElementById('lp-form');
    if (!form) return;
    var field = form.querySelector('input[name="ad_consent"]');
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = 'ad_consent';
      form.appendChild(field);
    }
    field.value = value;
  }

  function choose(choice) {
    remember(choice);
    stampForm(choice);
    hide();
    if (choice === 'granted') { loadGoogle(); return; }
    clearGoogleCookies();
    // Tags already running on this page are told no, then the page reloads without them, so nothing more can leave.
    if (tagsLoaded) {
      window.gtag('consent', 'update', consentState('denied'));
      window.setTimeout(function () { clearGoogleCookies(); location.reload(); }, 120);
    }
  }

  function addStyles() {
    if (document.getElementById('qc-style')) return;
    var s = document.createElement('style');
    s.id = 'qc-style';
    s.textContent =
      '.qc-bar{position:fixed;left:50%;bottom:20px;z-index:2147483000;box-sizing:border-box;width:min(760px,calc(100vw - 32px));display:flex;align-items:center;gap:24px;padding:16px 16px 16px 24px;background:#0f0f0f;color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:16px;box-shadow:0 10px 34px rgba(0,0,0,.28);font-family:"operetta-32","operetta-fallback","operetta-fallback-android",serif;font-size:15px;line-height:1.45;opacity:0;transform:translate(-50%,12px);transition:opacity 420ms ' + EASE + ',transform 420ms ' + EASE + '}' +
      '.qc-bar.is-in{opacity:1;transform:translate(-50%,0)}' +
      '.qc-text{margin:0;flex:1 1 auto}' +
      '.qc-text a{color:#fff;text-decoration:underline}' +
      '.qc-actions{display:flex;gap:10px;flex:0 0 auto}' +
      '.qc-btn{min-width:104px;min-height:46px;padding:0 22px;background:#fff;color:#111;border:none;border-radius:999px;font:inherit;font-weight:600;cursor:pointer}' +
      '.qc-btn:hover{background:#f0f0f0}' +
      '.qc-btn:focus-visible,.qc-text a:focus-visible{outline:2px solid #fff;outline-offset:3px}' +
      '.qc-settings{padding:0;background:none;border:none;color:inherit;font:inherit;text-decoration:inherit;cursor:pointer}' +
      '.qc-settings:focus-visible{outline:2px solid currentColor;outline-offset:3px}' +
      '@media (max-width:640px){.qc-bar{bottom:12px;flex-direction:column;align-items:stretch;gap:14px;padding:16px}.qc-actions{width:100%}.qc-btn{flex:1 1 0;min-height:48px;min-width:0}}' +
      '@media (prefers-reduced-motion:reduce){.qc-bar{transition:none}}';
    document.head.appendChild(s);
  }

  function show() {
    if (bar) return;
    addStyles();
    bar = document.createElement('div');
    bar.className = 'qc-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie choice');
    bar.innerHTML =
      '<p class="qc-text">We&rsquo;d like to use Google cookies to measure this site and our ads. See our <a href="/privacy/">Privacy &amp; Cookie Policy</a>.</p>' +
      '<div class="qc-actions"><button type="button" class="qc-btn" data-choice="granted">Accept</button><button type="button" class="qc-btn" data-choice="denied">Reject</button></div>';
    bar.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-choice]') : null;
      if (b) choose(b.getAttribute('data-choice'));
    });
    document.body.appendChild(bar);
    // joins the page's own fade: the site's white overlay clears first
    window.setTimeout(function () {
      requestAnimationFrame(function () { if (bar) bar.classList.add('is-in'); });
    }, 340);
  }

  function hide() {
    if (!bar) return;
    var gone = bar;
    bar = null;
    gone.classList.remove('is-in');
    window.setTimeout(function () { if (gone.parentNode) gone.parentNode.removeChild(gone); }, 440);
  }

  // Changing your mind is as easy as the first choice: one button beside Privacy in every footer.
  function addSettingsLink() {
    var links = document.querySelectorAll('footer a[href*="/privacy"]');
    var privacy = links[links.length - 1];
    if (!privacy) return;
    addStyles();
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'qc-settings';
    b.textContent = 'Cookie settings';
    b.style.color = getComputedStyle(privacy).color;
    b.addEventListener('click', show);
    privacy.parentNode.insertBefore(document.createTextNode('   '), privacy.nextSibling);
    privacy.parentNode.insertBefore(b, privacy.nextSibling.nextSibling);
  }

  var choice = saved();
  stampForm(choice || 'unset');
  addSettingsLink();
  if (choice === 'granted') loadGoogle();
  else clearGoogleCookies();
  if (!choice) show();
})();
