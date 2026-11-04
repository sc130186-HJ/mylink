# 📱 마이링크 (MyLink) 제품 요구사항 정의서 (PRD)

> **문서 버전**: v1.6.0  
> **최종 수정일**: 2026-11-03  
> **진행 상황**: Design.md 기반 토스 디자인 시스템(TDS) × shadcn/ui 컴포넌트 아키텍처 및 더미 데이터(Mock Data/API) 명세 반영  
> **작성자**: 신예헌 & Antigravity  

---

## 1. 프로젝트 개요 (Project Overview)

### 1.1 서비스 정의
**마이링크(MyLink)**는 사용자의 SNS 채널, 프로젝트 포트폴리오, 추천 아티클, 연락처 등 다양한 디지털 링크를 하나의 세련된 모바일 최적화 웹 페이지로 모아 제공하는 **개인 맞춤형 링크트리(Linktree) 클론 웹 서비스**입니다.

### 1.2 개발 배경 및 목표
* **분산된 링크의 단일화**: GitHub, 블로그, 이메일, 포트폴리오 등 흩어져 있는 채널을 단 하나의 대표 URL로 통합 제공합니다.
* **라이브 시연(Demo) 중심의 단계별 개발**: 대시보드나 복잡한 통계 기능 등 무거운 요소는 배제하고, **표준 더미 데이터(Dummy Data)와 브라우저 LocalStorage 및 Mock API**를 기반으로 핵심 프로필 페이지를 먼저 완벽히 시연할 수 있도록 단계를 구분합니다.
* **TDS(토스 디자인 시스템) 규격 기반 shadcn/ui 구축**: 접근성과 확장성이 뛰어난 **shadcn/ui**를 베이스 라이브러리로 채택하되, 모든 시각 토큰·컴포넌트 변형·타이포그래피·마이크로 인터랙션은 **`design.md`에 명시된 토스 디자인 시스템(TDS Mobile) 공식 핸드오프 규격**을 100% 충실히 적용하여 토스 고유의 정갈하고 완성도 높은 감성을 구현합니다.

### 1.3 핵심 가치 (Core Values)
1. **단계적 완성도 (Step-by-step Demo)**: 불필요한 기능 없이 시연 핵심인 프로필과 링크 탐색·공유에 집중.
2. **독립성 (Zero-Backend / Mock Ready)**: 백엔드 서버 없이도 완성도 높은 JSON 더미 데이터와 브라우저 LocalStorage, Next.js Mock API를 통해 실제 서비스와 동일한 사용자 경험 보장.
3. **직관성 (Intuitive)**: 한눈에 파악되는 카테고리별 그룹화 및 리치 링크 카드.
4. **접근성 및 공유성 (Shareable)**: QR 코드 모달, 원클릭 링크 복사, 완벽한 OG 태그 지원으로 어디서든 편리한 공유.
5. **디자인 무결성 (TDS Standard)**: `design.md`의 엄격한 컬러 팔레트, 4단 버튼 규격, 헤어라인 보더, 고유 프레스 인터랙션을 전면 준수.

---

## 2. 단계별 릴리즈 전략 (Phased Release Strategy)

> [!IMPORTANT]
> **현재는 시연(Demonstration) 단계이므로 Phase 1(프로필 페이지 중심)을 우선 완성합니다.**  
> 대시보드, 통계 분석, 방문자 트래킹 등의 기능은 Phase 2 이후의 고도화 작업으로 분류하여 현재 작업 범위(Scope)에서 제외합니다.

| 단계 | 구분 | 범위 (Scope) | 상태 |
| :--- | :--- | :--- | :--- :---: |
| **Phase 1** | **시연용 프로필 페이지 (MVP)** | • LocalStorage + Zustand 기반 데이터 관리<br>• 프로필 헤더 (아바타/이름/직무/한줄소개)<br>• 카테고리별 리치 링크 카드 (외부링크, 이메일 복사)<br>• 시연용 QR 코드 공유 모달 & TDS 플로팅 토스트<br>• 표준 JSON 더미 데이터 로드 및 데이터 초기화(Reset) | **현재 집중 단계** |
| **Phase 2** | **관리자 인터페이스 고도화** | • 클라이언트 모의 로그인/회원가입 모달<br>• 인라인 링크 추가/수정/삭제 모달 폼<br>• 카테고리 순서 변경 인터페이스 | 추후 예정 |
| **Phase 3** | **대시보드 및 통계 분석 (Analytics)** | • 관리자 전용 대시보드 뷰<br>• 링크별 누적 클릭 수 및 일자별 방문 통계<br>• 외부 애널리틱스(GA4 등) 연동 | 추후 예정 |

