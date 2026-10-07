// Executa os cenários de interface de docs/cenarios/*.feature, salva um print por passo
// relevante em evidencias/ui/ e grava os valores observados em evidencias/ui/resultados.json.
// Uso: node scripts/executar-ui.mjs [regex de IDs]   ex.: node scripts/executar-ui.mjs "CT-CHK-0[78]|EXP-05"
// Com filtro, roda só os cenários correspondentes e mescla o resultado no resultados.json existente.
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = 'https://verzel-store.qa-test-verzel-store.workers.dev';
const DIR = new URL('../evidencias/ui/', import.meta.url);
mkdirSync(DIR, { recursive: true });
const FILTRO = process.argv[2] ? new RegExp(process.argv[2]) : null;
const ARQUIVO = fileURLToPath(new URL('resultados.json', DIR));
const resultados = FILTRO && existsSync(ARQUIVO) ? JSON.parse(readFileSync(ARQUIVO, 'utf-8')) : {};

const browser = await chromium.launch();

async function novaAba(viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport, locale: 'pt-BR' });
  return ctx.newPage();
}

async function adicionar(page, nome, vezes = 1) {
  if (!page.url().endsWith('/')) await page.goto(BASE + '/');
  const botao = page.locator('article', { has: page.getByRole('heading', { name: nome }) })
    .getByRole('button', { name: 'Adicionar ao carrinho' });
  for (let i = 0; i < vezes; i++) await botao.click();
}

async function irCarrinho(page) {
  await page.goto(BASE + '/carrinho');
  await page.locator('[data-valor="total"]').waitFor();
  await page.waitForTimeout(600);
}

async function aplicarCupom(page, codigo) {
  await page.locator('#campo-cupom').fill(codigo);
  await page.getByRole('button', { name: 'Aplicar cupom' }).click();
  await page.waitForTimeout(900);
}

async function resumo(page) {
  const v = async (k) => (await page.locator(`[data-valor="${k}"]`).first().textContent())?.trim();
  const texto = async (sel) => {
    const l = page.locator(sel).first();
    return (await l.count()) ? (await l.innerText()).trim() : null;
  };
  return {
    subtotal: await v('subtotal'), desconto: await v('desconto'), frete: await v('frete'), total: await v('total'),
    rotuloDesconto: await texto('.resumo-valores div:nth-child(2) dt'),
    avisoFrete: await texto('.aviso-frete'),
    mensagemCupom: await texto('#mensagem-cupom'),
    cupomAplicado: await texto('.cupom-aplicado, form.cupom ~ div, .cupom'),
  };
}

async function print(page, nome) {
  await page.screenshot({ path: fileURLToPath(new URL(`${nome}.png`, DIR)), fullPage: true });
}

async function cenario(id, fn) {
  if (FILTRO && !FILTRO.test(id)) return;
  const page = await novaAba();
  try {
    resultados[id] = await fn(page);
  } catch (e) {
    resultados[id] = { erro: String(e).slice(0, 300) };
    await print(page, `${id}-erro`).catch(() => {});
  }
  console.log(id, JSON.stringify(resultados[id]));
  await page.context().close();
}

