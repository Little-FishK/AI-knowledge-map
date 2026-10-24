"use strict";
const fs = require('node:fs');
const path = require('node:path');
function read(root) {
  const file = path.join(root, 'config/analytics.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}
function apply(html, config, siteUrl, preview = false) {
  html = html.replace(/<(?:link|script)\b[^>]*\bdata-site-analytics(?:\s|=|>)[^>]*>(?:<\/script>)?\s*/g, '');
  if (preview || !config?.enabled) return html;
  const url = new URL(siteUrl);
  if (!/^G-[A-Z0-9]+$/.test(config.measurementId) || !/^[a-z0-9.-]+$/.test(config.siteHost) || url.hostname !== config.siteHost) throw Error('Invalid analytics configuration');
  const base = url.pathname;
  const tags = `<link rel="stylesheet" href="${base}assets/site-analytics.css" data-site-analytics="true">\n<script defer src="${base}assets/site-analytics.js" data-site-analytics="true" data-measurement-id="${config.measurementId}" data-site-host="${config.siteHost}"></script>\n`;
  if (!html.includes('</head>')) throw Error('Analytics requires a document head');
  return html.replace('</head>', tags + '</head>');
}
module.exports = {read, apply};
