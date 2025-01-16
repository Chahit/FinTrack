"use client";

import { useTheme } from 'next-themes';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { Card } from './card';
import { cn } from '@/lib/utils';

export type ChartData = {
  name: string;
  value: number;
  [key: string]: any;
};

interface ChartProps {
  data: ChartData[];
  type?: 'line' | 'area' | 'bar';
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  height?: number;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  customColors?: string[];
}

export function Chart({
  data,
  type = 'line',
  title,
  xAxisKey = 'name',
  yAxisKey = 'value',
  height = 300,
  className,
  showGrid = true,
  showLegend = true,
  customColors
}: ChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const defaultColors = isDark 
    ? ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    : ['#2563eb', '#059669', '#d97706', '#dc2626'];

  const colors = customColors || defaultColors;

  const renderChart = () => {
    const commonProps = {
      data,
      height,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis dataKey={xAxisKey} stroke={textColor} />
            <YAxis stroke={textColor} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff' }} />
            {showLegend && <Legend />}
            <Area type="monotone" dataKey={yAxisKey} stroke={colors[0]} fill={colors[0]} fillOpacity={0.3} />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis dataKey={xAxisKey} stroke={textColor} />
            <YAxis stroke={textColor} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff' }} />
            {showLegend && <Legend />}
            <Bar dataKey={yAxisKey} fill={colors[0]} />
          </BarChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis dataKey={xAxisKey} stroke={textColor} />
            <YAxis stroke={textColor} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff' }} />
            {showLegend && <Legend />}
            <Line type="monotone" dataKey={yAxisKey} stroke={colors[0]} dot={false} />
          </LineChart>
        );
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </Card>
  );
} 