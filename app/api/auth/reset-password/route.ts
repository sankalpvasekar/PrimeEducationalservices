import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, otp, newPassword } = parsed.data;

    // Find valid OTP
    const otps = await query<{ id: number; is_used: boolean; expires_at: string }>(
      'SELECT * FROM otp_tokens WHERE email = $1 AND otp = $2 AND is_used = false ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otps.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const otpRecord = otps[0];
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 12);

    // Update password
    await query('UPDATE users SET password_hash = $1 WHERE email = $2', [password_hash, email]);

    // Mark OTP as used
    await query('UPDATE otp_tokens SET is_used = true WHERE id = $1', [otpRecord.id]);

    // Invalidate all sessions (force re-login)
    const users = await query<{ id: number }>('SELECT id FROM users WHERE email = $1', [email]);
    if (users.length > 0) {
      await query('UPDATE sessions SET is_active = false WHERE user_id = $1', [users[0].id]);
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
