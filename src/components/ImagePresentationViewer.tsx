import React from 'react';

const totalPages = 25;
// Helper to generate the exact image paths
const images = Array.from({ length: totalPages }, (_, i) => {
  const pageNum = String(i + 1).padStart(4, '0');
  return `/presentacion/Learning_by_Innogyzer_2026_page-${pageNum}.jpg`;
});

export default function ImagePresentationViewer() {
  return (
    <div className="w-full h-[600px] overflow-y-auto presentation-scrollbar bg-[#0f0f11]">
      <div className="flex flex-col gap-4 p-4">
        {images.map((src, idx) => (
          <img 
            key={idx} 
            src={src} 
            alt={`Página ${idx + 1}`} 
            className="w-full h-auto rounded-[20px] shadow-xl border border-white/10"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
