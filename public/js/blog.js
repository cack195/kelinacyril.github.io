// Synaptic Editorial - Dedicated Blog Page Logic
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  loadBlogContent();
  initBlogModalEvents();
  initFilterControls();
});

let allBlogs = [];
let currentFiltered = [];
let authorName = 'Kelina Cyril';

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function fixAssetUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  return url.replace(/^\/+/, '');
}

// Convert simple markdown/formatted text into clean HTML for large articles
function renderMarkdownToHtml(markdown) {
  if (!markdown) return '';

  let html = markdown;

  // Code blocks: ```lang ... ```
  html = html.replace(/```([\w]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    return `<code>${escapeHtml(code)}</code>`;
  });

  // Blockquotes: > quote
  html = html.replace(/^>\s*(.*)$/gm, '<blockquote>$1</blockquote>');

  // Headings: ### H3, ## H2
  html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');

  // Bold: **bold** or __bold__
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic: *italic* or _italic_
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Bullet points: - item
  html = html.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  // Numbered list: 1. item
  html = html.replace(/^\s*(\d+)\.\s+(.*)$/gm, '<li>$2</li>');

  // Paragraphs
  const blocks = html.split(/\n\s*\n/);
  html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h2>') ||
        trimmed.startsWith('<h3>') ||
        trimmed.startsWith('<pre>') ||
        trimmed.startsWith('<blockquote>') ||
        trimmed.startsWith('<ul>') ||
        trimmed.startsWith('<ol>') ||
        trimmed.startsWith('<li>')
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
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

// Load Blogs from API or static fallback
async function loadBlogContent() {
  try {
    const isStaticHost = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:';
    let res = null;
    if (!isStaticHost) {
      try {
        res = await fetch('/api/content');
      } catch (_) {}
    }
    if (!res || !res.ok) {
      try {
        res = await fetch('data/portfolio.json');
      } catch (_) {}
    }
    if (!res || !res.ok) {
      res = await fetch('./data/portfolio.json');
    }
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    if (data.profile && data.profile.name) {
      authorName = data.profile.name;
      const brand = document.getElementById('header-brand-name');
      if (brand) {
        const brandImg = brand.querySelector('img');
        if (brandImg) {
          brandImg.alt = authorName;
        } else {
          brand.textContent = authorName;
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

    allBlogs = Array.isArray(data.blogs) ? data.blogs : [];
    currentFiltered = [...allBlogs];
    renderBlogGrid(currentFiltered);

    // Check if URL contains hash to open directly
    checkUrlHash();
  } catch (err) {
    console.error('Failed to load blog posts:', err);
    const container = document.getElementById('blog-container');
    if (container) {
      container.innerHTML = '<p style="color: var(--on-surface-variant); text-align: center; grid-column: 1 / -1; padding: 2rem;">Unable to load dispatches. Please try again later.</p>';
    }
  }
}

// Filter controls
function initFilterControls() {
  const filterBar = document.getElementById('blog-filter-bar');
  if (!filterBar) return;

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-chip');
    if (!btn) return;

    filterBar.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    if (filter === 'all') {
      currentFiltered = [...allBlogs];
    } else {
      currentFiltered = allBlogs.filter((b) => {
        const cat = (b.category || '').toLowerCase();
        const title = (b.title || '').toLowerCase();
        const excerpt = (b.excerpt || '').toLowerCase();
        const query = filter.toLowerCase();
        return cat.includes(query) || title.includes(query) || excerpt.includes(query);
      });
    }

    renderBlogGrid(currentFiltered);
  });
}

// Render Blog Cards Grid
function renderBlogGrid(items) {
  const container = document.getElementById('blog-container');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--on-surface-variant);">
        <span class="material-symbols-outlined" style="font-size: 2.5rem; color: var(--on-surface-muted); margin-bottom: 0.5rem;">article</span>
        <p style="font-size: 1.1rem; font-weight: 500; color: var(--on-surface);">No articles found in this category</p>
        <p style="font-size: 0.875rem; margin-top: 0.25rem;">Try selecting "All Dispatches" to view all published notes.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const cover = fixAssetUrl(item.coverImage || 'uploads/dendritic_spines_sted.jpg');
      const category = item.category || 'Research Notes';
      const date = item.date || 'Recent';
      const readTime = item.readTime || '5 min read';

      return `
        <article class="blog-card" onclick="openBlogModal('${escapeHtml(item.id)}')" role="button" tabindex="0" aria-label="Read article: ${escapeHtml(item.title)}">
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
            <h2 class="blog-card-title">${escapeHtml(item.title)}</h2>
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

  // Keyboard accessibility for card enter
  container.querySelectorAll('.blog-card').forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

// Modal Pop-Up Reader Controls
function initBlogModalEvents() {
  const backdrop = document.getElementById('blog-modal-backdrop');
  const closeBtn = document.getElementById('blog-modal-close');
  const backBtn = document.getElementById('blog-modal-back');

  if (closeBtn) closeBtn.addEventListener('click', closeBlogModal);
  if (backBtn) backBtn.addEventListener('click', closeBlogModal);

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeBlogModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBlogModal();
  });

  window.addEventListener('popstate', checkUrlHash);
}

window.openBlogModal = function (blogId) {
  const blog = allBlogs.find((b) => b.id === blogId || b.slug === blogId);
  if (!blog) return;

  const backdrop = document.getElementById('blog-modal-backdrop');
  const coverImg = document.getElementById('modal-article-cover');
  const categoryText = document.getElementById('modal-article-category-text');
  const title = document.getElementById('modal-article-title');
  const author = document.getElementById('modal-article-author');
  const date = document.getElementById('modal-article-date');
  const readTime = document.getElementById('modal-article-readtime');
  const prose = document.getElementById('modal-article-prose');
  const scrollContainer = document.getElementById('blog-modal-scroll');

  // Populate data
  if (blog.coverImage) {
    coverImg.src = fixAssetUrl(blog.coverImage);
    coverImg.alt = blog.title;
    coverImg.style.display = 'block';
  } else {
    coverImg.style.display = 'none';
  }

  categoryText.textContent = blog.category || 'Research Notes';
  title.textContent = blog.title;
  author.textContent = authorName;
  date.textContent = blog.date || 'Recent';
  readTime.textContent = blog.readTime || '5 min read';

  // Format and render prose body
  prose.innerHTML = renderMarkdownToHtml(blog.content || blog.excerpt || '');

  // Reset scroll to top
  if (scrollContainer) scrollContainer.scrollTop = 0;

  // Show modal
  backdrop.classList.add('active');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Update URL hash for sharing/back button
  history.replaceState(null, '', `#dispatch-${blog.id}`);
};

window.closeBlogModal = function () {
  const backdrop = document.getElementById('blog-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('active');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Clean URL hash without reload
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
  }
};

function checkUrlHash() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#dispatch-')) {
    const id = hash.replace('#dispatch-', '');
    openBlogModal(id);
  } else {
    closeBlogModal();
  }
}
