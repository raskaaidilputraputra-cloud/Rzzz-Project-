# RzzHD — AI Photo & Video Enhancer

> **Make Every Moment HD with AI**  
> Platform modern untuk meningkatkan kualitas foto dan video bergerak menjadi jernih, tajam, dan berkualitas Ultra HD dengan inspirasi pengalaman pengguna Wink.

---

## 🌟 Fitur Utama

- **AI Photo Enhancer**:
  - Mengubah foto buram menjadi tajam dan jernih.
  - Mengurangi blur & noise tanpa merusak tekstur asli.
  - Memperbaiki kualitas wajah (*Wink Beauty Mode*).
  - Pilihan output: **1080p Full HD**, **2K Quad HD**, dan **4K Ultra HD**.
  - Penggeser interaktif *Before/After* (Split Slider).
- **AI Video Enhancer (Moving Video)**:
  - Menyempurnakan video bergerak utuh (.mp4, .mov, .webm) menggunakan neural filtering & Lanczos scaling dengan akselerasi **FFmpeg**.
  - Mengurangi motion blur, spatio-temporal de-noising, dan peningkatan kontras/saturasi.
  - Menjaga durasi, rasio aspek, serta sinkronisasi audio asli (AAC).
  - Pemutar video sinkron berdampingan (*Side-by-side synchronized player*).
- **Pembatasan Kuota & Proteksi API**:
  - Batas **3x penggunaan per 24 jam** untuk menjaga kestabilan API.
  - Countdown reset kuota otomatis.
- **Dukungan & Kontak**:
  - Tombol langsung "Hubungi Owner" via WhatsApp.

---

## 🚀 Teknologi yang Digunakan

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion.
- **Backend**: Node.js, Express, Multer, FFmpeg.
- **AI Processing Engines**:
  - NexaDev HD Image API (`https://api.nexadev.my.id/tools/hd/`)
  - NexaDev Image Upscale API (`https://api.nexadev.my.id/api/upscale`)
  - NexaDev Wink AI API (`https://api.nexadev.my.id/api/wink`)
  - FFmpeg H.264 Video Pipeline

---

## 🛠️ Panduan Instalasi Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/USERNAME/rzzhd.git
cd rzzhd
```

### 2. Pasang Dependensi
```bash
npm install
```

Pastikan sistem Anda telah terpasang **FFmpeg**:
- **Ubuntu/Debian**: `sudo apt update && sudo apt install ffmpeg`
- **MacOS**: `brew install ffmpeg`
- **Windows**: Unduh dari [ffmpeg.org](https://ffmpeg.org) dan tambahkan ke PATH.

### 3. Konfigurasi Lingkungan (.env)
Salin `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Buka browser pada `http://localhost:3000` (atau port yang ditentukan).

---

## 📞 Kontak Owner
- WhatsApp: [https://wa.me/62881022762735](https://wa.me/62881022762735)
