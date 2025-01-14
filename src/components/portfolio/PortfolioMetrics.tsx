'use client';

import { Card, CardBody } from "@nextui-org/react";
import { useEffect, useRef } from "react";
import Chart from 'chart.js/auto';

interface PortfolioMetricsProps {
	portfolio: {
		totalValue: number;
		dailyChange: number;
		monthlyChange: number;
		yearlyChange: number;
		assets: number;
		metrics?: {
			cagr?: number;
			sharpeRatio?: number;
		};
		allocation: {
			type: string;
			percentage: number;
		}[];
	};
}

export function PortfolioMetrics({ portfolio }: PortfolioMetricsProps) {
	// Ensure allocation is an empty array if undefined
	const portfolioWithDefaults = {
		...portfolio,
		allocation: portfolio.allocation || [],
	};

	const allocationChartRef = useRef<HTMLCanvasElement>(null);
	const performanceChartRef = useRef<HTMLCanvasElement>(null);
	const chartRefs = useRef<{ allocation: Chart | null; performance: Chart | null }>({
		allocation: null,
		performance: null
	});

	useEffect(() => {
		const initCharts = () => {
			// Cleanup existing charts
			if (chartRefs.current.allocation) {
				chartRefs.current.allocation.destroy();
			}
			if (chartRefs.current.performance) {
				chartRefs.current.performance.destroy();
			}

			// Initialize allocation chart
			if (allocationChartRef.current && portfolioWithDefaults.allocation.length > 0) {
				const ctx = allocationChartRef.current.getContext('2d');
				if (ctx) {
					chartRefs.current.allocation = new Chart(ctx, {
						type: 'doughnut',
						data: {
							labels: portfolioWithDefaults.allocation.map(a => a.type),
							datasets: [{
								data: portfolioWithDefaults.allocation.map(a => a.percentage),
								backgroundColor: [
									'#00B5A6', // secondary
									'#FF5A5F', // accent
									'#28A745', // success
									'#007BFF', // info
									'#FFC107'  // warning
								]
							}]
						},
						options: {
							responsive: true,
							plugins: {
								legend: {
									position: 'right',
									labels: {
										color: '#707070' // text-secondary
									}
								},
								title: {
									display: true,
									text: 'Portfolio Allocation',
									color: '#111111' // text-primary
								}
							}
						}
					});
				}
			}

			// Initialize performance chart
			if (performanceChartRef.current) {
				const ctx = performanceChartRef.current.getContext('2d');
				if (ctx) {
					chartRefs.current.performance = new Chart(ctx, {
						type: 'line',
						data: {
							labels: ['1D', '1W', '1M', '3M', '6M', '1Y'],
							datasets: [{
								label: 'Portfolio Performance',
								data: [
									portfolioWithDefaults.dailyChange,
									portfolioWithDefaults.dailyChange * 5,
									portfolioWithDefaults.monthlyChange,
									portfolioWithDefaults.monthlyChange * 3,
									portfolioWithDefaults.monthlyChange * 6,
									portfolioWithDefaults.yearlyChange
								],
								borderColor: '#00B5A6', // secondary
								backgroundColor: 'rgba(0, 181, 166, 0.1)',
								tension: 0.4
							}]
						},
						options: {
							responsive: true,
							plugins: {
								title: {
									display: true,
									text: 'Performance Over Time',
									color: '#111111' // text-primary
								},
								legend: {
									labels: {
										color: '#707070' // text-secondary
									}
								}
							},
							scales: {
								y: {
									beginAtZero: true,
									ticks: {
										callback: function(value) {
											return value + '%';
										},
										color: '#707070' // text-secondary
									},
									grid: {
										color: 'rgba(112, 112, 112, 0.1)' // text-secondary with opacity
									}
								},
								x: {
									ticks: {
										color: '#707070' // text-secondary
									},
									grid: {
										color: 'rgba(112, 112, 112, 0.1)' // text-secondary with opacity
									}
								}
							}
						}
					});
				}
			}
		};

		initCharts();

		return () => {
			if (chartRefs.current.allocation) {
				chartRefs.current.allocation.destroy();
			}
			if (chartRefs.current.performance) {
				chartRefs.current.performance.destroy();
			}
		};
	}, [portfolioWithDefaults]);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card className="bg-white dark:bg-primary shadow-lg">
				<CardBody>
					<div className="space-y-4">
						<div>
							<h3 className="text-lg font-semibold text-text-primary dark:text-white">Key Metrics</h3>
							<div className="grid grid-cols-2 gap-4 mt-2">
								<div>
									<p className="text-sm text-text-secondary">CAGR</p>
									<p className="text-xl font-bold text-secondary">
										{portfolioWithDefaults.metrics?.cagr?.toFixed(2) ?? '0.00'}%
									</p>
								</div>
								<div>
									<p className="text-sm text-text-secondary">Sharpe Ratio</p>
									<p className="text-xl font-bold text-secondary">
										{portfolioWithDefaults.metrics?.sharpeRatio?.toFixed(2) ?? '0.00'}
									</p>
								</div>
							</div>
						</div>
						<div>
							<canvas ref={performanceChartRef} />
						</div>
					</div>
				</CardBody>
			</Card>

			<Card className="bg-white dark:bg-primary shadow-lg">
				<CardBody>
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-text-primary dark:text-white">Asset Allocation</h3>
						{portfolioWithDefaults.allocation.length > 0 ? (
							<canvas ref={allocationChartRef} />
						) : (
							<p className="text-text-secondary text-center py-8">No assets in portfolio</p>
						)}
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
