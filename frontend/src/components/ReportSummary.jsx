import { AlertTriangle, AlertCircle, Film, Layers } from 'lucide-react';

export default function ReportSummary({ summary, scriptTitle }) {
  return (
    <div className="mb-12">
      {/* Title */}
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-heading text-platinum mb-2 font-medium">Continuity Report</h1>
        <p className="text-body text-silver-mist">
          <span className="text-[14px] text-silver-mist bg-liquid-kelp px-2 py-0.5 rounded-sm mr-2">{scriptTitle}</span>
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-surface p-6 flex flex-col justify-center items-center">
          <p className="text-[61px] md:text-[86px] text-lavender-phosphor font-medium leading-none tracking-tight mb-2">{summary.total_scenes}</p>
          <p className="text-[13px] text-liquid-mist uppercase tracking-[0.055em]">Scenes</p>
        </div>

        <div className="card-surface p-6 flex flex-col justify-center items-center">
          <p className="text-[61px] md:text-[86px] text-lavender-phosphor font-medium leading-none tracking-tight mb-2">{summary.total_contradictions}</p>
          <p className="text-[13px] text-liquid-mist uppercase tracking-[0.055em]">Issues</p>
        </div>

        <div className="card-surface p-6 flex flex-col justify-center items-center">
          <p className="text-[61px] md:text-[86px] text-severity-major font-medium leading-none tracking-tight mb-2">{summary.major_count}</p>
          <p className="text-[13px] text-liquid-mist uppercase tracking-[0.055em]">Major</p>
        </div>

        <div className="card-surface p-6 flex flex-col justify-center items-center">
          <p className="text-[61px] md:text-[86px] text-severity-minor font-medium leading-none tracking-tight mb-2">{summary.minor_count}</p>
          <p className="text-[13px] text-liquid-mist uppercase tracking-[0.055em]">Minor</p>
        </div>
      </div>
    </div>
  );
}
