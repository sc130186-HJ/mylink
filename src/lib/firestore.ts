/**
 * Firestore 프로필 데이터 CRUD 헬퍼
 *
 * 컬렉션 구조:
 *   profiles/{profileId}  → ProfileData 문서
 *
 * 사용 예시:
 *   import { getProfile, saveProfile } from '@/lib/firestore';
 *   const data = await getProfile('default');
 *   await saveProfile('default', updatedData);
 */
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProfileData } from '@/types/profile';

const COLLECTION = 'profiles';

/**
 * Firestore에서 프로필 데이터를 조회합니다.
 * @param profileId 문서 ID (기본값: 'default')
 * @returns ProfileData | null
 */
export async function getProfile(profileId = 'default'): Promise<ProfileData | null> {
  try {
    const ref = doc(db, COLLECTION, profileId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const { updatedAt, ...data } = snap.data() as ProfileData & { updatedAt: unknown };
    void updatedAt; // 타임스탬프 필드 제외
    return data as ProfileData;
  } catch (err) {
    const firestoreError = err as FirestoreError;
    console.error('[Firestore] getProfile 오류:', firestoreError.message);
    return null;
  }
}

/**
 * Firestore에 프로필 데이터를 저장(upsert)합니다.
 * @param profileId 문서 ID (기본값: 'default')
 * @param data 저장할 ProfileData
 */
export async function saveProfile(profileId = 'default', data: ProfileData): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, profileId);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    const firestoreError = err as FirestoreError;
    console.error('[Firestore] saveProfile 오류:', firestoreError.message);
    throw firestoreError;
  }
}
