// Admin Console Logic - Elena Vance Portfolio
let globalData = null;

document.addEventListener('DOMContentLoaded', async () => {
  await verifySession();
  initTabs();
  initLogout();
  await loadAdminData();
  initProfileHandlers();
  initPillarHandlers();
  initTrajectoryHandlers();
  initToolingHandlers();
  initMediaHandlers();
  initBlogHandlers();
  initInquiriesHandlers();
  initSettingsHandlers();
});

// Verify active session
async function verifySession() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (!data.authenticated) {
      window.location.href = 'login.html';
    } else {
      const userDisplay = document.getElementById('admin-user-display');
      if (userDisplay && data.username) userDisplay.textContent = data.username;
    }
  } catch (err) {
    window.location.href = 'login.html';
  }
}

// Tab navigation
function initTabs() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const panels = document.querySelectorAll('.tab-panel');
  const topbarTitle = document.getElementById('topbar-title');

  const titles = {
    'tab-profile': 'Profile & Hero Information',
    'tab-pillars': 'Research Focus Pillars',
    'tab-trajectory': 'Academic Trajectory & Milestones',
    'tab-tooling': 'Methodological Arsenal & Instrumentation',
    'tab-gallery': 'Microscopy & Bioimaging Media Gallery',
    'tab-blog': 'Research Blog & Dispatches Management',
    'tab-inquiries': 'Inquiries & Collaboration Messages',
    'tab-settings': 'Laboratory Telemetry & Password Settings',
  };

  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      navItems.forEach((b) => b.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetTab);
      if (targetPanel) targetPanel.classList.add('active');

      if (targetTab === 'tab-inquiries') {
        loadInquiries(1);
      }

      if (topbarTitle && titles[targetTab]) {
        topbarTitle.textContent = titles[targetTab];
      }
    });
  });
}

// Log out
function initLogout() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    window.location.href = 'login.html';
  });
}

// Load entire portfolio content into admin state
async function loadAdminData() {
  try {
    const res = await fetch('/api/content');
    if (!res.ok) throw new Error('Failed to fetch data');
    globalData = await res.json();

    populateProfileForm(globalData.profile);
    populatePillarsList(globalData.pillars);
    populateTrajectoryList(globalData.trajectory);
    populateToolingSection(globalData.tooling);
    populateMediaGallery(globalData.gallery);
    populateBlogList(globalData.blogs);
    populateSettingsForm(globalData.contact);
    await loadInquiries(currentInqPage);
  } catch (err) {
    showToast('Failed to load portfolio content', 'error');
    console.error(err);
  }
}

// Toast notification
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined">${type === 'error' ? 'error' : 'check_circle'}</span>
    <span>${escapeHtml(msg)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// -------------------------------------------------------------
// 1. Profile & Avatar Handlers
// -------------------------------------------------------------
function populateProfileForm(profile) {
  if (!profile) return;
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setVal('prof-name', profile.name);
  setVal('prof-title', profile.title);
  setVal('prof-badge', profile.badge || 'Personal Introduction');
  setVal('prof-tagline', profile.tagline);
  setVal('prof-avatar-caption', profile.avatarCaption || '');

  if (Array.isArray(profile.bio)) {
    setVal('prof-bio-1', profile.bio[0] || '');
    setVal('prof-bio-2', profile.bio[1] || '');
  }

  if (profile.links) {
    setVal('prof-linkedin', profile.links.linkedin || '');
    setVal('prof-scholar', profile.links.scholar || '');
    setVal('prof-orcid', profile.links.orcid || '');
  }

  const preview = document.getElementById('admin-avatar-preview');
  if (preview && profile.avatar) {
    preview.src = profile.avatar;
  }
}

function initProfileHandlers() {
  const form = document.getElementById('form-profile');
  const uploadTrigger = document.getElementById('avatar-upload-trigger');
  const fileInput = document.getElementById('avatar-file-input');
  const statusMsg = document.getElementById('avatar-status-msg');
  const preview = document.getElementById('admin-avatar-preview');

  // Trigger file input
  if (uploadTrigger && fileInput) {
    uploadTrigger.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('profileImage', file);

      statusMsg.textContent = 'Uploading portrait...';
      try {
        const res = await fetch('/api/content/profile-image', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success) {
          preview.src = data.avatarUrl;
          statusMsg.textContent = 'Portrait updated successfully!';
          showToast('Portrait updated successfully');
        } else {
          statusMsg.textContent = data.error || 'Upload failed';
          showToast(data.error || 'Portrait upload failed', 'error');
        }
      } catch (err) {
        statusMsg.textContent = 'Upload error';
        showToast('Network error during upload', 'error');
      }
    });
  }

  // Submit profile changes
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('prof-name').value.trim(),
        title: document.getElementById('prof-title').value.trim(),
        badge: document.getElementById('prof-badge').value.trim(),
        tagline: document.getElementById('prof-tagline').value.trim(),
        avatarCaption: document.getElementById('prof-avatar-caption').value.trim(),
        bio: [
          document.getElementById('prof-bio-1').value.trim(),
          document.getElementById('prof-bio-2').value.trim(),
        ].filter(Boolean),
        links: {
          linkedin: document.getElementById('prof-linkedin').value.trim(),
          scholar: document.getElementById('prof-scholar').value.trim(),
          orcid: document.getElementById('prof-orcid').value.trim(),
        },
      };

      try {
        const res = await fetch('/api/content/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Profile information saved');
        } else {
          showToast(data.error || 'Save failed', 'error');
        }
      } catch (err) {
        showToast('Error saving profile', 'error');
      }
    });
  }
}

