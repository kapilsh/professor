import useTraceStore from '../../store/traceStore';
import Card from '../common/Card';
import { formatBytes, formatDuration } from '../../utils/formatters';
import './MemoryView.css';

const MemoryView = () => {
  const { memoryEvents } = useTraceStore();

  if (!memoryEvents || memoryEvents.length === 0) {
    return (
      <div className="view-container">
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
            <h3>No Memory Data Available</h3>
            <p>This trace does not contain memory allocation information.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
              To capture memory events, profile with memory tracking enabled:
            </p>
            <pre style={{
              background: '#1f2937',
              padding: '1rem',
              borderRadius: '6px',
              textAlign: 'left',
              marginTop: '1rem',
              fontSize: '0.8rem'
            }}>
              {`prof = torch.profiler.profile(
  record_shapes=True,
  profile_memory=True,  # Enable this
  with_stack=True
)`}
            </pre>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="memory-view">
      <Card title="Memory Events">
        <div className="memory-table-container">
          <table className="memory-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {memoryEvents.slice(0, 100).map((event, index) => (
                <tr key={index}>
                  <td>{formatDuration(event.timestamp)}</td>
                  <td>{event.name}</td>
                  <td>{formatBytes(event.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {memoryEvents.length > 100 && (
          <div className="memory-note">
            Showing first 100 of {memoryEvents.length} memory events
          </div>
        )}
      </Card>
    </div>
  );
};

export default MemoryView;