// ---------- Cupom ----------
await cenario('CT-CUP-01', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p);
  await aplicarCupom(p, 'BEMVINDO10'); await print(p, 'CT-CUP-01');
  return resumo(p);
});
await cenario('CT-CUP-02', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await adicionar(p, 'Calça Jeans Slim'); await irCarrinho(p);
  await aplicarCupom(p, 'BEMVINDO10'); await print(p, 'CT-CUP-02');
  return resumo(p);
});
await cenario('CT-CUP-03', async (p) => {
  const out = {};
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p);
  for (const [i, c] of ['bemvindo10', 'BemVindo10', '  BEMVINDO10', 'BEMVINDO10  ', ' bemvindo10 '].entries()) {
    await aplicarCupom(p, c); await print(p, `CT-CUP-03-${i + 1}`);
    out[JSON.stringify(c)] = await resumo(p);
    const remover = p.getByRole('button', { name: /remover cupom/i });
    if (await remover.count()) { await remover.click(); await p.waitForTimeout(500); }
  }
  return out;
});
await cenario('CT-CUP-04', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p);
  await aplicarCupom(p, 'BEM VINDO10'); await print(p, 'CT-CUP-04');
  return resumo(p);
});
await cenario('CT-CUP-05', async (p) => {
  const out = {};
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p);
  for (const c of ['XYZ123', 'BEMVINDO', 'BEMVINDO100', 'BEMVINDO1O']) {
    await aplicarCupom(p, c); await print(p, `CT-CUP-05-${c}`); out[c] = await resumo(p);
  }
  return out;
});
await cenario('CT-CUP-06', async (p) => {
  const out = {};
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p);
  for (const [i, c] of ['VERAO2026', 'verao2026', ' VERAO2026 '].entries()) {
    await aplicarCupom(p, c); await print(p, `CT-CUP-06-${i + 1}`); out[JSON.stringify(c)] = await resumo(p);
  }
  return out;
});
await cenario('CT-CUP-07', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p);
  await aplicarCupom(p, ''); await print(p, 'CT-CUP-07');
  const r1 = await resumo(p);
  await aplicarCupom(p, '   '); await print(p, 'CT-CUP-07-espacos');
  return { vazio: r1, soEspacos: await resumo(p) };
});
await cenario('CT-CUP-08-09', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p);
  await aplicarCupom(p, 'BEMVINDO10'); await print(p, 'CT-CUP-08');
  const aplicado = { ...(await resumo(p)), campoCupomVisivel: await p.locator('#campo-cupom').count(),
    areaCupom: await p.locator('.layout-compra > div').first().innerText() };
  await p.getByRole('button', { name: /remover/i }).filter({ hasNotText: /^Remover$/ }).last().click().catch(async () => {
    await p.locator('button', { hasText: /remover cupom/i }).click();
  });
  await p.waitForTimeout(800); await print(p, 'CT-CUP-09-removido');
  const removido = { ...(await resumo(p)), campoCupomVisivel: await p.locator('#campo-cupom').count() };
  await aplicarCupom(p, 'VERAO2026'); await print(p, 'CT-CUP-09-outro');
  return { aplicado, removido, outro: await resumo(p) };
});
await cenario('CT-CUP-10', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p);
  await aplicarCupom(p, 'BEMVINDO10');
  await p.getByRole('button', { name: 'Aumentar quantidade de Camiseta Essencial' }).click();
  await p.waitForTimeout(900); await print(p, 'CT-CUP-10');
  return resumo(p);
});

// ---------- Frete ----------
const freteCasos = [
  ['CT-FRE-01', [['Camiseta Essencial', 1]], null],
  ['CT-FRE-02', [['Camiseta Essencial', 1], ['Calça Jeans Slim', 1]], null],
  ['CT-FRE-03', [['Mochila Urbana 20L', 2]], null],
  ['CT-FRE-04', [['Jaqueta Corta-Vento', 1]], null],
  ['CT-FRE-05', [['Mochila Urbana 20L', 2]], 'BEMVINDO10'],
  ['CT-FRE-06', [['Jaqueta Corta-Vento', 1]], 'BEMVINDO10'],
  ['CT-FRE-07', [['Camiseta Essencial', 1], ['Calça Jeans Slim', 1]], 'BEMVINDO10'],
];
for (const [id, itens, cupom] of freteCasos) {
  await cenario(id, async (p) => {
    for (const [n, q] of itens) await adicionar(p, n, q);
    await irCarrinho(p);
    if (cupom) await aplicarCupom(p, cupom);
    await print(p, id);
    return resumo(p);
  });
}
await cenario('CT-FRE-08', async (p) => {
  await adicionar(p, 'Mochila Urbana 20L'); await irCarrinho(p);
  const um = await resumo(p); await print(p, 'CT-FRE-08-1un');
  await p.getByRole('button', { name: 'Aumentar quantidade de Mochila Urbana 20L' }).click();
  await p.waitForTimeout(900); await print(p, 'CT-FRE-08-2un');
  const dois = await resumo(p);
  await p.getByRole('button', { name: 'Diminuir quantidade de Mochila Urbana 20L' }).click();
  await p.waitForTimeout(900);
  return { um, dois, volta: await resumo(p) };
});

