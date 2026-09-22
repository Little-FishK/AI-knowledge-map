'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../../assets/release-navigation.js'), 'utf8');
for (const root of ['https://example.com/', 'https://example.com/AI-knowledge-map/']) {
  for (const suffix of ['', '?v=0123456789abcdef']) {
    for (const locale of ['zh-Hans', 'en']) {
      let redirected, listener;
      const links = [];
      const location = {hash: '#/concept/sample', search: '?lang=' + locale, replace: url => { redirected = String(url); }};
      const context = {
        URL, URLSearchParams, location,
        document: {addEventListener:()=>{},currentScript: {src: root + 'assets/release-navigation.js' + suffix}, createElement: () => ({}), querySelector: () => null, getElementById: () => ({append: link => links.push(link)})},
        window: {AI_STATIC_CONCEPTS: {sample: {'zh-Hans': 'zh/concepts/sample/', en: 'en/concepts/sample/'}}, addEventListener: (event, fn) => { listener = fn; }}
      };
      vm.runInNewContext(source, context);
      assert.equal(redirected, root + (locale === 'en' ? 'en' : 'zh') + '/concepts/sample/');
      assert.equal(String(links[0].href), root + 'search/');
      redirected = undefined;
      location.hash = '#/map/sample'; listener();
      assert.equal(redirected, undefined, 'node positioning must not redirect');
      location.hash = '#/concept/missing'; listener();
      assert.equal(redirected, undefined, 'unpublished pages must not redirect');
      location.hash = '#/concept/sample'; listener();
      assert.equal(redirected, root + (locale === 'en' ? 'en' : 'zh') + '/concepts/sample/');
    }
  }
}
for(const scenario of [
  {search:'',saved:'en',expected:'en'},
  {search:'?lang=zh-Hans',saved:'en',expected:'zh'},
  {search:'?lang=en',saved:'zh-Hans',expected:'en'},
  {search:'',saved:'zh-Hans',active:'en',expected:'en'},
  {search:'?lang=zh-Hans',saved:'zh-Hans',active:'en',expected:'en'},
  {search:'?lang=en',saved:'en',active:'zh-Hans',expected:'zh'},
  {search:'',storageThrows:true,expected:'zh'},
]){
 let redirected,listener,active=scenario.active;
 const location={hash:'',search:scenario.search,replace:url=>redirected=String(url)};
 const context={URL,URLSearchParams,location,
  document:{addEventListener:()=>{},currentScript:{src:'https://example.com/assets/release-navigation.js'},createElement:()=>({}),querySelector:()=>true},
  window:{__i18n:{getLocale:()=>active},localStorage:{getItem:()=>{if(scenario.storageThrows)throw Error('storage blocked');return scenario.saved;}},AI_STATIC_CONCEPTS:{sample:{en:'en/concepts/sample/','zh-Hans':'zh/concepts/sample/'}},addEventListener:(_,fn)=>listener=fn}};
 vm.runInNewContext(source,context);
 location.hash='#/concept/sample';listener();
 assert.equal(redirected,'https://example.com/'+scenario.expected+'/concepts/sample/',JSON.stringify(scenario));
 active='en';listener();assert.equal(redirected,'https://example.com/en/concepts/sample/');
 active='zh-Hans';listener();assert.equal(redirected,'https://example.com/zh/concepts/sample/');
}
console.log('PASS: current/saved locale, explicit initial URL, language switching, blocked storage, root/subpath and unpublished fallback');
{
 let click,assigned,prevented=false,stopped=false;
 const context={URL,URLSearchParams,location:{hash:'',search:'',assign:url=>assigned=String(url)},document:{currentScript:{src:'https://example.com/assets/release-navigation.js'},createElement:()=>({}),querySelector:()=>true,addEventListener:(name,fn,capture)=>{assert.equal(name,'click');assert.equal(capture,true);click=fn;}},window:{__i18n:{getLocale:()=> 'en'},AI_STATIC_CONCEPTS:{sample:{en:'en/concepts/sample/'}},addEventListener:()=>{}}};
 vm.runInNewContext(source,context);
 const event=id=>({button:0,target:{closest:()=>({getAttribute:()=>id})},preventDefault:()=>prevented=true,stopImmediatePropagation:()=>stopped=true});
 click(event('sample'));assert.equal(assigned,'https://example.com/en/concepts/sample/');assert(prevented&&stopped);
 assigned=undefined;prevented=stopped=false;click(event('missing'));assert.equal(assigned,undefined);assert(!prevented&&!stopped);
 click({...event('sample'),ctrlKey:true});assert.equal(assigned,undefined);
 console.log('PASS direct published-button navigation before legacy handlers and unpublished/modified-click fallback');
}
