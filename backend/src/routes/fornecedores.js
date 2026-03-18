import express from 'express';
import { getPool, sql } from '../utils/db.js';

const router = express.Router();

// GET all
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Supplier ORDER BY name');
    res.json(result.recordset);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create
router.post('/', async (req, res) => {
  const { id, nome, contato, tipoInsumo } = req.body;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, nome)
      .input('contact', sql.NVarChar, contato || null)
      .input('tipoInsumo', sql.NVarChar, tipoInsumo || null)
      .query(`INSERT INTO Supplier (id, name, contact, tipoInsumo)
              OUTPUT INSERTED.*
              VALUES (@id, @name, @contact, @tipoInsumo)`);
    res.status(201).json(result.recordset[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT update
router.put('/:id', async (req, res) => {
  const { nome, contato, tipoInsumo } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('name', sql.NVarChar, nome)
      .input('contact', sql.NVarChar, contato || null)
      .input('tipoInsumo', sql.NVarChar, tipoInsumo || null)
      .query('UPDATE Supplier SET name=@name, contact=@contact, tipoInsumo=@tipoInsumo WHERE id=@id');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.NVarChar, req.params.id)
      .query('DELETE FROM Supplier WHERE id=@id');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
