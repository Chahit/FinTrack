'use client';

import { useTheme } from 'next-themes';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartData {
  name: string;
  [key: string]: any;
}

interface LineChartProps {
  data: ChartData[];
  categories: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  height?: number;
  colors?: string[];
}

export function LineChart({
  data,
  categories,
  valueFormatter = (value) => value.toString(),
  showLegend = true,
  height = 400,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
}: LineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="name"
          stroke={textColor}
          tick={{ fill: textColor }}
          tickLine={{ stroke: textColor }}
        />
        <YAxis
          stroke={textColor}
          tick={{ fill: textColor }}
          tickLine={{ stroke: textColor }}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '6px',
          }}
          formatter={(value: number) => [valueFormatter(value), '']}>
        </Tooltip>
        {showLegend && (
          <Legend
            wrapperStyle={{
              color: textColor,
            }}
          />
        )}
        {categories.map((category, index) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
