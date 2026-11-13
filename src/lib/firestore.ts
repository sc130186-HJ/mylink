/**
 * Firestore 프로필 / 링크 데이터 CRUD 헬퍼
 *
 * 컬렉션 구조:
 *   profiles/{profileId}        → ProfileData 문서 (프로필 전체 저장용)
 *   user/{userId}/links/{linkId} → LinkItem 개별 문서
 *
 * 사용 예시:
 *   import { getProfile, saveProfile, addLink, getLinks, subscribeLinks } from '@/lib/firestore';
 *   const data = await getProfile('default');
 *   await saveProfile('default', updatedData);
 *   await addLink('anonymous', categoryId, newItem);
 *   const links = await getLinks('anonymous');
 */
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProfileData, LinkItem, ProfileInfo } from '@/types/profile';

const COLLECTION = 'profiles';
const USER_COLLECTION = 'users';

/** users/{userId}/links 경로의 컬렉션 ref */
export const linksRef = (userId = 'anonymous') =>
  collection(db, USER_COLLECTION, userId, 'links');

/** users/{userId} 경로의 문서 ref */
export const userDocRef = (userId: string) =>
  doc(db, USER_COLLECTION, userId);

// ─────────────────────────────────────────────
// 유저 프로필 관리 (users/{userId})
// ─────────────────────────────────────────────

/**
 * users/{userId} 에서 사용자 프로필 정보를 조회합니다.
 */
export async function getUserProfile(userId: string): Promise<ProfileInfo | null> {
  try {
    const snap = await getDoc(userDocRef(userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (data.profile) {
      return data.profile as ProfileInfo;
    }
    return {
      name: data.name || '',
      role: data.role || '크리에이터',
      bio: data.bio || '',
      avatarUrl: data.avatarUrl || data.photoURL || undefined,
      email: data.email || undefined,
      statusMessage: data.statusMessage || undefined,
    };
  } catch (err) {
    console.error('[Firestore] getUserProfile 오류:', err);
    return null;
  }
}

/**
 * users/{userId} 에 사용자 프로필 정보를 저장(upsert)합니다.
 */
export async function saveUserProfile(
  userId: string,
  profile: ProfileInfo,
  extraMeta?: Record<string, unknown>,
): Promise<void> {
  try {
    const cleanProfile: Record<string, unknown> = {};
    Object.entries(profile).forEach(([k, v]) => {
      if (v !== undefined) cleanProfile[k] = v;
    });

    await setDoc(
      userDocRef(userId),
      {
        profile: cleanProfile,
        updatedAt: serverTimestamp(),
        ...(extraMeta || {}),
      },
      { merge: true },
    );
  } catch (err) {
    console.error('[Firestore] saveUserProfile 오류:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────
// 프로필 전체 저장 (기존 호환 유지)
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// user/{userId}/links 개별 링크 저장 및 최신순 조회
// ─────────────────────────────────────────────

export interface FirestoreLinkResult {
  categoryId: string;
  item: LinkItem;
  createdAt?: unknown;
  updatedAt?: unknown;
}

/**
 * user/{userId}/links 에 링크 아이템 하나를 추가합니다.
 * @param userId 사용자 ID (기본값: 'anonymous')
 * @param categoryId 해당 링크가 속한 카테고리 ID
 * @param item id를 제외한 LinkItem 데이터
 * @returns 생성된 Firestore 문서 ID
 */
export async function addLink(
  userId = 'anonymous',
  categoryId: string,
  item: Omit<LinkItem, 'id'>,
): Promise<string> {
  try {
    // undefined 값 제거 (Firestore는 undefined 필드 전달 시 에러 발생)
    const cleanItem: Record<string, unknown> = {
      categoryId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    Object.entries(item).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanItem[key] = value;
      }
    });

    const docRef = await addDoc(linksRef(userId), cleanItem);
    return docRef.id;
  } catch (err) {
    const firestoreError = err as FirestoreError;
    console.error('[Firestore] addLink 오류:', firestoreError.message);
    throw firestoreError;
  }
}

/**
 * user/{userId}/links/{linkId} 의 링크 아이템을 수정(업데이트)합니다.
 * @param userId 사용자 ID (기본값: 'anonymous')
 * @param linkId 대상 링크 문서 ID
 * @param categoryId 해당 링크의 카테고리 ID
 * @param item 수정할 LinkItem 데이터
 */
export async function updateLink(
  userId = 'anonymous',
  linkId: string,
  categoryId: string,
  item: Omit<LinkItem, 'id'>,
): Promise<void> {
  try {
    const docRef = doc(db, USER_COLLECTION, userId, 'links', linkId);
    const cleanItem: Record<string, unknown> = {
      categoryId,
      updatedAt: serverTimestamp(),
    };
    Object.entries(item).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanItem[key] = value;
      }
    });

    // setDoc with merge: true를 사용하여 기존 문서가 없더라도 생성(upsert)
    await setDoc(docRef, cleanItem, { merge: true });
  } catch (err) {
    const firestoreError = err as FirestoreError;
    console.error('[Firestore] updateLink 오류:', firestoreError.message);
    throw firestoreError;
  }
}

