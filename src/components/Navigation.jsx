import { useEffect } from 'react';
import useTraceStore from '../store/traceStore';
import './Navigation.css';

const Navigation = () => {
  const { currentView, setView } = useTraceStore();

  const tabs = [
    { id: 'overview', label: 'Overall', key: '1' },
    { id: 'operators', label: 'Operators', key: '2' },
    { id: 'kernels', label: 'Kernels', key: '3' },
    { id: 'trace', label: 'Trace', key: '4' },
    { id: 'memory', label: 'Memory', key: '5' },
    { id: 'modules', label: 'Modules', key: '6' },
  ];

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      const tab = tabs.find(t => t.key === e.key);
      if (tab) {
        setView(tab.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setView]);

  return (
    <nav className="navigation">
      <div className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${currentView === tab.id ? 'active' : ''}`}
            onClick={() => setView(tab.id)}
          >
            {tab.label}
            <span className="keyboard-hint">{tab.key}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
