"use client";

import Footer from '@/components/Frontend/Footer';
import { SiteHeader } from '@/components/site-header';
import React, { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}