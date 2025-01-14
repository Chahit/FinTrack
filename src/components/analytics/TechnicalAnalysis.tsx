'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function TechnicalAnalysis() {
  // Sample data for technical indicators
  const data = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2024, 0, i + 1).toLocaleDateString(),
    price: 100 + Math.sin(i * 0.5) * 20 + Math.random() * 5,
    rsi: 50 + Math.sin(i * 0.3) * 20,
    macd: Math.sin(i * 0.2) * 2,
    signal: Math.sin((i + 2) * 0.2) * 2,
    volume: 1000000 + Math.random() * 500000
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>RSI (14)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data[data.length - 1].rsi.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {data[data.length - 1].rsi > 70 ? 'Overbought' : 
               data[data.length - 1].rsi < 30 ? 'Oversold' : 'Neutral'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>MACD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data[data.length - 1].macd.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {data[data.length - 1].macd > data[data.length - 1].signal ? 'Bullish' : 'Bearish'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data[data.length - 1].volume / 1e6).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              {data[data.length - 1].volume > data[data.length - 2].volume ? 'Increasing' : 'Decreasing'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rsi" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rsi">RSI</TabsTrigger>
          <TabsTrigger value="macd">MACD</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
        </TabsList>

        <TabsContent value="rsi">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="rsi" stroke="#2563eb" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="macd">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="macd" stroke="#2563eb" />
                    <Line type="monotone" dataKey="signal" stroke="#dc2626" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="volume" stroke="#2563eb" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
