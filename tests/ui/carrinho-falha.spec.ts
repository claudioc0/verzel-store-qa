import { expect, test } from '@playwright/test';
import { CarrinhoPage } from '../support/carrinho.page';

const CALCULO = '**/api/carrinho/calcular';

test.describe('Carrinho quando o cálculo falha', () => {
  test('CT-CAR-01 falha ao abrir o carrinho mostra o erro e esconde resumo e checkout', async ({ page }) => {
    const carrinho = new CarrinhoPage(page);
    await carrinho.adicionar('Camiseta Essencial');
    await page.route(CALCULO, (route) => route.fulfill({ status: 500, body: '' }));
    await page.goto('/carrinho');

    await expect(page.getByRole('alert')).toHaveText('Não foi possível calcular o carrinho.');
    await expect(carrinho.valor('total')).toBeHidden();
    await expect(page.locator('a[href="/checkout"]')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Camiseta Essencial' })).toBeVisible();
  });

  test('CT-CAR-01 falha depois de alterar o carrinho não leva a pedido com valor diferente do exibido', async ({ page }) => {
    test.fail(true, 'BUG-05: checkout exibe R$ 79,80 e o pedido é confirmado com R$ 139,70 (ver docs/bugs.md)');
    // Verifica o resultado: qualquer correção (esconder o resumo antigo, bloquear o checkout ou
    // recalcular no checkout) faz o teste passar, e o test.fail() acusa a mudança.
    const carrinho = new CarrinhoPage(page);
    await carrinho.adicionar('Camiseta Essencial');
    await carrinho.abrir();
    await page.route(CALCULO, (route) => route.fulfill({ status: 500, body: '' }));
    await page.getByRole('button', { name: 'Aumentar quantidade de Camiseta Essencial' }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    // Cada caminho termina em uma asserção, para o teste nunca passar sem verificar nada.
    const finalizar = page.locator('a[href="/checkout"]').filter({ visible: true });
    if ((await finalizar.count()) === 0) {
      // Correção possível: o carrinho bloqueia o checkout. Os valores antigos também não podem ficar na tela.
      const total = carrinho.valor('total');
      if (await total.isVisible()) await expect(total).not.toHaveText('R$ 79,80');
      await expect(page.locator('output[aria-label="Quantidade de Camiseta Essencial"]')).toHaveText('2');
      return;
    }
    await finalizar.first().click();
    await expect(page).toHaveURL(/\/checkout$/);
    const totalExibido = (await carrinho.valor('total').textContent())?.trim();
    expect(totalExibido, 'o checkout precisa exibir um total').toMatch(/^R\$ /);

    await page.unroute(CALCULO);
    await page.getByLabel(/nome/i).fill('Maria Silva');
    await page.getByLabel(/e-mail/i).fill('maria@exemplo.com');
    await page.getByLabel(/cep/i).fill('01310-100');
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();
    await expect(page).toHaveURL(/\/pedido-confirmado$/);

    await expect(carrinho.valor('total')).toHaveText(totalExibido ?? '');
  });
});
