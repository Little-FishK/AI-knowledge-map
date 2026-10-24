'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {safeUrl, routeKey, init} = require('../../assets/site-analytics');
const injection = require('../../tools/readiness/analytics');
const config = require('../../config/analytics.json');
function fixture(options = {}) {
  const elements = [], tasks = new Map(), listeners = {}, store = new Map();
  let sequence = 0;
  class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.dataset = {}; this.attributes = {}; this.listeners = {}; this.hidden = false; elements.push(this); }
    appendChild(child) { this.children.push(child); return child; }
    setAttribute(k, v) { this.attributes[k] = v; }
    addEventListener(k, f) { this.listeners[k] = f; }
    replaceChildren() { this.children = []; }
    focus() {}
  }
  const script = new Element('script'); script.dataset = {measurementId: config.measurementId, siteHost: config.siteHost};
  const doc = {documentElement: {lang: 'en', dataset: {}}, title: 'AI Knowledge Map', referrer: 'https://reddit.com/r/test/?private=secret', cookie: '',
    head: new Element('head'), body: new Element('body'), createElement: t => new Element(t), createTextNode: t => ({textContent: t}),
    querySelector: s => s.startsWith('script') ? script : null, getElementById: id => elements.find(e => e.id === id)};
  const win = {document: doc, location: new URL(options.url || 'https://ai-knowledge-map.com/?lang=en&utm_source=reddit&utm_medium=social&utm_campaign=learning&email=private'), navigator: {globalPrivacyControl: !!options.gpc, doNotTrack: options.dnt || '0'},
    localStorage: {getItem: k => store.get(k) || null, setItem: (k, v) => store.set(k, v)},
    history: {}, addEventListener: (k, f) => { listeners[k] = f; }, clearTimeout: k => tasks.delete(k), setTimeout: f => { tasks.set(++sequence, f); return sequence; }};
  for (const k of ['pushState', 'replaceState']) win.history[k] = function (_state, _title, url) { win.location = new URL(url, win.location.href); return 42; };
  if (options.saved) store.set('akm.analytics-consent.v1', JSON.stringify(options.saved));
  init(win);
  const flush = () => { for (const [k, f] of tasks) { tasks.delete(k); f(); } };
  const choose = label => { const panel = doc.getElementById('analytics-privacy'); const action = panel.children[1].children.find(b => b.textContent.startsWith(label)); assert(action, label); action.listeners.click(); };
  const events = () => (win.dataLayer || []).filter(a => a[0] === 'event' && a[1] === 'page_view').map(a => a[2]);
  return {win, doc, elements, choose, events, flush, listeners, store};
}
test('URL allowlist removes private query values, fragments and external referrer paths', () => {
  const clean = safeUrl('https://ai-knowledge-map.com/?lang=en&node=rag&token=secret&q=email%40example.com&utm_source=reddit&utm_content=email%40example.com#private', 'https://ai-knowledge-map.com/');
  assert.equal(clean, 'https://ai-knowledge-map.com/?lang=en&node=rag&utm_source=reddit');
  assert.equal(safeUrl('https://reddit.com/r/anything/?token=secret', clean, true), 'https://reddit.com/');
  assert.equal(safeUrl('', clean, true), '');
  assert.equal(safeUrl('https://user:password@example.com/', clean), '');
  assert.equal(routeKey(clean), routeKey('https://ai-knowledge-map.com/?node=rag&lang=en'));
});
test('no provider or events before consent, declined visitors remain untracked', () => {
  const f = fixture(); assert.equal(f.doc.head.children.length, 0); assert.equal(f.events().length, 0);
  f.choose('Decline'); f.win.history.pushState(null, '', '?node=rag'); f.flush();
  assert.equal(f.doc.head.children.length, 0); assert.equal(f.events().length, 0); assert.equal(f.doc.documentElement.dataset.analyticsState, 'off');
});
test('consent preserves campaign through router normalization; SPA navigation counts once; revoke stops events', () => {
  const f = fixture(); f.win.history.replaceState(null, '', '?lang=en'); f.flush(); f.choose('Allow');
  assert.equal(f.doc.head.children.length, 1); assert.match(f.doc.head.children[0].src, /gtag\/js\?id=G-RTDE80YXPH$/);
  assert.equal(f.events().length, 1); assert.match(f.events()[0].page_location, /utm_source=reddit/); assert(!f.events()[0].page_location.includes('email'));
  assert.equal(f.events()[0].page_referrer, 'https://reddit.com/');
  f.win.history.replaceState(null, '', '?lang=en'); f.listeners.hashchange(); f.flush(); assert.equal(f.events().length, 1);
  assert.equal(f.win.history.pushState(null, '', '?lang=en&node=rag'), 42); f.listeners.hashchange(); f.flush(); assert.equal(f.events().length, 2);
  f.win.location = new URL('https://ai-knowledge-map.com/?lang=en'); f.listeners.popstate(); f.flush(); assert.equal(f.events().length, 3);
  f.choose('Decline'); f.win.history.pushState(null, '', '?node=agent'); f.flush(); assert.equal(f.events().length, 3); assert.equal(f.win['ga-disable-' + config.measurementId], true);
});
test('DNT, GPC, previews and expired consent cannot silently start analytics', () => {
  for (const options of [{gpc: true}, {dnt: '1'}, {url: 'http://localhost:8080/'}, {url: 'https://preview.pages.dev/'}]) {
    const f = fixture({...options, saved: {value: 'granted', at: Date.now()}}); assert.equal(f.doc.head.children.length, 0); assert.equal(f.events().length, 0);
  }
  const expired = fixture({saved: {value: 'granted', at: Date.now() - 91 * 86400000}}); assert.equal(expired.doc.head.children.length, 0); assert.equal(expired.doc.getElementById('analytics-privacy').hidden, false);
  const allowed = fixture({saved: {value: 'granted', at: Date.now()}}); assert.equal(allowed.events().length, 1);
});
test('production injection is idempotent and preview removes provider wiring', () => {
  const html = '<html><head><title>Fixture</title></head><body>Unchanged content</body></html>';
  const once = injection.apply(html, config, 'https://ai-knowledge-map.com/');
  assert.equal(injection.apply(once, config, 'https://ai-knowledge-map.com/'), once);
  assert.equal((once.match(/data-site-analytics=/g) || []).length, 2);
  assert.equal(injection.apply(once, config, 'https://ai-knowledge-map.com/', true), html);
  assert.equal(injection.apply(html, null, 'https://example.com/'), html);
  assert.throws(() => injection.apply(html, {...config, measurementId: 'invalid'}, 'https://ai-knowledge-map.com/'));
});
