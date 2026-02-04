import { useVersionCheck } from '../hooks/useVersionCheck';
import './UpdateBanner.css';

const UpdateBanner = () => {
  const { newVersionAvailable, refreshPage } = useVersionCheck();

  if (!newVersionAvailable) {
    return null;
  }

  return (
    <div className="update-banner">
      <div className="update-banner-content">
        <span className="update-icon">🔄</span>
        <span className="update-message">
          A new version of Perfessor is available!
        </span>
        <button className="update-button" onClick={refreshPage}>
          Refresh Now
        </button>
      </div>
    </div>
  );
};

export default UpdateBanner;
