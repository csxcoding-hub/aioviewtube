export interface PlaylistItem {
  id: string;
  videoId: string;
  title: string;
  channelTitle?: string;
  thumbnailUrl: string;
  duration?: number;
  order?: number;
  addedAt?: number;
}

export type LoopMode = 'single' | 'all' | 'off';

export interface ABLoop {
  enabled: boolean;
  start: number;
  end: number;
}

export interface Playlist {
  id: string;
  name: string;
  userId?: string;
  loopMode: LoopMode;
  items: PlaylistItem[];
  createdAt: number;
  updatedAt: number;
}

export interface CuratedChannel {
  id: string;
  handle: string;
  title: string;
  category: string;
  description: string;
  avatar: string;
  sampleVideos: {
    videoId: string;
    title: string;
  }[];
}

export interface AppUser {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  isGuest?: boolean;
}

