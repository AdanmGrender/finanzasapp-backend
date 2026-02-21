import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './db';

dotenv.config();

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import incomesRoutes from './routes/incomes';
import fixedExpensesRoutes from './routes/fixedExpenses';
import dailyExpensesRoutes from './routes/dailyExpenses';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/incomes', incomesRoutes);
app.use('/api/fixed-expenses', fixedExpensesRoutes);
app.use('/api/daily-expenses', dailyExpensesRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function initDb() {
  try {
    // Try both paths: works in dev (src/) and prod (dist/)
    let schemaPath = join(__dirname, 'schema.sql');
    try { readFileSync(schemaPath); } catch { schemaPath = join(__dirname, '..', 'src', 'schema.sql'); }
    const schema = readFileSync(schemaPath, 'utf-8');
    await pool.query(schema);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Error initializing database (may already exist):', err);
  }
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});
