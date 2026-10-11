import React, { useState } from 'react';
import {
  Sparkles,
  Repeat,
  Music,
  Layers,
  Moon,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  UserCheck,
  Play,
  Bell,
  ThumbsUp,
  MessageSquare,
  Radio,
  Headphones,
  CheckCircle,
  BarChart3,
  ListOrdered,
  Flame,
  ArrowRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { setStoredGoogleToken } from '../utils/youtubeActions';
import { DeveloperFooter } from './DeveloperFooter';
import { DeveloperModal } from './DeveloperModal';

interface LoginScreenProps {
  onGuestLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onGuestLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        setStoredGoogleToken(token);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Jendela login ditutup sebelum selesai. Silakan coba klik login kembali.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg(
          'Domain belum diizinkan di Firebase Authentication. Buka Firebase Console > Authentication > Settings > Authorized domains dan tambahkan localhost.'
        );
        setShowConfigGuide(true);
      } else if (err.code === 'auth/cancelled-popup-request') {
        // user clicked again
      } else {
        setErrorMsg('Gagal masuk: ' + (err.message || 'Silakan periksa pengaturan Firebase.'));
        setShowConfigGuide(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-red-500 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-20 w-[500px] h-[350px] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[300px] bg-rose-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/icon.png"
            alt="LoopTube HD Icon"
            className="w-11 h-11 rounded-2xl object-cover shadow-lg shadow-red-600/30 border border-red-500/30 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                LoopTube
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                PRO 2026
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-zinc-400">
              <span>By:</span>
              <a
                href="https://kioskode.my.id/"
                target="_blank"
                rel="dofollow"
                className="text-red-400 hover:text-red-300 font-bold hover:underline"
              >
                Kios Kode
              </a>
              <span>• YouTube Looper</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGuestLogin}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 hover:border-zinc-500 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline">Masuk</span> Cepat (Tamu)
          </button>
        </div>
      </header>

      {/* Main Landing Page Hero */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8 flex flex-col items-center">
        {/* Channel Partner Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/90 text-zinc-300 border border-zinc-800 shadow-inner mb-5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Channel Aktif Terintegrasi:</span>
          <strong className="text-white flex items-center gap-1">
            Kios Kode
            <span className="text-red-400 font-mono">(@KiosKode)</span>
          </strong>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-3xl space-y-3.5 px-2">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Putar & Ulang Video YouTube{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
              Tanpa Henti
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Putar seluruh video dalam antrean secara berurutan (misal 10 video), lalu otomatis kembali
            ke video 1 terus-menerus. Terhubung resmi dengan akun Google Anda untuk Like, Subscribe,
            dan Komentar yang <strong>tercatat sah di YouTube Studio Analytics</strong>.
          </p>
        </div>

        {/* 3 Key Value Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5 text-[11px] font-semibold text-zinc-300">
          <span className="px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center gap-1.5">
            <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
            <span>Loop Antrean Playlist (1 s/d 10</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
            <span>1)</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            Watch Time & Views Terbaca di Analytics
          </span>
          <span className="px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-rose-400" />
            Background Audio Playback
          </span>
        </div>

        {/* Dual Responsive Card Section */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mt-8 sm:mt-10 max-w-5xl">
          {/* Left Column: Login Card */}
          <div className="w-full h-full p-5 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Masuk ke LoopTube
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Gunakan akun Google Anda untuk akses penuh
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl bg-zinc-800/80 text-zinc-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* Google Sign-in Button */}
              <div className="space-y-2.5">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs sm:text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                      <span>Menghubungkan ke Akun Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Masuk dengan Akun Google</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-zinc-400 text-center">
                  Masuk dengan 1-klik untuk simpan playlist dan sinkronisasi otomatis antar perangkat.
                </p>
              </div>

              {/* Quick Access Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Atau Buka Langsung
                </span>
                <div className="flex-grow border-t border-zinc-800"></div>
              </div>

              {/* Guest / Direct Button */}
              <button
                onClick={onGuestLogin}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Masuk Cepat & Putar Langsung</span>
              </button>
              <p className="text-[10px] text-emerald-400/90 text-center flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Langsung putar semua 6+ video Kios Kode seketika tanpa login
              </p>
            </div>

            {/* Help / Firebase Note */}
            <div className="pt-3 border-t border-zinc-800/80">
              <button
                onClick={() => setShowConfigGuide(!showConfigGuide)}
                className="w-full flex items-center justify-between text-[11px] text-zinc-400 hover:text-zinc-200 py-1 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Bantuan & Pengaturan Akun
                </span>
                <span className="text-zinc-400">
                  {showConfigGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {showConfigGuide && (
                <div className="mt-2.5 p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 text-[11px] text-zinc-400 space-y-2 leading-relaxed">
                  <p className="font-bold text-white">Panduan Masuk:</p>
                  <p>
                    • <strong>Masuk dengan Akun Google:</strong> Akses penuh untuk menyimpan riwayat putar dan playlist favorit Anda di Cloud. Semua akun Google didukung langsung.
                  </p>
                  <p>
                    • <strong>Masuk Cepat (Tamu):</strong> Putar langsung video loop Kios Kode secara instan tanpa perlu akun Google.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Feature Showcase & Interactive Mockup */}
          <div className="w-full h-full flex flex-col">
            <div className="h-full p-5 sm:p-7 rounded-3xl bg-zinc-900/80 border border-zinc-800/90 backdrop-blur-md shadow-2xl flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 fill-red-400 text-red-400 ml-0.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Kios Kode Video Playlist
                    </h4>
                    <p className="text-[10px] text-zinc-400">Loop Siklikal 1 s/d Selesai Aktif</p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">
                  Auto-Sync On
                </span>
              </div>

              {/* Video Thumbnail Preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-black group shadow-lg">
                <img
                  src="https://i.ytimg.com/vi/UslOP77SkUk/hqdefault.jpg"
                  alt="Lufya CBT Kios Kode"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                  <span className="text-[10px] uppercase font-bold text-red-400 mb-0.5">
                    Antrean 1 dari 6 • Kios Kode
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-white truncate">
                    Lufya CBT - Sistem Ujian Berbasis Komputer
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Berikutnya: PPDB Plus WhatsApp Gateway Fonnte
                  </p>
                </div>
                <div className="absolute top-3 right-3 bg-red-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Repeat className="w-3 h-3" /> Loop Playlist
                </div>
              </div>

              {/* Direct YouTube Actions Preview */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs pt-1">
                <div className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 flex flex-col items-center gap-1 hover:border-red-500/40 transition-colors">
                  <Bell className="w-4 h-4 text-red-500" />
                  <span className="text-[11px] font-bold text-zinc-200">Subscribe</span>
                  <span className="text-[9px] text-zinc-500">Kios Kode</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 flex flex-col items-center gap-1 hover:border-amber-500/40 transition-colors">
                  <ThumbsUp className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold text-zinc-200">Like Video</span>
                  <span className="text-[9px] text-zinc-500">Tercatat di Analytics</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 flex flex-col items-center gap-1 hover:border-cyan-500/40 transition-colors">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span className="text-[11px] font-bold text-zinc-200">Komentar</span>
                  <span className="text-[9px] text-zinc-500">Langsung Terbit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl mt-12 text-left">
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="p-2.5 w-fit rounded-xl bg-amber-500/10 text-amber-400 mb-3">
              <ListOrdered className="w-5 h-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Loop Seluruh Playlist</h4>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
              Semua video di antrean diputar berurutan 1 sampai selesai, lalu kembali otomatis ke video 1.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white">100% Sah di Analytics</h4>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
              Menggunakan IFrame API resmi YouTube. Menambah watch time, views, like, & interaksi sah.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="p-2.5 w-fit rounded-xl bg-red-500/10 text-red-400 mb-3">
              <Radio className="w-5 h-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Auto-Sync Video Baru</h4>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
              Memeriksa unggahan baru channel Kios Kode dan langsung menyisipkannya ke antrean teratas.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="p-2.5 w-fit rounded-xl bg-rose-500/10 text-rose-400 mb-3">
              <Headphones className="w-5 h-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Audio Latar & Timer</h4>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
              Dengarkan dengan visualizer santai, kontrol MediaSession background, dan pengatur waktu tidur.
            </p>
          </div>
        </div>
      </main>

      {/* Developer Footer with Dofollow Backlink & Contacts */}
      <div className="relative z-10 w-full">
        <DeveloperFooter onOpenDevModal={() => setShowDevModal(true)} />
      </div>

      <DeveloperModal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
      />
    </div>
  );
};
