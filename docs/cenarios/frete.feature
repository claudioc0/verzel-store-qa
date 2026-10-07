# language: pt
@frete
Funcionalidade: Frete grátis
  Como cliente da Verzel Store
  Quero ter frete grátis em compras a partir de R$ 200,00
  Para economizar na entrega

  Critérios de aceite cobertos:
    - Subtotal >= R$ 200,00: frete grátis (CA06)
    - Subtotal < R$ 200,00: frete fixo de R$ 19,90 e aviso de quanto falta (CA07)
    - A regra considera o subtotal ANTES do desconto do cupom (CA08)
    - O desconto do cupom não incide sobre o frete (CA09)

  @CT-FRE-01 @CA07
  Cenário: Carrinho abaixo de R$ 200,00 cobra frete fixo e informa quanto falta
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial" (R$ 59,90)
    Quando acesso o carrinho
    Então o frete exibido é de "R$ 19,90"
    E vejo o aviso de que faltam "R$ 140,10" para o frete grátis
    E o total exibido é de "R$ 79,80"

  @CT-FRE-02 @CA07
  Cenário: Limite inferior - subtotal de R$ 199,80
    Dado que meu carrinho tem 1 "Camiseta Essencial" e 1 "Calça Jeans Slim"
    Quando acesso o carrinho
    Então o subtotal exibido é de "R$ 199,80"
    E o frete exibido é de "R$ 19,90"
    E vejo o aviso de que faltam "R$ 0,20" para o frete grátis
    E o total exibido é de "R$ 219,70"

  @CT-FRE-03 @CA06
  Cenário: Limite exato - subtotal de R$ 200,00 tem frete grátis
    Dado que meu carrinho tem 2 unidades de "Mochila Urbana 20L" (R$ 100,00)
    Quando acesso o carrinho
    Então o frete exibido é "Grátis"
    E não vejo o aviso de quanto falta para o frete grátis
    E o total exibido é de "R$ 200,00"

  @CT-FRE-04 @CA06
  Cenário: Subtotal acima de R$ 200,00 tem frete grátis
    Dado que meu carrinho tem 1 unidade de "Jaqueta Corta-Vento" (R$ 229,90)
    Quando acesso o carrinho
    Então o frete exibido é "Grátis"
    E o total exibido é de "R$ 229,90"

  @CT-FRE-05 @CA08
  Cenário: Subtotal de R$ 200,00 com cupom continua com frete grátis
    Dado que meu carrinho tem 2 unidades de "Mochila Urbana 20L"
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto exibido é de "R$ 20,00"
    E o frete exibido é "Grátis"
    E o total exibido é de "R$ 180,00"

  @CT-FRE-06 @CA08
  Cenário: Subtotal acima do limite que fica abaixo de R$ 200,00 após o desconto continua com frete grátis
    Dado que meu carrinho tem 1 unidade de "Jaqueta Corta-Vento" (R$ 229,90)
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto exibido é de "R$ 22,99"
    E o frete exibido é "Grátis"
    E o total exibido é de "R$ 206,91"

  @CT-FRE-07 @CA09
  Cenário: Desconto do cupom não incide sobre o frete
    Dado que meu carrinho tem 1 "Camiseta Essencial" e 1 "Calça Jeans Slim"
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto exibido é de "R$ 19,98" (10% de R$ 199,80, sem o frete)
    E o frete exibido é de "R$ 19,90"
    E o total exibido é de "R$ 199,72"

  @CT-FRE-08 @CA07
  Cenário: Aviso de frete grátis é atualizado quando o carrinho muda
    Dado que meu carrinho tem 1 unidade de "Mochila Urbana 20L"
    E vejo o aviso de que faltam "R$ 100,00" para o frete grátis
    Quando aumento a quantidade de "Mochila Urbana 20L" para 2
    Então o frete exibido é "Grátis"
    E o aviso de quanto falta deixa de ser exibido
    Quando diminuo a quantidade de "Mochila Urbana 20L" para 1
    Então o frete volta a ser "R$ 19,90"
