// Synaptic Editorial - Dedicated Gallery Page Logic
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  loadGalleryContent();
  initLightbox();
  initFilterControls();
});

let allGallery = [];
let currentFiltered = [];

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Mobile menu toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });
}

// Load Content from Server API
async function loadGalleryContent() {
  try {
    let res = await fetch('/api/content').catch(() => null);
    if (!res || !res.ok) {
      res = await fetch('/data/portfolio.json');
    }
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    if (data.profile && data.profile.name) {
      const brand = document.getElementById('header-brand-name');
      if (brand) {
        const brandImg = brand.querySelector('img');
        if (brandImg) {
          brandImg.alt = data.profile.name;
        } else {
          brand.textContent = data.profile.name;
        }
      }
    }

    if (data.contact) {
      const labName = document.getElementById('footer-lab-name');
      const mission = document.getElementById('footer-mission-text');
      const copyright = document.getElementById('footer-copyright');
      if (labName && data.contact.labName) labName.textContent = data.contact.labName;
      if (mission && data.contact.mission) mission.textContent = data.contact.mission;
      if (copyright && data.contact.copyright) copyright.textContent = data.contact.copyright;
    }

    allGallery = Array.isArray(data.gallery) ? data.gallery : [];
    currentFiltered = [...allGallery];
    renderGalleryGrid(currentFiltered);
  } catch (err) {
    console.error('Failed to load gallery data:', err);
    const container = document.getElementById('gallery-container');
    if (container) {
      container.innerHTML = '<p style="color: var(--on-surface-variant); text-align: center; grid-column: 1 / -1; padding: 2rem;">Error loading gallery specimens. Please try again later.</p>';
    }
  }
}

// Filter Chips Setup
function initFilterControls() {
  const filterBar = document.getElementById('gallery-filter-bar');
  if (!filterBar) return;

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-chip');
    if (!btn) return;

    filterBar.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    if (filter === 'all') {
      currentFiltered = [...allGallery];
    } else {
      currentFiltered = allGallery.filter((item) => {
        const tech = (item.technique || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const stain = (item.stain || '').toLowerCase();
        const query = filter.toLowerCase();
        return tech.includes(query) || desc.includes(query) || stain.includes(query);
      });
    }

    renderGalleryGrid(currentFiltered);
  });
}

// Render Gallery Grid
function renderGalleryGrid(items) {
  const container = document.getElementById('gallery-container');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--on-surface-variant);">
        <span class="material-symbols-outlined" style="font-size: 2.5rem; color: var(--on-surface-muted); margin-bottom: 0.5rem;">photo_library</span>
        <p style="font-size: 1.1rem; font-weight: 500; color: var(--on-surface);">No specimens found for this filter</p>
        <p style="font-size: 0.875rem; margin-top: 0.25rem;">Try selecting "All Specimens" to view complete optical acquisitions.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items
    .map((item, index) => {
      const hasSource = item.sourceUrl && typeof item.sourceUrl === 'string' && item.sourceUrl.trim() !== '';

      return `
        <div class="gallery-card" onclick="openGalleryLightbox(${index})">
          <div class="gallery-thumb-wrap">
            <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.title)}" class="gallery-thumb" loading="lazy">
            <div class="gallery-overlay-badge">
              <span class="material-symbols-outlined" style="font-size: 0.9rem;">biotech</span>
              <span>${escapeHtml(item.technique || 'Bioimaging')}</span>
            </div>
            <div class="gallery-zoom-hint" title="Inspect specimen">
              <span class="material-symbols-outlined">zoom_in</span>
            </div>
          </div>
          <div class="gallery-body">
            <div class="gallery-tags">
              ${item.magnification ? `<span class="gallery-pill">${escapeHtml(item.magnification)}</span>` : ''}
              ${item.stain ? `<span class="gallery-pill secondary">${escapeHtml(item.stain)}</span>` : ''}
            </div>
            <h3 class="gallery-title">${escapeHtml(item.title)}</h3>
            <p class="gallery-desc">${escapeHtml(item.description || '')}</p>
            <div class="gallery-footer">
              <span>Captured: ${escapeHtml(item.date || 'Lab Series')}</span>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                ${
                  hasSource
                    ? `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="gallery-source-btn" onclick="event.stopPropagation();" title="View Scientific Source / Publication">
                         <span class="material-symbols-outlined">open_in_new</span>
                         <span>Source</span>
                       </a>`
                    : ''
                }
                <span style="color: var(--primary); font-weight: 500; cursor: pointer;">Inspect Full &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

// Lightbox Controls
function initLightbox() {
  const backdrop = document.getElementById('gallery-lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  if (!backdrop || !closeBtn) return;

  closeBtn.addEventListener('click', closeGalleryLightbox);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeGalleryLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGalleryLightbox();
  });
}

window.openGalleryLightbox = function (index) {
  const item = currentFiltered[index];
  if (!item) return;

  const backdrop = document.getElementById('gallery-lightbox');
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const desc = document.getElementById('lightbox-desc');
  const date = document.getElementById('lightbox-date');
  const tags = document.getElementById('lightbox-tags');
  const filename = document.getElementById('lightbox-filename');
  const sourceBox = document.getElementById('lightbox-source-box');
  const sourceBtn = document.getElementById('lightbox-source-btn');

  img.src = item.url;
  img.alt = item.title;
  title.textContent = item.title;
  desc.textContent = item.description || '';
  date.textContent = `Acquisition: ${item.date || 'Lab Archive'}`;
  filename.textContent = item.technique || '';

  tags.innerHTML = `
    ${item.technique ? `<span class="gallery-pill">${escapeHtml(item.technique)}</span>` : ''}
    ${item.magnification ? `<span class="gallery-pill">${escapeHtml(item.magnification)}</span>` : ''}
    ${item.stain ? `<span class="gallery-pill secondary">${escapeHtml(item.stain)}</span>` : ''}
  `;

  if (sourceBox && sourceBtn) {
    if (item.sourceUrl && item.sourceUrl.trim() !== '') {
      sourceBtn.href = item.sourceUrl;
      sourceBox.style.display = 'block';
    } else {
      sourceBox.style.display = 'none';
    }
  }

  backdrop.classList.add('active');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

window.closeGalleryLightbox = function () {
  const backdrop = document.getElementById('gallery-lightbox');
  if (!backdrop) return;
  backdrop.classList.remove('active');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};
