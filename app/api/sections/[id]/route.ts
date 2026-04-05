export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sectionId = parseInt(id);
    if (isNaN(sectionId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    // 1. Fetch Section Details
    const sections = await query<{
      id: number;
      title: string;
      subtitle: string;
      description: string;
      banner_url: string;
    }>('SELECT * FROM exam_categories WHERE id = $1', [sectionId]);

    if (sections.length === 0) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

    const section = sections[0];

    // 2. Fetch PDFs for this section
    const pdfs = await query<{
      id: number;
      title: string;
      price: number;
      cloudinary_url: string;
    }>('SELECT id, title, price FROM pdfs WHERE section_id = $1', [sectionId]);

    // 3. Check for User Purchase (if logged in)
    let isPurchased = false;
    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const purchases = await query('SELECT id FROM purchases WHERE user_id = $1 AND section_id = $2', [payload.userId, sectionId]);
        isPurchased = purchases.length > 0;
      }
    }

    return NextResponse.json({
      success: true,
      section,
      pdfs,
      isPurchased
    });
  } catch (err) {
    console.error('Section fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
