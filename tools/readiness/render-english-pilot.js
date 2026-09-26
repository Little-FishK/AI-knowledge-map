"use strict";
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const root = path.resolve(__dirname, "../.."), directory = path.join(root, ".tmp/website-preview");
const digest = value => "sha256:" + crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
// Presentation-only layout. Original SVG and every translated label stay intact.
// The three cramped captions are repeated as a responsive legend and hidden in
// the SVG by CSS. This does not mutate the controller's candidate or its hash.
function resourceLayout(html, { splitLegend = true } = {}) {
  html = englishDiagramLayout(html);
  html=html.replace(/<svg\b[^>]*viewBox=["']0 0 760 285["'][^>]*>[\s\S]*?(?=<\/figure>|<\/svg>|$)/g,(svg,offset,source)=>svg
    .replace(/<text\s+x=["']81["']\s+y=["']183["']/g,'<text x="90" y="183"')
    .replace(/<text\s+x=["']671["']\s+y=["'](171|192)["']/g,'<text x="646" y="$1"')+(source.slice(offset+svg.length).startsWith('</figure>')?'</svg>':''));
  html=html.replace(/<svg\b[^>]*viewBox="0 0 700 270"[^>]*>[\s\S]*?<\/svg>/g,svg=>svg.replace(/<text x="550" y="248" class="svg-tn">([^<]*)<\/text>/,(_m,label)=>`<text x="520" y="248" class="svg-tn">${label}</text>`));
  // Density caption in the clustering diagram: keep its original row and words,
  // using a readable smaller font within the existing right-hand column.
  html=html.replace(/<svg\b[^>]*viewBox="0 0 735 310"[^>]*>[\s\S]*?<\/svg>/g,svg=>svg.replace(/<text x="375" y="75" class="svg-t">([^<]*)<\/text>/,(_m,label)=>`<text x="375" y="75" class="svg-t" style="font-size:10px">${label}</text>`));
  // This feedback caption spans the full bottom row; English needs two lines.
  // Presentation only: retain every word and the controller's source/candidate hashes.
  html=html.replace(/<svg\b[^>]*viewBox="0 0 680 245"[^>]*>[\s\S]*?<\/svg>/g,svg=>svg.replace(/<text\b([^>]*\bx="433"[^>]*\by="210"[^>]*)>([^<]{90,})<\/text>/g,(original,attrs,label)=>{
    const lines=[];let line='';
    for(const word of label.split(' ')){if(line&&line.length+word.length+1>84){lines.push(line);line=word;}else line+=(line?' ':'')+word;}
    if(line)lines.push(line);
    if(lines.length>2)return original; // Unknown layout remains blocked by browser QA.
    return `<text ${attrs.replace(/\bx="433"/,'x="340"')}>${lines.map((text,i)=>`<tspan x="340" y="${210+i*14}">${text}${i<lines.length-1?' ':''}</tspan>`).join('')}</text>`;
  }));
  const withLegend = !splitLegend ? html : html.replace(/<svg\b[^>]*viewBox="0 0 560 96"[^>]*>[\s\S]*?<\/svg>/g, svg => {
    const labels = [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map(match => match[1]);
    if (labels.length !== 6) throw new Error("Data split diagram changed; review presentation mapping");
    return `${svg}<dl class="preview-split-legend" data-presentation-only="true">${labels.slice(0, 3).map((label, index) => `<div><dt>${label}</dt><dd>${labels[index + 3]}</dd></div>`).join("")}</dl>`;
  });
  return withLegend.replace(/<svg\b[\s\S]*?<\/svg>/g, svg => `<div class="preview-diagram-scroll" tabindex="0" role="region" aria-label="Scrollable diagram">${svg}</div><p class="preview-diagram-hint">Scroll horizontally to view the full diagram on small screens.</p>`);
}
// These coordinate mappings apply only to identified diagrams. Labels remain
// verbatim; layout changes never enter translation material or audit evidence.
function wrappedLabel(attrs, label, x, y, columns, size = 12) {
  const lines = []; let line = '';
  for (const word of label.split(' ')) {
    if (line && line.length + word.length + 1 > columns) { lines.push(line); line = word; }
    else line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  attrs = attrs.replace(/\s(?:x|y|style)="[^"]*"/g, '');
  return {lines: lines.length, html: `<text${attrs} x="${x}" y="${y}" style="font-size:${size}px">${lines.map((s,i)=>`<tspan x="${x}" y="${y+i*16}">${s}${i<lines.length-1?' ':''}</tspan>`).join('')}</text>`};
}
function englishDiagramLayout(html) {
  return html.replace(/<svg\b[\s\S]*?<\/svg>/g, svg => {
    if(/viewBox="0 0 560 110"/.test(svg)&&/id="j1"/.test(svg)&&svg.includes('x="495"'))return svg
      .replace('viewBox="0 0 560 110"','viewBox="0 0 924 180" style="min-width:924px"')
      .replace(/\b(x|x1|x2|width)="([\d.]+)"/g,(_m,attr,n)=>`${attr}="${Number(n)*1.65}"`);
    if(/viewBox="0 0 560 180"/.test(svg)&&svg.includes('Highest weight'))return svg
      .replace(/<text([^>]* x="330"[^>]* y="100"[^>]*)>([^<]*)<\/text>/g,(_m,attrs,label)=>wrappedLabel(attrs,label,20,167,75).html);
    if(/viewBox="0 0 560 200"/.test(svg)&&/id="d1"/.test(svg))return svg
      .replace(/<text([^>]* x="20"[^>]* y="(30|135)"[^>]*)>([^<]*)<\/text>/g,(_m,attrs,y,label)=>wrappedLabel(attrs,label,20,y==='30'?15:115,80).html)
      .replace(/<text([^>]* x="260"[^>]* y="95"[^>]*)>([^<]*)<\/text>/g,(_m,attrs,label)=>wrappedLabel(attrs,label,280,95,85).html);
    if(/viewBox="0 0 560 230"/.test(svg)&&svg.includes('No common words, but similar meaning'))return svg
      .replace('<text x="252" y="169"','<text x="252" y="160"')
      .replace(/<text([^>]* x="240"[^>]* y="205"[^>]*)>([^<]*)<\/text>/g,(_m,attrs,label)=>wrappedLabel(attrs+' text-anchor="middle"',label,280,205,70).html);
    if(/viewBox="0 0 735 300"/.test(svg)&&/id="cnna"/.test(svg))return svg
      .replace('x="285" y="70" width="86" height="62"','x="238" y="60" width="180" height="92"')
      .replace('M195,100 L270,100','M195,100 L230,100')
      .replace('M371,100 L440,100','M418,100 L440,100')
      .replace(/<text([^>]* x="328"[^>]* y="95"[^>]*)>([^<]*)<\/text>/g,(_m,attrs,label)=>wrappedLabel(attrs,label,328,83,22).html)
      .replace(/<text([^>]* x="328"[^>]* y="116"[^>]*)>([^<]*)<\/text>/g,(_m,attrs,label)=>wrappedLabel(attrs,label,328,122,22).html);
    if(/viewBox="0 0 730 265"/.test(svg)&&/id="rnna"/.test(svg))return svg
      .replace('viewBox="0 0 730 265"','viewBox="0 0 730 300"')
      .replace(/<text([^>]* x="252"[^>]* y="231"[^>]*)>([^<]*)<\/text>/g,(_m,attrs,label)=>wrappedLabel(attrs+' text-anchor="middle"',label,365,280,95).html);
    if (/viewBox="0 0 660 250"/.test(svg) && /M80 75 L240 165 Q330 215 420 165 L580 75/.test(svg)) {
      return svg.replace('viewBox="0 0 660 250"','viewBox="0 0 940 250" style="min-width:940px"')
        .replace(/<text([^>]* x="500"[^>]*)>([^<]*)<\/text>/g,(_m,attrs,label)=>wrappedLabel(attrs,label,650,Number(attrs.match(/y="(\d+)"/)[1]),36).html);
    }
    if (/viewBox="0 0 660 260"/.test(svg) && /<polyline points="105,55 /.test(svg)) {
      svg = svg.replace('viewBox="0 0 660 260"', 'viewBox="0 0 660 300"');
      return svg.replace(/<text([^>]* x="500"[^>]*)>([^<]*)<\/text>/g, (m,attrs,label)=>{
        const y = /y="132"/.test(attrs) ? 254 : 280;
        return wrappedLabel(attrs+' text-anchor="middle"',label,330,y,88).html;
      });
    }
    const rl = /viewBox="0 0 680 280"/.test(svg) && /id="rl1"/.test(svg);
    const ig = /viewBox="0 0 650 185"/.test(svg) && /id="ig1"/.test(svg);
    if (!rl && !ig) return svg;
    const scale=1.65, width=rl?1122:1072.5;
    svg=svg.replace(/viewBox="[^"]*"/,`viewBox="0 0 ${width} ${rl?330:225}" style="min-width:${width}px"`)
      .replace(/\b(x|width)="([\d.]+)"/g,(_m,a,n)=>`${a}="${Number(n)*scale}"`)
      .replace(/d="(M[\d., L]+)"/g,(_m,d)=>`d="${d.replace(/([ML])(\d+(?:\.\d+)?),/g,(_p,c,n)=>c+(Number(n)*scale)+',')}"`);
    // Reflow each node's consecutive labels within its enlarged box.
    svg=svg.replace(/(<rect\b[^>]*>)(\s*(?:<text\b[^>]*>[^<]*<\/text>\s*)+)/g,(_m,rect,labels)=>{
      const attr=n=>Number(rect.match(new RegExp(`\\b${n}="([^"]+)"`))[1]);
      const x=attr('x')+attr('width')/2, top=attr('y'); let y=top+18;
      const content=labels.replace(/<text([^>]*)>([^<]*)<\/text>/g,(_t,attrs,label)=>{
        const wrapped=wrappedLabel(attrs,label,x,y,Math.floor((attr('width')-20)/7.8));
        y+=wrapped.lines*16+3; return wrapped.html;
      });
      const height=Math.max(attr('height'),y-top+3);
      return rect.replace(/\bheight="[^"]*"/,`height="${height}"`)+content;
    });
    const captionY=rl?270:160;
    svg=svg.replace(new RegExp(`<text([^>]* y="${captionY}"[^>]*)>([^<]*)<\\/text>`,'g'),(_m,attrs,label)=>wrappedLabel(attrs,label,width/2,rl?290:180,110).html);
    return svg;
  });
}
function render(value, source) {
  const candidate = value?.candidate, payload = candidate?.payload;
  if (value?.publicationAllowed !== false || candidate?.schemaVersion !== 1 || !payload || digest(payload) !== candidate.artifactHash) throw new Error("Invalid MCP candidate integrity");
  if (payload.pageId !== "supervised-learning" || payload.snapshotId !== source.snapshotId || payload.sourceContentHash !== source.sourceContentHash
    || digest(source.page) !== source.sourceContentHash) throw new Error("Candidate source mismatch");
  const page = payload.page;
  const semanticReviewed = [4, 7, 8].every(number => value.gates?.some(gate => gate.number === number && gate.status === "pass"));
  if (typeof page?.title !== "string" || typeof page?.html !== "string") throw new Error("Missing candidate page");
  if (/<\s*(?:script|iframe|object|embed|base|meta|link|form)\b|\bon[a-z]+\s*=|(?:javascript|vbscript)\s*:/i.test(page.html)) throw new Error("Active candidate content refused");
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>${escape(page.title)} · Review draft</title>
<link rel="stylesheet" href="/assets/style.css"><link rel="stylesheet" href="/assets/concept-preview.css"></head>
<body class="concept-preview"><a class="preview-skip" href="#main-content">Skip to content</a>
<header class="preview-header"><a class="preview-brand" href="/?lang=en">◈ AI Knowledge Map</a><span class="preview-label">English · Review draft</span><a href="/preview/zh/concepts/supervised-learning/" lang="zh-Hans">简体中文</a></header>
<main id="main-content" class="preview-main" tabindex="-1"><article id="dd-article">
<p role="note">${semanticReviewed ? "Draft translation — final acceptance is pending." : "Draft translation — independent review is pending."}</p>
<header class="dd-hero"><div class="dd-eyebrow">Understanding the principles</div><h1 class="dd-h1">${escape(page.title)}</h1>
${page.subtitle ? `<p class="dd-sub">${escape(page.subtitle)}</p>` : ""}
${page.aliases ? `<p class="dd-ali">${escape(Array.isArray(page.aliases) ? page.aliases.join(" · ") : page.aliases)}</p>` : ""}
${page.meta ? `<p class="dd-metabar">${escape(page.meta)}</p>` : ""}
${page.thesis ? `<div class="dd-thesis"><span class="dd-thesis-l">Core idea</span> ${escape(page.thesis)}</div>` : ""}</header>
<!-- source-body:start -->${resourceLayout(page.html)}<!-- source-body:end -->
<nav class="preview-next" aria-label="Continue learning"><a href="/?lang=en&amp;node=supervised-learning">Explore the connections on the map</a><a href="/preview/zh/concepts/supervised-learning/" lang="zh-Hans">阅读中文原文</a></nav>
</article></main></body></html>`;
}
if (require.main === module) {
  // Both files are MCP-exported presentation copies; never read production Stage 2.
  const value = JSON.parse(fs.readFileSync(path.join(directory, "supervised-learning.english-candidate.json"), "utf8"));
  const source = JSON.parse(fs.readFileSync(path.join(directory, "supervised-learning.snapshot.json"), "utf8"));
  const html = render(value, source), output = path.join(directory, "pages/en/concepts/supervised-learning/index.html");
  fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, html);
  console.log(JSON.stringify({ output, artifactHash: value.candidate.artifactHash, publicationAllowed: false }, null, 2));
}
module.exports = { render, resourceLayout };
