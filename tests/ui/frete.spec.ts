import { expect, test } from '@playwright/test';
import { CarrinhoPage } from '../support/carrinho.page';

test.describe('Frete grátis', () => {
  test('CT-FRE-02 @CA07 subtotal de R$ 199,80 cobra frete e informa que faltam R$ 0,20', async ({ page }) => {
    const carrinho = new CarrinhoPage(page);
    await carrinho.adicionar('Camiseta Essencial');
    await carrinho.adicionar('Calça Jeans Slim');
    await carrinho.abrir();

    await carrinho.esperarResumo({ subtotal: 'R$ 199,80', frete: 'R$ 19,90', total: 'R$ 219,70' });
    await expect(carrinho.avisoFrete).toHaveText('Faltam R$ 0,20 para o frete grátis.');
  });

  test('CT-FRE-03 @CA06 subtotal de exatamente R$ 200,00 tem frete grátis', async ({ page }) => {
    test.fail(true, 'BUG-01: subtotal de R$ 200,00 cobra frete de R$ 19,90 (ver docs/bugs.md)');
    const carrinho = new CarrinhoPage(page);
    await carrinho.adicionar('Mochila Urbana 20L', 2);
    await carrinho.abrir();

    await carrinho.esperarResumo({ subtotal: 'R$ 200,00', frete: 'Grátis', total: 'R$ 200,00' });
    await expect(carrinho.avisoFrete).toBeHidden();
  });

  test('CT-FRE-06 @CA08 frete grátis usa o subtotal antes do desconto', async ({ page }) => {
    const carrinho = new CarrinhoPage(page);
    await carrinho.adicionar('Jaqueta Corta-Vento');
    await carrinho.abrir();
    await carrinho.aplicarCupom('BEMVINDO10');

    await carrinho.esperarResumo({ subtotal: 'R$ 229,90', desconto: '- R$ 22,99', frete: 'Grátis', total: 'R$ 206,91' });
  });
});
