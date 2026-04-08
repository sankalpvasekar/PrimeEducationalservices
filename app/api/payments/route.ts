import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const { sectionId, action } = await req.json();
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Please login to purchase' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    // Fetch section price
    const sections = await query<{ price: number }>('SELECT price FROM exam_categories WHERE id = $1', [sectionId]);
    if (sections.length === 0) return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    const price = sections[0].price || 499.00;

    // Mock/Sandbox Mode if keys are not set
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('RAZORPAY keys missing, simulating success');
      
      // Simulate success immediately
      await query(
        'INSERT INTO purchases (user_id, section_id, payment_id, amount, status) VALUES ($1, $2, $3, $4, $5)',
        [payload.userId, sectionId, 'MOCK_PAYMENT_' + Date.now(), price, 'success']
      );

      return NextResponse.json({ success: true, message: 'Simulation: Purchase successful!' });
    }

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    if (action === 'create-order') {
       const options = {
         amount: Math.round(price * 100), // Price in paise
         currency: 'INR',
         receipt: `receipt_${payload.userId}_${sectionId}`,
       };
       const order = await rzp.orders.create(options);
       return NextResponse.json({ success: true, order });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Payment Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
