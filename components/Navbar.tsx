'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<{ isAdmin?: boolean } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Instant auth check
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      setIsLogged(!!token);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkAuth();
    
    // Listen for cross-tab or same-window authentication updates
    window.addEventListener('focus', checkAuth);
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Notify app of auth change
    window.dispatchEvent(new Event('auth-change'));

    // Call server-side logout to clear httpOnly cookie
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      setIsLogged(false);
      setIsOpen(false);
      toast.success('Sign out successful');
      router.push('/');
      router.refresh();
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-[#C5A059]/10 h-14">
      <div className="max-w-7xl mx-auto px-5 h-full flex justify-between items-center">
        {/* LOGO - SLIMMER */}
        <Link href={user?.isAdmin ? "/admin" : "/"} className="transition-opacity hover:opacity-80">
          <Image 
            src="/navbar.png" 
            alt="Logo" 
            width={150} 
            height={36} 
            priority 
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* DESKTOP MENU - COMPACT */}
        <div className="hidden md:flex items-center gap-5">
          {!isLogged ? (
            <>
              <Link href="/login" className="text-[13px] font-bold text-[#5D4037] hover:text-[#C5A059] transition-colors flex items-center gap-1.5">
                <LogIn size={16} /> Login
              </Link>
              <Link href="/register" className="px-4 py-1.5 bg-[#C5A059] text-white text-[13px] font-bold rounded-lg hover:bg-[#A68344] transition-all shadow-sm flex items-center gap-1.5">
                <UserPlus size={16} /> Register
              </Link>
            </>
          ) : (
            <>
              {user?.isAdmin && (
                <Link href="/admin" className="text-[13px] font-bold text-[#5D4037] hover:text-[#C5A059] transition-colors flex items-center gap-1.5">
                  <LayoutDashboard size={16} /> Admin Panel
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="text-[13px] font-bold text-[#A1887F] hover:text-red-500 transition-colors flex items-center gap-1.5 ml-3"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>

        {/* COMPACT HAMBURGER (MOBILE) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-1.5 text-[#5D4037] hover:bg-[#C5A059]/5 rounded-md transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* COMPACT SLIDE-DOWN MENU (MOBILE) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-0 right-0 bg-[#FFFBF2] border-b border-[#C5A059]/20 shadow-2xl md:hidden overflow-hidden"
          >
            <div className="p-5 flex flex-col gap-4">
              {!isLogged ? (
                <>
                  <Link 
                    href="/login" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#C5A059]/10 text-sm font-bold text-[#3E2723]"
                  >
                    <LogIn size={20} className="text-[#C5A059]" /> Login
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#C5A059] text-sm font-bold text-white shadow-lg"
                  >
                    <UserPlus size={20} /> Create New Account
                  </Link>
                </>
              ) : (
                <>
                  {user?.isAdmin && (
                    <Link 
                      href="/admin" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#C5A059]/10 text-sm font-bold text-[#3E2723]"
                    >
                      <LayoutDashboard size={20} className="text-[#C5A059]" /> Executive Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-sm font-bold text-red-500 border border-red-100"
                  >
                    <LogOut size={20} /> Logout Securely
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
