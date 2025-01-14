'use client';

import { useTheme } from 'next-themes';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { risk: 5, return: 8, name: 'Conservative' },
  { risk: 10, return: 12, name: 'Balanced' },
  { risk: 15, return: 15, name: 'Growth' },
  { risk: 20, return: 18, name: 'Aggressive' },
  { risk: 12, return: 14, name: 'Your Portfolio' },
];

export function RiskAnalysisChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#eee'} />
        <XAxis 
          type="number" 
          dataKey="risk" 
          name="Risk" 
          unit="%" 
          stroke={isDark ? '#888' : '#666'}
          tick={{ fill: isDark ? '#888' : '#666' }}
        />
        <YAxis 
          type="number" 
          dataKey="return" 
          name="Return" 
          unit="%" 
          stroke={isDark ? '#888' : '#666'}
          tick={{ fill: isDark ? '#888' : '#666' }}
        />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ 
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
            border: `1px solid ${isDark ? '#333' : '#ddd'}`,
            color: isDark ? '#fff' : '#000'
          }}
        />
        <Scatter 
          name="Portfolio" 
          data={data} 
          fill="hsl(var(--primary))"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
