# language: pt
@arredondamento
Funcionalidade: Arredondamento de valores
  Todos os valores são arredondados para 2 casas decimais (CA11).

  Limitação: com preços múltiplos de R$ 0,10 e cupom de 10%, nenhum cálculo gera
  uma terceira casa decimal. Estes cenários verificam a ausência de resíduo de ponto
  flutuante, não a regra de arredondamento em si (ver docs/ambiguidades.md, A9).

  @CT-ARR-01 @CA11
  Esquema do Cenário: Valores do carrinho com 2 casas decimais
    Dado que meu carrinho tem <quantidade> unidades de "<produto>"
    Quando aplico o cupom "BEMVINDO10"
    Então o subtotal é "<subtotal>"
    E o desconto é "<desconto>"
    E o frete é "<frete>"
    E o total é "<total>"
    E nenhum valor da interface ou da API tem mais de 2 casas decimais

    Exemplos:
      | produto              | quantidade | subtotal  | desconto | frete    | total     |
      | Camiseta Essencial   | 3          | R$ 179,70 | R$ 17,97 | R$ 19,90 | R$ 181,63 |
      | Kit 3 Pares de Meias | 3          | R$ 89,70  | R$ 8,97  | R$ 19,90 | R$ 100,63 |
      | Kit 3 Pares de Meias | 5          | R$ 149,50 | R$ 14,95 | R$ 19,90 | R$ 154,45 |
      | Tênis Casual Urbano  | 1          | R$ 189,90 | R$ 18,99 | R$ 19,90 | R$ 190,81 |
      | Jaqueta Corta-Vento  | 3          | R$ 689,70 | R$ 68,97 | Grátis   | R$ 620,73 |

  @CT-ARR-02 @CA11
  Cenário: Carrinho com vários produtos não acumula erro de ponto flutuante
    Dado que meu carrinho tem 1 unidade de cada produto (P001 a P008)
    Quando aplico o cupom "BEMVINDO10"
    Então o subtotal é "R$ 849,40"
    E o desconto é "R$ 84,94"
    E o total é "R$ 764,46"
