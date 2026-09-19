# Autenticação com Google (Firebase Auth)

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

- Tela de login (`src/screens/`) com botão "Entrar com Google".
- Fluxo OAuth usando `expo-auth-session` (Google provider) para obter um
  id token, trocado por uma credencial do Firebase Auth
  (`GoogleAuthProvider.credential` + `signInWithCredential`, do módulo
  `firebase/auth`).
- Usa `EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID` (já documentado em
  `.env.example` e `docs/agents/firebase-setup.md`).
- Um hook ou contexto (`useAuthUser` / `AuthProvider`) que exponha o usuário
  atual e `signOut`, para as telas de `clientes`/`emprestimos`/`aportes`
  usarem o uid como `donoId` ao criar documentos.
- Tela raiz do app (`App.tsx`) decide entre tela de login e navegação
  principal com base em `auth.currentUser` / `onAuthStateChanged`.

## Fora de escopo

- Login com email/senha ou outros provedores (não pedido).
- Recuperação de conta / múltiplos usuários (app é de usuário único).

## Critérios de aceite

- Com o `.env` preenchido, é possível logar com uma conta Google real e o
  app navega para a tela principal.
- Fechar e reabrir o app mantém a sessão (sem precisar logar de novo).
- Existe uma forma de deslogar (mesmo que só um botão numa tela de
  configurações simples).

## Comments

Implementado em `src/data/auth.ts` (`useAuthUser`, `useGoogleSignIn`,
`signOutUser`) e `src/screens/auth/LoginScreen.tsx`. `App.tsx` decide entre
`LoginScreen` e uma tela provisória com "Logado como ..." + botão "Sair"
com base em `useAuthUser` — a tela provisória será substituída pela
navegação principal no ticket 05.

Instalados `expo-auth-session` e `expo-web-browser`; `app.json` recebeu o
plugin `expo-web-browser` e um `scheme` (`maestriapp`) para o redirect do
OAuth funcionar em builds standalone/dev client. `useGoogleSignIn` usa
`EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID` via o proxy de autenticação do
Expo — funciona em Expo Go/desenvolvimento; um build standalone vai
precisar de `androidClientId`/`iosClientId` próprios (não implementado,
fora do escopo deste ticket).

Não testado contra um projeto Firebase real (sem credenciais disponíveis
neste ambiente) — validado com `.env` de placeholders só para `tsc
--noEmit` passar. Teste manual com credenciais reais (login, persistência
de sessão, logout) fica pendente de quem tiver acesso ao console do
Firebase configurado via `docs/agents/firebase-setup.md`.
