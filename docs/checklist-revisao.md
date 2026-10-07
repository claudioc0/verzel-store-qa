# Checklist de revisão manual

Versão em Markdown da planilha [checklist-revisao.xlsx](checklist-revisao.xlsx), para leitura direta no GitHub. A planilha contém também os passos detalhados de cada item e o resultado esperado registrado nos documentos.

**O que é:** depois da execução assistida por script ([execucao.md](execucao.md)), cada bug foi reproduzido manualmente no navegador e no terminal, e os valores esperados de cada critério de aceite foram conferidos com calculadora contra a documentação. A coluna "Resultado observado" é o registro feito durante essa revisão.

**Data da revisão:** 07/10/2026 · **Itens:** 25 · **Resultado:** 25 OK

| ID | Categoria | Referência | O que foi validado | Resultado observado | Status | Evidência |
|---|---|---|---|---|---|---|
| R01 | Bug | BUG-01 / CA06 | Subtotal de exatamente R$ 200,00 sem cupom | O frete grátis não se aplica para valores de compra igual a R$200,00, apenas se aplica para compras com subtotal maior que este valor | OK | [R01.jpg](../evidencias/manual/R01.jpg) |
| R02 | Bug | BUG-01 / CA08 | Subtotal de R$ 200,00 com BEMVINDO10, até a confirmação | O resultado esperado não se confirma, o bug do frete continua presente e a aplicação do cupom de desconto gera o total de R$199,90 como registrado nos documentos | OK | [R02-carrinho.jpg](../evidencias/manual/R02-carrinho.jpg) · [R02-pedido.jpg](../evidencias/manual/R02-pedido.jpg) |
| R03 | Bug | BUG-01 / CA07 | Limite inferior: R$ 199,80 (controle) | O comportamento de valor inferior a regra de frete grátis é correto | OK | [R03.jpg](../evidencias/manual/R03.jpg) |
| R04 | Bug | BUG-02 / CA10 | API aceita 6 unidades | É possível exceder a quantidade limite de um mesmo item utilizando a API de pedidos | OK | [R04.jpg](../evidencias/manual/R04.jpg) |
| R05 | Bug | BUG-02 / CA10 | Interface finaliza carrinho com 9 unidades | É possível exceder o número limite de unidades por produto alterando o session storage da página | OK | [R05-carrinho.jpg](../evidencias/manual/R05-carrinho.jpg) · [R05-application.jpg](../evidencias/manual/R05-application.jpg) · [R05-pedido.jpg](../evidencias/manual/R05-pedido.jpg) |
| R06 | Bug | BUG-02 | Não há teto de quantidade | Não há teto de quantidade de itens na API de pedidos | OK | [R06.jpg](../evidencias/manual/R06.jpg) |
| R07 | Melhoria | BUG-03 | GET /api devolve HTML | o servidor só manda para a API os caminhos que começam com /api/, com a barra. /api sem a barra não entra nessa regra e cai na regra da loja, que devolve o HTML para qualquer endereço que ela não conhece. | OK | [R07-html.jpg](../evidencias/manual/R07-html.jpg) · [R07-not-found.jpg](../evidencias/manual/R07-not-found.jpg) |
| R08 | Aguarda PO | BUG-04 | Item sem quantidade | A API recusa corretamente quando a quantidade inserida de um item é inválida | OK | [R08.jpg](../evidencias/manual/R08.jpg) |
| R09 | Bug | BUG-05 | Falha no cálculo após alterar o carrinho | Há incosistência na operação de calcular o valor total do carrinho caso a internet do cliente ou a chamada de API falhe | OK | [R09-pedido.jpg](../evidencias/manual/R09-pedido.jpg) · [R09-resumo-pedido.jpg](../evidencias/manual/R09-resumo-pedido.jpg) · [R09-pedido-confirmado.jpg](../evidencias/manual/R09-pedido-confirmado.jpg) |
| R10 | Melhoria | BUG-06 | Cupom recusado: carrinho anuncia como aplicado e o checkout não permite remover | Inconsistência no cupom adicionado ao carrinho | OK | [R10-cupom.jpg](../evidencias/manual/R10-cupom.jpg) · [R10-finalizar-pedido.jpg](../evidencias/manual/R10-finalizar-pedido.jpg) |
| R11 | Critério | CA01 | Desconto de 10% do BEMVINDO10 | Cupom corretamente aplicado | OK | [R11.jpg](../evidencias/manual/R11.jpg) |
| R12 | Critério | CA02 | Cupom sem diferenciar maiúsculas e com espaços nas pontas | Cupom devidamente aplicado | OK | [R12.jpg](../evidencias/manual/R12.jpg) |
| R13 | Critério | CA03 | Cupom inexistente | Cupom não adicionado pois é inexistente | OK | [R13.jpg](../evidencias/manual/R13.jpg) |
| R14 | Critério | CA04 | Cupom expirado | Cupom devidamente informado como expirado | OK | [R14.jpg](../evidencias/manual/R14.jpg) |
| R15 | Critério | CA05 | Um cupom por vez | Apenas um cupom é aplicado por vez | OK | [R15.jpg](../evidencias/manual/R15.jpg) |
| R16 | Critério | CA08 | Frete grátis usa subtotal antes do desconto | Frete grátis devidamente aplicado ao subtotal da compra antes da aplicação de cupom | OK | [R16.jpg](../evidencias/manual/R16.jpg) |
| R17 | Critério | CA09 | Desconto não incide no frete | Desconto não incide no valor faltante para frete grátis | OK | [R17.jpg](../evidencias/manual/R17.jpg) |
| R18 | Critério | CA10 | Limite de 5 unidades pelos botões | O carrinho limite corretamente as 5 unidades por produto | OK | [R18.jpg](../evidencias/manual/R18.jpg) · [R18-carrinho.jpg](../evidencias/manual/R18-carrinho.jpg) |
| R19 | Critério | CA11 | Valores com 2 casas (verificação parcial) | Os valores se mantém com 2 casas decimais | OK | [R19.jpg](../evidencias/manual/R19.jpg) |
| R20 | Checkout | CT-CHK-01 | Pedido válido | O carrinho se encontra devidamente vzio após o pedido concluído | OK | [R20-carrinho.jpg](../evidencias/manual/R20-carrinho.jpg) · [R20-pedido.jpg](../evidencias/manual/R20-pedido.jpg) |
| R21 | Checkout | CT-CHK-03 | Mensagens de validação | Todos os campos do formulário são devidamente tratados na inserção de dados | OK | [R21.jpg](../evidencias/manual/R21.jpg) |
| R22 | Repositório | README | Automação roda do zero | 40 testes passando e 6 falham como no planejado | OK | [R22.jpg](../evidencias/manual/R22.jpg) |
| R23 | Repositório | README / docs | Links funcionam no GitHub | Todos os links abrem o arquivo ou seção correta, para facilitar revisão posterior | OK | N/A |
| R24 | Repositório | evidencias.md | Prints dos bugs mostram o que o relato diz | Os prints dos bugs condizem com os relatos | OK | N/A |
| R25 | Repositório | execucao.md | Totais do resumo | O total contabilizado no resumo reflete exatamente os dados encontrados nas execuções | OK | N/A |
