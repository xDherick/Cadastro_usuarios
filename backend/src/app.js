// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes    = require('./routes/auth.routes');
const userRoutes    = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const auditRoutes   = require('./routes/audit.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/audit',   auditRoutes);

app.use(errorHandler);

module.exports = app;
