'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      toast.success('Account created! Please login.');
      router.push('/login');
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
          <p className="text-[#A1887F] text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#5D4037] mb-1.5">Full Name</label>
            <input
              type="text" placeholder="Your full name" className="auth-input"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#5D4037] mb-1.5">Email Address</label>
            <input
              type="email" placeholder="you@example.com" className="auth-input"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#5D4037] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" className="auth-input pr-10"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" className="absolute right-3 top-3.5 text-[#A1887F]" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#5D4037] mb-1.5">Confirm Password</label>
            <input
              type="password" placeholder="Re-enter password" className="auth-input"
              value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading} className="auth-btn mt-2">
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} />Creating...</span> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-[#A1887F] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#C5A059] font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
