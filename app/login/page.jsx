"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, ShieldCheck, Mail, Lock, User, Phone, ArrowRight, KeyRound } from 'lucide-react';

export default function LoginPage() {
  // Modes: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        window.location.href = '/';
      }
    };
    checkUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // FREE GOOGLE SECURE OAUTH GATEWAY
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, 
        },
      });
      if (error) throw error;
    } catch (err) {
      alert(`Google Auth Alert: ${err.message}`);
      setGoogleLoading(false);
    }
  };

  // SECURE AUTHENTICATION PROCESSING CONSOLE
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        alert("Login successful!");
        window.location.href = '/';

      } else if (authMode === 'register') {
        if (!formData.name || !formData.phone) {
          throw new Error("Please fulfill all customer registration fields.");
        }
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              phone_number: formData.phone,
            }
          }
        });
        if (error) throw error;
        alert("Registration successful! You can now login.");
        setAuthMode('login');

      } else if (authMode === 'forgot') {
        // FIXED ACTION: Secure functional Password Reset Recovery email dispatch matrix
        if (!formData.email) throw new Error("Please enter your registered email address.");
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        alert("Secure reset link has been dispatched to your email ledger!");
        setAuthMode('login');
      }
    } catch (err) {
      alert(`Authentication Gateway Alert: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen flex items-center justify-center font-sans antialiased p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-200 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-10 transition-all">
        <div className="bg-[#0b0f19] p-6 text-center border-b border-slate-800 relative">
          <div className="flex items-center justify-center gap-2 mb-2 select-none cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#ff4d00] to-[#ffaa00] flex items-center justify-center shadow">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-white uppercase">
              Zonix<span className="text-[#ff4d00]">Mart</span>
            </span>
          </div>
          <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
            {authMode === 'login' && 'Secure Customer & Admin Gate'}
            {authMode === 'register' && 'Customer Account Registration'}
            {authMode === 'forgot' && 'Account Password Reset Recovery'}
          </p>
        </div>

        <div className="p-6 md:p-8">
          
          {authMode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm mb-4"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.77-2.4 3.62v3h3.86c2.26-2.09 3.67-5.17 3.67-8.47z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.12C3.26 22.27 7.4 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.59H1.29C.47 8.24 0 10.07 0 12s.47 3.76 1.29 5.41l3.98-3.12z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.4 0 3.26 1.73 1.29 4.88l3.98 3.12c.95-2.85 3.6-4.96 6.73-4.96z"/>
                </svg>
                {googleLoading ? "Connecting to Google Matrix..." : "Continue with Google"}
              </button>

              <div className="relative flex py-2 items-center mb-2">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or email gateway</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>
            </>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:border-[#ff4d00] focus:bg-white transition-all"
                      placeholder="Enter your full name"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Oman Mobile Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:border-[#ff4d00] focus:bg-white transition-all"
                      placeholder="+968 XXXXXXXX"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:border-[#ff4d00] focus:bg-white transition-all"
                  placeholder="email@domain.com"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {authMode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Account Password</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-[10px] font-bold text-slate-400 hover:text-[#ff4d00] transition-colors outline-none"
                    >
                      Forgot secure password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                  placeholder="••••••••••••"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          {/* Submit Action Button Block */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-[#ff4d00] text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow mt-4"
          >
            {loading ? (
              <span>Validating Matrix...</span>
            ) : (
              <>
                {authMode === 'login' && <span>Verify & Enter</span>}
                {authMode === 'register' && <span>Register Customer Details</span>}
                {authMode === 'forgot' && <span>Dispatch Recovery Link</span>}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Flexible Navigation Link Options */}
        <div className="mt-6 text-center border-t border-slate-100 pt-4 space-y-2">
          {authMode === 'login' && (
            <p className="text-xs text-slate-500">
              New to Zonix Mart?{' '}
              <button type="button" onClick={() => setAuthMode('register')} className="font-bold text-[#ff4d00] hover:underline">
                Create an Account
              </button>
            </p>
          )}
          {authMode === 'register' && (
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <button type="button" onClick={() => setAuthMode('login')} className="font-bold text-[#ff4d00] hover:underline">
                Sign In Gateway
              </button>
            </p>
          )}
          {authMode === 'forgot' && (
            <p className="text-xs text-slate-500">
              Remembered credentials?{' '}
              <button type="button" onClick={() => setAuthMode('login')} className="font-bold text-[#ff4d00] hover:underline">
                Back to Login Gate
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Footer Security Badging Area */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        <ShieldCheck className="w-4 h-4 text-emerald-600" /> SSL Secured & Encrypted Platform
      </div>

    </div>
  </div>
);
}
