import useTraceStore from '../../store/traceStore';
import Card from '../common/Card';
import './ModuleView.css';

const ModuleView = () => {
  const { modules } = useTraceStore();

  if (!modules || modules.length === 0) {
    return (
      <div className="view-container">
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
            <h3>No Module Data Available</h3>
            <p>This trace does not contain PyTorch module hierarchy information.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
              Module information is typically included when profiling with record_shapes=True
              and capturing the forward pass of nn.Module instances.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="module-view">
      <Card title="PyTorch Modules">
        <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
          Hierarchical view of PyTorch modules detected in the trace.
        </p>
        <div className="modules-list">
          {modules.map((module, index) => (
            <div key={index} className="module-item">
              <div className="module-header">
                <span className="module-name">{module.name}</span>
                <span className="module-type">{module.type}</span>
              </div>
              <div className="module-stats">
                <span>Occurrences: {module.occurrences}</span>
                <span>Operators: {module.operatorCount}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ModuleView;
