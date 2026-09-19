# Tela de Aportes e Capital disponível

Status: claimed
Depende de: 02 (repositório Firestore), 04 (cálculo de capital disponível), 05 (navegação)

## Contexto

Ver `CONTEXT.md`, termos **Aporte** e **Capital disponível**. Aporte é
dinheiro que o usuário adiciona ao Capital disponível fora do ciclo de
Empréstimos/Parcelas. Capital disponível é sempre derivado, nunca editado
diretamente.

## Escopo

- Tela "Aportes": lista de Aportes (valor, data, observação) + botão para
  registrar novo Aporte (valor obrigatório, data default hoje, observação
  opcional). Usa `listarAportes`/`criarAporte` do ticket 02.
- Um indicador de Capital disponível visível nessa tela (e idealmente
  também na tela inicial/lista de clientes do ticket 05, como um resumo no
  topo). Usa `calcularCapitalDisponivel` do ticket 04, alimentado pelos
  dados carregados de `aportes`, `emprestimos` e todas as `parcelas` de
  todos os empréstimos.

## Fora de escopo

- Editar/excluir Aporte lançado por erro (não pedido; se necessário depois,
  tratar como um Aporte negativo é mais simples que permitir edição
  retroativa).

## Critérios de aceite

- Registrar um Aporte de R$ 200 aumenta o Capital disponível exibido em
  R$ 200 imediatamente.
- O Capital disponível exibido nunca tem um campo de edição direta — é
  sempre texto/label calculado.
