'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Canvas = dynamic(() => import('@/components/Canvas'), {
  ssr: false
});

export default function Home() {
  const handleClear = () => {
    if (typeof window !== 'undefined' && (window as any).clearDrawing) {
      (window as any).clearDrawing();
    }
  };

  return (
    <>
      <div className="relative min-h-screen">
        <Canvas />
      </div>
      <button
        onClick={handleClear}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          backgroundColor: '#FF1493',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '0.75rem',
          fontWeight: 'bold',
          fontSize: '1.125rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FF069A'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF1493'}
      >
        Clear Canvas
      </button>
    </>
  );
} 