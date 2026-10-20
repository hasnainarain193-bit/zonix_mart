"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, Layers } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLedger, setCartLedger] = useState({});

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      if (!id) return;
      setLoading(true);
      
      // 1. Fetch current selected product details
      const { data: currentProduct, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && currentProduct) {
        setProduct(currentProduct);

        // 2. Fetch other related items from the exact same category cluster
        if (currentProduct.category) {
          const { data: related, error: relError } = await supabase
            .from('products')
            .select('*')
            .eq('category', currentProduct.category)
            .neq('id', currentProduct.id) // Exclude current active item
            .limit(4); // Display standard row block limit

          if (!relError && related) {
            setRelatedProducts(related);
          }
        }
      }
      setLoading(false);
    };

    fetchProductAndRelated();
    
    const savedCart = localStorage.getItem('zonix_cart_ledger');
    if (savedCart) {
      try { setCartLedger(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
  }, [id]);

  const handleAddToCart = (productId) => {
    setCartLedger(prev => {
      const updatedCart = { ...prev, [productId]: (prev[productId] || 0) + 1 };
      localStorage.setItem('zonix_cart_ledger', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const totalCartItemsCount = Object.values(cartLedger).reduce((sum, qty) => sum + qty, 0);

  if (loading) {
    return <div className="text-center p-12 text-xs font-bold uppercase tracking-wider text-slate-400">Syncing Item Details Ledger...</div>;
  }

  if (!product) {
    return (
      <div className="text-center p-12 bg-white min-h-screen">
        <p className="text-xs text-slate-500 font-bold uppercase">Product parameters not found inside the schema database.</p>
        <button onClick={() => window.location.href = '/'} className="mt-4 text-xs font-black uppercase text-[#ff4d00]">Back To Shop</button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen flex flex-col font-sans antialiased">
      <Header cartCount={totalCartItemsCount} isHomePage={false} />
      
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <button 
          onClick={() => window.location.href = '/'} 
          className="flex items-center gap-1 text-slate-500 hover:text-[#ff4d00] text-xs font-black uppercase mb-6 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        {/* Core Product Presentation Node */}
        <div className="bg-white border rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6 shadow-xs mb-12">
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 border relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <span className="absolute top-2 left-2 bg-[#0f172a] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
              {product.category}
            </span>
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h2 className="text-base md:text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">{product.name}</h2>
              <div className="text-[10px] font-mono text-slate-400 bg-slate-50 border rounded px-2 py-1 h-fit w-fit">
                SKU Ref Tracker: {product.article_no || 'GEN-SKU'}
              </div>
            <div className="text-xs md:text-sm text-slate-700 leading-relaxed pt-2 whitespace-pre-line bg-white border border-slate-200/60 p-5 rounded-2xl shadow-2xs space-y-4">
  {(() => {
    if (!product?.description) return "No description parameters uploaded for this unit configuration.";
    
    // Line breaks ke sath paragraphs split karne ke liye array pipeline
    const lines = product.description.split('\n');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // 1. Dynamic Main Headings Formatter Hub (Overview, Key Ingredients, etc.)
      if (trimmedLine.endsWith(':') || trimmedLine.toLowerCase().includes('ingredients') || trimmedLine.toLowerCase().includes('overview')) {
        return (
          <p key={index} className="text-slate-950 font-black text-sm uppercase tracking-wider mt-4 first:mt-0 text-[#ff4d00] border-b pb-1 border-slate-100">
            {trimmedLine}
          </p>
        );
      }
      
      // 2. Sequential Ordered Numbers List Formatter (1., 2., 3., etc.)
      const numberListMatch = trimmedLine.match(/^(\d+\.\s*)(.*)/);
      if (numberListMatch) {
        return (
          <div key={index} className="flex items-start gap-2 pl-1 mt-2">
            <span className="font-black text-[#ff4d00] shrink-0 font-mono">{numberListMatch[1]}</span>
            <p className="text-slate-700 font-medium">{numberListMatch[2]}</p>
          </div>
          );
          }
      
            // Default Base Body Context Line Node
            return trimmedLine !== '' ? (
           <p key={index} className="text-slate-600 font-medium pl-1 mt-1">{trimmedLine}</p>
            ) : (
            <div key={index} className="h-2" />
            );
            });
            })()}
          </div>


            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Market Price:</span>
                <span className="font-mono font-black text-lg md:text-xl text-[#0f172a]">{parseFloat(product.price_omr || 0).toFixed(3)} OMR</span>
              </div>

              <button 
                onClick={() => handleAddToCart(product.id)}
                className="w-full bg-[#0f172a] hover:bg-[#ff4d00] text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow"
              >
                <ShoppingCart className="w-4 h-4" /> Add Item to Cart Ledger 
                {cartLedger[product.id] > 0 && (
                  <span className="bg-white text-[#ff4d00] px-1.5 py-0.5 rounded text-[10px] ml-1 font-black">
                    {cartLedger[product.id]}
                  </span>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[9px] font-black text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 border rounded-lg">
                  <Truck className="w-4 h-4 text-emerald-600" /> Fast Oman Delivery
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 border rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Secure Checkout Verified
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FIXED CRITICAL REQUIREMENT: Related Categories Directory Component Grid */}
        <div className="border-t border-slate-200 pt-8">
          <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#ff4d00]" /> Related Products from same Category
          </h3>
          {relatedProducts.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No other related products found in this category slot.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((item) => {
                const itemQtyInCart = cartLedger[item.id] || 0;
                return (
                  <div 
                    key={item.id}
                    onClick={() => window.location.href = `/product/${item.id}`}
                    className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer p-2 relative group"
                  >
                    <div className="h-28 sm:h-36 w-full overflow-hidden bg-slate-50 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="pt-2 flex flex-col justify-between flex-1 gap-1">
                      <h4 className="font-bold text-[11px] text-slate-800 truncate">{item.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-[11px] font-black text-slate-900">{parseFloat(item.price_omr || 0).toFixed(3)} OMR</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid page push trigger
                            handleAddToCart(item.id);
                          }}
                          className={`p-1 rounded-md transition-all ${
                            itemQtyInCart > 0 ? 'bg-[#ff4d00] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <ShoppingCart className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
