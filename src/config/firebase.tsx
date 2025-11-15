import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  initializeAuth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    'AIzaSyBIR9DWFg9G_X920DKujxnAR5CJktF9bKk',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    'handy-app-848e6.firebaseapp.com',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'handy-app-848e6',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    'handy-app-848e6.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '71722544625',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    '1:71722544625:web:438093feee07d39ba16850',
};

let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    const { getReactNativePersistence } = require('firebase/auth/react-native');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    auth = getAuth(app);
  }
}

export { app, auth };
