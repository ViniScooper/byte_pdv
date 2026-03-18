import express from 'express';
// import prisma from '../utils/prisma.js';

const router = express.Router();

// Abrir turno
router.post('/open', async (req, res) => {
  res.json({ message: 'Abre um novo turno' });
});

// Fechar turno
router.post('/close', async (req, res) => {
  res.json({ message: 'Fecha o turno atual' });
});

// Ver turno atual
router.get('/current', async (req, res) => {
  res.json({ message: 'Retorna o turno ativo' });
});

export default router;
