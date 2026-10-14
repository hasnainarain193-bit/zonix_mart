"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingCart, ShieldCheck, Truck, ChevronLeft, Layers, Star } from 'lucide-react';

export default function ProductDetailsPage({ params: paramsPromise }) {
  // 👑 FIXED: Next.js 15 Client Unwrapping Matrix
  const params = React.use ? React.use(paramsPromise) : React.useState(React.useUnwrap ? React.useUnwrap(paramsPromise) : paramsPromise)[0];
  const targetId = params?.id;

  const [product, setProduct] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!targetId) return;

    const fetchFullProductMetrics = async () => {
      setLoading(true);
      try {
        const { data: targetItem, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', targetId)
          .single();

        if (!error && targetItem) {
          setProduct(targetItem);
          
          // Stream complementary specific category rows directly below
          const { data: related } = await supabase
            .from('products')
            .select('*')
            .eq('category', targetItem.category)
            .neq('id', targetId)
            .slice(0, 4);
          if (related) setRelatedItems(related);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullProductMetrics();
  }, [targetId]);

  if (loading) {
    return <div className="text-center p-20 text-xs font-bold text-slate-400 font-mono uppercase">Syncing Product Ledger Matrix Node...</div>;
  }

  if (!product) {
    return <div className="text-center p-20 text-xs font-bold text-rose-400 font-mono uppercase">Target Product Configuration Log Missing Inside Cloud Tables</div>;
  }

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen font-sans">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 py-10 pb-24">
        <button type="button" onClick={() => window.history.back()} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ff4d00] transition-colors mb-6 uppercase">
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="h-96 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e)=>{e.target.src='https://unsplash.com';}} />
          </div>

          <div className="flex flex-col justify-between gap-6">
            <div>
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-md tracking-wider">{product.category}</span>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mt-3">{product.name}</h1>
              <p className="text-xs font-mono font-bold text-[#ff4d00] mt-1">ARTICLE SKU CODE: {product.article_no || 'GEN-SKU-990'}</p>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed">{product.description || 'No descriptive technical cataloging context configured inside core administrative database matrix panels.'}</p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product Valuation</div>
              <div className="text-2xl font-mono font-black text-slate-900">{parseFloat(product.price_omr || 0).toFixed(3)} <span className="text-sm font-sans font-bold text-slate-400">OMR</span></div>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-slate-500 font-bold hover:text-slate-800 text-sm">-</button>
                  <span className="px-2 font-mono font-bold text-sm text-slate-800">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-slate-500 font-bold hover:text-slate-800 text-sm">+</button>
                </div>

                <button 
                  type="button" 
                  onClick={() => { setCartCount(c => c + quantity); alert("Product basket allocation configuration pass!"); }}
                  className="flex-1 py-3 bg-[#ff4d00] hover:bg-[#ffaa00] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Store Basket {cartCount > 0 && `(${cartCount})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
