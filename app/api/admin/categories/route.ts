import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const categories = await query('SELECT id, title, subtitle, banner_url FROM exam_categories ORDER BY id ASC');

    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error('Admin Categories Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
