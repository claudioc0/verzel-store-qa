# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui\carrinho-falha.spec.ts >> Carrinho quando o cálculo falha >> CT-CAR-01 falha depois de alterar o carrinho não leva a pedido com valor diferente do exibido
- Location: tests\ui\carrinho-falha.spec.ts:19:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('[data-valor="total"]')
Expected: "R$ 79,80"
Received: "R$ 139,70"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" locator('[data-valor="total"]') with timeout 5000ms
  - waiting for locator('[data-valor="total"]')
    14 × locator resolved to <dd data-valor="total">R$ 139,70</dd>
       - unexpected value "R$ 139,70"

```

```yaml
- definition: R$ 139,70
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { CarrinhoPage } from '../support/carrinho.page';
  3  | 
  4  | const CALCULO = '**/api/carrinho/calcular';
  5  | 
  6  | test.describe('Carrinho quando o cálculo falha', () => {
  7  |   test('CT-CAR-01 falha ao abrir o carrinho mostra o erro e esconde resumo e checkout', async ({ page }) => {
  8  |     const carrinho = new CarrinhoPage(page);
  9  |     await carrinho.adicionar('Camiseta Essencial');
  10 |     await page.route(CALCULO, (route) => route.fulfill({ status: 500, body: '' }));
  11 |     await page.goto('/carrinho');
  12 | 
  13 |     await expect(page.getByRole('alert')).toHaveText('Não foi possível calcular o carrinho.');
  14 |     await expect(carrinho.valor('total')).toBeHidden();
  15 |     await expect(page.locator('a[href="/checkout"]')).toBeHidden();
  16 |     await expect(page.getByRole('heading', { name: 'Camiseta Essencial' })).toBeVisible();
  17 |   });
  18 | 
  19 |   test('CT-CAR-01 falha depois de alterar o carrinho não leva a pedido com valor diferente do exibido', async ({ page }) => {
  20 |     test.fail(true, 'BUG-05: checkout exibe R$ 79,80 e o pedido é confirmado com R$ 139,70 (ver docs/bugs.md)');
  21 |     // Verifica o resultado: qualquer correção (esconder o resumo antigo, bloquear o checkout ou
  22 |     // recalcular no checkout) faz o teste passar, e o test.fail() acusa a mudança.
  23 |     const carrinho = new CarrinhoPage(page);
  24 |     await carrinho.adicionar('Camiseta Essencial');
  25 |     await carrinho.abrir();
  26 |     await page.route(CALCULO, (route) => route.fulfill({ status: 500, body: '' }));
  27 |     await page.getByRole('button', { name: 'Aumentar quantidade de Camiseta Essencial' }).click();
  28 |     await expect(page.getByRole('alert')).toBeVisible();
  29 | 
  30 |     // Cada caminho termina em uma asserção, para o teste nunca passar sem verificar nada.
  31 |     const finalizar = page.locator('a[href="/checkout"]').filter({ visible: true });
  32 |     if ((await finalizar.count()) === 0) {
  33 |       // Correção possível: o carrinho bloqueia o checkout. Os valores antigos também não podem ficar na tela.
  34 |       const total = carrinho.valor('total');
  35 |       if (await total.isVisible()) await expect(total).not.toHaveText('R$ 79,80');
  36 |       await expect(page.locator('output[aria-label="Quantidade de Camiseta Essencial"]')).toHaveText('2');
  37 |       return;
  38 |     }
  39 |     await finalizar.first().click();
  40 |     await expect(page).toHaveURL(/\/checkout$/);
  41 |     const totalExibido = (await carrinho.valor('total').textContent())?.trim();
  42 |     expect(totalExibido, 'o checkout precisa exibir um total').toMatch(/^R\$ /);
  43 | 
  44 |     await page.unroute(CALCULO);
  45 |     await page.getByLabel(/nome/i).fill('Maria Silva');
  46 |     await page.getByLabel(/e-mail/i).fill('maria@exemplo.com');
  47 |     await page.getByLabel(/cep/i).fill('01310-100');
  48 |     await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  49 |     await expect(page).toHaveURL(/\/pedido-confirmado$/);
  50 | 
> 51 |     await expect(carrinho.valor('total')).toHaveText(totalExibido ?? '');
     |                                           ^ Error: expect(locator).toHaveText(expected) failed
  52 |   });
  53 | });
  54 | 
```