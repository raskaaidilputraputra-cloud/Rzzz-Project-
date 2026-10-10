import React, { useState, useEffect } from 'react';
import { ApiStatusInfo } from '../types.ts';
import { getClientQuota } from '../utils/quota.ts';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
  MessageCircle,
  PhoneCall,
  UserCheck,
  Sparkles,
  Film,
  Layers,
} from 'lucide-react';

export const ApiStatusView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [quota, setQuota] = useState(getClientQuota());
  const [services, setServices] = useState<{
    api1_hd?: ApiStatusInfo;
    api2_upscale?: ApiStatusInfo;
    api3_wink?: ApiStatusInfo;
  }>({});

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.services) {
        setServices(data.services);
        setLastUpdated(new Date().toLocaleTimeString('id-ID'));
      }
      setQuota(getClientQuota());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-500" />
            <span>Statistik Sistem & Status Layanan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantauan diagnostik kuota, statistik performa 3 endpoint AI, dan pusat kontak owner resmi RzzHD.
          </p>
        </div>

        <button
          type="button"
          onClick={checkStatus}
          disabled={loading}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            loading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-600'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-500' : ''}`} />
          <span>{loading ? 'Memeriksa...' : 'Perbarui Data Statistik'}</span>
        </button>
      </div>

      {/* SECTION: HUBUNGI OWNER (DIPINDAHKAN KE SINI SESUAI PERMINTAAN) */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-50 text-xs font-bold border border-white/20">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Layanan Pelanggan & Pemilik Resmi RzzHD</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Hubungi Owner RzzHD
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Membutuhkan <strong>kuota tambahan</strong> di luar batas 3x per 24 jam, memiliki pertanyaan teknis,
              melaporkan kendala API pada domain Anda, atau ingin kerja sama integrasi? Hubungi langsung owner melalui WhatsApp resmi.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-emerald-100 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-200" /> Respon Cepat (Aktif)
              </span>
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-200" /> +62 881-0227-62735
              </span>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <a
              href="https://wa.me/62881022762735"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-sm shadow-xl active:scale-95 transition-all duration-200 group"
            >
              <MessageCircle className="w-5 h-5 fill-emerald-600 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>Hubungi via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* QUICK STATS METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Sisa Kuota 24 Jam
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-800 flex items-baseline gap-1">
            <span>{quota.remaining}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 3 kali</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {quota.remaining === 0 ? `Reset dalam ${quota.nextResetFormatted}` : 'Tersedia untuk diproses'}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Engine AI Aktif
          </span>
          <div className="text-xl sm:text-2xl font-black text-sky-600 flex items-baseline gap-1">
            <span>3</span>
            <span className="text-xs text-slate-400 font-semibold">Layanan</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Siap Failover Cerdas
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Pipeline Video
          </span>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 flex items-baseline gap-1">
            <span>FFmpeg</span>
          </div>
          <p className="text-[11px] text-slate-500">Video Bergerak H.264</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Privasi Data
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 flex items-baseline gap-1">
            <span>Auto-Wipe</span>
          </div>
          <p className="text-[11px] text-slate-500">Dibersihkan per 30 mnt</p>
        </div>
      </div>

      {lastUpdated && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Diagnostik API diperbarui pukul {lastUpdated}</span>
        </div>
      )}

      {/* Services Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* API 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                API 1
              </span>
              <h3 className="font-bold text-slate-800 text-sm mt-1">HD Image Engine</h3>
            </div>
            {services.api1_hd?.ok ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                Standby
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 font-mono break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
            https://api.nexadev.my.id/tools/hd/
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Metode:</span>
              <strong className="font-mono">GET ?image=</strong>
            </div>
            <div className="flex justify-between">
              <span>Format Output:</span>
              <span>JSON (Image URL)</span>
            </div>
            <div className="flex justify-between">
              <span>Spesialisasi:</span>
              <span>Pengurangan blur & de-noise</span>
            </div>
          </div>
        </div>

        {/* API 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                API 2
              </span>
              <h3 className="font-bold text-slate-800 text-sm mt-1">Image Upscale Engine</h3>
            </div>
            {services.api2_upscale?.ok ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                Standby
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 font-mono break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
            https://api.nexadev.my.id/api/upscale
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Metode:</span>
              <strong className="font-mono">GET ?url=</strong>
            </div>
            <div className="flex justify-between">
              <span>Format Output:</span>
              <span>Biner (image/jpeg)</span>
            </div>
            <div className="flex justify-between">
              <span>Spesialisasi:</span>
              <span>Super Resolution 2x/4x</span>
            </div>
          </div>
        </div>

        {/* API 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                API 3
              </span>
              <h3 className="font-bold text-slate-800 text-sm mt-1">Wink AI Engine</h3>
            </div>
            {services.api3_wink?.ok ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                Standby
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 font-mono break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
            https://api.nexadev.my.id/api/wink
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Metode:</span>
              <strong className="font-mono">GET ?url=</strong>
            </div>
            <div className="flex justify-between">
              <span>Format Output:</span>
              <span>JSON (Result URL)</span>
            </div>
            <div className="flex justify-between">
              <span>Spesialisasi:</span>
              <span>Potret, wajah & kecantikan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture & Reliability */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Zap className="w-5 h-5 text-sky-500" />
          <span>Sistem Pembatasan Kuota & Perlindungan API Domain</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-sky-50/50 space-y-2 border border-sky-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <Server className="w-4 h-4 text-sky-600" />
              <span>Batas 3x per 24 Jam per Perangkat</span>
            </h4>
            <p className="leading-relaxed text-slate-500">
              Setiap pengguna diberikan kuota 3 kali pemrosesan HD per 24 jam untuk foto dan video bergerak berdasarkan identifikasi unik perangkat (device token). Hal ini memastikan setiap pengunjung domain mendapatkan jatahnya sendiri tanpa terblokir oleh pengunjung lain.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 space-y-2 border border-indigo-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Engine Video Bergerak H.264</span>
            </h4>
            <p className="leading-relaxed text-slate-500">
              Peningkatan kualitas video memproses video bergerak penuh menggunakan filter neural Lanczos scaling, unsharp de-blur, dan peredam noise spatio-temporal dengan tetap mempertahankan sinkronisasi audio AAC serta durasi aslinya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
