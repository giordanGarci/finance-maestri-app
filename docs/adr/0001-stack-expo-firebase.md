# Stack: React Native (Expo) + Firebase/Firestore

Since the app is for personal use (a single user, low data volume) and shouldn't incur hosting costs, we chose React Native with Expo for free Android builds (with an open path to iOS) and Firebase/Firestore for cloud persistence, taking advantage of the generous free tier and direct integration with Expo (including Firebase Auth for login). Alternatives considered: Flutter (Dart ecosystem, no clear advantage here) and Supabase (Postgres, preferable only if there were a need for relational SQL, which doesn't exist in this simple domain).
