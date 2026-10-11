"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, ShoppingBag, User, Menu, X, Heart, LogOut } from 'lucide-react';

export default function Header({ onSearch }) {
  const [searchVal, setSearchVal] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Real-time tracking user cloud state session
  useEffect(() => {
    async function getActiveUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getActiveUser();

    // Supabase auth subscription event trigger loop
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogoutAction = async () => {
    await supabase.auth.signOut();
    // Flush administrative lock tracking validation cookie parameters safely
    document.cookie = "zonix_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    alert("Logged out safely from Zonix Mart node network.");
    window.location.href = "/"; // Force total client side ecosystem state reload
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchVal);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Stylish Brand Identity Logo */}
        <Link href="/" className="flex-shrink-0 group relative">
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#4f46e5] via-[#ff4d00] to-[#f59e0b] bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-normal">
            ZONIX <span className="font-light text-white group-hover:text-[#4f46e5]">MART</span>
          </span>
          <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#4f46e5] to-[#ff4d00] transition-all duration-300 group-hover:w-full" />
        </Link>

        {/* Universal Search Layout Operations */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search electronics, luxury perfumes, cat products..."
            value={searchVal}
            onChange={(e) => { setSearchVal(e.target.value); if(onSearch) onSearch(e.target.value); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-full py-2.5 pl-5 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
          />
          <button type="submit" className="absolute right-2 top-1.5 p-1.5 text-slate-400 hover:text-amber-400">
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Navigation Array Links */}
        <nav className="hidden lg:flex items-center gap-8 font-semibold text-sm text-slate-300">
          <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link href="/category" className="hover:text-amber-400 transition-colors">Category</Link>
          <Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link>
          {user?.email === 'hasnainarain193@gmail.com' && (
            <Link href="/admin" className="text-amber-400 hover:underline">Panel Dashboard</Link>
          )}
        </nav>

        {/* User Identity Matrix Switcher Panel */}
        <div className="flex items-center gap-4">
          {user ? (
            /* Condition A: User is Logged-In -> Show clean profile layout and remove login button */
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-full shadow-inner animate-in fade-in duration-300">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#4f46e5] to-[#ff4d00] flex items-center justify-center text-[10px] font-black uppercase text-white shadow">
                {user.email[0]}
              </div>
              <span className="text-xs font-bold tracking-wide truncate max-w-[110px] text-slate-200">
                {user.user_metadata?.display_name || user.email.split('@')[0]}
              </span>
              <button onClick={handleLogoutAction} className="text-slate-400 hover:text-red-400 transition-colors border-l border-slate-800 pl-2 ml-1" title="Log Out">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            /* Condition B: No User Active session -> Fallback display default security button */
            <Link href="/login" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full text-xs font-bold border border-slate-700/60 transition-all shadow">
              <User className="h-4 w-4 text-amber-400" />
              <span>Login & Sign In</span>
            </Link>
          )}

          <Link href="/cart" className="relative p-2.5 hover:bg-slate-800 rounded-full transition-colors bg-slate-950/40 border border-slate-800/40">
            <ShoppingBag className="h-5 w-5 text-slate-200" />
          </Link>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Responsive mobile menu draw matrix mapping layout */}
      {mobileOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-4 space-y-4">
          <Link href="/" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/category" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileOpen(false)}>Category</Link>
          <Link href="/about" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileOpen(false)}>About Us</Link>
        </div>
      )}
    </header>
  );
}