// ---------- Quantidade ----------
await cenario('CT-QTD-01', async (p) => {
  await adicionar(p, 'Kit 3 Pares de Meias', 5);
  const card = p.locator('article', { has: p.getByRole('heading', { name: 'Kit 3 Pares de Meias' }) });
  await print(p, 'CT-QTD-01-vitrine');
  const r = { botaoDesabilitado: await card.getByRole('button').isDisabled(), aviso: (await card.locator('.produto-aviso').innerText()).trim(),
    contadorCabecalho: await p.locator('header').innerText() };
  await irCarrinho(p); await print(p, 'CT-QTD-01-carrinho');
  r.quantidade = await p.locator('output[aria-label="Quantidade de Kit 3 Pares de Meias"]').textContent();
  return r;
});
await cenario('CT-QTD-02', async (p) => {
  await adicionar(p, 'Kit 3 Pares de Meias', 5); await irCarrinho(p);
  const mais = p.getByRole('button', { name: 'Aumentar quantidade de Kit 3 Pares de Meias' });
  const desabilitado = await mais.isDisabled();
  if (!desabilitado) { await mais.click(); await p.waitForTimeout(900); }
  await print(p, 'CT-QTD-02');
  return { botaoMaisDesabilitado: desabilitado, quantidade: await p.locator('output[aria-label="Quantidade de Kit 3 Pares de Meias"]').textContent(), ...(await resumo(p)) };
});
await cenario('CT-QTD-04', async (p) => {
  await adicionar(p, 'Kit 3 Pares de Meias', 2); await irCarrinho(p);
  const menos = p.getByRole('button', { name: 'Diminuir quantidade de Kit 3 Pares de Meias' });
  await menos.click(); await p.waitForTimeout(700); await print(p, 'CT-QTD-04');
  return { quantidade: await p.locator('output[aria-label="Quantidade de Kit 3 Pares de Meias"]').textContent(), menosDesabilitado: await menos.isDisabled() };
});
await cenario('CT-QTD-05', async (p) => {
  await adicionar(p, 'Kit 3 Pares de Meias', 5); await adicionar(p, 'Boné Aba Curva', 5);
  await irCarrinho(p); await print(p, 'CT-QTD-05');
  return resumo(p);
});
await cenario('CT-QTD-06', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await adicionar(p, 'Boné Aba Curva'); await irCarrinho(p);
  await p.getByRole('button', { name: 'Remover Boné Aba Curva do carrinho' }).click();
  await p.waitForTimeout(800); await print(p, 'CT-QTD-06');
  return { itens: await p.locator('.item-carrinho h3').allTextContents(), ...(await resumo(p)) };
});

// ---------- Arredondamento ----------
for (const [i, [n, q]] of [['Camiseta Essencial', 3], ['Kit 3 Pares de Meias', 3], ['Kit 3 Pares de Meias', 5], ['Tênis Casual Urbano', 1], ['Jaqueta Corta-Vento', 3]].entries()) {
  await cenario(`CT-ARR-01-${i + 1}`, async (p) => {
    await adicionar(p, n, q); await irCarrinho(p); await aplicarCupom(p, 'BEMVINDO10');
    await print(p, `CT-ARR-01-${i + 1}`); return resumo(p);
  });
}
await cenario('CT-ARR-02', async (p) => {
  await p.goto(BASE + '/');
  await p.getByRole('button', { name: 'Adicionar ao carrinho' }).nth(7).waitFor();
  for (const b of await p.getByRole('button', { name: 'Adicionar ao carrinho' }).all()) await b.click();
  await irCarrinho(p); await aplicarCupom(p, 'BEMVINDO10'); await print(p, 'CT-ARR-02');
  return resumo(p);
});

