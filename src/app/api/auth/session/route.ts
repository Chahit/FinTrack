import { validateServerSession } from '@/lib/server/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await validateServerSession();

    if (!user) {
      return NextResponse.json({ session: null }, { status: 401 });
    }

    return NextResponse.json({
      session: {
        user,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}