// -------------------------------------------------------------
// 2. Research Pillars CRUD
// -------------------------------------------------------------
function populatePillarsList(pillars) {
  const container = document.getElementById('admin-pillars-list');
  if (!container || !Array.isArray(pillars)) return;

  if (pillars.length === 0) {
    container.innerHTML = '<p style="color: var(--on-surface-variant); padding: 1rem 0;">No pillars defined.</p>';
    return;
  }

  container.innerHTML = pillars
    .map(
      (pillar) => `
    <div class="item-card-row" data-id="${pillar.id}">
      <div class="item-info">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <span class="gallery-pill">${escapeHtml(pillar.number || '01')}</span>
          <strong style="color: var(--on-surface); font-size: 0.95rem;">${escapeHtml(pillar.title)}</strong>
          <span style="font-size: 0.75rem; color: var(--on-surface-muted);">(${escapeHtml(pillar.tag || '')})</span>
        </div>
        <p style="font-size: 0.8125rem; color: var(--on-surface-variant); line-height: 1.4;">${escapeHtml(pillar.description)}</p>
      </div>
      <div class="item-actions">
        <button type="button" class="action-btn" onclick="editPillar('${pillar.id}')">
          <span class="material-symbols-outlined" style="font-size: 1rem;">edit</span>
          <span>Edit</span>
        </button>
        <button type="button" class="action-btn delete" onclick="deletePillar('${pillar.id}')">
          <span class="material-symbols-outlined" style="font-size: 1rem;">delete</span>
          <span>Delete</span>
        </button>
      </div>
    </div>
  `
    )
    .join('');
}

function initPillarHandlers() {
  const btnAdd = document.getElementById('btn-add-pillar');
  const form = document.getElementById('form-pillar-modal');

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      document.getElementById('modal-pillar-title').textContent = 'Add Research Pillar';
      document.getElementById('modal-pillar-id').value = '';
      document.getElementById('pillar-modal-num').value = `0${((globalData?.pillars?.length || 0) + 1)}`;
      document.getElementById('pillar-modal-icon').value = 'insights';
      document.getElementById('pillar-modal-heading').value = '';
      document.getElementById('pillar-modal-desc').value = '';
      document.getElementById('pillar-modal-tag').value = 'Primary Focus';
      document.getElementById('pillar-modal-theme').value = 'primary';
      document.getElementById('modal-pillar').classList.add('active');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('modal-pillar-id').value;
      const payload = {
        number: document.getElementById('pillar-modal-num').value.trim(),
        icon: document.getElementById('pillar-modal-icon').value.trim(),
        title: document.getElementById('pillar-modal-heading').value.trim(),
        description: document.getElementById('pillar-modal-desc').value.trim(),
        tag: document.getElementById('pillar-modal-tag').value.trim(),
        theme: document.getElementById('pillar-modal-theme').value,
      };

      try {
        const url = id ? `/api/content/pillars/${id}` : '/api/content/pillars';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(id ? 'Pillar updated' : 'New pillar created');
          closePillarModal();
          await loadAdminData();
        } else {
          showToast(data.error || 'Failed to save pillar', 'error');
        }
      } catch (err) {
        showToast('Error saving pillar', 'error');
      }
    });
  }
}

window.closePillarModal = function () {
  const modal = document.getElementById('modal-pillar');
  if (modal) modal.classList.remove('active');
};

window.editPillar = function (id) {
  const pillar = globalData?.pillars?.find((p) => p.id === id);
  if (!pillar) return;

  document.getElementById('modal-pillar-title').textContent = 'Edit Research Pillar';
  document.getElementById('modal-pillar-id').value = pillar.id;
  document.getElementById('pillar-modal-num').value = pillar.number || '';
  document.getElementById('pillar-modal-icon').value = pillar.icon || '';
  document.getElementById('pillar-modal-heading').value = pillar.title || '';
  document.getElementById('pillar-modal-desc').value = pillar.description || '';
  document.getElementById('pillar-modal-tag').value = pillar.tag || '';
  document.getElementById('pillar-modal-theme').value = pillar.theme || 'primary';

  document.getElementById('modal-pillar').classList.add('active');
};

