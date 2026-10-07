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
