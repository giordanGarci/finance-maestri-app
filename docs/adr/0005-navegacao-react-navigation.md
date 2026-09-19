# Navegação: React Navigation (stack) em vez de Expo Router

Ticket 05 pedia avaliar entre instalar `@react-navigation` ou usar o roteador
do próprio Expo Router. Optamos por `@react-navigation/native` +
`@react-navigation/native-stack`.

Expo Router usa roteamento por arquivo a partir de uma pasta `app/` na raiz
do projeto. A ADR-0004 já fixou a raiz do repo como um projeto Expo
single-context, com código organizado por camada dentro de `src/`
(`src/screens/`, `src/navigation/`, etc.) e sem uma pasta `app/`. Introduzir
o Expo Router exigiria essa pasta extra e um segundo mecanismo de
organização convivendo com o de `src/`, sem necessidade real: o app tem um
conjunto pequeno e fixo de telas (login + clientes + empréstimos + aportes),
sem rotas profundas, deep linking ou compartilhamento de URL que
justifiquem roteamento por arquivo.

Com React Navigation, `src/navigation/RootNavigator.tsx` declara a stack
explicitamente. A troca entre tela de login e a stack autenticada continua
sendo feita em `App.tsx` a partir de `useAuthUser()` (ticket 01), sem incluir
o login como uma rota da stack.
