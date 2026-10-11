import React, { useState } from 'react';
import { X, Moon, Clock, Check, BellOff } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTimerRemaining: number | null;
  onSetTimerMinutes: (minutes: number) => void;
  onCancelTimer: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  currentTimerRemaining,
  onSetTimerMinutes,
  onCancelTimer,
}) => {
  const [customMin, setCustomMin] = useState<string>('');

  if (!isOpen) return null;

  const presets = [15, 30, 45, 60, 90, 120];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMin, 10);
    if (!isNaN(val) && val > 0) {
      onSetTimerMinutes(val);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pengatur Waktu Tidur</h3>
              <p className="text-xs text-zinc-400">Hentikan pemutaran secara otomatis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Timer Status */}
        {currentTimerRemaining !== null && (
          <div className="my-4 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Clock className="w-4 h-4 animate-spin" />
              <span>
                Aktif: Berhenti dalam {Math.floor(currentTimerRemaining / 60)}m {currentTimerRemaining % 60}s
              </span>
            </div>
            <button
              onClick={() => {
                onCancelTimer();
                onClose();
              }}
              className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
            >
              Batalkan
            </button>
          </div>
        )}

        {/* Presets Grid */}
        <div className="my-4 grid grid-cols-3 gap-2.5">
          {presets.map((min) => (
            <button
              key={min}
              onClick={() => {
                onSetTimerMinutes(min);
                onClose();
              }}
              className="py-3 px-2 rounded-2xl bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/50 text-zinc-200 hover:text-white text-xs font-bold transition-all text-center cursor-pointer"
            >
              {min} Menit
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className="pt-2 flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="600"
            placeholder="Atur menit kustom..."
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!customMin || parseInt(customMin, 10) <= 0}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Aktifkan
          </button>
        </form>
      </div>
    </div>
  );
};
