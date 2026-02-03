import { useState, useCallback } from 'react';
import useTraceStore from '../store/traceStore';
import { processTraceData } from '../utils/traceDataProcessor';
import { generateRecommendations } from '../utils/recommendationsEngine';
import './FileUploader.css';

const FileUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const { addTrace, setLoading, setError } = useTraceStore();

  const handleFile = useCallback(async (file) => {
    if (!file) return;

    if (!file.name.endsWith('.json') && !file.name.includes('.trace.json')) {
      setError('Please upload a JSON trace file (.json or .pt.trace.json)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const rawData = JSON.parse(text);

      const processed = processTraceData(rawData);

      const recommendations = generateRecommendations(processed);
      processed.recommendations = recommendations;

      // Add trace to the collection
      addTrace({ rawData, fileName: file.name }, processed);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process trace file');
      setLoading(false);
    }
  }, [addTrace, setLoading, setError]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="file-uploader-container">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="drop-zone-content">
          <svg
            className="upload-icon"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>

          <h2>Upload PyTorch Profiler Trace</h2>
          <p className="subtitle">
            Drag and drop your trace JSON file here, or click to browse
          </p>

          <input
            type="file"
            id="file-input"
            accept=".json"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />

          <label htmlFor="file-input" className="browse-button">
            Browse Files
          </label>

          <p className="file-info">
            Supports Chrome Trace Event Format (JSON)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
