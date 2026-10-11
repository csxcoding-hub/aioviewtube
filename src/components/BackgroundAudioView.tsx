import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, RotateCcw, Volume2, VolumeX, Moon, Video, Sparkles, Clock } from 'lucide-react';
import { ABLoop, LoopMode, PlaylistItem } from '../types';
import { formatTime } from '../utils/youtube';

interface BackgroundAudioViewProps {
  currentVideo: PlaylistItem | null;
  isPlaying: boolean;
  loopMode: LoopMode;
  loopCount: number;
  abLoop: ABLoop;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  sleepTimerRemaining: number | null;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleLoopMode: () => void;
  onToggleMute: () => void;
  onVolumeChange: (val: number) => void;
  onSeek: (seconds: number) => void;
  onExitBackgroundMode: () => void;
  onOpenSleepTimer: () => void;
  onOpenABModal: () => void;
}

export const BackgroundAudioView: React.FC<BackgroundAudioViewProps> = ({
  currentVideo,
  isPlaying,
  loopMode,
  loopCount,
  abLoop,
  currentTime,
  duration,
  volume,
  isMuted,
  sleepTimerRemaining,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleLoopMode,
  onToggleMute,
  onVolumeChange,
  onSeek,
  onExitBackgroundMode,
  onOpenSleepTimer,
  onOpenABModal,
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full min-h-[580px] rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-zinc-800/80 p-6 md:p-10 flex flex-col justify-between shadow-2xl">
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-red-600/30 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-500/20 blur-[100px]" />
      </div>

      {/* Top Bar inside Background Audio View */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Mode Audio Latar Belakang
          </span>
          {loopCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 inline-flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Telah diputar {loopCount}x</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {sleepTimerRemaining !== null && (
            <button
              onClick={onOpenSleepTimer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            >
              <Moon className="w-3.5 h-3.5" />
              Tidur dalam {Math.ceil(sleepTimerRemaining / 60)}m
            </button>
          )}

          <button
            onClick={onExitBackgroundMode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
            title="Kembali ke tampilan video normal"
          >
            <Video className="w-3.5 h-3.5 text-red-400" />
            Tampilkan Video
          </button>
        </div>
      </div>

      {/* Centerpiece: Vinyl / Artwork & Audio Spectrum Visualizer */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 my-6">
        {/* Animated Disc / Artwork */}
        <div className="relative group">
          <div
            className={`w-44 h-44 sm:w-56 sm:h-56 rounded-full p-2 bg-gradient-to-tr from-zinc-800 via-zinc-950 to-zinc-700 shadow-2xl transition-transform duration-700 ${
              isPlaying ? 'animate-[spin_18s_linear_infinite]' : ''
            }`}
          >
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-zinc-900 relative shadow-inner">
              <img
                src={currentVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
                alt={currentVideo?.title || 'Audio Thumbnail'}
                className="w-full h-full object-cover scale-110"
              />
              {/* Disc Center Hole */}
              <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-zinc-950 border-4 border-zinc-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
            </div>
          </div>

          {/* Glowing Aura Ring */}
          <div
            className={`absolute -inset-2 rounded-full border border-red-500/30 pointer-events-none transition-opacity duration-500 ${
              isPlaying ? 'opacity-100 animate-pulse' : 'opacity-0'
            }`}
          />
        </div>

        {/* Video Info & Waveform Spectrum */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md">
          <span className="text-xs uppercase tracking-wider text-red-400 font-semibold mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Memutar Tanpa Henti
          </span>
          <h2 className="text-lg md:text-2xl font-bold text-white line-clamp-2 mb-2 leading-snug">
            {currentVideo?.title || 'Pilih Video YouTube untuk Dimulai'}
          </h2>
          <p className="text-sm text-zinc-400 font-medium mb-4">
            {currentVideo?.channelTitle || 'YouTube Stream'}
          </p>

          {/* Equalizer Waveform Bars Simulation */}
          <div className="flex items-end gap-1.5 h-10 px-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
            {[40, 75, 55, 95, 30, 85, 60, 100, 45, 90, 70, 35, 80, 60, 95, 50].map((height, i) => (
              <span
                key={i}
                className="w-1 bg-gradient-to-t from-red-600 to-amber-400 rounded-full transition-all duration-300"
                style={{
                  height: isPlaying ? `${Math.max(15, (height * (0.4 + (i % 3) * 0.3)))}%` : '20%',
                  animation: isPlaying ? `pulse ${0.6 + (i % 5) * 0.15}s ease-in-out infinite alternate` : 'none',
                }}
              />
            ))}
            <span className="text-[11px] text-zinc-400 ml-2 font-mono">
              {isPlaying ? 'ACTIVE AUDIO STREAM' : 'PAUSED'}
            </span>
          </div>

          {/* A-B Segment Active Badge */}
          {abLoop.enabled && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
              Loop Bagian: {formatTime(abLoop.start)} - {formatTime(abLoop.end)}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Player Controls */}
      <div className="relative z-10 w-full space-y-4 max-w-2xl mx-auto">
        {/* Progress Bar & Timers */}
        <div className="space-y-1.5">
          <div
            className="group relative w-full h-2 bg-zinc-800 hover:h-3 rounded-full cursor-pointer transition-all overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              onSeek(clickPos * duration);
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-zinc-400 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Action Buttons Row (Balanced 3-Column Symmetry) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
          {/* Left: Loop Mode & AB Loop */}
          <div className="flex items-center justify-center sm:justify-start gap-2 order-2 sm:order-1">
            <button
              onClick={onToggleLoopMode}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                loopMode === 'single'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm shadow-red-500/20'
                  : loopMode === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:text-white'
              }`}
              title={
                loopMode === 'single'
                  ? 'Ulangi Video Ini Terus (Loop 1)'
                  : loopMode === 'all'
                    ? 'Ulangi Seluruh Playlist (Loop All)'
                    : 'Ulangi Dimatikan'
              }
            >
              {loopMode === 'single' ? (
                <Repeat1 className="w-5 h-5" />
              ) : (
                <Repeat className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={onOpenABModal}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                abLoop.enabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:text-white'
              }`}
              title="Atur loop segmen waktu A ke B"
            >
              A ⇆ B
            </button>
          </div>

          {/* Center: Prev, Play/Pause, Next (Centered) */}
          <div className="flex items-center justify-center gap-3 order-1 sm:order-2">
            <button
              onClick={onPrev}
              className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Video Sebelumnya"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={onTogglePlay}
              className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 hover:scale-105 transition-all cursor-pointer"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={onNext}
              className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Video Berikutnya"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Volume & Sleep Timer (Right-Aligned) */}
          <div className="flex items-center justify-center sm:justify-end gap-2 order-3">
            <button
              onClick={onOpenSleepTimer}
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
              title="Pengatur Waktu Tidur (Sleep Timer)"
            >
              <Moon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 bg-zinc-800/80 px-3 py-2 rounded-xl border border-zinc-700/60">
              <button
                onClick={onToggleMute}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-16 sm:w-20 accent-red-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
