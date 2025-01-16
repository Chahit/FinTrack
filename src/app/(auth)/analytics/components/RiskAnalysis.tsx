'use client';

import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { SparklesCore } from '@/components/ui/sparkles';
import { InteractiveChart } from '@/components/ui/interactive-chart';

interface RiskAnalysisProps {
  portfolio: any;
}

export function RiskAnalysis({ portfolio }: RiskAnalysisProps) {
  const { assets = [] } = portfolio || {};

  // Calculate risk metrics
  const calculateRiskMetrics = () => {
    if (!assets.length) return null;

    // Calculate portfolio beta (market sensitivity)
    const marketReturns = 8; // Assumed market return (S&P 500 average)
    const riskFreeRate = 2; // Assumed risk-free rate

    const returns = assets.map(asset => asset.metrics.gainLossPercentage);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    
    // Calculate volatility (standard deviation of returns)
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    // Calculate beta (using simplified calculation)
    const beta = volatility / 15; // 15 is assumed market volatility

    // Calculate alpha (excess return over market)
    const alpha = avgReturn - (riskFreeRate + beta * (marketReturns - riskFreeRate));

    // Calculate max drawdown
    const maxDrawdown = Math.min(...returns.map(r => r - avgReturn));

    // Value at Risk (VaR) - simplified 95% confidence
    const var95 = avgReturn - (1.645 * volatility);

    return {
      beta,
      alpha,
      volatility,
      maxDrawdown,
      valueAtRisk: var95,
      returns: returns.map((r, i) => ({ name: `Day ${i + 1}`, value: r })).slice(-30), // Last 30 days
    };
  };

  const riskMetrics = calculateRiskMetrics();

  if (!riskMetrics) {
    return (
      <CardContainer>
        <CardBody>
          <CardItem>
            <div className="text-center text-muted-foreground">
              No risk analysis data available
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
    );
  }

  return (
    <div className="relative">
      <SparklesCore
        id="risk-sparkles"
        background="transparent"
        minSize={0.4}
        maxSize={1}
        particleDensity={30}
        className="absolute top-0 left-0 w-full h-full"
        particleColor="hsl(var(--primary))"
      />
      <div className="relative z-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CardContainer>
            <CardBody>
              <CardItem>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Beta</p>
                  <p className="text-2xl font-bold">{riskMetrics.beta.toFixed(2)}</p>
                </div>
              </CardItem>
            </CardBody>
          </CardContainer>

          <CardContainer>
            <CardBody>
              <CardItem>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Alpha</p>
                  <p className={`text-2xl font-bold ${riskMetrics.alpha >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {riskMetrics.alpha.toFixed(2)}%
                  </p>
                </div>
              </CardItem>
            </CardBody>
          </CardContainer>

          <CardContainer>
            <CardBody>
              <CardItem>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Max Drawdown</p>
                  <p className="text-2xl font-bold text-red-500">
                    {riskMetrics.maxDrawdown.toFixed(2)}%
                  </p>
                </div>
              </CardItem>
            </CardBody>
          </CardContainer>

          <CardContainer>
            <CardBody>
              <CardItem>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Value at Risk (95%)</p>
                  <p className="text-2xl font-bold">
                    {riskMetrics.valueAtRisk.toFixed(2)}%
                  </p>
                </div>
              </CardItem>
            </CardBody>
          </CardContainer>
        </div>

        <CardContainer>
          <CardBody>
            <CardItem>
              <h4 className="text-sm font-medium mb-4">Return Distribution</h4>
              <div className="h-[300px]">
                <InteractiveChart
                  data={riskMetrics.returns}
                  height={300}
                  tooltipFormatter={(value) => `${value.toFixed(2)}%`}
                />
              </div>
            </CardItem>
          </CardBody>
        </CardContainer>
      </div>
    </div>
  );
} 