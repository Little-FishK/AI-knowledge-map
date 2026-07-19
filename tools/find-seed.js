/* 布局种子搜索
 *
 * fcose 内部用 Math.random，没有 seed 选项，导致每次打开布局质量随机波动。
 * app.js 在布局期间把 Math.random 换成定种子 PRNG（见 withSeededRandom），
 * 本脚本就是用来挑那个种子的：把它粘进浏览器控制台跑一遍，
 * 把打印出来的最佳 seed 填进 data/graph.js 的 meta.layoutSeed。
 *
 * 评分 = 标签框重叠对数（主）+ 重叠面积（次）+ 长宽比偏离（末）。
 * 数据变动（增删节点/边）后需要重跑。
 */
(function findSeed(maxSeed = 60) {
  const cy = window.__cy;

  function seeded(seed, fn) {
    const orig = Math.random;
    let s = seed >>> 0;
    Math.random = function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    try { return fn(); } finally { Math.random = orig; }
  }

  function score() {
    const ns = cy.nodes().not(".hidden").toArray();
    const bb = ns.map(n => n.boundingBox({ includeLabels: true, includeNodes: true }));
    let pairs = 0, area = 0;
    for (let i = 0; i < bb.length; i++) {
      for (let j = i + 1; j < bb.length; j++) {
        const ox = Math.min(bb[i].x2, bb[j].x2) - Math.max(bb[i].x1, bb[j].x1);
        const oy = Math.min(bb[i].y2, bb[j].y2) - Math.max(bb[i].y1, bb[j].y1);
        if (ox > 0 && oy > 0) { pairs++; area += ox * oy; }
      }
    }
    const g = cy.nodes().not(".hidden").boundingBox();
    const ratio = Math.max(g.w, g.h) / Math.min(g.w, g.h);   // 越接近 1 越方正
    return { pairs, area: Math.round(area), ratio: +ratio.toFixed(2),
             total: pairs * 10000 + area / 100 + (ratio - 1) * 500 };
  }

  const results = [];
  for (let seed = 1; seed <= maxSeed; seed++) {
    seeded(seed, () => {
      cy.layout({
        name: "fcose", quality: "proof", animate: false, randomize: true,
        nodeDimensionsIncludeLabels: true, nodeSeparation: 130, idealEdgeLength: 150,
        nodeRepulsion: 22000, gravity: 0.1, numIter: 4000, padding: 40
      }).run();
    });
    results.push(Object.assign({ seed }, score()));
  }

  results.sort((a, b) => a.total - b.total);
  console.table(results.slice(0, 10));
  console.log("最佳 seed =", results[0].seed, results[0]);
  return results.slice(0, 10);
})();
