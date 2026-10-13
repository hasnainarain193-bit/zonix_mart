"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  PlusCircle, Edit3, Trash2, Package, Users, ShoppingCart, RefreshCw, Layers,
  TrendingUp, AlertTriangle, Download, CheckSquare, Square, Star, Image as ImageIcon, 
  Globe, ChevronRight, ArrowUpRight, Calendar, FileText, ClipboardList
} from 'lucide-react';

export default function AdvancedAdminDashboard() {
  // Navigation Routing States
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orderDateFilter, setOrderDateFilter] = useState('');

  // Real-time Core Database Registries
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  // Form Submission Field Matrix States
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');

  // Editing Hooks Tokens
  const [editMode, setEditMode] = useState(false);
  const [targetId, setTargetId] = useState(null);
  
  // Product Form Input Matrix (With Article Reference Code Field Built-in)
  const [formData, setFormData] = useState({
    name: '',
    price_omr: '',
    inventory: '',
    category: '',
    tags: '',
    image: '',
    description: '',
    article_no: '', // Article Ref key required parameters
    is_featured: false
  });

  // Self Refresh Simulated Live Active Node Signals
  const [liveStats, setLiveStats] = useState({ activeUsers: 44, totalRevenue: 1240.850 });
  // Realtime Cloud Multi-table Fetch Engine
  const fetchAllSystemData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Products ordered by featured status
      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (!prodErr && prods) setProducts(prods);

      // 2. Fetch Categories from database so they stay saved permanently
      const { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!catErr && cats) {
        setCategories(cats);
        if (cats.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: cats[0].name }));
        }
      }

      // 3. Fetch Promotional Banners / Posters
      const { data: bans, error: banErr } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });
      if (!banErr && bans) setBanners(bans);

      // 4. Fetch First 10 Live Orders with Full Customer Details
      const { data: ords, error: ordErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!ordErr && ords) setOrders(ords);

    } catch (err) {
      console.error("Master Pipeline Refresh Exception:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSystemData();

    // Setup active listeners loop for background dynamic synchronization updates
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * (60 - 30) + 30)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Multi-bucket Media Binary Stream Loader
  const handleFileUploadStream = async (e, type = 'product') => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExtension = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('zonix-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('zonix-media').getPublicUrl(fileName);
      
      if (type === 'product') setFormData(prev => ({ ...prev, image: data.publicUrl }));
      if (type === 'category') setNewCategoryImage(data.publicUrl);
      if (type === 'banner') setNewBannerImage(data.publicUrl);

      alert("Image asset permanently synced to cloud storage bucket!");
    } catch (err) {
      alert(`Storage Stream Matrix Exception: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };
  // Inject and Save New Categories Permanently to Supabase Database
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const contextName = newCategoryName.trim();
    if (categories.some(c => c.name.toLowerCase() === contextName.toLowerCase())) {
      return alert("This category group already exists inside database matrix.");
    }

    setLoading(true);
    const payload = {
      name: contextName,
      image: newCategoryImage || 'https://unsplash.com'
    };

    const { error } = await supabase.from('categories').insert([payload]);
    if (!error) {
      alert("Category permanently added and live synced to homepage catalog!");
      setNewCategoryName('');
      setNewCategoryImage('');
      fetchAllSystemData(); // Instant non-refresh real-time reload
    } else {
      alert(`Category Save Error: ${error.message}`);
    }
    setLoading(false);
  };

  // Create and Publish Promotional Posters directly to Supabase Storage Matrix Table
  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!newBannerTitle.trim() || !newBannerImage) {
      return alert("Please fill out both the poster heading title and background image.");
    }

    setLoading(true);
    const payload = {
      title: newBannerTitle.trim(),
      image: newBannerImage
    };

    const { error } = await supabase.from('banners').insert([payload]);
    if (!error) {
      alert("Promotional advertising poster published successfully on store homepage grid!");
      setNewBannerTitle('');
      setNewBannerImage('');
      fetchAllSystemData(); // Live updates stream reload
    } else {
      alert(`Banner Save Error: ${error.message}`);
    }
    setLoading(false);
  };

  // Submit Product Form with Dynamic Categories Allocation & Article Ref SKU Matrix
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price_omr || !formData.category) {
      return alert("Product Name, Price, and target Category placement are mandatory.");
    }

    setLoading(true);
    const payload = {
      name: formData.name,
      price_omr: parseFloat(formData.price_omr || 0),
      inventory: parseInt(formData.inventory || 0),
      category: formData.category,
      tags: formData.tags,
      image: formData.image || 'https://unsplash.com',
      description: formData.description,
      article_no: formData.article_no, // Persistent tracking Article Code
      is_featured: formData.is_featured
    };

    const { error } = editMode
      ? await supabase.from('products').update(payload).eq('id', targetId)
      : await supabase.from('products').insert([payload]);

    if (!error) {
      alert(editMode ? "Product configuration edited successfully!" : "Product published live into active sync category directory!");
      setFormData({
        name: '', price_omr: '', inventory: '', category: categories[0]?.name || '',
        tags: '', image: '', description: '', article_no: '', is_featured: false
      });
      setEditMode(false);
      setTargetId(null);
      fetchAllSystemData(); // Reactive refresh live trigger loop statement
    } else {
      alert(`Database Mutation Exception: ${error.message}`);
    }
    setLoading(false);
  };

  const handleEditTrigger = (prod) => {
    setEditMode(true);
    setTargetId(prod.id);
    setFormData({
      name: prod.name, price_omr: prod.price_omr, inventory: prod.inventory,
      category: prod.category, tags: prod.tags || '', image: prod.image || '',
      description: prod.description || '', article_no: prod.article_no || '',
      is_featured: prod.is_featured || false
    });
    setActiveTab('products');
    setTimeout(() => {
      document.getElementById('product-creation-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDelete = async (id, table = 'products') => {
    if (confirm(`Are you sure you want to completely wipe this item record from ${table}?`)) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) fetchAllSystemData();
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (confirm(`Wipe selected ${selectedItems.length} active row elements from database ledger?`)) {
      setLoading(true);
      const { error } = await supabase.from('products').delete().in('id', selectedItems);
      if (!error) {
        alert("Batch clearing execution sequence complete.");
        setSelectedItems([]);
        fetchAllSystemData();
      }
      setLoading(false);
    }
  };

  const triggerDatabaseBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ products, categories, banners, orders }, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `Zonix_Mart_ERP_MasterBackup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const outOfStockCount = products.filter(item => (parseInt(item.inventory) || 0) === 0).length;
  return (
    <div className="bg-[#0b0f19] text-[#f1f5f9] min-h-screen flex flex-col md:flex-row font-sans antialiased selection:bg-[#ff4d00] selection:text-white">
      
      {/* Side Control Command Navigation Hub */}
      <aside className="w-full md:w-64 bg-[#111827] border-b md:border-r border-[#1e293b]/40 p-6 flex flex-col justify-between shadow-xl relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff4d00] to-[#ffaa00] flex items-center justify-center shadow-lg shadow-[#ff4d00]/20">
              <Globe className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">Zonix Mart</h1>
              <p className="text-xs text-[#64748b] font-medium">Control Station Live</p>
            </div>
          </div>

          <div className="mb-4 px-2 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
            Main Management Panel
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'products', label: 'Products Master', icon: Package },
              { id: 'categories', label: 'Categories Matrix', icon: Layers },
              { id: 'orders', label: 'Live Orders Tracker', icon: ClipboardList },
              { id: 'banners', label: 'Poster & Banners', icon: ImageIcon },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#ff4d00]/15 to-transparent border-l-4 border-[#ff4d00] text-[#ff4d00]'
                      : 'text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#ff4d00]' : 'text-[#475569]'}`} />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-[#64748b]" />
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 pt-4 border-t border-[#1e293b]/60 px-2">
          <div className="flex items-center gap-3 bg-[#1e293b]/30 p-3 rounded-xl border border-[#1e293b]/40">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <div>
              <p className="text-xs text-[#94a3b8] font-medium">Logged in Admin</p>
              <p className="text-[11px] text-[#64748b] truncate font-mono">hasnainarain193@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Screen Content Stream Node */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
        
        {/* Dynamic Header Controls Grid */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 pb-6 border-b border-[#1e293b]/40">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ff4d00] tracking-wider uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d00]"></span>
              Zonix Advanced Engine Node Active
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">
              {activeTab === 'products' && "Product Ecosystem Grid"}
              {activeTab === 'categories' && "Database Categories Architecture"}
              {activeTab === 'orders' && "Live Orders Control Folder"}
              {activeTab === 'banners' && "Promotional Display Manager"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={fetchAllSystemData}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] border border-[#1e293b]/80 rounded-xl text-xs font-semibold text-[#94a3b8] hover:text-white transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ff4d00]' : ''}`} />
              Sync Grid Arrays
            </button>
            <button
              onClick={triggerDatabaseBackup}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-semibold transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export System JSON
            </button>
          </div>
        </header>

        {/* Live System Scoreboards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-[#111827] border border-[#1e293b]/40 p-5 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="text-xs font-bold text-[#64748b] tracking-wider uppercase mb-2">Live Nodes Tracking</div>
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
              <span>{liveStats.activeUsers}</span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> Online</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1e293b]/40 p-5 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="text-xs font-bold text-[#64748b] tracking-wider uppercase mb-2">Total Catalog Items</div>
            <div className="text-3xl font-black text-white tracking-tight">
              <span>{products.length}</span>
              <span className="text-xs text-[#94a3b8] font-medium ml-1">Items</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1e293b]/40 p-5 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="text-xs font-bold text-[#64748b] tracking-wider uppercase mb-2">Live Pending Orders</div>
            <div className="text-3xl font-black text-amber-400 tracking-tight">
              <span>{orders.length}</span>
              <span className="text-xs text-[#64748b] font-medium ml-1">Orders</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1e293b]/40 p-5 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="text-xs font-bold text-[#64748b] tracking-wider uppercase mb-2">Stock Warnings</div>
            <div className="text-3xl font-black text-rose-400 tracking-tight flex items-baseline gap-2">
              <span>{outOfStockCount}</span>
              {outOfStockCount > 0 && <span className="text-xs text-rose-400 font-bold px-1.5 py-0.5 bg-rose-500/10 rounded-md">Action Required</span>}
            </div>
          </div>
        </section>
        {/* Dynamic Route Switching View Terminal Panels */}
        <div className="space-y-10">

          {/* TAB 1: Advanced Products Publisher Management Terminal */}
          {activeTab === 'products' && (
            <div className="space-y-8">
              {/* Product Creation Matrix Form */}
              <div id="product-creation-form" className="bg-[#111827] border border-[#1e293b]/40 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-[#ff4d00]" /> 
                  {editMode ? "Modify Selected Active Product" : "Add Product to Live Grid"}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Product Name *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Luxury Arabic Perfume" className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-sm focus:outline-none focus:border-[#ff4d00] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Price (OMR) *</label>
                    <input type="number" step="0.001" required value={formData.price_omr} onChange={e => setFormData({...formData, price_omr: e.target.value})} placeholder="e.g. 24.500" className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-sm font-mono focus:outline-none focus:border-[#ff4d00] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Warehouse Stock</label>
                    <input type="number" value={formData.inventory} onChange={e => setFormData({...formData, inventory: e.target.value})} placeholder="e.g. 50" className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-sm font-mono focus:outline-none focus:border-[#ff4d00] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Target Sync Category Block *</label>
                    <select value={formData.category} required onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-sm focus:outline-none focus:border-[#ff4d00] transition-all cursor-pointer">
                      <option value="" disabled className="bg-[#111827]">Select Category Placement</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat.name} className="bg-[#111827]">{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Article No / SKU Reference *</label>
                    <input type="text" required value={formData.article_no} onChange={e => setFormData({...formData, article_no: e.target.value})} placeholder="e.g. AR-PERF-092" className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-sm font-mono focus:outline-none focus:border-[#ff4d00] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Image URL / Upload</label>
                    <div className="flex gap-2">
                      <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://image-link.com" className="flex-1 px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-xs truncate focus:outline-none focus:border-[#ff4d00] transition-all" />
                      <label className="px-3 py-3 bg-[#1e293b] border border-[#334155]/60 hover:bg-[#334155] rounded-xl text-xs font-bold text-[#94a3b8] hover:text-white cursor-pointer transition-all flex items-center justify-center">
                        {uploading ? '...' : 'Upload'}
                        <input type="file" accept="image/*" onChange={(e) => handleFileUploadStream(e, 'product')} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Product Description Log</label>
                    <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Enter specifications..." className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-sm resize-none focus:outline-none focus:border-[#ff4d00] transition-all"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Product Tags</label>
                    <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. Best Seller, New" className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-sm focus:outline-none focus:border-[#ff4d00] transition-all" />
                  </div>
                  <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1e293b] px-4 py-3 rounded-xl select-none lg:mt-7 cursor-pointer" onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}>
                    <button type="button" className={`p-1 rounded transition-all ${formData.is_featured ? 'text-[#ffaa00]' : 'text-slate-600'}`}>
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                    <div>
                      <p className="text-xs font-bold text-white">Prioritize Top Placement</p>
                      <p className="text-[10px] text-[#64748b]">Force to topmost row layout instantly</p>
                    </div>
                  </div>
                  <div className="lg:col-span-3 flex justify-end gap-3 border-t border-[#1e293b]/40 pt-4 mt-4">
                    {editMode && (
                      <button type="button" onClick={() => { setEditMode(false); setTargetId(null); setFormData({ name: '', price_omr: '', inventory: '', category: '', tags: '', image: '', description: '', article_no: '', is_featured: false }); }} className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all">
                        Cancel Editing
                      </button>
                    )}
                    <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-[#ff4d00] to-[#ffaa00] hover:opacity-90 text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-lg transition-all">
                      Save Product Record
                    </button>
                  </div>
                </form>
              </div>
              {/* Data Table Catalog Ledger */}
              <div className="bg-[#111827] border border-[#1e293b]/40 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-[#1e293b]/40 flex justify-between items-center bg-[#111827]">
                  <div>
                    <h3 className="font-bold text-lg text-white">Active Catalog Ledger</h3>
                    <p className="text-xs text-[#64748b]">Select items to perform automated batch bulk actions</p>
                  </div>
                  {selectedItems.length > 0 && (
                    <button type="button" onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all">
                      Bulk Wipe ({selectedItems.length})
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0b0f19] text-[#64748b] text-[11px] font-bold uppercase tracking-wider border-b border-[#1e293b]/60">
                        <th className="p-4 w-12 text-center">Select</th>
                        <th className="p-4">Item Details & Article SKU</th>
                        <th className="p-4">Category Cluster</th>
                        <th className="p-4">Financial Matrix</th>
                        <th className="p-4">Warehouse Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b]/40 text-sm text-[#94a3b8]">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-xs font-semibold text-[#475569]">
                            No products configured inside database grid.
                          </td>
                        </tr>
                      ) : (
                        products.map((prod) => (
                          <tr key={prod.id} className={`hover:bg-[#1e293b]/30 ${prod.is_featured ? 'bg-[#ffaa00]/5 border-l-4 border-l-[#ffaa00]' : ''}`}>
                            <td className="p-4 text-center">
                              <button type="button" onClick={() => toggleSelectItem(prod.id)} className="text-[#ff4d00]">
                                {selectedItems.includes(prod.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                              </button>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-4">
                                <img src={prod.image} alt={prod.name} className="w-11 h-11 object-cover rounded-xl border border-[#1e293b]" onError={(e) => { e.target.src = 'https://unsplash.com'; }} />
                                <div>
                                  <div className="font-bold text-white flex items-center gap-2">
                                    {prod.name} 
                                    {prod.is_featured && <span className="text-[10px] text-[#ffaa00] bg-[#ffaa00]/10 px-1.5 py-0.5 rounded-md font-bold">TOP</span>}
                                  </div>
                                  <div className="text-[11px] font-mono text-[#ffaa00] mt-0.5">Art No: {prod.article_no || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-xs font-bold uppercase tracking-wider">
                                {prod.category}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-white">
                              {parseFloat(prod.price_omr || 0).toFixed(3)} <span className="text-[10px] text-[#64748b]">OMR</span>
                            </td>
                            <td className="p-4 font-mono text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${(parseInt(prod.inventory) || 0) === 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                <span>{prod.inventory} Units</span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleEditTrigger(prod)} className="p-2 bg-slate-800 hover:bg-[#ff4d00]/10 text-slate-400 hover:text-[#ff4d00] rounded-xl transition-all">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => handleDelete(prod.id, 'products')} className="p-2 bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Live Orders Control & Calendar Filter History Folder */}
          {activeTab === 'orders' && (
            <div className="space-y-8">
              {/* Calendar Date Engine Lookup Node */}
              <div className="bg-[#111827] border border-[#1e293b]/40 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#ff4d00]" />
                    Live Customer Orders Terminal Archive
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">Realtime orders lookup tracker with calendar scheduling matrices</p>
                </div>
                <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1e293b] px-3 py-2 rounded-xl w-full sm:w-auto">
                  <Calendar className="w-4 h-4 text-[#ff4d00]" />
                  <input 
                    type="date" 
                    value={orderDateFilter} 
                    onChange={e => setOrderDateFilter(e.target.value)} 
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer scheme-dark"
                  />
                  {orderDateFilter && (
                    <button type="button" onClick={() => setOrderDateFilter('')} className="text-[10px] text-rose-400 font-bold ml-1 hover:underline">Clear</button>
                  )}
                </div>
              </div>

              {/* First 10 Orders Dynamic Ledger Table Grid */}
              <div className="bg-[#111827] border border-[#1e293b]/40 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-5 border-b border-[#1e293b]/40 bg-[#111827]">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Top 10 Live Direct System Orders Stream</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm text-[#94a3b8]">
                    <thead>
                      <tr className="bg-[#0b0f19] text-[#64748b] text-[11px] font-bold uppercase tracking-wider border-b border-[#1e293b]/60">
                        <th className="p-4">Customer Credentials</th>
                        <th className="p-4">Delivery Matrix Address</th>
                        <th className="p-4">Purchased Product Details</th>
                        <th className="p-4">Invoice Volume</th>
                        <th className="p-4 text-right">Action Anchors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b]/40">
                      {orders
                        .filter(ord => !orderDateFilter || ord.created_at?.startsWith(orderDateFilter))
                        .slice(0, 10).length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-xs font-semibold text-[#475569]">
                            No live customer placement logs matching the defined date sequence matrices.
                          </td>
                        </tr>
                      ) : (
                        orders
                          .filter(ord => !orderDateFilter || ord.created_at?.startsWith(orderDateFilter))
                          .slice(0, 10).map((ord) => (
                            <tr key={ord.id} className="hover:bg-[#1e293b]/30 transition-all">
                              <td className="p-4">
                                <div className="font-bold text-white">{ord.customer_name || 'Anonymous Buyer'}</div>
                                <div className="text-[11px] text-[#64748b] font-mono mt-0.5">{ord.customer_email || 'no-email@zonix.com'}</div>
                                <div className="text-[11px] font-bold text-[#ff4d00] mt-0.5">{ord.customer_phone || 'N/A Phone'}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-xs text-slate-300 max-w-[200px] line-clamp-2">{ord.customer_address || 'No shipping destination logged.'}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={ord.product_image || 'https://unsplash.com'} 
                                    alt="Ordered Item" 
                                    className="w-9 h-9 object-cover rounded-lg border border-[#1e293b]"
                                    onError={(e) => { e.target.src = 'https://unsplash.com'; }}
                                  />
                                  <div>
                                    <div className="font-bold text-white text-xs">{ord.product_name || 'Zonix Stock Unit'}</div>
                                    <div className="text-[10px] text-[#64748b] font-mono">Art SKU Ref: {ord.product_article || 'N/A'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-mono font-bold text-emerald-400">
                                {parseFloat(ord.total_price_omr || 0).toFixed(3)} <span className="text-[10px] text-[#64748b]">OMR</span>
                              </td>
                              <td className="p-4 text-right">
                                <button 
                                  type="button" 
                                  onClick={() => handleDelete(ord.id, 'orders')} 
                                  className="p-2 bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Database Categories Architecture Node Manager Grid */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Category Insertion Module */}
              <div className="bg-[#111827] border border-[#1e293b]/40 rounded-2xl p-6 shadow-xl h-fit">
                <h3 className="text-base font-bold text-white mb-4">Generate Category Module</h3>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#64748b] font-bold uppercase tracking-wider">Category Name Cluster</label>
                    <input type="text" required value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g. Smart Smartwatches" className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-sm focus:outline-none focus:border-[#ff4d00] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#64748b] font-bold uppercase tracking-wider">Category Representative Image</label>
                    <div className="flex gap-2">
                      <input type="text" value={newCategoryImage} onChange={e => setNewCategoryImage(e.target.value)} placeholder="https://image-url.com" className="flex-1 px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-xs truncate focus:outline-none focus:border-[#ff4d00] transition-all" />
                      <label className="px-3 py-3 bg-[#1e293b] hover:bg-[#334155] text-xs font-bold text-[#94a3b8] hover:text-white rounded-xl cursor-pointer transition-all flex items-center justify-center">
                        Upload
                        <input type="file" accept="image/*" onChange={(e) => handleFileUploadStream(e, 'category')} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-[#ff4d00] hover:bg-[#ff4d00]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md">
                    Inject Category Block
                  </button>
                </form>
              </div>

              {/* Persistent Live Category Preview Grid Maps */}
              <div className="lg:col-span-2 bg-[#111827] border border-[#1e293b]/40 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-2">Live Category Terminal Channels</h3>
                <p className="text-xs text-[#64748b] mb-6">These blocks sync directly to the user storefront grid layouts from permanent cloud tables.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl overflow-hidden group shadow-md relative">
                      <div className="h-28 w-full overflow-hidden relative">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" onError={(e) => { e.target.src = 'https://unsplash.com'; }} />
                      </div>
                      <div className="p-4 bg-[#0b0f19] flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-sm text-white group-hover:text-[#ff4d00] transition-all">{cat.name}</h4>
                          <p className="text-[10px] text-[#475569] font-mono mt-1">Linked Items: {products.filter(p => p.category === cat.name).length}</p>
                        </div>
                        <button type="button" onClick={() => handleDelete(cat.id, 'categories')} className="p-1.5 bg-slate-900 hover:text-rose-400 rounded-md transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Global Website Promotional Poster Display Banner Line Control Panel */}
          {activeTab === 'banners' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Poster Card Deployment Node */}
              <div className="bg-[#111827] border border-[#1e293b]/40 rounded-2xl p-6 shadow-xl h-fit">
                <h3 className="text-base font-bold text-white mb-4">Deploy Display Banner</h3>
                <form onSubmit={handleCreateBanner} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#64748b] font-bold uppercase tracking-wider">Poster Heading Context</label>
                    <input type="text" required value={newBannerTitle} onChange={e => setNewBannerTitle(e.target.value)} placeholder="e.g. Mega Sale 50% Off Everything" className="w-full px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-sm focus:outline-none focus:border-[#ff4d00] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#64748b] font-bold uppercase tracking-wider">Poster Background Image URL</label>
                    <div className="flex gap-2">
                      <input type="text" required value={newBannerImage} onChange={e => setNewBannerImage(e.target.value)} placeholder="https://image-url.com" className="flex-1 px-4 py-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white text-xs truncate focus:outline-none focus:border-[#ff4d00] transition-all" />
                      <label className="px-3 py-3 bg-[#1e293b] hover:bg-[#334155] text-xs font-bold text-[#94a3b8] hover:text-white rounded-xl cursor-pointer transition-all flex items-center justify-center">
                        Upload
                        <input type="file" accept="image/*" onChange={(e) => handleFileUploadStream(e, 'banner')} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md">
                    Inject Banner Card
                  </button>
                </form>
              </div>

              {/* Active Layout Sliders Matrix Frontend Preview */}
              <div className="lg:col-span-2 bg-[#111827] border border-[#1e293b]/40 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-6">Active Layout Frontend Posters</h3>
                               <div className="space-y-4">
                  {banners.map((b) => (
                    <div key={b.id} className="bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl p-4 flex justify-between items-center gap-4 shadow-lg group">
                      <div className="flex items-center gap-4">
                        <img src={b.image} alt={b.title} className="w-24 h-14 object-cover rounded-lg border border-[#1e293b]" onError={(e) => { e.target.src = 'https://unsplash.com'; }} />
                        <div>
                          <h4 className="font-bold text-sm text-white group-hover:text-[#ff4d00] transition-all font-sans tracking-tight">{b.title}</h4>
                          <p className="text-[10px] text-[#475569] font-mono mt-1">UID Array Database Token: {b.id}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(b.id, 'banners')} 
                        className="p-2 bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}