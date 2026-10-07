import { expect, test } from '@playwright/test';
import { calcular, criarPedido } from '../support/api';

test.describe('POST /api/pedidos', () => {
  test('CT-API-14 cria pedido com os mesmos valores do cálculo do carrinho', async ({ request }) => {
    const itens = [{ produtoId: 'P005', quantidade: 1 }];
    const res = await criarPedido(request, itens, 'BEMVINDO10');
    const calculo = await (await calcular(request, itens, 'BEMVINDO10')).json();

    expect(res.status()).toBe(201);
    const pedido = await res.json();
    expect(pedido.numero).toMatch(/^VZ-\d{6}$/);
    expect(pedido.cliente.cep).toBe('01310100');
    for (const campo of ['subtotal', 'desconto', 'frete', 'freteGratis', 'total'] as const) {
      expect(pedido[campo], campo).toBe(calculo[campo]);
    }
  });

  for (const [cupom, codigo] of [['XYZ123', 'CUPOM_INVALIDO'], ['VERAO2026', 'CUPOM_EXPIRADO']]) {
    test(`CT-API-15 @CA03 @CA04 cupom ${cupom} gera 422 ${codigo}`, async ({ request }) => {
      const res = await criarPedido(request, [{ produtoId: 'P001', quantidade: 1 }], cupom);

      expect(res.status()).toBe(422);
      expect((await res.json()).erro).toMatchObject({ codigo, campo: 'cupom' });
    });
  }

  test('CT-API-16 dados de cliente inválidos geram DADOS_INVALIDOS com os campos', async ({ request }) => {
    const res = await criarPedido(request, [{ produtoId: 'P001', quantidade: 1 }], undefined,
      { nome: 'Maria', email: 'maria', cep: '123' });

    expect(res.status()).toBe(422);
    const { erro } = await res.json();
    expect(erro.codigo).toBe('DADOS_INVALIDOS');
    expect(erro.campos.map((c: { campo: string }) => c.campo).sort()).toEqual(['cliente.cep', 'cliente.email', 'cliente.nome']);
  });

  test('CT-API-21 @CA10 pedido com 5 unidades (limite) é aceito', async ({ request }) => {
    const res = await criarPedido(request, [{ produtoId: 'P001', quantidade: 5 }]);

    expect(res.status()).toBe(201);
    expect((await res.json()).itens[0]).toMatchObject({ quantidade: 5, total: 299.5 });
  });

  for (const [nome, itens, codigo] of [
    ['item duplicado', [{ produtoId: 'P001', quantidade: 3 }, { produtoId: 'P001', quantidade: 3 }], 'ITEM_DUPLICADO'],
    ['lista vazia', [], 'ITENS_OBRIGATORIOS'],
    ['produto inexistente', [{ produtoId: 'P999', quantidade: 1 }], 'PRODUTO_NAO_ENCONTRADO'],
  ] as const) {
    test(`CT-API-29 pedido com ${nome} é rejeitado com ${codigo}`, async ({ request }) => {
      const res = await criarPedido(request, [...itens]);

      expect(res.status()).toBe(422);
      expect((await res.json()).erro.codigo).toBe(codigo);
    });
  }

  test('CT-API-17 @CA10 pedido com 6 unidades é rejeitado', async ({ request }) => {
    test.fail(true, 'BUG-02: API aceita mais de 5 unidades (ver docs/bugs.md)');
    const res = await criarPedido(request, [{ produtoId: 'P001', quantidade: 6 }]);

    expect(res.status()).toBe(422);
  });
});