window.deletePillar = async function (id) {
  if (!confirm('Are you sure you want to remove this research pillar?')) return;
  try {
    const res = await fetch(`/api/content/pillars/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Pillar removed');
      await loadAdminData();
    } else {
      showToast(data.error || 'Delete failed', 'error');
    }
  } catch (err) {
    showToast('Error deleting pillar', 'error');
  }
};

// -------------------------------------------------------------
// 3. Academic Trajectory CRUD
// -------------------------------------------------------------
function populateTrajectoryList(trajectory) {
  const container = document.getElementById('admin-trajectory-list');
  if (!container || !Array.isArray(trajectory)) return;

  if (trajectory.length === 0) {
    container.innerHTML = '<p style="color: var(--on-surface-variant); padding: 1rem 0;">No milestones recorded.</p>';
    return;
  }

  container.innerHTML = trajectory
    .map(
      (item) => `
    <div class="item-card-row" data-id="${item.id}">
      <div class="item-info">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <span class="timeline-period" style="font-size: 0.6875rem;">${escapeHtml(item.period)}</span>
          <strong style="color: var(--on-surface); font-size: 0.95rem;">${escapeHtml(item.degree)}</strong>
          <span class="timeline-badge theme-${item.theme || 'primary'}">${escapeHtml(item.badge || '')}</span>
        </div>
        <p style="font-size: 0.8125rem; font-weight: 500; color: var(--on-surface);">${escapeHtml(item.institution)}</p>
        <p style="font-size: 0.75rem; color: var(--on-surface-variant);">${escapeHtml(item.description || '')}</p>
      </div>
      <div class="item-actions">
        <button type="button" class="action-btn" onclick="editTrajectory('${item.id}')">
          <span class="material-symbols-outlined" style="font-size: 1rem;">edit</span>
          <span>Edit</span>
        </button>
        <button type="button" class="action-btn delete" onclick="deleteTrajectory('${item.id}')">
          <span class="material-symbols-outlined" style="font-size: 1rem;">delete</span>
          <span>Delete</span>
        </button>
      </div>
    </div>
  `
    )
    .join('');
}

function initTrajectoryHandlers() {
  const btnAdd = document.getElementById('btn-add-trajectory');
  const form = document.getElementById('form-traj-modal');

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      document.getElementById('modal-traj-title').textContent = 'Add Academic Milestone';
      document.getElementById('modal-traj-id').value = '';
      document.getElementById('traj-modal-badge').value = 'Candidate in Progress';
      document.getElementById('traj-modal-period').value = '2024 – Present';
      document.getElementById('traj-modal-degree').value = '';
      document.getElementById('traj-modal-inst').value = '';
      document.getElementById('traj-modal-desc').value = '';
      document.getElementById('traj-modal-theme').value = 'primary';
      document.getElementById('modal-trajectory').classList.add('active');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('modal-traj-id').value;
      const payload = {
        badge: document.getElementById('traj-modal-badge').value.trim(),
        period: document.getElementById('traj-modal-period').value.trim(),
        degree: document.getElementById('traj-modal-degree').value.trim(),
        institution: document.getElementById('traj-modal-inst').value.trim(),
        description: document.getElementById('traj-modal-desc').value.trim(),
        theme: document.getElementById('traj-modal-theme').value,
      };

      try {
        const url = id ? `/api/content/trajectory/${id}` : '/api/content/trajectory';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(id ? 'Milestone updated' : 'New milestone added');
          closeTrajectoryModal();
          await loadAdminData();
        } else {
          showToast(data.error || 'Failed to save milestone', 'error');
        }
      } catch (err) {
        showToast('Error saving milestone', 'error');
      }
    });
  }
}

window.closeTrajectoryModal = function () {
  const modal = document.getElementById('modal-trajectory');
  if (modal) modal.classList.remove('active');
};

window.editTrajectory = function (id) {
  const item = globalData?.trajectory?.find((t) => t.id === id);
  if (!item) return;

  document.getElementById('modal-traj-title').textContent = 'Edit Academic Milestone';
  document.getElementById('modal-traj-id').value = item.id;
  document.getElementById('traj-modal-badge').value = item.badge || '';
  document.getElementById('traj-modal-period').value = item.period || '';
  document.getElementById('traj-modal-degree').value = item.degree || '';
  document.getElementById('traj-modal-inst').value = item.institution || '';
  document.getElementById('traj-modal-desc').value = item.description || '';
  document.getElementById('traj-modal-theme').value = item.theme || 'primary';

  document.getElementById('modal-trajectory').classList.add('active');
};

window.deleteTrajectory = async function (id) {
  if (!confirm('Are you sure you want to delete this trajectory entry?')) return;
  try {
    const res = await fetch(`/api/content/trajectory/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Milestone removed');
      await loadAdminData();
    } else {
      showToast(data.error || 'Delete failed', 'error');
    }
  } catch (err) {
    showToast('Error deleting milestone', 'error');
  }
};

