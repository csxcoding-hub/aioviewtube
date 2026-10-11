import React from 'react';
import { Globe, Mail, MessageCircle, ExternalLink, Heart, ShieldCheck } from 'lucide-react';

interface DeveloperFooterProps {
  onOpenDevModal?: () => void;
}

export const DeveloperFooter: React.FC<DeveloperFooterProps> = ({ onOpenDevModal }) => {
  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
      <div className="flex flex-col sm:flex-row items-center gap-2.5 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <img
            src="/icon.png"
            alt="LoopTube Logo"
            className="w-5 h-5 rounded-md object-cover shadow-sm"
          />
          <span className="font-bold text-zinc-200">LoopTube PRO</span>
        </div>
        <span className="hidden sm:inline text-zinc-600">•</span>
        <div className="flex items-center gap-1.5">
          <span>Developer by:</span>
          {/* Dofollow backlink to https://kioskode.my.id/ as requested */}
          <a
            href="https://kioskode.my.id/"
            target="_blank"
            rel="dofollow"
            className="font-bold text-red-400 hover:text-red-300 underline decoration-red-500/50 hover:decoration-red-400 transition-colors inline-flex items-center gap-1"
          >
            <span>Kios Kode</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Contact Pills: WhatsApp, Email, Website */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-[11px]">
        {/* WhatsApp Direct Chat */}
        <a
          href="https://wa.me/6289690361144?text=Halo%20Kios%20Kode%2C%20saya%20menghubungi%20mengenai%20aplikasi%20LoopTube"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 hover:border-emerald-500/40 transition-colors cursor-pointer"
          title="Hubungi WhatsApp Kios Kode (089690361144)"
        >
          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
          <span>WA: <strong>089690361144</strong></span>
        </a>

        {/* Email Direct Mailto */}
        <a
          href="mailto:cs.kioskode@gmail.com?subject=Pertanyaan%20LoopTube%20App"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
          title="Kirim Email ke cs.kioskode@gmail.com"
        >
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span>cs.kioskode@gmail.com</span>
        </a>

        {/* Dofollow Website Link */}
        <a
          href="https://kioskode.my.id/"
          target="_blank"
          rel="dofollow"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 hover:border-amber-500/40 transition-colors cursor-pointer"
          title="Kunjungi Website Resmi Kios Kode (https://kioskode.my.id/)"
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span>kioskode.my.id</span>
        </a>

        {onOpenDevModal && (
          <button
            onClick={onOpenDevModal}
            className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            Profil Lengkap
          </button>
        )}
      </div>
    </footer>
  );
};
