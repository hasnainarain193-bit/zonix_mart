"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Heart, Search, User, LogOut, Home, ClipboardList } from 'lucide-react';

export default function Header({ cartCount, isHomePage = false, searchQuery, setSearchQuery }) {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const customerName = user.user_metadata?.full_name || user.email.split('@')[0];
        setCustomer({ name: customerName, email: user.email, id: user.id });
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const customerName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
        setCustomer({ name: customerName, email: session.user.email, id: session.user.id });
      } else {
        setCustomer(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
    window.location.href = '/';
  };

  return (
    <header className="w-full bg-[#dbdcdf] text-slate-800 sticky top-0 z-50 shadow-md border-b border-slate-300">
      <div className="max-w-[1400px] mx-auto px-4 py-3 md:py-0 md:h-16 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        
        {/* Logo and Universal Navigation */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => window.location.href = '/'}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#ff4d00] to-[#ffaa00] flex items-center justify-center shadow">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-[#0b0f19] uppercase">
              Zonix<span className="text-[#ff4d00]">Mart</span>
            </span>
          </div>

          {/* Universal Route Action Tokens */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.location.href = '/'}
              className="p-2 hover:bg-slate-800/10 rounded-xl transition-all flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-700"
              title="Go to Homepage"
            >
              <Home className="w-4 h-4 text-[#ff4d00]" />
              <span className="hidden sm:inline">Home</span>
            </button>

            {customer && (
              <button 
                onClick={() => window.location.href = '/my-orders'}
                className="p-2 hover:bg-slate-800/10 rounded-xl transition-all flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-700 border border-slate-400/30 bg-white/40"
                title="View My Purchases"
              >
                <ClipboardList className="w-4 h-4 text-[#ffaa00]" />
                <span>My Orders</span>
              </button>
            )}
          </div>

          {/* Mobile Cart/Wishlist Icons */}
          <div className="flex items-center gap-3 md:hidden ml-auto">
            <div className="relative cursor-pointer" onClick={() => window.location.href = '/cart'}>
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#ff4d00] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Search Box Wrapper */}
        {isHomePage ? (
          <div className="w-full md:flex flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Products..."
              className="w-full px-4 py-2 bg-[#0b0f19] border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#ff4d00] text-slate-200 placeholder-slate-400"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-rose-500 font-bold text-[10px] hover:underline bg-transparent border-0 cursor-pointer">
                Clear
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 max-w-md hidden md:block"></div>
        )}

        {/* Desktop Controls Framework */}
        <div className="flex items-center gap-4 text-slate-700 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-800/5 px-3 py-1.5 rounded-xl border border-slate-800/10 select-none w-full md:w-auto justify-between md:justify-start">
            {customer ? (
              <div className="flex items-center gap-2 w-full justify-between md:justify-start">
                <div className="flex items-center gap-2">
                  {isHomePage && customer.email === 'hasnainarain193@gmail.com' && (
                    <button
                      type="button"
                      onClick={() => window.location.href = '/admin'}
                      className="bg-[#ff4d00] hover:bg-[#ffaa00] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded transition-all shadow-sm"
                    >
                      Panel Dashboard
                    </button>
                  )}
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    Hi, <span className="text-[#ff4d00] capitalize">{customer.name}</span>
                  </span>
                </div>
                <button type="button" onClick={handleSignOut} className="p-1 text-slate-500 hover:text-rose-600 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => window.location.href = '/login'}
                className="flex items-center gap-1.5 bg-[#ff4d00] hover:bg-[#ffaa00] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-sm w-full justify-center md:w-auto"
              >
                <User className="w-3.5 h-3.5" /> Login
              </button>
            )}
          </div>

          <div className="relative cursor-pointer select-none hidden md:block text-slate-700" onClick={() => window.location.href = '/cart'}>
            <ShoppingCart className="w-5 h-5 hover:text-[#ff4d00] transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#ff4d00] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