---

## 3. 기술 스택 (Tech Stack)

| 계층 | 기술 스택 | 설명 |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | 최신 React 19 기반의 모던 웹 프레임워크 |
| **Language** | TypeScript | 엄격한 인터페이스 정의를 통한 타입 안정성 |
| **Styling** | Tailwind CSS v4 (모듈 CSS 전면 배제) | 유틸리티 퍼스트 기반 테마 스타일링. CSS 모듈(`.module.css`) 사용을 일체 금지하고 Tailwind CSS 단일 체계로 통일 |
| **UI Component Library** | **shadcn/ui (TDS 규격화)** | `design.md`의 토스 디자인 시스템(TDS Mobile) 공식 핸드오프 규격(4단 버튼, 라운드 사다리, 섀도우, 프레스 모션)에 맞춰 100% 커스텀 구축된 재사용 프리미티브 (`@/components/ui`) |
| **Design Tokens** | Toss Design System (TDS) | `design.md` 규격의 색상, 타이포그래피, 섀도우, 프레스 효과를 shadcn 테마 변수와 완전 통합 |
| **Icons** | Lucide React | shadcn/ui 표준 아이콘 라이브러리 (TDS 규격 대체: 24px 그리드, 1.5px stroke) |
| **State Management** | Zustand (v5) | 가벼운 번들 크기, 선택적 구독 및 `persist` 미들웨어를 통한 LocalStorage 자동 영속화 |
| **Client Storage** | Browser `localStorage` | 프로필 정보 및 카테고리별 링크 데이터 영속 보관 (`mylink_profile_data`) |
| **Mock Data / API** | JSON & Next.js Route Handler | 표준 링크 목록 더미 데이터(`src/data/mockData.json`) 및 Mock API(`src/app/api/profile/route.ts`) |
| **Utility** | `qrcode.react`, `cn` | 시연용 SVG QR 코드 생성 및 shadcn 표준 클래스 병합 유틸 |
| **Deployment** | Vercel / GitHub Pages | 완전 정적(Static Generation) 또는 엣지 호스팅 최적화 |

---

## 4. TDS × shadcn/ui 디자인 시스템 설계 명세 (Design.md 기반)

> [!IMPORTANT]
> **디자인 시스템 구축 기본 원칙**:
> 본 프로젝트의 모든 UI 컴포넌트는 **shadcn/ui**의 베이스 프리미티브(`@/components/ui`)를 뼈대로 삼되, 스타일링·토큰·타이포그래피·마이크로 인터랙션은 **`design.md`에 명시된 토스 디자인 시스템(TDS Mobile) 공식 핸드오프 규격**을 100% 충실히 준수하여 커스터마이징합니다.

### 4.1 비주얼 무드 및 기하학 원칙
* **차갑고 절제된 화이트 캔버스**: 순수 흰색(`white`) 및 차가운 쿨그레이 표면(`grey-50`, `grey-100`)을 베이스로 구축.
* **단일 강조색 (Singular Accent)**: 채도 높은 브랜드 블루(`blue-500`: `#3182F6`)는 화면당 단 하나의 가장 중요한 액션(Primary CTA)에만 예약.
* **공격적 라운드 (Aggressive Rounding)**: 버튼·카드·모달에 12px~24px의 과감한 곡률 적용, 칩·필·CTA에는 999px(Full Pill) 적용. 단, 모호한 squircle/blob 형태는 배제.
* **평면 표면과 헤어라인 보더**: 1px `grey-200`(`border-secondary`)을 기본 분리선으로 사용하며 불필요한 장식적 두꺼운 선 배제.

