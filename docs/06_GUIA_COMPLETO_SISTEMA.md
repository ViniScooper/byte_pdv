# 📖 Guia Completo do Sistema: PDV Byte

Este documento detalha o funcionamento geral do PDV Byte, suas tecnologias base, e explica passo a passo cada tela e fluxo principal do sistema, como a abertura e fechamento de caixa.

---

## 🛠️ Tecnologias Utilizadas

O **PDV Byte** é um sistema moderno de gestão e frente de caixa para cantinas e lanchonetes, construído com tecnologias robustas e de alta performance:

- **Frontend (A Tela do Usuário):** Desenvolvido em **React.js** com **Vite**, garantindo extrema velocidade. A interface foi projetada para ser ágil, usando componentes visuais modernos e ícones do `lucide-react`. O gerenciamento de estado global (onde os dados da sessão ficam armazenados temporariamente na memória do navegador) é feito através da Context API (`AppContext.jsx`).
- **Backend (O Cérebro do Sistema):** Desenvolvido em **Node.js** com o framework **Express**. Ele é responsável por receber os pedidos do frontend, processar regras de negócio, e conversar com o banco de dados de maneira segura através de uma REST API.
- **Banco de Dados (A Memória Permanente):** Utiliza o **Azure SQL Database** (SQL Server na nuvem da Microsoft). O backend se conecta a ele usando a biblioteca `mssql` nativa, o que garante estabilidade e transações seguras (ACID) para todas as vendas, despesas e manuseios de estoque do seu negócio.
- **Autenticação e Segurança:** Utiliza **JWT (JSON Web Tokens)** e criptografia de senhas com **bcrypt**. Cada operador possui um login e as rotas críticas são protegidas.

---

## 🔄 Fluxo de Caixa (O Coração Financeiro)

O sistema trabalha obrigatoriamente sob o conceito de **Turnos de Caixa**. Você não consegue vender ou registrar despesas se o caixa estiver fechado, prevenindo furos financeiros e operações não rastreadas.

### 1️⃣ Caixa Fechado (Estado Inicial)
Quando você entra no sistema no início do dia (ou após o fechamento do turno anterior), o sistema apresenta o estado de "Caixa Fechado".
- Se você acessar o **PDV** ou **Pagamentos/Saídas**, verá um aviso vermelho bloqueando as operações.
- **Motivo:** O sistema precisa saber **quem** está operando o caixa e com **quanto** de dinheiro de troco o caixa está começando.

### 2️⃣ Abrir o Turno
Para começar a trabalhar, vá até o menu principal e acesse o **Dashboard**.
1. Clique em **Abrir Caixa**.
2. Digite o **Saldo Inicial** (exemplo: R$ 50,00 de dinheiro na gaveta para troco).
3. Opcionalmente, confirme o Operador que está assumindo.
4. Clique em Confirmar.
- A partir de agora, o sistema começa a monitorar todas as *Entradas* (vendas) e *Saídas* (despesas/sangrias) amarradas a este turno específico.

### 3️⃣ Operando (Durante o Dia)
Com o caixa aberto, todas as vias do sistema são liberadas. 
- Você atende clientes no PDV.
- Registra compras de insumos (Despesas).
- O **Dashboard** passa a mostrar em tempo real o Lucro Líquido, Vendas do Dia e o saldo esperado na gaveta.

### 4️⃣ Fechar o Turno
Ao fim do dia ou na troca de operador, você volta ao **Dashboard** e clica em **Fechar Caixa**.
1. Você conta o dinheiro físico que está na gaveta e compara com o valor em cartões/PIX.
2. O sistema perguntará qual o **Saldo Final** que você contou (ex: R$ 350,00).
3. O sistema calcula automaticamente: `(Saldo Inicial + Entradas em Dinheiro) - Saídas em Dinheiro`.
4. Ele exibirá o Status:
   - **Bateu:** Seutroco declarado é exatamente o que o sistema esperava.
   - **Quebra de Caixa:** Se faltar dinheiro (ex: você declarou R$ 350, mas o sistema esperava R$ 360).
   - **Sobra de Caixa:** Se tiver mais dinheiro físico do que o registrado.
