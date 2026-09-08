import React from "react";
import Link from "next/link";
import { ShieldCheck, Cpu, Cloud, Terminal } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/80 backdrop-blur-lg py-8 mt-20 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>MajorMatch Architecture</span>
          </div>
          <span>•</span>
          <span>Next.js 14 Web 2.0 Client Tier</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% PII Confidential</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multi-tier Hybrid Cloud</span>
          </div>
          <a
            href="https://github.com/MajorMatch-Labs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            MajorMatch-Labs
          </a>
        </div>
      </div>
    </footer>
  );
};
