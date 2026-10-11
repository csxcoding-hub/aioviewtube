import React, { useState } from 'react';
import {
  Repeat,
  Headphones,
  Maximize2,
  Minimize2,
  Plus,
  Moon,
  LogOut,
  User,
  Sparkles,
  Layers,
  Video,
} from 'lucide-react';
import { AppUser } from '../types';

interface NavbarProps {
  user: AppUser;
  isBackgroundMode: boolean;
  isZenMode: boolean;
  sleepTimerRemaining: number | null;
  onToggleBackgroundMode: () => void;
  onToggleZenMode: () => void;
  onOpenBatchModal: () => void;
  onOpenSleepTimer: () => void;
  onSignOut: () => void;
  onOpenDevModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isBackgroundMode,
  isZenMode,
  sleepTimerRemaining,
  onToggleBackgroundMode,
  onToggleZenMode,
  onOpenBatchModal,
  onOpenSleepTimer,
  onSignOut,
  onOpenDevModal,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand with HD Red-Yellow Delta Icon */}
        <div className="flex items-center gap-3">
          <img
            src="/icon.png"
            alt="LoopTube HD Icon"
            className="w-10 h-10 rounded-2xl object-cover shadow-md shadow-red-600/30 border border-red-500/30 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">LoopTube</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <span>By:</span>
              <a
                href="https://kioskode.my.id/"
                target="_blank"
                rel="dofollow"
                className="text-red-400 hover:text-red-300 font-bold hover:underline"
                title="Developer Website (dofollow)"
              >
                Kios Kode
              </a>
            </div>
          </div>
        </div>

        {/* Center / Action Controls */}
        <div className="flex items-center gap-2">
          {/* Developer Contact Quick Pill */}
          {onOpenDevModal && (
            <button
              onClick={onOpenDevModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              title="Informasi Developer & Kontak Kios Kode"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Kontak Kios Kode</span>
            </button>
          )}
          {/* Mode Latar Belakang / Audio Visualizer Switch */}
          <button
            onClick={onToggleBackgroundMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isBackgroundMode
                ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/20'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
            title="Alihkan ke mode audio latar belakang dengan visualizer santai"
          >
            {isBackgroundMode ? (
              <>
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mode Video</span>
              </>
            ) : (
              <>
                <Headphones className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Mode Latar Belakang</span>
              </>
            )}
          </button>

          {/* Zen / Cinema Mode Switch */}
          <button
            onClick={onToggleZenMode}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isZenMode
                ? 'bg-zinc-800 text-white border-zinc-700'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
            }`}
            title={isZenMode ? 'Keluar dari Mode Bioskop' : 'Masuk ke Mode Bioskop Penuh'}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Sleep timer button */}
          <button
            onClick={onOpenSleepTimer}
            className={`relative p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              sleepTimerRemaining !== null
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
            }`}
            title="Pengatur Waktu Tidur"
          >
            <Moon className="w-4 h-4" />
            {sleepTimerRemaining !== null && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* Batch Import Button */}
          <button
            onClick={onOpenBatchModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden md:inline">Tambah Video / Channel</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-2 pr-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-zinc-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center font-bold text-xs">
                {user.displayName?.[0] || 'U'}
              </div>
            )}
            <span className="text-xs font-medium text-zinc-200 hidden sm:block max-w-[100px] truncate">
              {user.displayName?.split(' ')[0] || 'Pengguna'}
            </span>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-4 space-y-3 z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center font-bold text-sm">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{user.displayName || 'Akun Google'}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                </div>
              </div>

              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {user.isGuest ? 'Mode Tamu / Akses Cepat' : 'Tersinkron dengan Google Firebase'}
              </div>

              <a
                href="https://accounts.google.com/ServiceLogin?service=youtube&continue=https%3A%2F%2Fwww.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Login Sesi YouTube Anda</span>
              </a>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Keluar dari Akun
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
