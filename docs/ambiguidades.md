# Ambiguidades e interpretações

Pontos em que a documentação deixa margem de interpretação, com a interpretação adotada nos testes. Os itens marcados como **dúvida para o PO** não foram tratados como certos nem como errados: ficam pendentes de decisão de quem define o produto.

## A1
**O link `/api` do enunciado não abre nada útil.**
A documentação diz que "A API fica no mesmo endereço da loja, no caminho `/api`" e lista os endpoints abaixo dele. **Interpretação:** `/api` é o prefixo base, não um endpoint, então a ausência de conteúdo não é bug. O que foi registrado como melhoria em [BUG-03](bugs.md#bug-03) não é a falta de conteúdo, e sim o formato da resposta: `200 text/html`, diferente do `404` JSON das demais rotas inexistentes e do contrato "Envie e receba sempre JSON".

## A2
**Frete grátis com cupom: regra confirmada, não ambígua.**
CA08 ("considera o subtotal antes do desconto") e a fórmula das Regras de cálculo ("R$ 0,00 quando o subtotal é igual ou maior que R$ 200,00", em que o subtotal é a soma dos produtos) resolvem o caso explicitamente: 2 × R$ 100,00 com BEMVINDO10 deve ter frete grátis. Este item fica registrado só como referência para o [BUG-01](bugs.md#bug-01).

## A3
**Regra de validação do nome: dúvida para o PO.**
A documentação diz apenas que "o nome do cliente precisa ter nome e sobrenome", e isso é uma regra que "já existia antes desta entrega". A regra implementada, lida no código da página (`nome.trim().split(/\s+/).filter(p => p.length >= 2).length < 2`), é: **o nome precisa ter pelo menos duas partes com 2 ou mais caracteres quaisquer**. Partes mais curtas são ignoradas. A API se comporta da mesma forma.

Na comparação com "nome e sobrenome", a regra erra para os dois lados:

| Lado | Entrada | Resultado | Evidência |
|---|---|---|---|
| Mais restritiva | "Maria S" (sobrenome abreviado) | Recusado: "Informe nome e sobrenome." | CT-CHK-03, CT-API-26 |
| Mais permissiva | "Maria 12" (número como sobrenome) | Aceito: pedido criado | CT-API-31-b |
| Mais permissiva | "Ma .." (pontuação como sobrenome) | Aceito: pedido criado | CT-API-31-c |
| Coerente | "Maria S Silva" (parte curta no meio) | Aceito: a parte "S" é ignorada | CT-API-31-a |

**Interpretação:** como a regra é anterior a esta entrega e a documentação não detalha o que conta como sobrenome, nenhum dos casos foi registrado como bug. Ficam como pergunta ao PO: abreviações devem ser aceitas? Dígitos e pontuação devem ser recusados?

Comportamentos de borda confirmados como **aceitos** (CT-CHK-07, CT-API-25): acentos e apóstrofo ("José D'Ávila"), hífen e 3 ou mais nomes ("Ana-Clara de Souza Lima"), e-mail com `+` e subdomínio, espaços nas pontas dos campos e CEP com ou sem hífen (normalizado para `01310100`).

## A4
**CA10 "na interface": não existe campo para digitar a quantidade.**
A quantidade só muda pelos botões + e −, e o valor é exibido em um `<output>` somente leitura. **Interpretação:** o cenário CT-QTD-03 (digitar quantidade) não se aplica. A validação da interface foi feita de duas formas: pelos botões (CT-QTD-01/02) e por um carrinho carregado acima do limite (CT-QTD-07), que revelou a parte de interface do [BUG-02](bugs.md#bug-02).

## A5
**Cupom com espaço no meio (`BEM VINDO10`).**
CA02 diz que espaços "no início e no fim" são ignorados. **Interpretação:** espaços internos fazem parte do código, então o cupom deve ser inválido. Foi o comportamento observado.

## A6
**Ausência de `quantidade` no item: `ITEM_INVALIDO` ou `QUANTIDADE_INVALIDA`? Dúvida para o PO.**
A tabela de erros define `ITEM_INVALIDO` como "um item não é um objeto com produtoId e quantidade", o que descreve literalmente um item sem `quantidade`. Mas o item é um objeto com `produtoId`, então `QUANTIDADE_INVALIDA` também se encaixa. Registrado como [BUG-04](bugs.md#bug-04) com status "aguarda confirmação do PO" e contado como ⚠️ na execução, não como falha.

## A7
**Cupom persiste ao recarregar a página.**
A documentação diz que o carrinho fica guardado na aba. **Interpretação:** o cupom aplicado faz parte do carrinho, então mantê-lo após recarregar (comportamento observado) está correto.

## A8
**"Na primeira compra, o cupom BEMVINDO10 dá 10%" (texto da home).**
Os critérios de aceite não restringem o cupom à primeira compra, e a loja não tem cadastro de clientes. Observado em EXP-05: depois de um pedido confirmado, o BEMVINDO10 é aceito de novo na mesma aba. **Interpretação:** sem identificação do cliente, a regra de "primeira compra" não é verificável neste ambiente. Não registrei como bug; fica como dúvida para o PO caso a restrição seja esperada em algum nível (por exemplo, por e-mail no pedido).

## A9
**CA11, "valores arredondados para 2 casas decimais": verificação parcial.**
Com a massa disponível, nenhum cálculo produz uma terceira casa decimal (preços múltiplos de R$ 0,10 e cupom de 10%). **Interpretação:** o CA11 foi verificado apenas quanto à ausência de resíduo de ponto flutuante na interface e na API. A regra de arredondamento propriamente dita (meio para cima, truncamento etc.) não pôde ser exercitada.

Os casos que de fato exercitam o resíduo são os que geram valores como `89.69999999999999` (3 × 29,90) ou `18.990000000000002` (10% de 189,90) numa conta direta em JavaScript: 4 dos 5 exemplos do CT-ARR-01, além do CT-FRE-06 e do CT-FRE-07. A loja devolveu valores limpos em todos. Dois cálculos não geram resíduo e por isso não provam nada sobre ele: 3 × 59,90 (= 179,7 exato) e a soma dos 8 produtos (= 849,4 exato). A análise assume a ordem preço × quantidade, soma e × 0,1; outra ordem de operações daria resíduos em outros casos.

## A10
**Cupom só com espaços: mensagens diferentes na interface e na API.**
Na interface, `"   "` mostra "Informe um cupom." sem chamar a API (CT-CUP-07). Em `/api/carrinho/calcular`, o mesmo valor retorna `cupom.mensagem: "Cupom inválido."` e `""` retorna `cupom: null` (CT-API-19). **Interpretação:** a documentação não define o comportamento para cupom vazio, e nenhum dos dois aplica desconto. Registrado só como observação.

## A11
**Comportamentos tolerantes da API: observações, não bugs.**
- Requisição sem `Content-Type` ou com `text/plain` e corpo JSON válido é processada normalmente (CT-API-24). A documentação pede o cabeçalho ao cliente da API, mas não diz que o servidor deve recusar.
- Com vários itens inválidos, a API retorna só o primeiro erro, com o `campo` correto (CT-API-23). A documentação mostra um único `erro` por resposta.
- Na API, "um cupom por vez" (CA05) é garantido pelo próprio formato: `cupom` é um único texto, não uma lista.
