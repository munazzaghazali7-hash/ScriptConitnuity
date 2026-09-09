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
      <div className="min-h-screen bg-liquid-abyss">
        <Navbar />
        <main className="pt-28 pb-20">
          <div className="container-narrow text-center">
            <h1 className="text-heading text-platinum mb-4 font-medium">No report available</h1>
            <p className="text-body text-silver-mist mb-8">
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
    <div className="min-h-screen bg-liquid-abyss">
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container-main max-w-[1000px]">
          {/* Back + download */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/upload')}
              className="btn-ghost !px-0"
            >
              <ArrowLeft size={14} className="mr-2" />
              Go back
            </button>
            <button onClick={handleDownload} className="btn-base bg-liquid-kelp text-white hover:bg-[#004d49] text-[14px] px-4 py-2">
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
            <div className="flex items-center gap-1 p-1 bg-liquid-deep rounded-buttons">
              {[
                { key: 'all', label: 'All', count: report.summary?.total_contradictions },
                { key: 'major', label: 'Major', count: report.summary?.major_count },
                { key: 'minor', label: 'Minor', count: report.summary?.minor_count },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-sm text-[12px] uppercase tracking-wide font-medium transition-all duration-200 ${
                    filter === tab.key
                      ? 'bg-liquid-kelp text-white'
                      : 'text-silver-mist hover:text-white'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-sm ${
                      filter === tab.key ? 'bg-liquid-abyss text-lavender-phosphor' : 'bg-liquid-kelp text-silver-mist'
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
              <div className="card-surface text-center py-12">
                <Filter size={24} className="text-white/20 mx-auto mb-3" />
                <p className="text-sm text-silver-mist">
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
