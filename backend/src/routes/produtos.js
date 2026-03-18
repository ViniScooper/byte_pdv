import express from 'express';
import { getPool, sql } from '../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Product ORDER BY name');
    res.json(result.recordset);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { id, nome, precoVenda, precoCusto, estoque, categoria, setorProducao, fichaTecnica, gruposIds } = req.body;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, nome)
      .input('precoVenda', sql.Float, parseFloat(precoVenda) || 0)
      .input('precoCusto', sql.Float, parseFloat(precoCusto) || 0)
      .input('price', sql.Float, parseFloat(precoVenda) || 0)
      .input('estoque', sql.Float, parseFloat(estoque) || 0)
      .input('categoria', sql.NVarChar, categoria || null)
      .input('setorProducao', sql.NVarChar, setorProducao || null)
      .input('fichaTecnicaJson', sql.NVarChar, JSON.stringify(fichaTecnica || []))
      .input('gruposIdsJson', sql.NVarChar, JSON.stringify(gruposIds || []))
      .query(`INSERT INTO Product (id, name, precoVenda, precoCusto, price, estoque, categoria, setorProducao, fichaTecnicaJson, gruposIdsJson, createdAt)
              OUTPUT INSERTED.*
              VALUES (@id, @name, @precoVenda, @precoCusto, @price, @estoque, @categoria, @setorProducao, @fichaTecnicaJson, @gruposIdsJson, GETUTCDATE())`);
    res.status(201).json(result.recordset[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { nome, precoVenda, precoCusto, estoque, categoria, setorProducao, fichaTecnica, gruposIds } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('name', sql.NVarChar, nome)
      .input('precoVenda', sql.Float, parseFloat(precoVenda) || 0)
      .input('precoCusto', sql.Float, parseFloat(precoCusto) || 0)
      .input('price', sql.Float, parseFloat(precoVenda) || 0)
      .input('estoque', sql.Float, parseFloat(estoque) || 0)
      .input('categoria', sql.NVarChar, categoria || null)
      .input('setorProducao', sql.NVarChar, setorProducao || null)
      .input('fichaTecnicaJson', sql.NVarChar, JSON.stringify(fichaTecnica || []))
      .input('gruposIdsJson', sql.NVarChar, JSON.stringify(gruposIds || []))
      .query(`UPDATE Product SET name=@name, precoVenda=@precoVenda, precoCusto=@precoCusto, price=@price,
              estoque=@estoque, categoria=@categoria, setorProducao=@setorProducao,
              fichaTecnicaJson=@fichaTecnicaJson, gruposIdsJson=@gruposIdsJson WHERE id=@id`);
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
      .query('UPDATE Product SET estoque = CASE WHEN estoque + @qty < 0 THEN 0 ELSE estoque + @qty END WHERE id=@id');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.NVarChar, req.params.id)
      .query('DELETE FROM Product WHERE id=@id');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
