# 🚀 Melhorias Futuras e Roadmap

Embora o PDV Byte já seja um sistema funcional, rápido e seguro, sempre há margem para evolução. Abaixo estão listadas as principais áreas de melhoria (arquiteturais, funcionais e de experiência do usuário) que podem ser implementadas no futuro para levar o sistema para o próximo nível.

---

## 🏗️ 1. Melhorias de Arquitetura e Código

### 1.1. Banco de Dados e ORM
- **Migração para Prisma ORM Completo:** O sistema atualmente utiliza queries cruas via `mssql` em muitas rotas. Migrar todas as rotas para o Prisma ORM (já configurado no projeto) trará tipagem estática confiável, evitará vazamentos de conexão e tornará as consultas mais legíveis e fáceis de dar manutenção.
- **Relacionamentos Stritos no Banco:** Hoje, tabelas como `Transacao` guardam listas de itens como um campo JSON (`itens`, `ficheTecnicaJson`). A longo prazo, se o sistema crescer, o ideal é criar tabelas relacionais dedicadas (ex: `Transacao_Item`, `Produto_FichaTecnica`), permitindo análises SQL avançadas sem precisar de parse de JSONs.

### 1.2. Segurança e Controle de Acesso
- **Níveis de Permissão Refinados (RBAC):** Atualmente, temos usuários Admin e Caixa. Pode-se criar hierarquias mais detalhadas, como:
  - **Gerente:** Pode ver relatórios e excluir produtos, mas não exclui turnos.
  - **Caixa:** Apenas abre turno e opera PDV, sem acesso a Custos de produtos.
  - **Cozinha:** Uma tela dedicada que mostre apenas a fila de pedidos.

### 1.3. Sincronização e Offline-First
- **Tolerância a Quedas de Internet:** Como o backend está na nuvem (Azure), se a internet do restaurante cair, o caixa trava. Uma melhoria crítica é implementar *Service Workers*, *IndexedDB* ou *WatermelonDB* no frontend para que o PDV continue vendendo offline, sincronizando as vendas automaticamente com a Azure assim que a rede voltar.

---

## 🍔 2. Melhorias Funcionais (Business)

### 2.1. Controle de Estoque
- **Avisos de Estoque Mínimo:** Configurar um limite seguro (ex: avisar quando tiver apenas 5 pães). O Dashboard poderia ter um card de "Atenção: Estoque Baixo".
- **Lote e Validade:** Adicionar campos para rastrear validade de ingredientes perecíveis para reduzir desperdícios e evitar multas sanitárias.
- **Sugestão de Compras (Compras Inteligentes):** Com base no histórico de vendas e no estoque atual, o sistema gerar automaticamente uma "Lista de Compras" sugerindo as quantidades exatas a serem compradas para a semana.
- **Custo Médio Ponderado:** Hoje o sistema usa o último custo cadastrado do ingrediente. O ideal seria fazer a média do valor pago nos últimos fornecedores para ter uma margem de lucro perfeitamente precisa.

### 2.2. Gestão Financeira Avançada
- **Controle de Fiado / Cadastro de Clientes:** Atualmente a venda é anônima. Adicionar um banco de clientes para permitir a venda "na conta (fiado)" e posteriormente emitir lembretes de cobrança via WhatsApp.
- **Clube de Fidelidade / Cashback:** Baseado no cadastro do cliente, acumular "ByteCoins" ou carimbos digitais onde a 10ª compra gera um hambúrguer grátis, incentivando o retorno.
- **Divisão de Pagamentos:** Uma venda de R$ 100,00 onde o cliente quer pagar R$ 50,00 no PIX e R$ 50,00 no Cartão. Hoje o sistema registra 1 método por venda.
- **Descontos Aplicados e Cupons:** Permitir dar descontos fechados (ex: R$ 5,00 a menos), percentuais (10% OFF), ou criar códigos de cupons (ex: SEXTA10) para marketing.

### 2.3. Gestão de Mesas e Comandas
- **Mapa de Mesas Visual:** Trocar o input de texto "Mesa 12" por uma tela com o desenho real do salão do restaurante, indicando mesas livres (verde) e ocupadas (vermelho) com o cronômetro do tempo de permanência de cada uma.
- **QR Code na Mesa (Autoatendimento):** Gerar um QR Code único para a mesa onde o próprio cliente lê no celular, visualiza o cardápio dinâmico (com fotos em alta resolução) e faz o pedido, caindo direto na Cozinha/PDV.
- **Divisão Inteligente de Conta:** Ferramenta no PDV para "Rachar a Conta" escolhendo o que cada cliente pagará, separando taxas de serviço (10%) ou os itens que cada um consumiu, facilitando grupos.
- **Transferência de Mesas:** Permitir transferir a comanda de uma mesa para outra caso os clientes mudem de lugar no meio do atendimento.

---

## ✨ 3. Melhorias de Interface (UI/UX)

- **Modo Escuro / Claro Avançado:** Melhorar os temas de cores para reduzir o cansaço visual dos caixas que ficam 8 a 12 horas olhando para o sistema.
- **KDS (Kitchen Display System) Interativo:** Uma tela dedicada para a cozinha (tablet/TV), que exiba os pedidos organizados por tempo (verde = dentro do prazo, vermelho = atrasado). Cozinheiros podem arrastar o pedido para o status "Pronto", que muda o status no PDV e/ou em um painel eletrônico para o cliente buscar.
- **Animações Fluidas e Feedback Tátil:** Ao adicionar itens ao carrinho, ter a animação do item "voando" para a lixeira ou subindo as quantidades com efeitos suaves. Notificações sonoras amigáveis de "Sucesso" ao invés de apenas textos mudos.
- **Atalhos de Teclado no PDV:** Para maior velocidade e ergonomia, o mouse pode atrasar o fluxo. Mapear o teclado por completo:
  - `F2` -> Pagar em Dinheiro
  - `F3` -> Pagar em PIX
  - `Setas Direcionais` -> Navegar e focar nos produtos.
  - `Enter` -> Finalizar Venda.
- **Painel de Senhas / Painel de Chamada:** Tela para ficar exposta ao público em uma TV (ex: "Senhas: 31, 32 / PRONTO: 30"). Quando a senha é atualizada pelo Caixa ou Cozinha, a TV apita informando aos clientes que a comida está pronta para retirada, aliviando filas no balcão.
- **Responsividade Padrão Tablet ("Garçom Digital"):** Adaptar as telas de Comandas e PDV com botões grandes para polegares, permitindo que atendentes andem no salão com tablets anotando os pedidos direto da mesa do cliente.

---

## 📈 4. Expansão e Escala
- **Multi-Tenant (SaaS):** Transformar a aplicação para suportar múltiplas empresas se cadastrando. Hoje ela atende 1 operação só. Isso exigiria separar os dados no banco utilizando o `tenant_id` em toda as tabelas.
