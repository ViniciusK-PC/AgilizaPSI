import React, { ReactNode } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        <h2>Iam Dashboard Only Pages Layout</h2>
      {children}
    </div>
  );
}
