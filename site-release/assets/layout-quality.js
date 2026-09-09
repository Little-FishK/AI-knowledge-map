/* Deterministic layout quality rules shared by the browser and Node validators.
 * The geometry model is slightly conservative so results do not depend on a
 * particular browser's font metrics. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LAYOUT_QUALITY = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const LABEL_MAX_WIDTH = 78;
  const LABEL_FONT_SIZE = 13;
  const LABEL_LINE_HEIGHT = 16;
  const LABEL_MARGIN = 5;
  const SAME_DOMAIN_GAP = 10;
  const CROSS_DOMAIN_GAP = 2;
  const MAX_OCCLUSION = 0.75;
  const EPSILON = 0.1;

  function diameter(node) {
    const heat = typeof node.heat === "number" ? node.heat : 0.5;
    return 30 + heat * 26;
  }

  function textWidth(text) {
    return Array.from(String(text || "")).reduce((width, char) => {
      if (/[\u3400-\u9fff\uf900-\ufaff]/.test(char)) return width + LABEL_FONT_SIZE;
      if (/[A-Z0-9]/.test(char)) return width + 8;
      if (/\s/.test(char)) return width + 4;
      return width + 7;
    }, 0);
  }

  function visualBox(node, position) {
    const d = diameter(node);
    const radius = d / 2;
    const rawTextWidth = Math.max(1, textWidth(node.title || node.label || node.id));
    const labelWidth = Math.min(LABEL_MAX_WIDTH, rawTextWidth);
    const labelLines = Math.max(1, Math.ceil(rawTextWidth / LABEL_MAX_WIDTH));
    const width = Math.max(d, labelWidth);
    return {
      x1: position.x - width / 2,
      x2: position.x + width / 2,
      y1: position.y - radius,
      y2: position.y + radius + LABEL_MARGIN + labelLines * LABEL_LINE_HEIGHT
    };
  }

  function overlap(a, b) {
    return {
      x: Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1),
      y: Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1)
    };
  }

  function circleIntersectionRatio(a, b, positions) {
    const pa = positions[a.id];
    const pb = positions[b.id];
    if (!pa || !pb) return 0;
    const ra = diameter(a) / 2;
    const rb = diameter(b) / 2;
    const distance = Math.hypot(pa.x - pb.x, pa.y - pb.y);
    if (distance >= ra + rb) return 0;
    if (distance <= Math.abs(ra - rb)) return 1;
    const x = (distance * distance + ra * ra - rb * rb) / (2 * distance);
    const y = Math.sqrt(Math.max(0, ra * ra - x * x));
    const area = ra * ra * Math.acos(x / ra)
      + rb * rb * Math.acos((distance - x) / rb)
      - distance * y;
    return area / (Math.PI * Math.min(ra, rb) ** 2);
  }

  function audit(nodes, positions) {
    const sameDomainOverlaps = [];
    const occlusionViolations = [];
    const circleOverlaps = [];
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (!positions[a.id]) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        if (!positions[b.id]) continue;
        if (a.domain === b.domain) {
          const amount = overlap(visualBox(a, positions[a.id]), visualBox(b, positions[b.id]));
          if (amount.x > EPSILON && amount.y > EPSILON) {
            sameDomainOverlaps.push({
              a: a.id,
              b: b.id,
              area: Math.round(amount.x * amount.y)
            });
          }
        }
        const ratio = circleIntersectionRatio(a, b, positions);
        if (ratio > 0) circleOverlaps.push({ a: a.id, b: b.id, ratio });
        if (ratio > MAX_OCCLUSION) occlusionViolations.push({ a: a.id, b: b.id, ratio });
      }
    }
    return { sameDomainOverlaps, occlusionViolations, circleOverlaps };
  }

  function tieDirection(a, b) {
    let hash = 2166136261;
    const key = a.id < b.id ? a.id + "|" + b.id : b.id + "|" + a.id;
    for (const char of key) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    const angle = (hash >>> 0) / 4294967296 * Math.PI * 2;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  }

  function movePair(a, b, positions, axis, distance) {
    const pa = positions[a.id];
    const pb = positions[b.id];
    let direction;
    if (axis === "x") {
      direction = { x: Math.sign(pb.x - pa.x), y: 0 };
    } else if (axis === "y") {
      direction = { x: 0, y: Math.sign(pb.y - pa.y) };
    } else {
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const length = Math.hypot(dx, dy);
      direction = length > 0.001 ? { x: dx / length, y: dy / length } : tieDirection(a, b);
    }
    if (!direction.x && !direction.y) direction = tieDirection(a, b);
    const half = distance / 2;
    pa.x -= direction.x * half;
    pa.y -= direction.y * half;
    pb.x += direction.x * half;
    pb.y += direction.y * half;
  }

  function resolve(nodes, inputPositions, options) {
    const settings = Object.assign({
      sameDomainGap: SAME_DOMAIN_GAP,
      crossDomainGap: CROSS_DOMAIN_GAP,
      maxPasses: 240
    }, options || {});
    const positions = {};
    nodes.forEach(node => {
      const p = inputPositions[node.id];
      if (p) positions[node.id] = { x: Number(p.x), y: Number(p.y) };
    });

    let passes = 0;
    for (; passes < settings.maxPasses; passes++) {
      let changed = false;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!positions[a.id]) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          if (!positions[b.id]) continue;

          if (a.domain === b.domain) {
            const amount = overlap(visualBox(a, positions[a.id]), visualBox(b, positions[b.id]));
            if (amount.x > EPSILON && amount.y > EPSILON) {
              const axis = amount.x <= amount.y ? "x" : "y";
              const distance = (axis === "x" ? amount.x : amount.y) + settings.sameDomainGap;
              movePair(a, b, positions, axis, distance);
              changed = true;
              continue;
            }
          }

          if (circleIntersectionRatio(a, b, positions) > MAX_OCCLUSION) {
            const pa = positions[a.id];
            const pb = positions[b.id];
            const currentDistance = Math.hypot(pb.x - pa.x, pb.y - pa.y);
            const minimumDistance = diameter(a) / 2 + diameter(b) / 2 + settings.crossDomainGap;
            movePair(a, b, positions, "radial", minimumDistance - currentDistance);
            changed = true;
          }
        }
      }
      if (!changed) break;
    }

    return { positions, passes, report: audit(nodes, positions) };
  }

  return {
    audit,
    resolve,
    visualBox,
    diameter,
    constants: {
      sameDomainGap: SAME_DOMAIN_GAP,
      crossDomainGap: CROSS_DOMAIN_GAP,
      maxOcclusion: MAX_OCCLUSION
    }
  };
});
