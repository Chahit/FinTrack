'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  pe: number;
}

export function MarketScreener() {
  const [filters, setFilters] = useState({
    marketCap: 'all',
    sector: 'all',
    priceRange: 'all'
  });

  const stocks: Stock[] = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 178.90,
      change: 1.25,
      volume: 76543210,
      marketCap: 2900,
      pe: 28.5
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 378.56,
      change: 0.75,
      volume: 45678901,
      marketCap: 2800,
      pe: 32.1
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 142.34,
      change: -0.50,
      volume: 34567890,
      marketCap: 1800,
      pe: 25.4
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 154.23,
      change: -1.20,
      volume: 23456789,
      marketCap: 1600,
      pe: 60.8
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 495.67,
      change: 2.30,
      volume: 12345678,
      marketCap: 1200,
      pe: 85.3
    }
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Select
            value={filters.marketCap}
            onValueChange={(value) => setFilters({ ...filters, marketCap: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Market Cap" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Market Caps</SelectItem>
              <SelectItem value="large">Large Cap ($10B+)</SelectItem>
              <SelectItem value="mid">Mid Cap ($2B-$10B)</SelectItem>
              <SelectItem value="small">Small Cap (Under $2B)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select
            value={filters.sector}
            onValueChange={(value) => setFilters({ ...filters, sector: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select
            value={filters.priceRange}
            onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="high">Above $100</SelectItem>
              <SelectItem value="mid">$20-$100</SelectItem>
              <SelectItem value="low">Below $20</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="min-w-[100px]">
          Filter
        </Button>
      </div>

      {/* Results Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-right">Volume</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">P/E Ratio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock) => (
              <TableRow key={stock.symbol}>
                <TableCell className="font-medium">{stock.symbol}</TableCell>
                <TableCell>{stock.name}</TableCell>
                <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                <TableCell className={`text-right ${
                  stock.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stock.change > 0 ? '+' : ''}{stock.change}%
                </TableCell>
                <TableCell className="text-right">
                  {(stock.volume / 1e6).toFixed(1)}M
                </TableCell>
                <TableCell className="text-right">
                  ${stock.marketCap}B
                </TableCell>
                <TableCell className="text-right">{stock.pe}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
