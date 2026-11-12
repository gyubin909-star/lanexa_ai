import React, { useState } from 'react';
import { GenerationHistoryItem } from '../types';
import { Eye, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface ShowcaseGalleryProps {
  items: GenerationHistoryItem[];
  onSelect: (item: GenerationHistoryItem) => void;
  onRemix: (item: GenerationHistoryItem) => void;
}

export const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({
  items,
  onSelect,
  onRemix,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Semua Karya' },
    { id: 'fotorealistik', label: 'Fotorealistik' },
    { id: 'sinematik', label: 'Sinematik & Film' },
    { id: 'fantasi', label: 'Fantasi & Konsep' },
    { id: 'produk', label: 'Produk & Estetika' },
  ];

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    const p = (item.stylePreset + ' ' + item.prompt).toLowerCase();
    if (filter === 'fotorealistik') return p.includes('foto') || p.includes('portrait') || p.includes('hasselblad');
    if (filter === 'sinematik') return p.includes('sinematik') || p.includes('cyberpunk') || p.includes('film');
    if (filter === 'fantasi') return p.includes('fantasi') || p.includes('island') || p.includes('magis');
    if (filter === 'produk') return p.includes('produk') || p.includes('minimalis') || p.includes('perfume');
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                filter === cat.id
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-neutral-500 font-mono">
          {filteredItems.length} gambar tersimpan
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-900/30">
          <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-neutral-400">Belum ada gambar dalam kategori ini</p>
          <p className="text-xs text-neutral-600 mt-1">Coba hasilkan gambar baru dengan prompt di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all flex flex-col"
            >
              <div
                className="relative aspect-square w-full bg-neutral-950 overflow-hidden cursor-pointer"
                onClick={() => onSelect(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item);
                      }}
                      className="p-1.5 bg-neutral-800/90 hover:bg-neutral-700 text-white rounded-md transition-colors"
                      title="Buka di Kanvas"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemix(item);
                      }}
                      className="p-1.5 bg-neutral-800/90 hover:bg-neutral-700 text-white rounded-md transition-colors"
                      title="Gunakan Parameter Ini"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-200 line-clamp-3">
                    {item.prompt}
                  </p>
                </div>
              </div>

              {/* Bottom strip */}
              <div className="p-3 bg-neutral-950/80 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="truncate max-w-[120px] font-medium text-neutral-300">
                  {item.model}
                </span>
                <span className="font-mono text-neutral-500">{item.aspectRatio}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
