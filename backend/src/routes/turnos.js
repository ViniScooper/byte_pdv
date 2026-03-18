import express from 'express';
import { getPool, sql } from '../utils/db.js';

const router = express.Router();

// GET turno ativo (status = 'aberto')
router.get('/atual', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query("SELECT TOP 1 * FROM Shift WHERE status = 'OPEN' ORDER BY abertoEm DESC");
    res.json(result.recordset[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET todos os turnos (histórico)
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Shift ORDER BY abertoEm DESC');
    res.json(result.recordset);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST abrir turno
router.post('/abrir', async (req, res) => {
  const { id, saldoInicial, operador, userId } = req.body;
  try {
    const pool = await getPool();
    // Get userId from request or find the admin user as fallback
    let uid = userId;
    if (!uid) {
      const adminResult = await pool.request().query("SELECT TOP 1 id FROM [User] WHERE role = 'ADMIN'");
      uid = adminResult.recordset[0]?.id || 'system';
    }
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, uid)
      .input('saldoInicial', sql.Float, parseFloat(saldoInicial) || 0)
      .input('operador', sql.NVarChar, operador || 'Operador')
      .query(`INSERT INTO Shift (id, userId, startTime, saldoInicial, operador, status, abertoEm)
              OUTPUT INSERTED.*
              VALUES (@id, @userId, GETUTCDATE(), @saldoInicial, @operador, 'OPEN', GETUTCDATE())`);
    res.status(201).json(result.recordset[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST fechar turno
router.post('/fechar', async (req, res) => {
  const { id, saldoFinal, saldoEsperado, diferenca, totalEntradas, totalSaidas } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('saldoFinal', sql.Float, parseFloat(saldoFinal) || 0)
      .input('saldoEsperado', sql.Float, parseFloat(saldoEsperado) || 0)
      .input('diferenca', sql.Float, parseFloat(diferenca) || 0)
      .query("UPDATE Shift SET status='CLOSED', saldoFinal=@saldoFinal, saldoEsperado=@saldoEsperado, diferenca=@diferenca, fechadoEm=GETUTCDATE() WHERE id=@id");
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
