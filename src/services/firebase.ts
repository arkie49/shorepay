import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAehqVgsJYcoXVcKSIhZAqDylcD9IyOBDE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'shorepay-5c7ce.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? 'https://shorepay-5c7ce-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'shorepay-5c7ce',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'shorepay-5c7ce.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '293166599551',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:293166599551:web:293b4a55602cb4ae4a5e4a',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-BCKTCPNCXL',
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const firebaseDb = getDatabase(firebaseApp);

export const firebaseAnalyticsPromise = isSupported()
  .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
  .catch(() => null);

