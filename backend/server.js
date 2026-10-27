const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy-key' });

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-volentra-key';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token missing' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// ── Express + HTTP Server ─────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Socket.io (optional — only if installed) ──────────────────────────────────
let io = null;
try {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
        cors: { origin: '*', methods: ['GET', 'POST', 'PATCH'] },
    });
    io.on('connection', (socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);
        socket.on('disconnect', () => console.log(`[Socket.io] Disconnected: ${socket.id}`));
    });
    console.log('   Socket.io  : enabled');
} catch {
    console.log('   Socket.io  : not installed (run: npm install socket.io)');
}

function broadcast(event, data) {
    if (io) io.emit(event, data);
}

// ── Multer + Cloudinary Storage ───────────────────────────────────────────────
let upload = null;
try {
    const multer = require('multer');
    const { v2: cloudinary } = require('cloudinary');
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'volentra_uploads',
            allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
        },
    });

    upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
    console.log('   Multer     : enabled (Cloudinary storage)');
} catch (error) {
    console.log('   Multer     : setup failed — image uploads will use JSON fallback', error.message);
}

// ── In-Memory Database ────────────────────────────────────────────────────────
let db = {
    users: [
        { id: 1, name: 'Admin Aditya', email: 'admin@ngo.org', password: 'password', role: 'admin' },
        { id: 2, name: 'Volunteer John', email: 'john@vol.org', password: 'password', role: 'volunteer' },
        { id: 3, name: 'Field Worker Mike', email: 'mike@field.org', password: 'password', role: 'field_worker' },
    ],
    volunteers: [],
    reports: [],
    tasks: [],
    ngos: [
        { id: 1, organizationName: 'HopeAid Foundation', address: '123 Main St, Los Angeles, CA', contact: '+1-310-555-0101' },
        { id: 2, organizationName: 'CityReach', address: '456 Oak Ave, Los Angeles, CA', contact: '+1-310-555-0202' },
        { id: 3, organizationName: 'GlobalVolunteer Network', address: '789 Pine Blvd, Los Angeles, CA', contact: '+1-310-555-0303' },
        { id: 4, organizationName: 'Shelter First', address: '321 Elm Dr, Los Angeles, CA', contact: '+1-310-555-0404' },
        { id: 5, organizationName: 'FeedTheMany', address: '654 Cedar Ln, Los Angeles, CA', contact: '+1-310-555-0505' },
    ],
};

const issueTypes = ['Medical', 'Food Shortage', 'Infrastructure', 'Shelter', 'Water Supply', 'Logistics'];

function calcPriority(urgency, peopleAffected, createdAt) {
    const urgencyScore = (urgency / 10) * 100;
    const peopleScore = Math.min((peopleAffected / 1000) * 100, 100);
    const hoursPending = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const timeScore = Math.min((hoursPending / 72) * 100, 100);
    return Math.round((urgencyScore * 0.5) + (peopleScore * 0.3) + (timeScore * 0.2));
}

function distKm(lat1, lon1, lat2, lon2) {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const volNames = ['Alice Morgan', 'Ben Carter', 'Clara Hayes', 'David Kim', 'Emma Ross', 'Frank Lee', 'Grace Wu', 'Henry Park', 'Iris Chen', 'James Miller', 'Karen Liu', 'Leo Diaz', 'Maya Patel', 'Nathan Scott', 'Olivia Brown', 'Peter Zhang', 'Quinn Adams', 'Rachel Green', 'Sam Wilson', 'Tara Singh'];

function initSeed() {
    db.volunteers = volNames.map((name, i) => ({
        id: i + 100, userId: i === 0 ? 2 : null, name,
        skills: [issueTypes[i % issueTypes.length], 'General'],
        latitude: 34.0522 + (Math.random() - 0.5) * 0.5,
        longitude: -118.2437 + (Math.random() - 0.5) * 0.5,
        availabilityStatus: Math.random() > 0.3 ? 'available' : 'busy',
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        experienceLevel: Math.random() > 0.5 ? 'Expert' : 'Intermediate',
        totalHoursServed: Math.floor(Math.random() * 200),
    }));

    db.reports = Array.from({ length: 30 }, (_, i) => {
        const status = Math.random() > 0.5 ? 'Pending' : (Math.random() > 0.5 ? 'Assigned' : 'Completed');
        const createdAt = new Date(Date.now() - Math.random() * 100_000_000).toISOString();
        const r = {
            id: i + 500, issueType: issueTypes[i % issueTypes.length],
            description: `Urgent assistance required in sector ${i + 1}. Multiple families affected.`,
            urgency: Math.floor(Math.random() * 10) + 1,
            peopleAffected: Math.floor(Math.random() * 500) + 10,
            latitude: 34.0522 + (Math.random() - 0.5) * 0.4,
            longitude: -118.2437 + (Math.random() - 0.5) * 0.4,
            submittedBy: 3, status, createdAt, imageUrl: null,
            aiAnalysis: {
                recommendedAction: `Dispatch ${issueTypes[i % issueTypes.length].toLowerCase()} response team to sector ${i + 1} immediately.`,
                requiredSupplies: ['Emergency Kits', 'Water', 'Radios']
            }
        };
        r.priorityScore = calcPriority(r.urgency, r.peopleAffected, r.createdAt);
        return r;
    });

    db.tasks = db.reports.filter(r => r.status !== 'Pending').map((r, i) => ({
        id: i + 1000, reportId: r.id,
        assignedVolunteerId: db.volunteers[Math.floor(Math.random() * db.volunteers.length)].id,
        assignedAt: new Date(Date.now() - 50_000_000).toISOString(),
        completedAt: r.status === 'Completed' ? new Date().toISOString() : null,
        status: r.status === 'Assigned' ? 'In Progress' : 'Completed',
    }));
}

initSeed();

// ── Auth Routes ───────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const { password: _pw, ...safe } = user;
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, user: safe });
});

