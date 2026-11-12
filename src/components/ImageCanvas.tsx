import React, { useState } from 'react';
import { GenerationHistoryItem } from '../types';
import {
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Info,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface ImageCanvasProps {
  item: GenerationHistoryItem | null;
  isGenerating: boolean;
  onRemix: (item: GenerationHistoryItem) => void;
  notice?: string | null;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({
  item,
  isGenerating,
  onRemix,
  notice,
}) => {
  const [copied, setCopied] = useState(false);
  const [isLightbox, setIsLightbox] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleCopyPrompt = async () => {
    if (!item?.prompt) return;
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    if (!item?.imageUrl) return;
    const a = document.createElement('a');
    a.href = item.imageUrl;
    const cleanPrompt = item.prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `flora_${cleanPrompt}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="relative flex flex-col h-full bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden">
        {/* Top Control Strip */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/80 bg-neutral-950/40 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-200">Kanvas Visual</span>
            {item && (
              <>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="text-neutral-400">{item.model}</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="text-neutral-400 font-mono">{item.aspectRatio}</span>
              </>
            )}
          </div>

          {item && !isGenerating && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                title={isZoomed ? 'Kecilkan' : 'Perbesar Gambar'}
              >
                {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsLightbox(true)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                title="Layar Penuh"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyPrompt}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                title="Salin Prompt"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                title="Unduh Gambar"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Notice alert banner if present */}
        {notice && (
          <div className="px-4 py-2 bg-neutral-950/80 border-b border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-300">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{notice}</span>
          </div>
        )}

        {/* Viewport Canvas Frame */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] flex items-center justify-center p-4 bg-neutral-950/80 overflow-auto">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-8 max-w-sm">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border border-neutral-700 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Merender Karya Gambar...</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Menghubungkan pipeline neural diffusion Lanexa Ai Studio dan memproses latents.
                </p>
              </div>
            </div>
          ) : item ? (
            <div
              className={`relative transition-all duration-300 flex items-center justify-center ${
                isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={item.imageUrl}
                alt={item.prompt}
                referrerPolicy="no-referrer"
                className={`max-h-[500px] w-auto object-contain rounded-lg shadow-2xl transition-transform border border-neutral-800 ${
                  item.aspectRatio === '1:1'
                    ? 'aspect-square'
                    : item.aspectRatio === '16:9'
                    ? 'aspect-video'
                    : ''
                }`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-center p-8 text-neutral-500">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-neutral-300">Siap Menghasilkan Gambar</p>
              <p className="text-xs text-neutral-500 max-w-xs">
                Tuliskan deskripsi ide Anda di panel kiri, pilih model dan gaya, lalu klik Generate.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Metadata & Prompt Bar */}
        {item && !isGenerating && (
          <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-0">
              <p className="text-neutral-200 line-clamp-2 leading-relaxed" title={item.prompt}>
                {item.prompt}
              </p>
              <div className="flex items-center gap-2 text-neutral-500 mt-1.5 font-mono text-[11px]">
                <span>Engine: {item.engine}</span>
                {item.seed && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Seed: {item.seed}</span>
                  </>
                )}
                {item.chargedCost !== undefined && item.chargedCost > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Biaya: ${item.chargedCost.toFixed(3)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onRemix(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700/80 cursor-pointer"
                title="Gunakan prompt dan parameter ini di form generator"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Remix / Gunakan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightbox && item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative max-w-5xl max-h-[92vh] flex flex-col items-center">
            <button
              onClick={() => setIsLightbox(false)}
              className="absolute -top-12 right-0 p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Tutup (ESC)"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <img
              src={item.imageUrl}
              alt={item.prompt}
              referrerPolicy="no-referrer"
              className="max-h-[82vh] w-auto object-contain rounded-lg shadow-2xl border border-neutral-800"
            />
            <p className="text-xs text-neutral-300 text-center mt-3 max-w-2xl line-clamp-2">
              {item.prompt}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