// -------------------------------------------------------------
// 4. Tooling & Methodologies
// -------------------------------------------------------------
let toolingCategoriesState = [];

function populateToolingSection(tooling) {
  if (!tooling) return;
  toolingCategoriesState = JSON.parse(JSON.stringify(tooling.categories || []));

  renderToolingCategoriesUI();

  if (tooling.certification) {
    const titleInput = document.getElementById('cert-title-input');
    const descInput = document.getElementById('cert-desc-input');
    if (titleInput) titleInput.value = tooling.certification.title || '';
    if (descInput) descInput.value = tooling.certification.description || '';
  }
}

function renderToolingCategoriesUI() {
  const container = document.getElementById('admin-tooling-categories');
  if (!container) return;

  container.innerHTML = toolingCategoriesState
    .map(
      (cat, catIdx) => `
    <div style="margin-bottom: 1.5rem; padding: 1rem; border: 1px solid var(--outline-variant); border-radius: var(--radius-lg); background-color: var(--surface-container-low);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <strong style="color: var(--on-surface); font-size: 0.875rem;">${escapeHtml(cat.name)}</strong>
      </div>
      <div class="chip-container" style="margin-bottom: 0.75rem;">
        ${(cat.tools || [])
          .map(
            (tool, toolIdx) => `
          <span class="tech-chip" style="display: inline-flex; align-items: center; gap: 0.35rem;">
            <span>${escapeHtml(tool)}</span>
            <button type="button" onclick="removeToolChip(${catIdx}, ${toolIdx})" style="background: none; border: none; cursor: pointer; color: var(--on-surface-variant); line-height: 1; font-size: 0.85rem;">&times;</button>
          </span>
        `
          )
          .join('')}
      </div>
      <div style="display: flex; gap: 0.5rem; max-width: 20rem;">
        <input type="text" id="new-tool-input-${catIdx}" class="form-input" placeholder="Add tool/method..." style="padding: 0.4rem 0.6rem; font-size: 0.8125rem;">
        <button type="button" class="btn btn-secondary" style="padding: 0.4rem 0.75rem; font-size: 0.75rem;" onclick="addToolChip(${catIdx})">Add</button>
      </div>
    </div>
  `
    )
    .join('');
}

window.removeToolChip = function (catIdx, toolIdx) {
  if (!toolingCategoriesState[catIdx]) return;
  toolingCategoriesState[catIdx].tools.splice(toolIdx, 1);
  renderToolingCategoriesUI();
};

window.addToolChip = function (catIdx) {
  const input = document.getElementById(`new-tool-input-${catIdx}`);
  if (!input || !input.value.trim()) return;
  toolingCategoriesState[catIdx].tools.push(input.value.trim());
  input.value = '';
  renderToolingCategoriesUI();
};

function initToolingHandlers() {
  const saveBtn = document.getElementById('btn-save-tooling');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const certification = {
        title: document.getElementById('cert-title-input').value.trim(),
        description: document.getElementById('cert-desc-input').value.trim(),
      };

      try {
        const res = await fetch('/api/content/tooling', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categories: toolingCategoriesState,
            certification,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Methodological arsenal saved');
        } else {
          showToast(data.error || 'Failed to save tooling', 'error');
        }
      } catch (err) {
        showToast('Error saving tooling', 'error');
      }
    });
  }
}

