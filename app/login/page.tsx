'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, GraduationCap, Loader2, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');

  const getOrCreateDeviceId = () => {
    let id = localStorage.getItem('device_id');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('device_id', id); }
    return id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    setWarning('');
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, deviceId }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'ACCOUNT_BLOCKED') {
          toast.error(data.error, { duration: 6000 });
        } else {
          throw new Error(data.error || 'Login failed');
        }
        return;
      }

      // Store token
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.warning) {
        setWarning(data.warning);
        toast(data.warning, { icon: '⚠️', duration: 5000 });
      }

      toast.success(`Welcome back, ${data.user.name}!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F5F2EA] to-[#FFFBF2] flex items-center justify-center p-4">
      <div className="auth-card">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#C5A059] p-3 rounded-2xl shadow-lg mb-3">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723]">Prime Educational</h1>
          <p className="text-[#A1887F] text-sm mt-1">Sign in to your account</p>
        </div>

        {warning && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{warning}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#5D4037] mb-1.5">Email Address</label>
            <input
              type="email" placeholder="you@example.com" className="auth-input"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-semibold text-[#5D4037]">Password</label>
              <Link href="/forgot-password" className="text-xs text-[#C5A059] hover:underline font-medium">Forgot Password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} placeholder="Your password" className="auth-input pr-10"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" className="absolute right-3 top-3.5 text-[#A1887F]" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn mt-2">
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} />Logging in...</span> : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-[#A1887F] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#C5A059] font-semibold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
