# Teste técnico QA Júnior - Verzel Store

Validação da entrega **cupom de desconto + frete grátis** da [Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev/), feita a partir da [documentação da entrega](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao) (critérios de aceite CA01 a CA11).

## Resultado em resumo

- **55 cenários** executados (UI, API e exploratórios): 44 ✅ · 10 ❌ · 1 N/A
- **4 bugs** encontrados, sendo 2 de severidade alta:

| Bug | Severidade | Resumo |
|---|---|---|
| [BUG-01](docs/bugs.md#bug-01) | Alta | Subtotal de **exatamente R$ 200,00** não ganha frete grátis (UI e API). Com o BEMVINDO10, o cliente paga R$ 199,90 em vez de R$ 180,00 |
| [BUG-02](docs/bugs.md#bug-02) | Alta | A API aceita e cria pedido com **mais de 5 unidades** do mesmo produto |
| [BUG-03](docs/bugs.md#bug-03) | Baixa | `GET /api` retorna 200 com HTML em vez de erro JSON |
| [BUG-04](docs/bugs.md#bug-04) | Baixa | Item sem `quantidade` retorna `QUANTIDADE_INVALIDA` em vez de `ITEM_INVALIDO` |

## Onde encontrar cada entrega

| Entrega pedida | Local |
|---|---|
| Plano de testes (escopo, estratégia, massa de dados) | [docs/plano-de-testes.md](docs/plano-de-testes.md) |
| Cenários de teste em **Gherkin** | [docs/cenarios/](docs/cenarios/) (`cupom`, `frete`, `quantidade`, `arredondamento`, `checkout`, `api`) |
| Execução manual e exploratória, com o resultado de cada cenário | [docs/execucao.md](docs/execucao.md) |
| Report dos bugs | [docs/bugs.md](docs/bugs.md) |
| Documento de evidências | [docs/evidencias.md](docs/evidencias.md) → prints em [evidencias/ui/](evidencias/ui/), requisições e respostas em [evidencias/api/](evidencias/api/) |
| Ambiguidades e interpretações adotadas | [docs/ambiguidades.md](docs/ambiguidades.md) |
| Automação com Playwright | [tests/](tests/) |

```
├── docs/            plano, cenários .feature, execução, bugs, evidências, ambiguidades
├── evidencias/      ui/ (PNG + resultados.json) · api/ (JSON) · automacao/ (relatório HTML)
├── scripts/         roteiros que geraram as evidências da execução
├── tests/
│   ├── api/         testes de API (carrinho e pedidos)
│   ├── ui/          testes E2E (cupom, frete, quantidade, checkout)
│   └── support/     Page Object do carrinho e helpers de API
└── playwright.config.ts
```

## Como rodar a automação

**Pré-requisitos:** [Node.js](https://nodejs.org/) 18 ou superior e acesso à internet (os testes rodam contra o ambiente publicado).

```bash
npm install
npx playwright install chromium
npm test
```

| Comando | O que faz |
|---|---|
| `npm test` | Roda todos os testes (API + UI) |
| `npm run test:api` | Só os testes de API |
| `npm run test:ui` | Só os testes de interface (headless) |
| `npm run test:headed` | Testes de interface com o navegador visível |
| `npm run report` | Abre o relatório HTML da última execução |
| `npm run evidencias:api` / `npm run evidencias:ui` | Regeram as evidências da execução manual |

### Sobre a automação
- **27 testes**: 16 de API e 11 de interface, cobrindo CA01 a CA10 e o checkout. As IDs nos títulos (`CT-…`, `@CA…`) ligam cada teste ao cenário Gherkin.
- **Bugs conhecidos não quebram a suíte:** os testes que esbarram nos BUG-01 e BUG-02 estão marcados com `test.fail()` e com a referência ao bug. Eles validam o comportamento **esperado** pela documentação e aparecem como "falha esperada". Quando o bug for corrigido, o Playwright acusa o teste, sinalizando que a marcação pode ser removida.
- **Isolamento:** cada teste abre um contexto de navegador novo. Como o carrinho fica no `sessionStorage` da aba, os testes podem rodar em paralelo sem interferir entre si nem com outros candidatos.
- **Padrões:** Page Object ([tests/support/carrinho.page.ts](tests/support/carrinho.page.ts)), seletores acessíveis (`getByRole`, `getByLabel`) e os atributos `data-valor` do resumo.

## Ambiente de execução
Windows 10 · Node 24 · Playwright 1.63 (Chromium) · execução em 07/10/2026.

## Uso de IA
Usei o Claude (Anthropic) como assistente para ler a documentação, sugerir cenários e valores-limite, escrever os roteiros de execução e a automação, e organizar a documentação. Revisei os valores esperados contra a documentação e confirmei cada bug nas evidências (prints e respostas da API).
