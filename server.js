require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATA_FILE = path.join(__dirname, 'data', 'portfolio.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory active session tokens (simple, fast, clean)
const activeSessions = new Map();

// Helper to read database
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading portfolio data:', err);
    return null;
  }
}

// Helper to write database atomically
function writeData(data) {
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error('Error writing portfolio data:', err);
    return false;
  }
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e5)}`;
    cb(null, `${sanitizedBase}_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed'));
  },
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Auth Verification Middleware
function requireAuth(req, res, next) {
  const token = req.cookies.synapse_session;
  if (!token || !activeSessions.has(token)) {
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }
    return res.redirect('/login');
  }
  const sessionData = activeSessions.get(token);
  // Optional 24h expiration check
  if (Date.now() - sessionData.createdAt > 24 * 60 * 60 * 1000) {
    activeSessions.delete(token);
    res.clearCookie('synapse_session');
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Session expired' });
    }
    return res.redirect('/login');
  }
  req.sessionUser = sessionData.username;
  next();
}

// -------------------------------------------------------------
// Route handlers for Pages
// -------------------------------------------------------------

// Home / Portfolio page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Custom Brand Name Logo Image
app.get('/data/name.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'name.png'));
});

// Dedicated /login page
app.get('/login', (req, res) => {
  const token = req.cookies.synapse_session;
  if (token && activeSessions.has(token)) {
    return res.redirect('/admin');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dedicated /gallery page
app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

// Dedicated /blog page
app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

// Dedicated /contact page
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Protected /admin dashboard
app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// -------------------------------------------------------------
// Authentication API
// -------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const data = readData();

  const expectedUsername = process.env.ADMIN_USERNAME || (data && data.admin && data.admin.username) || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || (data && data.admin && data.admin.password) || 'synapse2024';

  if (username === expectedUsername && password === expectedPassword) {
    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, {
      username,
      createdAt: Date.now(),
    });

    res.cookie('synapse_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.json({ success: true, message: 'Logged in successfully', username });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies.synapse_session;
  if (token) {
    activeSessions.delete(token);
  }
  res.clearCookie('synapse_session');
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.synapse_session;
  if (token && activeSessions.has(token)) {
    const session = activeSessions.get(token);
    return res.json({ authenticated: true, username: session.username });
  }
  return res.json({ authenticated: false });
});

app.put('/api/auth/password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  const data = readData();
  const currentExpected = process.env.ADMIN_PASSWORD || (data && data.admin && data.admin.password) || 'synapse2024';

  if (currentPassword !== currentExpected) {
    return res.status(400).json({ error: 'Current password does not match' });
  }

  if (data && data.admin) {
    data.admin.password = newPassword;
    writeData(data);
  }
  res.json({ success: true, message: 'Password updated successfully' });
});

// -------------------------------------------------------------
// Public Content API
// -------------------------------------------------------------

app.get('/api/content', (req, res) => {
  const data = readData();
  if (!data) {
    return res.status(500).json({ error: 'Could not load portfolio data' });
  }
  // Exclude sensitive admin credentials from public output
  const { admin, ...publicData } = data;
  res.json(publicData);
});

// -------------------------------------------------------------
// Protected Admin Content CRUD API
// -------------------------------------------------------------

// 1. Update Profile & Intro
app.put('/api/content/profile', requireAuth, (req, res) => {
  const data = readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  const { name, badge, title, tagline, bio, links, avatar, avatarCaption } = req.body;
  if (name) data.profile.name = name;
  if (badge !== undefined) data.profile.badge = badge;
  if (title) data.profile.title = title;
  if (tagline) data.profile.tagline = tagline;
  if (Array.isArray(bio)) data.profile.bio = bio;
  if (links) data.profile.links = { ...data.profile.links, ...links };
  if (avatar) data.profile.avatar = avatar;
  if (avatarCaption !== undefined) data.profile.avatarCaption = avatarCaption;

  writeData(data);
  res.json({ success: true, profile: data.profile });
});

// 2. Upload Profile Image
app.post('/api/content/profile-image', requireAuth, upload.single('profileImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const data = readData();
  const avatarUrl = `/uploads/${req.file.filename}`;
  data.profile.avatar = avatarUrl;
  writeData(data);
  res.json({ success: true, avatarUrl, filename: req.file.filename });
});

// 3. Research Pillars CRUD
app.post('/api/content/pillars', requireAuth, (req, res) => {
  const data = readData();
  const { number, icon, title, description, tag, theme } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  const newPillar = {
    id: `pillar-${Date.now()}`,
    number: number || `0${(data.pillars.length + 1)}`,
    icon: icon || 'science',
    title,
    description,
    tag: tag || 'Focus Area',
    theme: theme || 'primary',
  };
  data.pillars.push(newPillar);
  writeData(data);
  res.status(201).json({ success: true, pillar: newPillar });
});

app.put('/api/content/pillars/:id', requireAuth, (req, res) => {
  const data = readData();
  const idx = data.pillars.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Pillar not found' });
  }
  data.pillars[idx] = { ...data.pillars[idx], ...req.body, id: req.params.id };
  writeData(data);
  res.json({ success: true, pillar: data.pillars[idx] });
});

