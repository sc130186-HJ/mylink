/**
 * Firebase 초기화 및 서비스 인스턴스 설정
 * 클라이언트 사이드에서만 사용됩니다.
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 싱글턴 패턴: 앱이 이미 초기화되어 있으면 재사용 (Next.js 핫리로드 대응)
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Firestore 데이터베이스
export const db: Firestore = getFirestore(app);

// Firebase Authentication
export const auth: Auth = getAuth(app);

// Firebase Storage
export const storage: FirebaseStorage = getStorage(app);

// Analytics는 브라우저 전용이므로 동적 import 사용 권장
// import('firebase/analytics').then(({ getAnalytics }) => getAnalytics(app));

export default app;