### 4.2 컬러 시스템 및 테마 토큰 매핑
| TDS 토큰 (`design.md`) | OKLCH / HEX 값 | 역할 및 용도 | shadcn/ui 테마 변수 매핑 |
| :--- | :--- | :--- | :--- |
| **`blue-500`** | `oklch(0.620 0.191 258)` / `#3182F6` | TDS 대표 브랜드 블루, 카노니컬 CTA | `--primary`, `--ring` |
| **`blue-600`** | `oklch(0.522 0.176 257)` / `#1B64DA` | 버튼 Pressed 상태 배경 | `--primary-hover` |
| **`blue-50`** | `oklch(0.959 0.020 250)` / `#E8F3FF` | Brand-weak 배경, 뱃지/칩 배경 | `--accent`, `--sidebar-accent` |
| **`grey-900`** | `oklch(0.237 0.020 258)` / `#191F28` | Primary 텍스트, 토스트 표면 (절대 순수 검정 지양) | `--foreground`, `--card-foreground` |
| **`grey-800`** | `oklch(0.357 0.028 257)` / `#333D4B` | 서브 타이틀 및 헤더 | - |
| **`grey-700`** | `oklch(0.460 0.028 256)` / `#4E5968` | Secondary 텍스트 (설명글, 부제목) | `--muted-foreground` (본문) |
| **`grey-600`** | `oklch(0.562 0.025 254)` / `#6B7684` | Tertiary 텍스트 (라벨, 메타정보) | `--muted-foreground` (메타) |
| **`grey-400`** | `oklch(0.779 0.016 251)` / `#B0B8C1` | 비활성 텍스트 (`disabled`), 강한 라인 | `--sidebar-border` |
| **`grey-200`** | `oklch(0.930 0.005 248)` / `#E5E8EB` | 기본 디바이더, 카드 보더 | `--border`, `--input` |
| **`grey-100`** | `oklch(0.966 0.003 248)` / `#F2F4F6` | Secondary 표면, 탭 트랙, 보조 버튼 배경 | `--secondary`, `--muted` |
| **`grey-50`** | `oklch(0.985 0.002 248)` / `#F9FAFB` | 전체 페이지 캔버스 배경 | `--background` |
| **`white`** | `#FFFFFF` | 카드 배경, 모달 표면, 팝오버 | `--card`, `--popover` |
| **`red-500`** | `oklch(0.641 0.208 21)` / `#F04452` | 위험, 삭제 액션, 오류 뱃지 | `--destructive` |
| **`green-500`** | `oklch(0.493 0.143 154)` / `#32A05B` | 성공, 안전, 통과 뱃지 | `--chart-2` |
| **`yellow-500`** | `oklch(0.850 0.154 82)` / `#FFC342` | 주의, 강조, 일러스트 웜 톤 | `--chart-1` |
| **`overlay-press`** | `rgba(0, 0, 0, 0.04)` / `0.26` | 버튼/카드 터치 시 오버레이 틴트 | - |
| **`overlay-scrim`** | `rgba(0, 0, 0, 0.56)` | 모달/바텀시트 배경 스크림 | - |

### 4.3 타이포그래피 시스템 (Pretendard & Tabular Numbers)
* **Font Stack**: `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif` (Toss Product Sans 메트릭 1:1 대체)
* **주요 Type Ramp (`design.md` 규격)**:
  - `H1`: 28px, Bold 700, line-height 1.30, letter-spacing -0.020em
  - `Title-1`: 18px, Semibold 600, line-height 1.45, letter-spacing -0.010em (섹션 타이틀, 카드 메인 제목)
  - `Title-2`: 17px, Semibold 600, line-height 1.45, letter-spacing -0.010em
  - `Body-1`: 17px, Regular 400, line-height 1.50, letter-spacing -0.005em
  - `Body-2`: 15px, Regular 400, line-height 1.50, letter-spacing -0.005em (카드 서브타이틀, 일반 본문)
  - `Body-3`: 13px, Regular 400, line-height 1.50, letter-spacing 0em
  - `Label-L`: 17px, Bold 700, line-height 1.25, letter-spacing -0.005em (XL/L 버튼 라벨)
  - `Label-M`: 15px, Semibold 600, line-height 1.25, letter-spacing -0.005em (M 버튼, 필터 탭)
  - `Label-S`: 13px, Semibold 600, line-height 1.25, letter-spacing 0em (S 버튼, 뱃지)
  - `Caption`: 12px, Medium 500, line-height 1.40, letter-spacing 0em (푸터, 보조 설명)
* **숫자 타이포 분리 (`tabular-nums`)**:
  - 금융 및 통계 수치(조회수, 클릭수, 날짜 등)는 가독성과 수직 정렬을 위해 `font-variant-numeric: tabular-nums`를 필수 적용.

