# language: pt
@quantidade
Funcionalidade: Limite de quantidade por produto
  Cada produto pode ter no máximo 5 unidades por pedido.
  A regra vale para a interface e para a API (CA10).

  @CT-QTD-01 @CA10
  Cenário: Adicionar o mesmo produto até o limite pela vitrine
    Dado que estou na página de produtos com o carrinho vazio
    Quando clico 5 vezes em "Adicionar ao carrinho" de "Kit 3 Pares de Meias"
    Então o carrinho mostra 5 unidades de "Kit 3 Pares de Meias"
    E o botão "Adicionar ao carrinho" desse produto fica desabilitado
    E vejo um aviso de limite atingido

  @CT-QTD-02 @CA10
  Cenário: Botão de aumentar quantidade no carrinho respeita o limite
    Dado que meu carrinho tem 5 unidades de "Kit 3 Pares de Meias"
    Quando tento aumentar a quantidade desse produto
    Então a quantidade continua 5
    E o subtotal continua "R$ 149,50"

  # Observação: na interface a quantidade é exibida em um <output> somente leitura,
  # alterada só pelos botões + e -. Por isso este cenário não se aplica (N/A) e foi coberto pela API.
  @CT-QTD-03 @CA10
  Esquema do Cenário: Digitar uma quantidade fora do limite no carrinho
    Dado que meu carrinho tem 1 unidade de "Kit 3 Pares de Meias"
    Quando informo a quantidade "<quantidade>" diretamente no campo
    Então a quantidade do item fica entre 1 e 5
    E os valores do resumo correspondem à quantidade exibida

    Exemplos:
      | quantidade |
      | 6          |
      | 10         |
      | 0          |
      | -1         |

  @CT-QTD-04 @CA10
  Cenário: Diminuir quantidade até 1
    Dado que meu carrinho tem 2 unidades de "Kit 3 Pares de Meias"
    Quando diminuo a quantidade desse produto
    Então a quantidade passa a ser 1
    E não é possível diminuir para 0 pelo botão de diminuir

  @CT-QTD-05 @CA10
  Cenário: Limite é por produto, não por pedido
    Dado que meu carrinho tem 5 unidades de "Kit 3 Pares de Meias"
    Quando adiciono 5 unidades de "Boné Aba Curva"
    Então o carrinho aceita as 10 unidades no total

  @CT-QTD-06 @CA10
  Cenário: Remover um produto do carrinho
    Dado que meu carrinho tem 1 "Camiseta Essencial" e 1 "Boné Aba Curva"
    Quando removo "Boné Aba Curva" do carrinho
    Então o carrinho mostra apenas "Camiseta Essencial"
    E o subtotal exibido é de "R$ 59,90"
