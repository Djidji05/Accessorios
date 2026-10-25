import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

// En-têtes HTTP de sécurité avec Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permet le chargement des images/preuves
  crossOriginEmbedderPolicy: false,
}));

// Limitation globale contre les attaques par déni de service (DDoS)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Middlewares CORS stricts avec liste blanche
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('Origine non autorisée par la politique CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Payload JSON limité à 10mb pour prévenir les attaques DoS par saturation mémoire
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
