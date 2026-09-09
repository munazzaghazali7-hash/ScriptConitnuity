import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, TerminalSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import ProcessingProgress from '../components/ProcessingProgress';
import { uploadScript, demoUpload, streamProcessing } from '../lib/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState(isDemo ? 'ready-demo' : 'upload'); // upload | ready-demo | uploading | processing | complete | error
  const [progressEvents, setProgressEvents] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelected = useCallback((selectedFile) => {
    setFile(selectedFile);
    setError('');
  }, []);

  const startProcessing = useCallback(async (jobId) => {
    setPhase('processing');
    setProgressEvents([]);

    streamProcessing(
      jobId,
      // onProgress
      (event) => {
        setProgressEvents((prev) => [...prev, event]);
      },
      // onComplete
      (reportData) => {
        setReport(reportData);
        setPhase('complete');
      },
      // onError
      (errMsg) => {
        setError(errMsg);
        setPhase('error');
      },
    );
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setPhase('uploading');
    setError('');

    try {
      const result = await uploadScript(file);
      startProcessing(result.job_id);
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }, [file, startProcessing]);

  const handleDemoStart = useCallback(async () => {
    setPhase('uploading');
    setError('');

    try {
      const result = await demoUpload();
      startProcessing(result.job_id);
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }, [startProcessing]);

  // Auto-start demo if ?demo=true
  useEffect(() => {
    if (isDemo && phase === 'ready-demo') {
      handleDemoStart();
    }
  }, [isDemo, phase, handleDemoStart]);

  const handleViewReport = useCallback(() => {
    navigate('/report', { state: { report } });
  }, [navigate, report]);

  return (
    <div className="min-h-screen bg-liquid-abyss">
      <Navbar />

      <main className="pt-28 pb-20 relative">

        <div className="container-narrow relative z-10">
          {/* Back link */}
          <button
            onClick={() => navigate('/')}
            className="btn-ghost !px-0 mb-8"
          >
            <ArrowLeft size={14} className="mr-1" />
            cd ..
          </button>

          {/* Upload phase */}
          {(phase === 'upload' || phase === 'uploading') && !isDemo && (
            <div className="animate-fade-up">
              <h1 className="text-heading text-platinum mb-2 font-medium">Upload your screenplay</h1>
              <p className="text-body text-silver-mist mb-8">
                Upload a screenplay PDF and our AI agent will analyze it scene-by-scene.
              </p>

              <FileUpload
                onFileSelected={handleFileSelected}
                disabled={phase === 'uploading'}
              />

              {file && phase !== 'uploading' && (
                <div className="flex items-center gap-4 mt-6">
                  <button
                    onClick={handleUpload}
                    className="btn-primary"
                  >
                    <Play size={16} fill="currentColor" />
                    Analyze screenplay
                  </button>
                </div>
              )}

              {phase === 'uploading' && (
                <div className="mt-6 flex items-center gap-3 text-body font-mono text-accent">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Uploading_
                </div>
              )}
            </div>
          )}

          {/* Demo loading */}
          {phase === 'uploading' && isDemo && (
            <div className="text-center animate-fade-up">
              <h1 className="text-heading text-platinum mb-2 font-medium">Loading demo...</h1>
              <p className="text-body text-silver-mist mb-8">
                Setting up "The Last Arrangement" — a test screenplay.
              </p>
              <div className="flex items-center justify-center gap-3 text-body font-mono text-accent">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Preparing_
              </div>
            </div>
          )}

          {/* Processing phase */}
          {phase === 'processing' && (
            <div className="animate-fade-up">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-liquid-kelp font-sans text-sm text-silver-mist mb-6">
                  <TerminalSquare size={14} />
                  <span>Agent running</span>
                </div>
                <h1 className="text-heading text-platinum mb-2 font-medium">Analyzing screenplay</h1>
              </div>

              <ProcessingProgress events={progressEvents} />
            </div>
          )}

          {/* Complete phase */}
          {phase === 'complete' && report && (
            <div className="text-center animate-fade-up max-w-lg mx-auto mt-10">
              <div className="w-20 h-20 rounded-2xl bg-liquid-kelp flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-heading text-platinum mb-4 font-medium">Analysis complete</h1>
              <div className="p-4 rounded-xl bg-liquid-deep mb-8 font-sans text-sm text-silver-mist">
                <p>
                  Found <strong className="text-severity-major">{report.summary?.major_count || 0} major</strong> and{' '}
                  <strong className="text-severity-minor">{report.summary?.minor_count || 0} minor</strong> issues across {report.total_scenes || 0} scenes.
                </p>
              </div>
              <button
                onClick={handleViewReport}
                className="btn-primary w-full py-3"
              >
                View full report
              </button>
            </div>
          )}

          {/* Error phase */}
          {phase === 'error' && (
            <div className="text-center animate-fade-up max-w-lg mx-auto mt-10">
              <div className="w-20 h-20 rounded-2xl bg-severity-major-bg border border-severity-major-border flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-severity-major" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-heading text-platinum mb-4 font-medium">Execution Error</h1>
              <div className="p-4 rounded-xl bg-liquid-deep border border-severity-major-border mb-8 text-left font-sans text-sm overflow-x-auto text-severity-major">
                <p>{error}</p>
              </div>
              <button
                onClick={() => { setPhase('upload'); setError(''); setFile(null); }}
                className="btn-secondary w-full"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
