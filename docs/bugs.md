# Bugs encontrados

**Ambiente:** https://verzel-store.qa-test-verzel-store.workers.dev · Chromium (Playwright) 1280×900 e 375×812 · Windows 10
**Data da execução:** 07/10/2026

| ID | Título | Severidade | Prioridade | Critério | Camada |
|---|---|---|---|---|---|
| [BUG-01](#bug-01) | Subtotal de exatamente R$ 200,00 não ganha frete grátis | **Crítica** | Alta | CA06 / CA08 / Regras de cálculo | UI + API |
| [BUG-02](#bug-02) | Pedido com mais de 5 unidades do mesmo produto é aceito (API e interface) | Alta | Alta | CA10 | UI + API |
| [BUG-03](#bug-03) | `GET /api` retorna 200 com o HTML da loja em vez de erro JSON | Baixa (melhoria) | Baixa | Doc. da API | API |
| [BUG-04](#bug-04) | Item sem `quantidade` retorna `QUANTIDADE_INVALIDA` em vez de `ITEM_INVALIDO` | Baixa (aguarda PO) | Baixa | Doc. de erros | API |
| [BUG-05](#bug-05) | Com falha no cálculo do carrinho, o checkout exibe valores desatualizados e o pedido é confirmado com outro valor | Média | Alta | Consistência UI × pedido | UI |
| [BUG-06](#bug-06) | Checkout não permite remover um cupom recusado pela API | Baixa (melhoria) | Baixa | Usabilidade | UI |

Classificação conforme o [plano de testes §7](plano-de-testes.md#7-classificação-de-bugs).

---

## BUG-01
**Subtotal de exatamente R$ 200,00 não ganha frete grátis**

- **Severidade:** Crítica. Pelo critério do plano, é "cobra valor errado em fluxo principal": o cliente paga R$ 19,90 a mais em um checkout comum, justamente no valor anunciado na home ("Frete grátis a partir de R$ 200,00"), e o valor errado vai para o pedido confirmado.
- **Regras violadas:**
  - CA06: "frete grátis para compras com subtotal a partir de R$ 200,00, **inclusive**".
  - Regras de cálculo: "Frete: R$ 0,00 quando o subtotal é **igual ou maior** que R$ 200,00".
  - Com o cupom aplicado, viola também o resultado esperado de CA08.
- **Pré-condição:** carrinho vazio.

**Passos para reproduzir**
1. Na vitrine, adicionar 2× "Mochila Urbana 20L" (R$ 100,00 cada).
2. Abrir o carrinho.
3. (Variação) Aplicar o cupom `BEMVINDO10`.
4. (Variação) Finalizar a compra com dados válidos.

**Resultado esperado**
- Sem cupom: frete "Grátis", total R$ 200,00 e nenhum aviso de valor faltante.
- Com cupom: desconto R$ 20,00, frete "Grátis", total **R$ 180,00**.

**Resultado obtido**
- Sem cupom: frete R$ 19,90, total R$ 219,90 e o aviso contraditório **"Faltam R$ 0,00 para o frete grátis."**
- Com cupom: frete R$ 19,90, total **R$ 199,90**. O mesmo valor vai para o pedido confirmado.
- A API tem o mesmo comportamento: `subtotal: 200`, `freteGratis: false`, `frete: 19.9`, `valorFaltanteFreteGratis: 0`.

**Análise (hipótese, sem acesso ao código):** a comparação parece usar `subtotal > 200` em vez de `subtotal >= 200`. R$ 199,80 cobra frete (correto) e R$ 229,90 ganha frete grátis (correto); só o valor exato de R$ 200,00 falha. CA08 (subtotal antes do desconto) está correto: R$ 229,90 com cupom fica em R$ 206,91 e mantém o frete grátis.

**Evidências:** [CT-FRE-03.png](../evidencias/ui/CT-FRE-03.png), [CT-FRE-05.png](../evidencias/ui/CT-FRE-05.png), [CT-FRE-08-2un.png](../evidencias/ui/CT-FRE-08-2un.png), [CT-CHK-06-confirmado.png](../evidencias/ui/CT-CHK-06-confirmado.png), [CT-API-08-b.json](../evidencias/api/CT-API-08-b.json), [CT-API-08-c.json](../evidencias/api/CT-API-08-c.json), [CT-API-18.json](../evidencias/api/CT-API-18.json)

---

## BUG-02
**Pedido com mais de 5 unidades do mesmo produto é aceito (API e interface)**

- **Severidade:** Alta. A regra de negócio é burlada e um pedido é criado com quantidade proibida.
- **Critério violado:** CA10 ("no máximo 5 unidades por pedido. A regra vale **para a interface e para a API**"). A tabela de erros documenta `422 QUANTIDADE_MAXIMA_EXCEDIDA`.

**Caminho 1: API**
```bash
curl -X POST https://verzel-store.qa-test-verzel-store.workers.dev/api/pedidos   -H "Content-Type: application/json"   -d '{"cliente":{"nome":"Maria Silva","email":"maria@exemplo.com","cep":"01310-100"},"itens":[{"produtoId":"P001","quantidade":6}]}'
```
Também ocorre em `POST /api/carrinho/calcular` com `{"itens":[{"produtoId":"P001","quantidade":6}]}`.

**Caminho 2: interface, com o carrinho fora do limite**
1. Na vitrine, adicionar 1× "Camiseta Essencial".
2. No DevTools (Application → Session Storage), alterar `verzel-store:itens` para `[{"produtoId":"P001","quantidade":9}]`.
   - **Hipótese, não verificada:** na prática, esse estado poderia surgir de um carrinho adulterado pelo próprio cliente ou salvo antes de uma mudança de regra. Não há evidência de que isso aconteça em uso real. O passo serve só para colocar a interface diante de um carrinho acima do limite, e o CA10 vale para a interface independentemente da origem desse estado.
3. Recarregar `/carrinho`.
4. Clicar em "Finalizar compra" e confirmar com dados válidos.

**Resultado esperado**
- API: `422` com `{"erro":{"codigo":"QUANTIDADE_MAXIMA_EXCEDIDA", ...}}`.
- Interface: impedir o checkout (ou ajustar a quantidade para 5) e, se o pedido for enviado, exibir o erro da API. A interface já exibe a mensagem dos erros 422 da API no formulário (verificado em CT-CHK-09 com cupom expirado e inválido), então uma correção só na API já seria refletida na tela.

**Resultado obtido**
- API: `201`, pedido `VZ-637006` criado com 6 unidades (subtotal R$ 359,40). No cálculo do carrinho, `200` com os valores de 6 unidades.
- **Não existe nenhum teto:** `quantidade: 1000000` é aceita nos dois endpoints, e o pedido `VZ-972373` foi criado com total de R$ 59.900.000,00 (CT-API-30).
- Interface: o carrinho **detecta** o problema e exibe "Limite de 5 unidades por produto.", mas mostra 9 unidades, subtotal R$ 539,10 e frete grátis, e mantém "Finalizar compra" habilitado. O pedido `VZ-527478` foi confirmado com **9× Camiseta Essencial**, total R$ 539,10.

**Observação:** no uso normal, a interface bloqueia a 6ª unidade: o botão "Adicionar ao carrinho" e o botão + ficam desabilitados em 5 (CT-QTD-01/02). Ou seja, os botões impedem que o carrinho passe do limite, mas nada valida um carrinho que já esteja acima dele. Como a API também não valida o limite superior, nenhuma camada barra o pedido. A API valida corretamente quantidades 0, negativas, decimais, texto e nulas, aceita exatamente 5 (CT-API-21) e bloqueia a tentativa de repetir o item na lista (`ITEM_DUPLICADO`).

**Evidências:** [CT-API-11-q6.json](../evidencias/api/CT-API-11-q6.json), [CT-API-17.json](../evidencias/api/CT-API-17.json), [CT-API-30-a.json](../evidencias/api/CT-API-30-a.json), [CT-API-30-b.json](../evidencias/api/CT-API-30-b.json), [CT-QTD-07-carrinho.png](../evidencias/ui/CT-QTD-07-carrinho.png), [CT-QTD-07-confirmado.png](../evidencias/ui/CT-QTD-07-confirmado.png)

---

## BUG-03
**`GET /api` retorna 200 com o HTML da loja em vez de erro JSON**

- **Severidade:** Baixa, classificado como **melhoria**. Não afeta o cliente. É o fallback comum de uma SPA, mas destoa do contrato da API ("Envie e receba sempre JSON") e de todas as outras rotas inexistentes sob `/api`, que respondem `404 ROTA_NAO_ENCONTRADA`.

**Passos para reproduzir:** `curl -i https://verzel-store.qa-test-verzel-store.workers.dev/api`

**Resultado esperado:** resposta JSON, como acontece em qualquer outra rota inexistente sob `/api`: `404 {"erro":{"codigo":"ROTA_NAO_ENCONTRADA", ...}}`.

**Resultado obtido:** `200`, `Content-Type: text/html`, com o HTML da SPA. Para comparar, `GET /api/rota-inexistente` retorna corretamente `404 ROTA_NAO_ENCONTRADA` em JSON.

**Observação:** é o link de "API" informado no enunciado do teste. Entendo que `/api` é o prefixo base e não um endpoint (ver [ambiguidades](ambiguidades.md#a1)). O problema é a resposta fora do padrão, não a ausência de conteúdo.

**Evidências:** [CT-API-05.json](../evidencias/api/CT-API-05.json), [CT-API-04.json](../evidencias/api/CT-API-04.json)

---

## BUG-04
**Item sem `quantidade` retorna `QUANTIDADE_INVALIDA` em vez de `ITEM_INVALIDO`**

- **Severidade:** Baixa. **Status: aguarda confirmação do PO.** A requisição é rejeitada corretamente; só o código de erro diverge da leitura literal da documentação.

**Passos para reproduzir:** `POST /api/carrinho/calcular` com `{"itens":[{"produtoId":"P001"}]}`

**Resultado esperado:** pela tabela de erros, `ITEM_INVALIDO` acontece quando "um item não é um objeto com produtoId **e quantidade**". Logo, era esperado `422 ITEM_INVALIDO` com `campo: "itens[0]"`.

**Resultado obtido:** `422 QUANTIDADE_INVALIDA` com `campo: "itens[0].quantidade"`.

**Observação:** existe uma leitura alternativa válida. O item é um objeto e tem `produtoId`, então a falta de `quantidade` pode ser tratada como "quantidade não é um inteiro ≥ 1". Por isso o registro fica como pendente de decisão do PO, e não como defeito confirmado. Ver [A6](ambiguidades.md#a6).

**Evidência:** [CT-API-12-d.json](../evidencias/api/CT-API-12-d.json)

---

## BUG-05
**Com falha no cálculo do carrinho, o checkout exibe valores desatualizados e o pedido é confirmado com outro valor**

- **Severidade:** Média. Pelo critério do plano, ocorre em fluxo secundário, porque depende de uma falha de `/api/carrinho/calcular` (erro 500 ou conexão interrompida). O efeito, porém, é sério: o cliente confirma um pedido vendo um total e o pedido registra outro. Por isso a prioridade sugerida é Alta.
- **Regra violada:** não há critério de aceite específico. O defeito é a interface oferecer o checkout e exibir um resumo que não corresponde ao carrinho.
- **Pré-condição:** carrinho com 1× "Camiseta Essencial" (total R$ 79,80) já calculado.

**Passos para reproduzir**
1. Abrir `/carrinho` com 1× "Camiseta Essencial".
2. Simular a falha da API de cálculo: no DevTools, Network → bloquear a URL `/api/carrinho/calcular` (ou ficar offline). Na automação, isso foi feito com `page.route` respondendo 500 ou abortando a conexão.
3. Clicar em + para passar a quantidade para 2.
4. Clicar em "Finalizar compra".
5. Restabelecer a conexão, preencher dados válidos e confirmar o pedido.

**Resultado esperado:** com o cálculo falhando, o carrinho não deve exibir valores de um estado anterior junto com "Finalizar compra" habilitado, e o checkout não deve exibir um resumo diferente do que será enviado. O mesmo comportamento já existe no primeiro carregamento: o resumo e o botão somem e só o alerta fica.

**Resultado obtido**
- **Carrinho:** a quantidade passa para 2 e aparece o alerta "Não foi possível calcular o carrinho.", mas o resumo continua com os valores de 1 unidade (subtotal R$ 59,90, total R$ 79,80) e "Finalizar compra" continua habilitado.
- **Checkout:** o resumo mostra "1x Camiseta Essencial" e total **R$ 79,80**, sem nenhum alerta, enquanto o cabeçalho mostra "Carrinho 2".
- **Pedido confirmado:** `VZ-952731` com **2× Camiseta Essencial** e total **R$ 139,70**.
- O mesmo ocorre com a conexão interrompida, no pedido `VZ-257168` (CT-CAR-02).

**Análise (hipótese, sem acesso ao código):** o resumo parece ser o último resultado bem-sucedido do cálculo, mantido em memória. A falha mostra o alerta, mas não invalida esse resumo nem esconde o botão, ao contrário do que acontece quando o primeiro cálculo falha.

**Evidências:** [CT-CAR-01-alteracao.png](../evidencias/ui/CT-CAR-01-alteracao.png), [CT-CAR-01-checkout.png](../evidencias/ui/CT-CAR-01-checkout.png), [CT-CAR-01-confirmado.png](../evidencias/ui/CT-CAR-01-confirmado.png), [CT-CAR-02-checkout.png](../evidencias/ui/CT-CAR-02-checkout.png), [resultados.json](../evidencias/ui/resultados.json) (chaves `CT-CAR-01` e `CT-CAR-02`)

---

## BUG-06
**Checkout não permite remover um cupom recusado pela API**

- **Severidade:** Baixa, classificado como **melhoria**. Pode ser tratado também como pergunta ao PO sobre o fluxo desejado.
- **Contexto:** um cupom pode deixar de valer entre o carrinho e o checkout (por exemplo, expirar nesse intervalo). Nesse caso, `POST /api/pedidos` responde `422 CUPOM_EXPIRADO` ou `CUPOM_INVALIDO`.

**Passos para reproduzir:** gravar `verzel-store:cupom` = `"VERAO2026"` no sessionStorage, ir ao checkout e confirmar com dados válidos (CT-CHK-09).

**Resultado obtido:** o checkout mostra "Cupom expirado." e mantém o botão habilitado. Uma nova tentativa reenvia o mesmo cupom e recebe o mesmo `422` (verificado: `novaTentativa` em `resultados.json`, chaves `CT-CHK-09-a/b`). O checkout não mostra o cupom nem oferece como removê-lo; o cliente precisa deduzir que deve voltar ao carrinho ("Voltar ao carrinho") e clicar em "Remover cupom".

**Sugestão:** no erro de cupom, oferecer no próprio checkout a opção de remover o cupom e seguir sem desconto, ou ao menos indicar o caminho ("Remova o cupom no carrinho").

**Evidências:** [CT-CHK-09-a.png](../evidencias/ui/CT-CHK-09-a.png), [CT-CHK-09-b.png](../evidencias/ui/CT-CHK-09-b.png)

