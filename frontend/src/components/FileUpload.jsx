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
            rounded-cards cursor-pointer
            transition-all duration-300
            ${dragOver
              ? 'bg-[#004d49] border border-white/20 scale-[1.01]'
              : 'bg-liquid-kelp border border-transparent hover:bg-[#004d49]'
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
            w-14 h-14 rounded-buttons flex items-center justify-center transition-colors duration-300
            ${dragOver ? 'bg-liquid-deep text-platinum' : 'bg-liquid-deep text-silver-mist hover:text-white'}
          `}>
            <Upload size={24} />
          </div>

          <div className="text-center font-sans">
            <p className="text-body font-medium text-platinum mb-1">
              {dragOver ? 'Drop screenplay here' : 'Drop a screenplay PDF here'}
            </p>
            <p className="text-[12px] text-silver-mist uppercase tracking-wide">
              or click to browse // max 50MB
            </p>
          </div>
        </label>
      ) : (
        /* Selected file display */
        <div className="card-surface !py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-buttons bg-liquid-deep flex items-center justify-center flex-shrink-0">
            <FileText size={22} className="text-lavender-phosphor" />
          </div>
          <div className="flex-1 min-w-0 font-sans">
            <p className="text-body font-medium text-platinum truncate">
              {selectedFile.name}
            </p>
            <p className="text-[12px] text-silver-mist mt-1 uppercase tracking-wide">
              {formatSize(selectedFile.size)}
            </p>
          </div>
          {!disabled && (
            <button
              onClick={clearFile}
              className="p-2 rounded-buttons bg-liquid-deep hover:bg-[#004d49] text-silver-mist hover:text-white transition-colors"
              aria-label="Remove file"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 mt-4 text-severity-major text-[13px] font-sans bg-severity-major-bg border border-severity-major-border p-4 rounded-cards">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
    </div>
  );
}
