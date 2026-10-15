"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { ShoppingCart, Layers, Search, Link } from 'lucide-react';

const Footer = () => (
  <footer className="w-full text-center py-8 text-xs text-slate-400 bg-[#0b0f19] border-t border-slate-800/40">
    © 2026 Zonix Mart. All Rights Reserved.
  </footer>
);

export default function HomePage() {
  const phoneNumber = "96871009969";
  const welcomeMessage = "Hi there! I have a question about your products.";
  const encodedMessage = encodeURIComponent(welcomeMessage);
  const whatsappUrl = `https://wa.me{phoneNumber}?text=${encodedMessage}`;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartLedger, setCartLedger] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStorefrontData = async () => {
    setLoading(true);
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (cats) setCategories(cats);

      const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prods) setProducts(prods);

      const { data: bans } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
      if (bans) setBanners(bans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorefrontData();
    const savedCart = localStorage.getItem('zonix_cart_ledger');
    if (savedCart) {
      try { setCartLedger(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleAddToCart = (e, productId) => {
    e.stopPropagation(); // Stops routing to detail page when clicking add to cart
    setCartLedger(prev => {
      const updatedCart = { ...prev, [productId]: (prev[productId] || 0) + 1 };
      localStorage.setItem('zonix_cart_ledger', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };
    // ERROR RESOLVED: Add this line exactly above const filteredProducts to fix the reference crash
  const totalCartItemsCount = Object.values(cartLedger || {}).reduce((sum, qty) => sum + qty, 0);

   // FIXED MASTER ALGORITHM: Correct bracket matching and single wrapper initialization
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const cleanQuery = searchQuery.toLowerCase().trim();
    const matchesSearch = !cleanQuery || 
      p.name?.toLowerCase().includes(cleanQuery) ||
      p.category?.toLowerCase().includes(cleanQuery) ||
      p.tags?.toLowerCase().includes(cleanQuery) ||
      p.article_no?.toLowerCase().includes(cleanQuery);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen font-sans antialiased">
      {/* Target strictly as Home Page to enforce admin check */}
      <Header 
        cartCount={totalCartItemsCount} 
        isHomePage={true} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />


      {/* Hero Banner Section */}
      <section className="max-w-[1400px] mx-auto px-4 pt-4">
        <div className="w-full h-[160px] sm:h-[220px] md:h-[350px] rounded-2xl overflow-hidden relative shadow-md bg-gradient-to-r from-slate-900 to-slate-800">
          <img
            src={banners.length > 0 && banners[0]?.image ? banners[0].image : 'https://unsplash.com'}
            alt="Hero Poster"
            className="w-full h-full object-cover opacity-90"
          />
        </div>
      </section>

      {/* FIXED CRITICAL DESIGN: Smaller Category Action Buttons */}
      <section className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="text-center mb-4">
          <h3 className="text-sm md:text-base font-black text-[#0f172a] uppercase tracking-wide flex items-center justify-center gap-2">
            <Layers className="w-4 h-4 text-[#ff4d00]" /> SHOP BY CATEGORY
          </h3>
          <p className="text-[10px] text-slate-500">Click on any directory channel token to filter products instantly</p>
        </div>

        {/* Scaled-down small grid implementation */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all bg-white shadow-xs ${
              selectedCategory === 'All' ? 'border-[#ff4d00] bg-orange-50/20' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-1">
              <Layers className={`w-4 h-4 ${selectedCategory === 'All' ? 'text-[#ff4d00]' : 'text-slate-400'}`} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">Show All</span>
          </button>

          {categories.map((cat) => {
            const isCurrentActive = selectedCategory.toLowerCase() === cat.name?.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all bg-white shadow-xs ${
                  isCurrentActive ? 'border-[#ff4d00] bg-orange-50/20' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden mb-1 relative bg-slate-50">
                  <img src={cat.image || 'https://unsplash.com'} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider truncate w-full text-center text-slate-600 px-1">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Marketplace Catalog */}
      <section className="max-w-[1400px] mx-auto px-4 pb-24">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h4 className="font-black text-xs uppercase tracking-wide">Marketplace Items Listing</h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map((prod) => {
            const productQtyInCart = cartLedger[prod.id] || 0;
            return (
              <div 
                key={prod.id} 
                onClick={() => window.location.href = `/product/${prod.id}`}
                className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group cursor-pointer"
              >
                <div className="absolute top-1.5 left-1.5 z-10 bg-[#0f172a] text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                  {prod.category}
                </div>
                <div className="h-32 sm:h-40 w-full overflow-hidden bg-slate-50">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-[11px] text-slate-800 line-clamp-1">{prod.name}</h4>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">Ref No: {prod.article_no || 'GEN-SKU'}</p>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="font-mono font-black text-xs text-[#0f172a]">{parseFloat(prod.price_omr || 0).toFixed(3)} OMR</span>
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, prod.id)}
                      className={`py-1 px-2.5 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all ${
                        productQtyInCart > 0 ? 'bg-[#ff4d00] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ShoppingCart className="w-3 h-3" />
                      {productQtyInCart > 0 && <span>{productQtyInCart}</span>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WhatsApp Sticky Floating Button & View Basket */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 p-2.5 flex items-center justify-between gap-3 shadow-2xl">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white text-[10px] uppercase font-bold px-4 py-2 rounded-full">
          WhatsApp Support
        </a>
        <button onClick={() => window.location.href = '/cart'} className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-6 py-2 rounded-full flex-1 md:flex-initial">
          View Basket ({totalCartItemsCount})
        </button>
      </div>

      <Footer />
    </div>
  );
}
