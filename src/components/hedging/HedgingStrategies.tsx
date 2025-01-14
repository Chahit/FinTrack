'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';

const strategies = [
  {
    id: 1,
    title: 'Covered Call Strategy',
    description: 'Generate income while holding long positions',
    roi: 12.5,
    risk: 'Low',
    cost: 0.5,
    defaultHedgeRatio: 50,
  },
  {
    id: 2,
    title: 'Protective Put Strategy',
    description: 'Insurance for your portfolio',
    roi: 8.2,
    risk: 'Medium',
    cost: 1.2,
    defaultHedgeRatio: 40,
  },
  {
    id: 3,
    title: 'Collar Strategy',
    description: 'Combined protection with income generation',
    roi: 6.8,
    risk: 'Low',
    cost: 0.8,
    defaultHedgeRatio: 60,
  },
  {
    id: 4,
    title: 'Delta Hedging',
    description: 'Dynamic hedging based on price movement',
    roi: 15.3,
    risk: 'High',
    cost: 2.0,
    defaultHedgeRatio: 75,
  },
];

export function HedgingStrategies() {
  const [selectedSort, setSelectedSort] = useState('roi');
  const [hedgeRatios, setHedgeRatios] = useState<Record<number, number>>(
    Object.fromEntries(strategies.map(s => [s.id, s.defaultHedgeRatio]))
  );

  useEffect(() => {
    gsap.from('.strategy-card', {
      duration: 0.8,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.hedging-section',
        start: 'top center+=100',
      },
    });
  }, []);

  const handleHedgeRatioChange = (strategyId: number, value: number[]): void => {
    setHedgeRatios(prev => ({ ...prev, [strategyId]: value[0] }));
  };

  const sortedStrategies = [...strategies].sort((a, b) => {
    switch (selectedSort) {
      case 'roi':
        return b.roi - a.roi;
      case 'risk':
        return a.risk.localeCompare(b.risk);
      case 'cost':
        return a.cost - b.cost;
      default:
        return 0;
    }
  });

  return (
    <section className="hedging-section py-16 px-4 bg-black/50 backdrop-blur-lg">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Hedging Strategies
          </h2>
          <div className="flex gap-2">
            <Button
              variant={selectedSort === 'roi' ? 'default' : 'outline'}
              onClick={() => setSelectedSort('roi')}
              size="sm"
            >
              Sort by ROI
            </Button>
            <Button
              variant={selectedSort === 'risk' ? 'default' : 'outline'}
              onClick={() => setSelectedSort('risk')}
              size="sm"
            >
              Sort by Risk
            </Button>
            <Button
              variant={selectedSort === 'cost' ? 'default' : 'outline'}
              onClick={() => setSelectedSort('cost')}
              size="sm"
            >
              Sort by Cost
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedStrategies.map((strategy) => (
            <Card 
              key={strategy.id}
              className="strategy-card p-6 hover:scale-105 transition-transform duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{strategy.title}</h3>
                <Badge variant={
                  strategy.risk === 'Low' ? 'secondary' :
                  strategy.risk === 'Medium' ? 'default' : 'destructive'
                }>
                  {strategy.risk}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-400 mb-4">{strategy.description}</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Expected ROI</span>
                    <span className="text-green-500">+{strategy.roi}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(strategy.roi / 20) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Hedging Cost</span>
                    <span className="text-blue-500">{strategy.cost}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(strategy.cost / 3) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm mb-2 block">Hedge Ratio</label>
                  <Slider
                    value={[hedgeRatios[strategy.id]]}
                    onValueChange={(value) => handleHedgeRatioChange(strategy.id, value)}
                    min={0}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                  <div className="text-right text-sm text-gray-400">
                    {hedgeRatios[strategy.id]}%
                  </div>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                Apply Strategy
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
