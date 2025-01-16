'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from './card';

interface InteractiveChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  tooltipFormatter?: (value: number) => string;
}

export function InteractiveChart({
  data,
  height = 400,
  tooltipFormatter = (value) => value.toString(),
}: InteractiveChartProps) {
  const [focusBar, setFocusBar] = useState<number | null>(null);

  return (
    <Card className="p-6">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          onMouseMove={(state) => {
            if (state.activeTooltipIndex !== undefined) {
              setFocusBar(state.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => setFocusBar(null)}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'hsl(var(--foreground))' }}
            tickLine={{ stroke: 'hsl(var(--foreground))' }}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--foreground))' }}
            tickLine={{ stroke: 'hsl(var(--foreground))' }}
            tickFormatter={tooltipFormatter}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={tooltipFormatter}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorValue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
} 