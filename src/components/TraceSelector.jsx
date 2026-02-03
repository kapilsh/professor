import { useState } from 'react';
import useTraceStore from '../store/traceStore';
import './TraceSelector.css';

const TraceSelector = () => {
  const { traces, activeTraceId, setActiveTrace, removeTrace } = useTraceStore();
  const [isOpen, setIsOpen] = useState(false);

  if (traces.length === 0) {
    return null;
  }

  const activeTrace = traces.find(t => t.id === activeTraceId);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (microseconds) => {
    const ms = microseconds / 1000;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const handleTraceSelect = (traceId) => {
    setActiveTrace(traceId);
    setIsOpen(false);
  };

  const handleTraceRemove = (e, traceId) => {
    e.stopPropagation();
    removeTrace(traceId);
  };

  return (
    <div className="trace-selector">
      <button
        className="trace-selector-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="trace-selector-label">
          <span className="trace-count">{traces.length} trace{traces.length !== 1 ? 's' : ''}</span>
          <span className="trace-name">{activeTrace?.fileName || 'No trace selected'}</span>
        </div>
        <svg
          className={`chevron ${isOpen ? 'open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 6 8 10 12 6" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="trace-selector-backdrop" onClick={() => setIsOpen(false)} />
          <div className="trace-selector-dropdown">
            {traces.map((trace) => (
              <div
                key={trace.id}
                className={`trace-item ${trace.id === activeTraceId ? 'active' : ''}`}
                onClick={() => handleTraceSelect(trace.id)}
              >
                <div className="trace-item-header">
                  <span className="trace-item-name" title={trace.fileName}>
                    {trace.fileName}
                  </span>
                  <button
                    className="trace-item-remove"
                    onClick={(e) => handleTraceRemove(e, trace.id)}
                    title="Remove trace"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="trace-item-meta">
                  <span>{formatDate(trace.uploadedAt)}</span>
                  <span>•</span>
                  <span>{formatDuration(trace.summary?.totalDuration || 0)}</span>
                  <span>•</span>
                  <span>{trace.operators?.length || 0} ops</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TraceSelector;
