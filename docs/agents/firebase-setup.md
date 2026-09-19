# Setup manual do Firebase

O código já está preparado para ler a configuração do Firebase de variáveis de
ambiente (`src/data/firebaseConfig.ts`), mas as chaves de um projeto real só
podem ser criadas por você no console do Firebase. Siga os passos abaixo uma
vez; depois disso o app funciona normalmente.

## 1. Criar o projeto no console do Firebase

1. Acesse https://console.firebase.google.com/ e clique em "Adicionar projeto".
2. Dê um nome (ex.: "emprestimos-pessoais") e conclua a criação. Não é
   necessário ativar o Google Analytics para este app.

## 2. Registrar o app e obter as chaves

1. Na tela inicial do projeto, clique no ícone de "Web" (`</>`) para
   registrar um app web, mesmo sendo um app Expo/React Native — o SDK JS do
   Firebase usado aqui (`firebase/app`, `firebase/firestore`, `firebase/auth`)
   é o SDK web, que funciona no Expo em modo managed.
2. Dê um nome ao app (ex.: "maestri-app") e finalize o registro. Não
   precisa configurar Firebase Hosting.
3. O console mostra um objeto `firebaseConfig` com `apiKey`, `authDomain`,
   `projectId`, `storageBucket`, `messagingSenderId`, `appId`. Copie cada
   valor para o arquivo `.env` na raiz do repositório (crie a partir de
   `.env.example`), preenchendo as variáveis `EXPO_PUBLIC_FIREBASE_*`
   correspondentes.

## 3. Ativar o Firestore

1. No menu lateral, vá em "Firestore Database" → "Criar banco de dados".
2. Escolha uma região (qualquer uma próxima de você serve; não é possível
   trocar depois sem migrar o projeto).
3. Inicie em modo de produção. Depois de criado, vá na aba "Regras" e cole
   as regras abaixo, substituindo `OWNER_UID` pelo seu próprio uid do
   Firebase Auth (você só terá esse uid depois do passo 4; pode deixar as
   regras padrão e voltar aqui depois):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isOwner() {
         return request.auth != null && request.auth.uid == resource.data.donoId;
       }
       match /clientes/{id} {
         allow read, update, delete: if isOwner();
         allow create: if request.auth != null && request.auth.uid == request.resource.data.donoId;
       }
       match /emprestimos/{id} {
         allow read, update, delete: if isOwner();
         allow create: if request.auth != null && request.auth.uid == request.resource.data.donoId;
         match /parcelas/{parcelaId} {
           allow read, write: if request.auth != null;
         }
       }
       match /aportes/{id} {
         allow read, update, delete: if isOwner();
         allow create: if request.auth != null && request.auth.uid == request.resource.data.donoId;
       }
       match /config/{id} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   Como o app é de usuário único, essas regras são intencionalmente simples
   (qualquer usuário autenticado do seu projeto pode ler/escrever `config` e
   `parcelas`). Aperte o modelo depois se algum dia o app passar a ter mais
   de uma conta.

## 4. Ativar o Firebase Auth com Google

1. No menu lateral, vá em "Authentication" → "Sign-in method".
2. Ative o provedor "Google".
3. Em "Authentication" → "Settings" → "Authorized domains", confirme que
   `localhost` está na lista (necessário para testar no Expo Go/web).
4. Ainda na tela do provedor Google, copie o "Web client ID" gerado e cole
   em `EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID` no `.env`. Esse client ID é
   usado pelo fluxo de login (`expo-auth-session`, ver ticket de telas) para
   trocar o token do Google por uma credencial do Firebase Auth.
5. Depois do primeiro login real, copie seu uid em "Authentication" →
   "Users" e use-o para trocar `OWNER_UID` nas regras do passo 3, se quiser
   travar o acesso a um único uid em vez de "qualquer usuário autenticado".

## 5. Preencher o `.env` local

```
cp .env.example .env
```

Preencha os valores dos passos 2 e 4. O arquivo `.env` está no
`.gitignore` e não deve ser commitado.

## Verificando que funcionou

Rode `npm run start` (ou `npm run android`/`npm run web`) e confira que o
app não lança o erro "Firebase não configurado" definido em
`src/data/firebaseConfig.ts`. Esse erro lista exatamente quais variáveis
estão faltando.
