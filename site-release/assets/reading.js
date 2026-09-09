(function (global) {
  'use strict';
  function enhance(article) {
    if (!article || article.dataset.readingEnhanced) return;
    article.dataset.readingEnhanced = 'true';
    const english = (article.lang || document.documentElement.lang) === 'en';
    const headings = [...article.querySelectorAll('h2')];
    if (headings.length) {
      const toc = document.createElement('details'); toc.className = 'reading-toc';
      const summary = document.createElement('summary'); summary.textContent = english ? 'On this page' : '本页目录';
      const list = document.createElement('ol');
      headings.forEach((heading, index) => {
        if (!heading.id) { let id = `reading-section-${index + 1}`; while (document.getElementById(id)) id += '-section'; heading.id = id; }
        const item = document.createElement('li'), link = document.createElement('a');
        link.href = '#' + heading.id; link.textContent = heading.textContent; item.append(link); list.append(item);
        // In the hash-routed overlay, scrolling must not change the app route.
        if (!document.body.classList.contains('concept-preview')) link.addEventListener('click', event => { event.preventDefault(); heading.scrollIntoView(); heading.tabIndex = -1; heading.focus({preventScroll:true}); });
      });
      toc.append(summary, list); (article.querySelector('.dd-hero') || article.firstElementChild).after(toc);
    }
    article.querySelectorAll('svg, table').forEach(node => {
      if (node.closest('.reading-overflow, .dd-diagram-scroll') || node.parentElement.closest('svg')) return;
      const wrapper = document.createElement('div'); wrapper.className = 'reading-overflow'; wrapper.tabIndex = 0;
      wrapper.setAttribute('role','region'); wrapper.setAttribute('aria-label', english ? 'Diagram or table; scroll horizontally' : '图表区域，可左右滚动');
      if (node.tagName.toLowerCase() === 'svg') {
        const width = Number((node.getAttribute('viewBox') || '').split(/[ ,]+/)[2]);
        if (width > 0 && width < 5000) wrapper.style.setProperty('--diagram-width', width + 'px');
      }
      node.before(wrapper); wrapper.append(node);
    });
  }
  global.AI_READING = {enhance};
  enhance(document.getElementById('dd-article'));
})(window);