### 4.4 간격(Spacing) 및 라운드(Rounded) 스펙
* **8pt 그리드 기반 Spacing Rule**:
  - `space-1` (4px), `space-2` (8px - 밀접 요소 간격), `space-3` (12px), `space-4` (16px - 리스트 항목 간격), `space-6` (24px - 화면 기본 아우터 패딩), `space-8` (32px - 섹션 간격)
* **곡률 사다리 (Radius Ladder)**:
  - `radius-xs` (4px): 소형 태그
  - `radius-s` (8px): 인라인 뱃지
  - `radius-m` (12px): 텍스트 인풋, M 사이즈 버튼 (40px)
  - `radius-l` (14px): L 사이즈 버튼 (48px), 토스트 캡슐
  - `radius-xl` (16px): XL 버튼 (56px), 표준 리치 링크 카드
  - `radius-2xl` (20px): 모달 다이얼로그, 바텀시트
  - `radius-3xl` (24px): 대형 섹션 박스
  - `radius-full` (999px): 캡슐 뱃지, 아바타, 칩, 하단 Primary CTA 버튼

### 4.5 고도(Elevation) 및 마이크로 인터랙션 모션
* **평면 우선(Flat-first) 원칙**: 그림자는 공중에 떠 있는 플로팅/모달 컴포넌트에만 한정 사용 (navy-900 베이스의 낮은 투명도).
  - `shadow-card`: `0 1px 3px rgba(25, 31, 40, 0.04), 0 4px 12px rgba(25, 31, 40, 0.03)`
  - `shadow-toast`: `0 8px 24px rgba(25, 31, 40, 0.16)`
  - `shadow-dialog (shadow-3)`: `0 12px 32px rgba(25, 31, 40, 0.10), 0 2px 6px rgba(25, 31, 40, 0.06)`
* **모션 및 인터랙션 토큰**:
  - `ease`: `cubic-bezier(0.22, 0.61, 0.36, 1)` (ease-out-expo 기본 곡선)
  - `dur-fast`: 120ms (버튼/카드 프레스 피드백)
  - `dur-base`: 200ms (토글, 호버 전환)
  - `dur-slow`: 320ms (모달/다이얼로그 진입)
  - **Press 인터랙션 (`tds-pressable`)**: 터치 및 클릭 시 `scale(0.985)` 미세 축소와 배경 오버레이(`overlay-press`) 적용. 과도한 바운스나 오버슈트 효과는 엄격히 금지.

### 4.6 shadcn/ui 컴포넌트별 TDS 구현 규격
1. **Button (`@/components/ui/button`)**:
   - 규격: XL(56px / radius-16), L(48px / radius-14), M(40px / radius-12), S(32px / radius-10)
   - Variants:
     - `primary`: `bg-blue-500 text-white hover:bg-blue-600` (화면당 1개)
     - `secondary`: `bg-grey-100 text-grey-900 hover:bg-grey-200`
     - `danger`: `bg-red-500 text-white hover:bg-red-600`
     - `ghost`: 투명 배경, `text-blue-500 hover:bg-black/[0.03]`
   - 비활성: `disabled:opacity-30` (전체 노드 일괄 적용)
2. **Card (`@/components/ui/card` - Link Card)**:
   - 배경 `bg-white`, `rounded-2xl` (16px), 1px `border-grey-200` 또는 hairline `border-black/[0.04]`
   - 패딩 16px (14×24 그리드), 내부에 44px 아이콘 박스 + 제목/설명 스택 + 우측 화살표/뱃지 슬롯 배치
   - 터치 시 `tds-pressable` 축소 피드백 제공
3. **Badge (`@/components/ui/badge`)**:
   - 22px 높이, 6px 또는 999px 풀 캡슐 라운드
   - `brand`: `bg-blue-50 text-blue-500`
   - `success`: 옅은 민트 배경 + `text-green-500`
   - `danger`: 옅은 핑크 배경 + `text-red-500`
   - `neutral`: `bg-grey-100 text-grey-700`
4. **Dialog (`@/components/ui/dialog`)**:
   - 배경 `bg-white`, `rounded-3xl` (20px), 내부 패딩 24px, `shadow-dialog`
   - 타이틀 18px Bold (`title-1`), 본문 15px Regular (`body-2`, `grey-700`)
   - 하단 48px L사이즈 버튼 2개(확인: Primary blue, 취소: Secondary grey-100) 수직 또는 수평 스택
