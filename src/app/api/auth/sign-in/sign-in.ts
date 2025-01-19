import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const result = await signIn(email, password);

  if (!result) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: result.user.id,
      email: result.user.email,
    },
    token: result.token,
  });
}