// ---------- Checkout ----------
async function preencher(p, nome, email, cep) {
  await p.getByLabel(/nome/i).fill(nome); await p.getByLabel(/e-mail/i).fill(email); await p.getByLabel(/cep/i).fill(cep);
}
await cenario('CT-CHK-01', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p);
  const carrinho = await resumo(p);
  await p.goto(BASE + '/checkout'); await p.getByRole('button', { name: 'Confirmar pedido' }).waitFor();
  await preencher(p, 'Maria Silva', 'maria@exemplo.com', '01310-100'); await print(p, 'CT-CHK-01-form');
  await p.getByRole('button', { name: 'Confirmar pedido' }).click();
  await p.waitForURL('**/pedido-confirmado'); await p.waitForTimeout(500); await print(p, 'CT-CHK-01-confirmado');
  const conf = { url: p.url(), texto: await p.locator('main').innerText(), resumo: await resumo(p) };
  await irCarrinho(p).catch(() => {}); await print(p, 'CT-CHK-01-carrinho-apos');
  return { carrinho, conf, carrinhoApos: await p.locator('main').innerText() };
});
await cenario('CT-CHK-02', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await p.goto(BASE + '/checkout');
  await preencher(p, 'Maria Silva', 'maria@exemplo.com', '01310100');
  await p.getByRole('button', { name: 'Confirmar pedido' }).click(); await p.waitForTimeout(2000);
  await print(p, 'CT-CHK-02'); return { url: p.url() };
});
const invalidos = [
  ['', 'maria@exemplo.com', '01310-100'], ['Maria', 'maria@exemplo.com', '01310-100'], ['Maria S', 'maria@exemplo.com', '01310-100'],
  ['   ', 'maria@exemplo.com', '01310-100'], ['Maria Silva', '', '01310-100'], ['Maria Silva', 'maria.exemplo.com', '01310-100'],
  ['Maria Silva', 'maria@exemplo', '01310-100'], ['Maria Silva', 'maria @exemplo.com', '01310-100'], ['Maria Silva', 'maria@exemplo.com', ''],
  ['Maria Silva', 'maria@exemplo.com', '1310-100'], ['Maria Silva', 'maria@exemplo.com', '01310-1000'], ['Maria Silva', 'maria@exemplo.com', 'ABCDE-FGH'],
];
await cenario('CT-CHK-03', async (p) => {
  await adicionar(p, 'Camiseta Essencial');
  const out = [];
  for (const [i, d] of invalidos.entries()) {
    // Cada caso parte de um formulário recém-carregado, para que erros de um caso não mascarem o próximo.
    await p.goto(BASE + '/checkout');
    await preencher(p, ...d); await p.getByRole('button', { name: 'Confirmar pedido' }).click();
    await p.locator('[id$="-erro"]').first().waitFor({ timeout: 5000 }).catch(() => {});
    await print(p, `CT-CHK-03-${String(i + 1).padStart(2, '0')}`);
    out.push({ dados: d, url: p.url(), erros: await p.locator('[id$="-erro"]').allInnerTexts() });
    if (!p.url().endsWith('/checkout')) break;
  }
  return out;
});
await cenario('CT-CHK-04', async (p) => {
  await p.goto(BASE + '/checkout'); await p.waitForTimeout(1000); await print(p, 'CT-CHK-04');
  return { url: p.url() };
});
await cenario('CT-CHK-05', async (p) => {
  await p.goto(BASE + '/pedido-confirmado'); await p.waitForTimeout(800); await print(p, 'CT-CHK-05');
  return { texto: await p.locator('main').innerText() };
});
await cenario('CT-CHK-06', async (p) => {
  await adicionar(p, 'Mochila Urbana 20L', 2); await irCarrinho(p); await aplicarCupom(p, 'BEMVINDO10');
  await p.getByRole('link', { name: 'Finalizar compra' }).click();
  await preencher(p, 'Maria Silva', 'maria@exemplo.com', '01310-100');
  const checkout = await resumo(p); await print(p, 'CT-CHK-06-checkout');
  await p.getByRole('button', { name: 'Confirmar pedido' }).click(); await p.waitForURL('**/pedido-confirmado');
  await p.waitForTimeout(500); await print(p, 'CT-CHK-06-confirmado');
  return { checkout, confirmado: await resumo(p) };
});
await cenario('CT-CUP-11', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p); await aplicarCupom(p, 'BEMVINDO10');
  await p.getByRole('link', { name: 'Finalizar compra' }).click();
  await preencher(p, 'Maria Silva', 'maria@exemplo.com', '01310-100');
  const checkout = await resumo(p); await print(p, 'CT-CUP-11-checkout');
  await p.getByRole('button', { name: 'Confirmar pedido' }).click(); await p.waitForURL('**/pedido-confirmado');
  await p.waitForTimeout(500); await print(p, 'CT-CUP-11-confirmado');
  return { checkout, confirmado: await resumo(p) };
});

