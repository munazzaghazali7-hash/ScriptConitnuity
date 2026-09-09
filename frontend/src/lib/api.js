/**
 * API Client + SSE Handler
 * =========================
 * All communication with the FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Upload a screenplay PDF to the backend.
 * @param {File} file — The PDF file to upload
 * @returns {Promise<{job_id: string, filename: string, size_bytes: number}>}
 */
export async function uploadScript(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }

  return res.json();
}

/**
 * Trigger a demo upload (uses the test screenplay).
 * @returns {Promise<{job_id: string, filename: string}>}
 */
export async function demoUpload() {
  const res = await fetch(`${API_BASE}/api/demo-upload`, { method: 'POST' });
  if (!res.ok) throw new Error('Demo upload failed');
  return res.json();
}

/**
 * Connect to the SSE endpoint and stream agent progress events.
 * @param {string} jobId
 * @param {(event: object) => void} onProgress — Called for each progress event
 * @param {(report: object) => void} onComplete — Called when processing finishes
 * @param {(error: string) => void} onError — Called on error
 * @returns {EventSource} — The SSE connection (call .close() to disconnect)
 */
export function streamProcessing(jobId, onProgress, onComplete, onError) {
  const url = `${API_BASE}/api/process/${jobId}`;
  const eventSource = new EventSource(url);

  eventSource.addEventListener('progress', (e) => {
    try {
      const data = JSON.parse(e.data);
      onProgress(data);

      // Check if this is the completion event with report data
      if (data.step === 'complete' && data.data?.report) {
        onComplete(data.data.report);
        eventSource.close();
      }
    } catch (err) {
      console.error('Failed to parse progress event:', err);
    }
  });

  eventSource.addEventListener('complete', (e) => {
    try {
      const data = JSON.parse(e.data);
      onComplete(data);
    } catch (err) {
      console.error('Failed to parse complete event:', err);
    }
    eventSource.close();
  });

  eventSource.addEventListener('error', (e) => {
    if (e.data) {
      try {
        const data = JSON.parse(e.data);
        onError(data.error || 'Processing error');
      } catch {
        onError('Processing error');
      }
    }
    eventSource.close();
  });

  eventSource.onerror = () => {
    // SSE connection closed (normal after completion)
    if (eventSource.readyState === EventSource.CLOSED) return;
    eventSource.close();
  };

  return eventSource;
}

/**
 * Fetch a completed report.
 * @param {string} jobId
 * @returns {Promise<object>}
 */
export async function getReport(jobId) {
  const res = await fetch(`${API_BASE}/api/report/${jobId}`);
  if (!res.ok) throw new Error('Report not found');
  return res.json();
}

/**
 * Fetch the pre-computed demo report.
 * @returns {Promise<object>}
 */
export async function getDemoReport() {
  const res = await fetch(`${API_BASE}/api/demo-report`);
  if (!res.ok) throw new Error('Demo report not available');
  return res.json();
}
