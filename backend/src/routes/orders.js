import express from 'express';
import { getPool, sql } from '../utils/db.js';

const router = express.Router();

// Listar ordens
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM [Order] ORDER BY createdAt DESC');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos', details: error.message });
  }
});

// Criar pedido (registrar venda)
router.post('/', async (req, res) => {
  const { shiftId, items, paymentMethod, discount = 0 } = req.body;
  
  if (!shiftId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  try {
    const totalAmount = items.reduce((acc, item) => acc + item.totalPrice, 0) - discount;
    const pool = await getPool();
    
    // Create order
    const orderResult = await pool.request()
      .input('shiftId', sql.NVarChar, shiftId)
      .input('totalAmount', sql.Float, totalAmount)
      .input('discount', sql.Float, discount)
      .input('paymentMethod', sql.NVarChar, paymentMethod || 'DINHEIRO')
      .query(`INSERT INTO [Order] (id, shiftId, totalAmount, discount, paymentMethod, status, createdAt)
              OUTPUT INSERTED.*
              VALUES (NEWID(), @shiftId, @totalAmount, @discount, @paymentMethod, 'COMPLETED', GETUTCDATE())`);

    const order = orderResult.recordset[0];
    
    // Create order items
    for (const item of items) {
      await pool.request()
        .input('orderId', sql.NVarChar, order.id)
        .input('productId', sql.NVarChar, item.productId)
        .input('quantity', sql.Int, item.quantity)
        .input('unitPrice', sql.Float, item.unitPrice)
        .input('totalPrice', sql.Float, item.totalPrice)
        .query(`INSERT INTO [OrderItem] (id, orderId, productId, quantity, unitPrice, totalPrice)
                VALUES (NEWID(), @orderId, @productId, @quantity, @unitPrice, @totalPrice)`);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar pedido', details: error.message });
  }
});

export default router;

