import { expect, type Locator, type Page } from '@playwright/test';

/** Page Object da vitrine + carrinho da Verzel Store. */
export class CarrinhoPage {
  readonly campoCupom: Locator;
  readonly mensagemCupom: Locator;
  readonly avisoFrete: Locator;

  constructor(private readonly page: Page) {
    this.campoCupom = page.locator('#campo-cupom');
    this.mensagemCupom = page.locator('#mensagem-cupom');
    this.avisoFrete = page.locator('.aviso-frete');
  }

  cardProduto(nome: string): Locator {
    return this.page.locator('article', { has: this.page.getByRole('heading', { name: nome }) });
  }

  async adicionar(nome: string, quantidade = 1) {
    if (new URL(this.page.url()).pathname !== '/') await this.page.goto('/');
    const botao = this.cardProduto(nome).getByRole('button', { name: 'Adicionar ao carrinho' });
    for (let i = 0; i < quantidade; i++) await botao.click();
  }

  async abrir() {
    await this.page.goto('/carrinho');
    await expect(this.valor('total')).toBeVisible();
  }

  async aplicarCupom(codigo: string) {
    await this.campoCupom.fill(codigo);
    await this.page.getByRole('button', { name: 'Aplicar cupom' }).click();
  }

  async removerCupom() {
    await this.page.getByRole('button', { name: 'Remover cupom' }).click();
  }

  /** Valor exibido no resumo: subtotal | desconto | frete | total. */
  valor(campo: 'subtotal' | 'desconto' | 'frete' | 'total'): Locator {
    return this.page.locator(`[data-valor="${campo}"]`);
  }

  async esperarResumo(esperado: Partial<Record<'subtotal' | 'desconto' | 'frete' | 'total', string>>) {
    for (const [campo, texto] of Object.entries(esperado)) {
      await expect(this.valor(campo as 'total')).toHaveText(texto);
    }
  }
}
