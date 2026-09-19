# App de Empréstimos Pessoais

App pessoal (usuário único) para organizar empréstimos de dinheiro a terceiros: quem deve, quanto, juros e situação de pagamento.

## Language

**Cliente**:
Pessoa física para quem o dinheiro é emprestado. Pode ter múltiplos Empréstimos ativos simultaneamente, com histórico acumulado.
_Avoid_: Devedor, Tomador

**Empréstimo**:
Uma operação de crédito concedida a um Cliente: um Principal, uma taxa de Juros fixada na criação, e uma ou mais Parcelas com data de vencimento. "Pagamento único" e "parcelado" são rótulos de exibição inferidos pelo número de Parcelas (1 Parcela = "pagamento único"), não tipos de dados distintos.
_Avoid_: Crédito, Dívida

**Principal**:
O valor emprestado ao Cliente, sem os Juros.
_Avoid_: Capital emprestado (não confundir com Capital disponível)

**Juros**:
Valor adicional ao Principal, calculado uma única vez na criação do Empréstimo como uma taxa sobre o Principal. Não é recalculado automaticamente por atraso.
_Avoid_: Taxa de mora, juros compostos

**Parcela**:
Uma fração do total a pagar (Principal + Juros) de um Empréstimo, com data de vencimento própria. Por padrão o valor é sugerido dividindo o total igualmente entre as Parcelas (ajuste de centavos na última), mas o usuário pode desmarcar essa sugestão e editar o valor de cada Parcela manualmente.
_Avoid_: Prestação

**Status da parcela** (em dia / atrasado):
Derivado comparando a data de vencimento da Parcela com a data atual, combinado com a marcação manual de "paga" feita pelo usuário. Não existe integração bancária automática.
_Avoid_: Pendente (usar só para "ainda não venceu")

**Capital disponível**:
Saldo derivado automaticamente: soma dos Aportes registrados − soma dos Principais dos Empréstimos ativos + soma das Parcelas recebidas. Nunca editado diretamente pelo usuário.
_Avoid_: Caixa, saldo manual

**Aporte**:
Registro de dinheiro que o usuário adiciona ao Capital disponível, fora do ciclo de Empréstimos/Parcelas.
_Avoid_: Depósito

**Preferência de aviso**:
Configuração global do app: quantos dias antes do vencimento de uma Parcela o usuário quer ser notificado, e se as notificações estão ativadas. Entregue como notificação local no aparelho.
