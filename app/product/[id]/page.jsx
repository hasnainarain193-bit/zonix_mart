"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingCart, ShieldCheck, Truck, ChevronLeft, Layers, Star } from 'lucide-react';
export const dynamic = "force-dynamic";

export default function ProductDetailsPage({ params: paramsPromise }) {
  // FIXED: Unwrap the async promise node using native React runtime unwrap tool parameters
  const params = React.use(paramsPromise);

  const [product, setProduct] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  const fetchFullProductMetrics = async () => {
    try {
      setLoading(true);
      // 1. Fetch exact targeted item by unwrapped dynamic URL ID token
      const { data: targetItem, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!error && targetItem) {
        setProduct(targetItem);

        // 2. Stream complementary specific category rows directly to show below as cards
        const { data: complementaryStream } = await supabase
          .from('products')
          .select('*')
          .eq('category', targetItem.category)
          .not('id', 'eq', targetItem.id)
          .limit(4);
        
        if (complementaryStream) setRelatedItems(complementaryStream);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncCartBaselineCount = () => {
    const savedCart = localStorage.getItem('zonix_cart_items');
    if (savedCart) {
      const items = JSON.parse(savedCart);
      setCartCount(items.reduce((sum, item) => sum + item.qty, 0));
    }
  };

  useEffect(() => {
    fetchFullProductMetrics();
    syncCartBaselineCount();
  }, [params.id]);

  const handleBasketInjection = () => {
    if (!product) return;
    const savedCart = localStorage.getItem('zonix_cart_items') || '[]';
    let currentItems = JSON.parse(savedCart);
    
    const existingIndex = currentItems.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      currentItems[existingIndex].qty += quantity;
    } else {
      currentItems.push({ ...product, qty: quantity });
    }
    
    localStorage.setItem('zonix_cart_items', JSON.stringify(currentItems));
    syncCartBaselineCount();
    alert(`${product.name} successfully linked to your basket allocation!`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-xs font-black tracking-widest text-slate-400 uppercase animate-pulse">Loading Product Architecture...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-xs font-bold text-red-500 uppercase">Product Row Unregistered inside database layer.</div>;

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen flex flex-col font-sans antialiased">
      <Header cartCount={cartCount} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <button onClick={() => window.location.href='/'} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-[#ff4d00] transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Catalog
        </button>

        {/* Core Detail Section Grid */}
        <div className="bg-white border rounded-2xl p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-xs">
          <div className="aspect-square bg-slate-50 border rounded-xl overflow-hidden relative shadow-inner">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <span className="absolute top-3 left-3 bg-[#0b0f19] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md">{product.category}</span>
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">{product.name}</h1>
                {product.is_featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />}
              </div>
              <div className="text-2xl font-black text-indigo-600 font-mono">{parseFloat(product.price_omr).toFixed(3)} <span className="text-xs text-amber-500 font-bold uppercase">OMR</span></div>
              <p className="text-xs text-slate-500 leading-relaxed pt-3 border-t font-medium">{product.description || 'Premium sourced item tailored across high-fidelity Omani parameters.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              <div className="bg-slate-50 p-3 rounded-xl border flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-500" /> Fast Delivery</div>
              <div className="bg-slate-50 p-3 rounded-xl border flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-500" /> Cash on Delivery</div>
            </div>

            {/* Quantity adjustment metrics counters loops */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Select Quantity</span>
                <div className="flex items-center border rounded-xl overflow-hidden bg-slate-50">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-100">-</button>
                  <span className="px-4 font-bold text-sm text-slate-800">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-100">+</button>
                </div>
              </div>
              <button onClick={handleBasketInjection} className="w-full bg-[#0b0f19] hover:bg-[#ff4d00] text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md">
                <ShoppingCart className="h-4 w-4" /> Add to Basket Registry
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Category Specific Recommendation Grid */}
        {relatedItems.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Layers className="h-4 w-4 text-[#ff4d00]" /> More from {product.category} department</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedItems.map((item) => (
                <div key={item.id} onClick={() => window.location.href=`/product/${item.id}`} className="bg-white border rounded-xl p-3 flex flex-col justify-between gap-3 shadow-xs cursor-pointer hover:border-slate-400 transition-all">
                  <img src={item.image} alt={item.name} className="w-full aspect-square object-cover rounded-lg bg-slate-50" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate block">{item.name}</h4>
                    <span className="text-xs font-black text-indigo-600 font-mono block mt-1">{parseFloat(item.price_omr).toFixed(3)} OMR</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
