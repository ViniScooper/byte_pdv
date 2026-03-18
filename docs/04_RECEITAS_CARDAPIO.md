# 🍔 Guia de Receitas e Cardápio

Este guia mostra como cadastrar diferentes tipos de produtos no sistema, usando a **Ficha Técnica** e os **Grupos de Opcionais** para montar receitas completas.

---

## Conceitos Importantes

### Ficha Técnica
A ficha técnica define **quais ingredientes** compõem um produto e **quanto de cada** é usado por unidade vendida. Quando o produto é vendido, o estoque dos ingredientes é baixado automaticamente.

### Grupos de Opcionais
Opcionais são **adicionais que o cliente pode escolher** (ex: bacon extra, queijo cheddar). Cada opcional pode ter um **preço extra** e **baixar ingrediente do estoque**.

---

## 🌮 Exemplo 1: Tapioca de Frango com Queijo

### Passo 1: Cadastrar os Ingredientes
Vá em **Cadastros → Ingredientes** e adicione:

| Ingrediente | Unidade | Custo | Estoque |
|---|---|---|---|
| Goma de Tapioca | kg | R$ 6,00 | 20 kg |
| Frango Desfiado | kg | R$ 28,00 | 10 kg |
| Queijo Coalho | kg | R$ 32,00 | 5 kg |

### Passo 2: Cadastrar o Produto com Ficha Técnica
Vá em **Cadastros → Produtos → Novo Produto**:

- **Nome:** Tapioca Frango com Queijo
- **Preço Venda:** R$ 14,00
- **Categoria:** Tapiocas
- **Setor de Produção:** Cozinha

Clique em **"Ficha Técnica"** e adicione:

| Ingrediente | Quantidade por unidade |
|---|---|
| Goma de Tapioca | 0.08 kg (80g) |
| Frango Desfiado | 0.10 kg (100g) |
| Queijo Coalho | 0.05 kg (50g) |

> A cada tapioca vendida, o sistema desconta automaticamente 80g de goma, 100g de frango e 50g de queijo.

---

## 🍔 Exemplo 2: Hambúrguer Artesanal com Opcionais

### Passo 1: Cadastrar Ingredientes
| Ingrediente | Unidade | Custo | Estoque |
|---|---|---|---|
| Pão de Hambúrguer | un | R$ 1,20 | 100 |
| Carne 150g | un | R$ 4,00 | 80 |
| Alface | un | R$ 0,30 | 200 |
| Tomate | un | R$ 0,40 | 150 |
| Bacon (fatias) | un | R$ 0,80 | 200 |
| Cheddar (fatia) | un | R$ 0,60 | 200 |
| Ovo | un | R$ 0,50 | 100 |

### Passo 2: Criar o Grupo de Opcionais
Vá em **Cadastros → Opcionais → Novo Grupo**:

- **Nome:** Turbine seu Hambúrguer
- **Qtd Mínima:** 0 (opcional)
- **Qtd Máxima:** 0 (sem limite)

Adicione as opções:

| Opção | Preço Extra | Ingrediente Vinculado | Qtd por Porção |
|---|---|---|---|
| Bacon Extra | R$ 4,00 | Bacon (fatias) | 3 |
| Cheddar Extra | R$ 3,00 | Cheddar (fatia) | 2 |
| Ovo Frito | R$ 2,50 | Ovo | 1 |
| Carne Extra | R$ 8,00 | Carne 150g | 1 |

### Passo 3: Cadastrar o Produto
- **Nome:** Hambúrguer Artesanal
- **Preço Venda:** R$ 22,00
- **Categoria:** Hambúrgueres
- **Setor de Produção:** Chapa

Na **Ficha Técnica**:

| Ingrediente | Quantidade |
|---|---|
| Pão de Hambúrguer | 1 |
| Carne 150g | 1 |
| Alface | 1 |
| Tomate | 1 |

Clique em **"Vincular Opcionais"** e selecione o grupo **"Turbine seu Hambúrguer"**.

> Quando o caixa vender, o cliente pode adicionar Bacon, Cheddar, etc. O preço é somado e o estoque é baixado automaticamente.

---

## 🥪 Exemplo 3: Sanduíche Natural (Produto Simples)

Se o produto **não tem ficha técnica** (comprado pronto), basta controlar o estoque direto:

- **Nome:** Sanduíche Natural
- **Preço Venda:** R$ 9,50
- **Categoria:** Sanduíches
- **Estoque Inicial:** 30

> Sem ficha técnica, o sistema baixa 1 unidade do estoque a cada venda.

---

## ☕ Exemplo 4: Bebidas

### Produto Pronto (Revenda)
- **Nome:** Coca-Cola 350ml
- **Preço Venda:** R$ 6,00
- **Preço Custo:** R$ 3,50
- **Categoria:** Bebidas
- **Estoque Inicial:** 48

### Produto Feito na Hora (com Ficha Técnica)
- **Nome:** Suco de Laranja Natural
- **Preço Venda:** R$ 10,00
- **Categoria:** Bebidas
- **Setor de Produção:** Bar

Ficha Técnica:

| Ingrediente | Quantidade |
|---|---|
| Laranja | 4 un |
| Açúcar | 0.02 kg (20g) |

---

## 🎯 Resumo: Quando usar cada funcionalidade

| Cenário | Usar |
|---|---|
| Produto comprado pronto (coca-cola, chips) | Apenas **estoque direto** |
| Produto feito na hora (tapioca, suco) | **Ficha Técnica** (ingredientes) |
| Produto com opcionais (hambúrguer customizável) | **Ficha Técnica** + **Grupo de Opcionais** |
| Combo (vários itens juntos) | Cadastrar produto com ficha técnica contendo todos os itens |

---

## 💡 Dicas

- **Calcule a margem de lucro**: o sistema mostra automaticamente se você preencher o preço de custo
- **Vincule ingredientes aos opcionais**: assim o estoque é baixado automaticamente quando o cliente pede bacon extra, por exemplo
- **Use categorias**: facilita a organização no PDV (Tapiocas, Hambúrgueres, Bebidas, Sobremesas)
- **Setor de Produção**: permite direcionar pedidos para a cozinha, chapa ou bar
