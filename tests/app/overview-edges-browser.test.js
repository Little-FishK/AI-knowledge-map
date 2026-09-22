'use strict';
// Read the controller-built public artifact, never Stage 2 source/state.
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { chromium } = require(require.resolve('playwright', { paths: [path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node')] }));

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } });
      await context.addInitScript(() => localStorage.setItem('ai-knowledge-map.onboarding.v1', JSON.stringify({ version: 1, read: 0, cursor: 0, skipped: true })));
      const page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto((process.argv[2] || 'http://127.0.0.1:5101/') + '?lang=zh-Hans#/map');
      await page.waitForFunction(() => window.__cy?.nodes().length === 130);
      assert(await page.evaluate(() => window.__cy.edges().not('.hidden').every(e => e.style('curve-style') === 'straight')), 'core overview stays straight');
      const coreIds = await page.evaluate(() => window.__cy.nodes().not('.hidden').map(n => n.id()));
      if (await page.locator('#controls-toggle').getAttribute('aria-expanded') === 'false') await page.locator('#controls-toggle').click();
      await page.locator('[data-scope="all"]').click();
      const geometry = await page.evaluate(core => {
        const cy = window.__cy, points = cy.nodes().map(n => n.position());
        const c = { x: (Math.min(...points.map(p => p.x)) + Math.max(...points.map(p => p.x))) / 2, y: (Math.min(...points.map(p => p.y)) + Math.max(...points.map(p => p.y))) / 2 };
        return cy.edges().map(e => {
          const a = e.source().position(), b = e.target().position();
          const controls = e.controlPoints();
          const cp = controls?.[0];
          const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          return { id: e.id(), core: core.includes(e.source().id()) && core.includes(e.target().id()), style: e.style('curve-style'), bend: e.data('overviewBend'), inward: cp ? (cp.x - m.x) * (c.x - m.x) + (cp.y - m.y) * (c.y - m.y) : null };
        });
      }, coreIds);
      assert(geometry.filter(e => e.style === 'unbundled-bezier').length > 30, 'outer edges curve');
      assert(geometry.filter(e => e.core).every(e => e.style === 'straight'), 'core-to-core stays straight in all view');
      assert(geometry.filter(e => e.style === 'unbundled-bezier').every(e => Number.isFinite(e.bend) && e.inward < 0), 'actual renderer bows outward, concave side faces center');
      const before = await page.evaluate(() => window.__cy.nodes().map(n => ({ ...n.position() })));
      await page.waitForTimeout(700);
      assert.deepEqual(await page.evaluate(() => window.__cy.nodes().map(n => ({ ...n.position() }))), before);
      fs.mkdirSync('.tmp/overview-edges-qa', { recursive: true });
      await page.screenshot({ path: `.tmp/overview-edges-qa/all-${width}.png` });
      // Layer 2 includes special local layouts and ordinary selected nodes.
      for (const id of ['neural-network', 'supervised-learning', 'llm']) {
        console.log(`${width}: selecting ${id}`);
        await page.evaluate(id => { window.__cy.getElementById(id).emit('tap'); }, id);
        await page.waitForTimeout(1100);
        assert(await page.evaluate(() => window.__cy.edges().every(e => e.style('curve-style') === 'straight')), 'selected layer uses original straight edges');
        assert(!await page.locator('#detail').evaluate(el => el.classList.contains('closed')));
        console.log(`${width}: closing ${id}`);
        await page.evaluate(() => { window.__cy.emit('tap'); });
        await page.waitForTimeout(900);
        assert(await page.evaluate(() => window.__cy.edges('.overview-curve').length > 30), 'closing detail restores curves');
      }
      await page.locator('#official-path-toggle').click();
      assert(await page.evaluate(() => window.__cy.edges('.overview-curve').length > 30), 'official learning path uses overview curves');
      await page.locator('#official-path-toggle').click();
      assert(await page.evaluate(() => window.__cy.edges('.overview-curve').length > 30));
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}px: core straight, ${geometry.filter(e => e.style === 'unbundled-bezier').length} outward curves, static nodes, layer isolation and restore.`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