// ---------- Exploratório ----------
await cenario('EXP-01-recarregar', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p); await aplicarCupom(p, 'BEMVINDO10');
  await p.reload(); await p.waitForTimeout(1200); await print(p, 'EXP-01-recarregar');
  return resumo(p);
});
await cenario('EXP-02-404', async (p) => {
  await p.goto(BASE + '/pagina-que-nao-existe'); await p.waitForTimeout(800); await print(p, 'EXP-02-404');
  return { titulo: await p.title(), texto: await p.locator('main').innerText() };
});
await cenario('EXP-03-mobile', async () => {
  const p = await novaAba({ width: 375, height: 812 });
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p); await aplicarCupom(p, 'BEMVINDO10');
  await print(p, 'EXP-03-mobile-carrinho');
  const scroll = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await p.goto(BASE + '/'); await print(p, 'EXP-03-mobile-vitrine');
  await p.context().close();
  return { scrollHorizontal: scroll };
});
await cenario('EXP-04-esvaziar', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p); await aplicarCupom(p, 'BEMVINDO10');
  await p.getByRole('button', { name: 'Esvaziar carrinho' }).click(); await p.waitForTimeout(700);
  await print(p, 'EXP-04-esvaziado');
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p); await print(p, 'EXP-04-readicionado');
  return { texto: await p.locator('main').innerText(), resumo: await resumo(p) };
});


