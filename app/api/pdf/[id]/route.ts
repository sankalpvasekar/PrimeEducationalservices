import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pdfId = parseInt(id);
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // 1. Fetch PDF and its Section
    const pdfs = await query<{
      section_id: number;
      title: string;
      cloudinary_url: string;
    }>(`
      SELECT p.*, c.id as section_id 
      FROM pdfs p 
      JOIN exam_categories c ON p.section_id = c.id 
      WHERE p.id = $1
    `, [pdfId]);

    if (pdfs.length === 0) return NextResponse.json({ error: 'PDF not found' }, { status: 404 });

    const pdf = pdfs[0];

    // 2. Verify Purchase
    const purchases = await query('SELECT id FROM purchases WHERE user_id = $1 AND section_id = $2', [payload.userId, pdf.section_id]);
    
    // Admin bypass: Admins can view everything
    const isAdminResult = await query('SELECT is_admin FROM users WHERE id = $1', [payload.userId]);
    const isAdmin = isAdminResult[0]?.is_admin || false;

    if (purchases.length === 0 && !isAdmin) {
      return NextResponse.json({ error: 'Access denied: Please purchase this section' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      url: pdf.cloudinary_url,
      title: pdf.title,
      user: { name: payload.name || 'Student', email: payload.email }
    });
  } catch (err) {
    console.error('PDF Access Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
