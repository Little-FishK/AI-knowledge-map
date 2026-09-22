'use strict';
const crypto=require('node:crypto');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=value=>String(value??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const brand=locale=>locale==='en'?'AI Knowledge Map':'AI 知识地图';
function metadata({siteUrl,path,title,description,locale='zh-Hans',kind='WebPage',indexable=true,alternates=[],breadcrumbs=[]}) {
  const url=new URL(path,siteUrl);
  if(url.protocol!=='https:'||url.origin!==new URL(siteUrl).origin||url.search||url.hash)throw Error('Invalid canonical URL');
  if(!['zh-Hans','en'].includes(locale))throw Error('Unsupported metadata language');
  const name=plain(title),summary=plain(description);
  if(!name||!summary)throw Error('Missing page title or description');
  return {path,canonical:url.href,title:name,description:summary,locale,kind,indexable,alternates,breadcrumbs};
}
function head(meta,siteUrl,preview=false) {
  const image=new URL('assets/social/site-card.png',siteUrl).href;
  const schemas=[];
  if(meta.indexable){
    const schema={'@context':'https://schema.org','@type':meta.kind,'@id':meta.canonical+'#page',name:meta.title,description:meta.description,url:meta.canonical,inLanguage:meta.locale};
    if(meta.kind==='LearningResource')Object.assign(schema,{learningResourceType:'Concept explanation',isAccessibleForFree:true});
    schemas.push(schema);
    if(meta.path==='')schemas.push({'@context':'https://schema.org','@type':'WebSite','@id':siteUrl+'#website',url:siteUrl,name:'AI 知识地图',alternateName:'AI Knowledge Map',inLanguage:['zh-Hans','en']});
    else schema.isPartOf={'@id':siteUrl+'#website'};
    if(meta.breadcrumbs.length)schemas.push({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:meta.breadcrumbs.map((crumb,index)=>({'@type':'ListItem',position:index+1,name:crumb.name,item:crumb.url}))});
  }
  // Concept search titles are already complete, locale-specific search phrases.
  // Other site pages retain the compact site-name suffix.
  const documentTitle=meta.kind==='LearningResource'?meta.title:`${meta.title} · ${brand(meta.locale)}`;
  return `<title>${esc(documentTitle)}</title>\n<meta name="description" content="${esc(meta.description)}">\n<meta name="robots" content="${preview||!meta.indexable?'noindex, nofollow':'index, follow'}">\n`+
    (meta.indexable?`<link rel="canonical" href="${esc(meta.canonical)}">\n`+meta.alternates.map(a=>`<link rel="alternate" hreflang="${esc(a.locale)}" href="${esc(a.url)}">`).join('\n')+`\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="${brand(meta.locale)}">\n<meta property="og:title" content="${esc(meta.title)}">\n<meta property="og:description" content="${esc(meta.description)}">\n<meta property="og:url" content="${esc(meta.canonical)}">\n<meta property="og:locale" content="${meta.locale==='en'?'en_US':'zh_CN'}">\n<meta property="og:image" content="${esc(image)}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="AI 知识地图 / AI Knowledge Map">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${esc(meta.title)}">\n<meta name="twitter:description" content="${esc(meta.description)}">\n<meta name="twitter:image" content="${esc(image)}">\n<meta name="twitter:image:alt" content="AI 知识地图 / AI Knowledge Map">\n`:'')+
    (schemas.length?`<script type="application/ld+json">${JSON.stringify(schemas).replace(/</g,'\\u003c')}</script>\n`:'');
}
function apply(html,meta,siteUrl,preview=false) {
  // Replace only document metadata; the controller-supplied body is untouched.
  html=html.replace(/<head>([\s\S]*?)<\/head>/i,(_,contents)=>'<head>'+contents.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]*)"|property="og:[^"]*")[^>]*>/gi,'').replace(/<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>/gi,'').replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi,'')+head(meta,siteUrl,preview)+'</head>');
  return html.replace(/<html\b[^>]*>/i,`<html lang="${meta.locale}">`);
}
function breadcrumbHtml(items,locale) {
  return `<nav class="site-breadcrumbs" aria-label="${locale==='en'?'Breadcrumb':'面包屑导航'}"><ol>${items.map((item,index)=>`<li>${index===items.length-1?`<span aria-current="page">${esc(item.name)}</span>`:`<a href="${esc(item.url)}">${esc(item.name)}</a>`}</li>`).join('')}</ol></nav>`;
}
function sitemap(pages,preview=false) {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${preview?'':pages.filter(p=>p.indexable).map(p=>`<url><loc>${esc(p.canonical)}</loc></url>`).join('')}</urlset>\n`;
}
function robots(siteUrl,preview=false,policy={searchCrawl:'allow',trainingCrawl:'allow'}){
  if(preview)return 'User-agent: *\nDisallow: /\n';
  if(!['allow','disallow'].includes(policy.searchCrawl)||!['allow','disallow'].includes(policy.trainingCrawl))throw Error('Invalid crawl policy');
  const rule=value=>value==='allow'?'Allow: /':'Disallow: /';
  return '# Search discovery\nUser-agent: OAI-SearchBot\n'+rule(policy.searchCrawl)+'\n\n# Model training: '+policy.trainingCrawl+'\nUser-agent: GPTBot\n'+rule(policy.trainingCrawl)+'\n\nUser-agent: *\nAllow: /\n\nSitemap: '+new URL('sitemap.xml',siteUrl).href+'\n';
}
const fingerprint=html=>'sha256:'+crypto.createHash('sha256').update(html).digest('hex');
module.exports={metadata,head,apply,breadcrumbHtml,sitemap,robots,fingerprint};
