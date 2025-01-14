'use client';

import { useTheme } from 'next-themes';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Stocks', value: 45 },
  { name: 'Bonds', value: 25 },
  { name: 'Crypto', value: 15 },
  { name: 'Cash', value: 10 },
  { name: 'Other', value: 5 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10B981', '#6366F1'];

export function AllocationChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
            border: `1px solid ${isDark ? '#333' : '#ddd'}`,
            color: isDark ? '#fff' : '#000'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span style={{ color: isDark ? '#fff' : '#000' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
