"use client";
import React from 'react';
import { ShoppingBag, Shield, Search, Home, Info, LogOut } from 'lucide-react';

export default function Header({ onSearch, cartCount }) {
  return (
    <header className="bg-[#0b0f19] text-white border-b border-slate-800 shadow-xl sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand identity matrix */}
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => window.location.href='/'}>
          <div className="p-2 bg-gradient-to-r from-[#ff4d00] to-[#ff7700] rounded-xl text-white font-black text-xs tracking-tighter shadow-lg shadow-orange-950/20">ZM</div>
          <span className="text-base font-black tracking-tighter uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent block">ZONIX MART</span>
        </div>

        {/* Global Realtime Search Filter Pipeline */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <input 
            type="text" 
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full bg-[#111827] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-[#ff4d00] font-medium shadow-inner"
            placeholder="Search electronics, luxury perfumes, cat products..." 
          />
          <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* Action Routes Layout Anchors */}
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
          <button type="button" onClick={() => window.location.href='/'} className="p-2 text-slate-400 hover:text-white transition-colors hidden lg:flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> Home
          </button>
          <button type="button" onClick={() => window.location.href='/admin'} className="p-2.5 bg-[#111827] hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all border border-slate-700/40 flex items-center gap-1.5 shadow-sm">
            <Shield className="h-3.5 w-3.5 text-amber-500" /> <span>Panel Dashboard</span>
          </button>

          {/* User Session profile chip tracker element */}
          <div className="hidden sm:flex items-center gap-2 bg-[#1e293b]/60 border border-slate-700/40 px-3 py-1.5 rounded-xl">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white">H</div>
            <span className="text-[11px] text-slate-300 font-bold lowercase">hasnainarain193</span>
          </div>
          
          <button type="button" onClick={() => window.location.href='/cart'} className="p-2.5 bg-gradient-to-r from-[#ff4d00] to-[#ff7700] hover:brightness-110 text-white font-black rounded-xl flex items-center gap-2 shadow-lg relative transition-all active:scale-95">
            <ShoppingBag className="h-4 w-4" />
            <span className="font-mono text-xs bg-slate-950/40 px-1.5 py-0.5 rounded-md">{cartCount || 0}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
