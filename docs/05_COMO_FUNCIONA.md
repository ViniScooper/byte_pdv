# ⚙️ Como Funciona o Sistema — Fluxo Interno

Este documento explica como o PDV Byte funciona internamente — o fluxo de dados, regras de negócio e como cada parte se conecta.

---

## Fluxo Geral

```
┌─────────┐    ┌───────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐
│  Login  │──►│ Dashboard │──►│   PDV    │──►│  Vendas   │──►│  Fechar  │
│         │    │ Abrir     │    │ Montar   │    │ Registrar │    │  Turno   │
│         │    │ Turno     │    │ Carrinho │    │ Transação │    │          │
└─────────┘    └───────────┘    └──────────┘    └───────────┘    └──────────┘
     │              │                │                │               │
     ▼              ▼                ▼                ▼               ▼
  [User]         [Shift]         [Product]       [Transacao]      [Shift]
  JWT Token      status:OPEN     estoque--       tipo:entrada     status:CLOSED
```

---

## 1. Autenticação

```
Login (email + senha)
  → Backend valida com bcrypt
  → Gera JWT (válido por 12h)
  → Frontend armazena token no localStorage
  → Todas as requisições subsequentes incluem o token
```

**Roles:**
- **ADMIN** — acesso total (criar/deletar usuários, relatórios)
- **CAIXA** — acesso ao PDV, vendas, despesas

---

## 2. Gestão de Turnos

O turno é o **período de operação do caixa**. Sem turno aberto, não é possível vender.

```
Abrir Turno (saldoInicial: R$ 100)
  → Cria registro na tabela Shift (status: OPEN)
  → Dashboard mostra Caixa Aberto

[... vendas e despesas durante o dia ...]

Fechar Turno (saldoFinal informado pelo operador)
  → Calcula entradas e saídas do turno
  → Calcula saldo esperado = saldoInicial + entradas - saídas
  → Calcula diferença = saldoFinal - saldoEsperado
  → Atualiza Shift (status: CLOSED)
```

---

## 3. Fluxo de Venda

```
1. Operador clica no produto no PDV
2. Se produto tem opcionais → modal de seleção
3. Item adicionado ao carrinho (estado local)
4. Operador seleciona forma de pagamento
5. Clica "Finalizar Venda"

   → Cria Transacao (tipo: entrada, subtipo: venda)
   → Baixa de estoque:
     - Se tem Ficha Técnica → baixa ingredientes proporcionalmente
     - Se não tem → baixa 1 unidade do produto
     - Se tem opcionais com ingrediente → baixa ingredientes dos opcionais
   → Salva no Azure SQL via POST /api/transacoes
   → Atualiza estoque via PATCH /api/produtos/:id/estoque
```

### Exemplo de Baixa com Ficha Técnica

Venda de 2x "Tapioca Frango" (ficha: 80g goma + 100g frango):
```
Goma de Tapioca:  25.00 kg  →  25.00 - (0.08 × 2) = 24.84 kg
Frango Desfiado:  10.00 kg  →  10.00 - (0.10 × 2) = 9.80 kg
```

---

## 4. Fluxo de Despesa

```
1. Operador vai para Pagamentos/Saídas
2. Preenche valor, motivo e descrição
3. (Opcional) Marca "Atualizar Estoque" → entrada de mercadoria
4. Clica "Registrar"

   → Cria Transacao (tipo: saida, subtipo: despesa)
   → Se atualizou estoque → PATCH /api/ingredientes/:id/estoque ou /api/produtos/:id/estoque
   → Dashboard atualiza saldo: saldoAtual = saldoInicial + entradas - saídas
```

---

## 5. Frontend ↔ Backend (AppContext)

O `AppContext.jsx` é o coração do frontend. Ele usa o padrão **Optimistic Update**:

```
1. Atualiza estado local IMEDIATAMENTE (React re-render rápido)
2. Envia requisição à API em background
3. Se a API falhar → log no console (dados locais podem ficar inconsistentes)
```

```javascript
// Exemplo: addProduto
const addProduto = async (dados) => {
  const id = uuidv4();
  const novo = { id, ...dados };

  // 1. Update otimista (UI atualiza instantaneamente)
  setProdutos(prev => [...prev, novo]);

  // 2. Persiste no banco
  await api('/api/produtos', { method: 'POST', body: JSON.stringify({ id, ...dados }) });

  return novo;
};
```

### Inicialização
Quando o app carrega, o AppContext faz um `Promise.all` para buscar todos os dados do banco:

```javascript
useEffect(() => {
  Promise.all([
    api('/api/fornecedores'),
    api('/api/ingredientes'),
    api('/api/produtos'),
    api('/api/grupos'),
    api('/api/transacoes'),
    api('/api/turnos/atual'),
  ]).then(([forn, ingr, prod, grup, trans, turno]) => {
    // Mapeia cada row do banco para o modelo do frontend
    setFornecedores(forn.map(mapFornecedor));
    // ...
  });
}, []);
```

---

## 6. Mapeamento de Dados (DB ↔ Frontend)

| Campo no Banco | Campo no Frontend | Nota |
|---|---|---|
| `name` | `nome` | Tabelas originais usam `name` em inglês |
| `contact` | `contato` | Supplier |
| `price` / `precoVenda` | `precoVenda` | Product |
| `fichaTecnicaJson` | `fichaTecnica` (array) | JSON serializado no DB |
| `opcoesJson` | `opcoes` (array) | JSON serializado no DB |
| `status: 'OPEN'` | `status: 'aberto'` | Shift |

---

## 7. Segurança

| Camada | Proteção |
|---|---|
| **Transporte** | TLS/SSL (encrypt: true no Azure) |
| **Autenticação** | JWT com expiração de 12h |
| **Senhas** | bcrypt hash (salt rounds: 10) |
| **Autorização** | Middleware verifica role ADMIN para rotas protegidas |
| **Firewall** | Azure SQL aceita apenas IPs autorizados |
| **CORS** | Habilitado para o frontend local |
