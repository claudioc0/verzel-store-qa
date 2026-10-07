# Ambiguidades e interpretações

Pontos em que a documentação deixa margem de interpretação, com a interpretação adotada nos testes.

## A1
**O link `/api` do enunciado não abre nada útil.**
A documentação diz que "A API fica no mesmo endereço da loja, no caminho `/api`" e lista os endpoints abaixo dele. **Interpretação:** `/api` é o prefixo base, não um endpoint, então a ausência de conteúdo não é bug. A resposta `200 text/html` para esse caminho, diferente do `404` JSON das demais rotas inexistentes, foi registrada como [BUG-03](bugs.md#bug-03).

## A2
**"Frete grátis a partir de R$ 200,00, inclusive" combinado com cupom (CA06 × CA08).**
**Interpretação:** o valor comparado com R$ 200,00 é sempre o subtotal bruto dos produtos. Portanto 2 × R$ 100,00 com BEMVINDO10 (subtotal R$ 200,00, total de produtos R$ 180,00) deve ter frete grátis.

## A3
**Regras de validação do nome, e-mail e CEP no checkout não estão nos critérios de aceite.**
**Interpretação:** usei as mensagens da própria interface como referência e o formato do exemplo da API (`01310-100`). Comportamentos observados e considerados corretos: o nome exige nome e sobrenome com pelo menos 2 letras cada ("Maria S" é rejeitado); o CEP é aceito com ou sem hífen e retorna normalizado (`01310100`).

## A4
**CA10 "na interface": não existe campo para digitar a quantidade.**
A quantidade só muda pelos botões + e −, e o valor é exibido em um `<output>` somente leitura. **Interpretação:** o cenário CT-QTD-03 (digitar quantidade) não se aplica à interface, e a validação equivalente foi feita pela API.

## A5
**Cupom com espaço no meio (`BEM VINDO10`).**
CA02 diz que espaços "no início e no fim" são ignorados. **Interpretação:** espaços internos fazem parte do código, então o cupom deve ser inválido. Foi o comportamento observado.

## A6
**Ausência de `quantidade` no item: `ITEM_INVALIDO` ou `QUANTIDADE_INVALIDA`?**
Ver [BUG-04](bugs.md#bug-04). Adotei a leitura literal da tabela de erros.

## A7
**Cupom persiste ao recarregar a página.**
A documentação diz que o carrinho fica guardado na aba. **Interpretação:** o cupom aplicado faz parte do carrinho, então mantê-lo após recarregar (comportamento observado) está correto.
