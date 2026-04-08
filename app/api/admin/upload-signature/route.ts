import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'prime-edu' },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      success: true,
      timestamp,
      signature,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY
    });
  } catch (err) {
    console.error('Signature Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
