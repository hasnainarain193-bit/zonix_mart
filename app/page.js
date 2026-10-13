"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Eye, Layers, Star, ArrowRight, Heart, Search, User, LogOut } from 'lucide-react';

const Footer = () => (
  <footer className="w-full text-center py-8 text-xs text-slate-400 bg-[#0b0f19] border-t border-slate-800/40">
    © 2026 Zonix Mart. All Rights Reserved.
  </footer>
);

export default function HomePage() {
  // Core Cloud Synchronizer Hooks
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter Token Interceptors
  const [selectedCategory, setSelectedCategory] = useState('All');

  // New Cart Management Matrix (Keeps track of quantity per product ID)
  const [cartLedger, setCartLedger] = useState({});

  // Customer Authentication Session State Nodes
  const [customer, setCustomer] = useState(null);

  // Fetch Master Sourcing Pipeline Data Tracks
  const fetchStorefrontData = async () => {
    setLoading(true);
    try {
      const { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (!catErr && cats) setCategories(cats);

      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (!prodErr && prods) setProducts(prods);

      const { data: bans, error: banErr } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });
      if (!banErr && bans) setBanners(bans);
    } catch (err) {
      console.error("Storefront Client Synchronization Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check Active Logged-in Session Profile
  const checkCustomerSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Use email prefix metadata or metadata display name as customer name target value
      const customerName = user.user_metadata?.full_name || user.email.split('@')[0];
      setCustomer({ name: customerName, email: user.email });
    }
  };

  useEffect(() => {
    fetchStorefrontData();
    checkCustomerSession();

    // Listen for authentication changes live
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const customerName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
        setCustomer({ name: customerName, email: session.user.email });
      } else {
        setCustomer(null);
      }
    });

    const channelPipes = supabase
      .channel('schema-realtime-homepage')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchStorefrontData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchStorefrontData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => fetchStorefrontData())
      .subscribe();

    return () => {
      supabase.removeChannel(channelPipes);
      authListener.unsubscribe();
    };
  }, []);

  // Popup-free Add to Cart execution flow sequence
  const handleAddToCart = (productId) => {
    setCartLedger(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  // Simulated Login Call Action Route Trigger
  const triggerLoginRedirect = () => {
    if (customer) return; // Already verified log session
    window.location.href = '/login';
  };

  // Sign out customer logging track
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
    alert("Logged out successfully from Zonix Mart.");
  };

  // Calculate global total item counts dynamically inside header basket
  const totalCartItemsCount = Object.values(cartLedger).reduce((sum, qty) => sum + qty, 0);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen font-sans antialiased selection:bg-[#ff4d00] selection:text-white">
      
                {/* 1. MASTER INTERACTIVE NAVIGATION HEADER BAR (Color Changed to Pure Dark Black) */}
      <header className="w-full bg-[rgb(21,6,94)] text-white sticky top-0 z-50 shadow-md border-b border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setSelectedCategory('All')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#ff4d00] to-[#ffaa00] flex items-center justify-center shadow">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-white uppercase">Zonix<span className="text-[#ff4d00]">Mart</span></span>
          </div>

          <div className="hidden md:flex flex-1 max-w-md relative mx-4">
            <input type="text" placeholder="Search for products, article numbers or premium perfumes..." className="w-full px-4 py-2 bg-[#0b0f19] border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#ff4d00] text-slate-200 transition-all" />
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
          </div>

          <div className="flex items-center gap-5 text-slate-300">
            {/* Dynamic Session Login / Name Banner Controller Node */}
            <div className="flex items-center gap-2 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-800/60 select-none">
              {customer ? (
                <div className="flex items-center gap-2.5">
                  {/* 👑 ONLY HASNAIN ARAIN ADMIN ACCESS BUTTON */}
                  {customer.email === 'hasnainarain193@gmail.com' && (
                    <button
                      type="button"
                      onClick={() => window.location.href = '/admin'}
                      className="bg-[#ff4d00] hover:bg-[#ffaa00] text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-md transition-all shadow-sm"
                    >
                      Admin Panel
                    </button>
                  )}
                  
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Hi, <span className="text-[#ff4d00] capitalize">{customer.name}</span>
                  </span>
                  <button type="button" onClick={handleSignOut} className="p-1 hover:text-rose-400 transition-colors" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={triggerLoginRedirect} className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors">
                  <User className="w-4 h-4 text-[#ff4d00]" />
                  <span>Login / Register</span>
                </button>
              )}
            </div>

            <Heart className="w-5 h-5 hover:text-[#ff4d00] cursor-pointer transition-colors hidden sm:block" />
            
            <div className="relative cursor-pointer select-none" onClick={() => window.location.href='/cart'}>
              <ShoppingCart className="w-5 h-5 hover:text-[#ff4d00] transition-colors" />
              {totalCartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#ff4d00] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-bounce shadow">
                  {totalCartItemsCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC HERO POSTER / BANNER MANAGER DISPLAY AREA */}
      <section className="max-w-[1400px] mx-auto px-4 pt-6">
        <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden relative shadow-lg bg-gradient-to-r from-slate-900 to-slate-800">
          <img 
            src={banners.length > 0 && banners[0]?.image ? banners[0].image : 'https://unsplash.com'} 
            alt="Hero Promotional Poster" 
            className="w-full h-full object-cover opacity-85"
            onError={(e) => { e.target.src = 'https://unsplash.com'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex flex-col justify-center p-6 md:p-12">
            <span className="px-2.5 py-0.5 bg-[#ff4d00] text-white text-[10px] font-bold uppercase rounded w-fit tracking-wider mb-3">Zonix Mega Campaign Live</span>
            <h2 className="text-xl md:text-4xl font-black text-white max-w-xl leading-tight uppercase tracking-tight">
              {banners.length > 0 && banners[0]?.title ? banners[0].title : 'Discover Our Premium Exclusive Collections'}
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-sm hidden sm:block">Experience high-speed shopping with automatic backend database synchronization pipelines.</p>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY ACTION BUTTONS INTERACTIVE FILTER MATRIX */}
      <section className="max-w-[1400px] mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-wide flex items-center justify-center gap-2">
            <Layers className="w-5 h-5 text-[#ff4d00]" /> SHOP BY CATEGORY
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Click on any directory channel token to filter the products instantly</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 bg-white shadow-sm group ${
              selectedCategory === 'All' ? 'border-[#ff4d00] scale-102 shadow-md' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="w-full h-20 bg-slate-50 rounded-lg flex items-center justify-center mb-2">
              <Layers className={`w-7 h-7 ${selectedCategory === 'All' ? 'text-[#ff4d00]' : 'text-slate-400 group-hover:text-slate-600'}`} />
            </div>
            <span className={`text-[11px] font-black uppercase tracking-wider ${selectedCategory === 'All' ? 'text-[#ff4d00]' : 'text-slate-600'}`}>Show All</span>
          </button>

          {categories.map((cat) => {
            const isCurrentActive = selectedCategory.toLowerCase() === cat.name?.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 bg-white shadow-sm group ${
                  isCurrentActive ? 'border-[#ff4d00] scale-102 shadow-md' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="w-full h-20 rounded-lg overflow-hidden mb-2 relative bg-slate-50">
                  <img 
                    src={cat.image || 'https://unsplash.com'} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                    onError={(e) => { e.target.src = 'https://unsplash.com'; }}
                  />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-wider truncate w-full px-1 ${isCurrentActive ? 'text-[#ff4d00]' : 'text-slate-600'}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. DYNAMICALLY FILTERED ACTIVE INVENTORY CATALOG MARKETPLACE */}
      <section className="max-w-[1400px] mx-auto px-4 pb-24">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
          <h4 className="font-black text-sm text-[#0f172a] uppercase tracking-wide">Marketplace Items Listing</h4>
          <span className="px-2 py-1 bg-slate-50 border border-slate-200 font-mono text-[10px] rounded text-slate-500">
            Active: <span className="text-[#ff4d00] font-black uppercase">{selectedCategory}</span>
          </span>
        </div>

        {loading ? (
          <div className="text-center p-12 text-xs font-bold text-slate-400 animate-pulse uppercase tracking-wider">Loading Storefront...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 border border-dashed border-slate-200 rounded-xl bg-white text-center max-w-sm mx-auto">
            <p className="text-xs text-slate-400 font-medium">Is category me koi product available nahi hai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => {
              const isOutOfStock = (parseInt(prod.inventory) || 0) === 0;
              const productQtyInCart = cartLedger[prod.id] || 0;
              
              return (
                <div key={prod.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
                  <div className="absolute top-2 left-2 z-10 bg-[#0f172a] text-white px-2 py-0.5 rounded text-[9px] font-black uppercase shadow">
                    {prod.category}
                  </div>
                  {/* Product Display Image Visual Layout Element */}
                  <div className="h-44 w-full overflow-hidden relative bg-slate-50">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                      onError={(e) => { e.target.src = 'https://unsplash.com'; }}
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-rose-500 text-white font-black text-[10px] rounded-lg shadow-md">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>

                  {/* Product Content Details Metadata Block Box */}
                  <div className="p-3 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{prod.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Ref No: {prod.article_no || 'GEN-SKU'}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                      <span className="font-mono font-black text-sm text-[#0f172a]">{parseFloat(prod.price_omr || 0).toFixed(3)} OMR</span>
                      
                      <button 
                        type="button" 
                        disabled={isOutOfStock} 
                        onClick={() => handleAddToCart(prod.id)} 
                        className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all select-none ${
                          productQtyInCart > 0 
                            ? 'bg-[#ff4d00] text-white' 
                            : 'bg-slate-100 hover:bg-[#ff4d00] text-slate-600 hover:text-white'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {productQtyInCart > 0 && (
                          <span className="bg-white text-[#ff4d00] font-black rounded-md px-1.5 py-0.5 text-[10px] shadow-sm">
                            {productQtyInCart}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. FLOATING BOTTOM STICKY NAVIGATION CONTROLS STRIP */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between gap-4 shadow-2xl">
        <button 
          type="button" 
          onClick={() => window.open('https://whatsapp.com', '_blank')} 
          className="bg-[#12a500] hover:bg-[#0f8c00] text-white font-bold text-xs uppercase px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-md transition-all"
        >
          WhatsApp Support
        </button>
        <button 
          type="button" 
          onClick={() => window.location.href='/cart'} 
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-full flex items-center gap-1.5 transition-all"
        >
          <ShoppingCart className="w-4 h-4" /> <span>View Basket ({totalCartItemsCount})</span>
        </button>
      </div>

      <div className="pb-12 bg-white">
        <Footer />
      </div>

    </div>
  );
}