5. **Toast (`@/components/ui/toast` or Floating Toast)**:
   - 배경 `bg-grey-900 text-white`, `rounded-2xl` (14px), `shadow-toast`, 하단 중앙 24px 띄움 플로팅
   - 2.4초 자동 소멸 타이머, 성공 시 `green-500` 원형 체크 아이콘 동반
6. **Avatar (`@/components/ui/avatar`)**:
   - 80px 메인 프로필 원형 아바타, 이미지 부재 시 이니셜 텍스트 + `blue-500` 계열 그라데이션 폴백

### 4.7 UX 라이팅 원칙 (TDS Voice & Tone)
* **해요체 원칙**: 모든 안내문, 버튼 라벨, 피드백 문구는 대화형 존댓말(해요체)로 통일 (`~합니다`, `~임` 지양).
  - 예시: "링크가 복사되었어요", "데이터를 초기화할까요?", "언제든 다시 설정할 수 있어요"
* **위임형 및 쉬운 일상어**: 사용자의 인지 부담을 덜어주는 직관적 표현 사용.

---

## 5. 정보 구조도 (Information Architecture - Phase 1 기준)

```
마이링크 (MyLink) - Phase 1 프로필 페이지
├── 1. 상단 글로벌 바 (Global Bar)
│   ├── 서비스 타이틀 (MyLink)
│   ├── 데이터 초기화 버튼 (LocalStorage 리셋 유틸리티)
│   ├── QR 코드 보기 버튼 (시연용 QR 모달 트리거)
│   └── 페이지 링크 복사 버튼 (클립보드 복사 & 토스트)
├── 2. 프로필 헤더 (Profile Header)
│   ├── 프로필 아바타 (이미지 URL 또는 이름 이니셜 원형 아바타)
│   ├── 이름 / 직무 뱃지 (TDS 캡슐형 뱃지)
│   └── 한 줄 소개글 (Bio - 개행 지원)
├── 3. 링크 카테고리 섹션 (Grouped Link Sections)
│   ├── [섹션 1] 주요 채널 (GitHub, 블로그 등)
│   ├── [섹션 2] 대표 프로젝트 (서비스 데모, 저장소 링크)
│   ├── [섹션 3] 추천 글 & 아티클 (기술 포스팅)
│   └── [섹션 4] 연락처 & 커피챗 (이메일 원클릭 복사, LinkedIn 등)
├── 4. 유틸리티 & 모달 레이어 (Modals & Toast)
│   ├── 시연용 QR 코드 공유 모달 (QR Code Modal)
│   └── TDS 플로팅 토스트 (Floating Toast - 2.4초 자동 소멸)
└── 5. 푸터 (Footer)
    └── 저작권 표기 및 빌드 정보
```

---

## 6. 사용자 시나리오 (User Scenarios)

### 6.1 페르소나 정의 (Personas)

#### 1) 방문자 페르소나: 김민준 (29세, 테크 스타트업 리크루터 / 채용 담당자)
* **목표**: 지원자의 포트폴리오, GitHub 저장소, 기술 블로그를 빠르게 검토하고 적합한 인재에게 신속하게 면접 제안(이메일/연락)을 보낸다.
* **특징 및 행동 패턴**: 주로 모바일이나 데스크톱 브라우저로 접속하며, 군더더기 없는 UI, 직관적인 카테고리 분류, 오류 없는 링크 이동, 간편한 연락처 복사 피드백을 중시한다.

#### 2) 소유자 페르소나: 이지은 (25세, 주니어 프론트엔드 개발자 & 테크 크리에이터)
* **목표**: 흩어져 있는 자신의 프로젝트, GitHub, 기술 블로그, SNS를 세련된 단일 링크로 통합하여 이력서나 SNS 프로필에 공유하고, 커리어 변화에 맞춰 수시로 링크를 추가·수정·삭제한다.
* **특징 및 행동 패턴**: 복잡한 관리 툴 대신 브라우저에서 바로바로 편집할 수 있는 직관적인 인터페이스를 원하며, 새로운 결과물이 나올 때마다 링크를 손쉽게 최신화한다.

---

### 6.2 방문자 시나리오 (다른 사람의 마이링크를 방문하는 과정)
> **상황**: 채용 담당자 김민준이 서류 검토 중 개발자 이지은의 이력서에 기재된 마이링크 대표 URL을 열어 검토하고 제안을 전달하는 여정

