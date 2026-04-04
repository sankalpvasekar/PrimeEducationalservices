import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { title, subtitle, banner_url } = await req.json();

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const result = await query(
      'INSERT INTO exam_categories (title, subtitle, banner_url) VALUES ($1, $2, $3) RETURNING id',
      [title, subtitle || '', banner_url || '']
    );

    return NextResponse.json({ success: true, sectionId: (result as any)[0].id });
  } catch (err) {
    console.error('Admin Section Post Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { sectionId, title, subtitle } = await req.json();

    if (!sectionId || !title) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    await query(
      'UPDATE exam_categories SET title = $1, subtitle = $2 WHERE id = $3',
      [title, subtitle || '', sectionId]
    );

    return NextResponse.json({ success: true, message: 'Section updated successfully' });
  } catch (err) {
    console.error('Admin Section Patch Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
