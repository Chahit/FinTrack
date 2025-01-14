'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { Card } from '../ui/card';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';

const dummyData = Array.from({ length: 50 }, () => ({
  risk: Math.random() * 100,
  return: Math.random() * 100,
  size: Math.random() * 1000,
  name: 'Asset',
}));

export function RiskAnalysis() {
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [timeHorizon, setTimeHorizon] = useState('medium');
  const [selectedMetric, setSelectedMetric] = useState('var');

  useEffect(() => {
    gsap.from('.risk-card', {
      duration: 0.8,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.risk-section',
        start: 'top center+=100',
      },
    });
  }, []);

  const handleTimeHorizonChange = (value: string): void => {
    setTimeHorizon(value);
  };

  return (
    <section className="risk-section py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Risk Analysis Tools
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Controls */}
          <Card className="risk-card p-6 lg:col-span-1">
            <div className="space-y-6">
              <div>
                <label className="text-sm mb-2 block">Risk Tolerance</label>
                <Slider
                  value={[riskTolerance]}
                  onValueChange={(value) => setRiskTolerance(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="mb-2"
                />
                <div className="text-right text-sm text-gray-400">
                  {riskTolerance}%
                </div>
              </div>

              <div>
                <label className="text-sm block mb-2">Time Horizon</label>
                <Select value={timeHorizon} onValueChange={handleTimeHorizonChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short Term (&lt; 1 year)</SelectItem>
                    <SelectItem value="medium">Medium Term (1-3 years)</SelectItem>
                    <SelectItem value="long">Long Term (&gt; 3 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm mb-2 block">Risk Metric</label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="var">Value at Risk (VaR)</SelectItem>
                    <SelectItem value="volatility">Volatility</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="sharpe">Sharpe Ratio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Main Content */}
          <Card className="risk-card p-6 lg:col-span-3">
            <Tabs defaultValue="scatter">
              <TabsList className="mb-4">
                <TabsTrigger value="scatter">Risk-Return Analysis</TabsTrigger>
                <TabsTrigger value="heatmap">Risk Heatmap</TabsTrigger>
                <TabsTrigger value="stress">Stress Test</TabsTrigger>
              </TabsList>

              <TabsContent value="scatter" className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis 
                      type="number" 
                      dataKey="risk" 
                      name="Risk" 
                      stroke="#666"
                      label={{ value: 'Risk', position: 'bottom', fill: '#666' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="return" 
                      name="Return" 
                      stroke="#666"
                      label={{ value: 'Return', angle: -90, position: 'left', fill: '#666' }}
                    />
                    <ZAxis type="number" dataKey="size" range={[50, 400]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                      }}
                    />
                    <Scatter data={dummyData} fill="#8884d8">
                      {dummyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={`hsl(${(entry.risk + entry.return) * 1.2}, 70%, 50%)`}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="heatmap">
                <div className="h-[500px] flex items-center justify-center text-gray-400">
                  Heatmap visualization coming soon...
                </div>
              </TabsContent>

              <TabsContent value="stress">
                <div className="h-[500px] flex items-center justify-center text-gray-400">
                  Stress test simulation coming soon...
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </section>
  );
}
