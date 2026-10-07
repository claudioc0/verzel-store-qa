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

  @CT-CHK-09 @CA03 @CA04
  Esquema do Cenário: Erro da API ao confirmar o pedido é exibido no formulário
    Dado que meu carrinho tem o cupom "<cupom>" gravado no armazenamento da aba
    # Simulado alterando "verzel-store:cupom" no sessionStorage, para forçar o envio do pedido com esse cupom
    Quando confirmo o pedido com dados válidos
    Então a API responde 422 com o código "<codigo>"
    E vejo a mensagem "<mensagem>" no formulário
    E continuo no checkout com o botão "Confirmar pedido" habilitado

    Exemplos:
      | cupom     | codigo         | mensagem        |
      | VERAO2026 | CUPOM_EXPIRADO | Cupom expirado. |
      | XYZ123    | CUPOM_INVALIDO | Cupom inválido. |

  @CT-CHK-10
  Esquema do Cenário: Falha sem resposta da API ao confirmar o pedido
    Dado que a chamada a "/api/pedidos" vai falhar com <falha>
    # Simulado interceptando a requisição no navegador (page.route)
    Quando confirmo o pedido com dados válidos
    Então vejo a mensagem "Não foi possível confirmar o pedido. Tente novamente."
    E os dados preenchidos continuam no formulário
    E o botão "Confirmar pedido" volta a ficar habilitado
    Quando a API volta ao normal e clico em "Confirmar pedido" de novo
    Então o pedido é confirmado

    Exemplos:
      | falha                |
      | HTTP 500 sem corpo   |
      | conexão interrompida |

