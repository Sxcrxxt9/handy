import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import reportsRoutes from './routes/reports.js';
import redeemRoutes from './routes/redeem.js';
import notificationsRoutes from './routes/notifications.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import './config/firebase.js'; // Initialize Firebase

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check API
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Handy API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/redeem', redeemRoutes);
app.use('/api/notifications', notificationsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
});

export default app;

