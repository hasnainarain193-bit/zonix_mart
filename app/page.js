"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Sparkles, Layers, ShoppingCart, SlidersHorizontal, ArrowUpRight, ShieldCheck, Truck } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(500);
  const [loading, setLoading] = useState(true);

  // Fallback fallback datasets matching database payload schema perfectly
  const MOCK_PRODUCTS = [
    { id: '1', name: 'Premium Luxury Oud Perfume', price_omr: 45.000, inventory: 12, category: 'Perfumes', tags: 'Oud, Luxury', image: 'https://unsplash.com' },
    { id: '2', name: 'Zonix Elite Laptop Pro x16', price_omr: 389.900, inventory: 4, category: 'Electronics', tags: 'Pro, Core', image: 'https://unsplash.com' }
  ];

  // Absolute Realtime Database Streaming Engine Linkage
  const fetchStorefrontData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setProducts(data);
        setFilteredProducts(data);
      } else {
        setProducts(MOCK_PRODUCTS);
        setFilteredProducts(MOCK_PRODUCTS);
      }
    } catch (err) {
      setProducts(MOCK_PRODUCTS);
      setFilteredProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorefrontData();

    // Listen to realtime modifications directly from Supabase dashboard settings
    const productChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchStorefrontData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
    };
  }, []);

  const handleGlobalSearch = (val) => {
    const results = products.filter(p => 
      p.name.toLowerCase().includes(val.toLowerCase()) || 
      p.category.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredProducts(results);
  };

  useEffect(() => {
    let output = products;
    if (selectedCategory !== 'All') {
      output = output.filter(p => p.category === selectedCategory);
    }
    output = output.filter(p => parseFloat(p.price_omr || 0) <= maxPrice);
    setFilteredProducts(output);
  }, [selectedCategory, maxPrice, products]);

  return (
    <div className="bg-[#f1f5f9] text-[#0f172a] min-h-screen flex flex-col font-sans antialiased selection:bg-[#4f46e5] selection:text-white">
      
      <Header onSearch={handleGlobalSearch} />

      {/* Controlled Smaller Height Banner Wrapper */}
      <section className="relative w-full max-h-[340px] sm:max-h-[420px] overflow-hidden bg-slate-950 border-b border-[#e2e8f0]">
        <div className="w-full h-full relative flex items-center justify-center">
          <img 
            src="/hero-banner.png" 
            alt="Zonix Mart Premium Banner" 
            className="w-full h-full object-cover md:object-fill max-h-[340px] sm:max-h-[420px]"
          />
          
          <div className="absolute inset-0 max-w-7xl mx-auto flex items-end pb-[5.5%] pl-[5%] sm:pl-[6%] md:pl-[6.5%]">
            <button 
              onClick={() => document.getElementById('marketplace-view').scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent hover:bg-white/5 active:scale-95 text-transparent rounded-full w-[24%] sm:w-[16%] aspect-[3.7/1] cursor-pointer border border-transparent transition-all"
              title="Shop Now"
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Minimalist Micro Trust Indicators */}
      <section className="bg-white border-b border-[#e2e8f0] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 text-xs text-[#64748b] font-medium tracking-wide">
          <div className="flex items-center gap-2"><Truck className="text-[#4f46e5] h-4 w-4" /> Fast Delivery Across Oman</div>
          <div className="flex items-center gap-2"><ShieldCheck className="text-[#ff4d00] h-4 w-4" /> Cash on Delivery Available</div>
          <div className="flex items-center gap-2"><Sparkles className="text-[#f59e0b] h-4 w-4" /> Realtime Cloud Synchronization</div>
        </div>
      </section>
      {/* Main Unique Workspace Layout */}
      <div id="marketplace-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sleek Floating Filter Strip Menu */}
        <aside className="bg-white/80 backdrop-blur-md border border-[#e2e8f0] p-5 rounded-xl h-fit space-y-6 lg:sticky lg:top-24 shadow-sm">
          <div className="flex items-center gap-2 text-[#0f172a] font-bold text-xs uppercase tracking-widest border-b border-[#e2e8f0] pb-3">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#4f46e5]" />
            <span>Navigation Hub</span>
          </div>

          <div className="space-y-2.5">
            <label className="block text-[10px] font-bold uppercase text-[#94a3b8] tracking-widest">Store Departments</label>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              {['All', 'Electronics', 'Perfumes', 'Cat Products'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all border ${selectedCategory === cat ? 'bg-[#0f172a] text-white font-bold border-[#0f172a] shadow-sm' : 'bg-transparent text-[#64748b] hover:text-[#0f172a] border-transparent hover:border-[#cbd5e1]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between text-[10px] font-bold uppercase text-[#94a3b8] tracking-widest">
              <span>Budget Cap</span>
              <span className="text-[#4f46e5] font-bold">{maxPrice} OMR</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="500" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-[#e2e8f0] rounded-lg appearance-none cursor-pointer accent-[#0f172a]" 
            />
          </div>
        </aside>

        {/* Right Product Grid Framework */}
        <main className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-[#e2e8f0] px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-[#4f46e5]" /> active catalog — {filteredProducts.length} entries
            </span>
            {loading && <span className="text-xs font-bold text-indigo-600 animate-pulse">Syncing...</span>}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-16 text-center text-[#64748b] text-xs font-normal tracking-wide shadow-sm">
              No products found matching criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                /* Sophisticated Minimalist 3D Card */
                <div 
                  key={product.id} 
                  className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:border-[#0f172a]/20 hover:shadow-[0_12px_24px_rgba(15,23,42,0.04)] flex flex-col justify-between group"
                >
                  
                  {/* Photo Space */}
                  <div className="relative aspect-square w-full bg-[#f8fafc] overflow-hidden">
                    <img 
                      src={product.image || 'https://unsplash.com'} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                    
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-[#e2e8f0] text-[#64748b] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs">
                      {product.category}
                    </span>

                    {parseInt(product.inventory || 0) === 0 && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-md">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details Framework */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#0f172a] group-hover:text-[#4f46e5] transition-colors text-sm tracking-wide line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-[#94a3b8] font-normal tracking-wide truncate">
                        {product.description || 'Premium Sourced Portfolio Item'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9]">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-[#94a3b8] tracking-widest">Pricing</span>
                        <span className="text-base font-black text-[#0f172a] tracking-tight mt-0.5">
                          {parseFloat(product.price_omr || 0).toFixed(3)} <span className="text-xs text-[#ff4d00] font-bold">OMR</span>
                        </span>
                      </div>

                      <button 
                        disabled={parseInt(product.inventory || 0) === 0}
                        className="bg-[#f8fafc] text-[#475569] hover:text-white hover:bg-[#ff4d00] border border-[#e2e8f0] hover:border-[#ff4d00] p-2.5 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:hover:bg-[#f8fafc] disabled:hover:text-[#475569] transform active:scale-95 hover:shadow-md"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
