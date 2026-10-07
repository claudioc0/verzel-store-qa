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

test('CT-QTD-07 @CA10 carrinho com mais de 5 unidades não vira pedido com mais de 5 unidades', async ({ page }) => {
  test.fail(true, 'BUG-02: carrinho com 9 unidades avisa o limite, mas o pedido é confirmado (ver docs/bugs.md)');
  // A asserção é sobre o resultado, não sobre o caminho: qualquer correção (bloquear o checkout,
  // ajustar para 5 ou a API rejeitar) faz o teste passar, e o test.fail() acusa a mudança.
  const carrinho = new CarrinhoPage(page);
  await carrinho.adicionar('Camiseta Essencial');
  await page.evaluate(() => sessionStorage.setItem('verzel-store:itens', JSON.stringify([{ produtoId: 'P001', quantidade: 9 }])));
  await carrinho.abrir();

  const finalizar = page.getByRole('link', { name: 'Finalizar compra' });
  if (await finalizar.isVisible()) await finalizar.click();
  if (page.url().endsWith('/checkout')) {
    await page.getByLabel(/nome/i).fill('Maria Silva');
    await page.getByLabel(/e-mail/i).fill('maria@exemplo.com');
    await page.getByLabel(/cep/i).fill('01310-100');
    const confirmar = page.getByRole('button', { name: 'Confirmar pedido' });
    if (await confirmar.isEnabled()) await confirmar.click();
    // Espera a navegação para a confirmação ou a resposta de erro, o que vier primeiro.
    await Promise.race([
      page.waitForURL('**/pedido-confirmado', { timeout: 5000 }),
      page.waitForResponse((r) => r.url().endsWith('/api/pedidos') && r.status() >= 400, { timeout: 5000 }),
    ]).catch(() => {});
  }

  // Se algum pedido foi confirmado, nenhum item pode ter mais de 5 unidades.
  if (page.url().endsWith('/pedido-confirmado')) {
    const quantidades = (await page.locator('main li span:first-child').allTextContents())
      .map((t) => Number(t.match(/^(\d+)x/)?.[1] ?? 0));
    expect(Math.max(...quantidades)).toBeLessThanOrEqual(5);
  }
});
