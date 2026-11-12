import { IconType } from "@/types/profile";

// 제한 글자 수 상수
export const MAX_TITLE_LENGTH = 30;
export const MAX_SUBTITLE_LENGTH = 60;
export const MAX_BADGE_LENGTH = 10;

// URL 형식 검증 (도메인 포함 표준 웹 주소 패턴)
export function isValidWebUrl(urlString: string): boolean {
  const trimmed = urlString.trim();
  if (/\s/.test(trimmed)) return false;

  // http:// 또는 https:// 부착 여부와 무관하게 유효한 도메인 형태인지 검사
  const urlPattern =
    /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i;
  return urlPattern.test(trimmed);
}

// 이메일 형식 검증
export function isValidEmail(emailString: string): boolean {
  const trimmed = emailString.trim().replace(/^mailto:/i, "");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(trimmed);
}

// 제목 검증 함수
export function validateTitle(val: string): string | undefined {
  const trimmed = val.trim();
  if (!trimmed) {
    return "링크 제목을 입력해 주세요";
  }
  if (val.length > MAX_TITLE_LENGTH) {
    return `링크 제목은 ${MAX_TITLE_LENGTH}자 이내로 입력해 주세요`;
  }
  return undefined;
}

// 보조 설명 검증 함수
export function validateSubtitle(val: string): string | undefined {
  if (val.length > MAX_SUBTITLE_LENGTH) {
    return `보조 설명은 ${MAX_SUBTITLE_LENGTH}자 이내로 입력해 주세요`;
  }
  return undefined;
}

// URL / 값 검증 함수
export function validateUrl(
  val: string,
  copyMode: boolean,
  icon: IconType,
): string | undefined {
  const trimmed = val.trim();
  if (!trimmed) {
    return copyMode ? "복사할 값을 입력해 주세요" : "URL 주소를 입력해 주세요";
  }

  if (copyMode) {
    // 복사 모드일 때 이메일 아이콘이거나 @가 포함된 경우 이메일 형식 검증
    if (icon === "email" || trimmed.includes("@")) {
      if (!isValidEmail(trimmed)) {
        return "올바른 이메일 형식을 입력해 주세요 (예: user@example.com)";
      }
    }
    if (trimmed.length < 2) {
      return "2자 이상 입력해 주세요";
    }
  } else {
    // 일반 링크 모드: 공백 체크 및 웹 URL 규격 검증
    if (/\s/.test(trimmed)) {
      return "URL 주소에는 공백이 들어갈 수 없어요";
    }
    if (!isValidWebUrl(trimmed)) {
      return "올바른 웹 주소(URL) 형식을 입력해 주세요 (예: https://...)";
    }
  }
  return undefined;
}

// 뱃지 텍스트 검증 함수
export function validateBadgeText(val: string): string | undefined {
  if (val.length > MAX_BADGE_LENGTH) {
    return `뱃지 문구는 ${MAX_BADGE_LENGTH}자 이내로 입력해 주세요`;
  }
  return undefined;
}

// 최종 저장용 URL 포맷팅
export function formatUrl(rawUrl: string, isCopyAction: boolean): string {
  let finalUrl = rawUrl.trim();
  if (
    !isCopyAction &&
    !/^https?:\/\//i.test(finalUrl) &&
    !/^mailto:/i.test(finalUrl) &&
    !finalUrl.startsWith("/")
  ) {
    finalUrl = `https://${finalUrl}`;
  }
  return finalUrl;
}
