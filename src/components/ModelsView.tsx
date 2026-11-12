import React from 'react';
import { FloraModel } from '../types';
import { Cpu, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ModelsViewProps {
  models: FloraModel[];
  onSelectModel: (modelId: string) => void;
}

export const ModelsView: React.FC<ModelsViewProps> = ({
  models,
  onSelectModel,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white font-display">
          Katalog Model AI Generatif Lanexa Ai Studio
        </h2>
        <p className="text-sm text-neutral-400">
          Lanexa Ai Studio mengorkestrasi berbagai model seni generative AI canggih di satu canvas workspace. Pilih model yang tepat sesuai kebutuhan kreatif Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {models.map((model) => (
          <div
            key={model.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-neutral-400 font-mono flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  {model.creator}
                </span>
                {model.badge && (
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {model.badge}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {model.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                {model.description}
              </p>

              <div className="mt-4 pt-3 border-t border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Zap className="w-3 h-3 text-amber-400" /> Kecepatan
                  </span>
                  <span className="font-mono text-neutral-300">{model.speed}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {model.styles.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] text-neutral-400"
                    >
                      {idx > 0 && <span className="text-neutral-600 mr-1.5">·</span>}
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectModel(model.id)}
              className="mt-5 w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Gunakan Model Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-400 space-y-1">
          <p className="text-neutral-200 font-semibold">Orkestrasi Multi-Model Otomatis</p>
          <p>
            Saat API key Lanexa Ai Studio Anda aktif, request generasi dikirim langsung ke endpoint model pilihan Anda melalui SDK <code className="text-neutral-300 font-mono">@flora-ai/flora</code> dengan kontrol parameter aspect ratio, seed, dan sampling steps.
          </p>
        </div>
      </div>
    </div>
  );
};
