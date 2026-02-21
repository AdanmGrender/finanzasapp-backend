import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
