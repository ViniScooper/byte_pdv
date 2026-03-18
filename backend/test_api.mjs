// Teste E2E de todas as APIs do PDV Byte
// Execução: node test_api.mjs

const API = 'http://localhost:3001';
const ids = {};
let passed = 0;
let failed = 0;

async function req(method, path, body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, opts);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return { status: res.status, data, ok: res.ok };
}

function ok(label, condition) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}`); failed++; }
}

async function run() {
  console.log('🧪 TESTE COMPLETO DAS APIs DO PDV BYTE\n');
  console.log('='.repeat(60));

  // ========== 1. HEALTH CHECK ==========
  console.log('\n📡 1. Health Check');
  const h = await req('GET', '/health');
  ok('GET /health retorna ok', h.data?.status === 'ok');

  // ========== 2. LOGIN ==========
  console.log('\n🔐 2. Autenticação');
  const login = await req('POST', '/auth/login', { email: 'admin', password: 'admin123' });
  ok('POST /auth/login retorna token', !!login.data?.token);
  ok('POST /auth/login retorna user com role ADMIN', login.data?.user?.role === 'ADMIN');

  // ========== 3. FORNECEDORES ==========
  console.log('\n👥 3. Fornecedores');
  ids.forn1 = crypto.randomUUID();
  ids.forn2 = crypto.randomUUID();

  const f1 = await req('POST', '/api/fornecedores', { id: ids.forn1, nome: 'Distribuidora Norte', contato: '(11) 99999-0001', tipoInsumo: 'Farinhas e Grãos' });
  ok('POST /api/fornecedores (1)', f1.ok);

  const f2 = await req('POST', '/api/fornecedores', { id: ids.forn2, nome: 'Frigorífico Sul', contato: '(21) 98888-0002', tipoInsumo: 'Carnes' });
  ok('POST /api/fornecedores (2)', f2.ok);

  const fList = await req('GET', '/api/fornecedores');
  ok('GET /api/fornecedores lista fornecedores', fList.data?.length >= 2);

  const fUpd = await req('PUT', `/api/fornecedores/${ids.forn1}`, { nome: 'Distribuidora Norte Ltda', contato: '(11) 99999-1111', tipoInsumo: 'Farinhas' });
  ok('PUT /api/fornecedores/:id atualiza', fUpd.ok);

  // ========== 4. INGREDIENTES ==========
  console.log('\n🥕 4. Ingredientes');
  ids.goma = crypto.randomUUID();
  ids.frango = crypto.randomUUID();
  ids.queijo = crypto.randomUUID();
  ids.pao = crypto.randomUUID();
  ids.carne = crypto.randomUUID();
  ids.bacon = crypto.randomUUID();

  const ingredientes = [
    { id: ids.goma, nome: 'Goma de Tapioca', unidade: 'kg', precoCusto: 6.0, estoque: 20 },
    { id: ids.frango, nome: 'Frango Desfiado', unidade: 'kg', precoCusto: 28.0, estoque: 10 },
    { id: ids.queijo, nome: 'Queijo Coalho', unidade: 'kg', precoCusto: 32.0, estoque: 5 },
    { id: ids.pao, nome: 'Pão de Hambúrguer', unidade: 'un', precoCusto: 1.2, estoque: 100 },
    { id: ids.carne, nome: 'Carne 150g', unidade: 'un', precoCusto: 4.0, estoque: 80 },
    { id: ids.bacon, nome: 'Bacon (fatias)', unidade: 'un', precoCusto: 0.8, estoque: 200 },
  ];

  for (const ing of ingredientes) {
    const r = await req('POST', '/api/ingredientes', ing);
    ok(`POST ingrediente: ${ing.nome}`, r.ok);
  }

  const iList = await req('GET', '/api/ingredientes');
  ok(`GET /api/ingredientes lista ${iList.data?.length} ingredientes`, iList.data?.length >= 6);

  const iUpd = await req('PUT', `/api/ingredientes/${ids.goma}`, { nome: 'Goma de Tapioca Premium', unidade: 'kg', precoCusto: 7.0, estoque: 20 });
  ok('PUT /api/ingredientes/:id atualiza', iUpd.ok);

  const iPatch = await req('PATCH', `/api/ingredientes/${ids.frango}/estoque`, { quantidade: 5 });
  ok('PATCH /api/ingredientes/:id/estoque (+5)', iPatch.ok);

  const iPatch2 = await req('PATCH', `/api/ingredientes/${ids.frango}/estoque`, { quantidade: -2 });
  ok('PATCH /api/ingredientes/:id/estoque (-2)', iPatch2.ok);

  // ========== 5. GRUPOS DE OPCIONAIS ==========
  console.log('\n⚙️  5. Grupos de Opcionais');
  ids.grupo1 = crypto.randomUUID();

  const g1 = await req('POST', '/api/grupos', {
    id: ids.grupo1,
    nome: 'Turbine seu Lanche',
    min: 0, max: 0,
    opcoes: [
      { id: crypto.randomUUID(), nome: 'Bacon Extra', precoExtra: 4.5, ingredienteId: ids.bacon, quantidade: 3 },
      { id: crypto.randomUUID(), nome: 'Carne Extra', precoExtra: 8.0, ingredienteId: ids.carne, quantidade: 1 },
      { id: crypto.randomUUID(), nome: 'Queijo Cheddar', precoExtra: 3.0, ingredienteId: '', quantidade: 0 },
    ]
  });
  ok('POST /api/grupos cria grupo com opções', g1.ok);

  const gList = await req('GET', '/api/grupos');
  ok(`GET /api/grupos lista ${gList.data?.length} grupo(s)`, gList.data?.length >= 1);

  const gUpd = await req('PUT', `/api/grupos/${ids.grupo1}`, {
    nome: 'Turbine seu Lanche!',
    min: 0, max: 3,
    opcoes: [
      { id: crypto.randomUUID(), nome: 'Bacon Extra', precoExtra: 5.0, ingredienteId: ids.bacon, quantidade: 3 },
      { id: crypto.randomUUID(), nome: 'Carne Extra', precoExtra: 8.0, ingredienteId: ids.carne, quantidade: 1 },
    ]
  });
  ok('PUT /api/grupos/:id atualiza', gUpd.ok);

  // ========== 6. PRODUTOS ==========
  console.log('\n📦 6. Produtos');
  ids.tapioca = crypto.randomUUID();
  ids.hamburguer = crypto.randomUUID();
  ids.coca = crypto.randomUUID();
  ids.suco = crypto.randomUUID();

  const produtos = [
    {
      id: ids.tapioca, nome: 'Tapioca Frango com Queijo', precoVenda: 14.0, precoCusto: 5.0,
      estoque: 0, categoria: 'Tapiocas', setorProducao: 'Cozinha',
      fichaTecnica: [
        { ingredienteId: ids.goma, quantidade: 0.08 },
        { ingredienteId: ids.frango, quantidade: 0.10 },
        { ingredienteId: ids.queijo, quantidade: 0.05 },
      ],
      gruposIds: []
    },
    {
      id: ids.hamburguer, nome: 'Hambúrguer Artesanal', precoVenda: 22.0, precoCusto: 8.0,
      estoque: 0, categoria: 'Hambúrgueres', setorProducao: 'Chapa',
      fichaTecnica: [
        { ingredienteId: ids.pao, quantidade: 1 },
        { ingredienteId: ids.carne, quantidade: 1 },
      ],
      gruposIds: [ids.grupo1]
    },
    {
      id: ids.coca, nome: 'Coca-Cola 350ml', precoVenda: 6.0, precoCusto: 3.5,
      estoque: 48, categoria: 'Bebidas', setorProducao: '',
      fichaTecnica: [], gruposIds: []
    },
    {
      id: ids.suco, nome: 'Suco de Laranja Natural', precoVenda: 10.0, precoCusto: 3.0,
      estoque: 30, categoria: 'Bebidas', setorProducao: 'Bar',
      fichaTecnica: [], gruposIds: []
    },
  ];

  for (const prod of produtos) {
    const r = await req('POST', '/api/produtos', prod);
    ok(`POST produto: ${prod.nome}`, r.ok);
  }

  const pList = await req('GET', '/api/produtos');
  ok(`GET /api/produtos lista ${pList.data?.length} produtos`, pList.data?.length >= 4);

  const pUpd = await req('PUT', `/api/produtos/${ids.coca}`, {
    nome: 'Coca-Cola 350ml Gelada', precoVenda: 7.0, precoCusto: 3.5,
    estoque: 48, categoria: 'Bebidas', fichaTecnica: [], gruposIds: []
  });
  ok('PUT /api/produtos/:id atualiza', pUpd.ok);

  const pPatch = await req('PATCH', `/api/produtos/${ids.coca}/estoque`, { quantidade: -1 });
  ok('PATCH /api/produtos/:id/estoque (-1)', pPatch.ok);

  // ========== 7. TURNO ==========
  console.log('\n📊 7. Turnos');
  ids.turno = crypto.randomUUID();

  const tAbrir = await req('POST', '/api/turnos/abrir', { id: ids.turno, saldoInicial: 150.0, operador: 'Teste API' });
  ok('POST /api/turnos/abrir abre turno', tAbrir.ok);

  const tAtual = await req('GET', '/api/turnos/atual');
  ok('GET /api/turnos/atual retorna turno aberto', tAtual.data?.id === ids.turno);

  // ========== 8. TRANSAÇÕES (VENDAS) ==========
  console.log('\n💰 8. Transações (Vendas)');
  ids.venda1 = crypto.randomUUID();
  ids.venda2 = crypto.randomUUID();

  const v1 = await req('POST', '/api/transacoes', {
    id: ids.venda1, tipo: 'entrada', subtipo: 'venda', turnoId: ids.turno,
    valor: 20.0, metodoPagamento: 'Dinheiro',
    descricao: 'Venda: Tapioca Frango, Coca-Cola',
    itens: [
      { id: ids.tapioca, nome: 'Tapioca Frango', precoVenda: 14.0, quantidade: 1 },
      { id: ids.coca, nome: 'Coca-Cola 350ml', precoVenda: 6.0, quantidade: 1 },
    ]
  });
  ok('POST /api/transacoes venda #1 (Dinheiro R$20)', v1.ok);

  const v2 = await req('POST', '/api/transacoes', {
    id: ids.venda2, tipo: 'entrada', subtipo: 'venda', turnoId: ids.turno,
    valor: 32.0, metodoPagamento: 'Pix',
    descricao: 'Venda: Hambúrguer + Suco',
    itens: [
      { id: ids.hamburguer, nome: 'Hambúrguer Artesanal', precoVenda: 22.0, quantidade: 1 },
      { id: ids.suco, nome: 'Suco de Laranja', precoVenda: 10.0, quantidade: 1 },
    ]
  });
  ok('POST /api/transacoes venda #2 (Pix R$32)', v2.ok);

  // ========== 9. TRANSAÇÕES (DESPESAS) ==========
  console.log('\n💸 9. Transações (Despesas)');
  ids.despesa1 = crypto.randomUUID();

  const d1 = await req('POST', '/api/transacoes', {
    id: ids.despesa1, tipo: 'saida', subtipo: 'despesa', turnoId: ids.turno,
    valor: 80.0, motivo: 'Compra de Insumos',
    descricao: '5kg de frango desfiado',
  });
  ok('POST /api/transacoes despesa (R$80)', d1.ok);

  const tList = await req('GET', `/api/transacoes?turnoId=${ids.turno}`);
  ok(`GET /api/transacoes?turnoId filtra ${tList.data?.length} transações`, tList.data?.length === 3);

  const tAll = await req('GET', '/api/transacoes');
  ok(`GET /api/transacoes lista todas (${tAll.data?.length})`, tAll.data?.length >= 3);

  // ========== 10. FECHAR TURNO ==========
  console.log('\n🔒 10. Fechar Turno');
  const tFechar = await req('POST', '/api/turnos/fechar', {
    id: ids.turno, saldoFinal: 120.0, saldoEsperado: 122.0, diferenca: -2.0
  });
  ok('POST /api/turnos/fechar fecha turno', tFechar.ok);

  const tAtual2 = await req('GET', '/api/turnos/atual');
  ok('GET /api/turnos/atual retorna null (turno fechado)', tAtual2.data === null);

  const tHist = await req('GET', '/api/turnos');
  ok(`GET /api/turnos retorna histórico (${tHist.data?.length})`, tHist.data?.length >= 1);

  // ========== 11. DELETE ==========
  console.log('\n🗑️  11. Delete (Teste de remoção)');
  const delForn = await req('DELETE', `/api/fornecedores/${ids.forn2}`);
  ok('DELETE /api/fornecedores/:id remove fornecedor', delForn.ok);

  const fList2 = await req('GET', '/api/fornecedores');
  const forn2Exists = fList2.data?.some(f => f.id === ids.forn2);
  ok('Fornecedor removido não aparece mais na lista', !forn2Exists);

  // ========== RESULTADO ==========
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RESULTADO: ${passed} aprovados | ${failed} falharam | ${passed + failed} total\n`);

  if (failed === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM!\n');
  } else {
    console.log(`⚠️  ${failed} teste(s) falharam.\n`);
  }
}

run().catch(err => {
  console.error('Erro fatal:', err.message);
  process.exit(1);
});