// -------------------------------------------------------------
// 5. Microscopy Media Gallery CRUD
// -------------------------------------------------------------
function populateMediaGallery(gallery) {
  const container = document.getElementById('admin-gallery-grid');
  if (!container || !Array.isArray(gallery)) return;

  if (gallery.length === 0) {
    container.innerHTML = '<p style="color: var(--on-surface-variant); padding: 1.5rem; grid-column: 1 / -1; text-align: center;">No specimens uploaded yet. Click "Upload Specimen" to add your first microscopy media item.</p>';
    return;
  }

  container.innerHTML = gallery
    .map(
      (item) => `
    <div class="admin-media-card" data-id="${item.id}">
      <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.title)}" class="admin-media-thumb">
      <div class="admin-media-body">
        <div style="display: flex; gap: 0.35rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
          <span class="gallery-pill">${escapeHtml(item.technique || 'Bioimaging')}</span>
          ${item.magnification ? `<span class="gallery-pill secondary">${escapeHtml(item.magnification)}</span>` : ''}
          ${item.sourceUrl ? `<span class="gallery-pill" style="color: var(--secondary); border-color: rgba(2, 132, 199, 0.3);"><span class="material-symbols-outlined" style="font-size: 0.75rem;">link</span>Source</span>` : ''}
        </div>
        <strong style="color: var(--on-surface); font-size: 0.95rem; margin-bottom: 0.25rem;">${escapeHtml(item.title)}</strong>
        <p style="font-size: 0.75rem; color: var(--on-surface-variant); line-height: 1.4; margin-bottom: 0.5rem;">${escapeHtml(item.description || '')}</p>
        <div class="admin-media-actions">
          <button type="button" class="action-btn" onclick="editMedia('${item.id}')">
            <span class="material-symbols-outlined" style="font-size: 0.95rem;">edit</span>
            <span>Edit</span>
          </button>
          <button type="button" class="action-btn delete" onclick="deleteMedia('${item.id}')">
            <span class="material-symbols-outlined" style="font-size: 0.95rem;">delete</span>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

function initMediaHandlers() {
  const btnAdd = document.getElementById('btn-add-media');
  const form = document.getElementById('form-media-modal');
  const fileInput = document.getElementById('media-file-input');
  const previewWrap = document.getElementById('media-file-preview-wrap');
  const previewImg = document.getElementById('media-file-preview');

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          previewWrap.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        previewWrap.style.display = 'none';
      }
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      document.getElementById('modal-media-title').textContent = 'Upload Microscopy Specimen';
      document.getElementById('modal-media-id').value = '';
      document.getElementById('btn-media-submit').textContent = 'Upload Specimen';
      document.getElementById('media-upload-container').style.display = 'block';
      document.getElementById('media-file-input').required = true;
      document.getElementById('media-file-input').value = '';
      previewWrap.style.display = 'none';

      document.getElementById('media-modal-title').value = '';
      document.getElementById('media-modal-tech').value = 'STED Super-Resolution';
      document.getElementById('media-modal-mag').value = '100x Oil / 500nm scale';
      document.getElementById('media-modal-stain').value = 'Fluorescence';
      document.getElementById('media-modal-desc').value = '';
      document.getElementById('media-modal-source').value = '';

      document.getElementById('modal-media').classList.add('active');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('modal-media-id').value;
      const submitBtn = document.getElementById('btn-media-submit');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';

      if (!id) {
        // Create / Upload new media with file
        const file = fileInput.files[0];
        if (!file) {
          showToast('Please select an image file', 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Upload Specimen';
          return;
        }

        const formData = new FormData();
        formData.append('mediaImage', file);
        formData.append('title', document.getElementById('media-modal-title').value.trim());
        formData.append('technique', document.getElementById('media-modal-tech').value.trim());
        formData.append('magnification', document.getElementById('media-modal-mag').value.trim());
        formData.append('stain', document.getElementById('media-modal-stain').value.trim());
        formData.append('description', document.getElementById('media-modal-desc').value.trim());
        formData.append('sourceUrl', document.getElementById('media-modal-source').value.trim());

        try {
          const res = await fetch('/api/content/media', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast('Microscopy specimen uploaded');
            closeMediaModal();
            await loadAdminData();
          } else {
            showToast(data.error || 'Upload failed', 'error');
          }
        } catch (err) {
          showToast('Error uploading media', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Upload Specimen';
        }
      } else {
        // Update existing media metadata
        const payload = {
          title: document.getElementById('media-modal-title').value.trim(),
          technique: document.getElementById('media-modal-tech').value.trim(),
          magnification: document.getElementById('media-modal-mag').value.trim(),
          stain: document.getElementById('media-modal-stain').value.trim(),
          description: document.getElementById('media-modal-desc').value.trim(),
          sourceUrl: document.getElementById('media-modal-source').value.trim(),
        };

        try {
          const res = await fetch(`/api/content/media/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast('Specimen metadata updated');
            closeMediaModal();
            await loadAdminData();
          } else {
            showToast(data.error || 'Update failed', 'error');
          }
        } catch (err) {
          showToast('Error updating specimen', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Specimen';
        }
      }
    });
  }
}

window.closeMediaModal = function () {
  const modal = document.getElementById('modal-media');
  if (modal) modal.classList.remove('active');
};

window.editMedia = function (id) {
  const item = globalData?.gallery?.find((m) => m.id === id);
  if (!item) return;

  document.getElementById('modal-media-title').textContent = 'Edit Specimen Metadata';
  document.getElementById('modal-media-id').value = item.id;
  document.getElementById('btn-media-submit').textContent = 'Save Specimen';

  // For editing metadata, file upload is optional / hidden
  document.getElementById('media-upload-container').style.display = 'none';
  document.getElementById('media-file-input').required = false;

  document.getElementById('media-modal-title').value = item.title || '';
  document.getElementById('media-modal-tech').value = item.technique || '';
  document.getElementById('media-modal-mag').value = item.magnification || '';
  document.getElementById('media-modal-stain').value = item.stain || '';
  document.getElementById('media-modal-desc').value = item.description || '';
  document.getElementById('media-modal-source').value = item.sourceUrl || '';

  document.getElementById('modal-media').classList.add('active');
};

