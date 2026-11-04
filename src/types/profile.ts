export type IconType =
  | 'github'
  | 'velog'
  | 'project'
  | 'email'
  | 'linkedin'
  | 'link';

export type BadgeVariant = 'blue' | 'grey' | 'green' | 'red' | 'yellow';

export interface LinkBadge {
  text: string;
  variant?: BadgeVariant;
}

export interface LinkItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon: IconType;
  badge?: LinkBadge;
  isCopyAction?: boolean; // 클릭 시 새 창 열기 대신 클립보드 복사 (이메일 등)
}

export interface LinkCategory {
  id: string;
  title: string;
  description?: string;
  items: LinkItem[];
}

export interface ProfileInfo {
  name: string;
  role: string;
  bio: string;
  avatarUrl?: string;
  statusMessage?: string;
}

export interface ProfileData {
  profile: ProfileInfo;
  categories: LinkCategory[];
  footer: {
    copyright: string;
    poweredBy?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}
