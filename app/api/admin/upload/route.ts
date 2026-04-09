import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { sectionId, type, title, price, fileUrl } = body;

    if (!fileUrl || !sectionId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    console.log(`Saving ${type} info for section ${sectionId}...`);

    if (type === 'banner') {
      await query('UPDATE exam_categories SET banner_url = $1 WHERE id = $2', [fileUrl, sectionId]);
      return NextResponse.json({ success: true, url: fileUrl, message: 'Banner updated!' });
    } else if (type === 'pdf') {
      await query(
        'INSERT INTO pdfs (section_id, title, cloudinary_url) VALUES ($1, $2, $3)',
        [sectionId, title || 'Untitled', fileUrl]
      );
      return NextResponse.json({ success: true, url: fileUrl, message: 'PDF uploaded!' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    console.error('Upload Error:', err);
    return NextResponse.json({ error: 'Server error during upload store' }, { status: 500 });
  }
}