// ---------- Complemento pós-auditoria ----------
await cenario('CT-QTD-07', async (p) => {
  // Carrinho com 9 unidades gravado direto no sessionStorage (simula estado adulterado ou desatualizado).
  await adicionar(p, 'Camiseta Essencial');
  await p.evaluate(() => sessionStorage.setItem('verzel-store:itens', JSON.stringify([{ produtoId: 'P001', quantidade: 9 }])));
  await irCarrinho(p); await print(p, 'CT-QTD-07-carrinho');
  const carrinho = { texto: await p.locator('.item-carrinho').innerText(), ...(await resumo(p)),
    finalizarVisivel: await p.getByRole('link', { name: 'Finalizar compra' }).isVisible() };
  await p.goto(BASE + '/checkout');
  await preencher(p, 'Maria Silva', 'maria@exemplo.com', '01310-100');
  const resposta = p.waitForResponse((r) => r.url().endsWith('/api/pedidos'));
  await p.getByRole('button', { name: 'Confirmar pedido' }).click();
  const r = await resposta;
  await p.waitForURL('**/pedido-confirmado').catch(() => {}); await p.waitForTimeout(500);
  await print(p, 'CT-QTD-07-confirmado');
  return { carrinho, statusPedido: r.status(), pedido: await r.json(), url: p.url() };
});
const validos = [
  ["José D'Ávila", 'jose.davila+loja@mail.empresa.com.br', '01310-100'],
  ['Ana-Clara de Souza Lima', 'ana@exemplo.com', '01310100'],
  ['  Maria Silva  ', '  maria@exemplo.com  ', ' 01310-100 '],
];
for (const [i, d] of validos.entries()) {
  await cenario(`CT-CHK-07-${i + 1}`, async (p) => {
    await adicionar(p, 'Camiseta Essencial'); await p.goto(BASE + '/checkout');
    await preencher(p, ...d); await p.getByRole('button', { name: 'Confirmar pedido' }).click();
    await p.waitForURL('**/pedido-confirmado', { timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(500); await print(p, `CT-CHK-07-${i + 1}`);
    return { dados: d, url: p.url(), erros: await p.locator('[id$="-erro"]').allInnerTexts() };
  });
}
await cenario('CT-CHK-08', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await p.goto(BASE + '/checkout');
  await preencher(p, 'Maria Silva', 'maria@exemplo.com', '01310-100');
  let envios = 0;
  p.on('request', (r) => { if (r.url().endsWith('/api/pedidos')) envios++; });
  await p.getByRole('button', { name: 'Confirmar pedido' }).dblclick();
  await p.waitForURL('**/pedido-confirmado'); await p.waitForTimeout(1500);
  await print(p, 'CT-CHK-08');
  return { envios, url: p.url() };
});
await cenario('EXP-05-primeira-compra', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p); await aplicarCupom(p, 'BEMVINDO10');
  await p.goto(BASE + '/checkout'); await preencher(p, 'Maria Silva', 'maria@exemplo.com', '01310-100');
  await p.getByRole('button', { name: 'Confirmar pedido' }).click(); await p.waitForURL('**/pedido-confirmado');
  await adicionar(p, 'Camiseta Essencial'); await irCarrinho(p); await aplicarCupom(p, 'BEMVINDO10');
  await print(p, 'EXP-05-segunda-compra');
  return resumo(p);
});
await cenario('EXP-06-ui-x-api', async (p) => {
  await adicionar(p, 'Camiseta Essencial'); await adicionar(p, 'Calça Jeans Slim');
  const resposta = p.waitForResponse((r) => r.url().endsWith('/api/carrinho/calcular') && r.request().postData()?.includes('BEMVINDO10'));
  await irCarrinho(p);
  await p.locator('#campo-cupom').fill('BEMVINDO10'); await p.getByRole('button', { name: 'Aplicar cupom' }).click();
  const api = await (await resposta).json();
  await p.waitForTimeout(700); await print(p, 'EXP-06-ui-x-api');
  return { api: { subtotal: api.subtotal, desconto: api.desconto, frete: api.frete, total: api.total }, tela: await resumo(p) };
});
await cenario('EXP-03-mobile-checkout', async () => {
  const p = await novaAba({ width: 375, height: 812 });
  await adicionar(p, 'Camiseta Essencial');
  const medidas = {};
  for (const rota of ['/', '/carrinho', '/checkout', '/documentacao']) {
    await p.goto(BASE + rota); await p.waitForTimeout(700);
    medidas[rota] = await p.evaluate(() => ({ larguraConteudo: document.documentElement.scrollWidth, larguraTela: window.innerWidth }));
  }
  await p.goto(BASE + '/checkout'); await preencher(p, 'Maria Silva', 'maria@exemplo.com', '01310-100');
  await print(p, 'EXP-03-mobile-checkout');
  await p.getByRole('button', { name: 'Confirmar pedido' }).click(); await p.waitForURL('**/pedido-confirmado');
  await print(p, 'EXP-03-mobile-confirmado');
  await p.context().close();
  return medidas;
});
await cenario('EXP-07-teclado', async (p) => {
  // Fluxo só com teclado: adicionar produto, aplicar cupom e verificar rótulos e mensagens anunciáveis.
  await p.goto(BASE + '/');
  await p.getByRole('button', { name: 'Adicionar ao carrinho' }).first().focus();
  await p.keyboard.press('Enter');
  await irCarrinho(p);
  await p.locator('#campo-cupom').focus(); await p.keyboard.type('XYZ123'); await p.keyboard.press('Enter');
  await p.waitForTimeout(900); await print(p, 'EXP-07-teclado');
  const msg = p.locator('#mensagem-cupom');
  return {
    itens: await p.locator('.item-carrinho h3').allTextContents(),
    rotuloCampoCupom: await p.locator('label[for="campo-cupom"]').innerText(),
    mensagem: await msg.innerText(), roleMensagem: await msg.getAttribute('role'),
    ariaInvalid: await p.locator('#campo-cupom').getAttribute('aria-invalid'),
  };
});


