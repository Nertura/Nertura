import { NextResponse } from 'next/server';

/**
 * @deprecated Removed — use POST /api/ai/doctor (Intelligence Engine).
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Bu uç nokta kaldırıldı. Lütfen AI Tarım Doktoru API’sini kullanın.',
      migratedTo: '/api/ai/doctor',
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Bu uç nokta kaldırıldı.',
      migratedTo: '/api/ai/doctor',
    },
    { status: 410 }
  );
}
