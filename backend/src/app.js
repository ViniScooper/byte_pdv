import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/passport.js';
import { getPool } from './utils/db.js';
import authRoutes from './routes/auth.js';
import shiftRoutes from './routes/shifts.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import migrateRoutes from './routes/migrate.js';
import fornecedoresRoutes from './routes/fornecedores.js';
import ingredientesRoutes from './routes/ingredientes.js';
import produtosRoutes from './routes/produtos.js';
import gruposRoutes from './routes/grupos.js';
import turnosRoutes from './routes/turnos.js';
import transacoesRoutes from './routes/transacoes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize the DB pool on startup
getPool().catch(err => {
  console.error('Could not connect to database:', err.message);
});

// API Routes
app.use('/auth', authRoutes);
app.use('/shifts', shiftRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/migrate', migrateRoutes);

// New CRUD routes (used by frontend)
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/transacoes', transacoesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cantina Cloud API is running!' });
});

export default app;
