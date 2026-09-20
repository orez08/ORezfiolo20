import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PORTFOLIO_DATA } from './src/data/initialData.ts';
import { PortfolioData, InteractionLog, ContactMessage, AdminUser } from './src/types.ts';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface DatabaseSchema {
  portfolio: PortfolioData;
  interactions: InteractionLog[];
  messages: ContactMessage[];
  users: Array<AdminUser & { passwordHash: string }>;
}

const DEFAULT_USERS: Array<AdminUser & { passwordHash: string }> = [
  {
    id: 'user-owner',
    email: 'moseseawotimiro2008@gmail.com',
    name: 'Awotimiro Moses Oreoluwa (ORez)',
    role: 'owner',
    passwordHash: 'orez2026!',
  },
  {
    id: 'user-owner-alt',
    email: 'workwithorez@gmail.com',
    name: 'ORez Studio Lead',
    role: 'owner',
    passwordHash: 'orez2026!',
  },
  {
    id: 'user-admin',
    email: 'admin@orez.studio',
    name: 'Studio Manager',
    role: 'admin',
    passwordHash: 'orezadmin',
  },
];

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.portfolio && parsed.interactions && parsed.messages) {
        if (!parsed.portfolio.productionSoftware) {
          parsed.portfolio.productionSoftware = INITIAL_PORTFOLIO_DATA.productionSoftware || [];
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading database file, resetting to initial state:', err);
  }

  const initialDb: DatabaseSchema = {
    portfolio: INITIAL_PORTFOLIO_DATA,
    interactions: [],
    messages: [
      {
        id: 'msg-seed-1',
        timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        name: 'Alexander Sterling',
        email: 'alex@sterlingventures.co',
        projectType: 'Brand Identity',
        message: 'Hello ORez, We are launching a private capital fund and require a rigorous, world-class brand identity system and executive investor deck. Your portfolio work for Kinetix is exactly the caliber we are looking for.',
        budget: '$8,000 - $15,000',
        timeline: 'Within 4 weeks',
        read: false,
      },
    ],
    users: DEFAULT_USERS,
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();
saveDatabase(db);

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static files for uploads
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.passwordHash === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    // Generate simple bearer token
    const token = `orez_${user.id}_${Date.now()}`;

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  });

  // Auth: Verify
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const match = token.match(/^orez_(user-[a-zA-Z0-9-]+)_/);
    if (!match) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = match[1];
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  });

  // Portfolio content: GET (public)
  app.get('/api/portfolio', (req, res) => {
    res.json(db.portfolio);
  });

  // Portfolio content: PUT (admin)
  app.put('/api/portfolio', (req, res) => {
    const updated = req.body as Partial<PortfolioData>;
    if (!updated) {
      return res.status(400).json({ error: 'Payload missing' });
    }

    db.portfolio = {
      ...db.portfolio,
      ...updated,
      hero: { ...db.portfolio.hero, ...(updated.hero || {}) },
      about: { ...db.portfolio.about, ...(updated.about || {}) },
      contact: { ...db.portfolio.contact, ...(updated.contact || {}) },
      settings: { ...db.portfolio.settings, ...(updated.settings || {}) },
    };
    saveDatabase(db);

    res.json({ success: true, portfolio: db.portfolio });
  });

  // Work projects CRUD
  app.get('/api/projects', (req, res) => {
    res.json(db.portfolio.projects);
  });

  app.post('/api/projects', (req, res) => {
    const newProject = req.body;
    if (!newProject.title) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    const project = {
      id: `proj-${Date.now()}`,
      title: newProject.title,
      category: newProject.category || 'Visual Design',
      year: newProject.year || `${new Date().getFullYear()}`,
      client: newProject.client || '',
      role: newProject.role || 'Lead Designer',
      coverImage: newProject.coverImage || 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop',
      gallery: Array.isArray(newProject.gallery) ? newProject.gallery : [],
      description: newProject.description || '',
      metrics: newProject.metrics || '',
      featured: Boolean(newProject.featured),
      published: newProject.published !== false,
      order: typeof newProject.order === 'number' ? newProject.order : db.portfolio.projects.length + 1,
      tags: Array.isArray(newProject.tags) ? newProject.tags : ['Design'],
    };

    db.portfolio.projects.push(project);
    saveDatabase(db);
    res.status(201).json(project);
  });

  app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const index = db.portfolio.projects.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    db.portfolio.projects[index] = {
      ...db.portfolio.projects[index],
      ...req.body,
      id,
    };
    saveDatabase(db);
    res.json(db.portfolio.projects[index]);
  });

  app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    db.portfolio.projects = db.portfolio.projects.filter((p) => p.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Capabilities CRUD
  app.get('/api/capabilities', (req, res) => {
    res.json(db.portfolio.capabilities);
  });

  app.post('/api/capabilities', (req, res) => {
    const newCap = req.body;
    const count = db.portfolio.capabilities.length + 1;
    const cap = {
      id: `cap-${Date.now()}`,
      number: count < 10 ? `0${count}` : `${count}`,
      title: newCap.title || 'New Capability',
      description: newCap.description || '',
      skills: Array.isArray(newCap.skills) ? newCap.skills : [],
      published: newCap.published !== false,
      order: count,
    };
    db.portfolio.capabilities.push(cap);
    saveDatabase(db);
    res.status(201).json(cap);
  });

  app.put('/api/capabilities/:id', (req, res) => {
    const { id } = req.params;
    const index = db.portfolio.capabilities.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Capability not found' });
    }
    db.portfolio.capabilities[index] = {
      ...db.portfolio.capabilities[index],
      ...req.body,
      id,
    };
    saveDatabase(db);
    res.json(db.portfolio.capabilities[index]);
  });

  app.delete('/api/capabilities/:id', (req, res) => {
    const { id } = req.params;
    db.portfolio.capabilities = db.portfolio.capabilities.filter((c) => c.id !== id);
    // renumber
    db.portfolio.capabilities.forEach((c, idx) => {
      c.order = idx + 1;
      c.number = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
    });
    saveDatabase(db);
    res.json({ success: true, capabilities: db.portfolio.capabilities });
  });

  // Production Software & Toolkit CRUD
  app.get('/api/software', (req, res) => {
    res.json(db.portfolio.productionSoftware || []);
  });

  app.post('/api/software', (req, res) => {
    const item = req.body;
    if (!db.portfolio.productionSoftware) {
      db.portfolio.productionSoftware = [];
    }
    const count = db.portfolio.productionSoftware.length + 1;
    const tool = {
      id: `sw-${Date.now()}`,
      name: item.name || 'New Software Tool',
      level: item.level || 'Mastery',
      category: item.category || 'Visual Design',
      published: item.published !== false,
      order: typeof item.order === 'number' ? item.order : count,
    };
    db.portfolio.productionSoftware.push(tool);
    saveDatabase(db);
    res.status(201).json(tool);
  });

  app.put('/api/software/:id', (req, res) => {
    const { id } = req.params;
    if (!db.portfolio.productionSoftware) {
      db.portfolio.productionSoftware = [];
    }
    const index = db.portfolio.productionSoftware.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Software tool not found' });
    }
    db.portfolio.productionSoftware[index] = {
      ...db.portfolio.productionSoftware[index],
      ...req.body,
      id,
    };
    saveDatabase(db);
    res.json(db.portfolio.productionSoftware[index]);
  });

  app.delete('/api/software/:id', (req, res) => {
    const { id } = req.params;
    if (db.portfolio.productionSoftware) {
      db.portfolio.productionSoftware = db.portfolio.productionSoftware.filter((s) => s.id !== id);
      saveDatabase(db);
    }
    res.json({ success: true });
  });

  // Testimonials CRUD
  app.get('/api/testimonials', (req, res) => {
    res.json(db.portfolio.testimonials);
  });

  app.post('/api/testimonials', (req, res) => {
    const item = req.body;
    const t = {
      id: `test-${Date.now()}`,
      authorName: item.authorName || 'Client Name',
      authorRole: item.authorRole || 'Founder',
      company: item.company || 'Company',
      feedbackText: item.feedbackText || '',
      screenshotUrl: item.screenshotUrl || '',
      avatarUrl: item.avatarUrl || '',
      published: item.published !== false,
      featured: Boolean(item.featured),
      order: db.portfolio.testimonials.length + 1,
    };
    db.portfolio.testimonials.push(t);
    saveDatabase(db);
    res.status(201).json(t);
  });

  app.put('/api/testimonials/:id', (req, res) => {
    const { id } = req.params;
    const index = db.portfolio.testimonials.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    db.portfolio.testimonials[index] = {
      ...db.portfolio.testimonials[index],
      ...req.body,
      id,
    };
    saveDatabase(db);
    res.json(db.portfolio.testimonials[index]);
  });

  app.delete('/api/testimonials/:id', (req, res) => {
    const { id } = req.params;
    db.portfolio.testimonials = db.portfolio.testimonials.filter((t) => t.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Contact messages
  app.post('/api/messages', (req, res) => {
    const { name, email, projectType, message, budget, timeline, visitorId } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      name: String(name).trim(),
      email: String(email).trim(),
      projectType: projectType || 'Visual Design / Brand Identity',
      message: String(message).trim(),
      budget: budget || '',
      timeline: timeline || '',
      read: false,
      visitorId: visitorId || '',
    };

    db.messages.unshift(newMsg);

    // Also link visitor log if visitorId is provided
    if (visitorId) {
      db.interactions.forEach((log) => {
        if (log.visitorId === visitorId) {
          log.visitorName = newMsg.name;
          log.visitorEmail = newMsg.email;
        }
      });

      // Log form submission interaction
      db.interactions.unshift({
        id: `int-${Date.now()}`,
        timestamp: new Date().toISOString(),
        visitorId,
        visitorName: newMsg.name,
        visitorEmail: newMsg.email,
        page: '/#contact',
        section: 'contact',
        interactionType: 'form_submission',
        details: `Contact inquiry sent by ${newMsg.name} (${newMsg.projectType})`,
        device: 'Client Device',
        browser: 'Web Browser',
        referrer: 'Direct',
      });
    }

    saveDatabase(db);
    res.status(201).json({ success: true, message: 'Message received successfully' });
  });

  app.get('/api/messages', (req, res) => {
    res.json(db.messages);
  });

  app.patch('/api/messages/:id/read', (req, res) => {
    const { id } = req.params;
    const msg = db.messages.find((m) => m.id === id);
    if (msg) {
      msg.read = true;
      saveDatabase(db);
    }
    res.json({ success: true, message: msg });
  });

  app.delete('/api/messages/:id', (req, res) => {
    const { id } = req.params;
    db.messages = db.messages.filter((m) => m.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Analytics & Interaction tracking
  app.post('/api/analytics/track', (req, res) => {
    const {
      visitorId,
      visitorName,
      visitorEmail,
      page,
      section,
      projectTitle,
      interactionType,
      details,
      device,
      browser,
      referrer,
      approxLocation,
    } = req.body;

    if (!visitorId || !interactionType) {
      return res.status(400).json({ error: 'visitorId and interactionType are required' });
    }

    // Check if visitor has prior submitted identity
    let resolvedName = visitorName;
    let resolvedEmail = visitorEmail;
    if (!resolvedName || !resolvedEmail) {
      const prior = db.interactions.find((i) => i.visitorId === visitorId && i.visitorName);
      if (prior) {
        resolvedName = prior.visitorName;
        resolvedEmail = prior.visitorEmail;
      }
    }

    const log: InteractionLog = {
      id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      visitorId,
      visitorName: resolvedName,
      visitorEmail: resolvedEmail,
      page: page || '/',
      section,
      projectTitle,
      interactionType,
      details,
      device: device || 'Desktop',
      browser: browser || 'Unknown',
      referrer: referrer || 'Direct',
      approxLocation: approxLocation || 'Lagos, Nigeria',
    };

    // Keep last 10,000 interactions
    db.interactions.unshift(log);
    if (db.interactions.length > 10000) {
      db.interactions = db.interactions.slice(0, 10000);
    }
    saveDatabase(db);

    res.json({ success: true });
  });

  // Analytics stats
  app.get('/api/analytics/stats', (req, res) => {
    const uniqueVisitorSet = new Set(db.interactions.map((i) => i.visitorId));
    const visitsOnly = db.interactions.filter((i) => i.interactionType === 'visit');

    // Count project views
    const projectViewsMap: Record<string, number> = {};
    db.interactions
      .filter((i) => i.interactionType === 'project_click' && i.projectTitle)
      .forEach((i) => {
        const title = i.projectTitle!;
        projectViewsMap[title] = (projectViewsMap[title] || 0) + 1;
      });

    const topProjects = Object.entries(projectViewsMap)
      .map(([title, views]) => ({ title, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Count referrers
    const referrerMap: Record<string, number> = {};
    db.interactions.forEach((i) => {
      const ref = i.referrer || 'Direct / Bookmark';
      referrerMap[ref] = (referrerMap[ref] || 0) + 1;
    });

    const topReferrers = Object.entries(referrerMap)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const stats = {
      totalVisits: visitsOnly.length,
      uniqueVisitors: uniqueVisitorSet.size,
      totalInteractions: db.interactions.length,
      totalMessages: db.messages.length,
      unreadMessages: db.messages.filter((m) => !m.read).length,
      topProjects,
      topReferrers,
      recentActivities: db.interactions.slice(0, 50),
      recentMessages: db.messages.slice(0, 10),
    };

    res.json(stats);
  });

  // CSV export
  app.get('/api/analytics/export-csv', (req, res) => {
    const headers = [
      'Timestamp',
      'Visitor ID',
      'Visitor Name',
      'Visitor Email',
      'Interaction Type',
      'Section / Page',
      'Project Title',
      'Details',
      'Device',
      'Browser',
      'Referrer',
      'Approx Location',
    ];

    const rows = db.interactions.map((i) => [
      `"${i.timestamp}"`,
      `"${i.visitorId}"`,
      `"${(i.visitorName || '').replace(/"/g, '""')}"`,
      `"${(i.visitorEmail || '').replace(/"/g, '""')}"`,
      `"${i.interactionType}"`,
      `"${i.section || i.page || ''}"`,
      `"${(i.projectTitle || '').replace(/"/g, '""')}"`,
      `"${(i.details || '').replace(/"/g, '""')}"`,
      `"${i.device}"`,
      `"${i.browser}"`,
      `"${(i.referrer || '').replace(/"/g, '""')}"`,
      `"${(i.approxLocation || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orez_studio_visitors_${Date.now()}.csv"`);
    res.send(csvContent);
  });

  // Image Upload endpoint (accepts base64 or file data)
  app.post('/api/upload', (req, res) => {
    try {
      const { dataUrl, filename } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: 'dataUrl is required' });
      }

      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://') || dataUrl.startsWith('/uploads/')) {
        return res.json({ success: true, url: dataUrl, filename: filename || 'remote_asset' });
      }

      let buffer: Buffer;
      let ext = 'jpg';

      const base64Index = dataUrl.indexOf(';base64,');
      if (base64Index !== -1) {
        const mime = dataUrl.substring(5, base64Index);
        const rawBase64 = dataUrl.substring(base64Index + 8).replace(/\s/g, '');
        buffer = Buffer.from(rawBase64, 'base64');
        ext = mime.split('/')[1] || 'jpg';
        if (ext === 'jpeg') ext = 'jpg';
        if (ext.includes('+')) ext = ext.split('+')[0];
        if (ext.includes('svg')) ext = 'svg';
      } else if (dataUrl.includes(',')) {
        const parts = dataUrl.split(',');
        const rawBase64 = parts[1].replace(/\s/g, '');
        buffer = Buffer.from(rawBase64, 'base64');
      } else {
        buffer = Buffer.from(dataUrl.replace(/\s/g, ''), 'base64');
      }

      const cleanName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) : 'asset';
      const outFileName = `${cleanName}_${Date.now()}.${ext}`;
      const outPath = path.join(UPLOADS_DIR, outFileName);

      fs.writeFileSync(outPath, buffer);

      res.json({
        success: true,
        url: `/uploads/${outFileName}`,
        filename: outFileName,
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      res.status(500).json({ error: err.message || 'Failed to process upload' });
    }
  });

  // List all uploaded media files
  app.get('/api/uploads', (req, res) => {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        return res.json([]);
      }
      const files = fs.readdirSync(UPLOADS_DIR);
      const fileList = files
        .filter((f) => !f.startsWith('.'))
        .map((name) => {
          const filePath = path.join(UPLOADS_DIR, name);
          const stats = fs.statSync(filePath);
          return {
            name,
            url: `/uploads/${name}`,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json(fileList);
    } catch (err) {
      console.error('List uploads error:', err);
      res.status(500).json({ error: 'Failed to list uploads' });
    }
  });

  // Delete an uploaded media file
  app.delete('/api/uploads/:filename', (req, res) => {
    try {
      const rawName = decodeURIComponent(req.params.filename);
      const cleanFilename = path.basename(rawName);
      const targetPath = path.join(UPLOADS_DIR, cleanFilename);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      res.json({ success: true, deleted: cleanFilename });
    } catch (err) {
      console.error('Delete upload error:', err);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ORez STUdio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
