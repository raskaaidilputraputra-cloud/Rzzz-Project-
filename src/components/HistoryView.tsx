import React, { useState } from 'react';
import { EnhanceResult } from '../types.ts';
import { BeforeAfterSlider } from './BeforeAfterSlider.tsx';
import {
  History,
  Trash2,
  Download,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  X,
  Share2,
} from 'lucide-react';

interface HistoryViewProps {
  history: EnhanceResult[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onNavigateToPhoto: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onDeleteItem,
  onNavigateToPhoto,
}) => {
  const [selectedItem, setSelectedItem] = useState<EnhanceResult | null>(null);

  const handleDownload = (item: EnhanceResult) => {
    const filename = `RzzHD_${item.modeUsed}_${item.id}.jpg`;
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(item.resultUrl)}&filename=${encodeURIComponent(
      filename
    )}`;
    const a = document.createElement('a');
    a.href = proxyUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-sky-500" />
            <span>Riwayat Pemrosesan AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar foto yang telah berhasil ditingkatkan kualitasnya di perangkat Anda.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Semua</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl border border-sky-100 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 mx-auto flex items-center justify-center">
            <History className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">Belum Ada Riwayat</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Foto yang Anda tingkatkan dengan AI akan otomatis tersimpan di sini agar mudah diunduh kembali kapan saja.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToPhoto}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mulai Tingkatkan Foto Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image Preview */}
                <div
                  className="relative aspect-4/3 bg-slate-900 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <img
                    src={item.resultUrl}
                    alt={item.title || 'Enhanced Image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-slate-800 text-xs font-bold backdrop-blur-md shadow-lg">
                      <Eye className="w-3.5 h-3.5 text-sky-500" />
                      <span>Lihat Perbandingan</span>
                    </span>
                  </div>

                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    {item.qualityTarget}
                  </span>

                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-sky-500/90 backdrop-blur-md text-white text-[10px] font-bold capitalize">
                    {item.modeUsed}
                  </span>
                </div>

                {/* Details */}
                <div className="p-3.5 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {item.title || 'Foto RzzHD Enhanced'}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>{item.processingTimeSeconds}s</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Engine: {item.apiUsed}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 pt-0 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-600 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(item)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Perbandingan Hasil ({selectedItem.title || 'Foto RzzHD'})
                </h3>
                <p className="text-xs text-slate-500">
                  Mode: <strong className="capitalize">{selectedItem.modeUsed}</strong> &bull; Target:{' '}
                  <strong className="uppercase">{selectedItem.qualityTarget}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <BeforeAfterSlider
              beforeImage={selectedItem.originalUrl}
              afterImage={selectedItem.resultUrl}
              beforeLabel="Foto Asli"
              afterLabel="Hasil RzzHD"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleDownload(selectedItem)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Hasil HD</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
