import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, initDB } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, password, deviceId: clientDeviceId } = parsed.data;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 🛡️ Log for diagnosis (masked credentials)
    console.log(`🔐 Login attempt: ${cleanEmail}`);

    // 🛡️ Manual Env Loader Check (Ensures credentials match .env.local even if process.env is stale)
    // Note: Standard Next.js handles this, but keeping logic for persistence using dynamic imports if needed, 
    // but standard process.env is usually sufficient after a restart.
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        console.warn('📡 ADMIN credentials missing in process.env');
    }

    // 0. CHECK SUPERUSER OVERRIDE (Environment Variable Priority)
    const envAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envAdminPass = process.env.ADMIN_PASSWORD?.trim();

    if (envAdminEmail && envAdminPass && cleanEmail === envAdminEmail && cleanPassword === envAdminPass) {
      console.log('🛡️ Superuser Authentication Detected (Env Identity Match)');
      
      // Ensure sync happened (though it usually happens on startup)
      await initDB();

      // Refetch to get correct ID
      const adminUsers = await query<{id: number; email: string}>('SELECT id, email FROM users WHERE email = $1', [cleanEmail]);
      const admin = adminUsers[0];

      if (!admin) {
        console.error('❌ Superuser sync failed or user not found in DB after env match.');
        throw new Error('Superuser record missing in DB');
      }

      // Generate session for Superuser
      const deviceId = clientDeviceId || uuidv4();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const token = signToken({ userId: admin.id, email: admin.email, name: 'Super Admin', isAdmin: true, deviceId });

      await query('UPDATE sessions SET is_active = false WHERE user_id = $1', [admin.id]);
      await query(
        'INSERT INTO sessions (user_id, token, device_id, is_active, expires_at) VALUES ($1, $2, $3, true, $4)',
        [admin.id, token, deviceId, expiresAt]
      );

      const response = NextResponse.json({
        success: true,
        token,
        deviceId,
        user: { id: admin.id, name: 'Super Admin', email: admin.email, isAdmin: true },
        message: 'Superuser Access Granted (Env-Sync Active)',
      });

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    // 1. Regular DB-based login flow...
    const users = await query<{
      id: number; name: string; email: string; password_hash: string;
      is_admin: boolean; is_blocked: boolean; device_switch_count: number;
    }>('SELECT * FROM users WHERE email = $1', [cleanEmail]);

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = users[0];

    // 2. Check if blocked
    if (user.is_blocked) {
      return NextResponse.json({
        error: 'Account blocked due to suspicious activity (too many device switches). Contact support.',
        code: 'ACCOUNT_BLOCKED'
      }, { status: 403 });
    }

    // 3. Check password
    const valid = await bcrypt.compare(cleanPassword, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 4. Device tracking
    const deviceId = clientDeviceId || uuidv4();

    // Check if user already has an active session on a DIFFERENT device
    const activeSessions = await query<{ device_id: string }>(
      'SELECT device_id FROM sessions WHERE user_id = $1 AND is_active = true AND expires_at > NOW() LIMIT 1',
      [user.id]
    );

    let deviceSwitched = false;
    // Only apply device-switch limits to non-admin users
    if (!user.is_admin && activeSessions.length > 0 && activeSessions[0].device_id !== deviceId) {
      deviceSwitched = true;
      const newCount = user.device_switch_count + 1;

      if (newCount >= 3) {
        // Block the account
        await query('UPDATE users SET is_blocked = true, device_switch_count = $1 WHERE id = $2', [newCount, user.id]);
        // Invalidate all sessions
        await query('UPDATE sessions SET is_active = false WHERE user_id = $1', [user.id]);
        return NextResponse.json({
          error: 'Account blocked: You have switched devices too many times. Contact support to unblock.',
          code: 'ACCOUNT_BLOCKED'
        }, { status: 403 });
      }

      await query('UPDATE users SET device_switch_count = $1 WHERE id = $2', [newCount, user.id]);
    }

    // 5. Invalidate ALL previous sessions (single device login)
    await query('UPDATE sessions SET is_active = false WHERE user_id = $1', [user.id]);

    // 6. Create new session
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const token = signToken({ userId: user.id, email: user.email, name: user.name, isAdmin: user.is_admin, deviceId });

    await query(
      'INSERT INTO sessions (user_id, token, device_id, is_active, expires_at) VALUES ($1, $2, $3, true, $4)',
      [user.id, token, deviceId, expiresAt]
    );

    const response = NextResponse.json({
      success: true,
      token,
      deviceId,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin },
      warning: deviceSwitched ? 'You have been logged out from your previous device.' : null,
    });

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
