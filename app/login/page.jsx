"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LogIn, UserPlus, KeyRound } from 'lucide-react';

export default function UniversalAuthPage() {
  const [viewMode, setViewMode] = useState('login'); // login, register, forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (viewMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        alert(`Login Error: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data?.user?.email === 'hasnainarain193@gmail.com') {
        document.cookie = "zonix_admin_auth=authorized_hasnainarain193; path=/; max-age=86400; SameSite=Strict";
        alert("Welcome Back Admin! Refreshing control routing framework nodes...");
        window.location.href = "/"; // Hardware level system refresh and strict administrative route redirect
      } else {
        alert("Login Successful! Syncing ecosystem nodes grid...");
        window.location.href = "/"; // Direct automatic refresh landing to home storefront matrix
      }
    } 
    
    else if (viewMode === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { display_name: fullName }
        }
      });

      if (error) {
        alert(`Registration Error: ${error.message}`);
        setLoading(false);
        return;
      }

      alert("Account generated successfully! Dispatching user data properties...");
      window.location.href = "/"; // Instant hardware execution auto-redirect parameter loop
    } 
    
    else if (viewMode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'http://localhost:3000/reset-password',
      });
      if (error) alert(`Error: ${error.message}`);
      else alert("Password reset link dispatched safely to email node directory!");
    }

    setLoading(false);
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-white border border-[#e2e8f0] p-8 rounded-2xl max-w-md w-full shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-[#0f172a] uppercase">
            {viewMode === 'login' && "Zonix Portal"}
            {viewMode === 'register' && "Create Account"}
            {viewMode === 'forgot' && "Reset Security"}
          </h2>
          <p className="text-xs text-[#4f46e5] uppercase tracking-wider font-bold">
            {viewMode === 'login' && "Secure Customer & Admin Gate"}
            {viewMode === 'register' && "Join Zonix Mart Smart Shopping"}
            {viewMode === 'forgot' && "Password recovery console"}
          </p>
        </div>

        <form onSubmit={handleAuthAction} className="space-y-4">
          {viewMode === 'register' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#64748b] mb-1">Full Name</label>
             <input
                type="text"
                 required
                 value={fullName}
                 onChange={(e) => setFullName(e.target.value)}
                 className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:border-[#4f46e5] outline-none shadow-inner text-sm disabled:opacity-50"
                 placeholder="Your Name"
                 disabled={loading}
               />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#64748b] mb-1">Email Address</label>
            
            <input
             type="email"
             required
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:border-[#4f46e5] outline-none shadow-inner text-sm disabled:opacity-50"
             placeholder="name@example.com"
             disabled={loading}
             />

          </div>

          {viewMode !== 'forgot' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#64748b] mb-1">Account Password</label>
              <input
                type="password"
                required
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:border-[#4f46e5] outline-none shadow-inner text-sm disabled:opacity-50"
                 placeholder="••••••••"
                 disabled={loading}
                 />
                 
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#0f172a] hover:bg-[#4f46e5] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors shadow flex items-center justify-center gap-2">
            {viewMode === 'login' && <LogIn className="h-4 w-4" />}
            {viewMode === 'register' && <UserPlus className="h-4 w-4" />}
            {viewMode === 'forgot' && <KeyRound className="h-4 w-4" />}
            <span>
              {loading ? "Synchronizing..." : ""}
              {!loading && viewMode === 'login' && "Verify & Enter"}
              {!loading && viewMode === 'register' && "Register Now"}
              {!loading && viewMode === 'forgot' && "Send Reset Link"}
            </span>
          </button>
        </form>
        <div className="pt-4 border-t border-[#f1f5f9] flex flex-col gap-2.5 text-center text-xs text-[#64748b]">
          {viewMode === 'login' && (
            <>
              <button type="button" onClick={() => setViewMode('register')} className="hover:text-[#4f46e5] font-semibold transition-colors">
                New to Zonix Mart? <span className="text-[#4f46e5] underline">Create an Account</span>
              </button>
              <button type="button" onClick={() => setViewMode('forgot')} className="text-[11px] text-red-500/80 hover:text-red-600 transition-colors mt-1 font-medium">
                Forgot your secure portal password?
              </button>
            </>
          )}

          {viewMode === 'register' && (
            <button type="button" onClick={() => setViewMode('login')} className="hover:text-[#4f46e5] font-semibold transition-colors">
              Already registered? <span className="text-[#4f46e5] underline">Login Here</span>
            </button>
          )}

          {viewMode === 'forgot' && (
            <button type="button" onClick={() => setViewMode('login')} className="hover:text-[#4f46e5] font-semibold transition-colors">
              Return back to <span className="text-[#4f46e5] underline">Login Panel</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
