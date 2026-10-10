import React, { useState, useEffect } from 'react';
import { getClientQuota, MAX_QUOTA_PER_24H } from '../utils/quota.ts';
import { Clock, AlertCircle, ShieldAlert, Zap, X, MessageCircle } from 'lucide-react';

interface QuotaDisplayProps {
  onQuotaCheck?: (canUse: boolean) => void;
  compact?: boolean;
}

export const QuotaBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [quota, setQuota] = useState(getClientQuota());

  useEffect(() => {
    const interval = setInterval(() => {
      setQuota(getClientQuota());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const badgeColor =
    quota.remaining === 0
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : quota.remaining === 1
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-sky-50 text-sky-700 border-sky-200';

  const dotColor =
    quota.remaining === 0 ? 'bg-rose-500' : quota.remaining === 1 ? 'bg-amber-500' : 'bg-sky-500';

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}
        title={`Batas: 3x per 24 jam. Sisa: ${quota.remaining}x. Reset: ${quota.nextResetFormatted}`}
      >
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span>Kuota AI: {quota.remaining}/{MAX_QUOTA_PER_24H}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-2xl border ${badgeColor}`}>
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4" />
        <div className="text-xs">
          <span className="font-bold">
            Sisa Kuota HD: {quota.remaining} dari {MAX_QUOTA_PER_24H} kali
          </span>
          <span className="text-slate-500 ml-1.5 hidden sm:inline">
            (Batas 3x per 24 jam untuk stabilitas API)
          </span>
        </div>
      </div>

      {quota.used > 0 && (
        <div className="flex items-center gap-1 text-[11px] font-mono font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Reset: {quota.nextResetFormatted}</span>
        </div>
      )}
    </div>
  );
};

export const QuotaLimitAlertModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [quota, setQuota] = useState(getClientQuota());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setQuota(getClientQuota());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-slate-900">
            Batas Penggunaan Tercapai (3x / 24 Jam)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Anda telah menggunakan kuota pemrosesan HD sebanyak <strong>3 kali</strong> dalam kurun waktu 24 jam.
            Pembatasan ini diterapkan untuk menjaga kestabilan kunci API dan server pemrosesan AI.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-500" />
              <span>Waktu Reset Kuota Berikutnya:</span>
            </span>
            <span className="font-mono text-sm font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
              {quota.nextResetFormatted}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Kuota akan otomatis terisi kembali segera setelah masa 24 jam berlalu.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <a
            href="https://wa.me/62881022762735"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Hubungi Owner via WhatsApp (Request Kuota)</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
          >
            Mengerti, Saya Akan Menunggu
          </button>
        </div>
      </div>
    </div>
  );
};
