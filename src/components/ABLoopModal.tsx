import React, { useState } from 'react';
import { X, Repeat, Check, RotateCcw } from 'lucide-react';
import { ABLoop } from '../types';
import { formatTime } from '../utils/youtube';

interface ABLoopModalProps {
  isOpen: boolean;
  onClose: () => void;
  abLoop: ABLoop;
  currentTime: number;
  duration: number;
  onUpdateABLoop: (loop: ABLoop) => void;
}

export const ABLoopModal: React.FC<ABLoopModalProps> = ({
  isOpen,
  onClose,
  abLoop,
  currentTime,
  duration,
  onUpdateABLoop,
}) => {
  const [start, setStart] = useState<number>(abLoop.start);
  const [end, setEnd] = useState<number>(abLoop.end || duration);
  const [enabled, setEnabled] = useState<boolean>(abLoop.enabled);

  if (!isOpen) return null;

  const handleSetAFromCurrent = () => {
    setStart(Math.floor(currentTime));
  };

  const handleSetBFromCurrent = () => {
    setEnd(Math.floor(currentTime));
  };

  const handleSave = () => {
    const validStart = Math.max(0, start);
    const validEnd = Math.max(validStart + 1, end > 0 ? end : duration);
    onUpdateABLoop({
      enabled: true,
      start: validStart,
      end: validEnd,
    });
    onClose();
  };

  const handleReset = () => {
    onUpdateABLoop({
      enabled: false,
      start: 0,
      end: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Loop Segmen Waktu (A ⇆ B)</h3>
              <p className="text-xs text-zinc-400">Ulangi terus potongan menit tertentu dari video</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-4">
          <div className="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Posisi Saat Ini:</span>
            <span className="text-xs font-mono font-bold text-white bg-zinc-800 px-2.5 py-1 rounded-lg">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Point A */}
          <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">Titik Awal (Titik A)</span>
              <button
                onClick={handleSetAFromCurrent}
                className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
              >
                Gunakan Waktu Sekarang
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={Math.max(1, duration)}
                value={start}
                onChange={(e) => setStart(Number(e.target.value))}
                className="flex-1 accent-red-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-semibold text-zinc-200 w-14 text-right">
                {formatTime(start)}
              </span>
            </div>
          </div>

          {/* Point B */}
          <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">Titik Akhir (Titik B)</span>
              <button
                onClick={handleSetBFromCurrent}
                className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
              >
                Gunakan Waktu Sekarang
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={Math.max(1, duration)}
                value={end || duration}
                onChange={(e) => setEnd(Number(e.target.value))}
                className="flex-1 accent-red-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-semibold text-zinc-200 w-14 text-right">
                {formatTime(end || duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Matikan Segmen
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Terapkan Loop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
