import React, { useState, useRef, useEffect } from 'react';
import { VideoMetadata, QualityTarget, VideoEnhanceResult } from '../types.ts';
import { getClientQuota, recordQuotaUsage, getClientId } from '../utils/quota.ts';
import { QuotaBadge, QuotaLimitAlertModal } from './QuotaDisplay.tsx';
import {
  Video as VideoIcon,
  UploadCloud,
  Sparkles,
  Play,
  Pause,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Film,
  RefreshCw,
  Layers,
  Sliders,
  AlertCircle,
  Columns2,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';

const SAMPLE_VIDEOS = [
  {
    name: 'Video Gerakan & Alam (360p)',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    desc: 'Uji peningkatan resolusi gerakan halus & warna dinamis',
  },
  {
    name: 'Video Karakter & Garis (480p)',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    desc: 'Uji ketajaman garis tepi, detail tekstur & kejernihan',
  },
];

export const VideoEnhancer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [quality, setQuality] = useState<QualityTarget>('1080p');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [enhancedVideoResult, setEnhancedVideoResult] = useState<VideoEnhanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState<boolean>(false);

  // Synchronized Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [activeViewTab, setActiveViewTab] = useState<'side-by-side' | 'enhanced-only' | 'original-only'>(
    'side-by-side'
  );

  const origVideoRef = useRef<HTMLVideoElement>(null);
  const enhVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        setError('Format tidak didukung. Mohon unggah berkas video (MP4, MOV, WebM).');
        return;
      }
      setVideoFile(file);
      setVideoSrc(URL.createObjectURL(file));
      setEnhancedVideoResult(null);
      setError(null);
      setIsPlaying(false);
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setVideoFile(null);
    setVideoSrc(sampleUrl);
    setEnhancedVideoResult(null);
    setError(null);
    setIsPlaying(false);
  };

  const handleLoadedMetadata = () => {
    if (!origVideoRef.current) return;
    const v = origVideoRef.current;
    setDuration(v.duration || 0);
    setMetadata({
      name: videoFile ? videoFile.name : 'Contoh Video Resolusi Standar',
      size: videoFile ? videoFile.size : 12 * 1024 * 1024,
      duration: v.duration || 0,
      width: v.videoWidth || 1280,
      height: v.videoHeight || 720,
      type: videoFile ? videoFile.type : 'video/mp4',
    });
  };

  const handleTimeUpdate = () => {
    if (!origVideoRef.current) return;
    setCurrentTime(origVideoRef.current.currentTime);
  };

  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (origVideoRef.current) {
      if (nextState) origVideoRef.current.play();
      else origVideoRef.current.pause();
    }
    if (enhVideoRef.current) {
      if (nextState) enhVideoRef.current.play();
      else enhVideoRef.current.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (origVideoRef.current) origVideoRef.current.currentTime = time;
    if (enhVideoRef.current) enhVideoRef.current.currentTime = time;
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (origVideoRef.current) origVideoRef.current.muted = nextMute;
    if (enhVideoRef.current) enhVideoRef.current.muted = nextMute;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEnhanceVideo = async () => {
    if (!videoSrc) return;

    // Check quota
    const quota = getClientQuota();
    if (!quota.canUse) {
      setShowQuotaModal(true);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStep('Menyiapkan media video dan mengalokasikan pipeline...');

    try {
      const formData = new FormData();
      formData.append('quality', quality);

      if (videoFile) {
        setProcessingStep('Mengunggah video ke server akselerasi...');
        formData.append('video', videoFile);
      } else if (videoSrc.startsWith('blob:')) {
        setProcessingStep('Membaca berkas video lokal...');
        const blobRes = await fetch(videoSrc);
        const blob = await blobRes.blob();
        formData.append('video', blob, 'video_input.mp4');
      } else {
        setProcessingStep('Mengambil video sampel...');
        formData.append('videoUrl', videoSrc);
      }

      setProcessingStep('Model AI & filter neural sedang meningkatkan resolusi dan ketajaman gerakan video...');

      const response = await fetch('/api/video-enhance', {
        method: 'POST',
        headers: {
          'x-client-id': getClientId(),
        },
        body: formData,
      });

      let data: any = null;
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(
          `Server mengembalikan respons tidak terduga (${response.status}). Mohon coba kembali.`
        );
      }

      if (response.status === 429 || data?.quotaExceeded) {
        setShowQuotaModal(true);
        throw new Error(
          data?.error || 'Batas penggunaan 3x per 24 jam telah tercapai untuk menjaga kestabilan sistem.'
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Gagal memproses peningkatan kualitas video.');
      }

      // Record quota usage
      recordQuotaUsage();

      setProcessingStep('Menyelesaikan encoding MP4 HD & sinkronisasi audio...');

      const newRes: VideoEnhanceResult = {
        id: `v_hd_${Date.now()}`,
        originalVideoUrl: videoSrc,
        resultVideoUrl: data.resultVideoUrl,
        qualityTarget: quality,
        processingTimeSeconds: data.processingTimeSeconds || 6.5,
        timestamp: new Date().toISOString(),
        title: videoFile ? videoFile.name : 'Video HD RzzHD',
      };

      setEnhancedVideoResult(newRes);
    } catch (err: any) {
      console.error('Video enhance error:', err);
      setError(err.message || 'Terjadi kesalahan saat meningkatkan kualitas video bergerak.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleDownloadEnhancedVideo = () => {
    if (!enhancedVideoResult) return;
    const filename = `RzzHD_Video_Enhanced_${enhancedVideoResult.qualityTarget}_${Date.now()}.mp4`;
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(
      enhancedVideoResult.resultVideoUrl
    )}&filename=${encodeURIComponent(filename)}`;

    const a = document.createElement('a');
    a.href = proxyUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (origVideoRef.current) origVideoRef.current.pause();
    if (enhVideoRef.current) enhVideoRef.current.pause();
    setVideoFile(null);
    setVideoSrc(null);
    setMetadata(null);
    setEnhancedVideoResult(null);
    setError(null);
    setIsPlaying(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 text-sky-700 text-xs font-semibold">
          <Film className="w-3.5 h-3.5" />
          <span>AI Motion Video Super-Resolution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Video Enhancer HD Bergerak
        </h1>
        <p className="text-sm text-slate-600">
          Sempurnakan video yang bergerak menjadi lebih tajam, jernih, dan beresolusi Full HD / 2K / 4K dengan
          mempertahankan audio asli dan sinkronisasi gerakan.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm p-4 sm:p-6 space-y-6">
        {/* Quota Indicator */}
        <QuotaBadge />

        {!videoSrc ? (
          /* Video Upload State */
          <div className="space-y-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/20 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
                <VideoIcon className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Unggah Video Bergerak dari Perangkat
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Mendukung format MP4, MOV, WebM. Menghasilkan video bergerak HD (bukan gambar diam).
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  MP4 Video
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  MOV (Apple)
                </span>
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
                  Pertahankan Audio & Durasi
                </span>
              </div>
            </div>

            {/* Quick Test Samples */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Atau Coba Video Contoh Bergerak (1-Klik)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_VIDEOS.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSample(sample.url)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/30 cursor-pointer transition-all shadow-xs flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-slate-800 hover:text-sky-600">
                        {sample.name}
                      </h4>
                      <p className="text-xs text-slate-500">{sample.desc}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold shrink-0">
                      Coba Video
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Video Player & Enhancer View */
          <div className="space-y-6">
            {/* Top Bar Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                    {metadata?.name || 'Video RzzHD'}
                  </h3>
                  {metadata && (
                    <p className="text-xs text-slate-500">
                      {metadata.width}x{metadata.height} &bull; {formatTime(metadata.duration)} &bull;{' '}
                      {(metadata.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ganti Video</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Gagal Memproses Video</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Video Player Section */}
            {enhancedVideoResult ? (
              /* Enhanced vs Original Video Player Comparison */
              <div className="space-y-4">
                {/* View Mode Switcher */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveViewTab('side-by-side')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        activeViewTab === 'side-by-side'
                          ? 'bg-white text-sky-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Berdampingan (Sinkron)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveViewTab('enhanced-only')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        activeViewTab === 'enhanced-only'
                          ? 'bg-white text-sky-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Hanya Video HD AI
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveViewTab('original-only')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        activeViewTab === 'original-only'
                          ? 'bg-white text-sky-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Hanya Video Asli
                    </button>
                  </div>

                  <span className="text-slate-400 hidden sm:inline">
                    Pemutaran video bergerak secara sinkron otomatis
                  </span>
                </div>

                {/* Video Stage */}
                <div
                  className={`grid gap-3 ${
                    activeViewTab === 'side-by-side' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {/* Original Video Box */}
                  {(activeViewTab === 'side-by-side' || activeViewTab === 'original-only') && (
                    <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[260px] max-h-[460px] border border-slate-800">
                      <video
                        ref={origVideoRef}
                        src={videoSrc}
                        crossOrigin="anonymous"
                        onLoadedMetadata={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        loop
                        playsInline
                        muted={isMuted}
                        className="max-h-[440px] w-auto h-auto object-contain"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                        Video Asli (Resolusi Awal)
                      </span>
                    </div>
                  )}

                  {/* Enhanced Video Box */}
                  {(activeViewTab === 'side-by-side' || activeViewTab === 'enhanced-only') && (
                    <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[260px] max-h-[460px] border border-sky-500/40 shadow-md shadow-sky-500/10">
                      <video
                        ref={enhVideoRef}
                        src={enhancedVideoResult.resultVideoUrl}
                        crossOrigin="anonymous"
                        loop
                        playsInline
                        muted={isMuted}
                        className="max-h-[440px] w-auto h-auto object-contain"
                      />
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-bold tracking-wide shadow-lg">
                        Hasil Video Bergerak HD ({enhancedVideoResult.qualityTarget.toUpperCase()})
                      </span>
                    </div>
                  )}
                </div>

                {/* Unified Player Controls */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-xs"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                      title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-sky-600" />}
                    </button>

                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="text-xs font-mono font-bold text-slate-600 shrink-0">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                </div>

                {/* Details & Download Action Card */}
                <div className="bg-gradient-to-r from-sky-50/70 via-white to-sky-50/50 rounded-2xl p-4 border border-sky-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Video Bergerak HD Berhasil Dibuat</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <Layers className="w-3.5 h-3.5 text-sky-500" />
                      <span>Target: <strong className="uppercase">{enhancedVideoResult.qualityTarget}</strong></span>
                    </div>

                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">
                      Waktu Pemrosesan: {enhancedVideoResult.processingTimeSeconds}s
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadEnhancedVideo}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Video Bergerak HD (.mp4)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Original Video Preview before enhancement */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[460px] min-h-[300px]">
                  <video
                    ref={origVideoRef}
                    src={videoSrc}
                    crossOrigin="anonymous"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    loop
                    playsInline
                    muted={isMuted}
                    className="max-h-[440px] w-auto h-auto object-contain"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                    Video Asli (Belum Ditingkatkan)
                  </span>
                </div>

                {/* Player Controls */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-xs"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-sky-600" />}
                    </button>

                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="text-xs font-mono font-bold text-slate-600 shrink-0">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                </div>

                {/* Target Quality Selection & Action */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sky-500" />
                    <span>Pilih Target Resolusi Video HD</span>
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
                        <span className={`text-[10px] ${quality === q ? 'text-sky-100' : 'text-slate-400'}`}>
                          {q === '1080p' ? 'Full HD 1080p' : q === '2k' ? 'Quad HD 2K' : 'Ultra HD 4K'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Proses ini mempertajam objek yang bergerak, mengurangi motion blur, meningkatkan detail wajah, dan
                    mempertahankan audio asli secara sinkron.
                  </p>
                </div>

                {/* Enhance Video CTA Button */}
                <button
                  type="button"
                  onClick={handleEnhanceVideo}
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
                      <span>{processingStep || 'Sedang Menyempurnakan Video Bergerak...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Sempurnakan Video Bergerak ke HD</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quota Modal */}
      <QuotaLimitAlertModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
      />
    </div>
  );
};
