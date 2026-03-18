# Guia de Processos Totais - PDV Byte

Este documento detalha o fluxo completo de operação do sistema PDV Byte, desde a configuração inicial até o fechamento do expediente.

## 1. Configuração Inicial (O Começo de Tudo)
O sistema não funciona no "vazio". O primeiro passo é alimentar o "Almoxarifado" digital.

- **Cadastro de Fornecedores**: Registre quem te fornece os produtos ou serviços.
- **Cadastro de Ingredientes (Insumos)**: Antes dos produtos, cadastre sua matéria-prima (ex: Goma, Queijo, Frango). Defina a unidade (kg, g, un) e o custo.
- **Cadastro de Produtos + Ficha Técnica**: 
  - Adicione os itens de venda.
  - Se o produto é composto, configure a **Ficha Técnica** vinculando os ingredientes.
  - **Opcionais**: Crie grupos de opções (ex: "Escolha a Proteína") e vincule ao produto.
  - O sistema calcula o lucro baseado nos custos dos insumos ou preço fixo.
  - Defina o **Estoque** (para itens de revenda) ou use a **Baixa por Ficha** (produção).

## 2. Fluxo Diário de Operação

### Manhã / Início do Turno
O sistema funciona baseado em **Turnos**. Nada pode ser vendido sem um caixa aberto.
1. Vá para o **Dashboard**.
2. Clique em **Abrir Turno**.
3. Informe o nome do operador e o **Saldo Inicial** (também chamado de **Fundo de Caixa**), que é o dinheiro para troco.

### Durante o Dia (Operação)
Com o caixa aberto, você pode realizar duas atividades principais:

- **Vendas (Entradas)**: No menu **Ponto de Venda**, selecione os produtos. 
  - Se o produto tiver opcionais, um modal abrirá para customização rápida.
  - O sistema valida se as escolhas obrigatórias foram feitas.
  - Ao finalizar, o estoque é baixado: se houver Ficha Técnica, baixa nos Insumos; se for item simples, baixa no Produto.
- **Pagamentos/Saídas**: No menu **Pagamentos/Saídas**, registre os gastos. 
  - **Reabastecimento**: Se estiver comprando insumos ou mercadoria, selecione o tipo (Produto ou Ingrediente) para atualizar o estoque automaticamente.
  - **Nota Fiscal**: Tire uma foto da nota e anexe ao registro.

## 3. Monitoramento e Auditoria
A qualquer momento, o gestor pode acessar os **Relatórios** para:
- Ver o lucro líquido do momento (Entradas - Saídas).
- Acompanhar a movimentação detalhada.
- Visualizar a galeria de fotos das notas anexadas.

## 4. O Encerramento do Turno (O Final)
No fim do expediente ou na troca de operador:
1. Vá ao **Dashboard** e clique em **Fechar Turno**.
2. O sistema mostrará a **Movimentação Líquida** do dia (Vendas - Despesas) e o **Fundo Inicial**.
3. Conte o dinheiro físico total na gaveta (incluindo o fundo) e informe no campo indicado.
4. O sistema comparará o total contado com o esperado (`Fundo + Movimentação`).
5. Se houver diferença, ela será registrada como **Quebra de Caixa**.

---
**Resumo do ciclo**:
`Cadastro` → `Abertura de Turno` → `Venda/Gasto` → `Conferência` → `Fechamento`.
