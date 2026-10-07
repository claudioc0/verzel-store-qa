# language: pt
@carrinho
Funcionalidade: Carrinho quando o cálculo falha
  O carrinho não calcula nada sozinho: exibe o que POST /api/carrinho/calcular devolve.
  Estes cenários verificam o que a interface faz quando esse cálculo falha.
  As falhas de rede e de servidor são simuladas interceptando a requisição no navegador (page.route).

  @CT-CAR-01 @CT-CAR-02
  Esquema do Cenário: Falha no cálculo ao abrir o carrinho
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial"
    E que a chamada a "/api/carrinho/calcular" vai falhar com <falha>
    Quando abro o carrinho
    Então vejo a mensagem "<mensagem>"
    E o resumo de valores e o botão "Finalizar compra" não são exibidos

    Exemplos:
      | falha                | mensagem                                                     |
      | HTTP 500 sem corpo   | Não foi possível calcular o carrinho.                        |
      | conexão interrompida | Não foi possível calcular o carrinho. Verifique sua conexão. |

  @CT-CAR-01 @CT-CAR-02
  Esquema do Cenário: Falha no cálculo depois de alterar o carrinho
    Dado que meu carrinho tem 1 unidade de "Camiseta Essencial" com total "R$ 79,80" já calculado
    E que a chamada a "/api/carrinho/calcular" passa a falhar com <falha>
    Quando aumento a quantidade para 2
    Então vejo a mensagem de erro do cálculo
    E não vejo valores de um estado anterior do carrinho
    E não consigo seguir para o checkout com um resumo que não corresponde ao carrinho
    Quando, mesmo assim, chego ao checkout e confirmo o pedido depois que a API volta ao normal
    Então o valor confirmado é o mesmo que foi exibido no checkout

    Exemplos:
      | falha                |
      | HTTP 500 sem corpo   |
      | conexão interrompida |

  @CT-CAR-03
  Cenário: Erro 422 no cálculo por produto inexistente no carrinho
    Dado que meu carrinho tem 1 "Camiseta Essencial" e um item com produtoId "P999" gravado no armazenamento da aba
    Quando abro o carrinho
    Então vejo a mensagem "Produto P999 não encontrado."
    E o resumo de valores e o botão "Finalizar compra" não são exibidos
