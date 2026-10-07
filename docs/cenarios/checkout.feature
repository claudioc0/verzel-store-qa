# language: pt
@checkout
Funcionalidade: Checkout e confirmação do pedido
  Como cliente da Verzel Store
  Quero informar meus dados e confirmar o pedido
  Para concluir a compra

  Contexto:
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial"
    E estou na página de checkout

  @CT-CHK-01
  Cenário: Confirmar pedido com dados válidos
    Quando preencho nome "Maria Silva", e-mail "maria@exemplo.com" e CEP "01310-100"
    E clico em "Confirmar pedido"
    Então sou levado para a página de pedido confirmado
    E vejo o número do pedido no formato "VZ-000000"
    E vejo a saudação com o primeiro nome "Maria"
    E o resumo do pedido corresponde ao resumo do carrinho
    E o carrinho fica vazio

  @CT-CHK-02
  Cenário: CEP sem hífen é aceito
    Quando preencho nome "Maria Silva", e-mail "maria@exemplo.com" e CEP "01310100"
    E clico em "Confirmar pedido"
    Então o pedido é confirmado

  @CT-CHK-03
  Esquema do Cenário: Validação dos dados do cliente
    Quando preencho nome "<nome>", e-mail "<email>" e CEP "<cep>"
    E clico em "Confirmar pedido"
    Então vejo uma mensagem de erro no campo "<campo>"
    E o pedido não é confirmado

    Exemplos:
      | nome          | email             | cep        | campo  |
      |               | maria@exemplo.com | 01310-100  | nome   |
      | Maria         | maria@exemplo.com | 01310-100  | nome   |
      | Maria S       | maria@exemplo.com | 01310-100  | nome   |
      | "   "         | maria@exemplo.com | 01310-100  | nome   |
      | Maria Silva   |                   | 01310-100  | e-mail |
      | Maria Silva   | maria.exemplo.com | 01310-100  | e-mail |
      | Maria Silva   | maria@exemplo     | 01310-100  | e-mail |
      | Maria Silva   | maria @exemplo.com| 01310-100  | e-mail |
      | Maria Silva   | maria@exemplo.com |            | CEP    |
      | Maria Silva   | maria@exemplo.com | 1310-100   | CEP    |
      | Maria Silva   | maria@exemplo.com | 01310-1000 | CEP    |
      | Maria Silva   | maria@exemplo.com | ABCDE-FGH  | CEP    |

  @CT-CHK-04
  Cenário: Acessar o checkout com carrinho vazio
    Dado que meu carrinho está vazio
    Quando acesso diretamente a URL "/checkout"
    Então sou redirecionado e não consigo confirmar um pedido vazio

  @CT-CHK-05
  Cenário: Página de pedido confirmado sem pedido recente
    Dado que abri uma nova aba sem ter feito pedido
    Quando acesso diretamente a URL "/pedido-confirmado"
    Então vejo a mensagem "Nenhum pedido recente"

  @CT-CHK-06
  Cenário: Pedido com subtotal de R$ 200,00 e cupom
    Dado que meu carrinho tem 2 unidades de "Mochila Urbana 20L"
    E apliquei o cupom "BEMVINDO10"
    Quando confirmo o pedido com dados válidos
    Então a confirmação mostra desconto "R$ 20,00", frete "Grátis" e total "R$ 180,00"

  @CT-CHK-07
  Esquema do Cenário: Dados válidos nas bordas são aceitos
    Quando preencho nome "<nome>", e-mail "<email>" e CEP "<cep>"
    E clico em "Confirmar pedido"
    Então o pedido é confirmado

    Exemplos:
      | nome                    | email                                | cep           |
      | José D'Ávila            | jose.davila+loja@mail.empresa.com.br | 01310-100     |
      | Ana-Clara de Souza Lima | ana@exemplo.com                      | 01310100      |
      | "  Maria Silva  "       | "  maria@exemplo.com  "              | " 01310-100 " |

  @CT-CHK-08
  Cenário: Clique duplo em "Confirmar pedido" não gera pedido duplicado
    Quando preencho dados válidos
    E dou um clique duplo em "Confirmar pedido"
    Então apenas uma requisição de pedido é enviada
    E sou levado para a página de pedido confirmado