window.deleteMedia = async function (id) {
  if (!confirm('Are you sure you want to permanently delete this microscopy specimen?')) return;
  try {
    const res = await fetch(`/api/content/media/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Specimen deleted');
      await loadAdminData();
    } else {
      showToast(data.error || 'Delete failed', 'error');
    }
  } catch (err) {
    showToast('Error deleting specimen', 'error');
  }
};

// -------------------------------------------------------------
// 6. Settings & Contact Handlers
// -------------------------------------------------------------
function populateSettingsForm(contact) {
  if (!contact) return;
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setVal('contact-lab-name', contact.labName);
  setVal('contact-email', contact.email);
  setVal('contact-department', contact.department);
  setVal('contact-office-loc', contact.office);
  setVal('contact-mission', contact.mission);
  setVal('contact-copyright-text', contact.copyright);
}

function initSettingsHandlers() {
  const formContact = document.getElementById('form-contact');
  const formPwd = document.getElementById('form-password');

  if (formContact) {
    formContact.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        labName: document.getElementById('contact-lab-name').value.trim(),
        email: document.getElementById('contact-email').value.trim(),
        department: document.getElementById('contact-department').value.trim(),
        office: document.getElementById('contact-office-loc').value.trim(),
        mission: document.getElementById('contact-mission').value.trim(),
        copyright: document.getElementById('contact-copyright-text').value.trim(),
      };

      try {
        const res = await fetch('/api/content/contact', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Laboratory affiliation and contact details saved');
        } else {
          showToast(data.error || 'Save failed', 'error');
        }
      } catch (err) {
        showToast('Error saving contact settings', 'error');
      }
    });
  }

  if (formPwd) {
    formPwd.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('pwd-current').value;
      const newPassword = document.getElementById('pwd-new').value;

      try {
        const res = await fetch('/api/auth/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Password updated successfully');
          formPwd.reset();
        } else {
          showToast(data.error || 'Password update failed', 'error');
        }
      } catch (err) {
        showToast('Error updating password', 'error');
      }
    });
  }
}

// -------------------------------------------------------------
// 6. Research Blog CRUD Handlers
// -------------------------------------------------------------
function populateBlogList(blogs) {
  const container = document.getElementById('admin-blog-list');
  if (!container || !Array.isArray(blogs)) return;

  if (blogs.length === 0) {
    container.innerHTML = '<p style="color: var(--on-surface-variant); padding: 1.5rem; text-align: center;">No articles published yet. Click "New Article" to write your first research dispatch.</p>';
    return;
  }

  container.innerHTML = blogs
    .map(
      (blog) => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background: var(--surface-container-low); border: 1px solid var(--outline-variant); border-radius: var(--radius-lg); gap: 1rem; flex-wrap: wrap;">
      <div style="display: flex; gap: 1rem; align-items: center; flex: 1; min-width: 15rem;">
        <img src="${escapeHtml(blog.coverImage || '/uploads/dendritic_spines_sted.jpg')}" alt="${escapeHtml(blog.title)}" style="width: 4.5rem; height: 3.25rem; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--outline-variant); flex-shrink: 0;">
        <div>
          <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem; flex-wrap: wrap;">
            <span class="gallery-pill" style="font-size: 0.6875rem;">${escapeHtml(blog.category || 'General')}</span>
            <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--on-surface-muted);">${escapeHtml(blog.date || '')}</span>
            <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--on-surface-muted);">• ${escapeHtml(blog.readTime || '')}</span>
          </div>
          <strong style="color: var(--on-surface); font-size: 0.95rem;">${escapeHtml(blog.title)}</strong>
          <p style="font-size: 0.8125rem; color: var(--on-surface-variant); margin-top: 0.25rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(blog.excerpt || '')}</p>
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <a href="/blog#dispatch-${escapeHtml(blog.id)}" target="_blank" class="action-btn" title="Preview Article">
          <span class="material-symbols-outlined" style="font-size: 0.95rem;">visibility</span>
          <span>Preview</span>
        </a>
        <button type="button" class="action-btn" onclick="editBlog('${blog.id}')" title="Edit Article">
          <span class="material-symbols-outlined" style="font-size: 0.95rem;">edit</span>
          <span>Edit</span>
        </button>
        <button type="button" class="action-btn delete" onclick="deleteBlog('${blog.id}')" title="Delete Article">
          <span class="material-symbols-outlined" style="font-size: 0.95rem;">delete</span>
          <span>Delete</span>
        </button>
      </div>
    </div>
  `
    )
    .join('');
}

function initBlogHandlers() {
  const btnAdd = document.getElementById('btn-add-blog');
  const form = document.getElementById('form-blog-modal');
  const fileInput = document.getElementById('blog-file-input');
  const previewWrap = document.getElementById('blog-cover-preview-wrap');
  const previewImg = document.getElementById('blog-cover-preview');

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          previewWrap.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        previewWrap.style.display = 'none';
      }
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      document.getElementById('modal-blog-title').textContent = 'Write New Article';
      document.getElementById('modal-blog-id').value = '';
      document.getElementById('btn-blog-submit').textContent = 'Publish Article';
      document.getElementById('blog-file-input').value = '';
      previewWrap.style.display = 'none';

      document.getElementById('blog-modal-title').value = '';
      document.getElementById('blog-modal-category').value = 'Nanoscopy Protocols';
      document.getElementById('blog-modal-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('blog-modal-readtime').value = '5 min read';
      document.getElementById('blog-modal-imageurl').value = '';
      document.getElementById('blog-modal-excerpt').value = '';
      document.getElementById('blog-modal-content').value = '';

      document.getElementById('modal-blog').classList.add('active');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('modal-blog-id').value;
      const submitBtn = document.getElementById('btn-blog-submit');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      const file = fileInput.files[0];
      const formData = new FormData();
      if (file) formData.append('coverImage', file);
      formData.append('title', document.getElementById('blog-modal-title').value.trim());
      formData.append('category', document.getElementById('blog-modal-category').value.trim());
      formData.append('date', document.getElementById('blog-modal-date').value.trim());
      formData.append('readTime', document.getElementById('blog-modal-readtime').value.trim());
      formData.append('imageUrl', document.getElementById('blog-modal-imageurl').value.trim());
      formData.append('excerpt', document.getElementById('blog-modal-excerpt').value.trim());
      formData.append('content', document.getElementById('blog-modal-content').value.trim());

      try {
        const url = id ? `/api/content/blogs/${id}` : '/api/content/blogs';
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(id ? 'Article updated successfully' : 'Article published successfully');
          closeBlogAdminModal();
          await loadAdminData();
        } else {
          showToast(data.error || 'Failed to save article', 'error');
        }
      } catch (err) {
        showToast('Error saving article', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = id ? 'Update Article' : 'Publish Article';
      }
    });
  }
}

