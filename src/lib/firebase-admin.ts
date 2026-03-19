import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;

  // Handle all common formats from env vars:
  // 1. JSON-encoded with literal \n  →  replace with real newlines
  // 2. Wrapped in double quotes       →  strip quotes, then replace \n
  // 3. Already has real newlines       →  use as-is
  return key
    .replace(/^"(.*)"$/, "$1")   // strip surrounding quotes if present
    .replace(/\\n/g, "\n");       // convert literal \n to real newlines
}

// Initialize Firebase Admin SDK (server-side only)
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
    }),
  });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

export { adminDb, adminAuth };
