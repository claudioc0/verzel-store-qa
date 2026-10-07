import { expect, test } from '@playwright/test';
import { CarrinhoPage } from '../support/carrinho.page';

test('CT-QTD-01/02 @CA10 interface limita cada produto a 5 unidades', async ({ page }) => {
  const carrinho = new CarrinhoPage(page);
  await carrinho.adicionar('Kit 3 Pares de Meias', 5);

  const card = carrinho.cardProduto('Kit 3 Pares de Meias');
  await expect(card.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeDisabled();
  await expect(card.getByText('Limite de 5 unidades atingido.')).toBeVisible();

  await carrinho.abrir();
  await expect(page.getByRole('button', { name: 'Aumentar quantidade de Kit 3 Pares de Meias' })).toBeDisabled();
  await expect(page.locator('output[aria-label="Quantidade de Kit 3 Pares de Meias"]')).toHaveText('5');
  await carrinho.esperarResumo({ subtotal: 'R$ 149,50' });
});

test('CT-QTD-07 @CA10 interface não permite finalizar carrinho com mais de 5 unidades', async ({ page }) => {
  test.fail(true, 'BUG-02: carrinho com 9 unidades avisa o limite, mas o pedido é confirmado (ver docs/bugs.md)');
  const carrinho = new CarrinhoPage(page);
  await carrinho.adicionar('Camiseta Essencial');
  await page.evaluate(() => sessionStorage.setItem('verzel-store:itens', JSON.stringify([{ produtoId: 'P001', quantidade: 9 }])));
  await page.goto('/checkout');
  await page.getByLabel(/nome/i).fill('Maria Silva');
  await page.getByLabel(/e-mail/i).fill('maria@exemplo.com');
  await page.getByLabel(/cep/i).fill('01310-100');
  const resposta = page.waitForResponse((r) => r.url().endsWith('/api/pedidos'));
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();

  expect((await resposta).status()).toBe(422);
  await expect(page).toHaveURL(/\/checkout$/);
});
