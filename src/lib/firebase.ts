import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.databaseURL;

let auth: Auth | null = null;
let db: Database | null = null;

if (hasFirebaseConfig) {
  try {
    const app = initializeApp(firebaseConfig);

    auth = getAuth(app);
    db = getDatabase(app);

    console.log('✅ Firebase inicializado com sucesso!');
    console.log('🔐 Firebase Authentication conectado!');
    console.log('🔥 Realtime Database conectado!');
    console.log('📍 Database URL:', firebaseConfig.databaseURL);
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
  }
} else {
  console.warn(
    '⚠️ Firebase não configurado. Verifique o arquivo .env'
  );
}

export { auth, db };

export const firebaseConnected =
  auth !== null && db !== null;