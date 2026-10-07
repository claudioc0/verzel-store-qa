import type { APIRequestContext } from '@playwright/test';

export type Item = { produtoId: string; quantidade: number };

export const clienteValido = { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' };

export function calcular(request: APIRequestContext, itens: Item[], cupom?: string) {
  return request.post('/api/carrinho/calcular', { data: { itens, ...(cupom !== undefined && { cupom }) } });
}

export function criarPedido(request: APIRequestContext, itens: Item[], cupom?: string, cliente = clienteValido) {
  return request.post('/api/pedidos', { data: { cliente, itens, ...(cupom !== undefined && { cupom }) } });
}
