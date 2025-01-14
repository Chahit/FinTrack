'use client';

import { useTheme } from 'next-themes';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: '2023-01', value: 100000 },
  { date: '2023-02', value: 105000 },
  { date: '2023-03', value: 98000 },
  { date: '2023-04', value: 110000 },
  { date: '2023-05', value: 115000 },
  { date: '2023-06', value: 112000 },
  { date: '2023-07', value: 120000 },
  { date: '2023-08', value: 125000 },
  { date: '2023-09', value: 122000 },
  { date: '2023-10', value: 130000 },
  { date: '2023-11', value: 135000 },
  { date: '2023-12', value: 140000 },
];

export function PortfolioChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#eee'} />
        <XAxis 
          dataKey="date" 
          stroke={isDark ? '#888' : '#666'}
          tick={{ fill: isDark ? '#888' : '#666' }}
        />
        <YAxis 
          stroke={isDark ? '#888' : '#666'}
          tick={{ fill: isDark ? '#888' : '#666' }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
            border: `1px solid ${isDark ? '#333' : '#ddd'}`,
            color: isDark ? '#fff' : '#000'
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
