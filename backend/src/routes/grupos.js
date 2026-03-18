import express from 'express';
import { getPool, sql } from '../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM GrupoOpcoes ORDER BY nome');
    res.json(result.recordset);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { id, nome, min, max, opcoes } = req.body;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('nome', sql.NVarChar, nome)
      .input('minOpcoes', sql.Int, min || 0)
      .input('maxOpcoes', sql.Int, max || 0)
      .input('opcoesJson', sql.NVarChar, JSON.stringify(opcoes || []))
      .query(`INSERT INTO GrupoOpcoes (id, nome, minOpcoes, maxOpcoes, opcoesJson, createdAt)
              OUTPUT INSERTED.*
              VALUES (@id, @nome, @minOpcoes, @maxOpcoes, @opcoesJson, GETUTCDATE())`);
    res.status(201).json(result.recordset[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { nome, min, max, opcoes } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('nome', sql.NVarChar, nome)
      .input('minOpcoes', sql.Int, min || 0)
      .input('maxOpcoes', sql.Int, max || 0)
      .input('opcoesJson', sql.NVarChar, JSON.stringify(opcoes || []))
      .query('UPDATE GrupoOpcoes SET nome=@nome, minOpcoes=@minOpcoes, maxOpcoes=@maxOpcoes, opcoesJson=@opcoesJson WHERE id=@id');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.NVarChar, req.params.id)
      .query('DELETE FROM GrupoOpcoes WHERE id=@id');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
