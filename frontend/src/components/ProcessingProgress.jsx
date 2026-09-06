import { useMemo } from 'react';
import {
  FileSearch,
  Database,
  Search,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const stepMeta = {
  parse_script_pdf: { icon: FileSearch, label: 'Parsing PDF', color: 'text-accent' },
  extract_scene_facts: { icon: Search, label: 'Extracting facts', color: 'text-accent-purple' },
  update_continuity_db: { icon: Database, label: 'Updating database', color: 'text-accent-green' },
  check_contradictions: { icon: AlertTriangle, label: 'Checking contradictions', color: 'text-severity-minor' },
  generate_report: { icon: FileText, label: 'Generating report', color: 'text-accent' },
  complete: { icon: CheckCircle2, label: 'Complete', color: 'text-accent-green' },
  error: { icon: AlertTriangle, label: 'Error', color: 'text-severity-major' },
};

export default function ProcessingProgress({ events }) {
  const latestEvent = events[events.length - 1];
  const isComplete = latestEvent?.step === 'complete';
  const isError = latestEvent?.step === 'error';

  const progress = useMemo(() => {
    if (!latestEvent) return 0;
    if (isComplete) return 100;
    if (!latestEvent.scene_total) return 5;

    const sceneProgress = ((latestEvent.scene_current || 0) / latestEvent.scene_total) * 100;
    return Math.min(Math.round(sceneProgress), 99);
  }, [latestEvent, isComplete]);

  // Deduplicate events for the log
  const logEvents = useMemo(() => {
    const seen = new Set();
    return events.filter((e) => {
      if (e.message?.startsWith('⚠️')) return true;
      if (e.step === 'error') return true;
      if (e.step === 'complete') return true;
      const key = `${e.step}-${e.scene_current}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [events]);

  const meta = stepMeta[latestEvent?.step] || stepMeta.parse_script_pdf;
  const StepIcon = meta.icon;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main status */}
      <div className="card bg-[#161616] mb-6 border-white/10 relative overflow-hidden">
        {/* Glow effect matching current step color */}
        <div 
          className="absolute top-0 left-0 w-full h-1 opacity-50 blur-[2px] transition-colors duration-500" 
          style={{ backgroundColor: meta.color === 'text-accent' ? '#01B39F' : meta.color === 'text-accent-purple' ? '#A97DE7' : meta.color === 'text-accent-green' ? '#4AB35A' : '#78716C' }}
        />
        
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10`}>
            {isComplete || isError ? (
              <StepIcon size={22} className={meta.color} />
            ) : (
              <Loader2 size={22} className={`${meta.color} animate-spin`} />
            )}
          </div>
          <div className="flex-1 font-mono">
            <p className="text-h3 text-text-primary">
              <span className="text-accent mr-2">&gt;</span>{meta.label}
            </p>
            <p className="text-body-sm text-text-secondary mt-0.5 truncate">
              {latestEvent?.message || 'Initializing agent...'}
            </p>
          </div>
          <span className="text-h3 text-text-muted tabular-nums font-mono">
            {progress}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
          <div
            className={`progress-bar-fill h-full rounded-full transition-all duration-500 shadow-[0_0_10px_currentColor] ${meta.color.replace('text-', 'bg-')}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Scene counter */}
        {latestEvent?.scene_total && (
          <p className="text-xs font-mono text-text-muted mt-3 text-right">
            [SCENE {latestEvent.scene_current || '—'} / {latestEvent.scene_total}]
          </p>
        )}
      </div>

      {/* Step log (Terminal style) */}
      <div className="card bg-black border border-white/10 !p-0 overflow-hidden font-mono shadow-[inset_0_2px_20px_rgba(0,0,0,1)]">
        <div className="px-5 py-2.5 bg-white/5 border-b border-white/10 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <h4 className="text-xs text-text-muted ml-2">agent_log.sh</h4>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {logEvents.map((event, i) => {
            const evMeta = stepMeta[event.step] || stepMeta.parse_script_pdf;
            const isContradiction = event.message?.startsWith('⚠️');

            return (
              <div
                key={i}
                className={`flex items-start gap-3 px-3 py-1.5 text-[13px] leading-relaxed animate-slide-in hover:bg-white/5 rounded transition-colors ${
                  isContradiction ? 'text-severity-major bg-severity-major-bg/20' : 'text-text-secondary'
                }`}
              >
                <span className="text-text-muted select-none">
                  {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={`${evMeta.color} opacity-70 select-none`}>❯</span>
                <span className="flex-1 break-words">
                  {event.message}
                </span>
              </div>
            );
          })}
          {logEvents.length === 0 && (
            <div className="px-5 py-8 text-center text-[13px] text-text-muted">
              Waiting for execution...
            </div>
          )}
          {/* Blinking cursor */}
          {!isComplete && !isError && logEvents.length > 0 && (
            <div className="px-3 py-1.5">
              <span className="inline-block w-2 h-4 bg-accent animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
