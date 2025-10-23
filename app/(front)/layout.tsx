import Navbar from '@/components/Frontend/Navbar';
import React, { ReactNode } from 'react';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar/>
      {children}
    </div>
  );
}
