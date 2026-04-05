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

    const url = new URL(req.url);
    const sectionId = url.searchParams.get('sectionId');

    if (!sectionId) return NextResponse.json({ error: 'Section ID required' }, { status: 400 });

    const pdfs = await query('SELECT id, title, price, cloudinary_url, created_at FROM pdfs WHERE section_id = $1 ORDER BY created_at DESC', [sectionId]);

    return NextResponse.json({ success: true, pdfs });
  } catch (err) {
    console.error('Admin PDF List Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { pdfId } = await req.json();
    if (!pdfId) return NextResponse.json({ error: 'PDF ID required' }, { status: 400 });

    await query('DELETE FROM pdfs WHERE id = $1', [pdfId]);

    return NextResponse.json({ success: true, message: 'PDF deleted successfully' });
  } catch (err) {
    console.error('Admin PDF Delete Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
