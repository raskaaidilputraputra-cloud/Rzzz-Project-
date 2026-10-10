import React, { useState, useRef } from 'react';
import { BeforeAfterSlider } from './BeforeAfterSlider.tsx';
import { EnhanceMode, QualityTarget, EnhanceResult } from '../types.ts';
import { getClientQuota, recordQuotaUsage, getClientId } from '../utils/quota.ts';
import { QuotaBadge, QuotaLimitAlertModal } from './QuotaDisplay.tsx';
import {
  UploadCloud,
  Sparkles,
  Download,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileImage,
  RefreshCw,
  Share2,
  Cpu,
  Layers,
  Wand2,
  ShieldAlert,
} from 'lucide-react';

interface PhotoEnhancerProps {
  onSaveToHistory: (item: EnhanceResult) => void;
  initialImageUrl?: string | null;
}

const SAMPLE_IMAGES = [
  {
    name: 'Potret & Wajah',
    description: 'Uji kejernihan wajah & kehalusan kulit',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    mode: 'wink' as EnhanceMode,
  },
  {
    name: 'Foto Buram Klasik',
    description: 'Pemulihan detail tajam foto lama',
    url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=70',
    mode: 'hd' as EnhanceMode,
  },
  {
    name: 'Tekstur & Objek',
    description: 'Peningkatan resolusi & serat detail',
    url: 'https://images.unsplash.com/photo-1508672019048-805b876b67e2?auto=format&fit=crop&w=600&q=75',
    mode: 'upscale' as EnhanceMode,
  },
];

