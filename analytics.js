/* MA&TÊ: basic consent mode. The Google tag loads only after an explicit opt-in. */
(() => {
  'use strict';
  const id = 'G-844PNMS582';
  const key = 'maite.analytics-consent.v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const allowedPages = new Set(['inicio', 'catalogo', 'inspiracoes', 'sobre', 'atendimento', 'pedidos', 'favoritos', 'produto']);
  const allowedPaths = new Set(['/', '/politicas/', '/colecoes/iluminacao/', '/colecoes/vasos-e-ceramicas/', '/colecoes/quadros-e-galerias/', '/colecoes/mesa-posta-e-recepcao/', '/404.html']);
  let choice = null, loaded = false, lastLocation = '', banner, preferenceButton;
  const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  function savedChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved && ['accepted', 'rejected'].includes(saved.choice) && Number.isFinite(saved.time) && saved.time <= Date.now() && Date.now() - saved.time < lifetime) return saved.choice;
    } catch { /* Consent remains unset if browser storage is blocked. */ }
    return null;
  }
  function safeLocation() {
    const url = new URL(location.origin + (allowedPaths.has(location.pathname) ? location.pathname : '/404.html'));
    if (url.pathname === '/') {
      const params = new URLSearchParams(location.search), page = params.get('pagina');
      if (page && allowedPages.has(page)) url.searchParams.set('pagina', page);
      const item = params.get('item') || '';
      if (page === 'produto' && /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(item)) url.searchParams.set('item', item);
    }
    return url.href;
  }
  function safeReferrer() { try { return document.referrer ? new URL(document.referrer).origin + '/' : ''; } catch { return ''; } }
  function pageView() {
    if (choice !== 'accepted' || !loaded) return;
    const current = safeLocation();
    if (current === lastLocation) return;
    window.gtag('event', 'page_view', { send_to: id, page_location: current, page_title: document.title, page_referrer: lastLocation || safeReferrer() });
    lastLocation = current;
  }
  function start() {
    window['ga-disable-' + id] = false;
    if (!loaded) {
      loaded = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', denied);
      window.gtag('consent', 'update', { ...denied, analytics_storage: 'granted' });
      window.gtag('js', new Date());
      window.gtag('config', id, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, ads_data_redaction: true, url_passthrough: false, page_location: safeLocation(), page_referrer: safeReferrer() });
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
      script.id = 'maite-google-analytics';
      document.head.append(script);
    } else window.gtag('consent', 'update', { ...denied, analytics_storage: 'granted' });
    pageView();
  }
  function removeAnalyticsCookies() {
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      for (const domain of ['', '; domain=' + location.hostname, '; domain=.' + location.hostname]) document.cookie = name + '=; Max-Age=0; path=/' + domain;
    });
  }
  function choose(value) {
    choice = value;
    try { localStorage.setItem(key, JSON.stringify({ choice, time: Date.now() })); } catch { /* Keep the choice for the current page. */ }
    banner.hidden = true;
    preferenceButton.setAttribute('aria-expanded', 'false');
    if (value === 'accepted') start();
    else {
      window['ga-disable-' + id] = true;
      if (loaded) window.gtag('consent', 'update', denied);
      lastLocation = '';
      removeAnalyticsCookies();
    }
    preferenceButton.focus({ preventScroll: true });
  }
  function init() {
    const style = document.createElement('style');
    style.textContent = '#maite-consent{position:fixed;z-index:35;bottom:18px;left:18px;width:min(560px,calc(100% - 36px));box-sizing:border-box;padding:22px;background:#f7f4ed;color:#302a24;border:1px solid #c9bfad;box-shadow:0 8px 40px #302a2426;font:14px/1.65 Arial,sans-serif}#maite-consent[hidden]{display:none}#maite-consent h2{font:400 24px/1.25 Georgia,serif;margin:0 0 10px}#maite-consent p{margin:8px 0 15px;color:#5d564d;font-size:13px}#maite-consent a{color:#80442e;text-decoration:underline;text-underline-offset:3px}#maite-consent .maite-consent-actions{display:flex;gap:12px;flex-wrap:wrap}#maite-consent button{flex:1;min-width:150px;min-height:44px;padding:11px 16px;background:#f7f4ed;border:1px solid #4f5c42;color:#35412b;font:600 12px/1.4 Arial,sans-serif;cursor:pointer}#maite-consent button:hover{background:#e7e9df}#maite-privacy{position:fixed;bottom:12px;left:12px;z-index:34;background:#f7f4ed;color:#4f5545;border:1px solid #c9bfad;min-height:40px;padding:8px 12px;font:11px/1.5 Arial,sans-serif;cursor:pointer}#maite-consent :focus-visible,#maite-privacy:focus-visible{outline:3px solid #a5533c;outline-offset:3px}@media(max-width:580px){#maite-consent{bottom:10px;left:10px;width:calc(100% - 20px);padding:19px}#maite-consent h2{font-size:22px}#maite-consent p{font-size:12px}#maite-consent .maite-consent-actions{gap:9px}#maite-consent button{min-width:120px;font-size:11px}}';
    document.head.append(style);
    banner = document.createElement('section');
    banner.id = 'maite-consent';
    banner.setAttribute('aria-label', 'Preferências de privacidade');
    banner.innerHTML = '<h2>Sua privacidade, sua escolha.</h2><p>Com sua autorização, usamos o Google Analytics para entender as visitas e melhorar o site. A análise é opcional. Sacola e favoritos continuam funcionando se você recusar. <a href="/politicas/#privacidade">Saiba mais sobre seus dados.</a></p><div class="maite-consent-actions"><button type="button" data-choice="accepted">Aceitar análise</button><button type="button" data-choice="rejected">Recusar análise</button></div>';
    banner.querySelectorAll('button').forEach(button => button.addEventListener('click', () => choose(button.dataset.choice)));
    preferenceButton = document.createElement('button');
    preferenceButton.id = 'maite-privacy'; preferenceButton.type = 'button';
    preferenceButton.textContent = 'Preferências de privacidade';
    preferenceButton.setAttribute('aria-controls', banner.id);
    preferenceButton.setAttribute('aria-expanded', 'false');
    preferenceButton.addEventListener('click', () => { banner.hidden = !banner.hidden; preferenceButton.setAttribute('aria-expanded', String(!banner.hidden)); if (!banner.hidden) banner.querySelector('button').focus(); });
    choice = savedChoice(); banner.hidden = choice !== null;
    preferenceButton.setAttribute('aria-expanded', String(!banner.hidden));
    document.body.append(preferenceButton, banner);
    window.addEventListener('maite:pageview', pageView);
    if (choice === 'accepted') start();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
