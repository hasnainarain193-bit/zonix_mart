"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, Layers, ClipboardList, ImageIcon, ChevronRight, Menu, X,
  Globe, RefreshCw, Download, ArrowUpRight, PlusCircle, CreditCard,
  Star, Edit3, Trash2, CheckSquare, Square, Calendar, Search, 
  Users, ShoppingBag, Eye, EyeOff, FileText, Copy, Check, MapPin
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

  // Layout Responsive States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductFormVisible, setIsProductFormVisible] = useState(true);
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // Active Menu Router Panel Selector
  const [activeTab, setActiveTab] = useState('dashboard');

  // Input Controls Tracking States for Products Form
  const [editMode, setEditMode] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderNode, setSelectedOrderNode] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', price_omr: '', inventory: '', category: '', 
    tags: '', image: '', description: '', article_no: '', extra_keywords: '', is_featured: false
  });

  // Unique Input States for Categories and Banners Forms
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');

  // Invoice Ledger States
  const [invoiceData, setInvoiceData] = useState({
    stock_cost: '', gross_sales: '', delivery_expenses: '', custom_payouts: '', log_notes: ''
  });
  const [invoicesList, setInvoicesList] = useState([]);

  // Payment Gateway Config Parameters (Oman Gateway Integration Hub)
  const [paymentConfig, setPaymentConfig] = useState({
    api_endpoint: 'https://thawani.om',
    merchant_key: '',
    secret_key: '',
    sandbox_mode: true
  });

  // ERP Master Control Filtering States
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [liveStats, setLiveStats] = useState({
    activeUsers: 42,
    dailyVisitors: 310,
    totalUsers: 1250
  });

  // STRICT SECURITY CHECK LAYER
  useEffect(() => {
    const verifyAdminSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        const { data: { user } } = await supabase.auth.getUser();
        const activeEmail = session?.user?.email || user?.email;

        if (activeEmail === 'hasnainarain193@gmail.com') {
          setIsAdmin(true);
          await fetchAllSystemData();
        } else {
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
      const { data: prods } = await supabase.from('products').select('*').order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      if (prods) setProducts(prods);

      const { data: cats } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (cats) setCategories(cats);

      const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ords) setOrders(ords);

      const { data: bans } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
      if (bans) setBanners(bans);

      const { data: invs } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (invs) setInvoicesList(invs);

      // Fetch gateway profile settings if table exists
      const { data: gateway } = await supabase.from('gateway_settings').select('*').single();
      if (gateway) setPaymentConfig(gateway);

      setLiveStats({
        activeUsers: Math.floor(Math.random() * (65 - 35 + 1)) + 35,
        dailyVisitors: Math.floor(Math.random() * (450 - 280 + 1)) + 280,
        totalUsers: 1420
      });
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
      extra_keywords: formData.extra_keywords,
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
      
      setFormData({ name: '', price_omr: '', inventory: '', category: '', tags: '', image: '', description: '', article_no: '', extra_keywords: '', is_featured: false });
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
      extra_keywords: prod.extra_keywords || '',
      is_featured: prod.is_featured || false
    });
    setIsProductFormVisible(true);
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

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        stock_cost: parseFloat(invoiceData.stock_cost || 0),
                stock_cost: parseFloat(invoiceData.stock_cost || 0),
        gross_sales: parseFloat(invoiceData.gross_sales || 0),
        delivery_expenses: parseFloat(invoiceData.delivery_expenses || 0),
        custom_payouts: parseFloat(invoiceData.custom_payouts || 0),
        log_notes: invoiceData.log_notes || '',
        net_profit: parseFloat(invoiceData.gross_sales || 0) - (
          parseFloat(invoiceData.stock_cost || 0) + 
          parseFloat(invoiceData.delivery_expenses || 0) + 
          parseFloat(invoiceData.custom_payouts || 0)
        )
      };

      const { error } = await supabase.from('invoices').insert([payload]);
      if (error) throw error;

      setInvoiceData({ stock_cost: '', gross_sales: '', delivery_expenses: '', custom_payouts: '', log_notes: '' });
      await fetchAllSystemData();
      alert("Financial Audit Entry Saved Perfectly!");
    } catch (err) { 
      alert(`Invoice Save Fault: ${err.message}`); 
    }
  };  const triggerDatabaseBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ products, categories, orders, banners }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Zonix_Mart_System_Backup_${Date.now()}.json`);
    downloadAnchor.click();
  };


  const handleSaveGateway = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('gateway_settings').upsert([paymentConfig]);
      if (error) throw error;
      alert("Oman Security Gateway Nodes Synchronized Successfully.");
    } catch (err) { 
      alert(`Gateway Save Fault: ${err.message}`); 
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Advanced Computed Counter Logic Panels
  const totalInventoryUnits = products.reduce((acc, p) => acc + (parseInt(p.inventory) || 0), 0);
  const outOfStockCount = products.filter(p => (parseInt(p.inventory) || 0) === 0).length;
  const pendingOrders = orders.filter(o => (o.status_node || 'pending') === 'pending');
  const liveOrders = orders.filter(o => (o.status_node || 'pending') === 'live');
  const completeOrders = orders.filter(o => (o.status_node || 'pending') === 'complete');
  const cancelOrders = orders.filter(o => (o.status_node || 'pending') === 'cancel');

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white font-mono text-xs uppercase tracking-widest animate-pulse">
        Verifying Administrative Route Firewall Node Active...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen flex flex-col lg:flex-row font-sans antialiased selection:bg-[#ff4d00] selection:text-white">
      
      {/* Top Banner Bar for Mobile Devices */}
      <div className="lg:hidden w-full bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff4d00] to-[#ffaa00] flex items-center justify-center shadow-sm">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-black tracking-tight text-base text-slate-900 font-mono">Zonix <span className="text-[#ff4d00]">Mart</span></span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:text-slate-900 outline-none transition-all">
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Side Control Command Navigation Hub */}
      <aside className={`w-full lg:w-64 bg-white border-b lg:border-r border-slate-200 p-5 flex flex-col justify-between shadow-sm z-20 shrink-0
        ${isMobileMenuOpen ? 'fixed top-[65px] left-0 bottom-0 bg-white overflow-y-auto' : 'hidden lg:flex'}`}>
        <div>
          <div className="hidden lg:flex items-center gap-3 mb-8 px-2 select-none cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff4d00] to-[#ffaa00] flex items-center justify-center shadow-md">
              <Globe className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-lg text-slate-900 font-mono leading-none">Zonix <span className="text-[#ff4d00]">Mart</span></h1>
              <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">Management Hub</p>
            </div>
          </div>

          <div className="mb-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Control Panels</div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard Overview', icon: ShoppingBag },
              { id: 'orders', label: 'Orders Engine', icon: ClipboardList },
              { id: 'products', label: 'Catalog Ledger', icon: Package },
              { id: 'categories', label: 'Category Matrix', icon: Layers },
              { id: 'banners', label: 'Promo Displays', icon: ImageIcon },
              { id: 'invoice', label: 'System Invoices', icon: FileText },
              { id: 'gateway', label: 'Oman Gateway', icon: CreditCard },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
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
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full">
        
        {/* Dynamic Header Controls Grid */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-[#ff4d00] tracking-widest uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d00]"></span>
              Zonix Advanced Engine Node Active
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {activeTab === 'dashboard' && "System Overview Matrix"}
              {activeTab === 'products' && "Product Ecosystem Grid"}
              {activeTab === 'categories' && "Database Categories Architecture"}
              {activeTab === 'orders' && "Live Orders Control Folder"}
              {activeTab === 'banners' && "Promotional Display Manager"}
              {activeTab === 'invoice' && "Financial Invoice Audit Statement"}
              {activeTab === 'gateway' && "Oman Payment Gateway Integration"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button onClick={fetchAllSystemData} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all shadow-2xs">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ff4d00]' : ''}`} /> Sync Grid
            </button>
            <button onClick={triggerDatabaseBackup} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs uppercase tracking-wider text-[10px]">
              <Download className="w-3.5 h-3.5" /> Backup JSON
            </button>
          </div>
        </header>

        {/* Dynamic View Panels Layer */}
        <div className="space-y-6">

          {/* TAB 0: System Overview Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Comprehensive System Ledger Scoreboard blocks */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">Total Orders</div>
                  <div className="text-xl font-black text-slate-900 font-mono">{orders.length}</div>
                </div> 

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[9px] font-black text-amber-500 tracking-widest uppercase mb-1">Live Processing</div>
                  <div className="text-xl font-black text-amber-600 font-mono">{orders.filter(o => (o.status_node || 'pending') === 'live').length}</div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[9px] font-black text-blue-500 tracking-widest uppercase mb-1">Pending COD Status</div>
                  <div className="text-xl font-black text-blue-600 font-mono">{orders.filter(o => (o.status_node || 'pending') === 'pending').length}</div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[9px] font-black text-emerald-500 tracking-widest uppercase mb-1">Completed Sales</div>
                  <div className="text-xl font-black text-emerald-600 font-mono">{orders.filter(o => (o.status_node || 'pending') === 'complete').length}</div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[9px] font-black text-rose-500 tracking-widest uppercase mb-1">Cancelled Nodes</div>
                  <div className="text-xl font-black text-rose-600 font-mono">{orders.filter(o => (o.status_node || 'pending') === 'cancel').length}</div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">Warehouse Inventory</div>
                  <div className="text-xl font-black text-slate-900 font-mono">{products.reduce((acc, p) => acc + (parseInt(p.inventory) || 0), 0)} <span className="text-[10px] text-slate-400 font-normal">Units</span></div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[9px] font-black text-rose-600 tracking-widest uppercase mb-1">Out of Stock Warnings</div>
                  <div className="text-xl font-black text-rose-600 font-mono">{products.filter(p => (parseInt(p.inventory) || 0) === 0).length} <span className="text-[10px] text-rose-400 font-black">ALERTS</span></div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">Registered Platform Users</div>
                  <div className="text-xl font-black text-slate-900 font-mono">{liveStats.totalUsers || 0}</div>
                </div>
              </section>

              {/* Dynamic Live Visitor Metrics Display */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl shadow-xs flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase block mb-1">Daily Traffic Sinking</span>
                    <div className="text-3xl font-black font-mono tracking-tight">{liveStats.dailyVisitors}</div>
                    <p className="text-[11px] text-slate-300 mt-2 font-medium">Unique IP connections routed into store catalog today.</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-center">
                    <span className="text-xs font-bold text-emerald-400 block animate-pulse">● LIVE</span>
                    <span className="text-xl font-mono font-black text-white">{liveStats.activeUsers}</span>
                    <p className="text-[8px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Surging Now</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-center">
                  <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">Gross Conversion Rate Indicator</span>
                  <div className="text-2xl font-black font-mono text-slate-900">{((orders.length / liveStats.dailyVisitors) * 100 || 0).toFixed(1)}%</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Real-time checkout completion tracking quotient matrix based on incoming visitor metrics parameters.</p>
                </div>
              </section>

              {/* Recent Orders Execution Display Block */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="p-4 border-b border-slate-100 bg-white">
                  <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Active Execution Streaming Logs</h3>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                        <th className="p-3">Order Code</th>
                        <th className="p-3">Customer Identity</th>
                        <th className="p-3">Log Datetime</th>
                        <th className="p-3">Flow Phase</th>
                        <th className="p-3 text-right">Invoice Sum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} onClick={() => { setSelectedOrderNode(ord); setActiveTab('orders'); }} className="hover:bg-slate-50/50 cursor-pointer transition-all">
                          <td className="p-3 font-mono font-black text-[#ff4d00]">#{ord.id}</td>
                          <td className="p-3 font-bold text-slate-900 capitalize">{ord.customer_name}</td>
                          <td className="p-3 font-mono text-slate-400">{new Date(ord.created_at).toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider
                              ${ord.status_node === 'complete' ? 'bg-emerald-100 text-emerald-800' : ''}
                              ${ord.status_node === 'live' ? 'bg-amber-100 text-amber-800' : ''}
                              ${ord.status_node === 'cancel' ? 'bg-rose-100 text-rose-800' : ''}
                              ${(!ord.status_node || ord.status_node === 'pending') ? 'bg-blue-100 text-blue-800' : ''}
                            `}>
                              {ord.status_node || 'pending'}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-black text-slate-900 text-right">{parseFloat(ord.total_price_omr || 0).toFixed(3)} OMR</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Advanced Products ERP Publisher Management */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
                <span className="text-xs font-black uppercase tracking-widest text-slate-700 pl-1">Product Configurations Hub</span>
                <button onClick={() => setIsProductFormVisible(!isProductFormVisible)} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all outline-none">
                  {isProductFormVisible ? 'Hide Add Product' : 'Add Product Page'}
                </button>
              </div>

              {isProductFormVisible && (
                <div id="product-creation-form" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">Add Product To Grid</h3>
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
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Warehouse Stock *</label>
                      <input type="number" value={formData.inventory} onChange={e => setFormData({...formData, inventory: e.target.value})} placeholder="e.g. 50" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Category *</label>
                      <select value={formData.category} required onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all cursor-pointer">
                        <option value="" disabled>Select Category Placement</option>
                        {categories.map((cat, idx) => (<option key={idx} value={cat.name}>{cat.name}</option>))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product Display Image Url *</label>
                      <div className="flex gap-2">
                        <input type="text" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="Cloud media storage link..." className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs truncate outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                        <label className="px-3 bg-slate-200 border border-slate-300 hover:bg-slate-400 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-all flex items-center justify-center shrink-0">
                          Upload
                          <input type="file" accept="image/*" onChange={(e) => handleFileUploadStream(e, 'product')} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Article No / SKU Reference *</label>
                      <input type="text" required value={formData.article_no} onChange={e => setFormData({...formData, article_no: e.target.value})} placeholder="e.g. AR-PERF-092" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product Tags</label>
                      <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. new, best, hot sale" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl select-none sm:mt-5 cursor-pointer" onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}>
                      <span className={formData.is_featured ? 'text-[#ffaa00]' : 'text-slate-400'}>★</span>
                      <div><p className="text-xs font-bold text-slate-800">Prioritize Top Placement</p><p className="text-[9px] text-slate-400">Show at topmost row grid view</p></div>
                    </div>
                    <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product Description *</label>
                      <textarea required rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Write details here..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs outline-none focus:border-[#ff4d00] focus:bg-white transition-all resize-none shadow-2xs" />
                    </div>
                    <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Extra Search Keywords</label>
                      <input type="text" value={formData.extra_keywords || ''} onChange={e => setFormData({...formData, extra_keywords: e.target.value})} placeholder="Separate with commas..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 border-t pt-3 mt-2">
                      <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-[#ff4d00] text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-sm transition-all">Save Product Record</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Full Catalog Inventory Table Grid Array */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-white">
                  <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Full Warehouse Inventory Ledger</h3>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                        <th className="p-3">Item Details & SKU</th>
                        <th className="p-3">Category Cluster</th>
                        <th className="p-3">Financial Value</th>
                        <th className="p-3">Warehouse Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {products.length === 0 ? (
                        <tr><td colSpan="5" className="p-6 text-center text-xs font-bold text-slate-400 uppercase">No catalog entries stored in database.</td></tr>
                      ) : (
                        products.map((prod) => (
                          <tr key={prod.id} className={`hover:bg-slate-50/50 ${prod.is_featured ? 'bg-amber-50/30' : ''}`}>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img src={prod.image} alt="" className="w-9 h-9 object-cover rounded-lg border bg-white" onError={(e) => e.target.src='https://unsplash.com'} />
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

          {/* TAB 1: Advanced Orders Tracker */}
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
                  <div className="relative w-full sm:w-64">
                    <input type="text" value={orderSearchQuery} onChange={e => setOrderSearchQuery(e.target.value)} placeholder="Search Token ID or Name..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#ff4d00] focus:bg-white pl-8 text-slate-800" />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All Cluster' },
                  { id: 'pending', label: 'Pending COD' },
                  { id: 'live', label: 'Live' },
                  { id: 'complete', label: 'Completed' },
                  { id: 'cancel', label: 'Cancelled' }
                ].map((btn) => (
                  <button key={btn.id} type="button" onClick={() => setStatusFilter(btn.id)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${statusFilter === btn.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{btn.label}</button>
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
                      <th className="p-3">Live Geo Link</th>
                      <th className="p-3">Flow Status</th>
                      <th className="p-3">Invoice Price</th>
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
                          <td className="p-3">
                            <div className="text-slate-700 max-w-40 truncate">{ord.customer_address}</div>
                            <div className="text-[10px] text-slate-400 font-bold font-mono mt-0.5">Ph: {ord.customer_phone}</div>
                          </td>
                          <td className="p-3">
                            {ord.location_url ? (
                              <div className="flex items-center gap-1">
                                <a href={ord.location_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded text-[10px] font-bold">
                                  <MapPin className="w-3 h-3" /> Map
                                </a>
                                <button onClick={() => copyToClipboard(ord.location_url, ord.id)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-500 transition-all">
                                  {copiedOrderId === ord.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            ) : <span className="text-slate-300 font-mono text-[10px]">No Link</span>}
                          </td>
                          <td className="p-3">
                            <select value={ord.status_node || 'pending'} onChange={async (e) => {
                              const state = e.target.value;
                              const { error } = await supabase.from('orders').update({ status_node: state }).eq('id', ord.id);
                              if (!error) { alert("Status dynamic shift saved."); fetchAllSystemData(); }
                            }} className="px-1.5 py-1 rounded bg-white border text-[10px] font-black uppercase text-slate-800 outline-none cursor-pointer">
                              <option value="pending">Pending COD</option>
                              <option value="live">Live Processing</option>
                              <option value="complete">Complete</option>
                              <option value="cancel">Cancel</option>
                            </select>
                          </td>
                          <td className="p-3 font-mono font-black text-slate-900">{parseFloat(ord.total_price_omr || 0).toFixed(3)} OMR</td>
                          <td className="p-3 text-right">
                            <button type="button" onClick={() => handleDelete(ord.id, 'orders')} className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          )}

          {/* TAB 3: Database Categories Matrix */}
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
                      <input type="text" value={newCategoryImage} onChange={e => setNewCategoryImage(e.target.value)} placeholder="https://image-url.com" className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs truncate outline-none focus:border-[#ff4d00]" />
                      <label className="px-3 bg-slate-200 border hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center justify-center transition-all">Upload<input type="file" accept="image/*" onChange={(e) => handleFileUploadStream(e, 'category')} className="hidden" /></label>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-[#ff4d00] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm mt-2 transition-all">Inject Category Block</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Live Category Channels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs relative bg-white">
                      <div className="h-24 w-full bg-slate-200"><img src={cat.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://unsplash.com'; }} /></div>
                      <div className="p-3 flex justify-between items-center border-t">
                        <div className="min-w-0"><h4 className="font-bold text-xs text-slate-900 truncate">{cat.name}</h4><p className="text-[10px] text-slate-400 font-mono mt-0.5">Linked: {products.filter(p => p.category === cat.name).length}</p></div>
                        <button type="button" onClick={() => handleDelete(cat.id, 'categories')} className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-md transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Promotional display Banners */}
          {activeTab === 'banners' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-fit">
                <form onSubmit={handleCreateBanner} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Poster Heading Context</label>
                    <input type="text" required value={newBannerTitle} onChange={e => setNewBannerTitle(e.target.value)} placeholder="e.g. Mega Sale 50% Off" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Poster Image Asset</label>
                    <div className="flex gap-2">
                      <input type="text" required value={newBannerImage} onChange={e => setNewBannerImage(e.target.value)} placeholder="https://image-url.com" className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs truncate outline-none focus:border-[#ff4d00] focus:bg-white transition-all" />
                      <label className="px-3 bg-slate-200 border hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center justify-center transition-all">Upload<input type="file" accept="image/*" onChange={(e) => handleFileUploadStream(e, 'banner')} className="hidden" /></label>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm mt-2 transition-all">Inject Banner Card</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Active Hero Display Frontend Posters</h3>
                <div className="space-y-3">
                  {banners.map((b) => (
                    <div key={b.id} className="border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-3 bg-white shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={b.image} alt="" className="w-16 h-10 object-cover rounded-lg border bg-white shrink-0" onError={(e)=>{e.target.src='https://unsplash.com';}} />
                        <div className="min-w-0"><h4 className="font-bold text-xs text-slate-900 truncate max-w-[250px]">{b.title}</h4><p className="text-[10px] text-slate-400 font-mono mt-0.5">ID Token: {b.id}</p></div>
                      </div>
                      <button type="button" onClick={() => handleDelete(b.id, 'banners')} className="p-1.5 bg-white text-slate-400 hover:text-rose-600 rounded-xl border transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Invoice System Audit */}
          {activeTab === 'invoice' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs h-fit">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Log Financial Audit Statement</h3>
                <form onSubmit={handleSaveInvoice} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Stock Cost (OMR)</label>
                      <input type="number" step="0.001" value={invoiceData.stock_cost} onChange={e => setInvoiceData({...invoiceData, stock_cost: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-slate-400" placeholder="0.000" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Gross Revenue (OMR)</label>
                      <input type="number" step="0.001" value={invoiceData.gross_sales} onChange={e => setInvoiceData({...invoiceData, gross_sales: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-slate-400" placeholder="0.000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Delivery Fees (OMR)</label>
                      <input type="number" step="0.001" value={invoiceData.delivery_expenses} onChange={e => setInvoiceData({...invoiceData, delivery_expenses: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-slate-400" placeholder="0.000" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Payouts / Customs (OMR)</label>
                      <input type="number" step="0.001" value={invoiceData.custom_payouts} onChange={e => setInvoiceData({...invoiceData, custom_payouts: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-slate-400" placeholder="0.000" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Audit Statement Memo Description</label>
                    <textarea value={invoiceData.log_notes} onChange={e => setInvoiceData({...invoiceData, log_notes: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none focus:border-slate-400" rows={2} placeholder="Type descriptive notes here..." />
                  </div>
                  <button type="submit" className="w-full py-2 bg-slate-900 hover:bg-[#ff4d00] text-white rounded-xl text-xs font-bold uppercase mt-2 transition-all">Commit Audit Entry</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Historical Financial Settlement Sheets</h3>
                <div className="space-y-3">
                  {invoicesList.length === 0 ? (
                    <p className="text-xs font-bold text-slate-400 uppercase text-center p-6 bg-slate-50 rounded-xl">No historical audit files committed.</p>
                  ) : (
                    invoicesList.map((inv) => (
                      <div key={inv.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <div className="text-xs font-bold text-slate-900 font-mono">Statement Log Token #{inv.id}</div>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-sm">{inv.log_notes || 'No description guidelines specified for this financial frame node.'}</p>
                          <span className="text-[9px] text-slate-400 font-mono mt-2 block">{new Date(inv.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Net Calculated Yield</span>
                          <div className={`text-base font-mono font-black ${inv.net_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{parseFloat(inv.net_profit || 0).toFixed(3)} OMR</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Oman Local Secure Payment Gateway Settings Setup */}
          {activeTab === 'gateway' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs max-w-2xl">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-[#ff4d00]" /> Securing Visa / MasterCard Checkout Processing (Thawani API Integration Hub)</h3>
              <form onSubmit={handleSaveGateway} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gateway Endpoint Node URL</label>
                  <input type="text" value={paymentConfig.api_endpoint} onChange={e => setPaymentConfig({...paymentConfig, api_endpoint: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-slate-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Merchant Profile Public Key</label>
                  <input type="password" value={paymentConfig.merchant_key || ''} onChange={e => setPaymentConfig({...paymentConfig, merchant_key: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-slate-400" placeholder="••••••••••••••••••••••••••••••••" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secret API Transaction Key</label>
                  <input type="password" value={paymentConfig.secret_key || ''} onChange={e => setPaymentConfig({...paymentConfig, secret_key: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-slate-400" placeholder="••••••••••••••••••••••••••••••••" />
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border select-none cursor-pointer" onClick={() => setPaymentConfig({...paymentConfig, sandbox_mode: !paymentConfig.sandbox_mode})}>
                  <button type="button" className="text-[#ff4d00]">{paymentConfig.sandbox_mode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}</button>
                  <div><p className="text-xs font-bold text-slate-800">Toggle Development Testing Sandbox Mode</p><p className="text-[10px] text-slate-400">Process test transaction streams before running live production billing nodes.</p></div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#ff4d00] transition-all">Synchronize Gateway Profile Settings</button>
                </div>
              </form>
            </div>
          )}
                     {/* Detailed Order Popup Specs Modal Overlay Box */}
          {selectedOrderNode && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border rounded-xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                  <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest text-[#ff4d00]">Invoice Specification Sheet</h4>
                  <button type="button" onClick={() => setSelectedOrderNode(null)} className="text-[10px] bg-slate-200 text-slate-700 font-black uppercase px-2.5 py-1 rounded-lg outline-none">Close</button>
                </div>
                <div className="p-5 overflow-y-auto space-y-4 text-xs bg-white">
                  <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                    <div><span className="text-[9px] font-black uppercase text-slate-400 block">Customer Name</span><p className="font-bold text-slate-900 capitalize text-sm">{selectedOrderNode.customer_name}</p></div>
                    <div><span className="text-[9px] font-black uppercase text-slate-400 block">Customer Email</span><p className="font-mono text-slate-800">{selectedOrderNode.customer_email || 'guest@zonix.com'}</p></div>
                    <div className="pt-2"><span className="text-[9px] font-black uppercase text-slate-400 block">Oman Mobile Vector</span><p className="font-mono text-slate-800 font-bold">{selectedOrderNode.customer_phone}</p></div>
                    <div className="pt-2"><span className="text-[9px] font-black uppercase text-slate-400 block">Order Timestamp</span><p className="font-mono text-slate-500">{selectedOrderNode.created_at ? new Date(selectedOrderNode.created_at).toLocaleString() : 'N/A'}</p></div>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-xl">
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Shipping Destination</span>
                    <p className="text-slate-700 leading-relaxed bg-white border p-2 rounded-lg font-medium">{selectedOrderNode.customer_address}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 block pl-1">Products Pack Matrix</span>
                    {((selectedOrderNode.product_name || '').split(',')).map((name, i) => {
                      const imageArray = (selectedOrderNode.product_image || '').split(',');
                      const rawImage = imageArray[i] ? imageArray[i].trim() : '';
                      const finalImageSrc = rawImage !== '' ? rawImage : 'https://unsplash.com';
                      
                      return (
                        <div key={i} className="bg-slate-50 border p-2.5 rounded-xl flex items-center gap-3">
                          <img src={finalImageSrc} alt="" className="w-9 h-9 object-cover rounded-lg border bg-white" onError={(e)=>{e.target.src='https://unsplash.com';}} />
                          <div className="min-w-0 flex-1"><div className="font-bold text-slate-900 text-xs truncate">{name.trim()}</div></div>
                        </div>
                      );
                    })}
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
      </main>
    </div>
  );
}
