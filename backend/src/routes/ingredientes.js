import express from 'express';
import { getPool, sql } from '../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Ingredient ORDER BY name');
    res.json(result.recordset);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { id, nome, unidade, precoCusto, estoque } = req.body;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, nome)
      .input('unidade', sql.NVarChar, unidade || 'un')
      .input('precoCusto', sql.Float, parseFloat(precoCusto) || 0)
      .input('estoque', sql.Float, parseFloat(estoque) || 0)
      .query(`INSERT INTO Ingredient (id, name, unidade, precoCusto, estoque, createdAt)
              OUTPUT INSERTED.*
              VALUES (@id, @name, @unidade, @precoCusto, @estoque, GETUTCDATE())`);
    res.status(201).json(result.recordset[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { nome, unidade, precoCusto, estoque } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('name', sql.NVarChar, nome)
      .input('unidade', sql.NVarChar, unidade || 'un')
      .input('precoCusto', sql.Float, parseFloat(precoCusto) || 0)
      .input('estoque', sql.Float, parseFloat(estoque) || 0)
      .query('UPDATE Ingredient SET name=@name, unidade=@unidade, precoCusto=@precoCusto, estoque=@estoque WHERE id=@id');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH estoque only
router.patch('/:id/estoque', async (req, res) => {
  const { quantidade } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('qty', sql.Float, parseFloat(quantidade) || 0)
      .query('UPDATE Ingredient SET estoque = CASE WHEN estoque + @qty < 0 THEN 0 ELSE estoque + @qty END WHERE id=@id');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.NVarChar, req.params.id)
      .query('DELETE FROM Ingredient WHERE id=@id');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
