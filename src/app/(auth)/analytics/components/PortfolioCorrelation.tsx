'use client';

import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { SparklesCore } from '@/components/ui/sparkles';

interface PortfolioCorrelationProps {
  assets: any[];
}

export function PortfolioCorrelation({ assets }: PortfolioCorrelationProps) {
  if (assets.length < 2) {
    return (
      <CardContainer>
        <CardBody>
          <CardItem>
            <div className="text-center text-muted-foreground">
              Add more assets to view correlation analysis
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
    );
  }

  // Calculate correlation between assets
  const calculateCorrelation = () => {
    const correlations: { asset1: string; asset2: string; correlation: number }[] = [];

    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        const asset1 = assets[i];
        const asset2 = assets[j];

        // Using price change as a simple correlation metric
        const correlation = (
          (asset1.metrics.currentPrice - asset1.purchasePrice) /
          asset1.purchasePrice -
          (asset2.metrics.currentPrice - asset2.purchasePrice) /
          asset2.purchasePrice
        ) * -1; // Invert to show positive correlation when assets move together

        correlations.push({
          asset1: asset1.symbol,
          asset2: asset2.symbol,
          correlation: Math.max(-1, Math.min(1, correlation)), // Clamp between -1 and 1
        });
      }
    }

    return correlations;
  };

  const correlations = calculateCorrelation();

  return (
    <div className="relative">
      <SparklesCore
        id="correlation-sparkles"
        background="transparent"
        minSize={0.4}
        maxSize={1}
        particleDensity={30}
        className="absolute top-0 left-0 w-full h-full"
        particleColor="hsl(var(--primary))"
      />
      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {correlations.map((correlation, index) => (
            <CardContainer key={index}>
              <CardBody>
                <CardItem>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {correlation.asset1} vs {correlation.asset2}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            correlation.correlation >= 0
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.abs(correlation.correlation) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {(correlation.correlation * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>
          ))}
        </div>
      </div>
    </div>
  );
} 