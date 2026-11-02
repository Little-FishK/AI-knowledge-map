(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AI_THEME_COLORS=api;})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 function parse(raw){raw=String(raw).trim().toLowerCase();const named={white:'#ffffff',black:'#000000',red:'#ff0000',navy:'#000080',gray:'#808080',grey:'#808080'};raw=named[raw]||raw;let a=1,r,g,b;if(/^#[a-f\d]{3,8}$/i.test(raw)){let h=raw.slice(1);if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');if(h.length!==6&&h.length!==8)return null;[r,g,b]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);if(h.length===8)a=parseInt(h.slice(6),16)/255;}else{const m=raw.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);if(!m)return null;[r,g,b]=m.slice(1,4).map(n=>Number(n)/255);a=m[4]===undefined?1:Number(m[4]);}return {r,g,b,a};}
 const luminance=c=>{const v=[c.r,c.g,c.b].map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];};
 function hsl(c){const max=Math.max(c.r,c.g,c.b),min=Math.min(c.r,c.g,c.b),d=max-min,l=(max+min)/2;let h=0;if(d){if(max===c.r)h=((c.g-c.b)/d)%6;else if(max===c.g)h=(c.b-c.r)/d+2;else h=(c.r-c.g)/d+4;h=(h*60+360)%360;}return {h,s:d?d/(1-Math.abs(2*l-1)):0,l};}
 function rgb(h,s,l,a=1){const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let v=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return {r:v[0]+m,g:v[1]+m,b:v[2]+m,a};}
 const css=c=>c.a<.999?`rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${+c.a.toFixed(3)})`:'#'+[c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');
 function color(raw,role='foreground'){const c=parse(raw);if(!c||c.a===0)return raw;const p=hsl(c);let out;
  if(role==='background'){if(luminance(c)>.8)return css(c);out=rgb(p.s<.12?212:p.h,Math.min(.48,Math.max(.12,p.s*.6)),.955,c.a);}
  else if(role==='shadow')out={r:.12,g:.2,b:.3,a:Math.min(.16,c.a*.38)};
  else if(role==='border'){out=rgb(p.s<.18?212:p.h,Math.min(.45,Math.max(.18,p.s)),p.s>.4&&luminance(c)>.18?.48:.76,c.a);}
  else{let lightness=.31;out=rgb(p.s<.14?211:p.h,Math.min(.78,Math.max(.26,p.s)),.31,Math.max(.88,c.a));while(luminance(out)>.125){lightness-=.01;out=rgb(p.s<.14?211:p.h,Math.min(.78,Math.max(.26,p.s)),Math.max(.1,lightness),Math.max(.88,c.a));}}
  return css(out);
 }
 function value(raw,role){return String(raw).split(/(url\([^)]*\))/gi).map(part=>/^url\(/i.test(part)?part:part.replace(/#[a-f\d]{8}\b|#[a-f\d]{6}\b|#[a-f\d]{4}\b|#[a-f\d]{3}\b|rgba?\([^)]*\)|\b(?:white|black|navy|gray|grey)\b/gi,c=>color(c,role))).join('');}
 function property(name){if(name==='color'||name==='-webkit-text-fill-color'||name==='text-decoration-color'||name==='caret-color'||name==='accent-color')return 'foreground';if(name==='background'||name==='background-color'||name==='background-image')return 'background';if(name.includes('shadow'))return 'shadow';if(name==='border'||name.startsWith('border-')||name==='outline'||name==='outline-color')return 'border';return null;}
 return Object.freeze({parse,luminance,color,value,property});
});
