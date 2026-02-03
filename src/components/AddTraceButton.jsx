import { useCallback, useRef } from 'react';
import useTraceStore from '../store/traceStore';
import { processTraceData } from '../utils/traceDataProcessor';
import { generateRecommendations } from '../utils/recommendationsEngine';
import './AddTraceButton.css';

const AddTraceButton = () => {
  const { addTrace, setLoading, setError } = useTraceStore();
  const fileInputRef = useRef(null);

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

      addTrace({ rawData, fileName: file.name }, processed);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process trace file');
      setLoading(false);
    }
  }, [addTrace, setLoading, setError]);

  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="add-trace-button-container">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      <button className="add-trace-button" onClick={handleClick}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Trace
      </button>
    </div>
  );
};

export default AddTraceButton;
