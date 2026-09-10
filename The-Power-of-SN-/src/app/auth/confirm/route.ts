import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) return new NextResponse('Alamat website belum dikonfigurasi.', { status: 503 });
  if (hash && (type === 'signup' || type === 'recovery')) {
    const db = await createClient();
    const { error } = await db.auth.verifyOtp({ token_hash: hash, type });
    if (!error)
      return NextResponse.redirect(
        new URL(type === 'recovery' ? '/atur-password' : '/dashboard', origin),
      );
  }
  return NextResponse.redirect(new URL('/masuk?status=expired', origin));
}
