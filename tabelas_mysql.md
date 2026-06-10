# Estrutura do Banco de Dados (MySQL) - PDV Cantina

Este documento descreve detalhadamente as tabelas necessárias para o funcionamento do sistema PDV Cantina em MySQL. O banco de dados padrão é chamado `pdv_cantina`.

---

## Índice das Tabelas

1. [User](#1-user)
2. [Shift](#2-shift)
3. [Supplier](#3-supplier)
4. [Ingredient](#4-ingredient)
5. [Product](#5-product)
6. [TechnicalSheet](#6-technicalsheet)
7. [OptionGroup](#7-optiongroup)
8. [OptionItem](#8-optionitem)
9. [Order](#9-order)
10. [OrderItem](#10-orderitem)
11. [Expense](#11-expense)
12. [Transacao](#12-transacao)
13. [GrupoOpcoes](#13-grupoopcoes)
14. [Mesa](#14-mesa)
15. [ProdutoGrupo](#15-produtogrupo)

---

## Detalhes das Tabelas

### 1. User
Armazena os usuários e operadores do sistema.

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | Não | - | PK | Identificador único (UUID) |
| `name` | `VARCHAR(191)` | Não | - | - | Nome completo do usuário |
| `email` | `VARCHAR(191)` | Não | - | Unique | E-mail do usuário (usado no login) |
| `pictureUrl` | `VARCHAR(191)` | Sim | NULL | - | URL da foto do perfil (Google OAuth) |
| `googleId` | `VARCHAR(191)` | Sim | NULL | Unique | ID do usuário no Google OAuth |
| `role` | `ENUM('ADMIN', 'CAIXA')` | Não | `'CAIXA'` | - | Nível de acesso do usuário |
| `createdAt` | `DATETIME(3)` | Não | `CURRENT_TIMESTAMP(3)` | - | Data de criação da conta |

---

### 2. Shift
Controla as sessões de caixa (turnos/abertura e fechamento de caixa).

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | Não | - | PK | Identificador único do turno |
| `userId` | `VARCHAR(191)` | Sim | NULL | FK | Usuário que abriu o turno (ref. `User.id`) |
| `startTime` | `DATETIME(3)` | Sim | NULL | - | Data/Hora de abertura do turno |
| `endTime` | `DATETIME(3)` | Sim | NULL | - | Data/Hora de fechamento |
| `initialBalance` | `DOUBLE` | Não | `0` | - | Saldo inicial em caixa |
| `finalExpectedBalance` | `DOUBLE` | Sim | NULL | - | Saldo final estimado pelo sistema |
| `finalActualBalance` | `DOUBLE` | Sim | NULL | - | Saldo final real informado pelo operador |
| `status` | `ENUM('OPEN', 'CLOSED')`| Não | `'OPEN'` | - | Estado atual do turno |
| `operador` | `VARCHAR(255)` | Sim | NULL | - | Nome do operador do turno |
| `saldoInicial` | `DOUBLE` | Sim | `0` | - | Saldo inicial em dinheiro |
| `saldoFinal` | `DOUBLE` | Sim | NULL | - | Saldo final contado |
| `saldoEsperado` | `DOUBLE` | Sim | NULL | - | Saldo esperado no fechamento |
| `diferenca` | `DOUBLE` | Sim | NULL | - | Diferença entre o esperado e o real |
| `abertoEm` | `DATETIME(3)` | Sim | `CURRENT_TIMESTAMP(3)`| - | Timestamp de abertura |
| `fechadoEm` | `DATETIME(3)` | Sim | NULL | - | Timestamp de fechamento |

---

### 3. Supplier
Armazena informações dos fornecedores de insumos/ingredientes.

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | Não | - | PK | Identificador único do fornecedor |
| `name` | `VARCHAR(191)` | Não | - | - | Nome do fornecedor |
| `contact` | `VARCHAR(191)` | Sim | NULL | - | Informações de contato (Telefone/Email) |
| `document` | `VARCHAR(191)` | Sim | NULL | - | CNPJ ou CPF do fornecedor |
| `tipoInsumo` | `VARCHAR(255)` | Sim | NULL | - | Categoria de insumos fornecida |

---

### 4. Ingredient
Insumos e matérias-primas usadas para fabricar os produtos.

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | Não | - | PK | Identificador do ingrediente |
| `name` | `VARCHAR(191)` | Não | - | - | Nome do ingrediente |
| `measurementUnit` | `ENUM('KG', 'G', 'L', 'ML', 'UN')` | Não | `'UN'` | - | Unidade padrão do Prisma |
| `costPrice` | `DOUBLE` | Não | `0` | - | Preço de custo padrão |
| `stockQuantity` | `DOUBLE` | Não | `0` | - | Quantidade atual em estoque |
| `supplierId` | `VARCHAR(191)` | Sim | NULL | FK | Fornecedor (ref. `Supplier.id`) |
| `unidade` | `VARCHAR(10)` | Sim | `'un'` | - | Unidade de medida textual para frontend |
| `precoCusto` | `DOUBLE` | Sim | `0` | - | Preço de custo |
| `estoque` | `DOUBLE` | Sim | `0` | - | Quantidade em estoque atualizada |
| `createdAt` | `DATETIME(3)` | Sim | `CURRENT_TIMESTAMP(3)`| - | Data de cadastro |

---

### 5. Product
Produtos que são vendidos no PDV da cantina.

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | Não | - | PK | Identificador único do produto |
| `name` | `VARCHAR(191)` | Não | - | - | Nome do produto |
| `description` | `VARCHAR(191)` | Sim | NULL | - | Descrição curta do produto |
| `price` | `DOUBLE` | Não | - | - | Preço de venda padrão |
| `imageUrl` | `VARCHAR(191)` | Sim | NULL | - | URL da imagem do produto |
| `isManufactured` | `TINYINT(1)` | Não | `0` (Falso) | - | `1` se o produto for produzido na cantina |
| `precoVenda` | `DOUBLE` | Sim | `0` | - | Preço de venda (Frontend) |
| `precoCusto` | `DOUBLE` | Sim | `0` | - | Preço de custo calculado |
| `estoque` | `DOUBLE` | Sim | `0` | - | Quantidade física em estoque |
| `categoria` | `VARCHAR(100)` | Sim | NULL | - | Categoria do produto (ex: Bebidas, Salgados)|
| `setorProducao` | `VARCHAR(100)` | Sim | NULL | - | Setor responsável (ex: Cozinha, Copa) |
| `createdAt` | `DATETIME(3)` | Sim | `CURRENT_TIMESTAMP(3)`| - | Data de criação do produto |
| `fichaTecnicaJson`| `TEXT` | Sim | NULL | - | Lista de ingredientes associados em JSON |
| `gruposIdsJson` | `TEXT` | Sim | NULL | - | Grupos de opções adicionais em JSON |

---

### 6. TechnicalSheet
Associa ingredientes aos produtos fabricados (Ficha Técnica).

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | Não | - | PK | Identificador da associação |
| `productId` | `VARCHAR(191)` | Não | - | FK | Produto associado (ref. `Product.id`) |
| `ingredientId` | `VARCHAR(191)` | Não | - | FK | Ingrediente associado (ref. `Ingredient.id`) |
| `quantityNeeded`| `DOUBLE` | Não | - | - | Quantidade necessária do ingrediente |

---

### 7. OptionGroup
Grupos de adicionais/opções para um produto (ex: "Escolha o molho", "Adicionais do Hambúrguer").

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | Não | - | PK | Identificador único do grupo |
| `name` | `VARCHAR(191)` | Não | - | - | Nome do grupo (ex: "Adicionais") |
| `minOptions` | `INTEGER` | Não | `0` | - | Quantidade mínima de itens selecionáveis |
| `maxOptions` | `INTEGER` | Não | `1` | - | Quantidade máxima de itens selecionáveis |
| `productId` | `VARCHAR(191)` | Não | - | FK | Produto pai (ref. `Product.id`) |

---

### 8. OptionItem
Itens específicos dentro de um grupo de opções (ex: "Maionese", "Bacon", "Queijo").

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | Não | - | PK | Identificador único do item |
| `groupId` | `VARCHAR(191)` | Não | - | FK | Grupo pertencente (ref. `OptionGroup.id`) |
| `name` | `VARCHAR(191)` | Não | - | - | Nome da opção |
| `additionalPrice`| `DOUBLE` | Não | `0` | - | Preço adicional cobrado ao selecionar este item |

---

### 9. Order
Registra os cabeçalhos das vendas (Pedidos).

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | Não | - | PK | Identificador único do pedido |
| `shiftId` | `VARCHAR(191)` | Não | - | FK | Turno em que a venda ocorreu (ref. `Shift.id`) |
| `totalAmount` | `DOUBLE` | Não | - | - | Valor total bruto do pedido |
| `discount` | `DOUBLE` | Não | `0` | - | Valor do desconto aplicado |
| `paymentMethod` | `ENUM('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO')` | Não | `'DINHEIRO'` | - | Forma de pagamento utilizada |
| `status` | `ENUM('PENDING', 'COMPLETED', 'CANCELLED')` | Não | `'COMPLETED'` | - | Estado da venda |
| `createdAt` | `DATETIME(3)` | Não | `CURRENT_TIMESTAMP(3)`| - | Data e hora em que a venda foi realizada |

---

### 10. OrderItem
Itens comprados em um pedido específico.

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | Não | - | PK | Identificador único do item do pedido |
| `orderId` | `VARCHAR(191)` | Não | - | FK | Pedido associado (ref. `Order.id`) |
| `productId` | `VARCHAR(191)` | Não | - | FK | Produto vendido (ref. `Product.id`) |
| `quantity` | `INTEGER` | Não | - | - | Quantidade vendida |
| `unitPrice` | `DOUBLE` | Não | - | - | Preço unitário praticado na venda |
| `totalPrice` | `DOUBLE` | Não | - | - | Valor total do item (`quantidade * preco`) |

---

### 11. Expense
Registra despesas de caixa ou saídas de dinheiro (sangrias).

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | Não | - | PK | Identificador único da despesa |
| `shiftId` | `VARCHAR(191)` | Não | - | FK | Turno da despesa (ref. `Shift.id`) |
| `description` | `VARCHAR(191)` | Não | - | - | Descrição/Motivo da saída |
| `amount` | `DOUBLE` | Não | - | - | Valor retirado do caixa |
| `ingredientId` | `VARCHAR(191)` | Sim | NULL | FK | Ingrediente reposto (opcional, ref. `Ingredient.id`) |
| `receiptUrl` | `VARCHAR(191)` | Sim | NULL | - | URL do comprovante fiscal/recibo anexado |
| `createdAt` | `DATETIME(3)` | Não | `CURRENT_TIMESTAMP(3)`| - | Data e hora do registro |

---

### 12. Transacao
Registra toda movimentação financeira do caixa de forma unificada (Vendas e Despesas).

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(255)` | Não | - | PK | Identificador único da transação |
| `tipo` | `VARCHAR(20)` | Não | - | - | Tipo da transação (ex: `'venda'`, `'despesa'`) |
| `subtipo` | `VARCHAR(50)` | Sim | NULL | - | Detalhe complementar do tipo |
| `turnoId` | `VARCHAR(255)` | Sim | NULL | - | Turno associado (relacionado com `Shift`) |
| `valor` | `DOUBLE` | Não | - | - | Valor movimentado |
| `metodoPagamento`| `VARCHAR(50)` | Sim | NULL | - | Método de pagamento usado (Dinheiro, Pix, Cartão)|
| `descricao` | `TEXT` | Sim | NULL | - | Detalhe textual da transação |
| `motivo` | `VARCHAR(255)` | Sim | NULL | - | Motivo se for despesa/sangria |
| `origem` | `VARCHAR(50)` | Sim | NULL | - | Origem do lançamento |
| `mesaIdentificacao`| `VARCHAR(100)`| Sim | NULL | - | Identificação da mesa vinculada (se houver) |
| `itensJson` | `TEXT` | Sim | NULL | - | Lista de itens da venda salvos em formato JSON |
| `criadoEm` | `DATETIME(3)` | Sim | `CURRENT_TIMESTAMP(3)`| - | Data/Hora do lançamento |

---

### 13. GrupoOpcoes
Opções adicionais estruturadas de forma unificada.

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(255)` | Não | - | PK | Identificador único |
| `nome` | `VARCHAR(255)` | Não | - | - | Nome do grupo |
| `minOpcoes` | `INTEGER` | Sim | `0` | - | Mínimo selecionável |
| `maxOpcoes` | `INTEGER` | Sim | `0` | - | Máximo selecionável |
| `opcoesJson` | `TEXT` | Sim | NULL | - | Lista de opções adicionais e seus preços em JSON |
| `createdAt` | `DATETIME(3)` | Sim | `CURRENT_TIMESTAMP(3)`| - | Data de criação |

---

### 14. Mesa
Tabela que gerencia o consumo por mesas ou comandas abertas.

| Coluna | Tipo MySQL | Nulo? | Padrão | Chave | Descrição |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `VARCHAR(255)` | Não | - | PK | Identificador da mesa (ou comanda) |
| `identificacao` | `VARCHAR(100)`| Não | - | - | Nome/Número da mesa (ex: "Mesa 05") |
| `status` | `VARCHAR(20)` | Sim | `'aberta'` | - | Estado da mesa (ex: `'aberta'`, `'fechada'`) |
| `itensJson` | `TEXT` | Sim | NULL | - | Itens consumidos salvos em formato JSON |
| `criadoEm` | `DATETIME(3)` | Sim | `CURRENT_TIMESTAMP(3)`| - | Data de abertura da mesa |

---

### 15. ProdutoGrupo
Tabela associativa de relacionamento N:N (Muitos para Muitos) entre **Product** (Produtos) e **GrupoOpcoes** (Grupo de Opções).

| Coluna | Tipo MySQL | Nulo? | Chave | Descrição |
| :--- | :--- | :---: | :---: | :--- |
| `produtoId` | `VARCHAR(255)` | Não | PK, FK | Referência ao ID do produto (`Product.id`) |
| `grupoId` | `VARCHAR(255)` | Não | PK, FK | Referência ao ID do grupo (`GrupoOpcoes.id`) |
