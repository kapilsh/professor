// Formatting utilities for display

export const formatDuration = (microseconds) => {
  if (!microseconds || microseconds === 0) return '0 μs';

  const ms = microseconds / 1000;
  const s = ms / 1000;

  if (s >= 1) {
    return `${s.toFixed(3)} s`;
  } else if (ms >= 1) {
    return `${ms.toFixed(3)} ms`;
  } else {
    return `${microseconds.toFixed(0)} μs`;
  }
};

export const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';

  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;

  if (gb >= 1) {
    return `${gb.toFixed(2)} GB`;
  } else if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  } else if (kb >= 1) {
    return `${kb.toFixed(2)} KB`;
  } else {
    return `${bytes.toFixed(0)} B`;
  }
};

export const formatNumber = (num) => {
  if (!num && num !== 0) return '-';
  return num.toLocaleString();
};

export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0.0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const formatAddress = (address) => {
  if (!address) return '-';
  if (typeof address === 'number') {
    return `0x${address.toString(16)}`;
  }
  return address;
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp && timestamp !== 0) return '-';
  return formatDuration(timestamp);
};

export const truncateString = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};
