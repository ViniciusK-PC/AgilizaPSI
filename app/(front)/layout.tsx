import Footer from '@/components/Frontend/Footer';

import { SiteHeader } from '@/components/site-header';
import React, { ReactNode } from 'react';


export default function Layout({ children }: 
  { children: ReactNode }) {
  return (
    <div className="">
       <SiteHeader />
      
        {children}
      
      <Footer />
    </div>
  );
}