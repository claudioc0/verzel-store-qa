import { expect, test } from '@playwright/test';
import { calcular } from '../support/api';

test.describe('POST /api/carrinho/calcular', () => {
  test('CT-API-07 @CA01 @CA09 cupom válido desconta 10% dos produtos e não do frete', async ({ request }) => {
    const res = await calcular(request, [{ produtoId: 'P001', quantidade: 1 }, { produtoId: 'P002', quantidade: 1 }], 'BEMVINDO10');

    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({
      subtotal: 199.8, desconto: 19.98, frete: 19.9, freteGratis: false,
      valorFaltanteFreteGratis: 0.2, total: 199.72,
      cupom: { codigo: 'BEMVINDO10', aplicado: true },
    });
  });

  for (const [cupom, mensagem] of [['XYZ123', 'Cupom inválido.'], ['VERAO2026', 'Cupom expirado.']]) {
    test(`CT-API-09 @CA03 @CA04 cupom ${cupom} responde 200 sem desconto`, async ({ request }) => {
      const res = await calcular(request, [{ produtoId: 'P001', quantidade: 1 }], cupom);

      expect(res.status()).toBe(200);
      expect(await res.json()).toMatchObject({ desconto: 0, total: 79.8, cupom: { aplicado: false, mensagem } });
    });
  }

  test('CT-API-08 @CA06 @CA08 subtotal de R$ 200,00 com cupom tem frete grátis', async ({ request }) => {
    test.fail(true, 'BUG-01: subtotal de R$ 200,00 cobra frete de R$ 19,90 (ver docs/bugs.md)');
    const res = await calcular(request, [{ produtoId: 'P005', quantidade: 2 }], 'BEMVINDO10');

    expect(await res.json()).toMatchObject({ subtotal: 200, desconto: 20, frete: 0, freteGratis: true, total: 180 });
  });

  test('CT-API-08 @CA08 subtotal de R$ 219,80 que fica em R$ 197,82 após o desconto mantém o frete grátis', async ({ request }) => {
    const res = await calcular(request, [{ produtoId: 'P003', quantidade: 1 }, { produtoId: 'P006', quantidade: 1 }], 'BEMVINDO10');

    expect(await res.json()).toMatchObject({ subtotal: 219.8, desconto: 21.98, frete: 0, freteGratis: true, total: 197.82 });
  });

  test('CT-API-22 @CA06 valor faltante para frete grátis nunca é negativo', async ({ request }) => {
    const res = await calcular(request, [{ produtoId: 'P007', quantidade: 2 }]);

    expect(await res.json()).toMatchObject({ subtotal: 459.8, frete: 0, freteGratis: true, valorFaltanteFreteGratis: 0 });
  });

  test('CT-API-27 calcula com os preços do servidor e ignora valores enviados pelo cliente', async ({ request }) => {
    const res = await request.post('/api/carrinho/calcular', {
      data: { itens: [{ produtoId: 'P001', quantidade: 1, preco: 1, precoUnitario: 1, total: 1 }], subtotal: 1, desconto: 50, frete: 0, total: 1 },
    });

    expect(await res.json()).toMatchObject({ subtotal: 59.9, desconto: 0, frete: 19.9, total: 79.8, itens: [{ precoUnitario: 59.9 }] });
  });

  test('CT-API-11 @CA10 aceita 5 unidades', async ({ request }) => {
    const res = await calcular(request, [{ produtoId: 'P001', quantidade: 5 }]);
    expect(res.status()).toBe(200);
  });

  test('CT-API-11 @CA10 rejeita 6 unidades', async ({ request }) => {
    test.fail(true, 'BUG-02: API aceita mais de 5 unidades (ver docs/bugs.md)');
    // Só o sintoma do bug (status) é verificado aqui. Se a correção usar um código de erro diferente
    // de QUANTIDADE_MAXIMA_EXCEDIDA, o teste ainda passa a passar e o test.fail() acusa; ao remover a
    // marcação, incluir a verificação do código documentado.
    const res = await calcular(request, [{ produtoId: 'P001', quantidade: 6 }]);

    expect(res.status()).toBe(422);
  });

  for (const [quantidade, nome] of [[0, 'zero'], [-1, 'negativa'], [1.5, 'decimal'], ['2', 'texto']] as const) {
    test(`CT-API-11 rejeita quantidade ${nome} com QUANTIDADE_INVALIDA`, async ({ request }) => {
      const res = await calcular(request, [{ produtoId: 'P001', quantidade: quantidade as number }]);

      expect(res.status()).toBe(422);
      expect(await res.json()).toEqual({
        erro: { codigo: 'QUANTIDADE_INVALIDA', mensagem: expect.any(String), campo: 'itens[0].quantidade' },
      });
    });
  }

  test('CT-API-13 @CA10 item duplicado não burla o limite', async ({ request }) => {
    const res = await calcular(request, [{ produtoId: 'P001', quantidade: 5 }, { produtoId: 'P001', quantidade: 5 }]);

    expect(res.status()).toBe(422);
    expect((await res.json()).erro.codigo).toBe('ITEM_DUPLICADO');
  });
});
