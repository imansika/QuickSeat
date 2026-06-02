import * as admin from 'firebase-admin';
import dotenv from 'dotenv';


dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ?.trim()
  .replace(/^"|"$/g, '')
  .replace(/\\n/g, '\n')
  .replace(/\r/g, '')
  .trim();

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Firebase Admin credentials are not fully configured');
}

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default admin;
