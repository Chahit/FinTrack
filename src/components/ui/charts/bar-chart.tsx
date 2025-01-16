'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartData {
  name: string;
  value: number;
  category: string;
}

interface BarChartProps {
  data: BarChartData[];
  categories: string[];
  index?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function BarChart({
  data,
  categories,
  index = 'name',
  height = 300,
  valueFormatter = (value: number) => value.toString(),
}: BarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
            dy={10}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            dx={-10}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload) return null;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    {payload.map((item: any) => (
                      <div key={item.dataKey} className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {item.dataKey}
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {valueFormatter(item.value || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey="value"
              data={data.filter(d => d.category === category)}
              name={category}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
