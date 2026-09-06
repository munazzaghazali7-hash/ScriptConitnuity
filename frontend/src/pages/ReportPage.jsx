import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import ReportSummary from '../components/ReportSummary';
import ContradictionCard from '../components/ContradictionCard';

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;

  const [filter, setFilter] = useState('all'); // all | major | minor

  const filteredContradictions = useMemo(() => {
    if (!report?.contradictions) return [];
    if (filter === 'all') return report.contradictions;
    return report.contradictions.filter((c) => c.severity === filter);
  }, [report, filter]);

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `continuity-report-${report.script_title?.replace(/\s+/g, '_') || 'report'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main className="pt-28 pb-20">
          <div className="container-narrow text-center">
            <h1 className="text-h1 text-text-primary mb-4 font-mono">No report available</h1>
            <p className="text-body-lg text-text-secondary mb-8 font-sans">
              Upload a screenplay first to generate a continuity report.
            </p>
            <button onClick={() => navigate('/upload')} className="btn-primary">
              Upload a script
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg selection:bg-accent selection:text-white">
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container-main max-w-4xl">
          {/* Back + download */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/upload')}
              className="btn-ghost !px-0 font-mono text-xs uppercase tracking-wider"
            >
              <ArrowLeft size={14} className="mr-1" />
              cd ..
            </button>
            <button onClick={handleDownload} className="btn-secondary text-xs font-mono !px-4 !py-2 border-white/20 hover:border-accent hover:text-accent">
              <Download size={14} className="mr-1.5" />
              Download JSON
            </button>
          </div>

          {/* Summary */}
          <ReportSummary
            summary={report.summary}
            scriptTitle={report.script_title}
          />

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
              {[
                { key: 'all', label: 'All', count: report.summary?.total_contradictions },
                { key: 'major', label: 'Major', count: report.summary?.major_count },
                { key: 'minor', label: 'Minor', count: report.summary?.minor_count },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-mono transition-all duration-200 ${
                    filter === tab.key
                      ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-white/10'
                      : 'text-text-muted hover:text-text-secondary border border-transparent'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded bg-black/50 ${
                      filter === tab.key ? 'text-accent' : 'text-text-muted'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Contradiction list */}
          <div className="space-y-4">
            {filteredContradictions.length > 0 ? (
              filteredContradictions.map((contradiction, i) => (
                <ContradictionCard
                  key={contradiction.id || i}
                  contradiction={contradiction}
                  scenes={report.scenes}
                />
              ))
            ) : (
              <div className="card bg-[#161616] border border-white/10 text-center py-12">
                <Filter size={24} className="text-white/20 mx-auto mb-3" />
                <p className="text-sm font-mono text-text-secondary">
                  No {filter !== 'all' ? filter : ''} contradictions found.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
