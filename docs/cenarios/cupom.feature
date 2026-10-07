# language: pt
@cupom
Funcionalidade: Cupom de desconto
  Como cliente da Verzel Store
  Quero aplicar um cupom de desconto no carrinho
  Para pagar menos pelos produtos

  Contexto:
    Dado que estou na página do carrinho

  @CT-CUP-01 @CA01
  Cenário: Aplicar o cupom BEMVINDO10 com carrinho abaixo do frete grátis
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial" (R$ 59,90)
    Quando aplico o cupom "BEMVINDO10"
    Então vejo uma mensagem de sucesso informando o desconto de 10%
    E o desconto exibido é de "R$ 5,99"
    E o frete exibido é de "R$ 19,90"
    E o total exibido é de "R$ 73,81"

  @CT-CUP-02 @CA01
  Cenário: Aplicar o cupom BEMVINDO10 com carrinho de vários produtos
    Dado que meu carrinho tem 1 "Camiseta Essencial" e 1 "Calça Jeans Slim"
    Quando aplico o cupom "BEMVINDO10"
    Então o subtotal exibido é de "R$ 199,80"
    E o desconto exibido é de "R$ 19,98"
    E o rótulo do desconto mostra o código "BEMVINDO10"

  @CT-CUP-03 @CA02
  Esquema do Cenário: Código do cupom não diferencia maiúsculas/minúsculas e ignora espaços nas pontas
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial"
    Quando aplico o cupom "<codigo>"
    Então o cupom é aplicado com desconto de "R$ 5,99"

    Exemplos:
      | codigo         |
      | bemvindo10     |
      | BemVindo10     |
      | "  BEMVINDO10" |
      | "BEMVINDO10  " |
      | " bemvindo10 " |

  @CT-CUP-04 @CA02 @CA03
  Cenário: Espaço no meio do código não é ignorado
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial"
    Quando aplico o cupom "BEM VINDO10"
    Então vejo a mensagem "Cupom inválido."
    E nenhum desconto é aplicado

  @CT-CUP-05 @CA03
  Esquema do Cenário: Cupom inexistente não aplica desconto
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial"
    Quando aplico o cupom "<codigo>"
    Então vejo a mensagem "Cupom inválido."
    E nenhum desconto é aplicado
    E o total continua "R$ 79,80"

    Exemplos:
      | codigo      |
      | XYZ123      |
      | BEMVINDO    |
      | BEMVINDO100 |
      | BEMVINDO1O  |

  @CT-CUP-06 @CA04
  Esquema do Cenário: Cupom expirado não aplica desconto
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial"
    Quando aplico o cupom "<codigo>"
    Então vejo a mensagem "Cupom expirado."
    E nenhum desconto é aplicado

    Exemplos:
      | codigo      |
      | VERAO2026   |
      | verao2026   |
      | " VERAO2026 " |

  @CT-CUP-07
  Cenário: Tentar aplicar cupom vazio
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial"
    Quando clico em "Aplicar cupom" sem preencher o código
    Então vejo a mensagem "Informe um cupom."
    E nenhum desconto é aplicado

  # Na API, "um cupom por vez" é garantido pelo formato: o campo cupom é um único texto, não uma lista.
  @CT-CUP-08 @CA05
  Cenário: Apenas um cupom aplicado por vez
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial"
    E apliquei o cupom "BEMVINDO10"
    Então não existe campo disponível para aplicar um segundo cupom
    E existe a opção de remover o cupom atual

  @CT-CUP-09 @CA05
  Cenário: Remover o cupom e aplicar outro
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial"
    E apliquei o cupom "BEMVINDO10"
    Quando removo o cupom
    Então o desconto deixa de ser exibido
    E o total volta a ser "R$ 79,80"
    E o campo de cupom volta a ficar disponível
    Quando aplico o cupom "VERAO2026"
    Então vejo a mensagem "Cupom expirado."

  @CT-CUP-10
  Cenário: Cupom aplicado é recalculado quando o carrinho muda
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial"
    E apliquei o cupom "BEMVINDO10"
    Quando aumento a quantidade de "Camiseta Essencial" para 2
    Então o subtotal exibido é de "R$ 119,80"
    E o desconto exibido é de "R$ 11,98"

  @CT-CUP-11
  Cenário: Cupom aplicado é mantido até a confirmação do pedido
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial"
    E apliquei o cupom "BEMVINDO10"
    Quando sigo para o checkout
    Então o resumo do checkout mostra o desconto de "R$ 5,99"
    Quando confirmo o pedido com dados válidos
    Então a confirmação do pedido mostra o desconto de "R$ 5,99" e o total de "R$ 73,81"
