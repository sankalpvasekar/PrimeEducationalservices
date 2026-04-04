'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GraduationCap, Loader2, Mail, KeyRound, CheckCircle } from 'lucide-react';

type Step = 'email' | 'otp';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Enter a valid email'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('OTP sent! Check your email.');
      setStep('otp');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F5F2EA] to-[#FFFBF2] flex items-center justify-center p-4">
      <div className="auth-card">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#C5A059] p-3 rounded-2xl shadow-lg mb-3">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723]">
            {done ? 'Password Reset!' : step === 'email' ? 'Forgot Password' : 'Verify OTP'}
          </h1>
          <p className="text-[#A1887F] text-sm mt-1 text-center">
            {done ? 'Redirecting to login...' : step === 'email' ? 'Enter your email to receive an OTP' : `OTP sent to ${email}`}
          </p>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <CheckCircle className="text-green-500 w-16 h-16" />
            <p className="text-[#5D4037] font-semibold text-lg">Password reset successfully!</p>
            <p className="text-[#A1887F] text-sm">You can now login with your new password.</p>
          </div>
        ) : step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#5D4037] mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email" placeholder="you@example.com" className="auth-input pl-10"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
                <Mail size={16} className="absolute left-3 top-3.5 text-[#A1887F]" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} />Sending...</span> : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Step indicator */}
            <div className="flex items-center gap-2 text-xs text-[#A1887F] mb-2">
              <KeyRound size={14} />
              <span>Enter the 6-digit OTP from your email</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5D4037] mb-1.5">OTP Code</label>
              <input
                type="text" placeholder="6-digit OTP" maxLength={6} className="auth-input tracking-[0.5em] text-center text-xl font-bold"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5D4037] mb-1.5">New Password</label>
              <input
                type="password" placeholder="Min. 8 characters" className="auth-input"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5D4037] mb-1.5">Confirm Password</label>
              <input
                type="password" placeholder="Re-enter new password" className="auth-input"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} />Resetting...</span> : 'Reset Password'}
            </button>

            <button type="button" onClick={() => setStep('email')} className="w-full text-sm text-[#A1887F] hover:text-[#C5A059] transition-colors">
              ← Resend OTP
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[#A1887F] mt-6">
          Remember your password?{' '}
          <Link href="/login" className="text-[#C5A059] font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
