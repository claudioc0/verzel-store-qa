import { expect, test } from '@playwright/test';
import { CarrinhoPage } from '../support/carrinho.page';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    const carrinho = new CarrinhoPage(page);
    await carrinho.adicionar('Camiseta Essencial');
    await carrinho.abrir();
    await carrinho.aplicarCupom('BEMVINDO10');
    await page.getByRole('link', { name: 'Finalizar compra' }).click();
  });

  test('CT-CHK-01 / CT-CUP-11 confirma pedido com cupom e esvazia o carrinho', async ({ page }) => {
    await page.getByLabel(/nome/i).fill('Maria Silva');
    await page.getByLabel(/e-mail/i).fill('maria@exemplo.com');
    await page.getByLabel(/cep/i).fill('01310-100');
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();

    await expect(page).toHaveURL(/\/pedido-confirmado$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Pedido VZ-\d{6}$/);
    await expect(page.getByText('Obrigado, Maria.')).toBeVisible();
    await new CarrinhoPage(page).esperarResumo({ desconto: '- R$ 5,99', total: 'R$ 73,81' });

    await page.goto('/carrinho');
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible();
  });

  test('CT-CHK-03 bloqueia pedido com dados inválidos e mostra o erro em cada campo', async ({ page }) => {
    await page.getByLabel(/nome/i).fill('Maria');
    await page.getByLabel(/e-mail/i).fill('maria.exemplo.com');
    await page.getByLabel(/cep/i).fill('1310-100');
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByText('Informe nome e sobrenome.')).toBeVisible();
    await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
    await expect(page.getByText('Informe um CEP com 8 dígitos.')).toBeVisible();
  });
});
