export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const orders = await query(`
      SELECT 
        o.id, 
        o.payment_id as order_id, 
        u.name as customer_name, 
        u.email as customer_email, 
        c.title as section_title, 
        COALESCE(o.amount, c.price) as amount, 
        o.status, 
        o.created_at
      FROM purchases o
      JOIN users u ON o.user_id = u.id
      JOIN exam_categories c ON o.section_id = c.id
      ORDER BY o.created_at DESC
    `);

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error('Admin Orders Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
