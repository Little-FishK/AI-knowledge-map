'use strict';
// Narrow quantity normalization, not a general natural-language number guesser.
function chineseInteger(text) {
  const digits={零:0,〇:0,一:1,二:2,两:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
  const scales={十:10,百:100,千:1000,万:10000,亿:100000000};
  let total=0,section=0,digit=0;
  for(const ch of text) {
    if(Object.hasOwn(digits,ch)){digit=digits[ch];continue;}
    const scale=scales[ch];
    if(scale<10000){section+=(digit||1)*scale;digit=0;}
    else {section+=digit;total=scale===100000000?(total+section)*scale:total+section*scale;section=0;digit=0;}
  }
  return String(total+section+digit);
}
function normalizeQuantities(value) {
  // Entity spelling is markup, not a numeric claim (e.g. &#39; is an apostrophe).
  value=value.replace(/&#(x[0-9a-f]+|\d+);/gi,(m,n)=>{const code=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return code<=0x10ffff?String.fromCodePoint(code):m;}).replace(/\b(\d+(?:\.\d+)?)-to-(\d+(?:\.\d+)?)\b/gi,'$1 to $2');
  value=value.replace(/第([一二三四五六七八九十百]+)(?=[章节])/g,(_m,n)=>'第'+chineseInteger(n));
  value=value.replace(/(方案)([一二三四五六七八九十]+)(?=[：:的，。；\s])/g,(_m,p,n)=>p+chineseInteger(n));
  const months={January:1,February:2,March:3,April:4,May:5,June:6,July:7,August:8,September:9,October:10,November:11,December:12};
  value=value.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)(?=\s+\d{4}\b)/g,m=>String(months[m]));
  value=value.replace(/(?<!统)([一二三四五六七八九十])成(半)?(?!不变)/g,(_m,n,half)=>String(Number(chineseInteger(n))*10+(half?5:0))+'%').replace(/([一二三四五六七八九])([一二三四五六七八九])折/g,(_m,a,b)=>chineseInteger(a)+chineseInteger(b)+'%');
  const tenths={one:10,two:20,three:30,four:40,five:50,six:60,seven:70,eight:80,nine:90,ten:100};
  value=value.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten) out of ten\b/gi,(_m,n)=>tenths[n.toLowerCase()]+'%');
  const percentWords={ten:10,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
  value=value.replace(/\b(ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety) percent\b/gi,(_m,n)=>percentWords[n.toLowerCase()]+'%');
  value=value.replace(/百分之([一二三四五六七八九十百]+)/g,(_m,n)=>chineseInteger(n)+'%');
  value=value.replace(/(?<![一二三四五六七八九])([一二三四五六七八九])折/g,(_m,n)=>String(Number(chineseInteger(n))*10)+'%');
  value=value.replace(/\b(\d+(?:\.\d+)?)% discount\b/gi,(_m,n)=>String(100-Number(n))+'% retained');
  value=value.replace(/\b(one )?(million|billion|trillion)th\b/gi,(_m,_one,n)=>'1 '+n);
  value=value.replace(/([一二三四五六七八九十]+)千(?![零〇一二两三四五六七八九十百千万亿])/g,(_m,n)=>String(Number(chineseInteger(n))*1000));
  value=value.replace(/([一二三四五六七八九]?百)次/g,(_m,n)=>chineseInteger(n)+'次');
  value=value.replace(/\b(?:a |one )?hundred (times|attempts)\b/gi,(_m,n)=>'100 '+n).replace(/\bbest-of-(\d+)\b/gi,'best of $1');
  value=value.replace(/(?:数|几)百万/g,' approximateMillions ').replace(/\b(?:several|a few) million\b/gi,' approximateMillions ');
  value=value.replace(/近亿/g,'近1亿');
  value=value.replace(/(\d+(?:\.\d+)?)\s*百万/g,'$1 million');
  value=value.replace(/\bmillions of (?=(?:US )?dollars\b)/gi,'1 million ');
  // “1600 多万” has the same numeric lower bound as “over 16 million”.
  // Retain the qualifier for semantic review; only join the scale to its number.
  value=value.replace(/(\d+(?:\.\d+)?)\s*多\s*([千万亿])/g,'$1$2 多');
  // In the established mathematical adjective "rank-1", the hyphen joins
  // words; it is not a minus sign. Keep genuine signed values untouched.
  value=value.replace(/\brank-(\d+)\b/gi,'rank $1');
  value=value.replace(/数百万/g,' approximateMillions ').replace(/数十亿/g,' approximateBillions ')
    .replace(/\bmillions\b/gi,' approximateMillions ').replace(/\bbillions\b/gi,' approximateBillions ');
  value=value.replace(/[零〇一二两三四五六七八九十百千万亿]+/g,text=>{
    // Ignore lone characters and idiomatic/ambiguous forms such as 万一.
    if(!/^[一二两三四五六七八九十百千][零〇一二两三四五六七八九十百千万亿]*$/.test(text)||!/[千万亿]/.test(text)||text.length<2)return text;
    return chineseInteger(text);
  });
  const words={a:'1',one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',eleven:'11',twelve:'12',thirteen:'13',fourteen:'14',fifteen:'15',sixteen:'16',seventeen:'17',eighteen:'18',nineteen:'19',twenty:'20',hundred:'100'};
  value=value.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)(?=[ -](?:thousand|million|billion|trillion)\b)/gi,w=>words[w.toLowerCase()]);
  value=value.replace(/(?<![\w-])(thousand|million|billion|trillion)(?=-(?:level|length|token|scale)\b|\s+(?:or|level)\b)/gi,'1 $1');
  value=value.replace(/\b(\d+)-(thousand|million|billion|trillion)\b/gi,'$1 $2');
  value=value.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+(?:\.\d+)?)[ -]megapixels?\b/gi,(_m,n)=>(words[n.toLowerCase()]||n)+' million pixels');
  value=value.replace(/\b(a|one|two|three|four|five|six|seven|eight|nine) hundred(?=\s+(?:million|billion|thousand)\b)/gi,(_m,n)=>String(Number(words[n.toLowerCase()])*100));
  value=value.replace(/\b(a|one|two|three|four|five|six|seven|eight|nine|ten|hundred)(?=\s+(?:million|billion|thousand)\b)/gi,w=>words[w.toLowerCase()]);
  return value.replace(/\b(\d+(?:\.\d+)?)\s+(thousand|million|billion|trillion)\b/gi,(_m,num,scale)=>{
    const [whole,part='']=num.split('.'),power={thousand:3,million:6,billion:9,trillion:12}[scale.toLowerCase()];
    if(part.length>power)return _m;
    return (BigInt(whole+part)*10n**BigInt(power-part.length)).toString();
  });
}
module.exports={normalizeQuantities};
