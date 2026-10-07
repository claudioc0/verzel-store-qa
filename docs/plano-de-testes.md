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
- Consistência entre os valores exibidos na interface e os retornados pela API

**Fora do escopo** (pelo enunciado e pela seção "Sobre este ambiente")
- Testes de carga, estresse e segurança
- Login, cadastro de clientes, pagamento online e consulta de pedidos
- Persistência do carrinho entre abas ou navegadores, armazenamento de pedidos, envio de e-mail e controle de estoque (simplificações intencionais, que não são bugs)

## 3. Estratégia
| Tipo | Como |
|---|---|
| Funcional manual (UI) | Execução dos cenários de [cenarios/](cenarios/) no navegador, com print de cada resultado |
| Funcional manual (API) | Requisições com curl/Postman, guardando a requisição e a resposta como evidência |
| Exploratório | Sessões guiadas por charters (navegação direta por URL, recarregar a página, valores-limite, entradas inesperadas, responsividade, acessibilidade básica) |
| Automação | Playwright (TypeScript) cobrindo UI e API dos cenários mais críticos |

**Técnicas de projeto de testes:** partição de equivalência e análise de valor-limite (R$ 199,80 / R$ 200,00 no frete; 5 / 6 unidades; quantidade 0, negativa e decimal), tabela de decisão (cupom × frete) e comparação UI × API.

## 4. Massa de dados
| Produto | Preço | Uso principal |
|---|---|---|
| P001 Camiseta Essencial | R$ 59,90 | carrinho abaixo do frete grátis |
| P002 Calça Jeans Slim | R$ 139,90 | P001 + P002 = R$ 199,80 (limite inferior do frete) |
| P005 Mochila Urbana 20L | R$ 100,00 | 2 × P005 = R$ 200,00 (limite exato do frete) |
| P007 Jaqueta Corta-Vento | R$ 229,90 | carrinho acima do frete grátis |
| P006 Kit 3 Pares de Meias | R$ 29,90 | quantidade máxima com valor baixo |

| Cupom | Desconto | Situação |
|---|---|---|
| BEMVINDO10 | 10% | válido |
| VERAO2026 | 15% | expirado em 31/03/2026 |

## 5. Ambiente
- Loja: https://verzel-store.qa-test-verzel-store.workers.dev/
- Navegadores: Chrome (principal), Firefox e visualização mobile (DevTools)
- Ambiente compartilhado: o carrinho fica isolado por aba (sessionStorage), então os testes não interferem uns nos outros

## 6. Classificação de bugs
| Severidade | Critério |
|---|---|
| Crítica | Impede a compra ou cobra valor errado em fluxo principal |
| Alta | Regra de negócio documentada não é cumprida |
| Média | Comportamento incorreto com contorno ou em fluxo secundário |
| Baixa | Inconsistência de texto, layout ou documentação sem impacto em valores |

## 7. Critérios de conclusão
- Todos os cenários executados, com o resultado registrado em [execucao.md](execucao.md)
- Todos os bugs registrados em [bugs.md](bugs.md) com evidência
- Pelo menos 3 cenários automatizados com Playwright, rodando com um único comando
