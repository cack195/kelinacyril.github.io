// Synaptic Editorial - Public Frontend Logic
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  loadPortfolioContent();
  initLightbox();
  initScrollSpy();
});

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

// Fetch and hydrate dynamic portfolio data
async function loadPortfolioContent() {
  try {
    let res = await fetch('/api/content').catch(() => null);
    if (!res || !res.ok) {
      res = await fetch('/data/portfolio.json');
    }
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    renderProfile(data.profile);
    renderPillars(data.pillars);
    renderTrajectory(data.trajectory);
    renderTooling(data.tooling);
    renderGallery(data.gallery);
    renderBlogPreview(data.blogs);
    renderContact(data.contact);
  } catch (err) {
    console.error('Failed to load portfolio content from API:', err);
  }
}

// Render Profile
function renderProfile(profile) {
  if (!profile) return;
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.textContent = val;
  };

  const brandEl = document.getElementById('header-brand-name');
  if (brandEl) {
    const brandImg = brandEl.querySelector('img');
    if (brandImg) {
      brandImg.alt = profile.name || 'Kelina Cyril';
    } else {
      brandEl.textContent = profile.name;
    }
  }
  setTxt('hero-name', profile.name);
  setTxt('portrait-name-caption', profile.name);
  setTxt('hero-badge-text', profile.badge || 'Personal Introduction');
  setTxt('hero-title', profile.title);
  setTxt('portrait-sub-caption', profile.avatarCaption || profile.title);
  setTxt('hero-tagline', profile.tagline ? `"${profile.tagline.replace(/^"|"$/g, '')}"` : '');

  // Render Bio paragraphs
  const bioContainer = document.getElementById('hero-bio');
  if (bioContainer && Array.isArray(profile.bio)) {
    bioContainer.innerHTML = profile.bio.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  }

  // Links
  if (profile.links) {
    const li = document.getElementById('hero-linkedin');
    if (li && profile.links.linkedin) li.href = profile.links.linkedin;
    const sc = document.getElementById('hero-scholar');
    if (sc && profile.links.scholar) sc.href = profile.links.scholar;
  }

  // Avatar image
  const avatarEl = document.getElementById('hero-avatar');
  if (avatarEl && profile.avatar) {
    avatarEl.src = profile.avatar;
    avatarEl.alt = `${profile.name}, Doctoral Researcher`;
  }
}

// Render Bento Pillars
function renderPillars(pillars) {
  const container = document.getElementById('pillars-container');
  if (!container || !Array.isArray(pillars)) return;

  container.innerHTML = pillars
    .map((pillar) => {
      const theme = pillar.theme || 'primary';
      return `
      <div class="bento-card" data-id="${pillar.id}">
        <div>
          <div class="pillar-icon-box theme-${theme}">
            <span class="material-symbols-outlined">${escapeHtml(pillar.icon || 'science')}</span>
          </div>
          <span class="pillar-num">Pillar ${escapeHtml(pillar.number || '01')}</span>
          <h3 class="pillar-heading">${escapeHtml(pillar.title)}</h3>
          <p class="pillar-text">${escapeHtml(pillar.description)}</p>
        </div>
        <div class="pillar-footer theme-${theme}">
          <span>${escapeHtml(pillar.tag || 'Focus Area')}</span>
          <span class="material-symbols-outlined" style="font-size: 1rem;">arrow_forward</span>
        </div>
      </div>
    `;
    })
    .join('');
}

// Render Academic Trajectory
function renderTrajectory(trajectory) {
  const container = document.getElementById('trajectory-container');
  if (!container || !Array.isArray(trajectory)) return;

  container.innerHTML = trajectory
    .map((item) => {
      const theme = item.theme || 'primary';
      return `
      <div class="timeline-card" data-id="${item.id}">
        <div class="timeline-card-header">
          <div>
            <div class="timeline-status">
              <span class="status-dot theme-${theme}"></span>
              <span class="timeline-badge theme-${theme}">${escapeHtml(item.badge || 'Milestone')}</span>
            </div>
            <h3 class="timeline-degree">${escapeHtml(item.degree)}</h3>
            <p class="timeline-inst">${escapeHtml(item.institution)}</p>
            <p class="timeline-desc">${escapeHtml(item.description)}</p>
          </div>
          <span class="timeline-period">${escapeHtml(item.period || 'Present')}</span>
        </div>
      </div>
    `;
    })
    .join('');
}

// Render Experimental Tooling & Methodologies
function renderTooling(tooling) {
  if (!tooling) return;
  const catContainer = document.getElementById('tooling-categories-container');
  if (catContainer && Array.isArray(tooling.categories)) {
    catContainer.innerHTML = tooling.categories
      .map((cat) => `
        <div style="margin-bottom: 1.25rem;">
          <span class="tooling-category-title">${escapeHtml(cat.name)}</span>
          <div class="chip-container">
            ${(cat.tools || [])
              .map((tool) => `<span class="tech-chip">${escapeHtml(tool)}</span>`)
              .join('')}
          </div>
        </div>
      `)
      .join('');
  }

  if (tooling.certification) {
    const certTitle = document.getElementById('cert-title');
    const certDesc = document.getElementById('cert-desc');
    if (certTitle && tooling.certification.title) certTitle.textContent = tooling.certification.title;
    if (certDesc && tooling.certification.description) certDesc.textContent = tooling.certification.description;
  }
}

