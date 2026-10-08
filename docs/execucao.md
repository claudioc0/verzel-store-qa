# Execução dos testes

**Data:** 07/10/2026 · **Ambiente:** https://verzel-store.qa-test-verzel-store.workers.dev · **Navegador:** Chromium (Playwright), desktop 1280×900 e mobile 375×812

**Como foi executado:** os cenários de [cenarios/](cenarios/) foram executados com roteiros de apoio que reproduzem os passos manuais e salvam as evidências: [scripts/executar-ui.mjs](../scripts/executar-ui.mjs) (prints da interface) e [scripts/executar-api.mjs](../scripts/executar-api.mjs) (requisição e resposta de cada chamada). Os valores observados de cada cenário estão em [evidencias/ui/resultados.json](../evidencias/ui/resultados.json). Depois disso, os bugs e os valores esperados foram revisados manualmente no navegador e no terminal: ver o [checklist de revisão manual](checklist-revisao.md).

**Legenda:** ✅ passou · ❌ falhou: o resultado contradiz uma regra documentada; o registro pode ser bug ou melhoria, conforme o impacto (ver [bugs.md](bugs.md)) · ⚠️ observação ou dúvida para o PO: a documentação admite mais de uma leitura, ou não há regra que torne o comportamento certo ou errado · ➖ não se aplica

## Resumo

| Área | Cenários | ✅ Passou | ❌ Falhou | ⚠️ Observação | ➖ N/A |
|---|---|---|---|---|---|
| Cupom | 11 | 11 | 0 | 0 | 0 |
| Frete | 8 | 5 | 3 | 0 | 0 |
| Quantidade | 7 | 5 | 1 | 0 | 1 |
| Arredondamento | 2 | 2* | 0 | 0 | 0 |
| Checkout | 10 | 9 | 1 | 0 | 0 |
| Carrinho com falha no cálculo | 3 | 1 | 2 | 0 | 0 |
| API | 31 | 20 | 6 | 5 | 0 |
| Exploratório | 7 | 6 | 0 | 1 | 0 |
| **Total** | **79** | **59** | **13** | **6** | **1** |

