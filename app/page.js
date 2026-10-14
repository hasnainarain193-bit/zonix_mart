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

  const phoneNumber = "96871009969";

  // Custom welcome message pre-filled in the user's text box
  const welcomeMessage = "Hi there! I have a question about your cat food products.";

  // Encodes spaces and punctuation safely for the URL format
  const encodedMessage = encodeURIComponent(welcomeMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  // Core Cloud Realtime Sync State Nodes
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  // Operational State Matrices Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartLedger, setCartLedger] = useState({});
  const [customer, setCustomer] = useState(null);

  // Customer Personal Orders Folder History Trackers
  const [showMyOrdersModal, setShowMyOrdersModal] = useState(false);
  const [customerOrdersList, setCustomerOrdersList] = useState([]);
  const [fetchingCustomerOrders, setFetchingCustomerOrders] = useState(false);

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
      console.error("Storefront Pipeline Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalOrdersHistory = async (customerEmail) => {
    if (!customerEmail) return;
    setFetchingCustomerOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', customerEmail)
        .order('created_at', { ascending: false });
      if (!error && data) setCustomerOrdersList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingCustomerOrders(false);
    }
  };

  const checkCustomerSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const customerName = user.user_metadata?.full_name || user.email.split('@')[0];
      setCustomer({ name: customerName, email: user.email });
    }
  };

  useEffect(() => {
    fetchStorefrontData();
    checkCustomerSession();

    // Load persistent cart choices tracking items on render node init
    const savedCart = localStorage.getItem('zonix_cart_ledger');
    if (savedCart) {
      try { setCartLedger(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }

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

  useEffect(() => {
    if (customer?.email) {
      fetchPersonalOrdersHistory(customer.email);
    } else {
      setCustomerOrdersList([]);
    }
  }, [customer]);

  const handleAddToCart = (productId) => {
    setCartLedger(prev => {
      const updatedCart = { ...prev, [productId]: (prev[productId] || 0) + 1 };
      localStorage.setItem('zonix_cart_ledger', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
    alert("Logged out successfully from Zonix Mart.");
  };

  const triggerLoginRedirect = () => {
    if (customer) return;
    window.location.href = '/login';
  };

  const totalCartItemsCount = Object.values(cartLedger).reduce((sum, qty) => sum + qty, 0);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen font-sans antialiased selection:bg-[#ff4d00] selection:text-white">

      {/* 1. MASTER INTERACTIVE NAVIGATION HEADER BAR (Responsive Flex Grid Layout) */}
      <header className="w-full bg-[#dbdcdf] text-white sticky top-0 z-50 shadow-md border-b border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-4 py-3 md:py-0 md:h-16 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">

          {/* Top Branding Row & Mobile Badges Layout */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setSelectedCategory('All')}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#ff4d00] to-[#ffaa00] flex items-center justify-center shadow">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-lg tracking-tight text-[#0b0f19] uppercase">
                Zonix<span className="text-[#ff4d00]">Mart</span>
              </span>
            </div>

            {/* Quick Action Badges Visible on Mobile screen-sizes */}
            <div className="flex items-center gap-3 md:hidden">
              <Heart className="w-5 h-5 text-slate-700 hover:text-[#ff4d00] cursor-pointer transition-colors" onClick={() => window.location.href = '/wishlist'} />
              <div className="relative cursor-pointer select-none" onClick={() => window.location.href = '/cart'}>
                <ShoppingCart className="w-5 h-5 text-slate-700 hover:text-[#ff4d00] transition-colors" />
                {totalCartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#ff4d00] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow">
                    {totalCartItemsCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search Box Form */}
          <div className="w-full md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search for products, article numbers or premium perfumes..."
              className="w-full px-4 py-2 bg-[#0b0f19] border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#ff4d00] text-slate-200 transition-all placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* User Session Interface Controls Panel */}
          <div className="flex items-center justify-end md:justify-start gap-4 text-slate-700 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-800/10 px-3 py-1.5 rounded-xl border border-slate-800/20 select-none w-full md:w-auto justify-between md:justify-start">
              {customer ? (
                <div className="flex items-center flex-wrap gap-2 w-full justify-between md:justify-start">
                  <div className="flex items-center gap-1.5">
                    {/* ADMIN BUTTON */}
                    {customer.email === 'hasnainarain193@gmail.com' && (
                      <button
                        type="button"
                        onClick={() => window.location.href = '/admin'}
                        className="bg-[#ff4d00] hover:bg-[#ffaa00] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded transition-all shadow-sm"
                      >
                        Admin Panel
                      </button>
                    )}

                    {/* CLIENT ORDERS HISTORY LINK */}
                    <button
                      type="button"
                      onClick={() => {
                        fetchPersonalOrdersHistory(customer.email);
                        setShowMyOrdersModal(true);
                      }}
                      className="bg-slate-700/20 hover:bg-slate-700/30 text-[#ff4d00] text-[10px] font-black uppercase px-2 py-0.5 rounded transition-all border border-slate-600/30"
                    >
                      My Orders
                    </button>
                  </div>

                  <div className="flex items-center gap-1 ml-auto md:ml-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate max-w-[85px]">
                      Hi, <span className="text-[#ff4d00] capitalize truncate">{customer.name}</span>
                    </span>
                    <button type="button" onClick={handleSignOut} className="p-1 text-slate-500 hover:text-rose-600 transition-colors" title="Sign Out">
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
            </div>

            <Heart className="w-5 h-5 hover:text-[#ff4d00] cursor-pointer transition-colors hidden md:block text-slate-700" onClick={() => window.location.href = '/wishlist'} />

            <div className="relative cursor-pointer select-none hidden md:block text-slate-700" onClick={() => window.location.href = '/cart'}>
              <ShoppingCart className="w-5 h-5 hover:text-[#ff4d00] transition-colors" />
              {totalCartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#ff4d00] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow">
                  {totalCartItemsCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC HERO POSTER / BANNER MANAGER DISPLAY AREA */}
      <section className="max-w-[1400px] mx-auto px-4 pt-4 md:pt-6">
        <div className="w-full h-[180px] sm:h-[260px] md:h-[400px] rounded-2xl overflow-hidden relative shadow-lg bg-gradient-to-r from-slate-900 to-slate-800">
          <img
            src={banners.length > 0 && banners[0]?.image ? banners[0].image : 'https://unsplash.com'}
            alt="Hero Promotional Poster"
            className="w-full h-full object-cover opacity-90"
            onError={(e) => { e.target.src = 'https://unsplash.com'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r flex flex-col justify-center p-6 md:p-12">
            {/* Overlay context elements */}
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY ACTION BUTTONS INTERACTIVE FILTER MATRIX */}
      <section className="max-w-[1400px] mx-auto px-4 py-6 md:py-10">
        <div className="text-center mb-4 md:mb-6">
          <h3 className="text-base md:text-xl font-black text-[#0f172a] uppercase tracking-wide flex items-center justify-center gap-2">
            <Layers className="w-4 h-4 md:w-5 md:h-5 text-[#ff4d00]" /> SHOP BY CATEGORY
          </h3>
          <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">Click on any directory channel token to filter the products instantly</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`flex flex-col items-center justify-between p-2.5 md:p-3 rounded-xl border-2 transition-all duration-200 bg-white shadow-sm group ${selectedCategory === 'All' ? 'border-[#ff4d00] scale-[1.01] shadow-md' : 'border-slate-100 hover:border-slate-200'
              }`}
          >
            <div className="w-full h-16 md:h-20 bg-slate-50 rounded-lg flex items-center justify-center mb-2">
              <Layers className={`w-6 h-6 md:w-7 md:h-7 ${selectedCategory === 'All' ? 'text-[#ff4d00]' : 'text-slate-400 group-hover:text-slate-600'}`} />
            </div>
            <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-wider ${selectedCategory === 'All' ? 'text-[#ff4d00]' : 'text-slate-600'}`}>Show All</span>
          </button>

          {categories.map((cat) => {
            const isCurrentActive = selectedCategory.toLowerCase() === cat.name?.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex flex-col items-center justify-between p-2.5 md:p-3 rounded-xl border-2 transition-all duration-200 bg-white shadow-sm group ${isCurrentActive ? 'border-[#ff4d00] scale-[1.01] shadow-md' : 'border-slate-100 hover:border-slate-200'
                  }`}
              >
                <div className="w-full h-16 md:h-20 rounded-lg overflow-hidden mb-2 relative bg-slate-50">
                  <img
                    src={cat.image || 'https://unsplash.com'}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://unsplash.com'; }}
                  />
                </div>
                <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-wider truncate w-full px-1 ${isCurrentActive ? 'text-[#ff4d00]' : 'text-slate-600'}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. DYNAMICALLY FILTERED ACTIVE INVENTORY CATALOG MARKETPLACE */}
      <section className="max-w-[1400px] mx-auto px-4 pb-28">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
          <h4 className="font-black text-xs md:text-sm text-[#0f172a] uppercase tracking-wide">Marketplace Items Listing</h4>
          <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 font-mono text-[9px] rounded text-slate-500 max-w-[120px] truncate">
            Active: <span className="text-[#ff4d00] font-black uppercase">{selectedCategory}</span>
          </span>
        </div>

        {loading ? (
          <div className="text-center p-12 text-xs font-bold text-slate-400 animate-pulse uppercase tracking-wider">Loading Storefront...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-xl bg-white text-center max-w-xs mx-auto">
            <p className="text-xs text-slate-400 font-medium">No products available in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((prod) => {
              const isOutOfStock = (parseInt(prod.inventory) || 0) === 0;
              const productQtyInCart = cartLedger[prod.id] || 0;

              return (
                <div key={prod.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
                  <div className="absolute top-1.5 left-1.5 z-10 bg-[#0f172a] text-white px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-black uppercase shadow truncate max-w-[100px]">
                    {prod.category}
                  </div>
                  <div className="h-32 sm:h-40 md:h-44 w-full overflow-hidden relative bg-slate-50">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" onError={(e) => { e.target.src = 'https://unsplash.com'; }} />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="px-2 py-1 bg-rose-500 text-white font-black text-[9px] md:text-[10px] rounded shadow-md">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 md:p-3 flex-1 flex flex-col justify-between gap-2 md:gap-3">
                    <div>
                      <h4 className="font-bold text-[11px] md:text-xs text-slate-800 line-clamp-2 md:line-clamp-1 h-8 md:h-auto">{prod.name}</h4>
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-mono mt-0.5 truncate">Ref No: {prod.article_no || 'GEN-SKU'}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-50 pt-2 gap-1.5 sm:gap-0">
                      <span className="font-mono font-black text-xs md:text-sm text-[#0f172a]">{parseFloat(prod.price_omr || 0).toFixed(3)} OMR</span>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCart(prod.id)}
                        className={`py-1.5 md:py-2 px-2.5 md:px-3 rounded-lg font-bold text-[11px] md:text-xs flex items-center justify-center gap-1.5 transition-all select-none w-full sm:w-auto ${productQtyInCart > 0
                            ? 'bg-[#ff4d00] text-white'
                            : 'bg-slate-100 hover:bg-[#ff4d00] text-slate-600 hover:text-white'
                          }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                        {productQtyInCart > 0 && (
                          <span className="bg-white text-[#ff4d00] font-black rounded px-1 py-0.5 text-[9px] md:text-[10px] shadow-sm">
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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 p-2.5 md:p-3 flex items-center justify-between gap-3 shadow-2xl">
        {/* <button 
          type="button" 
          onClick={() => window.open('https://wa.me', '_blank')} 
          className="bg-[#12a500] hover:bg-[#0f8c00] text-white font-bold text-[10px] md:text-xs uppercase px-4 md:px-5 py-2 md:py-2.5 rounded-full flex items-center gap-1.5 shadow-md transition-all shrink-0"
        >
          WhatsApp Support
        </button> */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center group"
          aria-label="Contact us on WhatsApp"
        >
          {/* Dynamic Pop-up Tooltip Label (Hidden on mobile, slides out on desktop hover) */}
          <span className="max-w-0 overflow-hidden whitespace-nowrap inline-block text-sm font-medium transition-all duration-300 group-hover:max-w-xs group-hover:pr-2">
            Chat with us
          </span>

          {/* SVG WhatsApp Custom Icon */}
          <svg
            className="w-6 h-6 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
        <button
          type="button"
          onClick={() => window.location.href = '/cart'}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] md:text-xs uppercase tracking-wider md:tracking-widest px-4 md:px-6 py-2 md:py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all flex-1 md:flex-initial"
        >
          <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="truncate">View Basket ({totalCartItemsCount})</span>
        </button>
      </div>

      <div className="bg-white">
        <Footer />
      </div>

      {/* 👑 CLIENT CUSTOMER PERSONAL ORDERS VIEW MODAL OVERLAY POPUP */}
      {showMyOrdersModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 selection:bg-[#ff4d00] selection:text-white">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 md:p-5 border-b border-slate-800/80 flex justify-between items-center bg-[#111827] gap-3">
              <div className="min-w-0">
                <h3 className="font-black text-xs md:text-sm text-white uppercase tracking-wider flex items-center gap-2 truncate">
                  <Layers className="w-4 h-4 text-[#ff4d00] shrink-0" />
                  <span className="truncate">Your Shopping Purchase History Folder</span>
                </h3>
                <p className="text-[9px] md:text-[10px] text-slate-500 mt-0.5 truncate">Secure live repository mapping tracks for customer: {customer?.email}</p>
              </div>
              <button type="button" onClick={() => setShowMyOrdersModal(false)} className="text-slate-400 hover:text-white text-[10px] md:text-xs font-black bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1.5 rounded-xl transition-all border border-slate-700/40 shrink-0">
                Close History
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto space-y-3 bg-[#0b0f19]/40 flex-1">
              {fetchingCustomerOrders ? (
                <div className="text-center p-12 text-xs font-bold text-slate-400 animate-pulse uppercase">Syncing Personal Order Streams...</div>
              ) : customerOrdersList.length === 0 ? (
                <div className="p-8 md:p-12 border border-dashed border-slate-800 text-center rounded-xl max-w-xs mx-auto bg-[#111827]/40">
                  <Layers className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  <h5 className="text-[11px] md:text-xs font-black text-slate-400 uppercase">No orders configuration logged.</h5>
                  <p className="text-[10px] text-slate-500 mt-1">You haven't made any purchases on this account setup yet.</p>
                </div>
              ) : (
                customerOrdersList.map((ord) => (
                  <div key={ord.id} className="bg-[#111827] border border-slate-800/60 p-3 md:p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 transition-all hover:border-slate-700/60">
                    <div className="space-y-1.5 flex-1 w-full min-w-0">
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="px-1.5 py-0.5 bg-[#0b0f19] border border-slate-800 font-mono font-black text-[9px] text-[#ff4d00] rounded truncate">ORDER TOKEN ID: #{ord.id}</span>
                        <span className="text-[9px] font-medium text-slate-500 font-mono">{new Date(ord.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="text-xs font-bold text-white leading-relaxed line-clamp-2 bg-[#0b0f19]/30 p-2 rounded-lg border border-slate-800/40 break-words">
                        {ord.product_name}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-slate-400 truncate"><span className="font-semibold text-slate-500">Destination:</span> {ord.customer_address}</div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/40">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">Total Amount</span>
                      <span className="font-mono font-black text-xs md:text-sm text-emerald-400 bg-emerald-500/5 px-2 py-0.5 sm:py-1 rounded border border-emerald-500/10">
                        {parseFloat(ord.total_price_omr || 0).toFixed(3)} <span className="text-[9px] font-sans font-bold text-slate-500">OMR</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