app.delete('/api/content/pillars/:id', requireAuth, (req, res) => {
  const data = readData();
  const initialLength = data.pillars.length;
  data.pillars = data.pillars.filter((p) => p.id !== req.params.id);
  if (data.pillars.length === initialLength) {
    return res.status(404).json({ error: 'Pillar not found' });
  }
  writeData(data);
  res.json({ success: true, message: 'Pillar deleted' });
});

// 4. Academic Trajectory CRUD
app.post('/api/content/trajectory', requireAuth, (req, res) => {
  const data = readData();
  const { badge, degree, institution, description, period, theme } = req.body;
  if (!degree || !institution) {
    return res.status(400).json({ error: 'Degree and institution are required' });
  }
  const newTraj = {
    id: `traj-${Date.now()}`,
    badge: badge || 'Milestone',
    degree,
    institution,
    description: description || '',
    period: period || 'Present',
    theme: theme || 'primary',
  };
  data.trajectory.push(newTraj);
  writeData(data);
  res.status(201).json({ success: true, item: newTraj });
});

app.put('/api/content/trajectory/:id', requireAuth, (req, res) => {
  const data = readData();
  const idx = data.trajectory.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Trajectory item not found' });
  }
  data.trajectory[idx] = { ...data.trajectory[idx], ...req.body, id: req.params.id };
  writeData(data);
  res.json({ success: true, item: data.trajectory[idx] });
});

app.delete('/api/content/trajectory/:id', requireAuth, (req, res) => {
  const data = readData();
  const initialLength = data.trajectory.length;
  data.trajectory = data.trajectory.filter((t) => t.id !== req.params.id);
  if (data.trajectory.length === initialLength) {
    return res.status(404).json({ error: 'Item not found' });
  }
  writeData(data);
  res.json({ success: true, message: 'Item deleted' });
});

// 5. Tooling / Arsenal Update
app.put('/api/content/tooling', requireAuth, (req, res) => {
  const data = readData();
  const { categories, certification } = req.body;
  if (categories && Array.isArray(categories)) {
    data.tooling.categories = categories;
  }
  if (certification) {
    data.tooling.certification = certification;
  }
  writeData(data);
  res.json({ success: true, tooling: data.tooling });
});

// 6. Media Gallery CRUD
app.post('/api/content/media', requireAuth, upload.single('mediaImage'), (req, res) => {
  const data = readData();
  if (!req.file) {
    return res.status(400).json({ error: 'Microscopy image file is required' });
  }

  const { title, technique, magnification, stain, description, sourceUrl } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newMedia = {
    id: `media-${Date.now()}`,
    title,
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    technique: technique || 'Bioimaging',
    magnification: magnification || 'High-Power',
    stain: stain || 'Fluorescence',
    description: description || '',
    sourceUrl: (sourceUrl || '').trim(),
    date: new Date().toISOString().split('T')[0],
  };

  data.gallery = data.gallery || [];
  data.gallery.unshift(newMedia); // prepend newest first
  writeData(data);

  res.status(201).json({ success: true, media: newMedia });
});

