import React, { useState } from 'react';
import { FloraStatus } from '../types';
import { X, CheckCircle2, AlertCircle, Terminal, ExternalLink, RefreshCw, Layers } from 'lucide-react';

interface FloraDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: FloraStatus | null;
  onRefreshStatus: () => Promise<void>;
}

export const FloraDocsModal: React.FC<FloraDocsModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshStatus,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshStatus();
    setIsRefreshing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Integrasi API Lanexa Ai Studio</h2>
              <p className="text-xs text-neutral-400">Status koneksi dan panduan konfigurasi kunci API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-neutral-300">
          {/* Connection Status Banner */}
          <div
            className={`p-4 rounded-lg border ${
              status?.configured && status?.valid
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                : 'bg-amber-950/20 border-amber-800/50 text-amber-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {status?.configured && status?.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {status?.configured && status?.valid
                      ? 'Lanexa Ai Studio API Terhubung Aktif'
                      : 'Kunci FLORA_API_KEY Belum Dikonfigurasi'}
                  </h3>
                  <p className="text-xs mt-1 text-neutral-300">
                    {status?.configured && status?.valid
                      ? `Kunci: ${status.keyMask || 'Valid'} · Workspace aktif: ${status.workspacesCount || 1} workspace terdeteksi`
                      : 'Website saat ini menggunakan Studio Engine Hybrid (berkualitas tinggi) sehingga generasi gambar tetap berjalan lancar. Tambahkan kunci API untuk menghubungkan server cluster Lanexa Ai Studio.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md transition-colors border border-neutral-700 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Uji Koneksi
              </button>
            </div>
          </div>

          {/* Step by Step Guide */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-3">
              Cara Mendapatkan Kunci API Lanexa Ai Studio
            </h4>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  1
                </span>
                <div>
                  <p className="text-white font-medium">Buka Dashboard Lanexa Ai Studio</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Kunjungi{' '}
                    <a
                      href="https://app.flora.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      app.flora.ai <ExternalLink className="w-3 h-3 inline" />
                    </a>{' '}
                    dan masuk dengan akun Anda.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  2
                </span>
                <div>
                  <p className="text-white font-medium">Navigasi ke Pengaturan API</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Buka menu <strong>Settings</strong> → <strong>API Keys</strong> di workspace Anda.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  3
                </span>
                <div>
                  <p className="text-white font-medium">Buat Kunci API Baru</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Klik <em>Generate New Key</em>. Kunci API Anda akan diawali dengan prefiks <code className="px-1.5 py-0.5 bg-neutral-800 rounded text-emerald-300 font-mono text-[11px]">ak_...</code>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  4
                </span>
                <div>
                  <p className="text-white font-medium">Pasang di Environment Server</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Simpan nilai kunci tersebut pada berkas <code className="px-1.5 py-0.5 bg-neutral-800 rounded text-emerald-300 font-mono text-[11px]">.env</code>:
                  </p>
                  <div className="mt-2 p-3 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-xs text-emerald-400 select-all">
                    FLORA_API_KEY="ak_xxxxxxxxxxxxxxxxxxxxxx"
                  </div>
                </div>
              </li>
            </ol>
          </div>

          {/* Technical Architecture Info */}
          <div className="border-t border-neutral-800 pt-4">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Arsitektur SDK & Proxy Server
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Aplikasi ini mengimplementasikan SDK resmi <code className="text-neutral-200 font-mono">@flora-ai/flora</code> melalui proxy backend aman (<code className="text-neutral-200 font-mono">server.ts</code>). Kunci API pengguna tidak pernah terpapar di browser dan selalu terlindungi dengan enkripsi HTTP Bearer token.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
