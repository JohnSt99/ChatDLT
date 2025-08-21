import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Diloti',
  description: 'Online Diloti card game'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-green-700 text-white">{children}</body>
    </html>
  );
}
