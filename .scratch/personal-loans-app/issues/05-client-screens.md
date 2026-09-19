# Client Screens

Status: resolved
Depends on: 01 (authentication), 02 (Firestore repository)

## Context

See `CONTEXT.md`, term **Client**: an individual the money is lent to, who
can have multiple active Loans at once with accumulated history.

This is the first UI ticket: it's also responsible for setting up the app's
main navigation (`src/navigation/`), since it needs at least two navigable
screens (list and detail).

## Scope

- `src/navigation/`: main navigation stack (e.g. `@react-navigation/native`
  + `@react-navigation/native-stack` — evaluate whether to install it or use
  Expo Router's own router; record the choice as an ADR if it's a
  non-trivial decision). Must fit the login screen (ticket 01) and this
  ticket's and ticket 06's screens.
- "Client list" screen: name + a simple indicator (e.g. number of active
  Loans). Uses `listClients()` from ticket 02.
- "New/edit client" screen: a form with name (required), phone, and notes
  (optional).
- "Client detail" screen: client data + a list of their Loans (uses
  `listLoansByClient`, from ticket 02) with a button to create a new Loan
  for that Client (opens ticket 06's flow).

## Out of scope

- Client search/filter (a plain list is enough for a single user's data
  volume).
- Deleting a client (not requested; if a client has Loans, it would require
  deciding what to do with them — leave for a future ticket if needed).

## Acceptance criteria

- You can create a Client, see it in the list, open the detail, and edit
  name/phone/notes.
- The client detail shows their Loans (empty is a valid state for a new
  client).

## Resolution notes

- Navigation: `@react-navigation/native` + `@react-navigation/native-stack`
  (installed via `npx expo install`), not Expo Router — decision recorded
  in `docs/adr/0005-react-navigation.md` (Expo Router would require an
  `app/` folder that conflicts with the structure fixed in ADR-0004). The
  switch between login and the authenticated stack remains in `App.tsx`
  (ticket 01), outside the stack; the stack itself lives in
  `src/navigation/RootNavigator.tsx` with the routes `ClientsList`,
  `ClientForm`, `ClientDetail`, `LoanForm`, `LoanDetail`, `Contributions`,
  and `NotificationPreference` (see the ticket 08 note below).
- Screens: `src/screens/clients/ClientsListScreen.tsx`,
  `ClientFormScreen.tsx`, `ClientDetailScreen.tsx`. Editing a client
  receives the full `Client` via a navigation param (the list/detail
  already has the object in hand), avoiding a dependency on a
  `getClient(id)` that doesn't exist in the repository.
- `ClientsListScreen` shows the Available capital summary at the top (see
  ticket 07) and a link to the Contributions screen.
- Ticket 08 (Sentinela) had left `src/screens/NotificationPreferenceScreen.tsx`
  ready but without a route; registered it in the stack and added a
  "Preferences" shortcut in the client list header, next to "Sign out"
  (which previously lived loose in `App.tsx`).
- `npx tsc --noEmit` and `npm test` pass with no errors.
