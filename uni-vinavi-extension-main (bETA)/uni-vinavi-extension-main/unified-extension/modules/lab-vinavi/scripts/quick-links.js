// quick-links.js - HMH Quick Links renderer and filter

(function () {
  'use strict';

  const LINKS_DATA = [
    {
      title: 'VINAVI Portal',
      url: 'https://vinavi.aasandha.mv',
      tags: 'vinavi insurance aasandha portal',
      iconSrc: 'icons/quick-links/vinavi-logo.png',
      iconAlt: 'Vinavi'
    },
    {
      title: 'HIMS / MyList',
      url: 'http://mylist//',
      tags: 'hims mylist opd',
      iconSrc: 'icons/quick-links/mylist-hims.ico',
      iconAlt: 'MyList'
    },
    {
      title: 'Queue Display (All)',
      url: 'http://10.0.30.140/display/0',
      tags: 'queue display all status tokens',
      icon: '📊'
    },
    {
      title: 'X-Ray Viewer',
      url: 'http://192.168.101.56/zfp',
      tags: 'xray viewer imaging radiology pacs',
      icon: '🔬',
      credentials: [
        { label: 'USERNAME', value: 'Geapps' },
        { label: 'PASSWORD', value: 'test' }
      ]
    },
    {
      title: 'GULHUN Portal',
      url: 'https://gulhun.hmh.gov.mv/webixiHMH/index.asp',
      tags: 'gulhun portal echannel',
      icon: '🌐'
    },
    {
      title: 'Dharaka Laboratory',
      url: 'http://dharaka.hmh.mv/',
      tags: 'dharaka lab laboratory dharaku',
      iconSrc: 'icons/quick-links/dharaka.ico',
      iconAlt: 'Dharaka'
    }
  ];

  function renderIcon(link) {
    if (link.iconSrc) {
      const alt = (link.iconAlt || link.title || '').replace(/"/g, '');
      return `<img class="quick-link-icon-img" src="${link.iconSrc}" alt="${alt}">`;
    }
    return `<span class="quick-link-icon-emoji">${link.icon || ''}</span>`;
  }

  function renderLinks() {
    const grid = document.getElementById('quickLinksGrid');
    if (!grid) return;

    grid.innerHTML = LINKS_DATA.map(link => {
      let credHtml = '';
      if (link.credentials) {
        credHtml = `
          <div class="quick-link-creds">
            ${link.credentials.map(cred => `
              <div class="cred-row">
                <span class="cred-label">${cred.label}:</span>
                <span class="cred-value" title="${cred.value}">${cred.value}</span>
                <button class="cred-copy-btn" data-copy="${cred.value}" type="button">Copy</button>
              </div>
            `).join('')}
          </div>
        `;
      }

      return `
        <article class="quick-link-card" data-tags="${link.tags}">
          <div class="quick-link-header">
            <span class="quick-link-icon">${renderIcon(link)}</span>
            <div class="quick-link-title">${link.title}</div>
          </div>
          <a class="quick-link-btn" href="${link.url}" target="_blank" rel="noopener">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M11 7.5V11H3V3h3.5V1H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.5h-2zM7.5 1v2H10L4 9l1.4 1.4L12 4.6V7h2V1H7.5z"/>
            </svg>
            Open Link
          </a>
          ${credHtml}
        </article>
      `;
    }).join('');
  }

  function setupFilter() {
    const filterInput = document.getElementById('quickLinksFilter');
    if (!filterInput) return;

    filterInput.addEventListener('input', () => {
      const query = filterInput.value.trim().toLowerCase();
      const cards = document.querySelectorAll('.quick-link-card');

      cards.forEach(card => {
        const haystack = (card.textContent + ' ' + (card.dataset.tags || '')).toLowerCase();
        card.style.display = haystack.includes(query) ? '' : 'none';
      });
    });
  }

  function setupCopyButtons() {
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-copy]');
      if (!btn) return;

      const value = btn.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(value);
        const original = btn.textContent;
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 1500);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    });
  }

  function init() {
    renderLinks();
    setupFilter();
    setupCopyButtons();
  }

  // Export init for dashboard.js
  window.QuickLinks = { init };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
