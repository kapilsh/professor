// Color schemes for charts and visualizations

export const STEP_TIME_COLORS = {
  Kernel: '#4CAF50',       // Green
  Memcpy: '#2196F3',       // Blue
  Memset: '#00BCD4',       // Cyan
  Communication: '#9C27B0', // Purple
  Runtime: '#FF9800',      // Orange
  DataLoader: '#F44336',   // Red
  'CPU Exec': '#FFEB3B',   // Yellow
  Other: '#9E9E9E',        // Grey
};

export const CHART_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0',
  '#00BCD4', '#FFEB3B', '#FF5722', '#3F51B5', '#009688',
  '#8BC34A', '#FFC107', '#E91E63', '#673AB7', '#03A9F4',
];

export const SEVERITY_COLORS = {
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  success: '#4CAF50',
};

export const MEMORY_COLORS = {
  allocated: '#2196F3',    // Blue
  reserved: '#FF9800',     // Orange
};

export const TENSOR_CORE_COLORS = {
  used: '#4CAF50',         // Green
  notUsed: '#9E9E9E',      // Grey
  eligible: '#FF9800',     // Orange
};

export const getChartColor = (index) => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

export const getStepTimeColor = (category) => {
  return STEP_TIME_COLORS[category] || STEP_TIME_COLORS.Other;
};

export const getSeverityColor = (severity) => {
  return SEVERITY_COLORS[severity] || SEVERITY_COLORS.info;
};
