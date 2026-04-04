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

    const formData = await req.formData();
    const sectionId = formData.get('sectionId') as string;
    const type = formData.get('type') as string; // 'banner' or 'pdf'
    const title = formData.get('title') as string;
    const price = formData.get('price') as string;
    const file = formData.get('file') as File;

    if (!file || !sectionId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const base64File = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;

    console.log(`Uploading ${type} for section ${sectionId}...`);

    const uploadResponse = await cloudinary.uploader.upload(base64File, {
      folder: 'prime-edu',
      resource_type: type === 'pdf' ? 'auto' : 'image',
    });

    const fileUrl = uploadResponse.secure_url;

    if (type === 'banner') {
      await query('UPDATE exam_categories SET banner_url = $1 WHERE id = $2', [fileUrl, sectionId]);
      return NextResponse.json({ success: true, url: fileUrl, message: 'Banner updated!' });
    } else if (type === 'pdf') {
      await query(
        'INSERT INTO pdfs (section_id, title, price, cloudinary_url) VALUES ($1, $2, $3, $4)',
        [sectionId, title || file.name, price || 0, fileUrl]
      );
      return NextResponse.json({ success: true, url: fileUrl, message: 'PDF uploaded!' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    console.error('Upload Error:', err);
    return NextResponse.json({ error: 'Server error during upload' }, { status: 500 });
  }
}
