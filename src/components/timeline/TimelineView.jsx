import { useState, useMemo, useEffect } from 'react';
import useTraceStore from '../../store/traceStore';
import FlameGraph from './FlameGraph';
import { formatDuration } from '../../utils/traceDataProcessor';

const TimelineView = () => {
  const { processedData, selectedOperation, setSelectedOperation } = useTraceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const timelineEvents = useMemo(() => {
    if (!processedData) return [];
    return processedData.events.filter(e => e.ph === 'X' && e.dur !== undefined);
  }, [processedData]);

  const timeRange = useMemo(() => {
    if (timelineEvents.length === 0) return { start: 0, end: 1, duration: 1 };

    const start = Math.min(...timelineEvents.map(e => e.ts));
    const end = Math.max(...timelineEvents.map(e => e.ts + e.dur));
    return { start, end, duration: end - start };
  }, [timelineEvents]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedOperation(event);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSearchInput('');
    setSelectedEvent(null);
    setSelectedOperation(null);
  };

  if (!processedData) {
    return <div className="view-container">No data available</div>;
  }

  return (
    <div className="view-container timeline-view">
      <div className="timeline-header">
        <div className="timeline-controls">
          <input
            type="text"
            placeholder="Search operations..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button onClick={handleReset} className="reset-button">
            Reset View
          </button>
        </div>

        <div className="timeline-info">
          <div className="info-item">
            <span className="info-label">Time Range:</span>
            <span className="info-value">
              {formatDuration(timeRange.start)} - {formatDuration(timeRange.end)}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Total Duration:</span>
            <span className="info-value">{formatDuration(timeRange.duration)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Events:</span>
            <span className="info-value">{timelineEvents.length.toLocaleString()}</span>
          </div>
        </div>

        <div className="timeline-help">
          <div className="help-item">Scroll to zoom</div>
          <div className="help-item">Drag to pan</div>
          <div className="help-item">Click to select</div>
        </div>
      </div>

      <div className="flame-graph-wrapper">
        <FlameGraph
          events={timelineEvents}
          onSelectEvent={handleSelectEvent}
          selectedEvent={selectedEvent}
          searchTerm={searchTerm}
        />
      </div>

      {selectedEvent && (
        <div className="event-detail-panel">
          <div className="detail-header">
            <h3>Event Details</h3>
            <button onClick={() => {
              setSelectedEvent(null);
              setSelectedOperation(null);
            }} className="close-button">
              ×
            </button>
          </div>
          <div className="detail-content">
            <div className="detail-grid">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedEvent.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{selectedEvent.cat || 'unknown'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{formatDuration(selectedEvent.dur)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Self Time:</span>
                <span className="detail-value">{formatDuration(selectedEvent.selfTime || selectedEvent.dur)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Start Time:</span>
                <span className="detail-value">{formatDuration(selectedEvent.ts)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">End Time:</span>
                <span className="detail-value">{formatDuration(selectedEvent.ts + selectedEvent.dur)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Depth:</span>
                <span className="detail-value">{selectedEvent.depth || 0}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Thread ID:</span>
                <span className="detail-value">{selectedEvent.tid}</span>
              </div>
            </div>

            {selectedEvent.args && Object.keys(selectedEvent.args).length > 0 && (
              <div className="args-section">
                <h4>Arguments</h4>
                <div className="args-content">
                  {Object.entries(selectedEvent.args).map(([key, value]) => (
                    <div key={key} className="detail-row">
                      <span className="detail-label">{key}:</span>
                      <span className="detail-value">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .timeline-view {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 120px);
        }

        .timeline-header {
          background: #1f2937;
          border-bottom: 1px solid #374151;
          padding: 1.5rem;
        }

        .timeline-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .search-input {
          flex: 1;
          padding: 0.5rem 1rem;
          background: #374151;
          border: 1px solid #4b5563;
          border-radius: 6px;
          color: #f3f4f6;
          font-size: 0.875rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #6366f1;
        }

        .reset-button {
          padding: 0.5rem 1.5rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
        }

        .reset-button:hover {
          background: #4f46e5;
        }

        .timeline-info {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .info-item {
          display: flex;
          gap: 0.5rem;
        }

        .info-label {
          font-size: 0.875rem;
          color: #9ca3af;
          font-weight: 500;
        }

        .info-value {
          font-size: 0.875rem;
          color: #f3f4f6;
          font-family: monospace;
        }

        .timeline-help {
          display: flex;
          gap: 1.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .help-item::before {
          content: '•';
          margin-right: 0.5rem;
          color: #6366f1;
        }

        .flame-graph-wrapper {
          flex: 1;
          min-height: 0;
          background: #111827;
        }

        .event-detail-panel {
          background: #1f2937;
          border-top: 1px solid #374151;
          padding: 1.5rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .detail-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #f3f4f6;
        }

        .close-button {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .close-button:hover {
          background: #374151;
          color: #f3f4f6;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .detail-label {
          font-size: 0.875rem;
          color: #9ca3af;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.875rem;
          color: #f3f4f6;
          font-family: monospace;
          word-break: break-word;
          text-align: right;
        }

        .args-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #374151;
        }

        .args-section h4 {
          margin: 0 0 0.75rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #f3f4f6;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .args-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default TimelineView;
