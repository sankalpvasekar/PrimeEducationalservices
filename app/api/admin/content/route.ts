import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 });

  try {
    const rows = await query<{ content: string }>('SELECT content FROM site_content WHERE key = $1', [key]);
    return NextResponse.json({ content: rows[0]?.content || '' });
  } catch (err) {
    console.error('Fetch Content Error:', err);
    return NextResponse.json({ content: '' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, content } = await req.json();
    if (!key || content === undefined) return NextResponse.json({ error: 'Key and content required' }, { status: 400 });

    await query(
      `INSERT INTO site_content (key, content, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
      [key, content]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Save Content Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