app.put('/api/content/media/:id', requireAuth, (req, res) => {
  const data = readData();
  const idx = (data.gallery || []).findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Media item not found' });
  }
  const current = data.gallery[idx];
  const { title, technique, magnification, stain, description, sourceUrl } = req.body;
  data.gallery[idx] = {
    ...current,
    title: title !== undefined ? title : current.title,
    technique: technique !== undefined ? technique : current.technique,
    magnification: magnification !== undefined ? magnification : current.magnification,
    stain: stain !== undefined ? stain : current.stain,
    description: description !== undefined ? description : current.description,
    sourceUrl: sourceUrl !== undefined ? sourceUrl.trim() : (current.sourceUrl || ''),
  };
  writeData(data);
  res.json({ success: true, media: data.gallery[idx] });
});

app.delete('/api/content/media/:id', requireAuth, (req, res) => {
  const data = readData();
  const idx = (data.gallery || []).findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Media item not found' });
  }
  const [removed] = data.gallery.splice(idx, 1);
  writeData(data);

  // Clean up uploaded file if it was locally uploaded in /uploads
  if (removed && removed.filename) {
    const filePath = path.join(UPLOADS_DIR, removed.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not remove file from disk:', err.message);
      }
    }
  }

  res.json({ success: true, message: 'Media item deleted' });
});

// 7. Research Blog Dispatches CRUD
app.get('/api/content/blogs', (req, res) => {
  const data = readData();
  res.json({ success: true, blogs: data.blogs || [] });
});

app.get('/api/content/blogs/:id', (req, res) => {
  const data = readData();
  const blog = (data.blogs || []).find((b) => b.id === req.params.id || b.slug === req.params.id);
  if (!blog) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json({ success: true, blog });
});

app.post('/api/content/blogs', requireAuth, upload.single('coverImage'), (req, res) => {
  const data = readData();
  const { title, category, readTime, excerpt, content, date, imageUrl } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Article title is required' });
  }

  let coverImage = (imageUrl || '').trim();
  let filename = '';
  if (req.file) {
    coverImage = `/uploads/${req.file.filename}`;
    filename = req.file.filename;
  }

  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const newBlog = {
    id: `blog-${Date.now()}`,
    title,
    slug: slug || `dispatch-${Date.now()}`,
    category: category || 'Research Notes',
    date: date || new Date().toISOString().split('T')[0],
    readTime: readTime || '5 min read',
    coverImage,
    filename,
    excerpt: excerpt || '',
    content: content || '',
  };

  data.blogs = data.blogs || [];
  data.blogs.unshift(newBlog);
  writeData(data);

  res.status(201).json({ success: true, blog: newBlog });
});

