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
    await expect(page.getByRole('link', { name: 'Finalizar compra' })).toBeHidden();
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

    const finalizar = page.getByRole('link', { name: 'Finalizar compra' });
    if (!(await finalizar.isVisible())) return;
    await finalizar.click();
    const totalExibido = (await carrinho.valor('total').textContent())?.trim();

    await page.unroute(CALCULO);
    await page.getByLabel(/nome/i).fill('Maria Silva');
    await page.getByLabel(/e-mail/i).fill('maria@exemplo.com');
    await page.getByLabel(/cep/i).fill('01310-100');
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();
    await expect(page).toHaveURL(/\/pedido-confirmado$/);

    await expect(carrinho.valor('total')).toHaveText(totalExibido ?? '');
  });
});
