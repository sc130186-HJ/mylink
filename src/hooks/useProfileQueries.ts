"use client";

import { useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import defaultData from "@/data/mockData.json";
import { ProfileData, ProfileInfo, LinkItem } from "@/types/profile";
import {
  getUserProfile,
  getUserByDisplayName,
  saveUserProfile,
  getLinks,
  addLink,
  updateLink,
  deleteLink,
  subscribeLinks,
  FirestoreLinkResult,
  UserSearchResult,
} from "@/lib/firestore";
import type { User } from "@/lib/auth";

export const DEFAULT_OWNER_UID = "YtJRljKAUDbC5v20Q6ydRffbHRl1";

export const profileKeys = {
  all: ["profile"] as const,
  userProfile: (uid: string) => [...profileKeys.all, "info", uid] as const,
  userByDisplayName: (displayName: string) =>
    [...profileKeys.all, "byDisplayName", displayName] as const,
  userLinks: (uid: string) => [...profileKeys.all, "links", uid] as const,
};

/**
 * 0. displayName으로 유저 검색 Query (/[displayName] 동적 라우팅용)
 * - users 컬렉션에서 displayName과 일치하는 유저의 { userId, profile } 조회
 * - 일치하는 유저가 없으면 null 반환
 */
export function useUserByDisplayNameQuery(displayName: string) {
  const normalizedName = displayName.trim();

  return useQuery({
    queryKey: profileKeys.userByDisplayName(normalizedName),
    enabled: !!normalizedName,
    retry: false,
    queryFn: async (): Promise<UserSearchResult | null> => {
      if (!normalizedName) return null;
      return await getUserByDisplayName(normalizedName);
    },
  });
}

/**
 * 1. 유저 프로필 조회 Query
 * - 로그인 상태면 해당 유저 프로필 조회/초기화
 * - 비로그인 상태면 기본 소유자(DEFAULT_OWNER_UID)의 공개 프로필을 Firestore에서 조회
 */
export function useUserProfileQuery(user: User | null) {
  const uid = user?.uid || DEFAULT_OWNER_UID;

  return useQuery({
    queryKey: profileKeys.userProfile(uid),
    enabled: !!uid,
    queryFn: async (): Promise<ProfileInfo> => {
      if (!user) {
        const publicProfile = await getUserProfile(DEFAULT_OWNER_UID);
        return publicProfile || (defaultData as ProfileData).profile;
      }

      const userStorageKey = `mylink_profile_${uid}`;
      const remoteProfile = await getUserProfile(uid);

      let resolvedProfile: ProfileInfo;
      if (remoteProfile) {
        resolvedProfile = {
          ...remoteProfile,
          avatarUrl: remoteProfile.avatarUrl || user.photoURL || undefined,
          name: remoteProfile.name || user.displayName || "내 링크",
          email: user.email || remoteProfile.email,
        };
        if (!remoteProfile.name && resolvedProfile.name) {
          await saveUserProfile(uid, resolvedProfile, {
            email: user.email,
            displayName: resolvedProfile.name,
            photoURL: user.photoURL,
          }).catch((err) => console.warn("프로필 동기화 저장 실패:", err));
        }
      } else {
        resolvedProfile = {
          name: user.displayName || "내 링크",
          role: "크리에이터",
          bio: "반갑습니다! 나만의 소셜 링크를 모아두는 공간입니다 ✨",
          avatarUrl: user.photoURL || undefined,
          email: user.email || undefined,
          statusMessage: "온라인 · 환영합니다!",
        };
        await saveUserProfile(uid, resolvedProfile, {
          email: user.email,
          displayName: resolvedProfile.name,
          photoURL: user.photoURL,
        }).catch((err) => console.warn("프로필 초기 저장 실패:", err));
      }

      try {
        localStorage.setItem(userStorageKey, JSON.stringify(resolvedProfile));
      } catch {}

      return resolvedProfile;
    },
  });
}

/**
 * 2. 유저 프로필 수정 Mutation (낙관적 업데이트 적용)
 * - onMutate에서 캐시를 즉시 새 프로필로 교체하여 UI에 즉각 반영
 * - 에러 발생 시 이전 프로필 데이터로 롤백
 */
export function useUpdateProfileMutation(
  uid: string | undefined,
  callbacks?: {
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
  }
) {
  const queryClient = useQueryClient();
  const queryKey = profileKeys.userProfile(uid || "anonymous");

  return useMutation({
    mutationFn: async (updatedProfile: ProfileInfo) => {
      if (!uid) throw new Error("로그인이 필요합니다.");
      await saveUserProfile(uid, updatedProfile);
      return updatedProfile;
    },
    onMutate: async (newProfile: ProfileInfo) => {
      // 진행 중인 refetch 취소 (낙관적 업데이트 덮어쓰기 방지)
      await queryClient.cancelQueries({ queryKey });

      // 롤백용 이전 프로필 스냅샷 저장
      const previousProfile = queryClient.getQueryData<ProfileInfo>(queryKey);

      // 캐시에 새 프로필 즉시 반영 (낙관적 업데이트)
      queryClient.setQueryData<ProfileInfo>(queryKey, newProfile);

      if (uid) {
        try {
          localStorage.setItem(
            `mylink_profile_${uid}`,
            JSON.stringify(newProfile)
          );
        } catch {}
      }

      return { previousProfile };
    },
    onError: (err, _newProfile, context) => {
      // 실패 시 이전 프로필로 롤백
      if (context?.previousProfile) {
        queryClient.setQueryData<ProfileInfo>(
          queryKey,
          context.previousProfile
        );
        if (uid) {
          try {
            localStorage.setItem(
              `mylink_profile_${uid}`,
              JSON.stringify(context.previousProfile)
            );
          } catch {}
        }
      }
      callbacks?.onError?.(err);
    },
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onSettled: () => {
      // 서버 상태와 최종 동기화
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 3. 유저 링크 목록 조회 Query + 실시간 구독 동기화
 * - 사용자가 직접 추가한 링크만 표시하며, 임의의 기본 템플릿 링크는 자동 생성하지 않음
 * - Firestore onSnapshot 실시간 업데이트를 QueryClient 캐시에 반영
 */
export function useUserLinksQuery(
  uid: string | undefined,
  _options?: { seedIfEmpty?: boolean }
) {
  void _options;
  const queryClient = useQueryClient();
  const queryKey = profileKeys.userLinks(uid || "anonymous");

  const query = useQuery({
    queryKey,
    enabled: !!uid,
    queryFn: async (): Promise<FirestoreLinkResult[]> => {
      if (!uid) return [];
      return await getLinks(uid);
    },
  });

  // Firestore 실시간 구독 -> TanStack Query 캐시 업데이트
  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeLinks(uid, (latestLinks) => {
      queryClient.setQueryData<FirestoreLinkResult[]>(
        profileKeys.userLinks(uid),
        latestLinks
      );
    });
    return () => {
      unsubscribe();
    };
  }, [uid, queryClient]);

  return query;
}

/**
 * 4. 새 링크 추가 Mutation
 */
export function useAddLinkMutation(
  uid: string | undefined,
  callbacks?: {
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
  }
) {
  const queryClient = useQueryClient();
  const queryKey = profileKeys.userLinks(uid || "anonymous");

  return useMutation({
    mutationFn: async ({
      categoryId,
      newItem,
    }: {
      categoryId: string;
      newItem: Omit<LinkItem, "id">;
    }) => {
      if (!uid) throw new Error("로그인이 필요합니다.");
      await addLink(uid, categoryId, newItem);
      return await getLinks(uid);
    },
    onSuccess: (updatedList) => {
      queryClient.setQueryData<FirestoreLinkResult[]>(queryKey, updatedList);
      callbacks?.onSuccess?.();
    },
    onError: (err) => {
      callbacks?.onError?.(err);
    },
  });
}

/**
 * 5. 링크 수정 Mutation
 */
export function useUpdateLinkMutation(
  uid: string | undefined,
  callbacks?: {
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
  }
) {
  const queryClient = useQueryClient();
  const queryKey = profileKeys.userLinks(uid || "anonymous");

  return useMutation({
    mutationFn: async ({
      linkId,
      categoryId,
      updatedItem,
    }: {
      linkId: string;
      categoryId: string;
      updatedItem: Omit<LinkItem, "id">;
    }) => {
      if (!uid) throw new Error("로그인이 필요합니다.");
      await updateLink(uid, linkId, categoryId, updatedItem);
      return await getLinks(uid);
    },
    onSuccess: (updatedList) => {
      queryClient.setQueryData<FirestoreLinkResult[]>(queryKey, updatedList);
      callbacks?.onSuccess?.();
    },
    onError: (err) => {
      callbacks?.onError?.(err);
    },
  });
}

/**
 * 6. 링크 삭제 Mutation
 */
export function useDeleteLinkMutation(
  uid: string | undefined,
  callbacks?: {
    onSuccess?: (deletedLinkId: string) => void;
    onError?: (err: unknown) => void;
  }
) {
  const queryClient = useQueryClient();
  const queryKey = profileKeys.userLinks(uid || "anonymous");

  return useMutation({
    mutationFn: async (linkId: string) => {
      if (!uid) throw new Error("로그인이 필요합니다.");
      await deleteLink(uid, linkId);
      const updatedList = await getLinks(uid);
      return { linkId, updatedList };
    },
    onSuccess: ({ linkId, updatedList }) => {
      queryClient.setQueryData<FirestoreLinkResult[]>(queryKey, updatedList);
      callbacks?.onSuccess?.(linkId);
    },
    onError: (err) => {
      callbacks?.onError?.(err);
    },
  });
}

/**
 * 7. 링크 목록 새로고침 Mutation (기본 템플릿 자동 추가 제거)
 */
export function useResetLinksMutation(
  uid: string | undefined,
  callbacks?: {
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
  }
) {
  const queryClient = useQueryClient();
  const queryKey = profileKeys.userLinks(uid || "anonymous");

  return useMutation({
    mutationFn: async () => {
      if (!uid) throw new Error("로그인이 필요합니다.");
      return await getLinks(uid);
    },
    onSuccess: (updatedList) => {
      queryClient.setQueryData<FirestoreLinkResult[]>(queryKey, updatedList);
      callbacks?.onSuccess?.();
    },
    onError: (err) => {
      callbacks?.onError?.(err);
    },
  });
}
