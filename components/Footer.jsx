"use client";
import React from 'react';
import { MessageCircle, ShoppingBag, ShieldCheck, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const triggerWhatsAppSupport = () => {
    // Advanced chat support link routing configurations across Oman bounds
    window.open("https://wa.me.", "_blank");
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 pt-16 pb-28 relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Profile Branding Module */}
        <div className="space-y-4">
          <span className="text-xl font-black text-white tracking-widest">ZONIX MART</span>
          <p className="text-sm text-slate-500 leading-relaxed">
            Big Brands. Smart Savings. Ultimate Choices. Your premier multi-category digital portal across Oman bounds. Delivering authentic electronics, fragrances, and elite pet care products.
          </p>
        </div>

        {/* Legal Parameters & Policy Routes Mapping */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Corporate Guidelines</h4>
          <ul className="space-y-2.5 text-sm font-medium">
            <li><a href="/privacy" className="hover:text-amber-400 transition-colors block text-slate-500 hover:text-white">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-amber-400 transition-colors block text-slate-500 hover:text-white">Terms & Conditions</a></li>
            <li><a href="/returns" className="hover:text-amber-400 transition-colors block text-slate-500 hover:text-white">Return / Refund Policy</a></li>
          </ul>
        </div>

        {/* Corporate Address & Support Anchor details */}
        <div className="space-y-3 text-sm text-slate-500">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Oman Head Office</h4>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" /> Al Ansab, Muscat, Oman</p>
          <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-orange-500 flex-shrink-0" /> support@zonixmart.com</p>
          <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" /> SSL Secured & Encrypted Platform</p>
        </div>
      </div>

      {/* Floating Action Controller Block (Strictly maps user alignment parameters) */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800/80 px-4 py-3.5 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left Side Allocation: Custom WhatsApp Stream Anchor */}
          <button 
            onClick={triggerWhatsAppSupport}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-full shadow-xl shadow-emerald-950/40 transition-all transform active:scale-95"
          >
            <MessageCircle className="h-5 w-5 fill-white text-emerald-600" />
            <span>WhatsApp Support</span>
          </button>

          {/* Right Side Allocation: Standard Action Cart array trigger */}
          <a 
            href="/cart"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-xl shadow-orange-950/40 transition-all transform active:scale-95"
          >
            <ShoppingBag className="h-4 w-4 text-slate-950" />
            <span>Add to Cart / View</span>
          </a>

        </div>
      </div>
    </footer>
  );
}
