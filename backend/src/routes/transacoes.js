import express from 'express';
import { getPool, sql } from '../utils/db.js';

const router = express.Router();

// GET all transactions (optionally by turnoId)
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const { turnoId } = req.query;
    let query = 'SELECT * FROM Transacao';
    const request = pool.request();
    if (turnoId) {
      query += ' WHERE turnoId = @turnoId';
      request.input('turnoId', sql.NVarChar, turnoId);
    }
    query += ' ORDER BY criadoEm DESC';
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create transaction (venda or despesa)
router.post('/', async (req, res) => {
  const { id, tipo, subtipo, turnoId, valor, metodoPagamento, descricao, motivo, origem, mesaIdentificacao, itens } = req.body;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('tipo', sql.NVarChar, tipo)
      .input('subtipo', sql.NVarChar, subtipo || null)
      .input('turnoId', sql.NVarChar, turnoId || null)
      .input('valor', sql.Float, parseFloat(valor) || 0)
      .input('metodoPagamento', sql.NVarChar, metodoPagamento || null)
      .input('descricao', sql.NVarChar, descricao || null)
      .input('motivo', sql.NVarChar, motivo || null)
      .input('origem', sql.NVarChar, origem || null)
      .input('mesaIdentificacao', sql.NVarChar, mesaIdentificacao || null)
      .input('itensJson', sql.NVarChar, JSON.stringify(itens || []))
      .query(`INSERT INTO Transacao (id, tipo, subtipo, turnoId, valor, metodoPagamento, descricao, motivo, origem, mesaIdentificacao, itensJson, criadoEm)
              OUTPUT INSERTED.*
              VALUES (@id, @tipo, @subtipo, @turnoId, @valor, @metodoPagamento, @descricao, @motivo, @origem, @mesaIdentificacao, @itensJson, GETUTCDATE())`);
    res.status(201).json(result.recordset[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
