import express from 'express';
import { getPool, sql } from '../utils/db.js';

const router = express.Router();

router.post('/run', async (req, res) => {
  try {
    const pool = await getPool();

    // === FIX: Make Shift.userId nullable (original Prisma schema had it as NOT NULL) ===
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.columns WHERE Name = 'userId' AND Object_ID = Object_ID('Shift') AND is_nullable = 0)
        ALTER TABLE Shift ALTER COLUMN userId NVARCHAR(450) NULL;
    `);
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.columns WHERE Name = 'startTime' AND Object_ID = Object_ID('Shift') AND is_nullable = 0)
        ALTER TABLE Shift ALTER COLUMN startTime DATETIME2 NULL;
    `);

    // === FORNECEDOR (SUPPLIER) - add tipoInsumo ===
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'tipoInsumo' AND Object_ID = Object_ID('Supplier'))
        ALTER TABLE Supplier ADD tipoInsumo NVARCHAR(255);
    `);

    // === INGREDIENTE - add fields from frontend model ===
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'unidade' AND Object_ID = Object_ID('Ingredient'))
        ALTER TABLE Ingredient ADD unidade NVARCHAR(10) DEFAULT 'un';
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'precoCusto' AND Object_ID = Object_ID('Ingredient'))
        ALTER TABLE Ingredient ADD precoCusto FLOAT DEFAULT 0;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'estoque' AND Object_ID = Object_ID('Ingredient'))
        ALTER TABLE Ingredient ADD estoque FLOAT DEFAULT 0;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'createdAt' AND Object_ID = Object_ID('Ingredient'))
        ALTER TABLE Ingredient ADD createdAt DATETIME2 DEFAULT GETUTCDATE();
    `);

    // === PRODUTO - add frontend-specific fields ===
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'precoVenda' AND Object_ID = Object_ID('Product'))
        ALTER TABLE Product ADD precoVenda FLOAT DEFAULT 0;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'precoCusto' AND Object_ID = Object_ID('Product'))
        ALTER TABLE Product ADD precoCusto FLOAT DEFAULT 0;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'estoque' AND Object_ID = Object_ID('Product'))
        ALTER TABLE Product ADD estoque FLOAT DEFAULT 0;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'categoria' AND Object_ID = Object_ID('Product'))
        ALTER TABLE Product ADD categoria NVARCHAR(100);
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'setorProducao' AND Object_ID = Object_ID('Product'))
        ALTER TABLE Product ADD setorProducao NVARCHAR(100);
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'createdAt' AND Object_ID = Object_ID('Product'))
        ALTER TABLE Product ADD createdAt DATETIME2 DEFAULT GETUTCDATE();
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'fichaTecnicaJson' AND Object_ID = Object_ID('Product'))
        ALTER TABLE Product ADD fichaTecnicaJson NVARCHAR(MAX);
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'gruposIdsJson' AND Object_ID = Object_ID('Product'))
        ALTER TABLE Product ADD gruposIdsJson NVARCHAR(MAX);
    `);

    // === TURNO (SHIFT) - add frontend-specific fields ===
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'operador' AND Object_ID = Object_ID('Shift'))
        ALTER TABLE Shift ADD operador NVARCHAR(255);
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'saldoInicial' AND Object_ID = Object_ID('Shift'))
        ALTER TABLE Shift ADD saldoInicial FLOAT DEFAULT 0;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'saldoFinal' AND Object_ID = Object_ID('Shift'))
        ALTER TABLE Shift ADD saldoFinal FLOAT;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'saldoEsperado' AND Object_ID = Object_ID('Shift'))
        ALTER TABLE Shift ADD saldoEsperado FLOAT;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'diferenca' AND Object_ID = Object_ID('Shift'))
        ALTER TABLE Shift ADD diferenca FLOAT;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'abertoEm' AND Object_ID = Object_ID('Shift'))
        ALTER TABLE Shift ADD abertoEm DATETIME2 DEFAULT GETUTCDATE();
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'fechadoEm' AND Object_ID = Object_ID('Shift'))
        ALTER TABLE Shift ADD fechadoEm DATETIME2;
    `);

    // === TRANSACAO TABLE ===
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Transacao')
      CREATE TABLE Transacao (
        id NVARCHAR(255) PRIMARY KEY,
        tipo NVARCHAR(20) NOT NULL,
        subtipo NVARCHAR(50),
        turnoId NVARCHAR(255),
        valor FLOAT NOT NULL,
        metodoPagamento NVARCHAR(50),
        descricao NVARCHAR(MAX),
        motivo NVARCHAR(255),
        origem NVARCHAR(50),
        mesaIdentificacao NVARCHAR(100),
        itensJson NVARCHAR(MAX),
        criadoEm DATETIME2 DEFAULT GETUTCDATE()
      );
    `);

    // === GRUPO DE OPCOES ===
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GrupoOpcoes')
      CREATE TABLE GrupoOpcoes (
        id NVARCHAR(255) PRIMARY KEY,
        nome NVARCHAR(255) NOT NULL,
        minOpcoes INT DEFAULT 0,
        maxOpcoes INT DEFAULT 0,
        opcoesJson NVARCHAR(MAX),
        createdAt DATETIME2 DEFAULT GETUTCDATE()
      );
    `);

    // === MESA TABLE ===
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Mesa')
      CREATE TABLE Mesa (
        id NVARCHAR(255) PRIMARY KEY,
        identificacao NVARCHAR(100) NOT NULL,
        status NVARCHAR(20) DEFAULT 'aberta',
        itensJson NVARCHAR(MAX),
        criadoEm DATETIME2 DEFAULT GETUTCDATE()
      );
    `);

    res.json({ success: true, message: 'Migration completed!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
