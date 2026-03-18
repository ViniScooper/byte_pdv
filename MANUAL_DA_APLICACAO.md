# Manual do Sistema PDV Byte

Este documento fornece uma visão geral completa do sistema PDV Byte, detalhando suas funcionalidades, arquitetura técnica e fluxos de operação.

## 1. Visão Geral
O **PDV Byte** é um sistema de Ponto de Venda (Point of Sale) leve e eficiente, desenvolvido para pequenos e médios estabelecimentos comerciais. Ele permite o gerenciamento completo de vendas, estoque de insumos e produtos, controle de caixa por turnos e registro de despesas.

## 2. Arquitetura Técnica
- **Framework**: React 19 com Vite.
- **Gerenciamento de Estado**: React Context API (`AppContext`).
- **Persistência de Dados**: LocalStorage do navegador (sem necessidade de servidor de banco de dados externo para operação local).
- **Roteamento**: React Router DOM.
- **Estilização**: CSS Vanilla com foco em responsividade.
- **Ícones**: Lucide-React.

## 3. Módulos do Sistema

### 3.1 Dashboard (Início)
É o centro de controle financeiro imediato.
- **Controle de Turnos**: Permite abrir e fechar o expediente. Nenhuma venda ou despesa pode ser registrada sem um turno aberto.
- **Resumo Financeiro**: Exibe em tempo real o Fundo de Caixa (Saldo Inicial), Total de Entradas (Vendas), Total de Saídas (Despesas) e o Saldo Atual.
- **Fechamento de Caixa**: Processo assistido onde o operador informa o valor físico em mãos e o sistema calcula a "Quebra de Caixa" (diferença entre o esperado e o real).

### 3.2 Ponto de Venda (PDV)
Interface de frente de caixa para registro de vendas.
- **Catálogo de Produtos**: Exibição visual dos produtos cadastrados.
- **Customização de Pedidos**: Modal interativo para produtos que possuem opcionais ou grupos de opções (ex: "Escolha o molho", "Adicionais").
- **Mesas e Comandas**: Suporte para manter contas abertas vinculadas a uma identificação (Mesa 01, Comanda João, etc.).
- **Baixa de Estoque Automática**: Ao finalizar uma venda, o estoque é reduzido proporcionalmente.

### 3.3 Cadastros (Configuração)
Onde o sistema é alimentado com informações base.
- **Fornecedores**: Registro de parceiros comerciais.
- **Ingredientes/Insumos**: Matéria-prima (ex: Farinha, Queijo, Embalagem). Gerencia unidade de medida (kg, g, un) e custo.
- **Grupos de Opções**: Conjuntos de escolhas para os produtos, com definição de limites mínimos e máximos.
- **Produtos e Fichas Técnicas**: 
    - Cadastro do item de venda.
    - **Ficha Técnica**: Vínculo entre o produto e seus ingredientes. Permite que a venda de um "X-Burguer" baixe automaticamente 100g de carne e 1 pão do estoque de insumos.

### 3.4 Despesas e Saídas
Registro de todo dinheiro que sai do caixa.
- **Fluxo de Reabastecimento**: Ao registrar uma despesa de compra de mercadoria, o usuário pode selecionar o ingrediente ou produto e informar a quantidade, alimentando o estoque automaticamente.
- **Registro Fotográfico**: Possibilidade de anexar fotos de notas fiscais ou recibos para auditoria futura.

### 3.5 Relatórios
Visualização histórica e analítica.
- **Histórico de Transações**: Lista detalhada de todas as entradas e saídas.
- **Histórico de Turnos**: Registro de todos os expedientes encerrados e suas respectivas quebras de caixa.
- **Controle de Estoque**: Visão geral do que precisa ser reposto.

## 4. Diferenciais Operacionais

- **Dedução Inteligente de Estoque**: O sistema diferencia entre produtos de revenda simples (baixa no próprio produto) e produtos produzidos (baixa nos ingredientes via Ficha Técnica).
- **Validação de Opcionais**: Garante que o operador selecione o número correto de itens obrigatórios antes de adicionar ao carrinho.
- **Operação Offline-First**: Por utilizar LocalStorage, o sistema funciona perfeitamente sem internet após o carregamento inicial.

## 5. Fluxo de Trabalho Recomendado

1. **Setup**: Cadastrar Fornecedores → Cadastrar Ingredientes → Criar Grupos de Opções → Cadastrar Produtos (com Ficha Técnica).
2. **Operação Diária**: Abrir Turno (Dashboard) → Realizar Vendas (PDV) → Registrar Compras/Contas (Despesas).
3. **Fim de Turno**: Fechar Turno (Dashboard) → Conferência de Dinheiro → Análise de Lucro Líquido.

---
*Documento gerado para a equipe de operação e desenvolvimento do PDV Byte.*
