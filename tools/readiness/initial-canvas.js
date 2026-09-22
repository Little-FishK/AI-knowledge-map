'use strict';
// Declare the browser canvas before any network-dependent stylesheets.
// Screen colours match style.css; printing retains a light paper background.
const markup='<meta name="color-scheme" content="dark"><style id="initial-canvas">:root{color-scheme:dark;background:#14161a;color:#dfe3ea}body{background:#14161a}@media print{:root{color-scheme:light;background:#fff;color:#000}body{background:#fff}}</style>';
function apply(html){
 if(html.includes('id="initial-canvas"'))return html;
 if(!/<head\b[^>]*>/i.test(html))throw Error('Missing document head');
 return html.replace(/(<head\b[^>]*>\s*(?:<meta\s+charset=[^>]+>\s*)?)/i,'$1'+markup);
}
module.exports={apply,markup};
