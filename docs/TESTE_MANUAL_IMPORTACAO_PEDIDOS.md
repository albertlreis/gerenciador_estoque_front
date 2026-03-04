# Teste manual – Importação de Pedidos (PDF/XML)

Fluxos para validar a tela de importação de pedidos, incluindo o modo de inserção manual quando os itens não são extraídos automaticamente.

## Pré-requisitos

- Backend (gerenciador_estoque_api) rodando com endpoint `/api/v1/pedidos/import` e `/api/v1/pedidos/import/pdf/confirm`.
- Leitor PDF (leitor_pdf_sierra) rodando quando for testar PDFs.
- Arquivos de exemplo em `leitor_pdf_sierra/examples/` (ou cópia em `gerenciador_estoque_api/storage/leitor_pdf_examples/`).

---

## Caso A: PDF com itens extraídos (fluxo normal)

1. Acesse **Pedidos → Importar** (ou `/pedidos/importar`).
2. Selecione tipo **Produtos PDF Sierra**.
3. Envie um PDF que o extrator consiga processar (ex.: `16552 - SIERRA.pdf`, `16839 - SIERRA.pdf`).
4. **Esperado:**
   - Toast de sucesso: "PDF importado com sucesso!".
   - Cards "Dados do Pedido", "Cliente" (se venda), "Produtos" preenchidos.
   - Lista de itens com quantidade, valor, etc.
   - **Não** deve aparecer o banner amarelo de "itens não extraídos" nem o modal de adicionar produto abrindo sozinho.
5. Ajuste cliente (se venda), categorias dos itens se necessário, e clique em **Confirmar e Salvar Pedido**.
6. **Esperado:** Pedido salvo, toast de sucesso, formulário resetado ou redirecionamento conforme o fluxo atual.

---

## Caso B: PDF sem itens (WARN) – modo manual acionado automaticamente

1. Acesse **Pedidos → Importar**.
2. Selecione tipo **Produtos PDF Sierra** (ou Quaker/Avanti, conforme o arquivo).
3. Envie um PDF que hoje retorna preview sem itens (ex.: `039823 - QUAKER.pdf`, `18002 - SIERRA.pdf`, `60958 - AVANTI.pdf`, `19166 - SIERRA.pdf`).
4. **Esperado:**
   - Toast de sucesso: "PDF importado com sucesso!".
   - Em seguida, toast de **aviso** (amarelo): "Itens não extraídos" com mensagem do tipo: "Não foi possível extrair os itens automaticamente. Insira os itens manualmente para continuar."
   - **Banner amarelo** (Message) acima de "Dados do Pedido": "Não foi possível extrair os itens automaticamente. Use o botão «Adicionar produto» para inserir os itens manualmente e depois confirme o pedido."
   - **Modal "Adicionar produto"** deve abrir automaticamente.
5. Com o modal aberto (ou ao clicar em "Adicionar produto"):
   - Busque e adicione um ou mais produtos ao pedido.
   - Feche o modal; a lista de produtos deve mostrar os itens adicionados.
6. Preencha cliente (se venda) e categorias dos itens. Clique em **Confirmar e Salvar Pedido**.
7. **Esperado:** Pedido salvo com os itens inseridos manualmente.
8. **Validação extra:** Se tentar clicar em "Confirmar e Salvar Pedido" **sem** ter adicionado nenhum item (lista vazia), deve aparecer toast de aviso: "Adicione ao menos um item ao pedido antes de confirmar." e a API **não** deve ser chamada. Se a API retornar 422 por itens vazios, a mensagem do back deve aparecer no toast.

---

## Caso C: XML NFe (ADORNOS_XML_NFE) com itens extraídos

1. Acesse **Pedidos → Importar**.
2. Selecione tipo **Adornos XML NF-e**.
3. Envie um dos XMLs de exemplo (ex.: `35250207266606000112550020000450551000623840-nfe.xml`, `35260201368233000104550030000450951891771400-nfe.xml`).
4. **Esperado:**
   - Toast de sucesso: "XML importado com sucesso!".
   - Dados do pedido e lista de itens preenchidos (parser NFe no Laravel).
   - **Não** deve aparecer banner de itens não extraídos nem modal abrindo sozinho (itens foram extraídos).
5. Confirme o pedido normalmente.
6. **Esperado:** Pedido salvo com os itens da NFe.

---

## Resumo dos comportamentos

| Situação                         | Toast principal     | Banner Message      | Modal "Adicionar produto" |
|----------------------------------|----------------------|---------------------|----------------------------|
| PDF/XML com itens extraídos      | Sucesso              | Não                 | Não abre sozinho           |
| PDF sem itens (preview ok)       | Sucesso + Aviso      | Sim (amarelo)       | Abre automaticamente        |
| Confirmar sem itens              | Aviso local          | —                   | —                          |
| Back retorna 422 (ex.: itens)    | Erro com msg do back | —                   | —                          |
