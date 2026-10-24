/* Basic consent: no Google request until the visitor chooses analytics. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else if (root.document) api.init(root);
})(typeof window === 'object' ? window : this, function () {
  'use strict';
  const consentKey = 'akm.analytics-consent.v1';
  const retention = 90 * 24 * 60 * 60 * 1000;
  const routes = new Set(['lang', 'node', 'concept', 'item', 'tutorial', 'lesson']);
  const campaigns = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  function safeUrl(raw, base, referrer) {
    if (!raw) return '';
    try {
      const url = new URL(raw, base), own = new URL(base);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '';
      if (referrer && url.hostname.replace(/^www\./, '') !== own.hostname.replace(/^www\./, '')) return url.origin + '/';
      const clean = new URL(url.origin + url.pathname);
      for (const [key, value] of url.searchParams) {
        if (routes.has(key) && /^[a-zA-Z0-9_-]{1,100}$/.test(value)) clean.searchParams.set(key, value);
        if (campaigns.includes(key) && /^[a-zA-Z0-9_. -]{1,100}$/.test(value)) clean.searchParams.set(key, value);
      }
      return clean.href;
    } catch (_) { return ''; }
  }
  function routeKey(raw) {
    const url = new URL(raw);
    for (const key of campaigns) url.searchParams.delete(key);
    url.searchParams.sort();
    return url.href;
  }
  function init(win) {
    const doc = win.document, script = doc.querySelector('script[data-site-analytics][data-measurement-id]');
    if (!script || doc.getElementById('analytics-privacy')) return;
    const id = script.dataset.measurementId, host = script.dataset.siteHost;
    if (!/^G-[A-Z0-9]+$/.test(id) || win.location.protocol !== 'https:' || ![host, 'www.' + host].includes(win.location.hostname)) return;
    const initial = new URL(safeUrl(win.location.href, win.location.href));
    let referrer = safeUrl(doc.referrer || '', initial.href, true);
    const protectedChoice = win.navigator.globalPrivacyControl === true || win.navigator.doNotTrack === '1' || win.doNotTrack === '1';
    let active = false, loaded = false, last = '', timer, consent = null;
    const english = () => doc.documentElement.lang.startsWith('en') || new URL(win.location.href).searchParams.get('lang') === 'en';
    const state = value => { doc.documentElement.dataset.analyticsState = value; };
    const tag = function () { win.dataLayer.push(arguments); };
    const denied = {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'};
    function currentUrl() {
      const url = new URL(safeUrl(win.location.href, initial.href));
      // Preserve the landing campaign if the application normalizes its URL before consent.
      if (!loaded) for (const key of campaigns) if (!url.searchParams.has(key) && initial.searchParams.has(key)) url.searchParams.set(key, initial.searchParams.get(key));
      return url.href;
    }
    function pageView() {
      if (!active) return;
      const location = currentUrl(), key = routeKey(location);
      if (key === last) return;
      last = key;
      const title = (doc.querySelector('meta[property="og:title"]')?.content || doc.title || 'AI Knowledge Map').replace(/\S+@\S+/g, '[redacted]').slice(0, 200);
      tag('set', {page_location: location, page_referrer: referrer, page_title: title});
      tag('event', 'page_view', {send_to: id, page_location: location, page_referrer: referrer, page_title: title});
      referrer = location;
    }
    function start() {
      if (active || protectedChoice) return;
      active = true; win['ga-disable-' + id] = false;
      if (!loaded) {
        win.dataLayer = win.dataLayer || [];
        // gtag needs the current page globals set to sanitized values before initialization.
        tag('consent', 'default', denied);
        tag('consent', 'update', Object.assign({}, denied, {analytics_storage: 'granted'}));
        tag('js', new Date());
        tag('config', id, {send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: retention / 1000, cookie_flags: 'SameSite=Lax;Secure', page_location: currentUrl(), page_referrer: referrer});
        pageView();
        loaded = true;
        const provider = doc.createElement('script');
        provider.async = true; provider.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
        provider.setAttribute('data-analytics-provider', 'true');
        provider.onerror = () => state('blocked');
        doc.head.appendChild(provider);
      } else { tag('consent', 'update', Object.assign({}, denied, {analytics_storage: 'granted'})); last = ''; pageView(); }
      state('active');
    }
    function stop() {
      active = false; win['ga-disable-' + id] = true;
      if (loaded) tag('consent', 'update', denied);
      for (const pair of doc.cookie.split(';')) {
        const name = pair.trim().split('=')[0];
        if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of ['', win.location.hostname, host, '.' + host]) doc.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax; Secure' + (domain ? '; Domain=' + domain : '');
      }
      state('off');
    }
    try {
      const saved = JSON.parse(win.localStorage.getItem(consentKey));
      if (saved && ['granted', 'denied'].includes(saved.value) && Date.now() - saved.at < retention && saved.at <= Date.now()) consent = saved.value;
    } catch (_) { /* Storage may be unavailable; the choice still works for this page. */ }
    const panel = doc.createElement('section'); panel.id = 'analytics-privacy'; panel.setAttribute('aria-label', 'Analytics privacy / 统计隐私');
    const toggle = doc.createElement('button'); toggle.id = 'analytics-privacy-toggle'; toggle.type = 'button'; toggle.setAttribute('aria-controls', panel.id); toggle.textContent = 'Analytics privacy / 统计隐私';
    function render() {
      const en = english();
      panel.replaceChildren();
      const text = doc.createElement('p'), title = doc.createElement('strong'); title.textContent = en ? 'Help improve AI Knowledge Map' : '帮助改进 AI 知识地图'; text.appendChild(title);
      text.appendChild(doc.createTextNode(protectedChoice ? (en ? 'Your browser asks not to be tracked. Analytics is off.' : '你的浏览器已要求不跟踪，访问统计已关闭。') : (en ? 'With your permission, Google Analytics uses first-party cookies to measure page views, returning visits, time in focus and referral channels. We exclude account details and search text. You can change your choice here anytime.' : '经你允许后，Google Analytics 使用第一方 Cookie 统计浏览量、回访、前台停留时间和推广来源。我们排除账号信息和搜索文本；你随时可以在此更改选择。')));
      panel.appendChild(text);
      const actions = doc.createElement('div'); actions.className = 'analytics-actions';
      function button(label, handler, allow) { const b = doc.createElement('button'); b.type = 'button'; b.textContent = label; if (allow) b.setAttribute('data-allow', 'true'); b.addEventListener('click', handler); actions.appendChild(b); }
      function choose(value) {
        consent = value;
        try { win.localStorage.setItem(consentKey, JSON.stringify({value, at: Date.now()})); } catch (_) { /* Optional storage. */ }
        if (value === 'granted') start(); else stop();
        panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.focus();
      }
      if (!protectedChoice) button(en ? 'Allow analytics' : '允许统计', () => choose('granted'), true);
      button(protectedChoice ? (en ? 'Close' : '关闭') : (en ? 'Decline / turn off' : '拒绝 / 关闭统计'), () => choose('denied'));
      panel.appendChild(actions);
    }
    toggle.addEventListener('click', () => { render(); panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); });
    doc.body.appendChild(toggle); doc.body.appendChild(panel); render(); panel.hidden = consent !== null || protectedChoice; toggle.setAttribute('aria-expanded', String(!panel.hidden));
    state('off'); if (consent === 'granted' && !protectedChoice) start();
    const schedule = () => { win.clearTimeout(timer); timer = win.setTimeout(pageView, 0); };
    for (const method of ['pushState', 'replaceState']) {
      const original = win.history[method];
      win.history[method] = function () { const result = original.apply(this, arguments); schedule(); return result; };
    }
    win.addEventListener('popstate', schedule); win.addEventListener('hashchange', schedule);
    win.addEventListener('storage', event => {
      if (event.key !== consentKey) return;
      try { const saved = JSON.parse(event.newValue); if (saved?.value === 'granted' && Date.now() - saved.at < retention) start(); else stop(); } catch (_) { stop(); }
    });
  }
  return {safeUrl, routeKey, init};
});
