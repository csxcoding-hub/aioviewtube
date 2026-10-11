import React from 'react';
import {
  X,
  Globe,
  Mail,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Youtube,
  Copy,
  Check,
} from 'lucide-react';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ isOpen, onClose }) => {
  const [copiedWA, setCopiedWA] = React.useState(false);
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyWA = () => {
    navigator.clipboard?.writeText('089690361144');
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText('cs.kioskode@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with HD App Icon */}
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-800">
          <div className="relative">
            <img
              src="/icon.png"
              alt="LoopTube HD Icon - Merah Kuning"
              className="w-16 h-16 rounded-2xl object-cover shadow-xl border border-zinc-700/60"
            />
            <span className="absolute -bottom-1 -right-1 p-1 bg-red-600 rounded-full text-white shadow-md">
              <Sparkles className="w-3 h-3" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">LoopTube PRO</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                HD Icon
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Aplikasi dikembangkan oleh <strong>Kios Kode</strong>
            </p>
          </div>
        </div>

        {/* Developer Bio & Dofollow Backlink */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
            <span>Developer by:</span>
            {/* Dofollow Backlink */}
            <a
              href="https://kioskode.my.id/"
              target="_blank"
              rel="dofollow"
              className="text-red-400 hover:text-red-300 font-bold underline inline-flex items-center gap-1"
            >
              Kios Kode (kioskode.my.id) <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Kios Kode menyediakan solusi sistem informasi, aplikasi berbasis web & desktop,
            serta tutorial pemrograman praktis untuk sekolah, instansi, dan umum.
          </p>
        </div>

        {/* Contact Links Card */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Kontak Resmi Developer
          </h4>

          {/* WhatsApp */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">WhatsApp</p>
                <p className="text-[11px] text-zinc-400 font-mono">089690361144</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyWA}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Salin nomor WA"
              >
                {copiedWA ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href="https://wa.me/6289690361144?text=Halo%20Kios%20Kode%2C%20saya%20menghubungi%20dari%20aplikasi%20LoopTube"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Chat WA
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Email</p>
                <p className="text-[11px] text-zinc-400 font-mono">cs.kioskode@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyEmail}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Salin Email"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href="mailto:cs.kioskode@gmail.com?subject=Pertanyaan%20LoopTube%20App"
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Kirim Email
              </a>
            </div>
          </div>

          {/* Website Dofollow */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Website Resmi</p>
                <p className="text-[11px] text-zinc-400">kioskode.my.id</p>
              </div>
            </div>

            <a
              href="https://kioskode.my.id/"
              target="_blank"
              rel="dofollow"
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-1"
            >
              <span>Kunjungi Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* YouTube Channel */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-red-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Channel YouTube</p>
                <p className="text-[11px] text-zinc-400">@KiosKode</p>
              </div>
            </div>

            <a
              href="https://www.youtube.com/@KiosKode"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-1"
            >
              <span>Buka YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 text-center text-[11px] text-zinc-500">
          Icon HD aplikasi, favicon, dan exe disesuaikan khusus dengan tema Merah-Kuning.
        </div>
      </div>
    </div>
  );
};
