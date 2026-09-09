import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-liquid-abyss px-4 pb-4">
      <div className="card-recessed flex flex-col md:flex-row items-center justify-between gap-8 mt-16">
        {/* Logo & Copyright */}
        <div>
          <div className="flex items-center gap-3 text-platinum mb-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <Film size={20} className="text-white" />
            </div>
            <span className="text-[16px] font-medium tracking-wide uppercase">
              ScriptContinuity
            </span>
          </div>
          <p className="text-body text-silver-mist">
            &copy; {new Date().getFullYear()} ScriptContinuity. All rights reserved.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-body text-silver-mist text-center">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <span className="hidden md:inline text-white/20">·</span>
          <span>AI-powered continuity analysis</span>
        </div>
      </div>
    </footer>
  );
}
