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
app.options('*', cors());
app.use(express.json());

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

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Ressource demandée introuvable sur le serveur.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Serveur Backend Accessorio opérationnel sur http://localhost:${PORT}`);
});
