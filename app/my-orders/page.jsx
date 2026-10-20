"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ClipboardList, Clock, CheckCircle, XCircle, ShoppingBag, ArrowLeft, Calendar, FileText, User, MapPin, Truck } from 'lucide-react';

export default function CustomerOrdersHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Default backup dynamic placeholder image asset
  const FALLBACK_DEFAULT_IMAGE = "https://unsplash.com";

  useEffect(() => {
    const fetchUserSpecificOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert("Session expired. Please sign in to read your invoice ledger.");
          window.location.href = '/login';
          return;
        }
        setCustomer(user);

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_email', user.email) 
          .order('created_at', { ascending: false });

        if (!error && data) setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserSpecificOrders();
  }, []);

  const formatOrderTimestamp = (isoString) => {
    if (!isoString) return { date: 'N/A', time: 'N/A' };
    const dateObject = new Date(isoString);
    return {
      date: dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: dateObject.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen flex flex-col font-sans antialiased">
      <Header cartCount={0} isHomePage={false} />
      
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-10 flex-1 w-full space-y-6">
        <button onClick={() => window.location.href = '/'} className="flex items-center gap-1 text-slate-500 hover:text-[#ff4d00] text-xs font-black uppercase transition-all outline-none">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>

        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff4d00]/10 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-[#ff4d00]" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-900">My Purchase Ledger</h2>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 hidden sm:block">Logged account footprint: {customer?.email}</p>
            </div>
          </div>
          <span className="text-[9px] bg-slate-100 border text-slate-600 font-mono px-2 py-1 rounded-md font-bold uppercase tracking-wider">Verified Vault</span>
        </div>

        {loading ? (
          <div className="text-center p-16 text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">
            Syncing Personal Secure Ledger Arrays...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center shadow-xs max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div><h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">No Orders Located</h3></div>
            <button onClick={() => window.location.href = '/'} className="px-4 py-2 bg-slate-900 text-white font-black text-[10px] uppercase rounded-lg shadow">Browse Products</button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {orders.map((ord) => {
              const currentStatusNode = (ord.status_node || 'pending').toLowerCase().trim();
              const timestamp = formatOrderTimestamp(ord.created_at);
              
              const imageArray = (ord.product_image || ord.image || '').split(',');
              const rawImg = imageArray[0]?.trim();
              const primaryDisplayImage = (rawImg && rawImg.startsWith('http')) ? rawImg : FALLBACK_DEFAULT_IMAGE;
              const itemsCount = imageArray.filter(img => img.trim() !== '').length;

              return (
                <div 
                  key={ord.id} 
                  onClick={() => setSelectedOrderDetails(ord)}
                  className="bg-white border border-slate-200/80 hover:border-[#ff4d00]/40 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center cursor-pointer group"
                >
                  <div className="flex gap-3 items-center min-w-0 w-full sm:w-auto">
                    <div className="relative shrink-0">
                      <img 
                        src={primaryDisplayImage} 
                        alt="Order Box" 
                        className="w-12 h-12 object-cover rounded-lg border bg-slate-50 group-hover:scale-102 transition-transform" 
                        onError={(e)=>{e.target.src = FALLBACK_DEFAULT_IMAGE;}} 
                      />
                      {itemsCount > 1 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">+{itemsCount - 1}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[280px] md:max-w-[400px] capitalize">{ord.product_name?.replace(/^:\s*/, '')}</h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-mono text-slate-400 mt-1">
                        <span>Order ID: <span className="text-[#ff4d00] font-bold">#{ord.id}</span></span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {timestamp.date}</span>
                        <span className="text-slate-300">•</span>
                        <span>{timestamp.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t border-slate-100 sm:border-t-0 pt-3 sm:pt-0">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Total Invoice Price</span>
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded">{parseFloat(ord.total_price_omr || 0).toFixed(3)} OMR</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl min-w-[105px] justify-center">
                      {currentStatusNode === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                      {currentStatusNode === 'live' && <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />}
                      {currentStatusNode === 'complete' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                      {currentStatusNode === 'cancel' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-700">{currentStatusNode === 'pending' ? 'Pending COD' : currentStatusNode}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL POPUP MODEST BREAKDOWN FOR ORDERS */}
        {selectedOrderDetails && (() => {
          const timestamp = formatOrderTimestamp(selectedOrderDetails.created_at);
          const nameList = (selectedOrderDetails.product_name || '').split(',');
          
          const rawImageString = selectedOrderDetails.product_image || selectedOrderDetails.image || '';
          const imageList = rawImageString.split(',');
          
          const skuList = (selectedOrderDetails.product_article || '').split(',');
          const priceList = (selectedOrderDetails.product_price || '').split(',');
          const dynamicInvoiceGrandTotal = parseFloat(selectedOrderDetails.total_price_omr || 0);

          return (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#ff4d00]" />
                    <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest">Invoice Breakdown Node <span className="text-[#ff4d00]">#{selectedOrderDetails.id}</span></h4>
                  </div>
                  <button type="button" onClick={() => setSelectedOrderDetails(null)} className="text-[10px] bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-700 font-black uppercase px-3 py-1.5 rounded-xl cursor-pointer border-0 transition-all outline-none">Close</button>
                </div>
                <div className="p-5 overflow-y-auto space-y-4 text-xs bg-white">
                  <div className="p-3 bg-slate-50 border rounded-xl grid grid-cols-2 gap-2">
                    <div><span className="text-[9px] text-slate-400 block font-medium">Customer Name</span><p className="font-bold text-slate-900 capitalize">{selectedOrderDetails.customer_name}</p></div>
                    <div><span className="text-[9px] text-slate-400 block font-medium">Mobile Identifier</span><p className="font-mono text-slate-800 font-bold">{selectedOrderDetails.customer_phone}</p></div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider pl-1 block">Purchased Bundle Content Breakdowns</span>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {nameList.map((name, idx) => {
                        let cleanName = name.trim();
                        if (cleanName.startsWith(':')) {
                          cleanName = cleanName.substring(1).trim();
                        }
                        
                        let itemQuantity = 1;
                        const qtyMatch = cleanName.match(/\(x(\d+)\)/i);
                        if (qtyMatch && qtyMatch[1]) {
                          itemQuantity = parseInt(qtyMatch[1]);
                        }

                        let itemUnitPrice = 0;
                        if (priceList[idx] && priceList[idx].trim() !== "" && !isNaN(parseFloat(priceList[idx]))) {
                          itemUnitPrice = parseFloat(priceList[idx].trim());
                        } else {
                          itemUnitPrice = (dynamicInvoiceGrandTotal - 0.799) / (nameList.length * itemQuantity);
                          if (itemUnitPrice < 0) itemUnitPrice = 0;
                        }

                        const totalRowPayable = itemUnitPrice * itemQuantity;
                      
                         const rawImgUrl = imageList[idx] ? imageList[idx].trim() : '';

                        const finalProductImg = (rawImgUrl && rawImgUrl.startsWith('http')) 
                         ? rawImgUrl 
                        : "https://unsplash.com"; 

                
                        return (
                          <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img 
                                src={finalProductImg} 
                                alt=""
                                className="w-10 h-10 object-cover rounded-lg border bg-white shadow-2xs shrink-0" 
                                onError={(e) => { e.target.src = "https://unsplash.com"; }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-900 text-xs capitalize truncate">{cleanName}</div>
                                <div className="text-[9px] text-slate-400 font-mono mt-0.5">SKU Track: {skuList[idx]?.trim() || 'GEN-SKU'}</div>
                              </div>
                            </div>
                            
                            <div className="text-right shrink-0">
                              <div className="text-[9px] text-slate-400 font-medium lowercase">
                                {itemUnitPrice.toFixed(3)} OMR x {itemQuantity}
                              </div>
                              <span className="font-mono text-xs font-black text-slate-800 bg-white border px-2 py-0.5 rounded shadow-3xs block mt-0.5">
                                {totalRowPayable.toFixed(3)} OMR
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border rounded-xl text-[10px]">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider mb-0.5">Checkout Date</span>
                      <p className="font-bold text-slate-700 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {timestamp.date}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider mb-0.5">Settlement Time</span>
                      <p className="font-mono font-bold text-slate-700 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timestamp.time}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border rounded-xl space-y-1.5 text-[11px] font-medium text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>Items Aggregate Subtotal:</span>
                      <span className="font-mono text-slate-900 font-bold">{(dynamicInvoiceGrandTotal - 0.799).toFixed(3)} OMR</span>
                    </div>
                    <div className="flex justify-between items-center text-orange-600 font-bold border-t border-dashed pt-1.5">
                      <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Fixed Delivery Surcharge Fee:</span>
                      <span className="font-mono">+0.799 OMR</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-emerald-50/30 border border-emerald-200 rounded-xl font-black text-slate-800">
                    <span className="text-[9px] uppercase tracking-widest text-slate-500">Gross Settlement Statement Total</span>
                    <span className="font-mono text-sm text-emerald-600 bg-white px-2.5 py-1 rounded border border-emerald-200/60 shadow-2xs">
                      {dynamicInvoiceGrandTotal.toFixed(3)} OMR
                    </span>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
      </main>
      <Footer />
    </div>
  );
}
