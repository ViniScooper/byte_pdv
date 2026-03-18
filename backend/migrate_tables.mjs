import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  user: 'admin_cantina',
  password: '@sistemaPDV123',
  server: 'pdvcantina.database.windows.net',
  database: 'schema_pdv_cantina',
  options: { encrypt: true, trustServerCertificate: false }
};

try {
  console.log('Conectando ao Azure SQL...');
  const pool = await sql.connect(config);

  // === FORNECEDOR (SUPPLIER) - add tipoInsumo ===
  console.log('1. Atualizando tabela Supplier...');
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'tipoInsumo' AND Object_ID = Object_ID('Supplier'))
      ALTER TABLE Supplier ADD tipoInsumo NVARCHAR(255);
  `);

  // === INGREDIENTE - add fields from frontend model ===
  console.log('2. Atualizando tabela Ingredient...');
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'unidade' AND Object_ID = Object_ID('Ingredient'))
      ALTER TABLE Ingredient ADD unidade NVARCHAR(10) DEFAULT 'un';
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'precoCusto' AND Object_ID = Object_ID('Ingredient'))
      ALTER TABLE Ingredient ADD precoCusto FLOAT DEFAULT 0;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'estoque' AND Object_ID = Object_ID('Ingredient'))
      ALTER TABLE Ingredient ADD estoque FLOAT DEFAULT 0;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'createdAt' AND Object_ID = Object_ID('Ingredient'))
      ALTER TABLE Ingredient ADD createdAt DATETIME2 DEFAULT GETUTCDATE();
  `);

  // === PRODUTO - add frontend-specific fields ===
  console.log('3. Atualizando tabela Product...');
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'precoVenda' AND Object_ID = Object_ID('Product'))
      ALTER TABLE Product ADD precoVenda FLOAT DEFAULT 0;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'precoCusto' AND Object_ID = Object_ID('Product'))
      ALTER TABLE Product ADD precoCusto FLOAT DEFAULT 0;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'estoque' AND Object_ID = Object_ID('Product'))
      ALTER TABLE Product ADD estoque FLOAT DEFAULT 0;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'categoria' AND Object_ID = Object_ID('Product'))
      ALTER TABLE Product ADD categoria NVARCHAR(100);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'setorProducao' AND Object_ID = Object_ID('Product'))
      ALTER TABLE Product ADD setorProducao NVARCHAR(100);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'createdAt' AND Object_ID = Object_ID('Product'))
      ALTER TABLE Product ADD createdAt DATETIME2 DEFAULT GETUTCDATE();
  `);

  // === TURNO (SHIFT) - add frontend-specific fields ===
  console.log('4. Atualizando tabela Shift...');
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'operador' AND Object_ID = Object_ID('Shift'))
      ALTER TABLE Shift ADD operador NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'saldoInicial' AND Object_ID = Object_ID('Shift'))
      ALTER TABLE Shift ADD saldoInicial FLOAT DEFAULT 0;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'saldoFinal' AND Object_ID = Object_ID('Shift'))
      ALTER TABLE Shift ADD saldoFinal FLOAT;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'saldoEsperado' AND Object_ID = Object_ID('Shift'))
      ALTER TABLE Shift ADD saldoEsperado FLOAT;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'diferenca' AND Object_ID = Object_ID('Shift'))
      ALTER TABLE Shift ADD diferenca FLOAT;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'abertoEm' AND Object_ID = Object_ID('Shift'))
      ALTER TABLE Shift ADD abertoEm DATETIME2 DEFAULT GETUTCDATE();
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'fechadoEm' AND Object_ID = Object_ID('Shift'))
      ALTER TABLE Shift ADD fechadoEm DATETIME2;
  `);

  // === TRANSACAO TABLE (new - for both sales/expenses) ===
  console.log('5. Criando tabela Transacao...');
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

  // === GRUPO DE OPCOES (flatten into a single table with JSON opcoes) ===
  console.log('6. Criando tabela GrupoOpcoes...');
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
  console.log('7. Criando tabela Mesa...');
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

  // === PRODUTO_GRUPO junction (product <-> optionGroup) ===
  console.log('8. Criando tabela ProdutoGrupo (junction)...');
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProdutoGrupo')
    CREATE TABLE ProdutoGrupo (
      produtoId NVARCHAR(255) NOT NULL,
      grupoId NVARCHAR(255) NOT NULL,
      PRIMARY KEY (produtoId, grupoId)
    );
  `);

  console.log('\n✅ Todas as tabelas foram atualizadas/criadas com sucesso!');
  await sql.close();
} catch (err) {
  console.error('ERRO:', err.message);
}
