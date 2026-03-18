import express from 'express';
import { getPool, sql } from '../utils/db.js';

const router = express.Router();

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query('SELECT * FROM [Product]');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos', details: error.message });
  }
});

// Criar um produto
router.post('/', async (req, res) => {
  const { name, description, price, imageUrl, isManufactured } = req.body;
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description)
      .input('price', sql.Float, price)
      .input('imageUrl', sql.NVarChar, imageUrl)
      .input('isManufactured', sql.Bit, isManufactured ? 1 : 0)
      .query(`INSERT INTO [Product] (id, name, description, price, imageUrl, isManufactured)
              OUTPUT INSERTED.*
              VALUES (NEWID(), @name, @description, @price, @imageUrl, @isManufactured)`);
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto', details: error.message });
  }
});

export default router;
