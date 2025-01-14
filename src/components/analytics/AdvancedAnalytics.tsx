'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { Card } from '../ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import dynamic from 'next/dynamic';
import { 
  ResponsiveContainer, 
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from 'recharts';

const TradingViewWidget = dynamic(
  () => import('../TradingViewWidget'),
  { ssr: false }
);

// Dummy correlation matrix data
const correlationData = [
  { asset: 'SPY', correlations: [1, 0.7, 0.3, -0.2, 0.5] },
  { asset: 'QQQ', correlations: [0.7, 1, 0.4, -0.1, 0.6] },
  { asset: 'GLD', correlations: [0.3, 0.4, 1, 0.2, 0.3] },
  { asset: 'BTC', correlations: [-0.2, -0.1, 0.2, 1, -0.3] },
  { asset: 'AAPL', correlations: [0.5, 0.6, 0.3, -0.3, 1] },
];

const assets = ['SPY', 'QQQ', 'GLD', 'BTC', 'AAPL'];

// Transform correlation data for scatter plot
const transformedData = correlationData.flatMap((row, i) =>
  row.correlations.map((correlation, j) => ({
    x: j,
    y: i,
    value: correlation,
    name: `${row.asset} vs ${assets[j]}`
  }))
);

export default function AdvancedAnalytics() {
  useEffect(() => {
    gsap.from('.analytics-card', {
      duration: 0.8,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.analytics-section',
        start: 'top center+=100',
      },
    });
  }, []);

  const getCorrelationColor = (value: number) => {
    // Red for negative, Blue for positive correlations
    const hue = value > 0 ? 240 : 0;
    const saturation = Math.abs(value) * 100;
    return `hsl(${hue}, ${saturation}%, 50%)`;
  };

  return (
    <section className="analytics-section py-16 px-4 bg-black/50 backdrop-blur-lg">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Advanced Analytics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Correlation Matrix */}
          <Card className="analytics-card p-6">
            <h3 className="text-xl font-semibold mb-4">Correlation Matrix</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                >
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Asset"
                    ticks={[0, 1, 2, 3, 4]}
                    tickFormatter={(value) => assets[value]}
                    label={{ value: 'Assets', position: 'bottom', offset: 20 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Asset"
                    ticks={[0, 1, 2, 3, 4]}
                    tickFormatter={(value) => assets[value]}
                    label={{ value: 'Assets', angle: -90, position: 'left', offset: 20 }}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-black/90 p-2 rounded border border-gray-700">
                            <p className="text-white">{data.name}</p>
                            <p className="text-white">Correlation: {data.value.toFixed(2)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={transformedData}>
                    {transformedData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={getCorrelationColor(entry.value)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Stress Test Results */}
          <Card className="analytics-card p-6">
            <h3 className="text-xl font-semibold mb-4">Stress Test Results</h3>
            <Accordion type="single" collapsible>
              <AccordionItem value="market-crash">
                <AccordionTrigger>Market Crash Scenario (-20%)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Portfolio Impact</span>
                      <span className="text-red-500">-15.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VaR Change</span>
                      <span className="text-yellow-500">+45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recovery Time</span>
                      <span>8-12 months</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="interest-rates">
                <AccordionTrigger>Interest Rate Hike (+2%)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Portfolio Impact</span>
                      <span className="text-red-500">-8.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bond Yield Change</span>
                      <span className="text-green-500">+1.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sector Rotation</span>
                      <span>Moderate</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="currency">
                <AccordionTrigger>Currency Shock (USD +10%)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Portfolio Impact</span>
                      <span className="text-red-500">-5.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>International Exposure</span>
                      <span className="text-yellow-500">High Risk</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hedge Effectiveness</span>
                      <span className="text-green-500">75%</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Technical Analysis */}
          <Card className="analytics-card p-6 lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Technical Analysis</h3>
            <div className="h-[500px]">
              <TradingViewWidget />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
