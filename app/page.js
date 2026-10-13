"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingCart, ShieldCheck, Truck } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  // Local cart memory states to track quantity counts on each specific product element card
  const [localCartRegistry, setLocalCartRegistry] = useState({});

  const CATEGORY_TILES = [
    { name: 'Electronics', image: 'https://unsplash.com' },
    { name: 'Perfumes', image: 'https://unsplash.com' },
    { name: 'Cat Products', image: 'https://unsplash.com' }
  ];

  const syncCartMetrics = () => {
    const savedCart = localStorage.getItem('zonix_cart_items');
    if (savedCart) {
      const items = JSON.parse(savedCart);
      setCartItemsCount(items.reduce((sum, item) => sum + item.qty, 0));
      
      // Map item ids directly to current active quantities array
      const localMapping = {};
      items.forEach(i => { localMapping[i.id] = i.qty; });
      setLocalCartRegistry(localMapping);
    }
  };

  const fetchStorefrontData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (!error && data) {
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorefrontData();
    syncCartMetrics();

    const productChannel = supabase
      .channel('schema-changes-loop')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchStorefrontData();
      })
      .subscribe();

    return () => { supabase.removeChannel(productChannel); };
  }, []);

  useEffect(() => {
    let output = products;
    if (selectedCategory !== 'All') {
      output = output.filter(p => p.category === selectedCategory);
    }
    setFilteredProducts(output);
  }, [selectedCategory, products]);

  const handleGlobalSearch = (val) => {
    setFilteredProducts(products.filter(p => p.name.toLowerCase().includes(val.toLowerCase())));
  };

  const handleAddToCartAction = (e, productItem) => {
    e.stopPropagation(); 
    const savedCart = localStorage.getItem('zonix_cart_items') || '[]';
    let currentItems = JSON.parse(savedCart);
    
    const existingIndex = currentItems.findIndex(item => item.id === productItem.id);
    if (existingIndex > -1) {
      currentItems[existingIndex].qty += 1;
    } else {
      currentItems.push({ ...productItem, qty: 1 });
    }
    
    localStorage.setItem('zonix_cart_items', JSON.stringify(currentItems));
    syncCartMetrics();
  };

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen flex flex-col font-sans antialiased overflow-x-hidden">
      <Header onSearch={handleGlobalSearch} cartCount={cartItemsCount} />

      <section className="relative w-full max-h-[340px] sm:max-h-[420px] overflow-hidden bg-slate-950 border-b border-[#e2e8f0]">
        <img src="/hero-banner.png" alt="Zonix Mart Banner" className="w-full h-full object-cover max-h-[340px] sm:max-h-[420px]" />
      </section>

      <section className="bg-amber-500/10 border-b border-amber-500/20 py-3 relative overflow-hidden w-full flex">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
          .animate-marquee-stream { display: flex; white-space: nowrap; animation: marquee 16s linear infinite; }
        `}} />
        <div className="animate-marquee-stream flex gap-16 text-[11px] text-amber-800 font-black uppercase shrink-0">
          <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Fast Delivery Across Oman</div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Cash on Delivery Available</div>
          <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Fast Delivery Across Oman</div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Cash on Delivery Available</div>
        </div>
      </section>

      {/* Shop By Category Matrix Display */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 w-full text-center space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Shop By Category</h2>
          <div className="w-12 h-1 bg-[#ff4d00] mx-auto rounded-full" />
        </div>
        
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto">
          {CATEGORY_TILES.map((tile, idx) => (
            <button 
              key={idx} 
              type="button"
              onClick={() => {
                setSelectedCategory(selectedCategory === tile.name ? 'All' : tile.name);
              }}
              className={`group relative aspect-square rounded-2xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1 shadow-md bg-white ${selectedCategory === tile.name ? 'border-[#ff4d00] ring-4 ring-[#ff4d00]/10' : 'border-slate-200'}`}
            >
              <img src={tile.image} alt={tile.name} className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end justify-center p-2 sm:p-4">
                <span className="text-white text-[10px] sm:text-xs font-black uppercase tracking-wider block">{tile.name}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
      {/* Main Core Catalog Architecture Blocks - Sidebar clean removed, full grid area active */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <main className="w-full">
          {loading ? (
            <div className="w-full text-center py-20 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing catalog rows...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border rounded-xl p-16 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">No stock found inside department matrix.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => window.location.href = `/product/${product.id}`}
                  className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:border-slate-300"
                >
                  <div className="relative aspect-square w-full bg-[#f8fafc] overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                    <span className="absolute top-2 left-2 bg-slate-900 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">{product.category}</span>
                    
                    {/* Realtime Quantity Added Suffix Badge overlay element */}
                    {localCartRegistry[product.id] && (
                      <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md animate-in scale-in">
                        {localCartRegistry[product.id]} Added
                      </span>
                    )}
                  </div>
                  
                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-[#0f172a] group-hover:text-indigo-600 transition-colors text-xs sm:text-sm line-clamp-1 tracking-wide">{product.name}</h4>
                      <p className="text-[9px] text-[#94a3b8] truncate font-medium">{product.description || 'Premium Portfolio Item'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="font-mono text-xs sm:text-sm font-black text-[#0f172a]">{parseFloat(product.price_omr || 0).toFixed(3)} <span className="text-[9px] text-[#ff4d00] font-bold">OMR</span></span>
                      <button 
                        type="button"
                        onClick={(e) => handleAddToCartAction(e, product)}
                        className="bg-[#0f172a] hover:bg-[#ff4d00] text-white p-2 rounded-xl transition-all duration-200"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating Bottom Sticky Navigation strip view */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between gap-4 shadow-2xl">
        <button type="button" onClick={() => window.open('https://whatsapp.com', '_blank')} className="bg-[#12a500] hover:bg-[#0f8c00] text-white font-bold text-xs uppercase px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-md">WhatsApp Support</button>
        <button type="button" onClick={() => window.location.href='/cart'} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-full flex items-center gap-1.5">
          <ShoppingCart className="h-4 w-4" /> <span>View Basket ({cartItemsCount})</span>
        </button>
      </div>
      <div className="pb-12 bg-white"><Footer /></div>
    </div>
  );
}
