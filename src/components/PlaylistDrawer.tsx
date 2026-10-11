import React, { useState } from 'react';
import {
  ListMusic,
  Trash2,
  Play,
  ArrowUp,
  ArrowDown,
  BookmarkPlus,
  FolderHeart,
  Search,
  Plus,
  Share2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Playlist, PlaylistItem } from '../types';

interface PlaylistDrawerProps {
  queue: PlaylistItem[];
  currentIndex: number;
  savedPlaylists: Playlist[];
  onSelectVideo: (index: number) => void;
  onRemoveItem: (index: number) => void;
  onMoveItem: (index: number, direction: 'up' | 'down') => void;
  onClearQueue: () => void;
  onSaveToCloud: (name: string) => void;
  onLoadSavedPlaylist: (playlist: Playlist) => void;
  onDeleteSavedPlaylist: (playlistId: string) => void;
  onOpenBatchModal: () => void;
}

export const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({
  queue,
  currentIndex,
  savedPlaylists,
  onSelectVideo,
  onRemoveItem,
  onMoveItem,
  onClearQueue,
  onSaveToCloud,
  onLoadSavedPlaylist,
  onDeleteSavedPlaylist,
  onOpenBatchModal,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'saved'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredQueue = queue
    .map((item, index) => ({ item, originalIndex: index }))
    .filter(({ item }) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.channelTitle && item.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const handleSavePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onSaveToCloud(newPlaylistName.trim());
    setNewPlaylistName('');
    setIsSaving(false);
  };

  return (
    <div className="w-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-4 sm:p-5 flex flex-col h-[560px] lg:h-full lg:min-h-[680px] shadow-xl">
      {/* Drawer Header & Tabs */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-2xl border border-zinc-800/60">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            Antrean ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderHeart className="w-3.5 h-3.5" />
            Tersimpan ({savedPlaylists.length})
          </button>
        </div>

        <button
          onClick={onOpenBatchModal}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-red-400" />
          Tambah
        </button>
      </div>

      {activeTab === 'queue' ? (
        <>
          {/* Search & Actions Bar */}
          <div className="pt-3 pb-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Cari video di antrean..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
              />
            </div>

            {queue.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSaving(true)}
                  className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 cursor-pointer"
                  title="Simpan antrean ini ke Cloud"
                >
                  <BookmarkPlus className="w-4 h-4 text-amber-400" />
                </button>
                <button
                  onClick={onClearQueue}
                  className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-red-400 border border-zinc-700/60 cursor-pointer"
                  title="Kosongkan semua antrean"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Save to Cloud Form Popover */}
          {isSaving && (
            <form onSubmit={handleSavePlaylist} className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl mb-2 space-y-2">
              <label className="text-[11px] font-semibold text-zinc-300 block">
                Simpan Playlist ke Akun Anda:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama playlist (misal: Lofi Belajar)"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="flex-1 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaving(false)}
                  className="px-2 py-1 text-zinc-400 hover:text-white text-xs cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mt-1">
            {filteredQueue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <ListMusic className="w-10 h-10 mb-2 stroke-1 text-zinc-600" />
                <p className="text-xs font-medium text-zinc-400">Antrean Kosong</p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                  Tempelkan link video atau pilih rekomendasi channel untuk mulai mendengarkan tanpa henti.
                </p>
                <button
                  onClick={onOpenBatchModal}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                >
                  Tambah Video Sekarang
                </button>
              </div>
            ) : (
              filteredQueue.map(({ item, originalIndex }) => {
                const isCurrent = originalIndex === currentIndex;

                return (
                  <div
                    key={item.id || originalIndex}
                    className={`group p-2 rounded-2xl border transition-all flex items-center gap-3 ${
                      isCurrent
                        ? 'bg-red-500/10 border-red-500/40 text-white shadow-sm'
                        : 'bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {/* Index or Playing Indicator */}
                    <button
                      onClick={() => onSelectVideo(originalIndex)}
                      className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 group/thumb cursor-pointer"
                    >
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                          isCurrent ? 'opacity-100' : 'opacity-0 group-hover/thumb:opacity-100'
                        }`}
                      >
                        {isCurrent ? (
                          <div className="flex items-end gap-0.5 h-3">
                            <span className="w-0.5 h-full bg-red-400 animate-pulse" />
                            <span className="w-0.5 h-2 bg-red-400 animate-pulse" />
                            <span className="w-0.5 h-full bg-red-400 animate-pulse" />
                          </div>
                        ) : (
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        )}
                      </div>
                    </button>

                    {/* Title & Channel */}
                    <div
                      onClick={() => onSelectVideo(originalIndex)}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <p
                        className={`text-xs font-semibold truncate leading-tight ${
                          isCurrent ? 'text-red-400' : 'text-zinc-200'
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {item.channelTitle || 'YouTube'}
                      </p>
                    </div>

                    {/* Actions: Reorder & Delete */}
                    <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => onMoveItem(originalIndex, 'up')}
                        disabled={originalIndex === 0}
                        className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                        title="Geser ke atas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMoveItem(originalIndex, 'down')}
                        disabled={originalIndex === queue.length - 1}
                        className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                        title="Geser ke bawah"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(originalIndex)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Hapus dari antrean"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Saved Playlists Tab */
        <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1">
          {savedPlaylists.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <FolderHeart className="w-10 h-10 mb-2 stroke-1 text-zinc-600" />
              <p className="text-xs font-medium text-zinc-400">Belum Ada Playlist Tersimpan</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                Susun antrean video favorit Anda lalu klik ikon Bookmark untuk menyimpannya di Cloud.
              </p>
            </div>
          ) : (
            savedPlaylists.map((pl) => (
              <div
                key={pl.id}
                className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{pl.name}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {pl.items?.length || 0} video • Mode loop:{' '}
                    <span className="text-red-400 font-semibold">{pl.loopMode || 'all'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onLoadSavedPlaylist(pl)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    Putar
                  </button>
                  <button
                    onClick={() => onDeleteSavedPlaylist(pl.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Hapus Playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
