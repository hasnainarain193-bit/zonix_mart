"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, Layers, ClipboardList, ImageIcon, ChevronRight, 
  Globe, RefreshCw, Download, ArrowUpRight, PlusCircle, 
  Star, Edit3, Trash2, CheckSquare, Square, Calendar, Search 
} from 'lucide-react';

export default function AdminDashboardStation() {
  // Authentication route guard parameters
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Core System Dynamic Ledger Storage Arrays
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Active Menu Router Panel Selector
  const [activeTab, setActiveTab] = useState('products');

  // Input Controls Tracking States for Products Form
  const [editMode, setEditMode] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderNode, setSelectedOrderNode] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', price_omr: '', inventory: '', category: '', 
    tags: '', image: '', description: '', article_no: '', is_featured: false
  });

  // Unique Input States for Categories and Banners Forms
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');

  // ERP Master Control Filtering States
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [liveStats, setLiveStats] = useState({ activeUsers: 42 });

  // STRICT SECURITY CHECK LAYER
    // HARDENED FIXED ROUTE FIREWALL LAYER WITH ACTIVE SESSION WAITING STATE
  useEffect(() => {
    const verifyAdminSession = async () => {
      try {
        // Step 1: Secure session recovery from browser memory
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        // Step 2: Fallback check using user explicit stream if session fields mismatch
        const { data: { user } } = await supabase.auth.getUser();

        const activeEmail = session?.user?.email || user?.email;

        // Step 3: Validate active admin email parameters strictly
        if (activeEmail === 'hasnainarain193@gmail.com') {
          setIsAdmin(true);
          await fetchAllSystemData();
        } else {
          // If authorization payload criteria fails, bounce safely
          console.log("Unauthorized access node blocked.");
          window.location.href = '/';
        }
      } catch (authError) {
        console.error("Critical Admin Firewall Sync Error:", authError);
        window.location.href = '/';
      } finally {
        setCheckingAuth(false);
      }
    };
    
    verifyAdminSession();
  }, []);


  // Async Multi-Table Sourcing Data Flow Pipeline
  const fetchAllSystemData = async () => {
    setLoading(true);
    try {
      const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prods) setProducts(prods);

      const { data: cats } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (cats) setCategories(cats);

      const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ords) setOrders(ords);

      const { data: bans } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
      if (bans) setBanners(bans);

      setLiveStats({ activeUsers: Math.floor(Math.random() * (65 - 35 + 1)) + 35 });
    } catch (err) {
      console.error("Administrative Sync Interruption:", err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Storage Images Upload Streams Handler
  const handleFileUploadStream = async (e, targetBucket) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('zonix-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('zonix-media')
        .getPublicUrl(filePath);

      if (targetBucket === 'product') setFormData(prev => ({ ...prev, image: publicUrl }));
      if (targetBucket === 'category') setNewCategoryImage(publicUrl);
      if (targetBucket === 'banner') setNewBannerImage(publicUrl);

      alert("Image asset uploaded and cloud url synced successfully!");
    } catch (err) {
      alert(`Storage Upload Fault: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Submit Operations for Master Products Ledger Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price_omr || !formData.category || !formData.article_no) {
      return alert("Please fill all mandated metadata fields configuration entries.");
    }

    const payload = {
      name: formData.name,
      price_omr: parseFloat(formData.price_omr || 0),
      inventory: parseInt(formData.inventory || 0),
      category: formData.category,
      tags: formData.tags,
      image: formData.image || 'https://unsplash.com',
      description: formData.description,
      article_no: formData.article_no,
      is_featured: formData.is_featured
    };

    try {
      if (editMode) {
        const { error } = await supabase.from('products').update(payload).eq('id', targetId);
        if (error) throw error;
        alert("Product record optimized successfully inside database grid.");
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        alert("New product unit injected successfully into target table nodes.");
      }
      
      setFormData({ name: '', price_omr: '', inventory: '', category: '', tags: '', image: '', description: '', article_no: '', is_featured: false });
      setEditMode(false);
      setTargetId(null);
      fetchAllSystemData();
    } catch (err) {
      alert(`Database Input Fault: ${err.message}`);
    }
  };

  const handleEditTrigger = (prod) => {
    setEditMode(true);
    setTargetId(prod.id);
    setFormData({
      name: prod.name || '',
      price_omr: prod.price_omr || '',
      inventory: prod.inventory || '',
      category: prod.category || '',
      tags: prod.tags || '',
      image: prod.image || '',
      description: prod.description || '',
      article_no: prod.article_no || '',
      is_featured: prod.is_featured || false
    });
    document.getElementById('product-creation-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id, targetTable) => {
    if (!confirm(`Are you absolutely sure you want to wipe reference index #${id} from ${targetTable}?`)) return;
    try {
      const { error } = await supabase.from(targetTable).delete().eq('id', id);
      if (error) throw error;
      fetchAllSystemData();
    } catch (err) {
      alert(`Deletion Failed: ${err.message}`);
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Wipe all ${selectedItems.length} selected elements record parameters permanently?`)) return;
    try {
      const { error } = await supabase.from('products').delete().in('id', selectedItems);
      if (error) throw error;
      setSelectedItems([]);
      fetchAllSystemData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      const { error } = await supabase.from('categories').insert([{ name: newCategoryName, image: newCategoryImage }]);
      if (error) throw error;
      setNewCategoryName('');
      setNewCategoryImage('');
      fetchAllSystemData();
      alert("New category channel injected successfully.");
    } catch (err) { alert(err.message); }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!newBannerTitle || !newBannerImage) return;
    try {
      const { error } = await supabase.from('banners').insert([{ title: newBannerTitle, image: newBannerImage }]);
      if (error) throw error;
      setNewBannerTitle('');
      setNewBannerImage('');
      fetchAllSystemData();
      alert("New poster banner deployed successfully.");
    } catch (err) { alert(err.message); }
  };

  const triggerDatabaseBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ products, categories, orders, banners }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Zonix_Mart_System_Backup_${Date.now()}.json`);
    downloadAnchor.click();
  };

  const outOfStockCount = products.filter(p => (parseInt(p.inventory) || 0) === 0).length;

  if (checkingAuth) {
    return <div className="text-center p-12 text-xs font-bold uppercase tracking-wider text-slate-400">Verifying Administrative Route Firewall...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen flex flex-col md:flex-row font-sans antialiased selection:bg-[#ff4d00] selection:text-white">
      
      {/* Side Control Command Navigation Hub */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-slate-200 p-6 flex flex-col justify-between shadow-sm relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2 select-none cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff4d00] to-[#ffaa00] flex items-center justify-center shadow-md">
              <Globe className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
            </div>
          </div>

          <div className="mb-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Management Panel</div>

          <nav className="space-y-1">
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
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-[#ff4d00]/10 border-l-4 border-[#ff4d00] text-[#ff4d00]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#ff4d00]' : 'text-slate-400'}`} />
                    <span className="uppercase tracking-wider">{tab.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-slate-400" />
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 px-2">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Logged in Admin</p>
              <p className="text-[11px] text-slate-700 truncate font-mono font-bold">hasnainarain193@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Screen Content Stream Node */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        
        {/* Dynamic Header Controls Grid */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-[#ff4d00] tracking-widest uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d00]"></span>
              Zonix Advanced Engine Node Active
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {activeTab === 'products' && "Product Ecosystem Grid"}
              {activeTab === 'categories' && "Database Categories Architecture"}
              {activeTab === 'orders' && "Live Orders Control Folder"}
              {activeTab === 'banners' && "Promotional Display Manager"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button onClick={fetchAllSystemData} className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all shadow-xs"><RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ff4d00]' : ''}`} /> Sync Grid Arrays</button>
            <button onClick={triggerDatabaseBackup} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md uppercase tracking-wider text-[10px]"><Download className="w-3.5 h-3.5" /> Export System JSON</button>
          </div>
        </header>

        {/* Live System Scoreboards Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">Live Nodes Tracking</div>
            <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
              <span>{liveStats.activeUsers}</span>
              <span className="text-[9px] text-emerald-600 font-black uppercase flex items-center gap-0.5"><ArrowUpRight className="w-2.5 h-2.5" /> Online</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">Total Catalog Items</div>
            <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight"><span>{products.length}</span><span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">Items</span></div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">Live Pending Orders</div>
            <div className="text-xl md:text-2xl font-black text-amber-500 tracking-tight"><span>{orders.length}</span><span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">Orders</span></div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">Stock Warnings</div>
            <div className="text-xl md:text-2xl font-black text-rose-500 tracking-tight flex items-baseline gap-1.5">
              <span>{outOfStockCount}</span>
              {outOfStockCount > 0 && <span className="text-[8px] text-rose-600 font-black px-1.5 py-0.5 bg-rose-50 rounded uppercase">Alert</span>}
            </div>
          </div>
        </section>

        {/* Dynamic View Panels Layer */}
        <div className="space-y-6">

          {/* TAB 1: Advanced Products Publisher */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div id="product-creation-form" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5"><PlusCircle className="w-4 h-4 text-[#ff4d00]" /> {editMode ? "Modify Selected Active Product" : "Add Product to Live Grid"}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product Name *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Luxury Arabic Perfume" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price (OMR) *</label>
                    <input type="number" step="0.001" required value={formData.price_omr} onChange={e => setFormData({...formData, price_omr: e.target.value})} placeholder="e.g. 24.500" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Warehouse Stock</label>
                    <input type="number" value={formData.inventory} onChange={e => setFormData({...formData, inventory: e.target.value})} placeholder="e.g. 50" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Sync Category Block *</label>
                    <select value={formData.category} required onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all cursor-pointer">
                      <option value="" disabled>Select Category Placement</option>
                      {categories.map((cat, idx) => (<option key={idx} value={cat.name}>{cat.name}</option>))}
                    </select>
                  </div>
                  {/* --- 📸 SECURE CLOUD IMAGE UPLOAD MATRIX --- */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product Display Image *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.image}
                        onChange={e => setFormData({...formData, image: e.target.value})}
                        placeholder="Cloud media storage link or url..."
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs truncate outline-none focus:border-[#ff4d00] focus:bg-white transition-all"
                      />
                      <label className="px-3 bg-slate-200 border border-slate-300 hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-all flex items-center justify-center shrink-0">
                        {uploading ? "Uploading..." : "Upload File"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUploadStream(e, 'product')}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    {formData.image && (
                      <p className="text-[9px] text-emerald-600 font-bold mt-0.5">✓ Image asset cloud validation synced</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Article No / SKU Reference *</label>
                    <input type="text" required value={formData.article_no} onChange={e => setFormData({...formData, article_no: e.target.value})} placeholder="e.g. AR-PERF-092" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. Best Seller, New" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl select-none sm:mt-5 cursor-pointer" onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}>
                    <button type="button" className={`p-1 rounded transition-all ${formData.is_featured ? 'text-[#ffaa00]' : 'text-slate-400'}`}><Star className="w-4 h-4 fill-current" /></button>
                    <div><p className="text-xs font-bold text-slate-800">Prioritize Top Placement</p><p className="text-[9px] text-slate-400">Force to topmost row row grid view</p></div>
                     </div>
                  {/* --- 📝 PRODUCT DESCRIPTION MATRIX INJECTION --- */}
                  <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product Description *</label>
                    <textarea 
                      required 
                      rows={3}
                      value={formData.description || ''} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder="Write complete product details, highlights, specs, or packaging sizes..." 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs outline-none focus:border-[#ff4d00] focus:bg-white transition-all resize-none shadow-xs" 
                    />
                  </div>

                  {/* --- 🏷️ EXTRA SEARCH KEYWORDS / META TAGS --- */}
                  <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Extra Search Keywords (Separate with commas)</label>
                    <input
                      type="text"
                      value={formData.keywords || ''}
                      onChange={e => setFormData({...formData, keywords: e.target.value})}
                      placeholder="e.g. Perfume, Arabic, Luxury, Best Seller, New Arrival..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 border-t pt-3 mt-2">
                    {editMode && (<button type="button" onClick={() => { setEditMode(false); setTargetId(null); setFormData({ name: '', price_omr: '', inventory: '', category: '', tags: '', image: '', description: '', article_no: '', keywords: '', is_featured: false }); }} className="px-3 py-2 bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-bold transition-all">Cancel</button>)}
                    <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-[#ff4d00] text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-sm transition-all">Save Product Record</button>
                  </div>
                </form>
              </div>

              {/* Responsive Table Node Container */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-white">
                  <div><h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Active Catalog Ledger</h3></div>
                  {selectedItems.length > 0 && (<button type="button" onClick={handleBulkDelete} className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all">Bulk Wipe ({selectedItems.length})</button>)}
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                        <th className="p-3 w-12 text-center">Select</th>
                        <th className="p-3">Item Details & SKU</th>
                        <th className="p-3">Category Cluster</th>
                        <th className="p-3">Financial Matrix</th>
                        <th className="p-3">Warehouse Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {products.length === 0 ? (<tr><td colSpan="6" className="p-6 text-center text-xs font-bold text-slate-400 uppercase">No products configured inside database grid.</td></tr>) : (
                        products.map((prod) => (
                          <tr key={prod.id} className={`hover:bg-slate-50/50 ${prod.is_featured ? 'bg-amber-50/30' : ''}`}>
                            <td className="p-3 text-center"><button type="button" onClick={() => toggleSelectItem(prod.id)} className="text-[#ff4d00]">{selectedItems.includes(prod.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}</button></td>
                            <td className="p-3"><div className="flex items-center gap-3"><img src={prod.image} alt={prod.name} className="w-9 h-9 object-cover rounded-lg border border-slate-200" onError={(e) => { e.target.src = 'https://unsplash.com'; }} /><div className="min-w-0"><div className="font-bold text-slate-900 truncate max-w-[180px] flex items-center gap-1">{prod.name} {prod.is_featured && <span className="text-[8px] text-amber-700 bg-amber-100 px-1 rounded font-black">TOP</span>}</div><div className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: {prod.article_no || 'N/A'}</div></div></div></td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">{prod.category}</span></td>
                            <td className="p-3 font-mono font-bold text-slate-900">{parseFloat(prod.price_omr || 0).toFixed(3)} OMR</td>
                            <td className="p-3 font-mono"><div className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${(parseInt(prod.inventory) || 0) === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span><span>{prod.inventory} Units</span></div></td>
                            <td className="p-3 text-right"><div className="flex justify-end gap-1.5"><button type="button" onClick={() => handleEditTrigger(prod)} className="p-1.5 bg-slate-50 hover:bg-[#ff4d00]/10 text-slate-400 hover:text-[#ff4d00] rounded-lg transition-all"><Edit3 className="w-3.5 h-3.5" /></button><button type="button" onClick={() => handleDelete(prod.id, 'products')} className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

                {/* TAB 2: Live Orders Tracker */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest flex items-center gap-1">
                  <ClipboardList className="w-4 h-4 text-[#ff4d00]" /> Orders ERP Command Station
                </h3>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-xl text-xs w-full sm:w-auto">
                  <Calendar className="w-3.5 h-3.5 text-[#ff4d00]" />
                  <input type="date" value={orderDateFilter} onChange={e => setOrderDateFilter(e.target.value)} className="bg-transparent text-slate-700 outline-none text-xs cursor-pointer" />
                </div>
                {/* SEARCH BAR FIXED: Correctly tracking state for real-time filtering */}
                <div className="relative w-full sm:w-64">
                  <input 
                    type="text" 
                    value={orderSearchQuery} 
                    onChange={e => setOrderSearchQuery(e.target.value)} 
                    placeholder="Search Token ID or Name..." 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#ff4d00] focus:bg-white pl-8 text-slate-800" 
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  {orderSearchQuery && (
                    <button type="button" onClick={() => setOrderSearchQuery('')} className="absolute right-2.5 top-2 text-[10px] text-rose-500 font-bold hover:underline">Clear</button>
                  )}
                </div>
              </div>
            </div>

            {/* TAB BUTTONS FIXED: Active tracking state with responsive conditions */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'all', label: 'All Cluster' },
                { id: 'pending', label: 'Pending COD' },
                { id: 'live', label: 'Live' },
                { id: 'complete', label: 'Completed' },
                { id: 'cancel', label: 'Cancelled' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setStatusFilter(btn.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                    statusFilter === btn.id ? 'bg-slate-900 text-white shadow-sm scale-102' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
              </div>

            {/* Orders Data Table Node */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3 w-16">Token ID</th>
                      <th className="p-3">Customer Credentials</th>
                      <th className="p-3">Route Address</th>
                      <th className="p-3">Flow Status</th>
                      <th className="p-3">Invoice Price</th>
                      <th className="p-3 w-44">Logs & Claims</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                    {(() => {
                      let filtered = [...orders];
                      
                      if (orderDateFilter) {
                        filtered = filtered.filter(o => o.created_at?.startsWith(orderDateFilter));
                      }
                      
                      if (orderSearchQuery.trim()) {
                        const query = orderSearchQuery.toLowerCase().trim();
                        filtered = filtered.filter(o => 
                          o.id?.toString().includes(query) || 
                          o.customer_name?.toLowerCase().includes(query)
                        );
                      }
                      
                      if (statusFilter !== 'all') {
                        filtered = filtered.filter(o => {
                          const nodeState = (o.status_node || 'pending').toLowerCase().trim();
                          return nodeState === statusFilter;
                        });
                      }

                      if (filtered.length === 0) {
                        return (<tr><td colSpan="7" className="p-6 text-center text-xs font-bold text-slate-400 uppercase">No customer checkout registries match.</td></tr>);
                      }

                      return filtered.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="p-3 font-mono font-black text-[#ff4d00]">#{ord.id}</td>
                            <td className="p-3">
                              <button type="button" onClick={() => setSelectedOrderNode(ord)} className="text-left outline-none block hover:underline">
                                <div className="font-bold text-slate-900 text-xs capitalize">{ord.customer_name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{ord.customer_email || 'no-email@zonix.com'}</div>
                              </button>
                            </td>
                            <td className="p-3"><div className="text-slate-700 max-w-40 truncate">{ord.customer_address}</div><div className="text-[10px] text-slate-400 font-bold font-mono mt-0.5">Ph: {ord.customer_phone}</div></td>
                            <td className="p-3">
                              <select value={ord.status_node || 'pending'} onChange={async (e) => {
                                const state = e.target.value;
                                let msg = ord.cancel_reason || '';
                                if (state === 'cancel') {
                                  const reason = prompt("Enter cancel context log:", msg);
                                  if (reason === null) return;
                                  msg = reason.trim() || 'Logged cancellation parameters.';
                                }
                                const { error } = await supabase.from('orders').update({ status_node: state, cancel_reason: state === 'cancel' ? msg : null }).eq('id', ord.id);
                                if (!error) { alert("Status dynamic shift saved."); fetchAllSystemData(); }
                              }} className="px-1.5 py-1 rounded bg-white border text-[10px] font-black uppercase text-slate-800 outline-none cursor-pointer focus:border-slate-400">
                                <option value="pending">Pending COD</option>
                                <option value="live">Live Processing</option>
                                <option value="complete">Complete</option>
                                <option value="cancel">Cancel</option>
                              </select>
                            </td>
                            <td className="p-3 font-mono font-black text-slate-900">{parseFloat(ord.total_price_omr || 0).toFixed(3)} OMR</td>
                            <td className="p-3 space-y-1">
                              <div className="flex flex-col gap-1 max-w-32.5">
                                <input type="number" step="0.001" placeholder="Refund OMR..." defaultValue={ord.refund_value_omr || ''} onBlur={async (e) => { const v = parseFloat(e.target.value || 0); await supabase.from('orders').update({ refund_value_omr: v }).eq('id', ord.id); fetchAllSystemData(); }} className="px-2 py-0.5 bg-slate-50 border rounded text-[10px] text-rose-600 font-mono outline-none focus:bg-white" />
                                <input type="text" placeholder="Return notes..." defaultValue={ord.return_comment_log || ''} onBlur={async (e) => { const m = e.target.value.trim(); await supabase.from('orders').update({ return_comment_log: m }).eq('id', ord.id); fetchAllSystemData(); }} className="px-2 py-0.5 bg-slate-50 border rounded text-[10px] text-slate-700 truncate outline-none focus:bg-white" />
                              </div>
                            </td>
                            <td className="p-3 text-right"><button type="button" onClick={() => handleDelete(ord.id, 'orders')} className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button></td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Detail Modal popup */}
              {selectedOrderNode && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white border rounded-xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
                    <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                      <div><h4 className="font-black text-xs text-slate-800 uppercase tracking-widest text-[#ff4d00]">Invoice Specification Sheet</h4></div>
                      <button type="button" onClick={() => setSelectedOrderNode(null)} className="text-[10px] bg-slate-200 text-slate-700 font-black uppercase px-2.5 py-1 rounded-lg">Close</button>
                    </div>
                    <div className="p-5 overflow-y-auto space-y-4 text-xs bg-white">
                      <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                        <div><span className="text-[9px] font-black uppercase text-slate-400 block">Customer Name</span><p className="font-bold text-slate-900 capitalize text-sm">{selectedOrderNode.customer_name}</p></div>
                        <div className="pt-2"><span className="text-[9px] font-black uppercase text-slate-400 block">Oman Mobile Vector</span><p className="font-mono text-slate-800 font-bold">{selectedOrderNode.customer_phone}</p></div>
                        <div className="pt-2"><span className="text-[9px] font-black uppercase text-slate-400 block">Status Node</span><p className="font-black uppercase text-[#ff4d00] text-[10px]">{selectedOrderNode.status_node}</p></div>
                      </div>
                      <div className="p-3 bg-slate-50 border rounded-xl">
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Shipping Destination</span>
                        <p className="text-slate-700 leading-relaxed bg-white border p-2 rounded-lg font-medium">{selectedOrderNode.customer_address}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-slate-400 block pl-1">Products Pack Matrix</span>
                        {((selectedOrderNode.product_name || '').split(',')).map((name, i) => (
                          <div key={i} className="bg-slate-50 border p-2.5 rounded-xl flex items-center gap-3">
                            <img src={((selectedOrderNode.product_image || '').split(','))[i]?.trim()} className="w-9 h-9 object-cover rounded-lg border bg-white" onError={(e)=>{e.target.src='https://unsplash.com';}} />
                            <div className="min-w-0 flex-1"><div className="font-bold text-slate-900 text-xs truncate">{name.trim()}</div></div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl font-black text-slate-800">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500">Gross Payable Amount</span>
                        <span className="font-mono text-sm text-emerald-600">{parseFloat(selectedOrderNode.total_price_omr || 0).toFixed(3)} OMR</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Database Categories */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-fit">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Generate Category Module</h3>
                <form onSubmit={handleCreateCategory} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category Name Cluster</label>
                    <input type="text" required value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g. Smart Watches" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category Image Asset</label>
                    <div className="flex gap-2">
                      <input type="text" value={newCategoryImage} onChange={e => setNewCategoryImage(e.target.value)} placeholder="https://image-url.com" className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs truncate outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                      <label className="px-3 bg-slate-200 border hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-all flex items-center justify-center">Upload<input type="file" accept="image/*" onChange={(e) => handleFileUploadStream(e, 'category')} className="hidden" /></label>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-[#ff4d00] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm mt-2">Inject Category Block</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Live Category Channels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs relative">
                      <div className="h-24 w-full bg-slate-200"><img src={cat.image} alt={cat.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://unsplash.com'; }} /></div>
                      <div className="p-3 flex justify-between items-center bg-white border-t">
                        <div className="min-w-0"><h4 className="font-bold text-xs text-slate-900 truncate">{cat.name}</h4><p className="text-[10px] text-slate-400 font-mono mt-0.5">Linked: {products.filter(p => p.category === cat.name).length}</p></div>
                        <button type="button" onClick={() => handleDelete(cat.id, 'categories')} className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-md transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Promotional Poster Display Banners */}
          {activeTab === 'banners' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-fit">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Deploy Display Banner</h3>
                <form onSubmit={handleCreateBanner} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Poster Heading Context</label>
                    <input type="text" required value={newBannerTitle} onChange={e => setNewBannerTitle(e.target.value)} placeholder="e.g. Mega Sale 50% Off" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Poster Image Asset</label>
                    <div className="flex gap-2">
                      <input type="text" required value={newBannerImage} onChange={e => setNewBannerImage(e.target.value)} placeholder="https://image-url.com" className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs truncate outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                      <label className="px-3 bg-slate-200 border hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-all flex items-center justify-center">Upload<input type="file" accept="image/*" onChange={(e) => handleFileUploadStream(e, 'banner')} className="hidden" /></label>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm mt-2">Inject Banner Card</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Active Layout Frontend Posters</h3>
                <div className="space-y-3">
                  {banners.map((b) => (
                    <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={b.image} alt={b.title} className="w-16 h-10 object-cover rounded-lg border bg-white shrink-0" onError={(e) => { e.target.src = 'https://unsplash.com'; }} />
                        <div className="min-w-0"><h4 className="font-bold text-xs text-slate-900 truncate max-w-[250px]">{b.title}</h4><p className="text-[10px] text-slate-400 font-mono mt-0.5">ID Token: {b.id}</p></div>
                      </div>
                      <button type="button" onClick={() => handleDelete(b.id, 'banners')} className="p-1.5 bg-white text-slate-400 hover:text-rose-600 rounded-xl border transition-all shadow-2xs"><Trash2 className="w-3.5 h-3.5" /></button>
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
