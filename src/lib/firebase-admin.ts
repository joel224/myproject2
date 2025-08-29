
import * as admin from 'firebase-admin';

// This is a server-side file.
// IMPORTANT: Your service account key should be stored securely and not exposed to the client.
// We are using environment variables to load it.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

let app: admin.app.App;

export function getFirebaseAdminApp() {
  if (!app) {
    if (!serviceAccount) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Cannot initialize Firebase Admin SDK.'
      );
    }
    if (admin.apps.length > 0) {
      app = admin.apps[0]!;
    } else {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }
  return app;
}

export const auth = admin.auth;
export const firestore = admin.firestore;