/**
 * user/{userId}/links/{linkId} 의 링크 아이템을 삭제합니다.
 * @param userId 사용자 ID (기본값: 'anonymous')
 * @param linkId 삭제할 링크 문서 ID
 */
export async function deleteLink(
  userId = 'anonymous',
  linkId: string,
): Promise<void> {
  try {
    const docRef = doc(db, USER_COLLECTION, userId, 'links', linkId);
    await deleteDoc(docRef);
  } catch (err) {
    const firestoreError = err as FirestoreError;
    console.error('[Firestore] deleteLink 오류:', firestoreError.message);
    throw firestoreError;
  }
}

/**
 * user/{userId}/links 의 링크 목록을 createdAt 기준 최신순(desc)으로 조회합니다.
 * @param userId 사용자 ID (기본값: 'anonymous')
 * @returns FirestoreLinkResult[]
 */
export async function getLinks(
  userId = 'anonymous',
): Promise<FirestoreLinkResult[]> {
  try {
    const q = query(linksRef(userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const categoryId = (data.categoryId as string) || 'channels';
      const createdAt = data.createdAt;
      const updatedAt = data.updatedAt;
      return {
        categoryId,
        createdAt,
        updatedAt,
        item: {
          id: d.id,
          title: (data.title as string) || '',
          subtitle: data.subtitle as string | undefined,
          url: (data.url as string) || '',
          icon: data.icon || 'link',
          badge: data.badge,
          isCopyAction: data.isCopyAction,
          updatedAt: formatToIsoString(updatedAt),
        } as LinkItem,
      };
    });
  } catch (err) {
    console.warn('[Firestore] getLinks orderBy 쿼리 실패, 메모리 정렬 폴백 진행:', err);
    try {
      const snap = await getDocs(linksRef(userId));
      const list: FirestoreLinkResult[] = snap.docs.map((d) => {
        const data = d.data();
        const categoryId = (data.categoryId as string) || 'channels';
        const createdAt = data.createdAt;
        const updatedAt = data.updatedAt;
        return {
          categoryId,
          createdAt,
          updatedAt,
          item: {
            id: d.id,
            title: (data.title as string) || '',
            subtitle: data.subtitle as string | undefined,
            url: (data.url as string) || '',
            icon: data.icon || 'link',
            badge: data.badge,
            isCopyAction: data.isCopyAction,
            updatedAt: formatToIsoString(updatedAt),
          } as LinkItem,
        };
      });

      list.sort((a, b) => {
        const tA = getTimestampValue(a.createdAt);
        const tB = getTimestampValue(b.createdAt);
        return tB - tA;
      });

      return list;
    } catch (fallbackErr) {
      console.error('[Firestore] getLinks 폴백 오류:', fallbackErr);
      return [];
    }
  }
}

