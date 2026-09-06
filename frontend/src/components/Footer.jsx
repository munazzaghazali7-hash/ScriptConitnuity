import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-bg">
      <div className="container-main py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center border border-white/20">
              <Film size={14} className="text-accent" />
            </div>
            <span className="text-body-sm font-mono font-medium text-text-primary tracking-tight">
              ContinuityAgent
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-body-sm font-mono text-text-muted">
            <span>Built for script supervisors</span>
            <span className="hidden md:inline text-white/20">·</span>
            <span>AI-powered continuity analysis</span>
          </div>

          {/* Note */}
          <p className="text-caption font-mono text-text-muted">
            © {new Date().getFullYear()} Script Continuity Agent
          </p>
        </div>
      </div>
    </footer>
  );
}
