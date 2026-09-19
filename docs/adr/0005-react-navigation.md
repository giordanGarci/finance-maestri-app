# Navigation: React Navigation (stack) instead of Expo Router

Ticket 05 called for evaluating whether to install `@react-navigation` or use
Expo Router's own router. We chose `@react-navigation/native` +
`@react-navigation/native-stack`.

Expo Router uses file-based routing from an `app/` folder at the project
root. ADR-0004 already fixed the repo root as a single-context Expo project,
with code organized by layer inside `src/` (`src/screens/`,
`src/navigation/`, etc.) and no `app/` folder. Introducing Expo Router would
require that extra folder and a second organizational mechanism coexisting
with `src/`'s, with no real need: the app has a small, fixed set of screens
(login + clients + loans + contributions), with no deep routes, deep
linking, or URL sharing that would justify file-based routing.

With React Navigation, `src/navigation/RootNavigator.tsx` declares the stack
explicitly. Switching between the login screen and the authenticated stack
is still done in `App.tsx` based on `useAuthUser()` (ticket 01), without
including login as a route in the stack.
