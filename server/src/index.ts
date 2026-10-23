import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import treasuryRoutes from './routes/treasuryRoutes';
import killSwitchRoutes from './routes/killSwitchRoutes';
import ratesRoutes from './routes/ratesRoutes';
import auditRoutes from './routes/auditRoutes';
import userRoutes from './routes/userRoutes';
import emailRoutes from './routes/emailRoutes';
import { startSlaReminderEngine } from './services/slaReminderService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Accessorio Transferencia Backend API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/treasury', treasuryRoutes);
app.use('/api/kill-switch', killSwitchRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email', emailRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Ressource demandée introuvable sur le serveur.' });
});

import { bootstrapDatabase } from './bootstrap';

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Serveur Backend Accessorio opérationnel sur http://localhost:${PORT}`);
  await bootstrapDatabase();
  // Démarrer le moteur de rappel SLA automatique toutes les 60 secondes (alertes récurrentes 30m, 60m, 90m...)
  startSlaReminderEngine(60 * 1000);
});
