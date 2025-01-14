'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function MarketSentiment() {
  const sentimentData = {
    fearAndGreed: 65,
    bullishPercent: 75,
    bearishPercent: 25,
    volatilityIndex: 18,
    putCallRatio: 0.85,
    indicators: [
      { name: "RSI", value: 58, status: "Neutral" },
      { name: "MACD", value: 1.2, status: "Bullish" },
      { name: "Moving Averages", value: 8, status: "Bullish" },
      { name: "Volume", value: 1.5, status: "Above Average" },
    ]
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Market Sentiment Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Fear & Greed Index</span>
                <span className="text-sm font-medium">{sentimentData.fearAndGreed}</span>
              </div>
              <Progress value={sentimentData.fearAndGreed} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Bullish Sentiment</span>
                <span className="text-sm font-medium">{sentimentData.bullishPercent}%</span>
              </div>
              <Progress value={sentimentData.bullishPercent} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">VIX</span>
                <span className="text-sm font-medium">{sentimentData.volatilityIndex}</span>
              </div>
              <Progress value={sentimentData.volatilityIndex * 2} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentimentData.indicators.map((indicator) => (
              <div key={indicator.name} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{indicator.name}</div>
                  <div className="text-sm text-muted-foreground">{indicator.status}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{indicator.value}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
