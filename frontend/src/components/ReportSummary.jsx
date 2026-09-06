import { AlertTriangle, AlertCircle, Film, Layers } from 'lucide-react';

export default function ReportSummary({ summary, scriptTitle }) {
  return (
    <div className="mb-8">
      {/* Title */}
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-h1 text-text-primary mb-2 font-mono">Continuity Report</h1>
        <p className="text-body-lg text-text-secondary font-sans">
          <span className="font-mono text-white/80 border border-white/20 bg-white/5 px-2 py-0.5 rounded mr-2 text-sm">{scriptTitle}</span>
          <span className="text-accent">{summary.total_scenes}</span> scenes analyzed
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-[#161616] text-center p-5 group hover:border-white/20 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-white/10 transition-colors">
            <Film size={18} className="text-text-secondary" />
          </div>
          <p className="text-h2 text-text-primary tabular-nums font-mono">{summary.total_scenes}</p>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-[0.2em] mt-1">Scenes</p>
        </div>

        <div className="card bg-[#161616] text-center p-5 group hover:border-white/20 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-white/10 transition-colors">
            <Layers size={18} className="text-text-secondary" />
          </div>
          <p className="text-h2 text-text-primary tabular-nums font-mono">{summary.total_contradictions}</p>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-[0.2em] mt-1">Issues</p>
        </div>

        <div className="card bg-[#161616] text-center p-5 group hover:border-severity-major-border transition-colors">
          <div className="w-10 h-10 rounded-xl bg-severity-major-bg border border-severity-major-border flex items-center justify-center mx-auto mb-3 group-hover:bg-severity-major-border transition-colors shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <AlertTriangle size={18} className="text-severity-major" />
          </div>
          <p className="text-h2 text-severity-major tabular-nums font-mono drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{summary.major_count}</p>
          <p className="text-[10px] text-severity-major/60 font-mono uppercase tracking-[0.2em] mt-1">Major</p>
        </div>

        <div className="card bg-[#161616] text-center p-5 group hover:border-severity-minor-border transition-colors">
          <div className="w-10 h-10 rounded-xl bg-severity-minor-bg border border-severity-minor-border flex items-center justify-center mx-auto mb-3 group-hover:bg-severity-minor-border transition-colors shadow-[0_0_15px_rgba(217,119,6,0.2)]">
            <AlertCircle size={18} className="text-severity-minor" />
          </div>
          <p className="text-h2 text-severity-minor tabular-nums font-mono drop-shadow-[0_0_5px_rgba(217,119,6,0.5)]">{summary.minor_count}</p>
          <p className="text-[10px] text-severity-minor/60 font-mono uppercase tracking-[0.2em] mt-1">Minor</p>
        </div>
      </div>
    </div>
  );
}
