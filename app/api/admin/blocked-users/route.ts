export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Admin Session
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch Blocked Users
    const blockedUsers = await query(`
      SELECT id, name, email, device_switch_count, created_at 
      FROM users 
      WHERE is_blocked = true 
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ success: true, users: blockedUsers });
  } catch (err) {
    console.error('Fetch blocked users error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
