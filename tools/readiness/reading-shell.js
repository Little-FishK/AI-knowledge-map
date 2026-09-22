'use strict';
// Reuse the map's actual markup so reading pages track its toolbar/settings.
function apply(html, home, base, meta = {}) {
  if (!html.includes('class="preview-header"')) return html;
  const toolbar = home.match(/<header id="topbar">[\s\S]*?<\/header>/)?.[0];
  const settings = home.match(/<div id="settings-overlay"[\s\S]*?<\/section>\s*<\/div>\s*<\/section>\s*<\/div>/)?.[0];
  if (!toolbar) return html; // Generic artifact fixtures may not have a map shell.
  if (!settings) throw Error('Shared map settings missing');
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let shared = toolbar.replace('id="topbar"', `id="topbar" data-reading-shell data-base="${base}"`);
  if (html.includes('id="dd-article"')) {
    shared = shared.replace(/<button\b[^>]*\bid="(?:btn-reset|btn-onboarding)"[^>]*>[\s\S]*?<\/button>/g, '');
  }
  shared = shared.replace(/<h1([^>]*id="brand-name"[^>]*)>([\s\S]*?)<\/h1>/, '<span$1>$2</span>');
  shared = shared.replace('id="meta-ver"></span>', `id="meta-ver">${esc(meta.version)} · ${esc(meta.updatedAt)}</span>`);
  shared = shared.replace('</header>', `<a class="release-directory-link" data-shell-about href="${base}about/">关于与纠错</a><a class="release-directory-link" data-shell-search href="${base}search/">文字目录 / Search</a></header>`);
  html = html.replace(/<header class="preview-header">[\s\S]*?<\/header>/, shared);
  html = html.replace('</body>', settings + '</body>');
  const scripts = ['data/locales/manifest.js','data/locales/zh-Hans/ui.js','data/locales/en/ui.js','assets/app/i18n.js','assets/shared-settings.js','assets/reading-shell.js'];
  if (!html.includes('assets/progress-ui.js')) scripts.push('assets/vendor/supabase-2.115.0.min.js','assets/progress-model.js','assets/progress-supabase.js','assets/progress-runtime.js','assets/progress-ui.js');
  return html.replace('</head>', `<link rel="stylesheet" href="${base}assets/progress.css"><link rel="stylesheet" href="${base}assets/onboarding.css">` + scripts.map(src => `<script defer src="${base}${src}"></script>`).join('') + '</head>');
}
module.exports = {apply};
