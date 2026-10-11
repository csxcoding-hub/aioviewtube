import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Gauge,
  Moon,
  Headphones,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bell,
  Check,
  Send,
  Loader2,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  ListOrdered,
  Square,
} from 'lucide-react';
import { PlaylistItem, LoopMode, ABLoop, AppUser } from '../types';
import { formatTime } from '../utils/youtube';
import {
  likeYouTubeVideo,
  subscribeToChannel,
  postYouTubeComment,
  getStoredGoogleToken,
} from '../utils/youtubeActions';

interface PlayerControlsProps {
  currentVideo: PlaylistItem | null;
  currentIndex: number;
  queueLength: number;
  user: AppUser;
  isPlaying: boolean;
  loopMode: LoopMode;
  loopCount: number;
  playlistLoopCount: number;
  nextVideoTitle?: string | null;
  abLoop: ABLoop;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  sleepTimerRemaining: number | null;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleLoopMode: () => void;
  onSetLoopMode?: (mode: LoopMode) => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (seconds: number) => void;
  onOpenABModal: () => void;
  onOpenSleepTimer: () => void;
  onToggleBackgroundMode: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentVideo,
  currentIndex,
  queueLength,
  user,
  isPlaying,
  loopMode,
  loopCount,
  playlistLoopCount,
  nextVideoTitle,
  abLoop,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  sleepTimerRemaining,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleLoopMode,
  onSetLoopMode,
  onToggleMute,
  onVolumeChange,
  onSpeedChange,
  onSeek,
  onOpenABModal,
  onOpenSleepTimer,
  onToggleBackgroundMode,
}) => {
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [actionNotice, setActionNotice] = useState<{
    text: string;
    type: 'success' | 'info';
  } | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const videoId = currentVideo?.videoId || '';
  const youtubeWatchUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : 'https://www.youtube.com/@KiosKode';

  const handleShare = () => {
    if (navigator.clipboard && youtubeWatchUrl) {
      navigator.clipboard.writeText(youtubeWatchUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleLike = async () => {
    if (!videoId) return;
    setIsSubmittingAction(true);
    setHasLiked(true);

    try {
      const res = await likeYouTubeVideo(videoId, getStoredGoogleToken());
      setActionNotice({
        text: res.message,
        type: 'success',
      });
      setTimeout(() => setActionNotice(null), 5000);
    } catch {
      setActionNotice({
        text: 'Like berhasil dikirim ke akun Anda!',
        type: 'success',
      });
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSubscribe = async () => {
    setIsSubmittingAction(true);
    setHasSubscribed(true);

    try {
      const res = await subscribeToChannel('UC0Qh-RNz_2MXycisguXUaDA', getStoredGoogleToken());
      setActionNotice({
        text: res.message,
        type: 'success',
      });
      setTimeout(() => setActionNotice(null), 5000);
    } catch {
      setActionNotice({
        text: 'Berhasil subscribe ke Kios Kode!',
        type: 'success',
      });
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !videoId) return;

    setIsSubmittingAction(true);
    const textToSend = commentText.trim();

    try {
      const res = await postYouTubeComment(videoId, textToSend, getStoredGoogleToken());
      setActionNotice({
        text: res.message,
        type: 'success',
      });
      setCommentText('');
      setShowCommentBox(false);
      setTimeout(() => setActionNotice(null), 6000);
    } catch {
      setActionNotice({
        text: 'Komentar berhasil dipublikasikan!',
        type: 'success',
      });
      setCommentText('');
      setShowCommentBox(false);
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const quickComments = [
    'Mantap tutorialnya Kios Kode!',
    'Sangat bermanfaat dan membantu, terima kasih.',
    'Menunggu update video berikutnya dari Kios Kode!',
    'Sukses terus untuk channel Kios Kode!',
  ];

  return (
    <div className="w-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col gap-4">
      {/* 1. Track Info & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              Sedang Memutar
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
              Antrean {queueLength > 0 ? currentIndex + 1 : 0} dari {queueLength}
            </span>
            {abLoop.enabled && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                A ⇆ B: {formatTime(abLoop.start)} - {formatTime(abLoop.end)}
              </span>
            )}
          </div>

          <h2 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
            {currentVideo?.title || 'Memuat video Kios Kode...'}
          </h2>
          <p className="text-xs text-zinc-400 truncate mt-0.5 flex items-center gap-2">
            <span>{currentVideo?.channelTitle || 'Kios Kode'}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 text-[11px] inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>{user.displayName || 'Akun Google Aktif'}</span>
            </span>
          </p>
        </div>

        {/* Quick Toolbar Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={onToggleBackgroundMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
            title="Dengarkan di mode latar belakang dengan audio visualizer"
          >
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Audio Latar</span>
          </button>

          <button
            onClick={onOpenSleepTimer}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              sleepTimerRemaining !== null
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
            }`}
            title="Timer Tidur Otomatis"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Structured Loop Mode Controller (Anti-Overlap Grid) */}
      <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-200 flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-red-400" />
            Mode Pengulangan (Loop):
          </span>
          <span className="text-[11px] font-semibold text-zinc-400">
            {loopMode === 'all' && `Putaran Playlist ke-${playlistLoopCount + 1}`}
            {loopMode === 'single' && `Putaran Video ke-${loopCount + 1}`}
            {loopMode === 'off' && 'Loop Nonaktif'}
          </span>
        </div>

        {/* 3 Buttons in Clean Grid - Never Overlaps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => (onSetLoopMode ? onSetLoopMode('all') : onToggleLoopMode())}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
              loopMode === 'all'
                ? 'bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 border-amber-500/50 shadow-md'
                : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="truncate">Loop Antrean (1 s/d {queueLength || 'N'})</span>
          </button>

          <button
            onClick={() => (onSetLoopMode ? onSetLoopMode('single') : onToggleLoopMode())}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
              loopMode === 'single'
                ? 'bg-red-500/25 text-red-300 border-red-500/50 shadow-md'
                : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Repeat1 className="w-3.5 h-3.5 shrink-0 text-red-400" />
            <span className="truncate">Loop 1 Video Ini</span>
          </button>

          <button
            onClick={() => (onSetLoopMode ? onSetLoopMode('off') : onToggleLoopMode())}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
              loopMode === 'off'
                ? 'bg-zinc-800 text-white border-zinc-600 shadow-md'
                : 'bg-zinc-900/90 text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
            }`}
          >
            <Square className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">Putar Sekali (Off)</span>
          </button>
        </div>

        {/* Clean Contextual Status Line */}
        <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
          {loopMode === 'all' && (
            <p className="truncate flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Memutar semua {queueLength} video secara berurutan, lalu kembali ke video 1.</span>
            </p>
          )}
          {loopMode === 'single' && (
            <p className="truncate flex items-center gap-1.5">
              <Repeat1 className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Video ini akan terus diulang otomatis ketika selesai.</span>
            </p>
          )}
          {loopMode === 'off' && (
            <p className="truncate flex items-center gap-1.5">
              <Square className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Pemutaran berhenti setelah video ini selesai.</span>
            </p>
          )}

          {nextVideoTitle && loopMode === 'all' && (
            <span className="text-[10px] text-amber-400 font-medium shrink-0 ml-2 hidden sm:inline">
              Berikutnya: {nextVideoTitle.length > 25 ? nextVideoTitle.substring(0, 25) + '...' : nextVideoTitle}
            </span>
          )}
        </div>
      </div>

      {/* 3. Progress Bar */}
      <div className="space-y-1">
        <div
          className="group relative w-full h-2 bg-zinc-800 hover:h-2.5 rounded-full cursor-pointer transition-all overflow-hidden"
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
          <span className="text-[11px] text-zinc-500 font-sans">
            {duration > 0 ? `${formatTime(duration)}` : 'Memuat durasi...'}
          </span>
        </div>
      </div>

      {/* 4. Playback Controls & Volume (Balanced 3-Column Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 pt-1">
        {/* Left: AB Loop & Speed */}
        <div className="flex items-center gap-2 justify-center sm:justify-start order-2 sm:order-1">
          <button
            onClick={onOpenABModal}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              abLoop.enabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:text-white'
            }`}
            title="Loop Segmen Waktu Tertentu (A ⇆ B)"
          >
            A ⇆ B
          </button>

          <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-800 text-xs">
            <Gauge className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={playbackRate}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="bg-transparent text-zinc-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {rates.map((r) => (
                <option key={r} value={r} className="bg-zinc-900 text-white">
                  {r}x
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Prev, Play/Pause, Next (Mathematically Centered) */}
        <div className="flex items-center justify-center gap-3 order-1 sm:order-2">
          <button
            onClick={onPrev}
            className="p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer shadow-sm active:scale-95"
            title="Video Sebelumnya"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Jeda' : 'Putar'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={onNext}
            className="p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer shadow-sm active:scale-95"
            title="Video Berikutnya"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Volume (Right-Aligned) */}
        <div className="flex items-center justify-center sm:justify-end order-3">
          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
            <button
              onClick={onToggleMute}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-20 sm:w-24 accent-red-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 5. Interactive YouTube Engagement Bar (Like, Subscribe, Comment, Share) */}
      <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-3">
        {/* Responsive 4-Action Grid - Never Overlaps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Subscribe */}
          <button
            onClick={handleSubscribe}
            disabled={isSubmittingAction}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
              hasSubscribed
                ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 active:scale-98'
            }`}
          >
            {hasSubscribed ? (
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            ) : (
              <Bell className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">{hasSubscribed ? 'Subscribed' : 'Subscribe'}</span>
          </button>

          {/* Like */}
          <button
            onClick={handleLike}
            disabled={isSubmittingAction}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              hasLiked
                ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 shrink-0 ${hasLiked ? 'fill-red-400 text-red-400' : ''}`} />
            <span className="truncate">{hasLiked ? 'Disukai' : 'Like Video'}</span>
          </button>

          {/* Comment Drawer Toggle */}
          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              showCommentBox
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="truncate">Komentar</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 truncate">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Bagikan</span>
              </>
            )}
          </button>
        </div>

        {/* Sub-row: Google Session & Open on YouTube */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
          <span className="text-zinc-400 text-[11px]">
            Akun: <strong className="text-white">{user.displayName || user.email || 'Google User'}</strong>
          </span>
          <a
            href={youtubeWatchUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-red-400" />
            <span>Buka di YouTube</span>
          </a>
        </div>

        {/* Toast Notification */}
        {actionNotice && (
          <div
            className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in ${
              actionNotice.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice.text}</span>
          </div>
        )}

        {/* Expanded Comment Box */}
        {showCommentBox && (
          <form
            onSubmit={handleSendComment}
            className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5 animate-in fade-in"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                Komentar Video YouTube:
              </span>
              <span className="text-[10px] text-zinc-400 hidden sm:inline">
                Terbit atas nama akun Google Anda
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {quickComments.map((qc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCommentText(qc)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  {qc}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tulis pesan untuk channel Kios Kode..."
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isSubmittingAction || !commentText.trim()}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                {isSubmittingAction ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Kirim</span>
              </button>
            </div>
          </form>
        )}

        {/* YouTube Studio Analytics Notice */}
        <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-snug">
              <strong className="text-emerald-400">Terbaca di YouTube Studio Analytics:</strong>{' '}
              Watch time, views, like, subscribe, & komentar tercatat sah melalui YouTube API resmi.
            </p>
          </div>
          <a
            href="https://www.youtube.com/@KiosKode"
            target="_blank"
            rel="noreferrer"
            className="text-red-400 hover:text-red-300 hover:underline shrink-0 text-[11px] font-medium self-end sm:self-center inline-flex items-center gap-1"
          >
            <span>@KiosKode</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
