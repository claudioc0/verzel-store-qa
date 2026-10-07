import { expect, test } from '@playwright/test';
import { CarrinhoPage } from '../support/carrinho.page';

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v).replace(/ /g, ' ');

test('EXP-06 valores exibidos no carrinho são os retornados por /api/carrinho/calcular', async ({ page }) => {
  const carrinho = new CarrinhoPage(page);
  await carrinho.adicionar('Camiseta Essencial');
  await carrinho.adicionar('Calça Jeans Slim');
  await carrinho.abrir();

  const resposta = page.waitForResponse((r) => r.url().endsWith('/api/carrinho/calcular') && !!r.request().postData()?.includes('BEMVINDO10'));
  await carrinho.aplicarCupom('BEMVINDO10');
  const api = await (await resposta).json();

  await carrinho.esperarResumo({
    subtotal: brl(api.subtotal),
    desconto: `- ${brl(api.desconto)}`,
    frete: api.freteGratis ? 'Grátis' : brl(api.frete),
    total: brl(api.total),
  });
});