5. Após fechado, um relatório de fechamento do turno fica salvo e o ciclo se encerra.

---

## 🧭 Menu Principal: Explicação das Telas

### 📊 1. Dashboard (O Painel de Controle)
É a primeira tela que você vê. Ela serve como o "GPS" financeiro do seu dia.
- **Para que serve:** Exibir um resumo rápido de como está a saúde do caixa naquele momento.
- **O que você faz aqui:** Abre e Fecha o turno do caixa, vê o total faturado no dia, lucro líquido, número de transações e a evolução das vendas na semana através de um gráfico.

### 💰 2. Ponto de Venda (PDV)
É a tela mais usada do sistema, onde o atendimento ao cliente, de fato, acontece.
- **Para que serve:** Registrar vendas de forma rápida (frente de caixa estilo fast-food).
- **O que você faz aqui:**
  - Clica nos produtos para adicionar ao carrinho (ex: Café, Hambúrguer).
  - Pode personalizar os itens (Ex: Produto com "Carne Extra", ou "Sem Cebola").
  - Lança em **Mesas / Comandas** (caso o cliente vá pagar depois de comer).
  - Ao finalizar a venda, escolhe a Forma de Pagamento (Dinheiro, PIX, Cartão) e o sistema envia o pedido para a impressora (separando automaticamente vias da Cozinha e do Cliente).
  - *Botão Imprimir via da Cozinha:* Permite silenciar a impressora caso você esteja vendendo algo que não precise ir pro preparo (ex: uma bala ou refrigerante já em mãos).

### 🧾 3. Pagamentos/Saídas (Despesas)
Para ter um lucro real, você precisa registrar o que sai do seu bolso.
- **Para que serve:** Registrar todo dinheiro que Saiu do caixa ou da conta da empresa.
- **O que você faz aqui:**
  - Registra a compra de mercadorias no supermercado (ex: R$ 20,00 de pão).
  - Ao registrar, você pode sinalizar que aquela despesa foi para comprar *"Farinha de Trigo"*. O sistema **alimenta o seu estoque automaticamente** no momento da despesa!
  - Permite tirar foto da nota fiscal do mercadinho pelo celular/webcam e anexar à despesa para controle do contador.
  - Sangrias (retiradas de dinheiro da gaveta por segurança).

### ⚙️ 4. Cadastros
Onde você configura o "cérebro" comercial da cantina. Sem dados nesta tela, o PDV fica vazio.
- **Para que serve:** Inserir os dados mestres do seu negócio.
- **Esta tela é dividida em Abas:**
  - **Fornecedores:** Quem te vende insumos (Mercado, Padeiro, Distribuidora de Bebidas).
  - **Ingredientes/Insumos:** Matéria-prima bruta (Pão, Hambúrguer cru, Queijo, Café em pó). Você controla quanto pagou de custo em cada um para saber seu lucro.
  - **Grupos de Opções:** Cria as personalizações (Ex: "Escolha seu Ponto da Carne", "Adicionais Pagos").
  - **Produtos Finais:** O que você vende para o cliente (Ex: "X-Bacon"). Aqui você define o Preço de Venda e pode montar a *Ficha Técnica* (receita), dizendo ao sistema que quando vender 1 X-Bacon, ele deve dar baixa no estoque em "1 Pão", "1 Carne" e "2 Fatias de Bacon".

### 📈 5. Relatórios
A ferramenta do gestor para avaliar a saúde da empresa a médio e longo prazo.
- **Para que serve:** Mostrar de forma detalhada o histórico de tudo que aconteceu.
- **Esta tela é dividida em Abas:**
  - **Gráficos e Listas:** Exibe todas as vendas e despesas do mês, separando entradas de saídas com cálculos de líquido.
  - **Turnos Anteriores:** Permite auditar dias passados. Você pode ver se no dia 15/Março houve "Quebra de caixa" e quem era o operador logado.
  - **Galeria de Notas:** Um local onde você pode ver todas as fotos de cupons e Notas Fiscais que você anexou lá na tela de Pagamentos/Saídas. Muito útil para fazer fechamento de mês.
