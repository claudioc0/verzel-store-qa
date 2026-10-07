import { expect, test } from '@playwright/test';
import { CarrinhoPage } from '../support/carrinho.page';

test.describe('Cupom de desconto', () => {
  let carrinho: CarrinhoPage;

  test.beforeEach(async ({ page }) => {
    carrinho = new CarrinhoPage(page);
    await carrinho.adicionar('Camiseta Essencial');
    await carrinho.abrir();
  });

  test('CT-CUP-01 @CA01 aplica 10% do BEMVINDO10 sobre o subtotal, sem tocar no frete', async ({ page }) => {
    await carrinho.aplicarCupom('BEMVINDO10');

    await expect(page.getByText('Cupom BEMVINDO10 aplicado.')).toBeVisible();
    await carrinho.esperarResumo({ subtotal: 'R$ 59,90', desconto: '- R$ 5,99', frete: 'R$ 19,90', total: 'R$ 73,81' });
  });

  test('CT-CUP-03 @CA02 ignora maiúsculas/minúsculas e espaços nas pontas', async () => {
    await carrinho.aplicarCupom('  bemvindo10  ');

    await carrinho.esperarResumo({ desconto: '- R$ 5,99', total: 'R$ 73,81' });
  });

  for (const [codigo, mensagem, ca] of [
    ['XYZ123', 'Cupom inválido.', 'CA03'],
    ['VERAO2026', 'Cupom expirado.', 'CA04'],
  ]) {
    test(`CT-CUP @${ca} cupom ${codigo} exibe "${mensagem}" e não aplica desconto`, async () => {
      await carrinho.aplicarCupom(codigo);

      await expect(carrinho.mensagemCupom).toHaveText(mensagem);
      await carrinho.esperarResumo({ desconto: 'R$ 0,00', total: 'R$ 79,80' });
    });
  }

  test('CT-CUP-08/09 @CA05 só um cupom por vez; remover libera o campo para outro', async () => {
    await carrinho.aplicarCupom('BEMVINDO10');
    await expect(carrinho.campoCupom).toBeHidden();

    await carrinho.removerCupom();
    await carrinho.esperarResumo({ desconto: 'R$ 0,00', total: 'R$ 79,80' });
    await expect(carrinho.campoCupom).toBeVisible();

    await carrinho.aplicarCupom('VERAO2026');
    await expect(carrinho.mensagemCupom).toHaveText('Cupom expirado.');
  });
});