export const PhotoEnhancer: React.FC<PhotoEnhancerProps> = ({ onSaveToHistory, initialImageUrl }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [mode, setMode] = useState<EnhanceMode>('auto');
  const [quality, setQuality] = useState<QualityTarget>('1080p');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [result, setResult] = useState<EnhanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showQuotaModal, setShowQuotaModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Format tidak didukung. Mohon pilih file gambar (JPG, PNG, WebP).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Format tidak didukung. Mohon unggah gambar (JPG, PNG, WebP).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleSelectSample = (sampleUrl: string, sampleMode: EnhanceMode) => {
    setSelectedFile(null);
    setPreviewUrl(sampleUrl);
    setMode(sampleMode);
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEnhance = async () => {
    if (!previewUrl) return;

    // Check rate limit quota (3x / 24h)
    const quota = getClientQuota();
    if (!quota.canUse) {
      setShowQuotaModal(true);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStep('Menyiapkan media dan menghubungkan ke server RzzHD...');

    try {
      const formData = new FormData();
      formData.append('mode', mode);
      formData.append('quality', quality);

      if (selectedFile) {
        setProcessingStep('Mengunggah gambar ke jembatan pemrosesan AI...');
        formData.append('image', selectedFile);
      } else if (previewUrl.startsWith('blob:')) {
        // Safe fallback if selectedFile reference was lost but blob URL exists
        setProcessingStep('Mengonversi berkas gambar lokal...');
        const blobRes = await fetch(previewUrl);
        const blob = await blobRes.blob();
        formData.append('image', blob, 'upload.jpg');
      } else {
        setProcessingStep('Memeriksa URL gambar dan mengalokasikan engine...');
        formData.append('imageUrl', previewUrl);
      }

      setProcessingStep('Model AI sedang meningkatkan ketajaman dan detail piksel...');

      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'x-client-id': getClientId(),
        },
        body: formData,
      });

      // Safely parse JSON to avoid syntax crashes if HTML error is returned
      let data: any = null;
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(
          `Server mengembalikan respons tidak terduga (${response.status}). Silakan coba beberapa saat lagi.`
        );
      }

      if (response.status === 429 || data?.quotaExceeded) {
        setShowQuotaModal(true);
        throw new Error(
          data?.error || 'Batas penggunaan 3x per 24 jam telah tercapai untuk menjaga stabilitas API.'
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Pemrosesan AI mengalami kendala. Silakan coba kembali.');
      }

      // Record successful quota usage
      recordQuotaUsage();

      setProcessingStep('Memvalidasi hasil dan menyusun perbandingan HD...');

      const newResult: EnhanceResult = {
        id: `rzzhd_${Date.now()}`,
        originalUrl: previewUrl,
        resultUrl: data.resultUrl,
        apiUsed: data.apiUsed || 'NexaDev AI Engine',
        qualityTarget: quality,
        modeUsed: mode,
        processingTimeSeconds: data.processingTimeSeconds || 3.5,
        timestamp: new Date().toISOString(),
        title: selectedFile ? selectedFile.name : 'Foto AI Terpilih',
        attempts: data.attempts,
      };

      setResult(newResult);
      onSaveToHistory(newResult);
    } catch (err: any) {
      console.error('Enhance error:', err);
      setError(err.message || 'Terjadi kesalahan saat memproses gambar dengan AI.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const downloadFilename = `RzzHD_${result.modeUsed}_${Date.now()}.jpg`;
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(result.resultUrl)}&filename=${encodeURIComponent(
      downloadFilename
    )}`;

    const a = document.createElement('a');
    a.href = proxyUrl;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    if (!result) return;
    const directUrl = result.resultUrl.startsWith('http')
      ? result.resultUrl
      : window.location.origin + result.resultUrl;
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 text-sky-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pengalaman Kejernihan Wink AI</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Photo Enhancer HD
        </h1>
        <p className="text-sm text-slate-600">
          Ubah foto buram, pecah, atau berkualitas rendah menjadi ultra tajam dan jernih dengan 3 engine AI terintegrasi.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm p-4 sm:p-6 space-y-6">
        {/* Daily Quota Indicator */}
        <QuotaBadge />

        {/* Upload State if no previewUrl */}
        {!previewUrl ? (
          <div className="space-y-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                isDraggingOver
                  ? 'border-sky-500 bg-sky-50/60 scale-[0.99]'
                  : 'border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
                <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Unggah Foto dari Galeri atau Kamera
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Tarik & lepas file gambar di sini, atau klik untuk memilih
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  JPG / JPEG
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  PNG
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  WebP
                </span>
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
                  Maks. 25 MB
                </span>
              </div>
            </div>

            {/* Quick Test Samples */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Atau Coba Foto Contoh Langsung (1-Klik)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_IMAGES.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSample(sample.url, sample.mode)}
                    className="group relative flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200/80 hover:border-sky-300 bg-white hover:bg-sky-50/30 cursor-pointer transition-all shadow-xs"
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-sky-600">
                        {sample.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{sample.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Editor State (Image Selected) */
          <div className="space-y-6">
            {/* Action Bar Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <FileImage className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                    {selectedFile ? selectedFile.name : 'Foto Siap Ditingkatkan'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Contoh Resolusi Asli'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ganti Foto</span>
                </button>
              </div>
            </div>

            {/* Display / Comparison Area */}
            {result ? (
              <div className="space-y-4">
                <BeforeAfterSlider
                  beforeImage={result.originalUrl}
                  afterImage={result.resultUrl}
                  beforeLabel="Foto Asli"
                  afterLabel="Hasil AI RzzHD"
                />

                {/* Enhancement Details Card */}
                <div className="bg-gradient-to-r from-sky-50/70 via-white to-sky-50/50 rounded-2xl p-4 border border-sky-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Berhasil Ditingkatkan</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <Cpu className="w-3.5 h-3.5 text-sky-500" />
                      <span>Engine: <strong>{result.apiUsed}</strong></span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <Layers className="w-3.5 h-3.5 text-sky-500" />
                      <span>Target: <strong className="uppercase">{result.qualityTarget}</strong></span>
                    </div>

                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">Waktu: {result.processingTimeSeconds}s</span>
                  </div>

                  {/* Result Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                      title="Salin Tautan Gambar"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{copiedLink ? 'Tersalin!' : 'Bagi Link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Foto HD</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Original Image Preview prior to enhancement */
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center min-h-[300px] max-h-[460px]">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[440px] w-auto h-auto object-contain"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                  Foto Asli (Belum Diproses)
                </span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Gagal Memproses Gambar</p>
                  <p>{error}</p>
                  <p className="text-[11px] text-rose-500">
                    Saran: Coba pilih mode AI yang berbeda (misalnya Ultra HD atau Wink), atau periksa Status API di menu.
                  </p>
                </div>
              </div>
            )}

            {/* AI Control Panels (Mode & Quality) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-sky-500" />
                  <span>Mode AI Enhancer</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('auto')}
                    className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                      mode === 'auto'
                        ? 'border-sky-500 bg-sky-50/80 text-sky-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-500" /> Auto Smart
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Pilihan model otomatis terbaik
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('wink')}
                    className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                      mode === 'wink'
                        ? 'border-sky-500 bg-sky-50/80 text-sky-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-pink-500" /> Wink Portrait
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Wajah halus, mata & bibir jernih
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('hd')}
                    className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                      mode === 'hd'
                        ? 'border-sky-500 bg-sky-50/80 text-sky-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sky-500" /> Ultra HD De-blur
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Pertajam fokus & kurangi blur
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('upscale')}
                    className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                      mode === 'upscale'
                        ? 'border-sky-500 bg-sky-50/80 text-sky-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" /> Super Upscaler
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Rekonstruksi piksel 2x / 4x
                    </span>
                  </button>
                </div>
              </div>

              {/* Quality Target Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-500" />
                  <span>Target Kualitas Output</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1080p', '2k', '4k'] as QualityTarget[]).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        quality === q
                          ? 'border-sky-500 bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-semibold'
                      }`}
                    >
                      <span className="text-xs uppercase">{q}</span>
                      <span
                        className={`text-[10px] ${quality === q ? 'text-sky-100' : 'text-slate-400'}`}
                      >
                        {q === '1080p' ? 'Full HD' : q === '2k' ? 'Quad HD' : 'Ultra HD'}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Engine menjaga warna, rasio aspek, pencahayaan dan kontras sedekat mungkin dengan foto asli.
                </p>
              </div>
            </div>

            {/* Enhance CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleEnhance}
                disabled={isProcessing}
                className={`w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-sm sm:text-base shadow-lg transition-all ${
                  isProcessing
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500 hover:from-sky-600 hover:to-sky-700 shadow-sky-500/25 active:scale-[0.99]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{processingStep || 'Sedang Memproses AI...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>
                      {result ? 'Proses Ulang dengan Pengaturan Ini' : 'Tingkatkan Kualitas dengan AI'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
            01
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Ketajaman Alami Wink</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Menghilangkan blur dan noise tanpa membuat tekstur tampak berlebihan atau terdistorsi.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
            02
          </div>
          <h4 className="font-bold text-slate-800 text-sm">3 Engine Saling Cadang</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Jika satu endpoint mencapai batas atau mengalami kendala, sistem langsung beralih secara otomatis.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
            03
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Privasi & Hapus Otomatis</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            File sementara dibersihkan dari server berkala secara otomatis demi privasi pengguna.
          </p>
        </div>
      </div>
      {/* Quota Limit Modal */}
      <QuotaLimitAlertModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
      />
    </div>
  );
};
