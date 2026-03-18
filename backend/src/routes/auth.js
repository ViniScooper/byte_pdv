import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getPool, sql } from '../utils/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_cantina_123';

// =============================
// POST /auth/login (Email + Senha)
// =============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM [User] WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const user = result.recordset[0];

    // Verifica a senha com bcrypt
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, pictureUrl: user.pictureUrl }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no login.', details: error.message });
  }
});

// =============================
// GET /auth/me (Dados do user logado via JWT)
// =============================
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// =============================
// POST /auth/register (Apenas ADMIN pode criar usuários)
// =============================
router.post('/register', async (req, res) => {
  // Verifica se é admin
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Apenas administradores podem criar usuários.' });
    }
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }

  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const pool = await getPool();
    
    // Verifica se já existe
    const existing = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM [User] WHERE email = @email');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ error: 'Este email já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = (role === 'ADMIN' || role === 'CAIXA') ? role : 'CAIXA';

    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, userRole)
      .query(`INSERT INTO [User] (id, name, email, passwordHash, role, createdAt)
              OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role, INSERTED.createdAt
              VALUES (NEWID(), @name, @email, @passwordHash, @role, GETUTCDATE())`);

    res.status(201).json({ user: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário.', details: error.message });
  }
});

// =============================
// GET /auth/users (Apenas ADMIN pode listar)
// =============================
router.get('/users', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Apenas administradores podem listar usuários.' });
    }
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT id, name, email, role, createdAt FROM [User] ORDER BY createdAt DESC');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários.', details: error.message });
  }
});

// =============================
// DELETE /auth/users/:id (Apenas ADMIN pode remover)
// =============================
router.delete('/users/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Apenas administradores podem remover usuários.' });
    }
    
    // Não pode deletar a si mesmo
    if (decoded.id === req.params.id) {
      return res.status(400).json({ error: 'Você não pode remover sua própria conta.' });
    }
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('DELETE FROM [User] WHERE id = @id');
    res.json({ message: 'Usuário removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover usuário.', details: error.message });
  }
});

export default router;
