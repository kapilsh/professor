import useTraceStore from '../../store/traceStore';
import Card from '../common/Card';
import { getSeverityColor } from '../../utils/colorSchemes';

const PerformanceRecommendations = () => {
  const { recommendations, setView } = useTraceStore();

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const handleLinkClick = (link) => {
    if (link) {
      setView(link);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Card title="Performance Recommendations">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {recommendations.map((rec, index) => (
          <div
            key={index}
            style={{
              padding: '1rem',
              borderRadius: '6px',
              borderLeft: `4px solid ${getSeverityColor(rec.severity)}`,
              backgroundColor: '#1f2937',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{getSeverityIcon(rec.severity)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#f3f4f6', marginBottom: '0.5rem' }}>
                  {rec.title}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {rec.description}
                </div>
                <div style={{ color: '#e0e0e0', fontSize: '0.875rem' }}>
                  <strong>Suggestion:</strong> {rec.suggestion}
                </div>
                {rec.link && (
                  <button
                    onClick={() => handleLinkClick(rec.link)}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PerformanceRecommendations;
