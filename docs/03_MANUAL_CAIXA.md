# 🧑‍💼 Manual do Caixa — Fluxo do Dia a Dia

Este guia explica passo a passo como um operador de caixa deve usar o sistema PDV Byte.

---

## 1. 🔑 Login

1. Acesse `http://localhost:5173/login`
2. Digite seu **usuário** e **senha** (fornecidos pelo administrador)
3. Clique em **"Entrar"**

> Se não tem login, peça ao administrador para criar um na tela "Gerenciar Usuários".

---

## 2. 📊 Abrir o Turno (Dashboard)

**Antes de vender qualquer coisa, você precisa abrir o turno.**

1. Na tela do **Dashboard**, clique no botão verde **"Abrir Turno"**
2. Preencha:
   - **Nome do Operador** — seu nome
   - **Saldo Inicial** — valor em dinheiro que já está no caixa (ex: R$ 100,00)
3. Clique em **"Abrir Turno"**

O status mudará de 🔴 **Caixa Fechado** para 🟢 **Caixa Aberto**.

---

## 3. 🛒 Registrar uma Venda (Ponto de Venda)

1. Clique em **"Ponto de Venda"** no menu lateral
2. Você verá os produtos cadastrados em cards
3. **Clique no produto** para adicionar ao carrinho
4. O carrinho aparece à direita com os itens e o **Total a Pagar**
5. Use os botões **+ / -** no carrinho para ajustar quantidades
6. Escolha a **Forma de Pagamento**: Dinheiro, Pix, Crédito ou Débito
7. Clique no botão verde **"Finalizar Venda"**

✅ A venda é registrada e o estoque é atualizado automaticamente.

### Produtos com Opcionais
Se um produto tem opcionais (ex: "Turbine seu Lanche"):
1. Ao clicar no produto, uma janela aparece com as opções
2. Selecione os adicionais desejados (ex: Bacon Extra +R$ 4,50)
3. O preço total é recalculado automaticamente
4. Confirme para adicionar ao carrinho

---

## 4. 🍽️ Mesas / Comandas

Para atender clientes que vão consumir na mesa:

1. Na tela do PDV, clique na aba **"Mesas / Comandas"**
2. Clique em **"Abrir Mesa"** e dê um nome (ex: "Mesa 5", "Comanda João")
3. Adicione itens à mesa clicando nos produtos
4. Quando o cliente for pagar, clique em **"Fechar Mesa"**
5. Escolha a forma de pagamento e confirme

> Mesas ficam abertas até serem fechadas. Você pode adicionar itens a qualquer momento.

---

## 5. 💸 Registrar Despesa / Saída de Caixa

Se precisar tirar dinheiro do caixa (compra de insumos, troco, etc.):

1. Clique em **"Pagamentos/Saídas"** no menu lateral
2. Preencha:
   - **Valor** — quanto saiu do caixa
   - **Fornecedor** (opcional)
   - **Motivo** — selecione (ex: Compra de Insumos, Sangria, etc.)
   - **Descrição** — detalhes (ex: "10kg de farinha de trigo")
3. Se for compra de insumo, pode atualizar o estoque marcando a opção **"Atualizar Estoque"**
4. Clique em **"Registrar"**

---

## 6. 🔒 Fechar o Turno

No final do expediente:

1. Vá para o **Dashboard**
2. Clique no botão vermelho **"Fechar Turno"**
3. Conte o dinheiro no caixa e informe o **saldo final real**
4. O sistema comparará com o **saldo esperado** e mostrará a diferença
5. Confirme o fechamento

O sistema gera um resumo com:
- Total de entradas (vendas)
- Total de saídas (despesas)
- Diferença entre esperado e real

---

## 7. 📋 Resumo do Fluxo

```
Login → Abrir Turno → Vender → (Despesas) → Fechar Turno → Logout
```

| Etapa | O que fazer |
|-------|-------------|
| Início do dia | Login + Abrir Turno com saldo inicial |
| Durante o dia | Registrar vendas no PDV |
| Compras | Registrar despesas em Pagamentos/Saídas |
| Final do dia | Fechar Turno informando o saldo real |

---

## ⚠️ Dicas Importantes

- **Sempre abra o turno** antes de vender — vendas não são registradas sem turno aberto
- **Confira o estoque** — produtos sem estoque não aparecem como disponíveis
- **Forma de pagamento** — selecione antes de finalizar a venda
- **Não feche o navegador** durante uma venda — o carrinho é perdido
- **Se houver dúvida sobre o saldo**, consulte o Dashboard a qualquer momento