window.closeBlogAdminModal = function () {
  const modal = document.getElementById('modal-blog');
  if (modal) modal.classList.remove('active');
};

window.editBlog = function (id) {
  const item = globalData?.blogs?.find((b) => b.id === id);
  if (!item) return;

  document.getElementById('modal-blog-title').textContent = 'Edit Article';
  document.getElementById('modal-blog-id').value = item.id;
  document.getElementById('btn-blog-submit').textContent = 'Update Article';

  document.getElementById('blog-file-input').value = '';
  const previewWrap = document.getElementById('blog-cover-preview-wrap');
  const previewImg = document.getElementById('blog-cover-preview');

  if (item.coverImage) {
    previewImg.src = item.coverImage;
    previewWrap.style.display = 'block';
  } else {
    previewWrap.style.display = 'none';
  }

  document.getElementById('blog-modal-title').value = item.title || '';
  document.getElementById('blog-modal-category').value = item.category || '';
  document.getElementById('blog-modal-date').value = item.date || '';
  document.getElementById('blog-modal-readtime').value = item.readTime || '';
  document.getElementById('blog-modal-imageurl').value = item.coverImage || '';
  document.getElementById('blog-modal-excerpt').value = item.excerpt || '';
  document.getElementById('blog-modal-content').value = item.content || '';

  document.getElementById('modal-blog').classList.add('active');
};

