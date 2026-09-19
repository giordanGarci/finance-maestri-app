# Autenticação (Firebase Auth)

> Título original era "Autenticação com Google" — trocado para e-mail/senha
> em andamento, ver `docs/adr/0006-login-email-senha.md` e os Comments.

Status: resolved
Depende de: nada (mas precisa do `.env` preenchido — ver `docs/agents/firebase-setup.md`)

## Contexto

ADR-0001 define Firebase Auth para login. O app é de usuário único, mas
ainda precisa de uma conta autenticada porque as regras de segurança do
Firestore (ver `docs/agents/firebase-setup.md`, passo 3) exigem
`request.auth != null`, e os documentos de `clientes`/`emprestimos`/`aportes`
guardam um campo `donoId` com o uid do usuário logado.

`src/data/firebaseConfig.ts` já exporta `auth` (instância de Firebase Auth).
Falta o fluxo de login em si.

## Escopo

- Tela de login (`src/screens/auth/LoginScreen.tsx`) com e-mail/senha (ver
  Comments — trocado de Google Sign-In para evitar exigir development
  build só pra autenticar).
- Um hook (`useAuthUser`) que exponha o usuário atual, para as telas de
  `clientes`/`emprestimos`/`aportes` usarem o uid como `donoId` ao criar
  documentos.
- Tela raiz do app (`App.tsx`) decide entre tela de login e navegação
  principal com base em `auth.currentUser` / `onAuthStateChanged`.

## Fora de escopo

- Outros provedores de login (Google, etc. — descartado, ver
  `docs/adr/0006-login-email-senha.md`).
- Recuperação de senha / múltiplos usuários (app é de usuário único; se
  a senha for esquecida, dá pra resetar direto no console do Firebase).

## Critérios de aceite

- Com o `.env` preenchido, é possível criar uma conta com e-mail/senha e
  entrar com ela depois, e o app navega para a tela principal.
- Fechar e reabrir o app mantém a sessão (sem precisar logar de novo).
- Existe uma forma de deslogar (mesmo que só um botão numa tela de
  configurações simples).
- Funciona no Expo Go, sem exigir development build.

## Comments

**Primeira versão (Google Sign-In):** implementada com
`expo-auth-session/providers/google` + `webClientId`, assumindo que o
proxy de autenticação do Expo (`auth.expo.io`) cobriria Expo Go/Android.
Essa suposição estava errada: o usuário testou no Android via Expo Go e
bateu em erro fatal (`androidClientId must be defined...`) — o proxy foi
removido no Expo SDK 48, e clients OAuth do Google tipo "Web" não aceitam
o redirect `exp://` do Expo Go nem de um esquema customizado (validação de
redirect_uri do Google, não é bug do Firebase). A alternativa viável era
`@react-native-google-signin/google-signin` com client ID Android real
(package name + SHA-1) e development build — o que forçaria dev build já
para o login, não só para notificações.

**Decisão final:** o usuário optou por trocar para login por e-mail/senha
em vez de resolver o Google Sign-In nativo, já registrada em
`docs/adr/0006-login-email-senha.md`. Implementação atual:
`src/data/auth.ts` (`useAuthUser`, `criarConta`, `entrarComEmailSenha`,
`signOutUser`, usando `createUserWithEmailAndPassword`/
`signInWithEmailAndPassword` de `firebase/auth`) e
`src/screens/auth/LoginScreen.tsx` (campos de e-mail/senha com toggle
"entrar" / "criar conta"). `@react-native-google-signin/google-signin`,
`expo-auth-session` e `expo-web-browser` foram removidos; `app.json` não
tem mais plugin/scheme relacionado a auth.

Bug adicional corrigido no caminho: `firebaseConfig.ts` usava
`getAuth(app)`, que por padrão fica em memory persistence em React Native
(login não sobrevivia a reabrir o app) — trocado para
`initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`
com fallback pra `getAuth` no catch (Fast Refresh reavalia o módulo sem
reiniciar o app, e `initializeAuth` só pode rodar uma vez). Precisou de
`// @ts-expect-error` num import isolado: `getReactNativePersistence`
existe em runtime (confirmado empiricamente bundlando um probe com Metro:
`firebase/auth` reexporta `@firebase/auth`, cujo build React Native tem a
função) mas falta nos typings publicados desta versão do firebase-js-sdk
(bug conhecido do SDK, não do nosso código).

Login por e-mail/senha funciona no Expo Go normalmente — não exige
development build. Continua não testado contra um projeto Firebase real
(sem credenciais neste ambiente); validado com `npx tsc --noEmit` e
`npm test`.
