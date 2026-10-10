import React from 'react';
import { BeforeAfterSlider } from './BeforeAfterSlider.tsx';
import { QuotaBadge } from './QuotaDisplay.tsx';
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Wand2,
  Maximize,
  Smile,
  Sliders,
} from 'lucide-react';

interface HomeViewProps {
  onSelectTab: (tab: 'home' | 'photo' | 'video' | 'history' | 'status') => void;
  onSelectSamplePhoto: (url: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectTab, onSelectSamplePhoto }) => {
  return (
    <div className="space-y-12 pb-24 md:pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 px-4 sm:px-6">
        {/* Soft background accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-100/60 via-sky-50/20 to-transparent -z-10 pointer-events-none rounded-b-[4rem]" />

        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sky-200/80 text-sky-700 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            <span>AI Super-Resolution Engine 3.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Make Every Moment{' '}
            <span className="bg-gradient-to-r from-sky-500 via-sky-600 to-sky-400 bg-clip-text text-transparent">
              HD with AI
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tingkatkan kualitas foto dan video menjadi jernih, tajam, dan berkualitas ultra HD. Mengurangi blur,
            memperjelas tekstur wajah, serta memulihkan momen berharga Anda seperti sentuhan aplikasi Wink.
          </p>

          <div className="max-w-md mx-auto">
            <QuotaBadge />
          </div>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onSelectTab('photo')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
            >
              <ImageIcon className="w-5 h-5" />
              <span>Tingkatkan Kualitas Foto</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onSelectTab('video')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 text-slate-800 hover:text-sky-600 font-bold text-sm sm:text-base shadow-xs active:scale-95 transition-all"
            >
              <Video className="w-5 h-5 text-sky-500" />
              <span>Video Enhancer Studio</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-500" /> Output 1080p, 2K, 4K
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-500" /> Warna & Saturasi Asli Terjaga
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-500" /> Tanpa Tanda Air (No Watermark)
            </span>
          </div>
        </div>
      </section>

      {/* Live Interactive Before & After Showcase */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-sky-100 p-4 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                Preview Nyata Hasil AI RzzHD
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Bandingkan Ketajaman Sebelum & Sesudah
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('photo')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Coba dengan Foto Sendiri</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <BeforeAfterSlider
            beforeImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=35"
            afterImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=95"
            beforeLabel="Foto Asli (Buram/Noise)"
            afterLabel="Hasil RzzHD AI (Ultra HD)"
          />
        </div>
      </section>

      {/* Feature Cards Grid (Photo vs Video) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Photo Enhancer */}
          <div
            onClick={() => onSelectTab('photo')}
            className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-sky-300 p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-700">
                Paling Populer
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                AI Photo Enhancer
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Pulihkan foto buram, foto kenangan lama, atau foto profil kamera depan menjadi tajam, beresolusi tinggi,
                dan kaya tekstur alami.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-sky-500" />
                <span>Mode Wink Portrait untuk detail wajah & mata</span>
              </div>
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-sky-500" />
                <span>Pengurangan blur & de-noise cerdas</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="w-4 h-4 text-sky-500" />
                <span>Super Upscaling 1080p, 2K, hingga 4K</span>
              </div>
            </div>

            <div className="pt-2 flex items-center text-xs font-bold text-sky-600 group-hover:translate-x-1 transition-transform">
              <span>Buka Photo Enhancer</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Card 2: Video Enhancer */}
          <div
            onClick={() => onSelectTab('video')}
            className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-sky-300 p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                Keyframe Studio
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                AI Video Enhancer
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Scrubbing video interaktif, pemeriksaan detail teknis, dan ekstraksi frame video untuk ditingkatkan ke
                resolusi super HD secara instan.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span>Pemeriksaan resolusi, rasio, dan durasi video</span>
              </div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Tangkapan frame detik per detik beresolusi tinggi</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>Transparansi status kluster pemrosesan video</span>
              </div>
            </div>

            <div className="pt-2 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Buka Video Enhancer</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / 4 Langkah Sederhana */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
            Alur Penggunaan Modern
          </span>
          <h2 className="text-2xl font-black text-slate-900">
            Hanya 4 Langkah Menuju Foto & Video HD
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-sky-100 space-y-2 text-center shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white font-extrabold flex items-center justify-center mx-auto text-sm">
              1
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Unggah Media</h4>
            <p className="text-xs text-slate-500">
              Pilih foto atau video dari galeri HP, kamera, atau komputer Anda.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-100 space-y-2 text-center shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white font-extrabold flex items-center justify-center mx-auto text-sm">
              2
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Pilih Mode AI</h4>
            <p className="text-xs text-slate-500">
              Pilih mode Wink, Ultra HD, atau Super Upscaler sesuai kebutuhan media.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-100 space-y-2 text-center shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white font-extrabold flex items-center justify-center mx-auto text-sm">
              3
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Pemrosesan AI Nyata</h4>
            <p className="text-xs text-slate-500">
              Model neural network merekonstruksi jutaan detail piksel yang hilang.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-100 space-y-2 text-center shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white font-extrabold flex items-center justify-center mx-auto text-sm">
              4
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Bandingkan & Unduh</h4>
            <p className="text-xs text-slate-500">
              Geser garis perbandingan Before/After dan simpan langsung ke perangkat.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 border-t border-slate-200 text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://wa.me/62881022762735"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs transition-colors shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ada Pertanyaan / Butuh Kuota Tambahan? Hubungi Owner via WhatsApp</span>
          </a>
        </div>
        <p className="text-xs font-bold text-slate-700">
          RzzHD &bull; Make Every Moment HD with AI
        </p>
        <p className="text-[11px] text-slate-400">
          Platform AI Photo & Video Enhancer dengan integrasi 3 engine neural super resolution.
        </p>
      </footer>
    </div>
  );
};
