import { CuratedChannel, PlaylistItem } from '../types';

/**
 * Extracts a YouTube Video ID from various URL formats or raw ID.
 */
export function extractYouTubeId(urlOrId: string): string | null {
  const clean = urlOrId.trim();
  if (!clean) return null;

  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Regex patterns
  const patterns = [
    /(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/)([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /music\.youtube\.com\/watch\?.*v=([\w-]{11})/,
    /youtube\.com\/watch\?.*v=([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Checks if input is a YouTube Channel URL or Handle
 */
export function isChannelInput(input: string): boolean {
  const clean = input.trim();
  return (
    clean.startsWith('@') ||
    clean.includes('youtube.com/@') ||
    clean.includes('youtube.com/channel/') ||
    clean.includes('youtube.com/c/') ||
    clean.includes('youtube.com/user/')
  );
}

/**
 * Extract YouTube playlist ID if present
 */
export function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Parses raw text input that can contain multiple URLs, lines, or video IDs
 */
export function parseMultipleVideos(inputText: string): string[] {
  const lines = inputText
    .split(/[\n,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const videoIds: string[] = [];
  const seen = new Set<string>();

  for (const token of lines) {
    const id = extractYouTubeId(token);
    if (id && !seen.has(id)) {
      seen.add(id);
      videoIds.push(id);
    }
  }

  return videoIds;
}

/**
 * Fetches video metadata using public oEmbed / noembed service with graceful fallback.
 */
export async function fetchVideoMetadata(
  videoId: string
): Promise<{ title: string; channelTitle: string; thumbnailUrl: string }> {
  const defaultThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const defaultTitle = `YouTube Video (${videoId})`;
  const defaultChannel = 'YouTube';

  try {
    const url = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return {
          title: data.title,
          channelTitle: data.author_name || defaultChannel,
          thumbnailUrl: data.thumbnail_url || defaultThumbnail,
        };
      }
    }
  } catch (err) {
    console.debug('Failed to fetch from noembed:', err);
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return {
          title: data.title,
          channelTitle: data.author_name || defaultChannel,
          thumbnailUrl: data.thumbnail_url || defaultThumbnail,
        };
      }
    }
  } catch (err) {
    console.debug('Failed to fetch from youtube oembed:', err);
  }

  return {
    title: defaultTitle,
    channelTitle: defaultChannel,
    thumbnailUrl: defaultThumbnail,
  };
}

/**
 * Fetches channel details and full videos automatically via backend /api/youtube/channel
 */
export async function fetchChannelVideos(channelUrlOrQuery: string): Promise<{
  channelTitle: string;
  channelId: string;
  handle: string;
  avatarUrl: string;
  videos: PlaylistItem[];
}> {
  try {
    const res = await fetch(
      `/api/youtube/channel?url=${encodeURIComponent(channelUrlOrQuery)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.videos) && data.videos.length > 0) {
        const videos: PlaylistItem[] = data.videos.map((v: any, idx: number) => ({
          id: `ch-item-${v.videoId}-${idx}`,
          videoId: v.videoId,
          title: v.title,
          channelTitle: v.channelTitle || data.channelTitle,
          thumbnailUrl: v.thumbnailUrl || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          order: idx,
          addedAt: Date.now(),
        }));

        return {
          channelTitle: data.channelTitle || 'Kios Kode',
          channelId: data.channelId || 'UC0Qh-RNz_2MXycisguXUaDA',
          handle: data.handle || '@KiosKode',
          avatarUrl:
            data.avatarUrl ||
            'https://yt3.googleusercontent.com/sLl-j_1SlFUWUANi0kmAX5VD_YGwpbKnL4C3UYbRiajNXLbhVr-y2mJ8J1vQ74sRgodlISnLtXE=s900-c-k-c0x00ffffff-no-rj',
          videos,
        };
      }
    }
  } catch (err) {
    console.debug('Channel API network notice:', err);
  }

  // Safe fallback to verified Kios Kode videos
  return {
    channelTitle: 'Kios Kode',
    channelId: 'UC0Qh-RNz_2MXycisguXUaDA',
    handle: '@KiosKode',
    avatarUrl:
      'https://yt3.googleusercontent.com/sLl-j_1SlFUWUANi0kmAX5VD_YGwpbKnL4C3UYbRiajNXLbhVr-y2mJ8J1vQ74sRgodlISnLtXE=s900-c-k-c0x00ffffff-no-rj',
    videos: DEFAULT_INITIAL_VIDEOS,
  };
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = mins.toString().padStart(2, '0');
  const formattedSecs = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${formattedMins}:${formattedSecs}`;
  }
  return `${formattedMins}:${formattedSecs}`;
}

// Default initial dataset is now strictly from @KiosKode as requested
export const DEFAULT_INITIAL_VIDEOS: PlaylistItem[] = [
  {
    id: 'kioskode-UslOP77SkUk-0',
    videoId: 'UslOP77SkUk',
    title: 'Lufya CBT - Sistem Ujian Berbasis Komputer',
    channelTitle: 'Kios Kode',
    thumbnailUrl: 'https://i.ytimg.com/vi/UslOP77SkUk/hqdefault.jpg',
  },
  {
    id: 'kioskode-yi4k7CD7KmI-1',
    videoId: 'yi4k7CD7KmI',
    title: 'PPDB Plus WhastAap Getway Fonnte',
    channelTitle: 'Kios Kode',
    thumbnailUrl: 'https://i.ytimg.com/vi/yi4k7CD7KmI/hqdefault.jpg',
  },
  {
    id: 'kioskode-aVs4nW5ZfOE-2',
    videoId: 'aVs4nW5ZfOE',
    title: 'New ASIS 7.0 (Aplikasi Sistem Informasi Sekolah)',
    channelTitle: 'Kios Kode',
    thumbnailUrl: 'https://i.ytimg.com/vi/aVs4nW5ZfOE/hqdefault.jpg',
  },
  {
    id: 'kioskode-aeHHptIp-Tc-3',
    videoId: 'aeHHptIp-Tc',
    title: 'Smart Payment Sekolah',
    channelTitle: 'Kios Kode',
    thumbnailUrl: 'https://i.ytimg.com/vi/aeHHptIp-Tc/hqdefault.jpg',
  },
  {
    id: 'kioskode-vKbEw5yF9YY-4',
    videoId: 'vKbEw5yF9YY',
    title: 'E-Kesiswaan Sistem Informasi Manajemen Kesiswaan',
    channelTitle: 'Kios Kode',
    thumbnailUrl: 'https://i.ytimg.com/vi/vKbEw5yF9YY/hqdefault.jpg',
  },
  {
    id: 'kioskode-L09zU6_vEcs-5',
    videoId: 'L09zU6_vEcs',
    title: 'Website dan Sistem Informasi Sekolah',
    channelTitle: 'Kios Kode',
    thumbnailUrl: 'https://i.ytimg.com/vi/L09zU6_vEcs/hqdefault.jpg',
  },
];

export const CURATED_CHANNELS: CuratedChannel[] = [
  {
    id: 'kioskode',
    handle: '@KiosKode',
    title: 'Kios Kode',
    category: 'Source Code & Aplikasi',
    description: 'Aplikasi Web, Sistem Sekolah, Ujian CBT, & Source Code Pendidikan.',
    avatar:
      'https://yt3.googleusercontent.com/sLl-j_1SlFUWUANi0kmAX5VD_YGwpbKnL4C3UYbRiajNXLbhVr-y2mJ8J1vQ74sRgodlISnLtXE=s900-c-k-c0x00ffffff-no-rj',
    sampleVideos: [
      { videoId: 'UslOP77SkUk', title: 'Lufya CBT - Sistem Ujian Berbasis Komputer' },
      { videoId: 'yi4k7CD7KmI', title: 'PPDB Plus WhastAap Getway Fonnte' },
      { videoId: 'aVs4nW5ZfOE', title: 'New ASIS 7.0 (Aplikasi Sistem Informasi Sekolah)' },
      { videoId: 'aeHHptIp-Tc', title: 'Smart Payment Sekolah' },
      { videoId: 'vKbEw5yF9YY', title: 'E-Kesiswaan Sistem Informasi Manajemen Kesiswaan' },
      { videoId: 'L09zU6_vEcs', title: 'Website dan Sistem Informasi Sekolah' },
    ],
  },
];
