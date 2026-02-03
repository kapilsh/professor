import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import useTraceStore from '../../store/traceStore';
import Card from '../common/Card';
import { getStepTimeColor } from '../../utils/colorSchemes';
import { formatDuration } from '../../utils/formatters';

const StepTimeBreakdown = () => {
  const { stepTimeBreakdown } = useTraceStore();

  if (!stepTimeBreakdown || stepTimeBreakdown.length === 0) {
    return null;
  }

  const data = stepTimeBreakdown
    .filter(item => item.time > 0)
    .sort((a, b) => b.time - a.time); // Sort by time descending

  if (data.length === 0) {
    return null;
  }

  return (
    <Card title="Step Time Breakdown">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            stroke="#9ca3af"
            label={{ value: 'Time', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#9ca3af"
            width={110}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#f3f4f6'
            }}
            formatter={(value, name, props) => [
              `${formatDuration(value)} (${props.payload.percentage.toFixed(1)}%)`,
              'Time'
            ]}
          />
          <Bar dataKey="time" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getStepTimeColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default StepTimeBreakdown;
