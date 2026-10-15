"use client";
import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0b0f19] border-t border-slate-800/40 relative z-30">
      
      {/* PROFESSIONAL COMPACT GRAPHIC LINK FOOTER CONSOLE */}
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand Meta Identifier Group */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <span className="font-black text-xs tracking-wider text-white uppercase">
            Zonix<span className="text-[#ff4d00]">Mart</span>
          </span>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Secure Logistics Routing • Sultanate of Oman</p>
        </div>

        {/* Legal Static Copy Metrics Node */}
        <div className="text-center sm:text-right">
          <p className="text-[10px] text-slate-400 font-medium">
            © 2026 Zonix Mart Node. All Rights Reserved.
          </p>
          <p className="text-[9px] text-slate-600 font-mono mt-0.5">
            SSL Secure Encryption Protocol Matrix Active
          </p>
        </div>

      </div>

      {/* ⚠️ GLOBAL OVERRIDE RESOLUTION: Sticky bars and overlay buttons are completely removed from here 
          so they never create any accidental dynamic duplicate glitches anywhere across page view ports */}
    </footer>
  );
}