window.deleteBlog = async function (id) {
  if (!confirm('Are you sure you want to permanently delete this research article?')) return;
  try {
    const res = await fetch(`/api/content/blogs/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Article deleted');
      await loadAdminData();
    } else {
      showToast(data.error || 'Delete failed', 'error');
    }
  } catch (err) {
    showToast('Error deleting article', 'error');
  }
};

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   INQUIRIES & COLLABORATION MESSAGES WITH PAGINATION
   ========================================================================== */

let currentInqPage = 1;
const inqLimit = 5;

function initInquiriesHandlers() {
  const refreshBtn = document.getElementById('inq-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadInquiries(currentInqPage));
  }
}

async function loadInquiries(page = 1) {
  currentInqPage = page;
  const container = document.getElementById('inq-list-container');
  const paginationBar = document.getElementById('inq-pagination-bar');
  const pageNumEl = document.getElementById('inq-page-num');
  const totalPagesEl = document.getElementById('inq-total-pages');
  const totalCountEl = document.getElementById('inq-total-count');
  const prevBtn = document.getElementById('inq-prev-btn');
  const nextBtn = document.getElementById('inq-next-btn');
  const sidebarBadge = document.getElementById('sidebar-inquiry-badge');

  try {
    const res = await fetch(`/api/contact/inquiries?page=${page}&limit=${inqLimit}`);
    if (!res.ok) throw new Error('Failed to load inquiries');
    const data = await res.json();

    // Update unread badge in sidebar
    if (sidebarBadge) {
      if (data.unreadCount > 0) {
        sidebarBadge.textContent = data.unreadCount;
        sidebarBadge.style.display = 'inline-block';
      } else {
        sidebarBadge.style.display = 'none';
      }
    }

    if (!container) return;

    if (!data.inquiries || data.inquiries.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--on-surface-variant);">
          <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--outline); margin-bottom: 0.5rem;">drafts</span>
          <p style="font-size: 1rem; font-weight: 500;">No inquiries received yet.</p>
          <p style="font-size: 0.8125rem; color: var(--on-surface-muted);">Submissions from your public Contact &amp; Collab page will appear here.</p>
        </div>
      `;
      if (paginationBar) paginationBar.style.display = 'none';
      return;
    }

    container.innerHTML = data.inquiries.map((inq) => {
      const dateFormatted = new Date(inq.date || inq.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="inq-card ${inq.read ? 'read' : 'unread'}" id="inq-${inq.id}">
          <div class="inq-header">
            <div>
              <div class="inq-sender-name">${escapeHtml(inq.name)}</div>
              <a href="mailto:${escapeHtml(inq.email)}?subject=Re: ${encodeURIComponent(inq.subject || 'Research Collaboration')}" class="inq-email-link">
                <span class="material-symbols-outlined" style="font-size: 0.95rem;">mail</span>
                <span>${escapeHtml(inq.email)}</span>
              </a>
            </div>
            <div class="inq-meta">
              <span class="inq-subject-badge">${escapeHtml(inq.subject || 'General Inquiry')}</span>
              <span>${dateFormatted}</span>
              <span class="admin-badge" style="background: ${inq.read ? '#f1f5f9' : 'var(--primary-light)'}; color: ${inq.read ? '#64748b' : 'var(--primary-deep)'};">
                ${inq.read ? 'Read' : '● New'}
              </span>
            </div>
          </div>

          <div class="inq-message-body">${escapeHtml(inq.message)}</div>

          <div class="inq-actions">
            <button type="button" class="action-btn" onclick="toggleInquiryRead('${inq.id}', ${!inq.read})">
              <span class="material-symbols-outlined">${inq.read ? 'mark_email_unread' : 'mark_email_read'}</span>
              <span>${inq.read ? 'Mark Unread' : 'Mark as Read'}</span>
            </button>
            <a href="mailto:${escapeHtml(inq.email)}?subject=Re: ${encodeURIComponent(inq.subject || 'Research Collaboration')}" class="action-btn" style="text-decoration: none;">
              <span class="material-symbols-outlined">reply</span>
              <span>Reply via Email</span>
            </a>
            <button type="button" class="action-btn delete" onclick="deleteInquiry('${inq.id}')">
              <span class="material-symbols-outlined">delete</span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Update Pagination Bar
    if (paginationBar) {
      paginationBar.style.display = data.total > 0 ? 'flex' : 'none';
      if (pageNumEl) pageNumEl.textContent = data.page;
      if (totalPagesEl) totalPagesEl.textContent = data.totalPages;
      if (totalCountEl) totalCountEl.textContent = data.total;

      if (prevBtn) {
        prevBtn.disabled = data.page <= 1;
        prevBtn.onclick = () => loadInquiries(data.page - 1);
      }
      if (nextBtn) {
        nextBtn.disabled = data.page >= data.totalPages;
        nextBtn.onclick = () => loadInquiries(data.page + 1);
      }
    }
  } catch (err) {
    if (container) {
      container.innerHTML = `<p style="color: #dc2626; padding: 2rem; text-align: center;">Failed to load inquiries: ${escapeHtml(err.message)}</p>`;
    }
  }
}

window.toggleInquiryRead = async function (id, markRead) {
  try {
    const res = await fetch(`/api/contact/inquiries/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: markRead })
    });
    if (res.ok) {
      showToast(markRead ? 'Inquiry marked as read' : 'Inquiry marked as unread');
      loadInquiries(currentInqPage);
    }
  } catch (e) {
    showToast('Failed to update inquiry status', 'error');
  }
};

window.deleteInquiry = async function (id) {
  if (!confirm('Are you sure you want to delete this inquiry?')) return;
  try {
    const res = await fetch(`/api/contact/inquiries/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Inquiry deleted');
      loadInquiries(currentInqPage);
    } else {
      showToast(data.error || 'Failed to delete inquiry', 'error');
    }
  } catch (e) {
    showToast('Failed to delete inquiry', 'error');
  }
};