* **1단계 [페이지 탐색 진입]**: 사용자는 지원자의 모든 디지털 활동 내역을 한눈에 확인하기 위해 이력서 상단의 마이링크 대표 URL을 클릭하여 접속한다.
* **2단계 [프로필 및 정체성 파악]**: 사용자는 지원자의 주력 직무와 전문 분야를 3초 내에 직관적으로 파악하기 위해 최상단 프로필 헤더의 아바타, 직무 뱃지(`Frontend Developer`), 한 줄 소개글(Bio)을 확인한다.
* **3단계 [핵심 프로젝트 결과물 검증]**: 사용자는 지원자의 실제 코드 품질과 라이브 데모 서비스를 점검하기 위해 '대표 프로젝트' 섹션의 리치 링크 카드를 클릭하여 새 창(`target="_blank"`)에서 GitHub 저장소 및 데모 사이트로 이동한다.
* **4단계 [기술 아티클 및 문제 해결력 검토]**: 사용자는 지원자의 기술적 깊이와 커뮤니케이션 능력을 평가하기 위해 '추천 글 & 아티클' 섹션의 기술 블로그 링크 카드를 클릭하여 작성된 글을 확인한다.
* **5단계 [채용 제안을 위한 연락처 복사]**: 사용자는 면접 제안 메일을 발송할 이메일 주소를 오탈자 없이 신속하게 획득하기 위해 '연락처' 섹션의 이메일 카드를 클릭하여 클립보드에 이메일을 즉시 복사하고 하단 TDS 플로팅 토스트 피드백을 확인한다.
* **6단계 [동료 면접관과의 프로필 공유]**: 사용자는 사내 개발팀 동료 면접관들에게 지원자의 전체 링크 정보를 전달하기 위해 상단 글로벌 바의 '페이지 링크 복사' 버튼을 눌러 URL을 복사한 뒤 메신저에 전달한다.
* **7단계 [오프라인 밋업에서의 QR 접속]**: 사용자는 오프라인 채용 박람회나 콘퍼런스 현장에서 지원자의 프로필을 모바일 기기로 즉각 확인하기 위해 지원자가 화면에 띄운 '시연용 QR 코드'를 스마트폰 카메라로 스캔하여 접속한다.

---

### 6.3 소유자 시나리오 (자신의 마이링크를 관리하는 과정)
> **상황**: 주니어 개발자 이지은이 최근 완성한 사이드 프로젝트를 추가하고, 리뉴얼된 블로그 주소를 수정하며, 만료된 스터디 링크를 정리하는 관리 여정

* **1단계 [관리 모드 진입 및 현황 확인]**: 사용자는 자신의 마이링크 페이지 콘텐츠를 최신 상태로 갱신하기 위해 마이링크 관리 인터페이스(또는 시연 관리 모드)로 진입한다.
* **2단계 [신규 프로젝트 링크 추가]**: 사용자는 최근 배포한 사이드 프로젝트를 방문자에게 즉시 홍보하기 위해 '대표 프로젝트' 카테고리의 '링크 추가' 버튼을 눌러 링크 제목("모던 포트폴리오 웹"), 보조설명, 배포 URL, 아이콘을 입력하고 'NEW' 뱃지를 설정하여 저장한다.
* **3단계 [기존 기술 블로그 링크 정보 수정]**: 사용자는 최근 새로운 블로그 플랫폼(Velog)으로 이전한 사실을 반영하기 위해 '주요 채널' 섹션의 기존 블로그 링크 카드에 있는 '수정' 버튼을 누르고 최신 URL과 변경된 제목을 입력해 갱신한다.
* **4단계 [만료되거나 불필요한 링크 삭제]**: 사용자는 활동이 종료된 스터디 저장소 링크를 제거하여 방문자의 시선 분산을 막고 프로필의 전문성을 높이기 위해 해당 링크 카드의 '삭제' 버튼을 누르고 확인 팝업을 승인하여 삭제한다.
* **5단계 [링크 순서 및 카테고리 정돈]**: 사용자는 현재 구직 활동에서 가장 어필하고 싶은 프로젝트 섹션을 방문자의 첫 화면에 부각하기 위해 순서 정렬 기능을 활용해 '대표 프로젝트' 섹션을 상단으로 재배치한다.
* **6단계 [실시간 미리보기 및 LocalStorage 저장 검증]**: 사용자는 수정 및 정리된 전체 링크 목록이 모바일 화면에서 의도대로 완벽히 노출되는지 점검하기 위해 '미리보기' 모드로 전환하여 LocalStorage에 저장된 최종 화면을 확인한다.
* **7단계 [시연(Live Demo) 환경 데이터 초기화]**: 사용자는 발표 또는 시연 전 테스트로 입력했던 임시 데이터들을 말끔히 비우고 표준 템플릿으로 복원하기 위해 상단 글로벌 바의 '데이터 초기화' 버튼을 눌러 기본 Mock 데이터로 원복한다.

