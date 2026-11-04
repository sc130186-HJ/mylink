import { NextResponse } from 'next/server';
import mockData from '@/data/mockData.json';
import { ApiResponse, ProfileData } from '@/types/profile';

/**
 * GET /api/profile
 * 마이링크 프로필 및 링크 목록 데이터 조회 Mock API
 */
export async function GET() {
  // 실제 네트워크 지연 효과 시뮬레이션 (150ms)
  await new Promise((resolve) => setTimeout(resolve, 150));

  const response: ApiResponse<ProfileData> = {
    success: true,
    statusCode: 200,
    message: '프로필 및 링크 목록 데이터를 성공적으로 조회했습니다.',
    data: mockData as ProfileData,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
