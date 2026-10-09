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
  // Cada caminho termina em uma asserção, para o teste nunca passar sem verificar nada.
  const carrinho = new CarrinhoPage(page);
  await carrinho.adicionar('Camiseta Essencial');
  await page.evaluate(() => sessionStorage.setItem('verzel-store:itens', JSON.stringify([{ produtoId: 'P001', quantidade: 9 }])));
  await page.goto('/carrinho');
  await expect(page.getByRole('heading', { name: 'Camiseta Essencial' })).toBeVisible();

  // Pelo destino do link, e não pelo texto, para uma mudança de rótulo não esvaziar o teste.
  const finalizar = page.locator('a[href="/checkout"]').filter({ visible: true });
  if ((await finalizar.count()) === 0) {
    // Correção possível: o carrinho bloqueia o checkout. Ele precisa mostrar o limite ou já ter ajustado a quantidade.
    const quantidade = Number(await page.locator('output[aria-label="Quantidade de Camiseta Essencial"]').textContent());
    const avisoLimite = await page.getByText(/Limite de 5 unidades/).isVisible();
    expect(quantidade <= 5 || avisoLimite, 'carrinho bloqueado deve ajustar a quantidade ou avisar o limite').toBe(true);
    return;
  }

  await finalizar.first().click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByLabel(/nome/i).fill('Maria Silva');
  await page.getByLabel(/e-mail/i).fill('maria@exemplo.com');
  await page.getByLabel(/cep/i).fill('01310-100');
  const confirmar = page.getByRole('button', { name: 'Confirmar pedido' });
  if (!(await confirmar.isEnabled())) {
    // Correção possível: o checkout bloqueia o envio. Ele precisa explicar o motivo ou ter ajustado a quantidade.
    const quantidades = (await page.locator('main li span:first-child').allTextContents())
      .map((t) => Number(t.match(/^(\d+)x/)?.[1] ?? NaN)).filter((n) => !Number.isNaN(n));
    const motivoVisivel = await page.getByRole('alert').or(page.getByText(/Limite de 5 unidades/)).first().isVisible();
    expect(motivoVisivel || (quantidades.length > 0 && Math.max(...quantidades) <= 5),
      'checkout bloqueado deve avisar o motivo ou ter ajustado a quantidade').toBe(true);
    return;
  }

  const respostaPedido = page.waitForResponse((r) => r.url().endsWith('/api/pedidos'));
  await confirmar.click();
  const resposta = await respostaPedido;

  if (!resposta.ok()) {
    // Correção possível: a API recusa o pedido.
    expect(resposta.status()).toBe(422);
    return;
  }
  // Pedido criado: nenhum item pode ter mais de 5 unidades (verificado na resposta da API).
  const { itens } = (await resposta.json()) as { itens: { quantidade: number }[] };
  expect(itens.length).toBeGreaterThan(0);
  for (const item of itens) expect(item.quantidade).toBeLessThanOrEqual(5);
});
