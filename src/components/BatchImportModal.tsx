import React, { useState } from 'react';
import { X, Plus, Radio, Link as LinkIcon, Sparkles, Check, Loader2, AlertCircle, RefreshCw, Youtube } from 'lucide-react';
import {
  CURATED_CHANNELS,
  fetchChannelVideos,
  fetchVideoMetadata,
  isChannelInput,
  parseMultipleVideos,
} from '../utils/youtube';
import { PlaylistItem } from '../types';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideos: (videos: PlaylistItem[]) => void;
  onTrackChannel?: (channelInfo: { title: string; handle: string; channelId: string }) => void;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  onAddVideos,
  onTrackChannel,
}) => {
  const [activeTab, setActiveTab] = useState<'channel' | 'batch'>('channel');
  const [channelInput, setChannelInput] = useState('https://www.youtube.com/@KiosKode');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time extracted IDs for batch tab
  const detectedIds = parseMultipleVideos(inputText);

  const handleImportChannel = async (urlOrHandle: string) => {
    if (!urlOrHandle.trim()) {
      setErrorMsg('Masukkan tautan atau handle channel YouTube.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const channelData = await fetchChannelVideos(urlOrHandle.trim());
      if (!channelData.videos || channelData.videos.length === 0) {
        throw new Error('Tidak ada video yang ditemukan dari channel ini.');
      }

      onAddVideos(channelData.videos);
      if (onTrackChannel) {
        onTrackChannel({
          title: channelData.channelTitle,
          handle: channelData.handle,
          channelId: channelData.channelId,
        });
      }

      setSuccessMsg(
        `Berhasil memuat ${channelData.videos.length} video dari channel ${channelData.channelTitle}!`
      );
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal memuat video channel. Pastikan URL benar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportBatch = async () => {
    // If user pasted a channel link in the batch tab, automatically route to channel importer!
    if (isChannelInput(inputText)) {
      await handleImportChannel(inputText);
      return;
    }

    if (detectedIds.length === 0) {
      setErrorMsg('Tidak ada tautan atau ID video YouTube yang valid terdeteksi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const items: PlaylistItem[] = [];

      for (let i = 0; i < detectedIds.length; i++) {
        const id = detectedIds[i];
        const meta = await fetchVideoMetadata(id);
        items.push({
          id: `item-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          videoId: id,
          title: meta.title,
          channelTitle: meta.channelTitle,
          thumbnailUrl: meta.thumbnailUrl,
          order: i,
          addedAt: Date.now(),
        });
      }

      onAddVideos(items);
      setInputText('');
      onClose();
    } catch (err: any) {
      setErrorMsg('Gagal memproses beberapa video. Silakan periksa koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  const featured = CURATED_CHANNELS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500" />
              Impor Channel & Video YouTube
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Muat otomatis semua video dari channel YouTube atau tempelkan daftar link video
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-950/40 px-6">
          <button
            onClick={() => setActiveTab('channel')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'channel'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Youtube className="w-4 h-4" />
            Impor Seluruh Channel (Auto-Reload)
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'batch'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Banyak Link Video (Batch URL)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'channel' ? (
            <div className="space-y-4">
              {/* Channel Input Form */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  Masukkan Tautan Channel atau Handle YouTube:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    placeholder="Contoh: https://www.youtube.com/@KiosKode atau @KiosKode"
                    className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 font-mono"
                  />
                  <button
                    onClick={() => handleImportChannel(channelInput)}
                    disabled={isLoading || !channelInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>Muat Semua Video</span>
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Semua video dari channel akan ditarik secara otomatis melalui feed resmi YouTube.
                </p>
              </div>

              {/* Featured Channel Card: Kios Kode */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Channel Unggulan:
                </label>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={featured.avatar}
                      alt={featured.title}
                      className="w-12 h-12 rounded-2xl object-cover border border-zinc-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{featured.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                          {featured.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{featured.handle}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">{featured.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleImportChannel(featured.handle)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-red-400" />
                    Muat & Sinkronkan
                  </button>
                </div>
              </div>

              {/* Auto-Reload Explanation Note */}
              <div className="p-3.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Bagaimana video baru ter-reload otomatis?
                </p>
                <p>
                  Ketika channel didaftarkan, sistem terhubung ke feed resmi YouTube channel tersebut.
                  Anda dapat mengaktifkan <strong>Auto-Sync</strong> di layar pemutar yang akan secara berkala
                  memeriksa apakah ada video baru yang diunggah ke channel dan menambahkannya ke antrean tanpa
                  mengganggu pemutaran yang sedang berlangsung!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Tempelkan link video YouTube (bisa lebih dari satu, pisahkan baris baru atau koma):
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Contoh:\nhttps://www.youtube.com/watch?v=UslOP77SkUk\nhttps://www.youtube.com/watch?v=yi4k7CD7KmI\nhttps://www.youtube.com/watch?v=aVs4nW5ZfOE`}
                  rows={6}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-red-500 font-mono resize-none placeholder:text-zinc-600"
                />
              </div>

              {/* Detected Links summary */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/60">
                <span className="text-xs text-zinc-400">
                  Tautan terdeteksi: <strong className="text-white">{detectedIds.length} video</strong>
                </span>
                {detectedIds.length > 0 && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> Siap diimpor
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {activeTab === 'batch' && (
            <button
              onClick={handleImportBatch}
              disabled={isLoading || detectedIds.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses {detectedIds.length} video...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Impor {detectedIds.length > 0 ? `${detectedIds.length} Video` : ''}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
