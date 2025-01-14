'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { RiskAnalysisChart } from "@/components/charts/RiskAnalysisChart";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { cn } from "@/lib/utils";

interface Metric {
  label: string;
  value: string;
  change: number;
  info: string;
}

export default function AnalyticsPage() {
  const metrics: Metric[] = [
    {
      label: "Total Return",
      value: "+24.5%",
      change: 24.5,
      info: "Since inception"
    },
    {
      label: "Annual Return",
      value: "+12.8%",
      change: 12.8,
      info: "Last 12 months"
    },
    {
      label: "Sharpe Ratio",
      value: "1.85",
      change: 0.15,
      info: "Risk-adjusted return"
    },
    {
      label: "Beta",
      value: "0.92",
      change: -0.08,
      info: "Market correlation"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Performance Metrics */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Portfolio Analytics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader>
                <CardTitle>{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.value}
                </div>
                <p className={cn(
                  "text-sm",
                  metric.change > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {metric.change > 0 ? "+" : ""}{metric.change}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {metric.info}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <PerformanceChart />
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <RiskAnalysisChart />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <AllocationChart />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Key Insights</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  "Strong diversification across assets",
                  "Above-average risk-adjusted returns",
                  "Low correlation with market volatility",
                  "Consistent performance in varying conditions"
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 text-green-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  "Consider increasing emerging market exposure",
                  "Review high-yield bond allocation",
                  "Monitor sector concentration risk",
                  "Evaluate rebalancing frequency"
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <div className="h-5 w-5 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 text-yellow-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
