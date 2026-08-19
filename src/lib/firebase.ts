const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (!apiKey) {
  console.warn('⚠️ Firebase NÃO configurado. Usando modo local.');
}

let auth: any = null;
let db: any = null;
let firebaseConnected = false;

function initFirebase() {
  if (!apiKey) {
    return;
  }

  try {
    // Importa Firebase dinamicamente
    import('firebase/app').then(({ initializeApp }) => {
      import('firebase/auth').then(({ getAuth }) => {
        import('firebase/firestore').then(({ getFirestore }) => {
          const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
          };

          if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
            console.warn('⚠️ .env incompleto');
            return;
          }

          try {
            const app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            firebaseConnected = true;
            console.log('✅ Firebase conectado com sucesso!');
          } catch (err) {
            console.error('❌ Erro ao iniciar Firebase:', err);
          }
        });
      });
    });
  } catch (err) {
    console.error('❌ Erro ao carregar Firebase:', err);
  }
}

initFirebase();

export { auth, db, firebaseConnected };
