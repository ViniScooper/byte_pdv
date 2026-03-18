# 🔌 Referência de Endpoints da API

**Base URL:** `http://localhost:3001`

---

## 🔐 Autenticação (`/auth`)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| `POST` | `/auth/login` | Login com email/senha → retorna JWT | Público |
| `GET` | `/auth/me` | Retorna dados do usuário logado | JWT |
| `POST` | `/auth/register` | Cria novo usuário | Admin |
| `GET` | `/auth/users` | Lista todos os usuários | Admin |
| `DELETE` | `/auth/users/:id` | Remove um usuário | Admin |

### POST /auth/login
```json
// Request
{ "email": "admin", "password": "admin123" }

// Response 200
{ "token": "eyJhbG...", "user": { "id": "...", "name": "Administrador", "email": "admin", "role": "ADMIN" } }
```

### POST /auth/register
```json
// Request (Header: Authorization: Bearer <token>)
{ "name": "Maria", "email": "maria@cantina.com", "password": "123456", "role": "CAIXA" }
```

---

## 📦 Produtos (`/api/produtos`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/produtos` | Lista todos os produtos |
| `POST` | `/api/produtos` | Cria um produto |
| `PUT` | `/api/produtos/:id` | Atualiza um produto |
| `PATCH` | `/api/produtos/:id/estoque` | Ajusta estoque (+/-) |
| `DELETE` | `/api/produtos/:id` | Remove um produto |

### POST /api/produtos
```json
{
  "id": "uuid-gerado",
  "nome": "Tapioca Frango",
  "precoVenda": 12.00,
  "precoCusto": 4.50,
  "estoque": 50,
  "categoria": "Tapiocas",
  "setorProducao": "Cozinha",
  "fichaTecnica": [
    { "ingredienteId": "uuid-frango", "quantidade": 0.1 }
  ],
  "gruposIds": ["uuid-grupo-adicionais"]
}
```

### PATCH /api/produtos/:id/estoque
```json
{ "quantidade": -1 }   // Remove 1 do estoque
{ "quantidade": 10 }   // Adiciona 10 ao estoque
```

---

## 🥕 Ingredientes (`/api/ingredientes`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/ingredientes` | Lista todos |
| `POST` | `/api/ingredientes` | Cria um ingrediente |
| `PUT` | `/api/ingredientes/:id` | Atualiza |
| `PATCH` | `/api/ingredientes/:id/estoque` | Ajusta estoque (+/-) |
| `DELETE` | `/api/ingredientes/:id` | Remove |

### POST /api/ingredientes
```json
{
  "id": "uuid-gerado",
  "nome": "Farinha de Tapioca",
  "unidade": "kg",
  "precoCusto": 8.50,
  "estoque": 25
}
```

---

## 👥 Fornecedores (`/api/fornecedores`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/fornecedores` | Lista todos |
| `POST` | `/api/fornecedores` | Cria um fornecedor |
| `PUT` | `/api/fornecedores/:id` | Atualiza |
| `DELETE` | `/api/fornecedores/:id` | Remove |

### POST /api/fornecedores
```json
{
  "id": "uuid-gerado",
  "nome": "Distribuidora Silva",
  "contato": "(11) 99999-1234",
  "tipoInsumo": "Farinhas"
}
```

---

## ⚙️ Grupos de Opcionais (`/api/grupos`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/grupos` | Lista todos os grupos |
| `POST` | `/api/grupos` | Cria um grupo |
| `PUT` | `/api/grupos/:id` | Atualiza |
| `DELETE` | `/api/grupos/:id` | Remove |

### POST /api/grupos
```json
{
  "id": "uuid-gerado",
  "nome": "Turbine seu Lanche",
  "min": 0,
  "max": 0,
  "opcoes": [
    { "id": "uuid", "nome": "Bacon Extra", "precoExtra": 4.50, "ingredienteId": "" },
    { "id": "uuid", "nome": "Ovo", "precoExtra": 2.00, "ingredienteId": "" }
  ]
}
```

> `min: 0` = opcional, `min: 1` = obrigatório. `max: 0` = sem limite.

---

## 📊 Turnos (`/api/turnos`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/turnos` | Histórico de todos os turnos |
| `GET` | `/api/turnos/atual` | Retorna o turno aberto (ou null) |
| `POST` | `/api/turnos/abrir` | Abre um novo turno |
| `POST` | `/api/turnos/fechar` | Fecha o turno atual |

### POST /api/turnos/abrir
```json
{ "id": "uuid", "saldoInicial": 100.00, "operador": "Maria" }
```

### POST /api/turnos/fechar
```json
{ "id": "uuid-do-turno", "saldoFinal": 350.00, "saldoEsperado": 345.00, "diferenca": 5.00 }
```

---

## 💰 Transações (`/api/transacoes`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/transacoes` | Lista todas (filtro por `?turnoId=xxx`) |
| `POST` | `/api/transacoes` | Registra uma venda ou despesa |

### POST /api/transacoes (Venda)
```json
{
  "id": "uuid",
  "tipo": "entrada",
  "subtipo": "venda",
  "turnoId": "uuid-turno",
  "valor": 20.00,
  "metodoPagamento": "Pix",
  "descricao": "Venda: Tapioca Frango, Suco de Laranja",
  "itens": [
    { "id": "uuid-prod", "nome": "Tapioca Frango", "precoVenda": 12.00, "quantidade": 1 }
  ]
}
```

### POST /api/transacoes (Despesa)
```json
{
  "id": "uuid",
  "tipo": "saida",
  "subtipo": "despesa",
  "turnoId": "uuid-turno",
  "valor": 150.00,
  "motivo": "Compra de Insumos",
  "descricao": "10kg de farinha de trigo"
}
```

---

## 🩺 Health Check

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Verifica se a API está online |

```json
// Response 200
{ "status": "ok", "message": "Cantina Cloud API is running!" }
```
