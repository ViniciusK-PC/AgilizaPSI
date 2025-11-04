import Navbar from '@/components/Frontend/Navbar';
import React, { ReactNode } from 'react';

export default function Layout({ children }: 
  { children: ReactNode }) {
  return (
    <div className="bg-white">
      <Navbar/>
      
      <div className="mt-[160px]">
        {children}
      </div>
    </div>
  );
}