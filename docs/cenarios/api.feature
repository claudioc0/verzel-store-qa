# language: pt
@api
Funcionalidade: API da Verzel Store
  Endpoints sob /api, com requisição e resposta em JSON.
  Todo erro segue o formato { "erro": { "codigo", "mensagem", "campo"? } }.

  # ---------- Produtos ----------

  @CT-API-01
  Cenário: Listar produtos
    Quando faço GET em "/api/produtos"
    Então a resposta tem status 200
    E a lista tem 8 produtos, de P001 a P008, com os preços da documentação

  @CT-API-02
  Cenário: Consultar produto existente
    Quando faço GET em "/api/produtos/P005"
    Então a resposta tem status 200
    E o produto retornado é "Mochila Urbana 20L" com preço 100

  @CT-API-03
  Esquema do Cenário: Consultar produto inexistente
    Quando faço GET em "/api/produtos/<id>"
    Então a resposta tem status 404 e código "PRODUTO_NAO_ENCONTRADO"

    Exemplos:
      | id   |
      | P999 |
      | p001 |
      | abc  |

  @CT-API-04
  Cenário: Rota inexistente
    Quando faço GET em "/api/rota-inexistente"
    Então a resposta tem status 404 e código "ROTA_NAO_ENCONTRADA"

  @CT-API-05
  Cenário: Raiz da API
    Quando faço GET em "/api"
    Então a resposta é JSON (status 404 e código "ROTA_NAO_ENCONTRADA")

  @CT-API-06
  Esquema do Cenário: Método não permitido
    Quando faço <metodo> em "<rota>"
    Então a resposta tem status 405 e código "METODO_NAO_PERMITIDO"

    Exemplos:
      | metodo | rota                   |
      | GET    | /api/carrinho/calcular |
      | GET    | /api/pedidos           |
      | POST   | /api/produtos          |
      | DELETE | /api/produtos/P001     |

  # ---------- Cálculo do carrinho ----------

  @CT-API-07 @CA01 @CA09
  Cenário: Calcular carrinho com cupom válido
    Quando faço POST em "/api/carrinho/calcular" com 1 "P001", 1 "P002" e cupom "BEMVINDO10"
    Então a resposta tem status 200
    E subtotal = 199.8, desconto = 19.98, frete = 19.9, freteGratis = false
    E valorFaltanteFreteGratis = 0.2 e total = 199.72
    E cupom.aplicado = true

  @CT-API-08 @CA06 @CA08
  Esquema do Cenário: Frete grátis considera o subtotal antes do desconto
    Quando faço POST em "/api/carrinho/calcular" com <qtd> "P005" e cupom "<cupom>"
    Então frete = <frete>, freteGratis = <gratis> e total = <total>

    Exemplos:
      | qtd | cupom      | frete | gratis | total |
      | 1   |            | 19.9  | false  | 119.9 |
      | 2   |            | 0     | true   | 200   |
      | 2   | BEMVINDO10 | 0     | true   | 180   |

  @CT-API-09 @CA03 @CA04
  Esquema do Cenário: Cupom inválido ou expirado no cálculo não gera erro
    Quando faço POST em "/api/carrinho/calcular" com 1 "P001" e cupom "<cupom>"
    Então a resposta tem status 200
    E desconto = 0 e cupom.aplicado = false
    E cupom.mensagem = "<mensagem>"

    Exemplos:
      | cupom     | mensagem        |
      | XYZ123    | Cupom inválido. |
      | VERAO2026 | Cupom expirado. |

  @CT-API-10 @CA02
  Cenário: Cupom com caixa diferente e espaços na API
    Quando faço POST em "/api/carrinho/calcular" com 1 "P001" e cupom "  bemvindo10  "
    Então cupom.aplicado = true e desconto = 5.99

  @CT-API-11 @CA10
  Esquema do Cenário: Validação de quantidade
    Quando faço POST em "/api/carrinho/calcular" com "P001" e quantidade <quantidade>
    Então a resposta tem status <status> e código "<codigo>"

    Exemplos:
      | quantidade | status | codigo                     |
      | 1          | 200    |                            |
      | 5          | 200    |                            |
      | 6          | 422    | QUANTIDADE_MAXIMA_EXCEDIDA |
      | 0          | 422    | QUANTIDADE_INVALIDA        |
      | -1         | 422    | QUANTIDADE_INVALIDA        |
      | 1.5        | 422    | QUANTIDADE_INVALIDA        |
      | "2"        | 422    | QUANTIDADE_INVALIDA        |
      | null       | 422    | QUANTIDADE_INVALIDA        |

  @CT-API-12
  Esquema do Cenário: Validação da lista de itens
    Quando faço POST em "/api/carrinho/calcular" com o corpo <corpo>
    Então a resposta tem status <status> e código "<codigo>"

    Exemplos:
      | corpo                                                                            | status | codigo                 |
      | {"itens":[]}                                                                     | 422    | ITENS_OBRIGATORIOS     |
      | {}                                                                               | 422    | ITENS_OBRIGATORIOS     |
      | {"itens":["P001"]}                                                               | 422    | ITEM_INVALIDO          |
      | {"itens":[{"produtoId":"P001"}]}                                                 | 422    | ITEM_INVALIDO          |
      | {"itens":[{"produtoId":"P999","quantidade":1}]}                                  | 422    | PRODUTO_NAO_ENCONTRADO |
      | {"itens":[{"produtoId":"P001","quantidade":1},{"produtoId":"P001","quantidade":1}]} | 422 | ITEM_DUPLICADO         |
      | texto que não é JSON                                                             | 400    | JSON_INVALIDO          |
      | [1,2,3]                                                                          | 400    | JSON_INVALIDO          |

  @CT-API-13 @CA10
  Cenário: Itens duplicados não burlam o limite de quantidade
    Quando faço POST em "/api/carrinho/calcular" com 5 "P001" e mais 5 "P001" em itens separados
    Então a resposta tem status 422 e código "ITEM_DUPLICADO"

  # ---------- Pedidos ----------

  @CT-API-14
  Cenário: Criar pedido válido
    Quando faço POST em "/api/pedidos" com cliente válido, 1 "P005" e cupom "BEMVINDO10"
    Então a resposta tem status 201
    E o número do pedido segue o formato "VZ-" seguido de 6 dígitos
    E os valores são os mesmos de "/api/carrinho/calcular" para o mesmo carrinho
    E o CEP retornado vem normalizado sem hífen

  @CT-API-15 @CA03 @CA04
  Esquema do Cenário: Pedido com cupom inválido ou expirado gera erro
    Quando faço POST em "/api/pedidos" com cliente válido, 1 "P001" e cupom "<cupom>"
    Então a resposta tem status 422 e código "<codigo>"

    Exemplos:
      | cupom     | codigo          |
      | XYZ123    | CUPOM_INVALIDO  |
      | VERAO2026 | CUPOM_EXPIRADO  |

  @CT-API-16
  Esquema do Cenário: Pedido com dados de cliente inválidos
    Quando faço POST em "/api/pedidos" com o cliente <cliente> e 1 "P001"
    Então a resposta tem status 422 e código "DADOS_INVALIDOS"
    E "campos" lista o campo "<campo>"

    Exemplos:
      | cliente                                                     | campo         |
      | {"nome":"Maria","email":"maria@exemplo.com","cep":"01310-100"} | cliente.nome  |
      | {"nome":"Maria Silva","email":"maria","cep":"01310-100"}       | cliente.email |
      | {"nome":"Maria Silva","email":"maria@exemplo.com","cep":"123"} | cliente.cep   |
      | ausente                                                        | cliente       |

  @CT-API-17 @CA10
  Cenário: Pedido acima do limite de quantidade
    Quando faço POST em "/api/pedidos" com cliente válido e 6 "P001"
    Então a resposta tem status 422 e código "QUANTIDADE_MAXIMA_EXCEDIDA"

  @CT-API-18 @CA06 @CA08
  Cenário: Pedido com subtotal de R$ 200,00 e cupom tem frete grátis
    Quando faço POST em "/api/pedidos" com cliente válido, 2 "P005" e cupom "BEMVINDO10"
    Então a resposta tem status 201
    E subtotal = 200, desconto = 20, frete = 0, freteGratis = true e total = 180

  # ---------- Complemento ----------

  @CT-API-19
  Esquema do Cenário: Tipos inesperados no campo cupom não quebram o cálculo
    Quando faço POST em "/api/carrinho/calcular" com 1 "P001" e cupom <cupom>
    Então a resposta tem status 200 e desconto = 0

    Exemplos:
      | cupom |
      | null  |
      | 10    |
      | ""    |
      | "   " |

  @CT-API-20 @CA02
  Esquema do Cenário: Cupom no pedido segue as mesmas regras do cálculo
    Quando faço POST em "/api/pedidos" com cliente válido, 1 "P001" e cupom "<cupom>"
    Então a resposta tem status 201 e desconto = <desconto>

    Exemplos:
      | cupom          | desconto |
      | " bemvindo10 " | 5.99     |
      | ""             | 0        |

  @CT-API-21 @CA10
  Cenário: Pedido com exatamente 5 unidades é aceito
    Quando faço POST em "/api/pedidos" com cliente válido e 5 "P001"
    Então a resposta tem status 201

  @CT-API-22 @CA06
  Cenário: Valor faltante para frete grátis nunca é negativo
    Quando faço POST em "/api/carrinho/calcular" com 2 "P007" (R$ 459,80)
    Então valorFaltanteFreteGratis = 0

  @CT-API-23
  Cenário: Vários itens inválidos na mesma requisição
    Quando faço POST em "/api/carrinho/calcular" com "P999" (inexistente) e "P002" com quantidade 0
    Então a resposta tem status 422 e aponta o primeiro erro com o campo correto

  @CT-API-24
  Esquema do Cenário: Corpo JSON com Content-Type ausente ou diferente
    Quando faço POST em "/api/carrinho/calcular" com corpo JSON válido e Content-Type <tipo>
    Então registro o comportamento (a documentação não define a resposta do servidor)

    Exemplos:
      | tipo       |
      | ausente    |
      | text/plain |

  @CT-API-25
  Cenário: Dados de cliente válidos nas bordas
    Quando faço POST em "/api/pedidos" com nome "José D'Ávila", e-mail "jose.davila+loja@mail.empresa.com.br" e CEP " 01310-100 "
    Então a resposta tem status 201 com nome acentuado preservado e CEP normalizado

  @CT-API-26
  Cenário: Nome com sobrenome abreviado
    Quando faço POST em "/api/pedidos" com nome "Maria S"
    Então registro o comportamento como dúvida para o PO (ver ambiguidades A3)

  @CT-API-27
  Cenário: Cálculo ignora preços e totais enviados pelo cliente
    Quando faço POST em "/api/carrinho/calcular" com 1 "P001" informando preco = 1, precoUnitario = 1, desconto = 50, frete = 0 e total = 1 no corpo
    Então a resposta usa o preço do servidor: precoUnitario = 59.9, desconto = 0, frete = 19.9 e total = 79.8

  @CT-API-28
  Cenário: Pedido ignora preços e totais enviados pelo cliente
    Quando faço POST em "/api/pedidos" com cliente válido, 1 "P001" e total = 1, precoUnitario = 1 no corpo
    Então a resposta tem status 201 com precoUnitario = 59.9 e total = 79.8

  @CT-API-29
  Esquema do Cenário: Validação da lista de itens também em /api/pedidos
    Quando faço POST em "/api/pedidos" com cliente válido e o corpo de itens <itens>
    Então a resposta tem status <status> e código "<codigo>"

    Exemplos:
      | itens                                                                              | status | codigo                 |
      | [{"produtoId":"P001","quantidade":3},{"produtoId":"P001","quantidade":3}]          | 422    | ITEM_DUPLICADO         |
      | []                                                                                 | 422    | ITENS_OBRIGATORIOS     |
      | ausente                                                                            | 422    | ITENS_OBRIGATORIOS     |
      | ["P001"]                                                                           | 422    | ITEM_INVALIDO          |
      | [{"produtoId":"P999","quantidade":1}]                                              | 422    | PRODUTO_NAO_ENCONTRADO |
      | [{"produtoId":"P001","quantidade":0}]                                              | 422    | QUANTIDADE_INVALIDA    |
      | corpo que não é JSON                                                               | 400    | JSON_INVALIDO          |

  @CT-API-30 @CA10
  Cenário: Quantidade muito acima do limite
    Quando faço POST em "/api/carrinho/calcular" e em "/api/pedidos" com 1000000 "P001"
    Então a resposta tem status 422 e código "QUANTIDADE_MAXIMA_EXCEDIDA"

  @CT-API-31
  Esquema do Cenário: Regra do nome com partes curtas, dígitos e pontuação
    Quando faço POST em "/api/pedidos" com o nome "<nome>"
    Então registro o resultado para comparação com a regra "nome e sobrenome" (ver ambiguidades A3)

    Exemplos:
      | nome          |
      | Maria S Silva |
      | Maria 12      |
      | Ma ..         |