---

## 7. 기능 요구사항 명세 (Functional Requirements)

### 7.1 Phase 1: 시연용 핵심 프로필 페이지 (In Scope)

> [!TIP]
> **shadcn/ui 기반 컴포넌트 아키텍처 원칙**:
> 모든 핵심 인터랙션 및 프레젠테이션 요소는 `shadcn/ui`의 베이스 컴포넌트(`@/components/ui`)를 적극 활용하며, TDS(Toss Design System)의 고유 테마 변수(`globals.css`) 및 인터랙션을 확장하여 구현합니다.

| 기능 ID | 기능명 | 설명 (기반 컴포넌트) | 우선순위 |
| :--- | :--- | :--- | :--- :---: |
| **F-101** | 프로필 아바타 | 이미지 URL 지원 (이미지 부재 시 이니셜 기반 그라데이션 원형 아바타 - `Avatar`) | P0 |
| **F-102** | 이름 및 직무 뱃지 | 사용자 이름과 직무를 나타내는 TDS 스타일의 캡슐형 뱃지 - `Badge` (`blue-500` / `blue-50`) | P0 |
| **F-103** | 소개글 (Bio) | 친근한 톤앤매너(해요체)의 다중 줄 바꿈을 지원하는 자기소개 텍스트 렌더링 | P0 |
| **F-201** | 카테고리 섹션화 | 링크들을 주제별(주요 채널, 대표 프로젝트, 추천 글, 연락처)로 구분하는 헤더 및 설명 렌더링 | P0 |
| **F-202** | 리치 링크 카드 | 각 링크마다 `제목`, `보조설명`, `아이콘`, `URL` 제공 - `Card` 기반 컴포넌트 | P0 |
| **F-203** | 강조 뱃지(Badge) | 링크별 상태나 성격을 강조하는 뱃지 태그(`NEW`, `진행 중`, `코드` 등) - `Badge` | P0 |
| **F-204** | 인터랙션 모드 분기 | • 일반 링크: `target="_blank"` 새 창 열기 (`rel="noopener noreferrer"`)<br>• 복사 전용 링크: 클릭 시 클립보드에 복사하고 토스트 노출 | P0 |
| **F-205** | TDS 프레스 피드백 | 카드 터치/클릭 시 미세한 스케일 다운(`scale-[0.98]`)과 배경색 오버레이 제공 | P0 |
| **F-301** | 페이지 URL 복사 | 상단 공유 버튼 클릭 시 현재 페이지 URL 클립보드 복사 - `Button` | P0 |
| **F-302** | 시연용 QR 코드 모달 | 상단 QR 버튼 클릭 시 모바일 기기 스캔용 팝업 - `Dialog` / `Button` | P0 |
| **F-303** | TDS 플로팅 토스트 | 클립보드 복사 완료, 데이터 초기화 성공 시 하단 중앙에 다크 캡슐 토스트 2.4초간 노출 | P0 |
| **F-304** | LocalStorage 영속화 | Zustand `persist`를 통해 초기 Mock 데이터 자동 적재 및 브라우저 스토리지 유지 | P0 |
| **F-305** | 기본 데이터 초기화 | 시연 도중 데이터를 손쉽게 리셋할 수 있는 '초기화' 액션 - `Button` | P0 |

---

### 7.2 Phase 2 & 3: 고도화 기능 (Out of Scope for Demo)

> [!NOTE]
> 아래 기능들은 시연 완료 후 추가되는 고도화 단계의 요구사항입니다. 현재 구현하지 않습니다.