app.post('/api/auth/me', authenticateToken, (req, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(401).json({ error: 'Session invalid' });
    const { password: _pw, ...safe } = user;
    res.json(safe);
});

// ── Data Routes ───────────────────────────────────────────────────────────────
app.get('/api/stats', (_req, res) => res.json({
    totalReports: db.reports.length,
    completedTasks: db.tasks.filter(t => t.status === 'Completed').length,
    pendingReports: db.reports.filter(r => r.status === 'Pending').length,
    activeVolunteers: db.volunteers.filter(v => v.availabilityStatus === 'available').length,
}));

app.get('/api/reports', (_req, res) => res.json(db.reports));
app.get('/api/tasks', (_req, res) => res.json(db.tasks));
app.get('/api/volunteers', (_req, res) => res.json(db.volunteers));
app.get('/api/ngos', (_req, res) => res.json(db.ngos));

// Submit report — supports multipart (with Multer) OR JSON (fallback)
app.post('/api/reports', authenticateToken, (req, res, next) => {
    if (upload) {
        upload.single('image')(req, res, (err) => {
            if (err) return res.status(400).json({ error: err.message });
            handleCreateReport(req, res);
        });
    } else {
        handleCreateReport(req, res);
    }
});

async function handleCreateReport(req, res) {
    const body = req.body;
    const createdAt = new Date().toISOString();
    const urgency = parseInt(body.urgency) || 5;
    const peopleAffected = parseInt(body.peopleAffected) || 10;
    
    // Gemini AI Predictive Triage
    let aiAnalysis = null;
    if (process.env.GEMINI_API_KEY) {
        try {
            const prompt = `Analyze this disaster incident report.
Issue Type: ${body.issueType || 'General'}
Description: ${body.description || ''}
Urgency Level: ${urgency}/10
People Affected: ${peopleAffected}

Return ONLY a strictly valid JSON object (without markdown blocks) with this exact schema:
{
  "aiUrgencyScore": <number 1-100 based on text severity>,
  "recommendedAction": "<string 1 short sentence on what volunteers should do immediately>",
  "requiredSupplies": ["<string>", "<string>"]
}`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
            aiAnalysis = JSON.parse(text);
        } catch (error) {
            console.error('Gemini AI Error:', error.message);
            aiAnalysis = { error: 'AI analysis unavailable', recommendedAction: 'Assess manually', requiredSupplies: [] };
        }
    }

    const newReport = {
        id: Math.floor(Math.random() * 90_000) + 10_000,
        issueType: body.issueType || 'General',
        description: body.description || '',
        urgency,
        peopleAffected,
        latitude: parseFloat(body.latitude) || 34.0522,
        longitude: parseFloat(body.longitude) || -118.2437,
        submittedBy: parseInt(body.submittedBy) || 3,
        status: 'Pending',
        createdAt,
        imageUrl: req.file ? req.file.path : null,
        priorityScore: calcPriority(urgency, peopleAffected, createdAt),
        aiAnalysis
    };
    db.reports.unshift(newReport);
    broadcast('report:new', newReport);
    res.json(newReport);
}

app.post('/api/tasks', authenticateToken, (req, res) => {
    const { reportId, volunteerId } = req.body;
    db.reports = db.reports.map(r => r.id === parseInt(reportId) ? { ...r, status: 'Assigned' } : r);
    const task = {
        id: Math.floor(Math.random() * 90_000) + 10_000,
        reportId: parseInt(reportId), assignedVolunteerId: parseInt(volunteerId),
        assignedAt: new Date().toISOString(), completedAt: null, status: 'In Progress',
    };
    db.tasks.unshift(task);
    const vol = db.volunteers.find(v => v.id === parseInt(volunteerId));
    broadcast('task:assigned', { ...task, volunteerName: vol?.name || 'Unknown' });
    res.json(task);
});

app.patch('/api/tasks/:id', authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;
    const task = db.tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    db.tasks = db.tasks.map(t => t.id === taskId ? { ...t, status, completedAt: status === 'Completed' ? new Date().toISOString() : t.completedAt } : t);
    if (status === 'Completed') db.reports = db.reports.map(r => r.id === task.reportId ? { ...r, status: 'Completed' } : r);
    broadcast('task:updated', { taskId, status, reportId: task.reportId });
    res.json({ success: true });
});

app.get('/api/reports/:id/match', (req, res) => {
    const report = db.reports.find(r => r.id === parseInt(req.params.id));
    if (!report) return res.status(404).json({ error: 'Not found' });
    const matches = db.volunteers.map(vol => {
        const hasSkill = vol.skills.some(s => report.issueType.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase() === 'general');
        const d = distKm(report.latitude, report.longitude, vol.latitude, vol.longitude);
        const proximity = d <= 5 ? 100 : d <= 20 ? 70 : d <= 50 ? 40 : 10;
        const score = Math.round((hasSkill ? 100 : 20) * 0.4 + proximity * 0.3 + (vol.availabilityStatus === 'available' ? 100 : 0) * 0.2 + (vol.rating / 5) * 100 * 0.1);
        return { ...vol, matchScore: score, distanceKm: d.toFixed(1) };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
    res.json(matches);
});

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(port, () => {
    console.log(`\n✅ Volentra Backend running on http://localhost:${port}`);
    console.log(`   Uploads    : Cloudinary\n`);
});
