"use client";
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer'; 
import { CreditCard, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CartCheckoutPage() {
  const [cartLedger, setCartLedger] = useState({});
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', address: '',
    cardNumber: '', cardExpiry: '', cardCvc: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('zonix_cart_ledger');
    if (savedCart) {
      try { setCartLedger(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }

    const fetchCatalogForCart = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) setProducts(data);
      setLoadingProducts(false);
    };
    fetchCatalogForCart();
  }, []);

  const cartItems = products.filter(p => cartLedger[p.id] > 0).map(p => ({
    id: p.id,
    name: p.name,
    image: p.image,
    price_omr: p.price_omr,
    qty: cartLedger[p.id],
    article_no: p.article_no
  }));

  const calculateSubtotal = () => cartItems.reduce((sum, item) => sum + (parseFloat(item.price_omr) * item.qty), 0);

  const handleQtyChange = (id, delta) => {
    setCartLedger(prev => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const updatedCart = { ...prev, [id]: newQty };
      if (newQty === 0) delete updatedCart[id];
      localStorage.setItem('zonix_cart_ledger', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleRemoveItem = (id) => {
    setCartLedger(prev => {
      const updatedCart = { ...prev };
      delete updatedCart[id];
      localStorage.setItem('zonix_cart_ledger', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const triggerSecureCheckoutSubmit = async (e) => {
    if (e) e.preventDefault();
    if (cartItems.length === 0) return alert("Your basket ledger is empty.");
    if (!formData.name || !formData.phone || !formData.address) {
      return alert("Please fulfill all mandated customer form parameters.");
    }
    
    if (paymentMethod === 'visa') {
      if (!formData.cardNumber || formData.cardNumber.length < 16) {
        return alert("Please enter a valid 16-digit Visa card number.");
      }
      if (!formData.cardExpiry || !formData.cardCvc) {
        return alert("Please fulfill all credit parameters credentials.");
      }
    }

    setLoading(true);
    try {
      for (const item of cartItems) {
        const payload = {
          customer_name: formData.name,
          customer_email: formData.email || 'guest@zonixmart.com',
          customer_phone: formData.phone,
          customer_address: formData.address,
          product_name: item.name,
          product_image: item.image,
          product_article: item.article_no || 'GEN-SKU',
          total_price_omr: parseFloat(item.price_omr) * item.qty,
          payment_mode: paymentMethod 
        };
        const { error } = await supabase.from('orders').insert([payload]);
        if (error) throw error;
      }

      alert(paymentMethod === 'cod' ? "Order placed via Cash on Delivery!" : "Visa Authentication Transaction Successful!");
      localStorage.removeItem('zonix_cart_ledger');
      setCartLedger({});
      window.location.href = '/';
    } catch (err) {
      alert(`Checkout Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen flex flex-col font-sans antialiased pb-20 md:pb-0">
      <Header cartCount={cartItems.reduce((sum, item) => sum + item.qty, 0)} isHomePage={false} />
      
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Hand Basket Node */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 border-b pb-2">
            <ShoppingBag className="h-4 w-4 text-[#ff4d00]" /> Core Basket Ledger
          </h2>
          
          {loadingProducts ? (
            <div className="text-center p-12 text-xs font-bold text-slate-400 animate-pulse">Syncing Basket Matrix...</div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Your bag is empty.</div>
          ) : (
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white border p-4 rounded-xl flex items-center justify-between gap-4 shadow-xs">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold truncate text-slate-900">{item.name}</h4>
                    <div className="text-xs font-mono font-black text-[#ff4d00] mt-0.5">{(parseFloat(item.price_omr) * item.qty).toFixed(3)} OMR</div>
                  </div>
                  <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
                    <button type="button" onClick={() => handleQtyChange(item.id, -1)} className="px-2 py-1 text-slate-400 text-xs font-black">-</button>
                    <span className="px-3 text-xs font-black text-slate-700">{item.qty}</span>
                    <button type="button" onClick={() => handleQtyChange(item.id, 1)} className="px-2 py-1 text-slate-400 text-xs font-black">+</button>
                  </div>
                  <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-2 text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Hand Form Node Console - Renders strictly single button row */}
        <div className="bg-white border p-6 rounded-2xl shadow-sm h-fit space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-2">Checkout Gateway</h3>
          <form onSubmit={triggerSecureCheckoutSubmit} className="space-y-3">
            <div>
              <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Customer Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:bg-white border-slate-200" placeholder="Full name" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Oman Mobile</label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:bg-white border-slate-200" placeholder="+968" />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Email (Optional)</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:bg-white border-slate-200" placeholder="email@domain.com" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Delivery Address</label>
              <input type="text" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:bg-white border-slate-200" placeholder="City details" />
            </div>

            <div className="pt-2 border-t space-y-2">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Select Preferred Payment Mode</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('cod')} 
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${paymentMethod === 'cod' ? 'border-[#ff4d00] bg-orange-50/10' : 'bg-slate-50 border-slate-200'}`}
                >
                  <Truck className={`h-4 w-4 ${paymentMethod === 'cod' ? 'text-[#ff4d00]' : 'text-slate-400'}`} />
                  <span className="text-[9px] font-black uppercase tracking-wider block mt-2">Cash on Delivery</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('visa')} 
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${paymentMethod === 'visa' ? 'border-[#ff4d00] bg-orange-50/10' : 'bg-slate-50 border-slate-200'}`}
                >
                  <CreditCard className={`h-4 w-4 ${paymentMethod === 'visa' ? 'text-[#ff4d00]' : 'text-slate-400'}`} />
                  <span className="text-[9px] font-black uppercase tracking-wider block mt-2">Visa Card</span>
                </button>
              </div>
            </div>
              {paymentMethod === 'visa' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-200">
                <span className="text-[8px] font-bold uppercase text-slate-400 block mb-1">Visa Gateway Credentials</span>
                <input 
                  type="text" 
                  required 
                  maxLength="16" 
                  value={formData.cardNumber} 
                  onChange={e => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, '') })} 
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none focus:border-[#ff4d00]" 
                  placeholder="Card Number (16 Digits)" 
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    required 
                    maxLength="5" 
                    value={formData.cardExpiry} 
                    onChange={e => setFormData({ ...formData, cardExpiry: e.target.value })} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono text-center outline-none focus:border-[#ff4d00]" 
                    placeholder="MM/YY" 
                  />
                  <input 
                    type="text" 
                    required 
                    maxLength="3" 
                    value={formData.cardCvc} 
                    onChange={e => setFormData({ ...formData, cardCvc: e.target.value.replace(/\D/g, '') })} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono text-center outline-none focus:border-[#ff4d00]" 
                    placeholder="CVC" 
                  />
                </div>
              </div>
            )}

            <div className="pt-3 border-t flex justify-between items-center font-black text-slate-800">
              <span className="text-[9px] uppercase text-slate-400">Net Amount:</span>
              <span className="text-xs font-mono">{calculateSubtotal().toFixed(3)} OMR</span>
            </div>

                        {/* UNIQUE DESKTOP/LAPTOP INTERACTIVE CHECKOUT ACTION CONTROL */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] hover:from-[#ff4d00] hover:to-[#ffaa00] text-white font-black text-xs uppercase py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-orange-500/20 active:scale-[0.98] select-none cursor-pointer tracking-wider"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing Purchase...
                </span>
              ) : (
                <>
                  <span> Checkout</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>

          </form>
        </div>
      </main>

      {/* FIXED MOBILE RESPONSIVE STICKY FOOTER ACTION STRIP */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between gap-3 shadow-2xl md:hidden">
        <button
          type="button"
          onClick={() => triggerSecureCheckoutSubmit()}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#ff4d00] to-[#ffaa00] active:from-[#d13b00] active:to-[#d18b00] text-white font-black text-center text-xs uppercase py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all tracking-wider select-none cursor-pointer flex items-center justify-center"
         >
          {loading ? (
            <span className="flex items-center gap-1.5 justify-center">
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing Purchase...
            </span>
          ) : (
            "Confirm Secure Purchase"
          )}
        </button>

      </div>

      {/* HIGH VISIBILITY ROUND FLOATING WHATSAPP CHAT BUTTON */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent("Hi there! I have a question about my cart order.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center border border-white/10"
        title="Contact us on WhatsApp"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://w3.org">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      <div className="bg-[#0b0f19]">
        <Footer />
      </div>
    </div>
  );
}
