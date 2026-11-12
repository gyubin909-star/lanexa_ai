import React, { useState } from 'react';
import { FloraModel, StylePreset, FloraStatus } from '../types';
import { STYLE_PRESETS, SAMPLE_PROMPTS } from '../data/presets';
import {
  Wand2,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  Dice5,
  Layers,
  Square,
  RectangleHorizontal,
  RectangleVertical,
} from 'lucide-react';

interface GenerationStudioProps {
  models: FloraModel[];
  status: FloraStatus | null;
  isGenerating: boolean;
  onGenerate: (params: {
    prompt: string;
    negative_prompt?: string;
    model: string;
    aspect_ratio: string;
    style_preset: string;
    seed?: number | null;
    steps?: number;
    workspace_id?: string;
  }) => Promise<void>;
  initialPrompt?: string;
  initialModel?: string;
  initialAspect?: string;
}

export const GenerationStudio: React.FC<GenerationStudioProps> = ({
  models,
  status,
  isGenerating,
  onGenerate,
  initialPrompt = '',
  initialModel = 'nano-banana-pro',
  initialAspect = '1:1',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [selectedStyle, setSelectedStyle] = useState<string>('photoreal');
  const [aspectRatio, setAspectRatio] = useState<string>(initialAspect);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [seed, setSeed] = useState<string>('');
  const [steps, setSteps] = useState(28);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Sync if initial values change
  React.useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  React.useEffect(() => {
    if (initialModel) setSelectedModel(initialModel);
  }, [initialModel]);

  React.useEffect(() => {
    if (initialAspect) setAspectRatio(initialAspect);
  }, [initialAspect]);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const activePreset = STYLE_PRESETS.find((p) => p.id === selectedStyle);
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: activePreset?.name || 'Photorealistic',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhancedPrompt) {
          setPrompt(data.enhancedPrompt);
        }
      }
    } catch (err) {
      console.warn('Enhance prompt failed:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 9999999).toString());
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const activePreset = STYLE_PRESETS.find((p) => p.id === selectedStyle);
    let finalPrompt = prompt.trim();
    if (activePreset && !finalPrompt.toLowerCase().includes(activePreset.promptSuffix.toLowerCase())) {
      finalPrompt = `${finalPrompt}, ${activePreset.promptSuffix}`;
    }

    onGenerate({
      prompt: finalPrompt,
      negative_prompt: negativePrompt.trim() || undefined,
      model: selectedModel,
      aspect_ratio: aspectRatio,
      style_preset: activePreset?.name || 'Photorealistic',
      seed: seed ? parseInt(seed, 10) : undefined,
      steps: steps,
      workspace_id: selectedWorkspace || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const aspectOptions = [
    { id: '1:1', label: '1:1 Persegi', icon: Square },
    { id: '16:9', label: '16:9 Lanskap', icon: RectangleHorizontal },
    { id: '9:16', label: '9:16 Potret', icon: RectangleVertical },
    { id: '4:3', label: '4:3 Klasik', icon: RectangleHorizontal },
    { id: '3:2', label: '3:2 Foto', icon: RectangleHorizontal },
  ];

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex flex-col gap-5">
      {/* Prompt Area */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="prompt-input" className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
            <span>Deskripsi Ide / Prompt</span>
          </label>
          <button
            type="button"
            onClick={handleEnhancePrompt}
            disabled={!prompt.trim() || isEnhancing}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-40 disabled:hover:text-emerald-400 transition-colors cursor-pointer"
            title="Gunakan AI untuk memperkaya detail pencahayaan dan komposisi"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
            <span>{isEnhancing ? 'Mengoptimalkan...' : 'Tingkatkan Prompt AI'}</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            id="prompt-input"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Contoh: Potret sinematik astronot wanita di taman bunga kristal bercahaya di planet Mars, pencahayaan dramatis, 8k..."
            className="w-full bg-neutral-950/80 border border-neutral-800 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 rounded-lg p-3 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-all resize-none leading-relaxed"
          />
          <div className="absolute bottom-2.5 right-3 text-[11px] text-neutral-500 pointer-events-none">
            Ctrl+Enter untuk generate
          </div>
        </div>

        {/* Quick Inspiration Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          <span className="text-[11px] text-neutral-500 shrink-0 font-medium">Inspirasi:</span>
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(sample.prompt);
                setSelectedStyle(sample.style);
                setSelectedModel(sample.model);
                setAspectRatio(sample.aspect);
              }}
              className="text-[11px] text-neutral-400 hover:text-neutral-200 bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800 rounded-md px-2.5 py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
          <span>Model Generasi Lanexa Ai Studio</span>
          <span className="text-[11px] text-neutral-400 font-normal">
            {models.length} model tersedia
          </span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {models.map((m) => {
            const isSelected = selectedModel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModel(m.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-800/90 border-emerald-500/80 shadow-sm'
                    : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-300' : 'text-neutral-200'}`}>
                    {m.name}
                  </span>
                  {m.badge && (
                    <span className="text-[10px] text-neutral-400">
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                  {m.description}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/60 text-[10px] text-neutral-400 font-mono">
                  <span>{m.creator}</span>
                  <span>{m.speed}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Presets */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-neutral-300">
          Gaya Artistik & Estetika
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STYLE_PRESETS.map((preset) => {
            const isSelected = selectedStyle === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedStyle(preset.id)}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800 border-emerald-500/80'
                    : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <p className={`text-xs font-medium ${isSelected ? 'text-emerald-300' : 'text-neutral-200'}`}>
                  {preset.name}
                </p>
                <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-neutral-300">
          Rasio Aspek
        </label>
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-neutral-950/70 border border-neutral-800 rounded-lg">
          {aspectOptions.map((opt) => {
            const isSelected = aspectRatio === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAspectRatio(opt.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800 text-emerald-300 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] font-mono">{opt.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div className="border-t border-neutral-800/80 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs font-medium text-neutral-400 hover:text-neutral-200 py-1 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" />
            Parameter Lanjutan (Seed, Negative Prompt, Steps)
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3 p-3 bg-neutral-950/60 border border-neutral-800/60 rounded-lg">
            {/* Negative Prompt */}
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">
                Negative Prompt (Elemen yang Dihindari)
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="blurry, distorted, low quality, oversaturated, watermark"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-200 outline-none focus:border-neutral-700"
              />
            </div>

            {/* Seed & Steps in 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 flex items-center justify-between mb-1">
                  <span>Seed Acak</span>
                  <button
                    type="button"
                    onClick={handleRandomSeed}
                    className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Dice5 className="w-3 h-3" /> Acak
                  </button>
                </label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Acak (Default)"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-200 font-mono outline-none focus:border-neutral-700"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Steps Sampling ({steps})
                </label>
                <input
                  type="range"
                  min={15}
                  max={50}
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Workspace selection if Flora workspaces exist */}
            {status?.workspaces && status.workspaces.length > 0 && (
              <div>
                <label className="text-[11px] text-neutral-400 flex items-center gap-1 mb-1">
                  <Layers className="w-3 h-3 text-emerald-400" />
                  <span>Workspace Lanexa Ai Studio</span>
                </label>
                <select
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-200 outline-none"
                >
                  <option value="">Default Workspace</option>
                  {status.workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name} ({ws.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Generate CTA */}
      <button
        type="button"
        onClick={() => handleSubmit()}
        disabled={!prompt.trim() || isGenerating}
        className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-sm rounded-lg shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-emerald-500 cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>{isGenerating ? 'Sedang Memproses Gambar...' : 'Hasilkan Gambar Sekarang'}</span>
      </button>
    </div>
  );
};
