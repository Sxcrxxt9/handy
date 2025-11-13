import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

let app;
let db;

try {
  // Check if Firebase app is already initialized
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('✅ Firebase Admin initialized successfully');
  } else {
    app = getApps()[0];
    console.log('✅ Using existing Firebase Admin app');
  }

  db = getFirestore(app);
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error);
  throw error;
}

export { db, app };

