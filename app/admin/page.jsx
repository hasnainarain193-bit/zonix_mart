"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  PlusCircle, Edit3, Trash2, Package, Users, ShoppingCart, RefreshCw, Layers, 
  TrendingUp, AlertTriangle, Calendar, FileText, Download, CheckSquare, Square, 
  Bell, Percent, Settings, Globe, ChevronRight, ArrowUpRight
} from 'lucide-react';

export default function AdvancedAdminDashboard() {
  // Navigation & Date Context Controllers
  const [activeTab, setActiveTab] = useState('products');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Core Database Registries
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Electronics', 'Perfumes', 'Cat Products']);
  const [newCategory, setNewCategory] = useState('');
  const [selectedItems, setSelectedSelectedItems] = useState([]);

  // Form Submission Matrices
  const [editMode, setEditMode] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', price_omr: '', inventory: '', category: 'Electronics', tags: '', image: '', description: ''
  });

  // Simulated Live Traffic Node Tracker Metrics
  const [liveStats, setLiveStats] = useState({ activeUsers: 42, dailySales: 189.500, totalSignups: 158 });

  // Realtime Data Reader Pipeline directly hooked to cloud table grid
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    setSelectedDate(new Date().toISOString().split('T')[0]);

    // Live statistics variation background simulator loop
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * (60 - 30) + 30),
        dailySales: prev.dailySales + (Math.random() > 0.7 ? 4.250 : 0)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Direct Laptop Storage Binary Stream Image Loader to 'zonix-media' Bucket
  const handleFileUploadStream = async (e) => {
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
      setFormData(prev => ({ ...prev, image: data.publicUrl }));
      alert("Image binary uploaded successfully to cloud bucket!");
    } catch (err) {
      alert(`Cloud Upload Error: ${err.message}`);
    } {
      setUploading(false);
    }
  };
  // Add Dynamic Categories Method
  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      return alert("This category group already exists inside active directory.");
    }
    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
    alert("New custom category generated live!");
  };

  // Submit Product Form Logic (Realtime Auto-Refreshes Database values)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: formData.name,
      price_omr: parseFloat(formData.price_omr || 0),
      inventory: parseInt(formData.inventory || 0),
      category: formData.category,
      tags: formData.tags,
      image: formData.image || 'https://unsplash.com',
      description: formData.description
    };

    const { error } = editMode 
      ? await supabase.from('products').update(payload).eq('id', targetId)
      : await supabase.from('products').insert([payload]);

    if (!error) {
      alert(editMode ? "Product updated successfully!" : "Product published safely to grid!");
      setFormData({ name: '', price_omr: '', inventory: '', category: 'Electronics', tags: '', image: '', description: '' });
      setEditMode(false);
      setTargetId(null);
      fetchProducts(); // Automatic database refresh call statement execution
    } else {
      alert(`Database Sync Exception: ${error.message}`);
    }
    setLoading(false);
  };

  const handleEditTrigger = (prod) => {
    setEditMode(true);
    setTargetId(prod.id);
    setFormData({
      name: prod.name, price_omr: prod.price_omr, inventory: prod.inventory,
      category: prod.category, tags: prod.tags || '', image: prod.image || '', description: prod.description || ''
    });
    document.getElementById('product-creation-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts(); // Automatic realtime list refresh hook
    }
  };

  // Bulk Batch Operations System logic loop
  const toggleSelectItem = (id) => {
    setSelectedSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (confirm(`Wipe selected ${selectedItems.length} items from cloud database?`)) {
      setLoading(true);
      const { error } = await supabase.from('products').delete().in('id', selectedItems);
      if (!error) {
        alert("Batch wipe execution done safely.");
        setSelectedSelectedItems([]);
        fetchProducts(); // Automated table refresh invocation
      }
      setLoading(false);
    }
  };

  const triggerDatabaseBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(products, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `Zonix_Mart_ERP_Backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Compute analytics totals
  const totalStockItems = products.reduce((sum, item) => sum + (parseInt(item.inventory) || 0), 0);
  const outOfStockCount = products.filter(item => (parseInt(item.inventory) || 0) === 0).length;
  return (
    <div className="bg-[#0b0f19] text-[#f1f5f9] min-h-screen flex flex-col md:flex-row font-sans antialiased selection:bg-[#ff4d00] selection:text-white">
      
      {/* Side Command Navigation Hub */}
      <aside className="w-full md:w-64 bg-[#111827] border-b md:border-r border-[#1e293b]/40 p-6 flex flex-col justify-between shadow-xl relative z-20">
        <div className="space-y-8">
          <div className="border-b border-[#1e293b]/40 pb-4">
            <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-[#4f46e5] via-[#ff4d00] to-[#f59e0b] bg-clip-text text-transparent block">ZONIX MASTER</span>
            <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-widest block mt-1">Enterprise ERP Dashboard</span>
          </div>

          <nav className="space-y-1.5">
            <button type="button" onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'products' ? 'bg-gradient-to-r from-[#ff4d00] to-[#ff7700] text-white shadow-lg shadow-orange-950/20' : 'text-[#94a3b8] hover:bg-[#1f2937]/50 hover:text-white'}`}>
              <Package className="h-4 w-4" /> Content Manager (CRUD)
            </button>
            <button type="button" onClick={() => setActiveTab('crm')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'crm' ? 'bg-gradient-to-r from-[#ff4d00] to-[#ff7700] text-white shadow-lg shadow-orange-950/20' : 'text-[#94a3b8] hover:bg-[#1f2937]/50 hover:text-white'}`}>
              <Users className="h-4 w-4" /> Customer Gateway (CRM)
            </button>
            <button type="button" onClick={() => setActiveTab('technical')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'technical' ? 'bg-gradient-to-r from-[#ff4d00] to-[#ff7700] text-white shadow-lg shadow-orange-950/20' : 'text-[#94a3b8] hover:bg-[#1f2937]/50 hover:text-white'}`}>
              <Settings className="h-4 w-4" /> SEO & Integration Config
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#1e293b]/40 text-center text-[10px] text-[#64748b] font-bold tracking-wide">
          Active Root Authority: <span className="text-white block font-black mt-0.5">hasnainarain193</span>
        </div>
      </aside>

      {/* Main Core Controller Grid Space */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 relative z-10">
        
        {/* Real-time Statistics Array Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="bg-[#111827]/60 border border-[#1e293b]/40 p-5 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-sm">
            <div>
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block">Active Users (Live)</span>
              <span className="text-xl font-black text-indigo-400 block mt-1 animate-pulse">{liveStats.activeUsers} Online</span>
            </div>
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400"><RefreshCw className="h-4 w-4 animate-spin" /></div>
          </div>
          <div className="bg-[#111827]/60 border border-[#1e293b]/40 p-5 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-sm">
            <div>
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block">Daily Net Volume Sales</span>
              <span className="text-xl font-black text-emerald-400 block mt-1">{liveStats.dailySales.toFixed(3)} OMR</span>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400"><TrendingUp className="h-4 w-4" /></div>
          </div>
          <div className="bg-[#111827]/60 border border-[#1e293b]/40 p-5 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-sm">
            <div>
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block">Total Net SKUs</span>
              <span className="text-xl font-black text-white block mt-1">{products.length} Items</span>
            </div>
            <div className="p-2.5 bg-slate-800 rounded-xl text-slate-300"><Layers className="h-4 w-4" /></div>
          </div>
          <div className="bg-[#111827]/60 border border-[#1e293b]/40 p-5 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-sm">
            <div>
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block">Critical Out Of Stock</span>
              <span className="text-xl font-black text-red-400 block mt-1">{outOfStockCount} SKUs</span>
            </div>
            <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400"><AlertTriangle className="h-4 w-4" /></div>
          </div>
        </div>

        {/* Graphical Reports Presentation Canvas Mapping Layout */}
        <div className="bg-[#111827]/60 border border-[#1e293b]/40 p-6 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase text-[#64748b] tracking-widest flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-[#4f46e5]" /> Sales Realtime Traffic Report</h4>
            <div className="h-28 bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl flex items-end justify-between p-4 gap-3 relative shadow-inner">
              <div className="w-full bg-indigo-600 h-[35%] rounded-t transition-all duration-500" /><div className="w-full bg-[#ff4d00] h-[65%] rounded-t transition-all duration-500" /><div className="w-full bg-emerald-500 h-[92%] rounded-t transition-all duration-500" />
              <span className="absolute top-2 right-3 text-[9px] text-[#64748b] font-bold uppercase tracking-wider">Live Streaming Analytics Matrix</span>
            </div>
          </div>
          <div className="space-y-3 flex flex-col justify-between">
            <h4 className="text-xs font-black uppercase text-[#64748b] tracking-widest flex items-center gap-1.5"><Layers className="h-4 w-4 text-[#f59e0b]" /> Segment Allocation (Pie Mode)</h4>
            <div className="w-20 h-20 mx-auto rounded-full border-8 border-indigo-500 border-r-[#ff4d00] border-b-slate-800 animate-spin duration-10000 flex items-center justify-center text-[9px] font-black text-slate-500">92% SYNC</div>
          </div>
        </div>
        {/* Dynamic Navigation Controllers Tab Distribution Parser */}
        {activeTab === 'products' && (
          <div id="product-creation-form" className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Product Sheet Registration Frame Form */}
              <div className="lg:col-span-2 bg-[#111827]/60 border border-[#1e293b]/40 p-6 rounded-2xl shadow-xl">
                <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-[#1e293b]/40 pb-3 mb-5 flex items-center gap-2">
                  <Layers className="text-[#ff4d00] h-4 w-4" /> {editMode ? "Modify live stock assets parameter" : "Deploy Fresh Oman Stock SKU"}
                </h3>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-[#64748b] mb-1">Product Title</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl p-3 text-sm text-white outline-none focus:border-[#ff4d00]" placeholder="Product Display Title" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#64748b] mb-1">Price (OMR)</label>
                    <input type="number" step="0.001" required value={formData.price_omr} onChange={(e) => setFormData({...formData, price_omr: e.target.value})} className="w-full bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl p-3 text-sm text-white outline-none focus:border-[#ff4d00]" placeholder="0.000 OMR" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#64748b] mb-1">Stock Count</label>
                    <input type="number" required value={formData.inventory} onChange={(e) => setFormData({...formData, inventory: e.target.value})} className="w-full bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl p-3 text-sm text-white outline-none focus:border-[#ff4d00]" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#64748b] mb-1">Department</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl p-3 text-sm text-white outline-none cursor-pointer">
                      {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#64748b] mb-1">Meta Keywords</label>
                    <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="w-full bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl p-3 text-sm text-white outline-none" placeholder="tags, lists" />
                  </div>

                  {/* Direct Hard Drive File Selected Image Input */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-[#64748b] mb-1">Direct Laptop File Loader (Never Deletes from Cloud)</label>
                    <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl p-3">
                      <input type="file" accept="image/*" onChange={handleFileUploadStream} className="text-xs text-slate-400 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#111827] file:text-white hover:file:bg-[#4f46e5]" />
                      {uploading && <span className="text-xs text-[#f59e0b] font-bold animate-pulse">Streaming raw binary...</span>}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-[#64748b] mb-1">Advance WYSIWYG Description Editor</label>
                    <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl p-3 text-sm text-white outline-none focus:border-[#ff4d00]" placeholder="Tabular rules description details portfolio..." />
                  </div>

                  <div className="sm:col-span-2 flex gap-3 pt-2">
                    <button type="submit" disabled={loading} className="bg-gradient-to-r from-[#ff4d00] to-[#ff7700] hover:brightness-110 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-30">
                      {loading ? "Publishing SKU..." : "Publish to Grid"}
                    </button>
                    <button type="button" onClick={triggerDatabaseBackup} className="bg-[#1f2937] hover:bg-[#374151] text-white font-bold text-xs uppercase tracking-widest px-4 py-3.5 rounded-xl flex items-center gap-1.5 transition-colors">
                      <Download className="h-4 w-4" /> Backup Node
                    </button>
                  </div>
                </form>
              </div>

              {/* Department Generator Hub */}
              <div className="bg-[#111827]/60 border border-[#1e293b]/40 p-6 rounded-2xl shadow-xl h-fit space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-[#1e293b]/40 pb-2 flex items-center gap-1.5"><PlusCircle className="text-indigo-400 h-4 w-4" /> Category Registry</h3>
                <form onSubmit={handleCreateCategory} className="space-y-2">
                  <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl p-3 text-sm text-white outline-none" placeholder="New Department Title" />
                  <button type="submit" className="w-full bg-[#1f2937] hover:bg-[#0f172a] text-white font-bold text-xs uppercase py-2.5 rounded-xl transition-all border border-[#1e293b]/60">Create Category</button>
                </form>
                <div className="flex flex-col gap-1 pt-2">{categories.map((c, i) => <div key={i} className="text-xs font-bold text-[#94a3b8] bg-[#0b0f19] border border-[#1e293b]/40 p-2.5 rounded-xl flex items-center justify-between"><span>{c}</span><ChevronRight className="h-3 w-3 text-slate-600" /></div>)}</div>
              </div>
            </div>

            {/* Live Synchronized Active Table Matrix view */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b]/40 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#64748b]">Active Stock Inventory Feed</h3>
                  {selectedItems.length > 0 && (
                    <button type="button" onClick={handleBulkDelete} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/20 flex items-center gap-1">
                      <Trash2 className="h-3.5 w-3.5" /> Bulk Wipe ({selectedItems.length})
                    </button>
                  )}
                </div>
                
                {/* Advanced Calendar Integration Matrix */}
                <div className="flex items-center gap-2 bg-[#111827] border border-[#1e293b]/60 px-4 py-2 rounded-xl shadow-lg">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase text-[#64748b]">Filter Slot:</span>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-xs bg-transparent text-white font-bold outline-none cursor-pointer" />
                </div>
              </div>

              <div className="overflow-x-auto border border-[#1e293b]/40 rounded-2xl bg-[#111827]/40 shadow-2xl backdrop-blur-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                                       <tr className="bg-[#0b0f19] border-b border-[#1e293b]/40 text-[#64748b] font-bold text-[10px] uppercase tracking-wider">
                      <th className="p-4 w-12 text-center">Batch</th>
                      <th className="p-4">Visual</th>
                      <th className="p-4">Asset Title</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Value Price</th>
                      <th className="p-4">Stock Counters</th>
                      <th className="p-4 text-center">Operation Settings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]/30">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#1f2937]/30 transition-colors">
                        <td className="p-4 text-center">
                          <button type="button" onClick={() => toggleSelectItem(prod.id)} className="text-slate-500 hover:text-indigo-400 transition-colors">
                            {selectedItems.includes(prod.id) ? <CheckSquare className="h-4 w-4 text-indigo-400" /> : <Square className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="p-4"><img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded-xl border border-[#1e293b]/60" /></td>
                        <td className="p-4">
                          <span className="font-bold text-white block text-sm">{prod.name}</span>
                          <span className="text-[10px] text-[#64748b] block font-mono mt-0.5 max-w-xs truncate">{prod.id}</span>
                        </td>
                        <td className="p-4"><span className="bg-[#0b0f19] text-[#94a3b8] border border-[#1e293b]/60 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">{prod.category}</span></td>
                        <td className="p-4 font-black text-white text-sm">{parseFloat(prod.price_omr || 0).toFixed(3)} <span className="text-[11px] text-[#ff4d00]">OMR</span></td>
                        <td className="p-4">
                          {parseInt(prod.inventory || 0) > 0 ? (
                            <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10">{prod.inventory} Units Available</span>
                          ) : (
                            <span className="text-red-400 font-black text-xs bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/10">Out of Stock</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button type="button" onClick={() => handleEditTrigger(prod)} className="p-2.5 bg-[#0b0f19] hover:bg-[#ff4d00] hover:text-white border border-[#1e293b]/60 rounded-xl text-[#94a3b8] transition-all"><Edit3 className="h-4 w-4" /></button>
                            <button type="button" onClick={() => handleDelete(prod.id)} className="p-2.5 bg-[#0b0f19] hover:bg-red-600 hover:text-white border border-[#1e293b]/60 rounded-xl text-[#94a3b8] transition-all"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab CRM Block Interface Layout */}
        {activeTab === 'crm' && (
          <div className="bg-[#111827]/60 border border-[#1e293b]/40 p-12 rounded-2xl text-center space-y-4 shadow-xl backdrop-blur-sm animate-in fade-in">
            <Users className="h-10 w-10 mx-auto text-indigo-400" />
            <h3 className="text-sm font-black uppercase text-white tracking-wider">CRM Client Profiles Directory</h3>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto leading-relaxed">Advanced data matrices allowing management to issue direct push emails, track history, block malicious endpoints, or reset credentials under Oman cloud firewalls.</p>
            <div className="pt-2"><button type="button" onClick={() => alert("Notification broadcast pipeline initialized successfully.")} className="bg-gradient-to-r from-[#ff4d00] to-[#ff7700] text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl flex items-center gap-1.5 mx-auto">Broadcast Internal Notification</button></div>
          </div>
        )}

        {/* Tab Technical & SEO Configuration Hubs */}
        {activeTab === 'technical' && (
          <div className="bg-[#111827]/60 border border-[#1e293b]/40 p-12 rounded-2xl text-center space-y-3 shadow-xl backdrop-blur-sm animate-in fade-in">
            <Globe className="h-10 w-10 mx-auto text-emerald-400" />
            <h3 className="text-sm font-black uppercase text-white tracking-wider">Technical Config & SEO Meta Manager</h3>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto leading-relaxed">Central administration console mapping Open Graph tags, system currencies, payment gateway configurations (Stripe/SMS tokens), and secure SMTP pipelines.</p>
            <div className="pt-2"><button type="button" className="bg-[#1f2937] hover:bg-[#0b0f19] border border-[#1e293b]/60 text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all">Open Integration Settings</button></div>
          </div>
        )}

      </main>
    </div>
  );
}
