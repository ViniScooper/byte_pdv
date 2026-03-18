# Tela: Ponto de Venda (PDV)

A tela de **Ponto de Venda** foi desenhada para ser rápida e intuitiva, permitindo que você atenda o cliente em poucos segundos.

## Como realizar uma venda

1. **Localizar Produto**: 
   - Use a barra de busca no topo para encontrar itens pelo nome.
   - Os produtos aparecem em cards com o preço e a quantidade disponível em estoque.
2. **Adicionar ao Carrinho**:
   - Clique no card do produto. 
   - **Modal de Customização**: Se o produto tiver opcionais (como "Carne com Bacon"), abrirá uma tela para escolher.
   - **Regras**: O botão "Adicionar" só ativa se você cumprir as exigências (ex: escolher ao menos 1 proteína).
   - O item vai para a lista lateral direita com as escolhas detalhadas.
   - O sistema bloqueia a venda se não houver estoque de base ou de insumos necessários.
3. **Ajustar Quantidades**:
   - No carrinho lateral, use os botões `+` e `-` para alterar a quantidade.
   - Você pode remover um item clicando no ícone do lixo.
4. **Forma de Pagamento**:
   - Selecione obrigatoriamente como o cliente está pagando (Dinheiro, Pix, Crédito ou Débito).
5. **Finalizar**:
   - Clique em **Finalizar Venda**. O sistema irá atualizar o estoque e o saldo do caixa instantaneamente.

## Regras Importantes
- **Caixa Fechado**: O botão de finalizar fica desabilitado se o turno não tiver sido aberto no Dashboard.
- **Estoque**: O sistema avisa se o produto está acabando (badge amarelo) ou se está esgotado (badge vermelho/card opaco).
