import useTraceStore from '../../store/traceStore';
import Card from '../common/Card';
import { formatDuration, formatNumber } from '../../utils/formatters';

const SummaryCards = () => {
  const { summary } = useTraceStore();

  if (!summary) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
      <Card>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
            Total Duration
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#4CAF50' }}>
            {formatDuration(summary.totalDuration)}
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
            Total Events
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2196F3' }}>
            {formatNumber(summary.eventCount)}
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
            Unique Operators
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#FF9800' }}>
            {formatNumber(summary.operatorCount)}
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
            GPU Kernels
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#9C27B0' }}>
            {formatNumber(summary.kernelCount)}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SummaryCards;
