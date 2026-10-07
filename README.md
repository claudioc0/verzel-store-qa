# Teste técnico QA Júnior - Verzel Store

Validação da entrega **cupom de desconto + frete grátis** da [Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev/), feita a partir da [documentação da entrega](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao) (critérios de aceite CA01 a CA11).

## Resultado em resumo

- **79 cenários** executados (UI, API e exploratórios): 59 ✅ · 13 ❌ · 6 ⚠️ observações/dúvidas para o PO · 1 N/A
- **6 registros** em [bugs.md](docs/bugs.md): 3 bugs, 2 melhorias e 1 aguardando decisão do PO:

| Bug | Severidade | Resumo |
|---|---|---|
| [BUG-01](docs/bugs.md#bug-01) | Crítica | Subtotal de **exatamente R$ 200,00** não ganha frete grátis (UI e API). Com o BEMVINDO10, o cliente paga R$ 199,90 em vez de R$ 180,00 |
| [BUG-02](docs/bugs.md#bug-02) | Alta | Pedido com **mais de 5 unidades** do mesmo produto é aceito: a API não valida o limite (aceita quantidades muito acima dele; testado até 1.000.000), e a interface avisa mas deixa finalizar um carrinho acima dele |
| [BUG-03](docs/bugs.md#bug-03) | Baixa (melhoria) | `GET /api` retorna 200 com HTML em vez de erro JSON |
| [BUG-04](docs/bugs.md#bug-04) | Baixa (aguarda PO) | Item sem `quantidade` retorna `QUANTIDADE_INVALIDA` em vez de `ITEM_INVALIDO` |
| [BUG-05](docs/bugs.md#bug-05) | Média | Se o cálculo do carrinho falha depois de uma alteração, o carrinho e o checkout exibem os valores antigos (R$ 79,80) e o pedido é confirmado com outro valor (R$ 139,70) |
| [BUG-06](docs/bugs.md#bug-06) | Baixa (melhoria) | Cupom recusado pela API aparece como "aplicado" no carrinho, e o checkout não permite removê-lo |

Também ficaram registradas as [limitações](docs/plano-de-testes.md#6-limitações-conhecidas) (o CA11 só pôde ser verificado parcialmente) e as [dúvidas para o PO](docs/ambiguidades.md).

## Onde encontrar cada entrega

| Entrega pedida | Local |
|---|---|
| Plano de testes (escopo, estratégia, massa de dados) | [docs/plano-de-testes.md](docs/plano-de-testes.md) |
| Cenários de teste em **Gherkin** | [docs/cenarios/](docs/cenarios/) (`cupom`, `frete`, `quantidade`, `arredondamento`, `checkout`, `api`) |
| Execução (assistida por script) e exploratória, com o resultado de cada cenário | [docs/execucao.md](docs/execucao.md) |
| Report dos bugs | [docs/bugs.md](docs/bugs.md) |
| Documento de evidências | [docs/evidencias.md](docs/evidencias.md) → prints em [evidencias/ui/](evidencias/ui/), requisições e respostas em [evidencias/api/](evidencias/api/) |
| Ambiguidades e interpretações adotadas | [docs/ambiguidades.md](docs/ambiguidades.md) |
| Checklist de revisão manual: 25 itens refeitos à mão no navegador e no terminal (reprodução de cada bug, conferência dos valores esperados com calculadora e validação do repositório) | [docs/checklist-revisao.md](docs/checklist-revisao.md) (leitura no GitHub) · [planilha .xlsx](docs/checklist-revisao.xlsx) com os passos detalhados (download) · prints em [evidencias/manual/](evidencias/manual/) |
| Automação com Playwright | [tests/](tests/) |

```
├── docs/            plano, cenários .feature, execução, bugs, evidências, ambiguidades
├── evidencias/      ui/ (PNG + resultados.json) · api/ (JSON) · manual/ (prints da revisão manual) · automacao/ (relatório HTML)
├── scripts/         roteiros que geraram as evidências da execução
├── tests/
│   ├── api/         testes de API (carrinho e pedidos)
│   ├── ui/          testes E2E (cupom, frete, quantidade, checkout)
│   └── support/     Page Object do carrinho e helpers de API
└── playwright.config.ts
```

## Como rodar a automação

**Pré-requisitos:** [Node.js](https://nodejs.org/) 20 ou superior (exigido pelo Playwright 1.63) e acesso à internet (os testes rodam contra o ambiente publicado).

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
| `npm run report` | Abre o relatório HTML da última execução. O arquivo fica em `evidencias/automacao/relatorio/`, mas o GitHub o exibe como código-fonte: para vê-lo, clone o repositório e use este comando |
| `npm run evidencias:api` / `npm run evidencias:ui` | Regeram as evidências da execução manual |

### Sobre a automação
- **40 testes**: 23 de API e 17 de interface, cobrindo CA01 a CA10, o checkout e o carrinho (inclusive os caminhos de erro da API), a consistência entre a tela e a API e a integridade dos preços (a API ignora valores enviados pelo cliente). As IDs nos títulos (`CT-…`, `@CA…`) ligam cada teste ao cenário Gherkin.
- **Bugs conhecidos não quebram a suíte:** os 6 testes que esbarram nos BUG-01, BUG-02 e BUG-05 estão marcados com `test.fail()` e com a referência ao bug. Eles validam o comportamento **esperado** pela documentação e aparecem como "falha esperada". Cada um verifica o **resultado**, e não um jeito específico de corrigir: o CT-QTD-07, por exemplo, só exige que nenhum pedido seja confirmado com mais de 5 unidades, seja porque a interface bloqueia, ajusta a quantidade ou recebe erro da API. Assim, qualquer correção faz o teste passar, e o Playwright acusa a mudança, sinalizando que a marcação pode ser removida. Nos testes de API, só o status é verificado enquanto o bug existe; o código de erro documentado entra na asserção quando a marcação for retirada.
- **Isolamento:** cada teste abre um contexto de navegador novo, e o carrinho fica no `sessionStorage` da aba, então os testes não interferem entre si. Os testes de API criam pedidos, mas, segundo a [documentação](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao#ambiente), "a API não guarda nada entre uma chamada e outra" e os pedidos não são armazenados. Por isso não afetam outros candidatos.
- **Padrões:** Page Object ([tests/support/carrinho.page.ts](tests/support/carrinho.page.ts)), seletores acessíveis (`getByRole`, `getByLabel`) e os atributos `data-valor` do resumo.

## Ambiente de execução
Windows 10 · Node 24 · Playwright 1.63 (Chromium) · execução em 07/10/2026.

## Uso de IA
Usei o Claude (Anthropic) como assistente para ler a documentação, sugerir cenários e valores-limite, escrever os roteiros de execução e a automação, e organizar a documentação. Revisei os valores esperados contra a documentação e confirmei cada bug nas evidências (prints e respostas da API).