// ---------- Caminhos de erro do checkout ----------
for (const [sufixo, cupom] of [['a', 'VERAO2026'], ['b', 'XYZ123']]) {
  await cenario(`CT-CHK-09-${sufixo}`, async (p) => {
    // Cupom gravado direto no sessionStorage: a interface envia o pedido e a API deve recusar com 422.
    await adicionar(p, 'Camiseta Essencial');
    await p.evaluate((c) => sessionStorage.setItem('verzel-store:cupom', JSON.stringify(c)), cupom);
    await p.goto(BASE + '/checkout');
    await preencher(p, 'Maria Silva', 'maria@exemplo.com', '01310-100');
    const resposta = p.waitForResponse((r) => r.url().endsWith('/api/pedidos'));
    await p.getByRole('button', { name: 'Confirmar pedido' }).click();
    const r = await resposta;
    await p.waitForTimeout(800); await print(p, `CT-CHK-09-${sufixo}`);
    return { status: r.status(), erroApi: (await r.json()).erro, url: p.url(),
      alertas: await p.locator('[role="alert"]').allInnerTexts(),
      botaoHabilitado: await p.getByRole('button', { name: 'Confirmar pedido' }).isEnabled() };
  });
}
for (const [sufixo, falha] of [['a', 'HTTP 500 sem corpo'], ['b', 'conexão interrompida']]) {
  await cenario(`CT-CHK-10-${sufixo}`, async (p) => {
    await adicionar(p, 'Camiseta Essencial');
    await p.route('**/api/pedidos', (route) => (sufixo === 'a' ? route.fulfill({ status: 500, body: '' }) : route.abort('failed')));
    await p.goto(BASE + '/checkout');
    await preencher(p, 'Maria Silva', 'maria@exemplo.com', '01310-100');
    const botao = p.getByRole('button', { name: 'Confirmar pedido' });
    await botao.click();
    await p.locator('[role="alert"]').first().waitFor();
    await print(p, `CT-CHK-10-${sufixo}-erro`);
    const erro = { falhaSimulada: falha, url: p.url(), alertas: await p.locator('[role="alert"]').allInnerTexts(),
      botaoHabilitado: await botao.isEnabled(), camposPreservados: await p.getByLabel(/nome/i).inputValue() };
    // Nova tentativa com a API normal: o pedido deve ser confirmado.
    await p.unroute('**/api/pedidos');
    await botao.click();
    await p.waitForURL('**/pedido-confirmado', { timeout: 10000 }).catch(() => {});
    await print(p, `CT-CHK-10-${sufixo}-nova-tentativa`);
    return { ...erro, urlAposNovaTentativa: p.url() };
  });
}

writeFileSync(ARQUIVO, JSON.stringify(resultados, null, 2) + '\n');
await browser.close();
