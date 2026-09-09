'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function body(brand,base){
  if(!brand.maintainer||brand.codeLicense!=='MIT'||brand.contentLicense!=='CC BY 4.0')throw Error('Brand facts require confirmed identity and licenses');
  for(const url of [brand.repository,brand.correctionsUrl].filter(Boolean))if(new URL(url).protocol!=='https:')throw Error('Invalid public brand URL');
  return `<section id="purpose"><h2>这个项目是什么</h2><p><strong>${esc(brand.nameZh)} / ${esc(brand.nameEn)}</strong> 是面向 AI 初学者和非技术使用者的免费知识项目。目标是帮助读者认识 AI 世界的全貌，理解基础概念和底层逻辑。</p><p>你可以从<a href="${base}#/map">知识地图</a>探索概念之间的联系，也可以通过<a href="${base}search/">搜索与文字目录</a>寻找概念和已发布的理解页。阅读无需账号；邮箱验证码登录用于跨设备保存学习进度。</p></section>
<section id="maintenance"><h2>谁在维护</h2><p>项目由 <strong>${esc(brand.maintainer)}</strong> 维护，使用 AI 工具辅助内容整理与网站开发。内容准确性、讲解是否有效、审核记录是否完整分别评价。内容按页审核、更新；不能将已经发布理解页的审核状态推及所有地图节点。</p><p>项目仍在完善。让所有人都能快速学习 AI 基础知识是长期目标，目前不承诺固定学习时长或学习效果。</p><p><a href="${esc(brand.repository)}">GitHub 项目</a></p></section>
<section id="corrections"><h2>联系与纠错</h2>${brand.correctionsUrl?`<p>发现事实错误、讲解不清或网站问题，请通过<a href="${esc(brand.correctionsUrl)}">GitHub Issues 提交问题</a>。请附页面地址、具体段落、问题说明和可核对的来源；公开问题中不要填写密码、验证码或其他私人信息。</p>`:'<p>公开纠错入口正在确认；项目链接见上方。</p>'}</section>
<section id="reuse"><h2>如何使用代码与文章</h2><p>原创代码采用 <a href="${base}licenses/MIT.txt">MIT 许可</a>，允许复制、修改和商业使用，须保留版权及许可声明。</p><p>原创文章和由本项目拥有权利的原创讲解图表采用 <a rel="license" href="https://creativecommons.org/licenses/by/4.0/deed.zh-hans">CC BY 4.0</a>。允许分享、改编和商业使用；须署名 LittleFishK / AI 知识地图，链接原文及许可，并标明修改。第三方库、引用、截图、商标及另有许可标注的素材遵守各自许可。</p><p>示例署名：“来源：LittleFishK，AI 知识地图，《文章标题》，原文链接，CC BY 4.0；已修改（如适用）。”</p></section>`;
}
module.exports={body};
