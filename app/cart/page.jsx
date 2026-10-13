"use client";
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CreditCard, Trash2, ShoppingBag, ShieldCheck, ArrowRight, Truck } from 'lucide-react';

export default function CartCheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // options: cod, visa
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', cardNumber: '', cardExpiry: '', cardCvc: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('zonix_cart_items');
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  const calculateSubtotal = () => cartItems.reduce((sum, item) => sum + (parseFloat(item.price_omr) * item.qty), 0);
  const handleQtyChange = (id, delta) => {
    const updated = cartItems.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item);
    setCartItems(updated);
    localStorage.setItem('zonix_cart_items', JSON.stringify(updated));
  };

  const handleRemoveItem = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('zonix_cart_items', JSON.stringify(updated));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("Your basket ledger is empty.");
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: formData, orderItems: cartItems, totalAmount: calculateSubtotal(), method: paymentMethod })
      });

      if (response.ok) {
        alert(paymentMethod === 'cod' ? "Order placed successfully via Cash on Delivery!" : "Visa Transaction Authorized successfully!");
        localStorage.removeItem('zonix_cart_items');
        setCartItems([]);
        window.location.href = '/';
      } else {
        alert("Transaction transmission failed. Check API loops.");
      }
    } catch (err) {
      alert(`Checkout Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen flex flex-col font-sans antialiased">
      <Header cartCount={cartItems.reduce((sum, item) => sum + item.qty, 0)} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 border-b pb-2"><ShoppingBag className="h-4 w-4 text-indigo-600" /> Core Basket Ledger</h2>
          {cartItems.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Your bag is empty.</div>
          ) : (
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white border p-4 rounded-xl flex items-center justify-between gap-4 shadow-xs">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border" />
                  <div className="flex-1 min-w-0"><h4 className="text-xs font-bold truncate text-slate-900">{item.name}</h4><div className="text-xs font-mono font-black text-indigo-600 mt-0.5">{(parseFloat(item.price_omr) * item.qty).toFixed(3)} OMR</div></div>
                  <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden"><button onClick={() => handleQtyChange(item.id, -1)} className="px-2 py-1 text-slate-400">-</button><span className="px-3 text-xs font-black text-slate-700">{item.qty}</span><button onClick={() => handleQtyChange(item.id, 1)} className="px-2 py-1 text-slate-400">+</button></div>
                  <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Billing Frame Side Console with Payment method selections */}
        <div className="bg-white border p-6 rounded-2xl shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-2">Checkout Gateway</h3>
          <form onSubmit={handleCheckoutSubmit} className="space-y-3">
            <div><label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Customer Name</label><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800 outline-none" placeholder="Full name" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Oman Mobile</label><input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800 outline-none" placeholder="+968" /></div>
              <div><label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email</label><input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800 outline-none" placeholder="email@domain.com" /></div>
            </div>
            <div><label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Delivery Address</label><input type="text" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800 outline-none" placeholder="City details" /></div>

            {/* Cash on Delivery & Visa Selection Radio System Matrix */}
            <div className="pt-2 border-t space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Select Preferred Payment Settlement Mode</span>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setPaymentMethod('cod')} className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-500/5' : 'bg-slate-50 border-slate-200'}`}>
                  <Truck className={`h-4 w-4 ${paymentMethod === 'cod' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider block mt-2">Cash on Delivery</span>
                </button>
                <button type="button" onClick={() => setPaymentMethod('visa')} className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${paymentMethod === 'visa' ? 'border-indigo-500 bg-indigo-500/5' : 'bg-slate-50 border-slate-200'}`}>
                  <CreditCard className={`h-4 w-4 ${paymentMethod === 'visa' ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider block mt-2">Visa / Debit Card</span>
                </button>
              </div>
            </div>

            {/* Conditional Visa input fields show up only when paymentMethod is selected as visa */}
            {paymentMethod === 'visa' && (
              <div className="p-3 bg-slate-50 border rounded-xl space-y-2 animate-in fade-in duration-200">
                <input type="text" required maxLength="16" value={formData.cardNumber} onChange={e => setFormData({ ...formData, cardNumber: e.target.value })} className="w-full bg-white border rounded-lg p-2 text-xs font-mono text-slate-800" placeholder="Card Number (16 Digits)" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" required maxLength="5" value={formData.cardExpiry} onChange={e => setFormData({ ...formData, cardExpiry: e.target.value })} className="w-full bg-white border rounded-lg p-2 text-xs font-mono" placeholder="MM/YY" />
                  <input type="text" required maxLength="3" value={formData.cardCvc} onChange={e => setFormData({ ...formData, cardCvc: e.target.value })} className="w-full bg-white border rounded-lg p-2 text-xs font-mono" placeholder="CVC" />
                </div>
              </div>
            )}

            <div className="pt-2 border-t flex justify-between items-center font-black text-slate-800">
              <span className="text-[10px] uppercase text-slate-400">Net Amount:</span>
              <span className="text-sm font-mono">{calculateSubtotal().toFixed(3)} OMR</span>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow">
              {loading ? "Processing Order Route..." : paymentMethod === 'cod' ? "Confirm Cash On Delivery Order" : "Authorize Card Settlement"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
