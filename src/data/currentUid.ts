import { auth } from './firebaseConfig';

/** Uid of the logged-in user, used to fill `ownerId` on writes and in read filters. */
export function currentUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('No authenticated user.');
  }
  return uid;
}
