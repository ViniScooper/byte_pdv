# 🏗️ Visão Geral do Sistema — PDV Byte

## O que é

O **PDV Byte** é um sistema de **Ponto de Venda (PDV)** completo para cantinas, lanchonetes e food trucks. Ele gerencia:

- 🛒 **Vendas** — registro rápido de pedidos com carrinho e formas de pagamento
- 📦 **Estoque** — controle de produtos e ingredientes com baixa automática
- 🧾 **Ficha Técnica** — composição de cada produto (quais ingredientes usa)
- 💰 **Caixa/Turnos** — abertura e fechamento de turno com saldo
- 📊 **Relatórios** — movimentações, entradas, saídas
- 👥 **Usuários** — autenticação com papéis (Admin e Caixa)

---

## Tecnologias

### Frontend
| Tecnologia | Uso |
|---|---|
| **React 18** | Biblioteca de interface (SPA) |
| **Vite** | Bundler rápido para desenvolvimento |
| **React Router** | Navegação entre páginas |
| **Lucide React** | Ícones vetoriais |
| **UUID** | Geração de IDs únicos |
| **CSS puro** | Estilização com design system dark moderno |

### Backend
| Tecnologia | Uso |
|---|---|
| **Node.js** | Runtime JavaScript no servidor |
| **Express.js** | Framework HTTP para API REST |
| **mssql** | Driver para Microsoft SQL Server |
| **bcrypt** | Hash de senhas (autenticação segura) |
| **jsonwebtoken (JWT)** | Tokens de sessão para autenticação |
| **dotenv** | Variáveis de ambiente (.env) |
| **Passport.js** | Middleware de autenticação (Google OAuth skeleton) |

### Banco de Dados
| Tecnologia | Uso |
|---|---|
| **Azure SQL Database** | Banco relacional na nuvem Microsoft Azure |
| **Servidor** | `pdvcantina.database.windows.net` |
| **Banco** | `schema_pdv_cantina` |
| **Autenticação** | SQL Authentication (`admin_cantina`) |

---

## Arquitetura

```
┌──────────────────┐     HTTP/JSON      ┌──────────────────┐     SQL/TDS    ┌──────────────────┐
│   Frontend       │  ◄──────────────►  │   Backend        │  ◄──────────►  │  Azure SQL       │
│   React + Vite   │    localhost:5173   │   Express.js     │   porta 1433   │  Database        │
│   (SPA)          │                    │   localhost:3001  │                │  (Nuvem Azure)   │
└──────────────────┘                    └──────────────────┘                └──────────────────┘
```

### Fluxo de Dados
1. O **usuário** interage com a interface React
2. O **AppContext** gerencia o estado e faz chamadas `fetch()` à API
3. A **API Express** recebe a requisição e executa queries SQL
4. O **Azure SQL** persiste os dados na nuvem
5. A resposta volta pelo mesmo caminho

---

## Integração com Azure SQL

O sistema usa o driver `mssql` (não Prisma) para se conectar diretamente ao Azure SQL Database.

### Conexão
```javascript
// backend/src/utils/db.js
const config = {
  user:     'admin_cantina',
  password: '@sistemaPDV123',
  server:   'pdvcantina.database.windows.net',
  database: 'schema_pdv_cantina',
  options: {
    encrypt: true,              // Obrigatório para Azure
    trustServerCertificate: false
  }
};
```

### Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `[User]` | Usuários do sistema (email, senha hash, role) |
| `Product` | Produtos do cardápio |
| `Ingredient` | Ingredientes/insumos |
| `Supplier` | Fornecedores |
| `GrupoOpcoes` | Grupos de opcionais (ex: "Turbine seu Lanche") |
| `Shift` | Turnos de caixa |
| `Transacao` | Vendas e despesas |
| `Mesa` | Mesas/comandas abertas |

### Segurança
- **Criptografia TLS** em todas as conexões (encrypt: true)
- **Senhas** armazenadas com hash bcrypt (nunca em texto puro)
- **JWT** para tokens de sessão (expira em 12h)
- **Firewall do Azure** configurado para permitir apenas IPs autorizados

---

## Estrutura de Pastas

```
pdv_byte/
├── src/                    # Frontend (React)
│   ├── components/         # Sidebar, etc.
│   ├── context/            # AppContext.jsx (estado global)
│   ├── pages/              # Telas (Login, Dashboard, PDV, Cadastros, etc.)
│   └── index.css           # Estilos globais
├── backend/                # Backend (Express)
│   ├── src/
│   │   ├── routes/         # Rotas da API
│   │   ├── utils/          # db.js (pool de conexão)
│   │   ├── config/         # passport.js
│   │   ├── app.js          # Setup do Express
│   │   └── server.js       # Inicialização do servidor
│   └── .env                # Variáveis de ambiente
└── docs/                   # Esta documentação
```
