import Navbar from '@/components/Frontend/Navbar';
import React, { ReactNode } from 'react';
import MegaMenu from '@/components/Frontend/MegaMenu';
export default function Layout({ children }: 
  { children: ReactNode }) {
  return (
    <div className="bg-blue-600">
      <Navbar/>
      <div className="max-w-5xl mx-auto py-3 ">
        <MegaMenu />
      </div>
      {children}
    </div>
  );
}
