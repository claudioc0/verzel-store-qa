# Bugs encontrados

**Ambiente:** https://verzel-store.qa-test-verzel-store.workers.dev · Chromium (Playwright) 1280×900 e 375×812 · Windows 10
**Data da execução:** 07/10/2026

| ID | Título | Severidade | Prioridade | Critério | Camada |
|---|---|---|---|---|---|
| [BUG-01](#bug-01) | Subtotal de exatamente R$ 200,00 não ganha frete grátis | Alta | Alta | CA06 / CA08 | UI + API |
| [BUG-02](#bug-02) | API aceita mais de 5 unidades do mesmo produto | Alta | Alta | CA10 | API |
| [BUG-03](#bug-03) | `GET /api` retorna 200 com o HTML da loja em vez de erro JSON | Baixa | Baixa | Doc. da API | API |
| [BUG-04](#bug-04) | Item sem `quantidade` retorna `QUANTIDADE_INVALIDA` em vez de `ITEM_INVALIDO` | Baixa | Baixa | Doc. de erros | API |

---

## BUG-01
**Subtotal de exatamente R$ 200,00 não ganha frete grátis**

- **Severidade:** Alta. O cliente paga R$ 19,90 a mais no valor-limite da promoção, que é o próprio valor anunciado na home ("Frete grátis a partir de R$ 200,00").
- **Critérios violados:** CA06 ("frete grátis para compras com subtotal a partir de R$ 200,00, inclusive"). Com o cupom aplicado, viola também o resultado esperado de CA08.
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

**Análise:** a comparação parece usar `subtotal > 200` em vez de `subtotal >= 200`. R$ 199,80 cobra frete (correto) e R$ 229,90 ganha frete grátis (correto); só o valor exato de R$ 200,00 falha. CA08 (subtotal antes do desconto) está correto: R$ 229,90 com cupom fica em R$ 206,91 e mantém o frete grátis.

**Evidências:** [CT-FRE-03.png](../evidencias/ui/CT-FRE-03.png), [CT-FRE-05.png](../evidencias/ui/CT-FRE-05.png), [CT-FRE-08-2un.png](../evidencias/ui/CT-FRE-08-2un.png), [CT-CHK-06-confirmado.png](../evidencias/ui/CT-CHK-06-confirmado.png), [CT-API-08-b.json](../evidencias/api/CT-API-08-b.json), [CT-API-08-c.json](../evidencias/api/CT-API-08-c.json), [CT-API-18.json](../evidencias/api/CT-API-18.json)

---

## BUG-02
**API aceita mais de 5 unidades do mesmo produto**

- **Severidade:** Alta. A regra de negócio é burlada pela API e um pedido é criado com quantidade proibida.
- **Critério violado:** CA10 ("no máximo 5 unidades por pedido. A regra vale para a interface e para a API"). A tabela de erros documenta `422 QUANTIDADE_MAXIMA_EXCEDIDA`.

**Passos para reproduzir**
```bash
curl -X POST https://verzel-store.qa-test-verzel-store.workers.dev/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{"cliente":{"nome":"Maria Silva","email":"maria@exemplo.com","cep":"01310-100"},"itens":[{"produtoId":"P001","quantidade":6}]}'
```
Também ocorre em `POST /api/carrinho/calcular` com `{"itens":[{"produtoId":"P001","quantidade":6}]}`.

**Resultado esperado:** `422` com `{"erro":{"codigo":"QUANTIDADE_MAXIMA_EXCEDIDA", ...}}`.

**Resultado obtido:** `201`, pedido `VZ-637006` criado com 6 unidades (subtotal R$ 359,40). No cálculo do carrinho, `200` com os valores de 6 unidades.

**Observação:** a interface respeita o limite (o botão fica desabilitado em 5 e aparece "Limite de 5 unidades atingido.") e a API valida quantidades 0, negativas, decimais, texto e nulas. A falha é só no limite superior. A tentativa de burlar o limite repetindo o item na lista é bloqueada por `ITEM_DUPLICADO`.

**Evidências:** [CT-API-11-q6.json](../evidencias/api/CT-API-11-q6.json), [CT-API-17.json](../evidencias/api/CT-API-17.json)

---

## BUG-03
**`GET /api` retorna 200 com o HTML da loja em vez de erro JSON**

- **Severidade:** Baixa. Não afeta o cliente, mas quebra o contrato da API ("Envie e receba sempre JSON") e confunde quem integra.

**Passos para reproduzir:** `curl -i https://verzel-store.qa-test-verzel-store.workers.dev/api`

**Resultado esperado:** resposta JSON, como acontece em qualquer outra rota inexistente sob `/api`: `404 {"erro":{"codigo":"ROTA_NAO_ENCONTRADA", ...}}`.

**Resultado obtido:** `200`, `Content-Type: text/html`, com o HTML da SPA. Para comparar, `GET /api/rota-inexistente` retorna corretamente `404 ROTA_NAO_ENCONTRADA` em JSON.

**Observação:** é o link de "API" informado no enunciado do teste. Entendo que `/api` é o prefixo base e não um endpoint (ver [ambiguidades](ambiguidades.md#a1)). O problema é a resposta fora do padrão, não a ausência de conteúdo.

**Evidências:** [CT-API-05.json](../evidencias/api/CT-API-05.json), [CT-API-04.json](../evidencias/api/CT-API-04.json)

---

## BUG-04
**Item sem `quantidade` retorna `QUANTIDADE_INVALIDA` em vez de `ITEM_INVALIDO`**

- **Severidade:** Baixa. A requisição é rejeitada corretamente; só o código de erro diverge da documentação.

**Passos para reproduzir:** `POST /api/carrinho/calcular` com `{"itens":[{"produtoId":"P001"}]}`

**Resultado esperado:** pela tabela de erros, `ITEM_INVALIDO` acontece quando "um item não é um objeto com produtoId **e quantidade**". Logo, era esperado `422 ITEM_INVALIDO` com `campo: "itens[0]"`.

**Resultado obtido:** `422 QUANTIDADE_INVALIDA` com `campo: "itens[0].quantidade"`.

**Observação:** há uma interpretação alternativa, em que a ausência do campo é tratada como "quantidade inválida". Registrei como bug de baixa severidade porque o texto da documentação descreve exatamente este caso como `ITEM_INVALIDO`.

**Evidência:** [CT-API-12-d.json](../evidencias/api/CT-API-12-d.json)
