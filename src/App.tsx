import { useState, useEffect } from 'react';
import { FloraModel, FloraStatus, GenerationHistoryItem } from './types';
import { INITIAL_SHOWCASE } from './data/presets';
import { TopNav } from './components/TopNav';
import { GenerationStudio } from './components/GenerationStudio';
import { ImageCanvas } from './components/ImageCanvas';
import { ShowcaseGallery } from './components/ShowcaseGallery';
import { ModelsView } from './components/ModelsView';
import { FloraDocsModal } from './components/FloraDocsModal';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

const STORAGE_KEY = 'flora_studio_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery' | 'models'>('studio');
  const [status, setStatus] = useState<FloraStatus | null>(null);
  const [models, setModels] = useState<FloraModel[]>([]);
  const [history, setHistory] = useState<GenerationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SHOWCASE;
  });

  const [currentImage, setCurrentImage] = useState<GenerationHistoryItem | null>(() => {
    return INITIAL_SHOWCASE[0] || null;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Form pre-fill states for Remixing
  const [formPrompt, setFormPrompt] = useState<string>('');
  const [formModel, setFormModel] = useState<string>('nano-banana-pro');
  const [formAspect, setFormAspect] = useState<string>('1:1');

  // Load Status and Models
  const fetchFloraStatus = async () => {
    try {
      const res = await fetch('/api/flora/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.warn('Failed to fetch Flora status:', e);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/flora/models');
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          setModels(data.models);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch models:', e);
    }
  };

  useEffect(() => {
    fetchFloraStatus();
    fetchModels();
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore storage quota issues
    }
  }, [history]);

  const handleGenerate = async (params: {
    prompt: string;
    negative_prompt?: string;
    model: string;
    aspect_ratio: string;
    style_preset: string;
    seed?: number | null;
    steps?: number;
    workspace_id?: string;
  }) => {
    setIsGenerating(true);
    setGenerationNotice(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Generasi gambar gagal.');
      }

      const result = await response.json();
      if (result.success && result.imageUrl) {
        const newItem: GenerationHistoryItem = {
          id: result.runId || `gen-${Date.now()}`,
          imageUrl: result.imageUrl,
          prompt: result.prompt,
          model: result.model,
          aspectRatio: result.aspect_ratio || params.aspect_ratio,
          stylePreset: params.style_preset,
          engine: result.engine || 'Lanexa Ai Studio',
          timestamp: Date.now(),
          seed: params.seed || Math.floor(Math.random() * 9999999),
          chargedCost: result.chargedCost,
        };

        setHistory((prev) => [newItem, ...prev]);
        setCurrentImage(newItem);
        if (result.notice) {
          setGenerationNotice(result.notice);
        }
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      alert(err.message || 'Gagal menghasilkan gambar. Periksa koneksi internet Anda.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemix = (item: GenerationHistoryItem) => {
    setFormPrompt(item.prompt);
    setFormModel(item.model);
    setFormAspect(item.aspectRatio);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Navigation */}
      <TopNav
        status={status}
        onOpenDocs={() => setIsDocsOpen(true)}
        onSelectTab={setActiveTab}
        activeTab={activeTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Hero Introduction & Engine State */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LANEXA AI STUDIO NEURAL CANVAS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display text-balance">
              Generator Gambar AI dengan Lanexa Ai Studio
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Kreasikan visual sinematik, fotorealistik, dan ilustrasi digital dengan model Nano Banana Pro, Nano Banana 2.1, Seedream 5 Pro, dan GPT Image 2 melalui Lanexa Ai Studio.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono shrink-0">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${status?.configured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{status?.configured ? 'Lanexa Ai Studio Aktif' : 'Engine Hybrid'}</span>
            </span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <button
              onClick={() => setIsDocsOpen(true)}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Panduan Kunci API
            </button>
          </div>
        </div>

        {/* Tab View Routing */}
        {activeTab === 'studio' && (
          <div className="space-y-10">
            {/* Split Grid: Left Controls (Studio) & Right (Canvas Viewport) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 xl:col-span-5 order-2 lg:order-1">
                <GenerationStudio
                  models={models}
                  status={status}
                  isGenerating={isGenerating}
                  onGenerate={handleGenerate}
                  initialPrompt={formPrompt}
                  initialModel={formModel}
                  initialAspect={formAspect}
                />
              </div>

              <div className="lg:col-span-6 xl:col-span-7 order-1 lg:order-2 sticky top-20">
                <ImageCanvas
                  item={currentImage}
                  isGenerating={isGenerating}
                  onRemix={handleRemix}
                  notice={generationNotice}
                />
              </div>
            </div>

            {/* Recent Generations Strip */}
            <div className="pt-6 border-t border-neutral-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-white">Karya Tersimpan di Sesi Ini</h2>
                </div>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className="text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  Lihat Semua Galeri →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {history.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentImage(item)}
                    className={`group relative aspect-square rounded-lg overflow-hidden border transition-all text-left cursor-pointer ${
                      currentImage?.id === item.id
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <p className="text-[10px] text-neutral-200 line-clamp-2">{item.prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <ShowcaseGallery
            items={history}
            onSelect={(item) => {
              setCurrentImage(item);
              setActiveTab('studio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRemix={handleRemix}
          />
        )}

        {activeTab === 'models' && (
          <ModelsView
            models={models}
            onSelectModel={(modelId) => {
              setFormModel(modelId);
              setActiveTab('studio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Lanexa Ai Studio. Multi-model image generation with Lanexa Ai Studio & Modern Diffusion.</p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Nano Banana Pro</span>
            <span aria-hidden="true">·</span>
            <span>Nano Banana 2.1</span>
            <span aria-hidden="true">·</span>
            <span>Seedream 5 Pro</span>
            <span aria-hidden="true">·</span>
            <span>GPT Image 2</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsDocsOpen(true)}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              API Key Setup
            </button>
          </div>
        </div>
      </footer>

      {/* API Key & Architecture Guide Modal */}
      <FloraDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        status={status}
        onRefreshStatus={fetchFloraStatus}
      />
    </div>
  );
}
