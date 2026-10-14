"use client";
import React, { Suspense } from 'react';

export default function ProductLayout({ children }) {
  return (
    <Suspense fallback={<div className="text-center p-20 text-xs font-bold text-slate-400 font-mono uppercase">Initializing Layout Matrix...</div>}>
      {children}
    </Suspense>
  );
}