// Render Microscopy Gallery
let currentGallery = [];
function renderGallery(gallery) {
  const container = document.getElementById('gallery-container');
  if (!container || !Array.isArray(gallery)) return;
  currentGallery = gallery;

  if (gallery.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--on-surface-variant);">
        <p>No microscopy media items published yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = gallery
    .slice(0, 3)
    .map((item, index) => {
      const hasSource = item.sourceUrl && typeof item.sourceUrl === 'string' && item.sourceUrl.trim() !== '';

      return `
      <div class="gallery-card" onclick="openLightbox(${index})">
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
                  ? `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="gallery-source-btn" onclick="event.stopPropagation();" title="View Source Publication">
                       <span class="material-symbols-outlined">open_in_new</span>
                       <span>Source</span>
                     </a>`
                  : ''
              }
              <span style="color: var(--primary); font-weight: 500;">Inspect Full &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
}

// Render Research Blog Dispatches Preview on Home Page
function renderBlogPreview(blogs) {
  const container = document.getElementById('home-blog-container');
  if (!container || !Array.isArray(blogs)) return;

  if (blogs.length === 0) {
    container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--on-surface-variant); padding: 2rem;">No research dispatches published yet.</p>';
    return;
  }

  container.innerHTML = blogs
    .slice(0, 3)
    .map((item) => {
      const cover = item.coverImage || '/uploads/dendritic_spines_sted.jpg';
      const category = item.category || 'Research Notes';
      const date = item.date || 'Recent';
      const readTime = item.readTime || '5 min read';

      return `
        <article class="blog-card" onclick="window.location.href='/blog#dispatch-${escapeHtml(item.id)}'" role="button" tabindex="0" aria-label="Read article: ${escapeHtml(item.title)}">
          <div class="blog-card-thumb-wrap">
            <img src="${escapeHtml(cover)}" alt="${escapeHtml(item.title)}" class="blog-card-thumb" loading="lazy">
            <div class="blog-card-badge">
              <span class="material-symbols-outlined" style="font-size: 0.85rem;">label</span>
              <span>${escapeHtml(category)}</span>
            </div>
          </div>
          <div class="blog-card-body">
            <div class="blog-card-meta">
              <span>${escapeHtml(date)}</span>
              <span>•</span>
              <span>${escapeHtml(readTime)}</span>
            </div>
            <h3 class="blog-card-title">${escapeHtml(item.title)}</h3>
            <p class="blog-card-excerpt">${escapeHtml(item.excerpt || '')}</p>
            <div class="blog-card-action">
              <span>Read Full Dispatch</span>
              <span class="material-symbols-outlined" style="font-size: 1rem;">arrow_forward</span>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

// Render Contact & Footer
function renderContact(contact) {
  if (!contact) return;
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.textContent = val;
  };

  setTxt('footer-lab-name', contact.labName);
  setTxt('footer-lab-desc', contact.department ? `${contact.department}. ${contact.mission || ''}` : '');
  setTxt('footer-copyright', contact.copyright);

  if (contact.orcid) {
    setTxt('footer-orcid-text', `ORCID: ${contact.orcid}`);
    const orcidLink = document.getElementById('footer-orcid-link');
    if (orcidLink) orcidLink.href = `https://orcid.org/${contact.orcid}`;
  }

  setTxt('contact-dept', contact.department);
  setTxt('contact-office', contact.office);
  setTxt('contact-email-text', contact.email);
  const emailBtn = document.getElementById('contact-email-btn');
  if (emailBtn && contact.email) emailBtn.href = `mailto:${contact.email}`;
}

// Lightbox Modal functions
function initLightbox() {
  const backdrop = document.getElementById('gallery-lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  if (!backdrop || !closeBtn) return;

  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

window.openLightbox = function (index) {
  const item = currentGallery[index];
  if (!item) return;

  const backdrop = document.getElementById('gallery-lightbox');
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const desc = document.getElementById('lightbox-desc');
  const date = document.getElementById('lightbox-date');
  const tags = document.getElementById('lightbox-tags');
  const filename = document.getElementById('lightbox-filename');

  img.src = item.url;
  img.alt = item.title;
  title.textContent = item.title;
  desc.textContent = item.description || '';
  date.textContent = `Specimen Acquisition: ${item.date || 'Lab Archive'}`;
  filename.textContent = item.technique || '';

  tags.innerHTML = `
    ${item.technique ? `<span class="gallery-pill">${escapeHtml(item.technique)}</span>` : ''}
    ${item.magnification ? `<span class="gallery-pill">${escapeHtml(item.magnification)}</span>` : ''}
    ${item.stain ? `<span class="gallery-pill secondary">${escapeHtml(item.stain)}</span>` : ''}
  `;

  backdrop.classList.add('active');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function () {
  const backdrop = document.getElementById('gallery-lightbox');
  if (!backdrop) return;
  backdrop.classList.remove('active');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

// Scrollspy active nav link
function initScrollSpy() {
  const sections = document.querySelectorAll('main > section[id]');
  const navLinks = document.querySelectorAll('#desktop-nav .nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
