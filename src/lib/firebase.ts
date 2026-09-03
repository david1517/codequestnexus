import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let firebaseConnected = false;

if (hasFirebaseConfig) {
  try {
    app = getApps().length > 0
      ? getApps()[0]
      : initializeApp(firebaseConfig);

    auth = getAuth(app);
    db = getFirestore(app);
    firebaseConnected = true;

    console.log('🔥 Firebase conectado');
  } catch (error) {
    console.error('Erro ao inicializar o Firebase:', error);

    app = null;
    auth = null;
    db = null;
    firebaseConnected = false;
  }
} else {
  console.warn(
    'Firebase não configurado. O aplicativo continuará usando o modo local/mock.'
  );
}

export {
  app,
  auth,
  db,
  firebaseConnected,
};