import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sectionId } = await req.json();
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    // Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Success! Record purchase
    await query(
      'INSERT INTO purchases (user_id, section_id, payment_id, status) VALUES ($1, $2, $3, $4)',
      [payload.userId, sectionId, razorpay_payment_id, 'success']
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Payment Verification Error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