Os 13 cenários com falha correspondem a 4 registros: **3 bugs** (BUG-01, BUG-02 e BUG-05) e **1 melhoria** (BUG-03). Há ainda a melhoria [BUG-06](bugs.md#bug-06), identificada em um cenário que passou (CT-CHK-09), e o [BUG-04](bugs.md#bug-04), que aguarda o PO e por isso conta como ⚠️ ([bugs.md](bugs.md)).
\* CA11 verificado só parcialmente: a massa disponível não gera terceira casa decimal ([A9](ambiguidades.md#a9)).

## Cupom ([cupom.feature](cenarios/cupom.feature))

| ID | Cenário | CA | Resultado | Observado | Evidência |
|---|---|---|---|---|---|
| CT-CUP-01 | Aplicar BEMVINDO10 (abaixo do frete grátis) | CA01 | ✅ | Desconto R$ 5,99, frete R$ 19,90, total R$ 73,81 | [print](../evidencias/ui/CT-CUP-01.png) |
| CT-CUP-02 | BEMVINDO10 com vários produtos | CA01 | ✅ | Subtotal R$ 199,80, desconto R$ 19,98, rótulo "Desconto (BEMVINDO10)" | [print](../evidencias/ui/CT-CUP-02.png) |
| CT-CUP-03 | Caixa e espaços nas pontas (5 variações) | CA02 | ✅ | Todas aplicadas, desconto R$ 5,99 | [1](../evidencias/ui/CT-CUP-03-1.png) [2](../evidencias/ui/CT-CUP-03-2.png) [3](../evidencias/ui/CT-CUP-03-3.png) [4](../evidencias/ui/CT-CUP-03-4.png) [5](../evidencias/ui/CT-CUP-03-5.png) |
| CT-CUP-04 | Espaço no meio do código | CA02/CA03 | ✅ | "Cupom inválido.", sem desconto | [print](../evidencias/ui/CT-CUP-04.png) |
| CT-CUP-05 | Cupons inexistentes (4 variações) | CA03 | ✅ | "Cupom inválido.", total R$ 79,80 | [XYZ123](../evidencias/ui/CT-CUP-05-XYZ123.png) [BEMVINDO](../evidencias/ui/CT-CUP-05-BEMVINDO.png) [BEMVINDO100](../evidencias/ui/CT-CUP-05-BEMVINDO100.png) [BEMVINDO1O](../evidencias/ui/CT-CUP-05-BEMVINDO1O.png) |
| CT-CUP-06 | Cupom expirado (3 variações) | CA04 | ✅ | "Cupom expirado.", sem desconto | [1](../evidencias/ui/CT-CUP-06-1.png) [2](../evidencias/ui/CT-CUP-06-2.png) [3](../evidencias/ui/CT-CUP-06-3.png) |
| CT-CUP-07 | Cupom vazio / só espaços | — | ✅ | "Informe um cupom." | [vazio](../evidencias/ui/CT-CUP-07.png) [espaços](../evidencias/ui/CT-CUP-07-espacos.png) |
| CT-CUP-08 | Apenas um cupom por vez | CA05 | ✅ | Campo de cupom some e aparece "Cupom BEMVINDO10 aplicado. Remover cupom" | [print](../evidencias/ui/CT-CUP-08.png) |
| CT-CUP-09 | Remover e aplicar outro | CA05 | ✅ | Total volta a R$ 79,80, campo reaparece, VERAO2026 → "Cupom expirado." | [removido](../evidencias/ui/CT-CUP-09-removido.png) [outro](../evidencias/ui/CT-CUP-09-outro.png) |
| CT-CUP-10 | Recalcular cupom ao mudar quantidade | CA01 | ✅ | Subtotal R$ 119,80, desconto R$ 11,98 | [print](../evidencias/ui/CT-CUP-10.png) |
| CT-CUP-11 | Cupom mantido até a confirmação | CA01 | ✅ | Checkout e confirmação: desconto R$ 5,99, total R$ 73,81 | [checkout](../evidencias/ui/CT-CUP-11-checkout.png) [confirmado](../evidencias/ui/CT-CUP-11-confirmado.png) |

## Frete ([frete.feature](cenarios/frete.feature))

| ID | Cenário | CA | Resultado | Observado | Evidência |
|---|---|---|---|---|---|
| CT-FRE-01 | Abaixo de R$ 200,00 | CA07 | ✅ | Frete R$ 19,90, "Faltam R$ 140,10", total R$ 79,80 | [print](../evidencias/ui/CT-FRE-01.png) |
| CT-FRE-02 | Limite inferior R$ 199,80 | CA07 | ✅ | Frete R$ 19,90, "Faltam R$ 0,20", total R$ 219,70 | [print](../evidencias/ui/CT-FRE-02.png) |
| CT-FRE-03 | Limite exato R$ 200,00 | CA06 | ❌ [BUG-01](bugs.md#bug-01) | Frete R$ 19,90, total R$ 219,90, "Faltam R$ 0,00 para o frete grátis." | [print](../evidencias/ui/CT-FRE-03.png) |
| CT-FRE-04 | Acima de R$ 200,00 | CA06 | ✅ | Frete "Grátis", total R$ 229,90 | [print](../evidencias/ui/CT-FRE-04.png) |
| CT-FRE-05 | R$ 200,00 + cupom | CA08 | ❌ [BUG-01](bugs.md#bug-01) | Frete R$ 19,90, total R$ 199,90 (esperado R$ 180,00) | [print](../evidencias/ui/CT-FRE-05.png) |
| CT-FRE-06 | R$ 219,80 + cupom (Tênis + Meias: acima de 200 antes do desconto, R$ 197,82 depois) | CA08 | ✅ | Desconto R$ 21,98, frete "Grátis", total R$ 197,82: a regra usa o subtotal antes do desconto | [print](../evidencias/ui/CT-FRE-06.png) |
| CT-FRE-07 | Desconto não incide no frete | CA09 | ✅ | Desconto R$ 19,98, frete R$ 19,90, total R$ 199,72 | [print](../evidencias/ui/CT-FRE-07.png) |
| CT-FRE-08 | Aviso atualizado ao mudar o carrinho | CA07 | ❌ [BUG-01](bugs.md#bug-01) | Com 2 unidades (R$ 200,00) o frete continua R$ 19,90 | [1 un](../evidencias/ui/CT-FRE-08-1un.png) [2 un](../evidencias/ui/CT-FRE-08-2un.png) |

## Quantidade ([quantidade.feature](cenarios/quantidade.feature))

| ID | Cenário | CA | Resultado | Observado | Evidência |
|---|---|---|---|---|---|
| CT-QTD-01 | Adicionar até o limite pela vitrine | CA10 | ✅ | Botão desabilitado, "Limite de 5 unidades atingido.", carrinho com 5 | [vitrine](../evidencias/ui/CT-QTD-01-vitrine.png) [carrinho](../evidencias/ui/CT-QTD-01-carrinho.png) |
| CT-QTD-02 | Botão + respeita o limite | CA10 | ✅ | Botão + desabilitado em 5, subtotal R$ 149,50 | [print](../evidencias/ui/CT-QTD-02.png) |
| CT-QTD-03 | Digitar quantidade fora do limite | CA10 | ➖ N/A | Não há campo editável ([A4](ambiguidades.md#a4)); coberto por CT-API-11 | — |
| CT-QTD-04 | Diminuir até 1 | CA10 | ✅ | Quantidade 1, botão − desabilitado | [print](../evidencias/ui/CT-QTD-04.png) |
| CT-QTD-05 | Limite é por produto | CA10 | ✅ | 5 meias + 5 bonés aceitos, subtotal R$ 399,00 | [print](../evidencias/ui/CT-QTD-05.png) |
| CT-QTD-06 | Remover produto | — | ✅ | Resta só a Camiseta, subtotal R$ 59,90 | [print](../evidencias/ui/CT-QTD-06.png) |
| CT-QTD-07 | Carrinho acima do limite não pode ser finalizado | CA10 | ❌ [BUG-02](bugs.md#bug-02) | Exibe "Limite de 5 unidades por produto.", mas mostra 9 unidades e confirma o pedido VZ-527478 com 9× Camiseta (R$ 539,10) | [carrinho](../evidencias/ui/CT-QTD-07-carrinho.png) [confirmado](../evidencias/ui/CT-QTD-07-confirmado.png) |

## Arredondamento ([arredondamento.feature](cenarios/arredondamento.feature))

| ID | Cenário | CA | Resultado | Observado | Evidência |
|---|---|---|---|---|---|
| CT-ARR-01 | 5 combinações com cupom | CA11 | ✅* | Todos os valores conferem com a tabela de exemplos, com 2 casas. 4 dos 5 exemplos gerariam resíduo numa conta direta em JavaScript (ex.: 3 × 29,90 = 89.69999999999999), e a loja devolveu valores limpos | [1](../evidencias/ui/CT-ARR-01-1.png) [2](../evidencias/ui/CT-ARR-01-2.png) [3](../evidencias/ui/CT-ARR-01-3.png) [4](../evidencias/ui/CT-ARR-01-4.png) [5](../evidencias/ui/CT-ARR-01-5.png) |
| CT-ARR-02 | Todos os 8 produtos + cupom | CA11 | ✅* | Subtotal R$ 849,40, desconto R$ 84,94, total R$ 764,46 (API idem). Confere os valores; não exercita resíduo, porque a soma dos 8 preços já é exata em JavaScript | [print](../evidencias/ui/CT-ARR-02.png) |

## Checkout ([checkout.feature](cenarios/checkout.feature))

| ID | Cenário | Resultado | Observado | Evidência |
|---|---|---|---|---|
| CT-CHK-01 | Pedido com dados válidos | ✅ | Pedido VZ-976283, "Obrigado, Maria.", resumo igual ao carrinho, carrinho esvaziado | [form](../evidencias/ui/CT-CHK-01-form.png) [confirmado](../evidencias/ui/CT-CHK-01-confirmado.png) [carrinho após](../evidencias/ui/CT-CHK-01-carrinho-apos.png) |
| CT-CHK-02 | CEP sem hífen | ✅ | Pedido confirmado | [print](../evidencias/ui/CT-CHK-02.png) |
| CT-CHK-03 | 12 combinações inválidas (formulário recarregado a cada caso) | ✅ | Todas bloqueadas com a mensagem no campo certo | [01](../evidencias/ui/CT-CHK-03-01.png) … [12](../evidencias/ui/CT-CHK-03-12.png) |
| CT-CHK-04 | `/checkout` com carrinho vazio | ✅ | Redireciona para `/carrinho` | [print](../evidencias/ui/CT-CHK-04.png) |
| CT-CHK-05 | `/pedido-confirmado` sem pedido | ✅ | "Nenhum pedido recente" | [print](../evidencias/ui/CT-CHK-05.png) |
| CT-CHK-06 | Pedido de R$ 200,00 + cupom | ❌ [BUG-01](bugs.md#bug-01) | Confirmado com frete R$ 19,90 e total R$ 199,90 (esperado R$ 180,00) | [checkout](../evidencias/ui/CT-CHK-06-checkout.png) [confirmado](../evidencias/ui/CT-CHK-06-confirmado.png) |
| CT-CHK-07 | Dados válidos nas bordas (3 casos) | ✅ | Acentos e apóstrofo, hífen com 3+ nomes, `+` e subdomínio, espaços nas pontas: todos confirmados | [1](../evidencias/ui/CT-CHK-07-1.png) [2](../evidencias/ui/CT-CHK-07-2.png) [3](../evidencias/ui/CT-CHK-07-3.png) |
| CT-CHK-08 | Clique duplo em "Confirmar pedido" | ✅ | Só 1 `POST /api/pedidos` enviado (contagem das requisições: `"envios": 1`) | [resultados.json](../evidencias/ui/resultados.json) (chave `CT-CHK-08`) · [print](../evidencias/ui/CT-CHK-08.png) |
| CT-CHK-09 | Erro 422 da API exibido no formulário (cupom VERAO2026 / XYZ123 no armazenamento da aba) | ✅ | 422 CUPOM_EXPIRADO / CUPOM_INVALIDO; mensagem "Cupom expirado." / "Cupom inválido." com `role="alert"`; continua no checkout com o botão habilitado. Uma nova tentativa reenvia o mesmo cupom e recebe o mesmo 422; para seguir, o cliente precisa voltar ao carrinho e remover o cupom. Antes disso, o carrinho exibe "Cupom VERAO2026 aplicado." embora a API responda `aplicado: false` (melhoria [BUG-06](bugs.md#bug-06)) | [carrinho](../evidencias/ui/CT-CHK-09-carrinho-cupom-expirado.png) [VERAO2026](../evidencias/ui/CT-CHK-09-a.png) [XYZ123](../evidencias/ui/CT-CHK-09-b.png) |
| CT-CHK-10 | Falha sem resposta da API (HTTP 500 sem corpo / conexão interrompida) | ✅ | "Não foi possível confirmar o pedido. Tente novamente."; campos preservados; botão habilitado; nova tentativa confirma o pedido | [500](../evidencias/ui/CT-CHK-10-a-erro.png) [500 → nova tentativa](../evidencias/ui/CT-CHK-10-a-nova-tentativa.png) [conexão](../evidencias/ui/CT-CHK-10-b-erro.png) [conexão → nova tentativa](../evidencias/ui/CT-CHK-10-b-nova-tentativa.png) |

Mensagens do CT-CHK-03: nome vazio ou só espaços → "Informe o nome completo."; "Maria" e "Maria S" → "Informe nome e sobrenome."; e-mail vazio → "Informe o e-mail."; e-mail mal formado → "Informe um e-mail válido."; CEP vazio → "Informe o CEP."; CEP com dígitos a mais ou a menos, ou com letras → "Informe um CEP com 8 dígitos.".

## Carrinho com falha no cálculo ([carrinho.feature](cenarios/carrinho.feature))

| ID | Cenário | Resultado | Observado | Evidência |
|---|---|---|---|---|
| CT-CAR-01 | Cálculo responde HTTP 500 | ❌ [BUG-05](bugs.md#bug-05) | Ao abrir: alerta "Não foi possível calcular o carrinho." sem resumo nem botão (correto). Depois de alterar para 2 unidades: o alerta aparece, mas a linha do item (R$ 59,90), o resumo antigo (R$ 79,80) e "Finalizar compra" continuam; o checkout mostra "1x" e R$ 79,80; pedido VZ-952731 confirmado com 2× e R$ 139,70 | [abertura](../evidencias/ui/CT-CAR-01-carregamento.png) [alteração](../evidencias/ui/CT-CAR-01-alteracao.png) [checkout](../evidencias/ui/CT-CAR-01-checkout.png) [confirmado](../evidencias/ui/CT-CAR-01-confirmado.png) |
| CT-CAR-02 | Conexão interrompida no cálculo | ❌ [BUG-05](bugs.md#bug-05) | Mesmo comportamento, com "Não foi possível calcular o carrinho. Verifique sua conexão."; pedido VZ-257168 confirmado com 2× e R$ 139,70 depois de o checkout exibir R$ 79,80 | [abertura](../evidencias/ui/CT-CAR-02-carregamento.png) [alteração](../evidencias/ui/CT-CAR-02-alteracao.png) [checkout](../evidencias/ui/CT-CAR-02-checkout.png) [confirmado](../evidencias/ui/CT-CAR-02-confirmado.png) |
| CT-CAR-03 | Erro 422 por produto inexistente (P999 gravado na aba) | ✅ | Alerta "Produto P999 não encontrado.", sem resumo nem botão. Observação: o item P999 não é listado, então só sai do carrinho com "Esvaziar carrinho" (estado só alcançável alterando a aba) | [print](../evidencias/ui/CT-CAR-03.png) |

## API ([api.feature](cenarios/api.feature))

| ID | Cenário | Resultado | Observado | Evidência |
|---|---|---|---|---|
| CT-API-01 | Listar produtos | ✅ | 200, 8 produtos com os preços da documentação | [json](../evidencias/api/CT-API-01.json) |
| CT-API-02 | Produto existente | ✅ | 200, P005 com preço 100 | [json](../evidencias/api/CT-API-02.json) |
| CT-API-03 | Produto inexistente (P999, p001, abc) | ✅ | 404 PRODUTO_NAO_ENCONTRADO | [a](../evidencias/api/CT-API-03-a.json) [b](../evidencias/api/CT-API-03-b.json) [c](../evidencias/api/CT-API-03-c.json) |
| CT-API-04 | Rota inexistente | ✅ | 404 ROTA_NAO_ENCONTRADA | [json](../evidencias/api/CT-API-04.json) |
| CT-API-05 | Raiz `/api` | ❌ [BUG-03](bugs.md#bug-03) (melhoria) | 200 text/html. Conta como falha porque contradiz o contrato documentado (\"Envie e receba sempre JSON\") e o comportamento das demais rotas inexistentes (`404 ROTA_NAO_ENCONTRADA`); é melhoria, e não bug, porque não afeta o cliente | [json](../evidencias/api/CT-API-05.json) |
| CT-API-06 | Método não permitido (4 casos) | ✅ | 405 METODO_NAO_PERMITIDO | [a](../evidencias/api/CT-API-06-a.json) [b](../evidencias/api/CT-API-06-b.json) [c](../evidencias/api/CT-API-06-c.json) [d](../evidencias/api/CT-API-06-d.json) |
| CT-API-07 | Calcular com cupom válido | ✅ | 199.8 / 19.98 / 19.9 / total 199.72 | [json](../evidencias/api/CT-API-07.json) |
| CT-API-08 | Frete considera subtotal antes do desconto | ❌ [BUG-01](bugs.md#bug-01) | 1×P005 ok; 2×P005 → frete 19.9 (com e sem cupom); P003 + P006 + cupom (subtotal 219.8, após desconto 197.82) → frete 0, confirmando o CA08 | [a](../evidencias/api/CT-API-08-a.json) [b](../evidencias/api/CT-API-08-b.json) [c](../evidencias/api/CT-API-08-c.json) [d](../evidencias/api/CT-API-08-d.json) |
| CT-API-09 | Cupom inválido/expirado no cálculo | ✅ | 200, desconto 0, aplicado false, mensagem correta | [a](../evidencias/api/CT-API-09-a.json) [b](../evidencias/api/CT-API-09-b.json) |
| CT-API-10 | Caixa e espaços na API | ✅ | `"  bemvindo10  "` aplicado; `"BEM VINDO10"` inválido | [a](../evidencias/api/CT-API-10-a.json) [b](../evidencias/api/CT-API-10-b.json) |
| CT-API-11 | Validação de quantidade (8 casos) | ❌ [BUG-02](bugs.md#bug-02) | 6 → 200 (esperado 422 QUANTIDADE_MAXIMA_EXCEDIDA); 0, -1, 1.5, "2" e null → 422 corretos | [q6](../evidencias/api/CT-API-11-q6.json) [q5](../evidencias/api/CT-API-11-q5.json) [q0](../evidencias/api/CT-API-11-q0.json) |
| CT-API-12 | Validação da lista de itens (8 casos) | ⚠️ [BUG-04](bugs.md#bug-04) (aguarda PO) | 7 de 8 conforme a tabela de erros; item sem `quantidade` → QUANTIDADE_INVALIDA, que admite duas leituras da documentação ([A6](ambiguidades.md#a6)) | [d](../evidencias/api/CT-API-12-d.json) [f](../evidencias/api/CT-API-12-f.json) [g](../evidencias/api/CT-API-12-g.json) |
| CT-API-13 | Duplicar item para burlar o limite | ✅ | 422 ITEM_DUPLICADO | [json](../evidencias/api/CT-API-13.json) |
| CT-API-14 | Criar pedido válido | ✅ | 201, VZ-790201, CEP normalizado, valores iguais ao cálculo | [pedido](../evidencias/api/CT-API-14.json) [cálculo](../evidencias/api/CT-API-14-calc.json) |
| CT-API-15 | Pedido com cupom inválido/expirado | ✅ | 422 CUPOM_INVALIDO / CUPOM_EXPIRADO | [a](../evidencias/api/CT-API-15-a.json) [b](../evidencias/api/CT-API-15-b.json) |
| CT-API-16 | Dados de cliente inválidos | ✅ | 422 DADOS_INVALIDOS com `campos` corretos | [a](../evidencias/api/CT-API-16-a.json) [b](../evidencias/api/CT-API-16-b.json) [c](../evidencias/api/CT-API-16-c.json) [d](../evidencias/api/CT-API-16-d.json) |
| CT-API-17 | Pedido com 6 unidades | ❌ [BUG-02](bugs.md#bug-02) | 201, pedido criado | [json](../evidencias/api/CT-API-17.json) |
| CT-API-18 | Pedido R$ 200,00 + cupom | ❌ [BUG-01](bugs.md#bug-01) | frete 19.9, total 199.9 | [json](../evidencias/api/CT-API-18.json) |
| CT-API-19 | Tipos inesperados no cupom (`null`, `10`, `""`, `"   "`) | ✅ | 200, sem desconto. `null`/`""` → `cupom: null`; `10`/`"   "` → "Cupom inválido." ([A10](ambiguidades.md#a10)) | [a](../evidencias/api/CT-API-19-a.json) [b](../evidencias/api/CT-API-19-b.json) [c](../evidencias/api/CT-API-19-c.json) [d](../evidencias/api/CT-API-19-d.json) |
| CT-API-20 | Cupom no pedido (`" bemvindo10 "`, `""`) | ✅ | 201; desconto 5.99 e 0 | [a](../evidencias/api/CT-API-20-a.json) [b](../evidencias/api/CT-API-20-b.json) |
| CT-API-21 | Pedido com 5 unidades | ✅ | 201 | [json](../evidencias/api/CT-API-21.json) |
| CT-API-22 | Faltante nunca negativo | ✅ | Subtotal 459.8 → `valorFaltanteFreteGratis: 0` | [json](../evidencias/api/CT-API-22.json) |
| CT-API-23 | Vários itens inválidos | ⚠️ | 422 apenas com o primeiro erro (`PRODUTO_NAO_ENCONTRADO`, `itens[0].produtoId`) ([A11](ambiguidades.md#a11)) | [json](../evidencias/api/CT-API-23.json) |
| CT-API-24 | Content-Type ausente ou `text/plain` | ⚠️ | 200, processado normalmente ([A11](ambiguidades.md#a11)) | [a](../evidencias/api/CT-API-24-a.json) [b](../evidencias/api/CT-API-24-b.json) |
| CT-API-25 | Cliente válido nas bordas | ✅ | 201, "José D'Ávila" preservado, CEP normalizado | [a](../evidencias/api/CT-API-25-a.json) [b](../evidencias/api/CT-API-25-b.json) |
| CT-API-26 | Nome "Maria S" | ⚠️ | 422 "Informe nome e sobrenome.": dúvida para o PO ([A3](ambiguidades.md#a3)) | [json](../evidencias/api/CT-API-26.json) |
| CT-API-27 | Cálculo ignora preços e totais enviados pelo cliente | ✅ | `preco`/`precoUnitario` = 1, `desconto` = 50, `frete` = 0 e `total` = 1 ignorados; resposta com 59.9 / 0 / 19.9 / 79.8 | [json](../evidencias/api/CT-API-27.json) |
| CT-API-28 | Pedido ignora preços e totais enviados pelo cliente | ✅ | 201 com precoUnitario 59.9 e total 79.8 | [json](../evidencias/api/CT-API-28.json) |
| CT-API-29 | Validação da lista de itens em `/api/pedidos` (7 casos) | ✅ | ITEM_DUPLICADO, ITENS_OBRIGATORIOS (vazia e ausente), ITEM_INVALIDO, PRODUTO_NAO_ENCONTRADO, QUANTIDADE_INVALIDA e JSON_INVALIDO, iguais a `/calcular` | [a](../evidencias/api/CT-API-29-a.json) [b](../evidencias/api/CT-API-29-b.json) [c](../evidencias/api/CT-API-29-c.json) [d](../evidencias/api/CT-API-29-d.json) [e](../evidencias/api/CT-API-29-e.json) [f](../evidencias/api/CT-API-29-f.json) [g](../evidencias/api/CT-API-29-g.json) |
| CT-API-30 | Quantidade 1.000.000 | ❌ [BUG-02](bugs.md#bug-02) | Aceita nos dois endpoints; pedido VZ-972373 com total R$ 59.900.000,00 | [calcular](../evidencias/api/CT-API-30-a.json) [pedido](../evidencias/api/CT-API-30-b.json) |
| CT-API-31 | Nome com parte curta, dígitos ou pontuação | ⚠️ | "Maria S Silva", "Maria 12" e "Ma .." aceitos (201): a regra aceita qualquer 2 partes com 2+ caracteres ([A3](ambiguidades.md#a3)) | [a](../evidencias/api/CT-API-31-a.json) [b](../evidencias/api/CT-API-31-b.json) [c](../evidencias/api/CT-API-31-c.json) |

## Testes exploratórios

| ID | Charter | Resultado | Observado | Evidência |
|---|---|---|---|---|
| EXP-01 | Recarregar o carrinho com cupom aplicado | ✅ | Itens e cupom mantidos na aba ([A7](ambiguidades.md#a7)) | [print](../evidencias/ui/EXP-01-recarregar.png) |
| EXP-02 | Rota inexistente na loja | ✅ | Página "Página não encontrada" com título correto | [print](../evidencias/ui/EXP-02-404.png) |
| EXP-03 | Layout mobile (375 px) e checkout completo | ✅ | `scrollWidth` = 375 px (igual à largura da tela) em `/`, `/carrinho`, `/checkout` e `/documentacao`; pedido confirmado em 375 px | [vitrine](../evidencias/ui/EXP-03-mobile-vitrine.png) [carrinho](../evidencias/ui/EXP-03-mobile-carrinho.png) [checkout](../evidencias/ui/EXP-03-mobile-checkout.png) [confirmado](../evidencias/ui/EXP-03-mobile-confirmado.png) |
| EXP-04 | Esvaziar carrinho com cupom e readicionar | ✅ | Carrinho e cupom limpos; novo item sem desconto | [esvaziado](../evidencias/ui/EXP-04-esvaziado.png) [readicionado](../evidencias/ui/EXP-04-readicionado.png) |
| EXP-05 | Reaplicar BEMVINDO10 após um pedido ("primeira compra") | ⚠️ | Cupom aceito de novo na mesma aba; regra não verificável sem cadastro ([A8](ambiguidades.md#a8)) | [print](../evidencias/ui/EXP-05-segunda-compra.png) |
| EXP-06 | Consistência UI × API | ✅ | A interface chama `POST /api/carrinho/calcular`; subtotal, desconto, frete e total da tela são iguais aos da resposta (199.8 / 19.98 / 19.9 / 199.72) | [print](../evidencias/ui/EXP-06-ui-x-api.png) |
| EXP-07 | Uso só com teclado e mensagens acessíveis | ✅ | Produto adicionado com Enter; campo de cupom com `<label>`; erro com `role="alert"` e `aria-invalid="true"` | [print](../evidencias/ui/EXP-07-teclado.png) |
