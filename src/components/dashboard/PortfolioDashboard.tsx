'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Toggle } from '../ui/toggle';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dummyData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
];

export function PortfolioDashboard() {
  useEffect(() => {
    gsap.from('.dashboard-card', {
      duration: 0.8,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.dashboard-section',
        start: 'top center+=100',
      },
    });
  }, []);

  return (
    <section className="dashboard-section py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Portfolio Dashboard
        </h2>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select defaultValue="daily">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Toggle defaultPressed>Stocks</Toggle>
            <Toggle>Crypto</Toggle>
            <Toggle>ETFs</Toggle>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Portfolio Value Card */}
          <Card className="dashboard-card p-6 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-blue-500/20">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Portfolio Value</h3>
                <p className="text-2xl font-bold">$128,459.32</p>
              </div>
            </div>
            <div className="text-sm text-green-500">+2.5% from last month</div>
          </Card>

          {/* Risk Metrics Card */}
          <Card className="dashboard-card p-6 hover:scale-105 transition-transform duration-200">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Risk Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>VaR (95%)</span>
                  <span className="text-red-500">-$2,341</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div className="h-full w-3/4 bg-red-500 rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Beta</span>
                  <span>1.2</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div className="h-full w-4/5 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Sharpe Ratio</span>
                  <span className="text-green-500">1.8</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div className="h-full w-2/3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </Card>

          {/* P&L Summary Card */}
          <Card className="dashboard-card p-6 hover:scale-105 transition-transform duration-200">
            <h3 className="text-sm font-medium text-gray-400 mb-4">P&L Summary</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dummyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