app.put('/api/content/blogs/:id', requireAuth, upload.single('coverImage'), (req, res) => {
  const data = readData();
  const idx = (data.blogs || []).findIndex((b) => b.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const current = data.blogs[idx];
  const { title, category, readTime, excerpt, content, date, imageUrl } = req.body;

  let coverImage = current.coverImage;
  let filename = current.filename || '';

  if (req.file) {
    coverImage = `/uploads/${req.file.filename}`;
    filename = req.file.filename;
    if (current.filename && current.filename !== filename) {
      const oldPath = path.join(UPLOADS_DIR, current.filename);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
    }
  } else if (imageUrl !== undefined && imageUrl.trim() !== '') {
    coverImage = imageUrl.trim();
  }

  data.blogs[idx] = {
    ...current,
    title: title !== undefined ? title : current.title,
    category: category !== undefined ? category : current.category,
    readTime: readTime !== undefined ? readTime : current.readTime,
    excerpt: excerpt !== undefined ? excerpt : current.excerpt,
    content: content !== undefined ? content : current.content,
    date: date !== undefined ? date : current.date,
    coverImage,
    filename,
  };

  writeData(data);
  res.json({ success: true, blog: data.blogs[idx] });
});

app.delete('/api/content/blogs/:id', requireAuth, (req, res) => {
  const data = readData();
  const idx = (data.blogs || []).findIndex((b) => b.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const [removed] = data.blogs.splice(idx, 1);
  writeData(data);

  if (removed && removed.filename) {
    const filePath = path.join(UPLOADS_DIR, removed.filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }

  res.json({ success: true, message: 'Article deleted' });
});

// 8. Contact / Laboratory info
app.put('/api/content/contact', requireAuth, (req, res) => {
  const data = readData();
  data.contact = { ...data.contact, ...req.body };
  writeData(data);
  res.json({ success: true, contact: data.contact });
});

// 9. Contact Inquiries & Collaboration Messages
// Public inquiry submission endpoint
app.post('/api/contact/inquiries', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required fields.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const data = readData();
  if (!data) return res.status(500).json({ error: 'Failed to access database' });

  data.inquiries = data.inquiries || [];
  const newInquiry = {
    id: `inq-${Date.now()}`,
    name: String(name).trim(),
    email: String(email).trim(),
    subject: String(subject || 'General Research Inquiry').trim(),
    message: String(message).trim(),
    date: new Date().toISOString(),
    read: false
  };

  data.inquiries.unshift(newInquiry);
  writeData(data);

  res.status(201).json({
    success: true,
    message: 'Thank you! Your inquiry has been delivered to Kelina Cyril.',
    inquiry: { id: newInquiry.id, date: newInquiry.date }
  });
});

// Admin Inquiries API with Pagination (?page=1&limit=5)
app.get('/api/contact/inquiries', requireAuth, (req, res) => {
  const data = readData();
  const inquiries = data.inquiries || [];
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 5));
  const total = inquiries.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const validPage = Math.min(page, totalPages);
  const startIndex = (validPage - 1) * limit;
  const paginatedItems = inquiries.slice(startIndex, startIndex + limit);

  res.json({
    inquiries: paginatedItems,
    total,
    page: validPage,
    totalPages,
    limit,
    unreadCount: inquiries.filter((i) => !i.read).length
  });
});

// Delete an inquiry
app.delete('/api/contact/inquiries/:id', requireAuth, (req, res) => {
  const data = readData();
  data.inquiries = data.inquiries || [];
  const idx = data.inquiries.findIndex((i) => i.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  data.inquiries.splice(idx, 1);
  writeData(data);
  res.json({ success: true, message: 'Inquiry deleted' });
});

// Mark inquiry as read/unread
app.patch('/api/contact/inquiries/:id/read', requireAuth, (req, res) => {
  const data = readData();
  data.inquiries = data.inquiries || [];
  const inq = data.inquiries.find((i) => i.id === req.params.id);
  if (!inq) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  inq.read = req.body.read !== undefined ? !!req.body.read : true;
  writeData(data);
  res.json({ success: true, inquiry: inq });
});

// Dedicated /404 page route
app.get('/404', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Universal 404 Catch-All Handler for unmatched routes across the project
app.use((req, res) => {
  if (req.xhr || req.path.startsWith('/api/') || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(404).json({
      error: 'Not Found',
      code: 404,
      message: `Synaptic pathway '${req.originalUrl}' does not exist in the connectome.`,
      diagnosis: 'Action potential dropped in synaptic cleft.'
    });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Synaptic Biology Portfolio Server running at http://localhost:${PORT}`);
  console.log(`Public Portfolio: http://localhost:${PORT}/`);
  console.log(`Admin Login:      http://localhost:${PORT}/login`);
  console.log(`Admin Dashboard:  http://localhost:${PORT}/admin`);
});