/**
 * 신규 유저에게 기본 링크 템플릿을 생성해주는 헬퍼
 */
export async function initUserDefaultLinks(
  userId: string,
  categories: { id: string; items: LinkItem[] }[],
): Promise<void> {
  try {
    for (const cat of categories) {
      for (const item of cat.items) {
        const { id, ...itemWithoutId } = item;
        void id;
        await addLink(userId, cat.id, itemWithoutId);
      }
    }
  } catch (err) {
    console.error('[Firestore] initUserDefaultLinks 오류:', err);
  }
}

/**
 * users/{userId}/links 를 실시간 구독(onSnapshot)하여 변경 시 최신순으로 콜백 호출
 */
export function subscribeLinks(
  userId = 'anonymous',
  onUpdate: (links: FirestoreLinkResult[]) => void,
  onError?: (err: unknown) => void,
): () => void {
  try {
    const q = query(linksRef(userId), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: FirestoreLinkResult[] = snapshot.docs.map((d) => {
          const data = d.data();
          const categoryId = (data.categoryId as string) || 'channels';
          const createdAt = data.createdAt;
          const updatedAt = data.updatedAt;
          return {
            categoryId,
            createdAt,
            updatedAt,
            item: {
              id: d.id,
              title: (data.title as string) || '',
              subtitle: data.subtitle as string | undefined,
              url: (data.url as string) || '',
              icon: data.icon || 'link',
              badge: data.badge,
              isCopyAction: data.isCopyAction,
              updatedAt: formatToIsoString(updatedAt),
            } as LinkItem,
          };
        });
        onUpdate(list);
      },
      (error) => {
        console.error('[Firestore] subscribeLinks 실시간 구독 오류:', error);
        if (onError) onError(error);
        // 오류 발생 시 단발성 getLinks 호출로 폴백
        getLinks(userId).then(onUpdate).catch(() => {});
      },
    );
  } catch (err) {
    console.error('[Firestore] subscribeLinks 초기화 실패:', err);
    if (onError) onError(err);
    getLinks(userId).then(onUpdate).catch(() => {});
    return () => {};
  }
}

/**
 * Display Name 중복 여부를 확인합니다.
 * users 컬렉션에서 profile.name == name 인 문서 중 currentUserId 외 다른 유저가 있으면 true(중복) 반환.
 * @param name 확인할 Display Name
 * @param currentUserId 중복 체크에서 제외할 현재 유저 ID
 * @returns true면 중복, false면 사용 가능
 */
export async function checkDisplayNameDuplicate(
  name: string,
  currentUserId: string,
): Promise<boolean> {
  try {
    const q = query(
      collection(db, USER_COLLECTION),
      where('profile.name', '==', name.trim()),
    );
    const snap = await getDocs(q);
    // 자기 자신 문서는 제외
    const others = snap.docs.filter((d) => d.id !== currentUserId);
    return others.length > 0;
  } catch (err) {
    console.error('[Firestore] checkDisplayNameDuplicate 오류:', err);
    // 오류 시 중복이 없는 것으로 처리 (저장 허용)
    return false;
  }
}

function formatToIsoString(val: unknown): string | undefined {
  if (!val) return undefined;
  if (typeof (val as { toDate?: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (val instanceof Date) return val.toISOString();
  const ms = getTimestampValue(val);
  return ms > 0 ? new Date(ms).toISOString() : undefined;
}

function getTimestampValue(val: unknown): number {
  if (!val) return 0;
  if (typeof (val as { toMillis?: () => number }).toMillis === 'function') {
    return (val as { toMillis: () => number }).toMillis();
  }
  if (val instanceof Date) return val.getTime();
  if (typeof (val as { seconds?: number }).seconds === 'number') {
    return (val as { seconds: number }).seconds * 1000;
  }
  const parsed = new Date(val as string | number).getTime();
  return isNaN(parsed) ? 0 : parsed;
}
