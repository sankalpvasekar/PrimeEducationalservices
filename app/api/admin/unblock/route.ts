import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { z } from 'zod';

const schema = z.object({ userId: z.number() });

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });

    const { userId } = parsed.data;

    // Reset User Status
    await query(`
      UPDATE users 
      SET is_blocked = false, device_switch_count = 0 
      WHERE id = $1
    `, [userId]);

    // Cleanup Sessions (optional: allow user to start fresh)
    await query('UPDATE sessions SET is_active = false WHERE user_id = $1', [userId]);

    return NextResponse.json({ success: true, message: 'User unblocked and device count reset successfully' });
  } catch (err) {
    console.error('Unblock user error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
