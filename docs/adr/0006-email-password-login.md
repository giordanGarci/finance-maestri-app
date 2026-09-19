# Email/password login instead of Google Sign-In

The original plan assumed Firebase Auth with Google Sign-In using only a
`webClientId`, working in Expo Go via Expo's authentication proxy.
Investigation confirmed (current Expo and Google documentation) that this is
no longer true: native Google login on Android requires a native library
(`@react-native-google-signin/google-signin` or equivalent) with a real
Android client ID validated by signature, which doesn't run in Expo Go and
would require a development build just to authenticate. Since the actual
goal was protecting the data against unauthorized access to the phone, not
specifically reusing the Google account, we switched to Firebase Auth
email/password login: it works normally in Expo Go, with no platform client
ID or development build needed. Local notifications remain the only feature
that requires a development build (see ADR-0002 and ticket 08).
