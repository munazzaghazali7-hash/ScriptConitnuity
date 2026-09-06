import { useState, useCallback } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFileSelected, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const validateFile = useCallback((file) => {
    if (!file) return false;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.');
      return false;
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB
      setError('File too large. Maximum size is 50MB.');
      return false;
    }
    setError('');
    return true;
  }, []);

  const handleFile = useCallback((file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelected(file);
    }
  }, [validateFile, onFileSelected]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError('');
    onFileSelected(null);
  }, [onFileSelected]);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        /* Drop zone */
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            flex flex-col items-center justify-center gap-4
            w-full min-h-[240px] p-8
            rounded-2xl border-2 border-dashed cursor-pointer
            transition-all duration-300 bg-[#161616]
            ${dragOver
              ? 'border-accent shadow-[0_0_30px_rgba(1,179,159,0.2)] bg-accent/5 scale-[1.01]'
              : 'border-white/20 hover:border-accent hover:bg-white/5'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />

          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors duration-300
            ${dragOver ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-text-muted hover:text-accent'}
          `}>
            <Upload size={24} />
          </div>

          <div className="text-center font-mono">
            <p className="text-body font-medium text-text-primary mb-1">
              {dragOver ? '> Drop screenplay here_' : '> Drop a screenplay PDF here_'}
            </p>
            <p className="text-body-sm text-text-muted">
              or click to browse // max 50MB
            </p>
          </div>
        </label>
      ) : (
        /* Selected file display */
        <div className="card bg-[#161616] flex items-center gap-4 border-accent/30 shadow-[0_0_15px_rgba(1,179,159,0.1)]">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <FileText size={22} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0 font-mono">
            <p className="text-body font-medium text-text-primary truncate">
              {selectedFile.name}
            </p>
            <p className="text-body-sm text-accent">
              {formatSize(selectedFile.size)}
            </p>
          </div>
          {!disabled && (
            <button
              onClick={clearFile}
              className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors"
              aria-label="Remove file"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 mt-3 text-severity-major text-body-sm font-mono bg-severity-major-bg border border-severity-major-border p-3 rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
