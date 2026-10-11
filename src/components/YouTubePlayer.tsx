import React, { useEffect, useRef, useState } from 'react';
import { ABLoop, LoopMode, PlaylistItem } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  currentVideo: PlaylistItem | null;
  currentIndex?: number;
  loopMode: LoopMode;
  abLoop: ABLoop;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  playbackRate: number;
  isBackgroundMode: boolean;
  isZenMode: boolean;
  onVideoEnd: () => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onIncrementLoopCount: () => void;
  seekTarget: number | null;
  onSeekHandled: () => void;
  loopCount?: number;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  currentVideo,
  currentIndex,
  loopMode,
  abLoop,
  isPlaying,
  isMuted,
  volume,
  playbackRate,
  isBackgroundMode,
  isZenMode,
  onVideoEnd,
  onTimeUpdate,
  onPlayStateChange,
  onIncrementLoopCount,
  seekTarget,
  onSeekHandled,
  loopCount = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const abIntervalRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  // Load YouTube Iframe API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      initPlayer();
    }

    return () => {
      clearInterval(abIntervalRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, []);

  const initPlayer = () => {
    if (!containerRef.current || playerRef.current) return;

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: currentVideo ? currentVideo.videoId : '',
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            event.target.setVolume(volume);
            if (isMuted) event.target.mute();
            event.target.setPlaybackRate(playbackRate);
            if (currentVideo) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 video cued
            if (event.data === 1) {
              onPlayStateChange(true);
            } else if (event.data === 2) {
              onPlayStateChange(false);
            } else if (event.data === 0) {
              // Video ended
              onIncrementLoopCount();
              if (loopMode === 'single') {
                const restartTime = abLoop.enabled ? abLoop.start : 0;
                playerRef.current?.seekTo(restartTime, true);
                playerRef.current?.playVideo();
              } else {
                onVideoEnd();
              }
            }
          },
        },
      });
    } catch (err) {
      console.error('Failed to init YT player:', err);
    }
  };

  // Video ID or Playlist Index changed
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady || !currentVideo) return;

    const startTime = abLoop.enabled ? abLoop.start : 0;
    try {
      playerRef.current.loadVideoById({
        videoId: currentVideo.videoId,
        startSeconds: startTime,
      });
      playerRef.current.playVideo();
    } catch (e) {
      console.debug('Failed to load video on queue change:', e);
    }
  }, [currentVideo?.videoId, currentIndex, loopCount, isPlayerReady]);

  // A-B Loop checking interval
  useEffect(() => {
    clearInterval(abIntervalRef.current);

    if (abLoop.enabled && abLoop.end > abLoop.start && playerRef.current && isPlayerReady) {
      abIntervalRef.current = setInterval(() => {
        try {
          if (playerRef.current.getPlayerState?.() === 1) {
            const curTime = playerRef.current.getCurrentTime?.() || 0;
            if (curTime >= abLoop.end) {
              onIncrementLoopCount();
              playerRef.current.seekTo(abLoop.start, true);
            }
          }
        } catch {
          // ignore
        }
      }, 250);
    }

    return () => clearInterval(abIntervalRef.current);
  }, [abLoop.enabled, abLoop.start, abLoop.end, isPlayerReady]);

  // Regular time update interval
  useEffect(() => {
    clearInterval(progressIntervalRef.current);

    if (isPlayerReady && playerRef.current) {
      progressIntervalRef.current = setInterval(() => {
        try {
          const curTime = playerRef.current.getCurrentTime?.() || 0;
          const dur = playerRef.current.getDuration?.() || 0;
          onTimeUpdate(curTime, dur);
        } catch {
          // ignore
        }
      }, 500);
    }

    return () => clearInterval(progressIntervalRef.current);
  }, [isPlayerReady]);

  // Play/Pause control sync
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;
    try {
      const state = playerRef.current.getPlayerState?.();
      if (isPlaying && state !== 1 && state !== 3) {
        playerRef.current.playVideo();
      } else if (!isPlaying && state === 1) {
        playerRef.current.pauseVideo();
      }
    } catch {
      // ignore
    }
  }, [isPlaying, isPlayerReady]);

  // Volume & Mute sync
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;
    try {
      playerRef.current.setVolume(volume);
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
      }
    } catch {
      // ignore
    }
  }, [volume, isMuted, isPlayerReady]);

  // Playback Rate sync
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;
    try {
      playerRef.current.setPlaybackRate(playbackRate);
    } catch {
      // ignore
    }
  }, [playbackRate, isPlayerReady]);

  // Handle external seek requests
  useEffect(() => {
    if (seekTarget !== null && isPlayerReady && playerRef.current) {
      try {
        playerRef.current.seekTo(seekTarget, true);
        onSeekHandled();
      } catch {
        // ignore
      }
    }
  }, [seekTarget, isPlayerReady]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-black transition-all duration-300 shadow-2xl ${
        isBackgroundMode
          ? 'opacity-0 pointer-events-none fixed -top-[9999px] -left-[9999px] w-10 h-10'
          : isZenMode
            ? 'h-[80vh] border border-zinc-800'
            : 'aspect-video border border-zinc-800/80 shadow-red-950/20'
      }`}
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