| 기능 ID | 분류 | 기능명 | 설명 | 상태 |
| :--- | :--- | :--- | :--- | :---: |
| **F-401** | 관리자 | 모의 로그인/회원가입 | LocalStorage 기반 클라이언트 세션 및 사용자 관리 | Phase 2 |
| **F-402** | 관리자 | 링크 인라인 추가/수정/삭제 | 팝업 폼을 통한 실시간 링크 항목 CRUD | Phase 2 |
| **F-501** | 대시보드 | 종합 관리 대시보드 | 프로필, 카테고리, 링크를 한곳에서 관리하는 백오피스 뷰 | Phase 3 |
| **F-502** | 통계/분석 | 링크 클릭 수 집계 | 각 링크 카드의 클릭 이벤트 로깅 및 누적 카운트 표시 | Phase 3 |
| **F-503** | 통계/분석 | 일자별 방문자 통계 차트 | 유입 및 방문 추이 시각화 차트 | Phase 3 |

---

## 8. 데이터 구조 및 LocalStorage 스키마

### 8.1 스토리지 키
* **`mylink_profile_data`**: 사용자의 프로필 정보와 카테고리별 링크 데이터 (JSON 객체)

### 8.2 데이터 모델 인터페이스 (`src/types/profile.ts`)
```typescript
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
  isCopyAction?: boolean; // 클릭 시 URL 이동 대신 해당 값(이메일 등) 복사
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
```

### 8.3 더미 데이터(Dummy Data) 및 Mock API 명세

시연(Demo) 및 독립적 프론트엔드 개발을 위해 표준 더미 데이터와 백엔드 Mock API를 구축하여 제공합니다.

* **더미 데이터 파일 (`src/data/mockData.json`)**:
  - **페르소나 반영**: 주니어 프론트엔드 개발자 '이지은'의 실제 커리어 프로필과 현실감 있는 링크 목록으로 구성.
  - **카테고리 구성**:
    1. `주요 채널 (channels)`: GitHub(기여도 뱃지), 기술 블로그 Velog(주간 연재 뱃지), LinkedIn
    2. `대표 프로젝트 (projects)`: 마이링크(HOT 뱃지), 미니 결제 스토어(NEW 뱃지), DevLens 익스텐션(버전 뱃지)
    3. `추천 글 & 아티클 (articles)`: Next.js 16 Server Actions 가이드, TDS 인터랙션 구현기, Container Queries 아티클
    4. `연락처 & 커피챗 (contacts)`: 이메일 문의(`isCopyAction: true`, 클릭 시 클립보드 복사), 오픈 카카오톡
  - **용도**:
    - 앱 최초 실행 시 Zustand `persist` 미들웨어를 통해 LocalStorage 초기값 자동 적재
    - 상단 글로벌 바의 '데이터 초기화' 버튼 클릭 시 기본 원본 상태 복원

* **백엔드 Mock API 엔드포인트 (`src/app/api/profile/route.ts`)**:
  - **HTTP Method / URL**: `GET /api/profile`
  - **응답 Envelope**: `ApiResponse<ProfileData>` 표준 RESTful 규격 적용
  - **시뮬레이션 기능**: 실제 네트워크 환경을 가정한 인위적 150ms 비동기 지연(Delay) 처리 및 캐시 무효화 헤더 제공
  - **추후 확장**: Phase 2의 인라인 링크 CRUD 작업 시 `POST`, `PUT`, `DELETE /api/links` Mock 핸들러로 점진 확장

---

## 9. 향후 단계별 구현 계획

* **Step 1 (현재 목표): 더미 데이터 및 LocalStorage 기반 프로필 페이지 완성**
  * `src/types/profile.ts`: 프로필 및 링크 인터페이스 정의 (완료)
  * `src/data/mockData.json`: 링크 목록 및 프로필 더미 데이터 파일 구축 (완료)
  * `src/app/api/profile/route.ts`: 백엔드 통신 시연용 Next.js Mock API Route Handler 구현 (완료)
  * `useProfileStore.ts`, `useUiStore.ts` (Zustand LocalStorage 연동 및 더미 데이터 로더)
  * shadcn/ui 베이스 컴포넌트(`Button`, `Card`, `Badge`, `Avatar`, `Dialog` 등) 기반 프로필 헤더, 카테고리별 리치 링크 카드, QR 모달, 토스트 UI 완성
  * 시연 테스트 및 빌드 검증
* **Step 2 (향후): 클라이언트 인증 및 인라인 링크 편집 인터페이스 추가 (shadcn/ui Form, Input, Dialog 활용)**
* **Step 3 (향후): 통계/분석 및 대시보드 뷰 개발 (shadcn/ui Chart, Table 활용)**

