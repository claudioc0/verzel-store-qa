# Plano de testes

## 1. Objetivo
Validar a entrega **cupom de desconto + frete grátis** da Verzel Store contra a [documentação da entrega](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao) (critérios de aceite CA01 a CA11), na interface e na API.

## 2. Escopo

**Dentro do escopo**
- Aplicação, troca e remoção de cupom (CA01 a CA05)
- Regras de frete grátis e frete fixo (CA06 a CA09)
- Limite de 5 unidades por produto na interface e na API (CA10)
- Arredondamento dos valores (CA11)
- Checkout: validação dos dados do cliente e confirmação do pedido
- API: `GET /api/produtos`, `GET /api/produtos/{id}`, `POST /api/carrinho/calcular`, `POST /api/pedidos` e os códigos de erro documentados
- Consistência entre os valores exibidos na interface e os retornados pela API (a interface só exibe o resultado de `POST /api/carrinho/calcular`)

**Fora do escopo** (pelo enunciado e pela seção "Sobre este ambiente")
- Testes de carga, estresse e segurança
- Login, cadastro de clientes, pagamento online e consulta de pedidos
- Persistência do carrinho entre abas ou navegadores, armazenamento de pedidos, envio de e-mail e controle de estoque (simplificações intencionais, que não são bugs)

## 3. Estratégia
| Tipo | Como |
|---|---|
| Funcional (UI): execução assistida por script | Os passos de cada cenário de [cenarios/](cenarios/) são executados por um roteiro Playwright ([scripts/executar-ui.mjs](../scripts/executar-ui.mjs)) que imita a interação manual, tira um print de página inteira e registra os valores lidos da tela |
| Funcional (API): execução assistida por script | Um roteiro ([scripts/executar-api.mjs](../scripts/executar-api.mjs)) envia cada requisição do cenário e grava a requisição e a resposta como evidência |
| Exploratório | Sessões guiadas por charters: recarregar a página, esvaziar o carrinho, rota inexistente, uso só com teclado (rótulos e mensagens com `role="alert"`), layout em 375 px com medição de rolagem horizontal, consistência UI × API, integridade de preços (valores enviados pelo cliente devem ser ignorados), falhas da API de cálculo e de pedidos vistas pela interface (simuladas com `page.route`), reaplicação do cupom de "primeira compra" e estado do carrinho fora do limite |
| Automação | Suíte Playwright (TypeScript) cobrindo UI e API dos cenários mais críticos, executável com `npm test` |

**Técnicas de projeto de testes:** partição de equivalência e análise de valor-limite (R$ 199,80 / R$ 200,00 no frete; 5 / 6 unidades; quantidade 0, negativa e decimal), tabela de decisão (cupom × frete) e comparação UI × API.

## 4. Massa de dados
| Produto | Preço | Uso principal |
|---|---|---|
| P001 Camiseta Essencial | R$ 59,90 | carrinho abaixo do frete grátis |
| P002 Calça Jeans Slim | R$ 139,90 | P001 + P002 = R$ 199,80 (limite inferior do frete) |
| P005 Mochila Urbana 20L | R$ 100,00 | 2 × P005 = R$ 200,00 (limite exato do frete) |
| P007 Jaqueta Corta-Vento | R$ 229,90 | carrinho acima do frete grátis |
| P006 Kit 3 Pares de Meias | R$ 29,90 | quantidade máxima com valor baixo |
| P003 + P006 | R$ 219,80 | acima de R$ 200,00 antes do desconto e abaixo depois dos 10% (R$ 197,82): distingue as duas leituras do CA08 |

| Cupom | Desconto | Situação |
|---|---|---|
| BEMVINDO10 | 10% | válido |
| VERAO2026 | 15% | expirado em 31/03/2026 |

## 5. Ambiente
- Loja: https://verzel-store.qa-test-verzel-store.workers.dev/
- Navegador: Chromium (Playwright) em desktop (1280×900) e mobile (375×812). Outros navegadores não foram executados.
- Ambiente compartilhado: o carrinho fica isolado por aba (sessionStorage), e a documentação garante que "a API não guarda nada entre uma chamada e outra". Por isso os testes não interferem uns nos outros nem com outros candidatos.

## 6. Limitações conhecidas
- **CA11 (arredondamento) só é parcialmente verificável com a massa disponível.** Todos os preços são múltiplos de R$ 0,10 e o único cupom válido é de 10%, então o desconto sempre fecha em centavos exatos e nunca surge uma terceira casa decimal para arredondar. O cupom de 15% (VERAO2026) está expirado. Os testes confirmam só a ausência de resíduo de ponto flutuante (ex.: 3 × 29,90 = 89,70, e não 89,69999999999999; 10% de 189,90 = 18,99, e não 18,990000000000002). Ver [A9](ambiguidades.md#a9).
- **"Na primeira compra"** (texto da home) não é verificável sem cadastro de clientes. Ver [A8](ambiguidades.md#a8).

## 7. Classificação de bugs
| Severidade | Critério |
|---|---|
| Crítica | Impede a compra ou cobra valor errado em fluxo principal |
| Alta | Regra de negócio documentada não é cumprida |
| Média | Comportamento incorreto com contorno ou em fluxo secundário |
| Baixa | Inconsistência de texto, layout ou documentação sem impacto em valores |

## 8. Critérios de conclusão
- Todos os cenários executados, com o resultado registrado em [execucao.md](execucao.md)
- Todos os bugs registrados em [bugs.md](bugs.md) com evidência
- Pelo menos 3 cenários automatizados com Playwright, rodando com um único comando
