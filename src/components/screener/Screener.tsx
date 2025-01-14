"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, ArrowUpDown, Download } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume: number;
  change: number;
  pe: number;
  sector: string;
}

interface FilterCriteria {
  priceRange: [number, number];
  marketCapRange: [number, number];
  sectors: string[];
  minVolume: number;
  minChange: number;
}

export function Screener() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filters, setFilters] = useState<FilterCriteria>({
    priceRange: [0, 1000],
    marketCapRange: [0, 1000000000000],
    sectors: [],
    minVolume: 0,
    minChange: -100,
  });
  const [sortBy, setSortBy] = useState<keyof Asset>('marketCap');
  const [sortDesc, setSortDesc] = useState(true);

  const sectors = [
    'Technology',
    'Healthcare',
    'Finance',
    'Consumer',
    'Energy',
    'Materials',
    'Industrial',
    'Utilities',
    'Real Estate',
  ];

  const toggleSector = (sector: string) => {
    setFilters(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector],
    }));
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const handleSort = (key: keyof Asset) => {
    if (sortBy === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(key);
      setSortDesc(true);
    }
  };

  const filteredAssets = assets
    .filter(asset => 
      asset.price >= filters.priceRange[0] &&
      asset.price <= filters.priceRange[1] &&
      asset.marketCap >= filters.marketCapRange[0] &&
      asset.marketCap <= filters.marketCapRange[1] &&
      asset.volume >= filters.minVolume &&
      asset.change >= filters.minChange &&
      (filters.sectors.length === 0 || filters.sectors.includes(asset.sector))
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return sortDesc ? 
        (bValue as number) - (aValue as number) :
        (aValue as number) - (bValue as number);
    });

  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Asset Screener
        </h2>
        <button
          onClick={() => {/* Export to CSV */}}
          className="btn-secondary"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Results
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="font-medium">Price Range</h3>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={filters.priceRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
            max={1000}
            step={1}
          >
            <Slider.Track className="bg-background/50 relative grow rounded-full h-[3px]">
              <Slider.Range className="absolute bg-primary rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-primary rounded-full hover:bg-primary/80 focus:outline-none" />
            <Slider.Thumb className="block w-5 h-5 bg-primary rounded-full hover:bg-primary/80 focus:outline-none" />
          </Slider.Root>
          <div className="flex justify-between text-sm text-gray-400">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Market Cap</h3>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={filters.marketCapRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, marketCapRange: value as [number, number] }))}
            max={1000000000000}
            step={1000000}
          >
            <Slider.Track className="bg-background/50 relative grow rounded-full h-[3px]">
              <Slider.Range className="absolute bg-primary rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-primary rounded-full hover:bg-primary/80 focus:outline-none" />
            <Slider.Thumb className="block w-5 h-5 bg-primary rounded-full hover:bg-primary/80 focus:outline-none" />
          </Slider.Root>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatNumber(filters.marketCapRange[0])}</span>
            <span>{formatNumber(filters.marketCapRange[1])}</span>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">Sectors</h3>
          <div className="flex flex-wrap gap-2">
            {sectors.map(sector => (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.sectors.includes(sector)
                    ? 'bg-primary text-white'
                    : 'bg-background/50 text-gray-400 hover:text-white'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Minimum Volume</h3>
            <input
              type="number"
              value={filters.minVolume}
              onChange={(e) => setFilters(prev => ({ ...prev, minVolume: Number(e.target.value) }))}
              className="w-full bg-background/50 border border-border rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">Minimum Change %</h3>
            <input
              type="number"
              value={filters.minChange}
              onChange={(e) => setFilters(prev => ({ ...prev, minChange: Number(e.target.value) }))}
              className="w-full bg-background/50 border border-border rounded-lg px-4 py-2"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Symbol', 'Name', 'Price', 'Market Cap', 'Volume', 'Change', 'P/E', 'Sector'].map(header => (
                <th
                  key={header}
                  className="px-4 py-2 text-left font-medium text-gray-400"
                  onClick={() => handleSort(header.toLowerCase().replace(/\s/g, '') as keyof Asset)}
                >
                  <div className="flex items-center gap-2 cursor-pointer hover:text-white">
                    {header}
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset, index) => (
              <motion.tr
                key={asset.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border hover:bg-background/50"
              >
                <td className="px-4 py-2 font-medium">{asset.symbol}</td>
                <td className="px-4 py-2">{asset.name}</td>
                <td className="px-4 py-2">${asset.price.toFixed(2)}</td>
                <td className="px-4 py-2">{formatNumber(asset.marketCap)}</td>
                <td className="px-4 py-2">{formatNumber(asset.volume)}</td>
                <td className={`px-4 py-2 ${
                  asset.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                </td>
                <td className="px-4 py-2">{asset.pe.toFixed(2)}</td>
                <td className="px-4 py-2">{asset.sector}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
