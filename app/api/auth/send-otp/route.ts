import { NextRequest, NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';
import { sendOTPEmail } from '@/lib/mailer';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { email } = parsed.data;

    // Check user exists
    const users = await query<{ name: string }>('SELECT name FROM users WHERE email = $1', [email]);
    if (users.length === 0) {
      // Return success anyway to prevent email enumeration
      return NextResponse.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    const name = users[0].name;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Invalidate previous OTPs
    await query('UPDATE otp_tokens SET is_used = true WHERE email = $1', [email]);

    // Store new OTP
    await query(
      'INSERT INTO otp_tokens (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    // Send email
    await sendOTPEmail(email, otp, name);

    return NextResponse.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
