/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, testConnection } from './firebase';
import { ABLoop, AppUser, LoopMode, Playlist, PlaylistItem } from './types';
import { DEFAULT_INITIAL_VIDEOS, fetchChannelVideos } from './utils/youtube';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { YouTubePlayer } from './components/YouTubePlayer';
import { BackgroundAudioView } from './components/BackgroundAudioView';
import { PlayerControls } from './components/PlayerControls';
import { PlaylistDrawer } from './components/PlaylistDrawer';
import { BatchImportModal } from './components/BatchImportModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { ABLoopModal } from './components/ABLoopModal';
import { DeveloperFooter } from './components/DeveloperFooter';
import { DeveloperModal } from './components/DeveloperModal';
import {
  Loader2,
  RefreshCw,
  Sparkles,
  Youtube,
  Radio,
  CheckCircle2,
  BellRing,
  X,
} from 'lucide-react';

interface TrackedChannel {
  title: string;
  handle: string;
  channelId: string;
}

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const savedGuest = localStorage.getItem('looptube_is_guest');
      if (savedGuest === 'true') {
        return {
          uid: 'guest-user',
          displayName: 'Pengguna LoopTube',
          email: 'tamu@looptube.local',
          photoURL: null,
          isGuest: true,
        };
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Tracked Channel for automatic reload & sync
  const [trackedChannel, setTrackedChannel] = useState<TrackedChannel>({
    title: 'Kios Kode',
    handle: '@KiosKode',
    channelId: 'UC0Qh-RNz_2MXycisguXUaDA',
  });
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(true);
  const [isSyncingChannel, setIsSyncingChannel] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja');
  const [newVideoNotification, setNewVideoNotification] = useState<string | null>(null);

  // Queue & Player state - Initialize strictly with Kios Kode videos
  const [queue, setQueue] = useState<PlaylistItem[]>(() => {
    try {
      const saved = localStorage.getItem('looptube_queue_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].channelTitle === 'Kios Kode') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_INITIAL_VIDEOS;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loopMode, setLoopMode] = useState<LoopMode>('all'); // Default to Queue Playlist Looper (1 to N then restart)
  const [loopCount, setLoopCount] = useState<number>(0);
  const [playlistLoopCount, setPlaylistLoopCount] = useState<number>(0);
  const [queueCycleNotice, setQueueCycleNotice] = useState<string | null>(null);
  const [abLoop, setAbLoop] = useState<ABLoop>({ enabled: false, start: 0, end: 0 });

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [seekTarget, setSeekTarget] = useState<number | null>(null);

  // View modes
  const [isBackgroundMode, setIsBackgroundMode] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState<boolean>(false);
  const [isABModalOpen, setIsABModalOpen] = useState<boolean>(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);

  // Sleep Timer countdown (seconds)
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Saved Playlists from Firestore
  const [savedPlaylists, setSavedPlaylists] = useState<Playlist[]>([]);

  // Current video pointer
  const currentVideo = queue[currentIndex] || null;

  // Persist queue to localStorage (v2)
  useEffect(() => {
    try {
      localStorage.setItem('looptube_queue_v2', JSON.stringify(queue));
    } catch {
      // ignore
    }
  }, [queue]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.removeItem('looptube_is_guest');
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          isGuest: false,
        });

        const userDocPath = `users/${user.uid}`;
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              userId: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Pengguna',
              photoURL: user.photoURL || '',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, userDocPath);
        }

        testConnection();
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync / Reload channel videos function
  const handleSyncChannel = async (channelHandleOrUrl?: string) => {
    const target = channelHandleOrUrl || trackedChannel.handle;
    setIsSyncingChannel(true);

    try {
      const channelData = await fetchChannelVideos(target);
      setTrackedChannel({
        title: channelData.channelTitle,
        handle: channelData.handle,
        channelId: channelData.channelId,
      });

      // Find any newly uploaded videos that are not yet in current queue
      const existingIds = new Set(queue.map((v) => v.videoId));
      const brandNewVideos = channelData.videos.filter((v) => !existingIds.has(v.videoId));

      if (brandNewVideos.length > 0) {
        // Automatically inject new videos to the top of the queue
        setQueue((prev) => [...brandNewVideos, ...prev]);
        setNewVideoNotification(
          `Ditemukan ${brandNewVideos.length} video baru dari ${channelData.channelTitle} dan otomatis ditambahkan ke antrean!`
        );
        setTimeout(() => setNewVideoNotification(null), 7000);
      } else if (!channelHandleOrUrl) {
        // If syncing manually without new items
        setNewVideoNotification(`Antrean video ${channelData.channelTitle} sudah terbaru.`);
        setTimeout(() => setNewVideoNotification(null), 3000);
      }

      const now = new Date();
      setLastSyncTime(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
      );
    } catch (err) {
      console.error('Failed to sync channel:', err);
    } finally {
      setIsSyncingChannel(false);
    }
  };

  // Auto-Sync Polling Interval (every 60 seconds checks channel RSS feed for new video uploads)
  useEffect(() => {
    if (!isAutoSyncEnabled || !trackedChannel.handle) return;

    const interval = setInterval(() => {
      handleSyncChannel(trackedChannel.handle);
    }, 60000);

    return () => clearInterval(interval);
  }, [isAutoSyncEnabled, trackedChannel.handle, queue]);

  // Listen to User Playlists in Firestore (or localStorage for Guest)
  useEffect(() => {
    if (!currentUser) {
      setSavedPlaylists([]);
      return;
    }

    if (currentUser.isGuest) {
      try {
        const saved = localStorage.getItem('looptube_guest_playlists');
        if (saved) {
          setSavedPlaylists(JSON.parse(saved));
        } else {
          setSavedPlaylists([]);
        }
      } catch {
        setSavedPlaylists([]);
      }
      return;
    }

    const playlistsColPath = `users/${currentUser.uid}/playlists`;
    const q = collection(db, 'users', currentUser.uid, 'playlists');

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Playlist[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            name: data.name || 'Untitled Playlist',
            userId: data.userId || currentUser.uid,
            loopMode: data.loopMode || 'all',
            items: data.items || [],
            createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now(),
          });
        });
        setSavedPlaylists(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, playlistsColPath);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // MediaSession API integration for real background controls
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentVideo) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentVideo.title,
        artist: currentVideo.channelTitle || 'YouTube Loop',
        album: 'LoopTube Background Player',
        artwork: [
          {
            src: currentVideo.thumbnailUrl,
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          setSeekTarget(details.seekTime);
        }
      });
    } catch (e) {
      console.debug('MediaSession setup:', e);
    }
  }, [currentVideo?.videoId, currentVideo?.title, currentIndex, queue.length]);

  // Sleep Timer Interval Countdown
  useEffect(() => {
    if (sleepTimerRemaining === null) return;

    if (sleepTimerRemaining <= 0) {
      setIsPlaying(false);
      setSleepTimerRemaining(null);
      return;
    }

    const timer = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setIsPlaying(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerRemaining]);

  // Next / Prev Handlers
  const handleNext = () => {
    if (queue.length === 0) return;
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    } else {
      if (loopMode === 'all') {
        setCurrentIndex(0);
        setPlaylistLoopCount((prev) => prev + 1);
        setLoopCount((prev) => prev + 1);
        setIsPlaying(true);
        setQueueCycleNotice(
          `Seluruh antrean (${queue.length} video) selesai diputar! Mengulang putaran ke-${playlistLoopCount + 2} dari video 1.`
        );
        setTimeout(() => setQueueCycleNotice(null), 6000);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handlePrev = () => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      setSeekTarget(0);
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(queue.length - 1);
    }
  };

  const handleVideoEnd = () => {
    if (loopMode === 'single') {
      setLoopCount((prev) => prev + 1);
      setSeekTarget(abLoop.enabled ? abLoop.start : 0);
      setIsPlaying(true);
    } else if (loopMode === 'all') {
      handleNext();
    } else {
      if (currentIndex < queue.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handleToggleLoopMode = () => {
    setLoopMode((prev) => {
      if (prev === 'single') return 'all';
      if (prev === 'all') return 'off';
      return 'single';
    });
  };

  const handleAddVideos = (newVideos: PlaylistItem[]) => {
    if (newVideos.length === 0) return;
    setQueue((prev) => [...prev, ...newVideos]);
    if (queue.length === 0) {
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  };

  const handleSelectVideo = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
    setLoopCount(0);
  };

  const handleRemoveItem = (index: number) => {
    setQueue((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setCurrentIndex(0);
      } else if (index < currentIndex) {
        setCurrentIndex((c) => c - 1);
      } else if (index === currentIndex && index >= next.length) {
        setCurrentIndex(next.length - 1);
      }
      return next;
    });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= queue.length) return;

    setQueue((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });

    if (index === currentIndex) {
      setCurrentIndex(targetIndex);
    } else if (targetIndex === currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleClearQueue = () => {
    setQueue([]);
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const handleSaveToCloud = async (playlistName: string) => {
    if (!currentUser) return;
    const playlistId = `pl-${Date.now()}`;

    if (currentUser.isGuest) {
      const newPl: Playlist = {
        id: playlistId,
        userId: currentUser.uid,
        name: playlistName,
        loopMode: loopMode,
        items: queue,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [newPl, ...savedPlaylists];
      setSavedPlaylists(updated);
      try {
        localStorage.setItem('looptube_guest_playlists', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return;
    }

    const playlistPath = `users/${currentUser.uid}/playlists/${playlistId}`;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'playlists', playlistId), {
        id: playlistId,
        userId: currentUser.uid,
        name: playlistName,
        loopMode: loopMode,
        itemCount: queue.length,
        items: queue,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, playlistPath);
    }
  };

  const handleLoadSavedPlaylist = (playlist: Playlist) => {
    if (playlist.items && playlist.items.length > 0) {
      setQueue(playlist.items);
      setCurrentIndex(0);
      setLoopMode(playlist.loopMode || 'all');
      setIsPlaying(true);
      setLoopCount(0);
    }
  };

  const handleDeleteSavedPlaylist = async (playlistId: string) => {
    if (!currentUser) return;

    if (currentUser.isGuest) {
      const updated = savedPlaylists.filter((p) => p.id !== playlistId);
      setSavedPlaylists(updated);
      try {
        localStorage.setItem('looptube_guest_playlists', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return;
    }

    const path = `users/${currentUser.uid}/playlists/${playlistId}`;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'playlists', playlistId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        <p className="text-xs font-semibold tracking-wider">Memuat LoopTube...</p>
      </div>
    );
  }

  // Login Gate (Google Sign-In or Direct Access)
  if (!currentUser) {
    return (
      <LoginScreen
        onGuestLogin={() => {
          localStorage.setItem('looptube_is_guest', 'true');
          setCurrentUser({
            uid: 'guest-user',
            displayName: 'Pengguna LoopTube',
            email: 'tamu@looptube.local',
            photoURL: null,
            isGuest: true,
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        user={currentUser}
        isBackgroundMode={isBackgroundMode}
        isZenMode={isZenMode}
        sleepTimerRemaining={sleepTimerRemaining}
        onToggleBackgroundMode={() => setIsBackgroundMode((prev) => !prev)}
        onToggleZenMode={() => setIsZenMode((prev) => !prev)}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenSleepTimer={() => setIsSleepModalOpen(true)}
        onOpenDevModal={() => setIsDevModalOpen(true)}
        onSignOut={() => {
          if (currentUser.isGuest) {
            localStorage.removeItem('looptube_is_guest');
            setCurrentUser(null);
          } else {
            signOut(auth);
          }
        }}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Channel Auto-Sync Live Status Bar */}
        <div className="bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950/80 p-3.5 sm:p-4 rounded-3xl border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shrink-0">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  Channel Aktif: {trackedChannel.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {trackedChannel.handle}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                <span>{queue.length} video dalam antrean</span>
                <span>•</span>
                <span>Terakhir dicek: {lastSyncTime}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            {/* Auto-Sync Toggle */}
            <button
              onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isAutoSyncEnabled
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
              title="Cek otomatis video baru setiap 60 detik"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAutoSyncEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                }`}
              />
              <span>Auto-Sync Video Baru</span>
            </button>

            {/* Manual Sync Button */}
            <button
              onClick={() => handleSyncChannel()}
              disabled={isSyncingChannel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Periksa dan muat ulang video channel sekarang"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-red-400 ${
                  isSyncingChannel ? 'animate-spin' : ''
                }`}
              />
              <span>{isSyncingChannel ? 'Memeriksa...' : 'Sinkronkan'}</span>
            </button>
          </div>
        </div>

        {/* New Video Real-time Notification Banner */}
        {newVideoNotification && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-between text-xs text-white shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{newVideoNotification}</span>
            </div>
            <button
              onClick={() => setNewVideoNotification(null)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup pemberitahuan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Queue Loop Cycle Completed Notification Banner */}
        {queueCycleNotice && (
          <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs text-amber-200 shadow-xl shadow-amber-500/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="font-semibold">{queueCycleNotice}</span>
            </div>
            <button
              onClick={() => setQueueCycleNotice(null)}
              className="p-1 rounded-lg text-amber-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup pemberitahuan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* View Mode Switching: Normal Video vs Background Audio Visualizer */}
        {isBackgroundMode ? (
          <BackgroundAudioView
            currentVideo={currentVideo}
            isPlaying={isPlaying}
            loopMode={loopMode}
            loopCount={loopCount}
            abLoop={abLoop}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            sleepTimerRemaining={sleepTimerRemaining}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onNext={handleNext}
            onPrev={handlePrev}
            onToggleLoopMode={handleToggleLoopMode}
            onToggleMute={() => setIsMuted((m) => !m)}
            onVolumeChange={(v) => {
              setVolume(v);
              setIsMuted(false);
            }}
            onSeek={(sec) => setSeekTarget(sec)}
            onExitBackgroundMode={() => setIsBackgroundMode(false)}
            onOpenSleepTimer={() => setIsSleepModalOpen(true)}
            onOpenABModal={() => setIsABModalOpen(true)}
          />
        ) : isZenMode ? (
          <div className="flex flex-col gap-4">
            <YouTubePlayer
              currentVideo={currentVideo}
              currentIndex={currentIndex}
              loopCount={loopCount}
              loopMode={loopMode}
              abLoop={abLoop}
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              playbackRate={playbackRate}
              isBackgroundMode={isBackgroundMode}
              isZenMode={isZenMode}
              onVideoEnd={handleVideoEnd}
              onTimeUpdate={(cur, dur) => {
                setCurrentTime(cur);
                setDuration(dur);
              }}
              onPlayStateChange={(playing) => setIsPlaying(playing)}
              onIncrementLoopCount={() => setLoopCount((c) => c + 1)}
              seekTarget={seekTarget}
              onSeekHandled={() => setSeekTarget(null)}
            />

            <PlayerControls
              currentVideo={currentVideo}
              currentIndex={currentIndex}
              queueLength={queue.length}
              user={currentUser}
              isPlaying={isPlaying}
              loopMode={loopMode}
              loopCount={loopCount}
              playlistLoopCount={playlistLoopCount}
              nextVideoTitle={queue.length > 1 ? queue[(currentIndex + 1) % queue.length]?.title : null}
              abLoop={abLoop}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              playbackRate={playbackRate}
              sleepTimerRemaining={sleepTimerRemaining}
              onTogglePlay={() => setIsPlaying((p) => !p)}
              onNext={handleNext}
              onPrev={handlePrev}
              onToggleLoopMode={handleToggleLoopMode}
              onSetLoopMode={(mode) => setLoopMode(mode)}
              onToggleMute={() => setIsMuted((m) => !m)}
              onVolumeChange={(v) => {
                setVolume(v);
                setIsMuted(false);
              }}
              onSpeedChange={(r) => setPlaybackRate(r)}
              onSeek={(sec) => setSeekTarget(sec)}
              onOpenABModal={() => setIsABModalOpen(true)}
              onOpenSleepTimer={() => setIsSleepModalOpen(true)}
              onToggleBackgroundMode={() => setIsBackgroundMode(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Player & Controls */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <YouTubePlayer
                currentVideo={currentVideo}
                currentIndex={currentIndex}
                loopCount={loopCount}
                loopMode={loopMode}
                abLoop={abLoop}
                isPlaying={isPlaying}
                isMuted={isMuted}
                volume={volume}
                playbackRate={playbackRate}
                isBackgroundMode={isBackgroundMode}
                isZenMode={isZenMode}
                onVideoEnd={handleVideoEnd}
                onTimeUpdate={(cur, dur) => {
                  setCurrentTime(cur);
                  setDuration(dur);
                }}
                onPlayStateChange={(playing) => setIsPlaying(playing)}
                onIncrementLoopCount={() => setLoopCount((c) => c + 1)}
                seekTarget={seekTarget}
                onSeekHandled={() => setSeekTarget(null)}
              />

              <PlayerControls
                currentVideo={currentVideo}
                currentIndex={currentIndex}
                queueLength={queue.length}
                user={currentUser}
                isPlaying={isPlaying}
                loopMode={loopMode}
                loopCount={loopCount}
                playlistLoopCount={playlistLoopCount}
                nextVideoTitle={queue.length > 1 ? queue[(currentIndex + 1) % queue.length]?.title : null}
                abLoop={abLoop}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                isMuted={isMuted}
                playbackRate={playbackRate}
                sleepTimerRemaining={sleepTimerRemaining}
                onTogglePlay={() => setIsPlaying((p) => !p)}
                onNext={handleNext}
                onPrev={handlePrev}
                onToggleLoopMode={handleToggleLoopMode}
                onSetLoopMode={(mode) => setLoopMode(mode)}
                onToggleMute={() => setIsMuted((m) => !m)}
                onVolumeChange={(v) => {
                  setVolume(v);
                  setIsMuted(false);
                }}
                onSpeedChange={(r) => setPlaybackRate(r)}
                onSeek={(sec) => setSeekTarget(sec)}
                onOpenABModal={() => setIsABModalOpen(true)}
                onOpenSleepTimer={() => setIsSleepModalOpen(true)}
                onToggleBackgroundMode={() => setIsBackgroundMode(true)}
              />
            </div>

            {/* Queue & Cloud Playlists */}
            <div className="lg:col-span-5 flex flex-col h-full min-h-[580px]">
              <PlaylistDrawer
                queue={queue}
                currentIndex={currentIndex}
                savedPlaylists={savedPlaylists}
                onSelectVideo={handleSelectVideo}
                onRemoveItem={handleRemoveItem}
                onMoveItem={handleMoveItem}
                onClearQueue={handleClearQueue}
                onSaveToCloud={handleSaveToCloud}
                onLoadSavedPlaylist={handleLoadSavedPlaylist}
                onDeleteSavedPlaylist={handleDeleteSavedPlaylist}
                onOpenBatchModal={() => setIsBatchModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Hidden YouTube player container when in Background Audio Mode */}
        {isBackgroundMode && (
          <YouTubePlayer
            currentVideo={currentVideo}
            currentIndex={currentIndex}
            loopCount={loopCount}
            loopMode={loopMode}
            abLoop={abLoop}
            isPlaying={isPlaying}
            isMuted={isMuted}
            volume={volume}
            playbackRate={playbackRate}
            isBackgroundMode={isBackgroundMode}
            isZenMode={isZenMode}
            onVideoEnd={handleVideoEnd}
            onTimeUpdate={(cur, dur) => {
              setCurrentTime(cur);
              setDuration(dur);
            }}
            onPlayStateChange={(playing) => setIsPlaying(playing)}
            onIncrementLoopCount={() => setLoopCount((c) => c + 1)}
            seekTarget={seekTarget}
            onSeekHandled={() => setSeekTarget(null)}
          />
        )}
      </main>

      {/* Developer Footer with Dofollow Backlink & Contact Details */}
      <DeveloperFooter onOpenDevModal={() => setIsDevModalOpen(true)} />

      {/* Modals */}
      <DeveloperModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
      />

      <BatchImportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onAddVideos={handleAddVideos}
        onTrackChannel={(ch) => {
          setTrackedChannel(ch);
          setNewVideoNotification(`Sekarang memantau channel ${ch.title} (${ch.handle}).`);
          setTimeout(() => setNewVideoNotification(null), 4000);
        }}
      />

      <SleepTimerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        currentTimerRemaining={sleepTimerRemaining}
        onSetTimerMinutes={(min) => setSleepTimerRemaining(min * 60)}
        onCancelTimer={() => setSleepTimerRemaining(null)}
      />

      <ABLoopModal
        isOpen={isABModalOpen}
        onClose={() => setIsABModalOpen(false)}
        abLoop={abLoop}
        currentTime={currentTime}
        duration={duration}
        onUpdateABLoop={(newLoop) => setAbLoop(newLoop)}
      />
    </div>
  );
}
