'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AssetForm } from '@/components/AssetForm';
import { AssetCard } from '@/components/AssetCard';
import { PageContainer } from '@/components/ui/page-container';
import { PieChart } from '@/components/charts/PieChart';
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent, RefreshCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { SparklesCore } from '@/components/ui/sparkles';
import { SkeletonCard, SkeletonChartCard } from '@/components/ui/skeleton-card';
import { InteractiveChart } from '@/components/ui/interactive-chart';

interface AllocationItem {
	symbol: string;
	type: 'crypto' | 'stock';
	percentage: number;
}

async function fetchPortfolio() {
	const response = await fetch('/api/portfolio/assets');
	if (!response.ok) {
		throw new Error('Failed to fetch portfolio');
	}
	return response.json();
}

export default function DashboardPage() {
	const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
	const [editingAsset, setEditingAsset] = useState<any>(null);
	
	const { data: portfolio, isLoading, error, refetch } = useQuery({
		queryKey: ['portfolio'],
		queryFn: fetchPortfolio,
		refetchInterval: 60000, // Refetch every minute
	});

	if (isLoading) {
		return (
			<PageContainer>
				<div className="space-y-6">
					{/* Header Skeleton */}
					<div className="flex justify-between items-center">
						<SkeletonCard className="w-[250px] h-[40px]" />
						<SkeletonCard className="w-[100px] h-[40px]" />
					</div>

					{/* Summary Cards Skeleton */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<SkeletonCard key={i} className="h-[120px]" />
						))}
					</div>

					{/* Charts Skeleton */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<SkeletonChartCard />
						<SkeletonChartCard />
					</div>

					{/* Assets Skeleton */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<SkeletonCard key={i} className="h-[200px]" />
						))}
					</div>
				</div>
			</PageContainer>
		);
	}

	if (error) {
		return (
			<PageContainer>
				<CardContainer>
					<CardBody>
						<CardItem>
							<div className="text-center text-red-500">
								Error loading portfolio data. Please try again later.
							</div>
						</CardItem>
					</CardBody>
				</CardContainer>
			</PageContainer>
		);
	}

	const { assets = [], summary = { totalValue: 0, totalGainLoss: 0, totalAssets: 0, totalGainLossPercentage: 0 }, allocation = [] } = portfolio || {};

	// Prepare data for charts
	const allocationData = allocation.map((item: AllocationItem) => ({
		name: item.symbol,
		value: item.percentage,
		color: item.type === 'crypto' ? '#8884d8' : '#82ca9d',
	}));

	// Prepare performance data for interactive chart
	const performanceData = assets.map((asset: any) => ({
		name: asset.symbol,
		value: asset.metrics.currentValue,
	}));

	return (
		<PageContainer>
			<div className="relative">
				<SparklesCore
					id="dashboard-sparkles"
					background="transparent"
					minSize={0.4}
					maxSize={1}
					particleDensity={50}
					className="absolute top-0 left-0 w-full h-full"
					particleColor="hsl(var(--primary))"
				/>

				<div className="relative z-10 space-y-6">
					{/* Header */}
					<div className="flex justify-between items-center">
						<CardContainer className="max-w-lg">
							<CardBody>
								<CardItem>
									<h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
								</CardItem>
							</CardBody>
						</CardContainer>
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetch()}
							className="gap-2"
						>
							<RefreshCcw className="h-4 w-4" />
							Refresh
						</Button>
					</div>

					{/* Portfolio Summary */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<CardContainer>
							<CardBody>
								<CardItem>
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Total Value</p>
											<h3 className="text-2xl font-bold">${summary.totalValue.toFixed(2)}</h3>
										</div>
										<DollarSign className="h-8 w-8 text-primary" />
									</div>
								</CardItem>
							</CardBody>
						</CardContainer>

						<CardContainer>
							<CardBody>
								<CardItem>
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Total Gain/Loss</p>
											<div>
												<h3 className={`text-2xl font-bold ${summary.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
													${Math.abs(summary.totalGainLoss).toFixed(2)}
												</h3>
												<p className={`text-sm ${summary.totalGainLossPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
													{summary.totalGainLossPercentage >= 0 ? '+' : '-'}
													{Math.abs(summary.totalGainLossPercentage).toFixed(2)}%
												</p>
											</div>
										</div>
										{summary.totalGainLoss >= 0 ? (
											<TrendingUp className="h-8 w-8 text-green-500" />
										) : (
											<TrendingDown className="h-8 w-8 text-red-500" />
										)}
									</div>
								</CardItem>
							</CardBody>
						</CardContainer>

						<CardContainer>
							<CardBody>
								<CardItem>
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Total Assets</p>
											<h3 className="text-2xl font-bold">{summary.totalAssets}</h3>
										</div>
										<Percent className="h-8 w-8 text-primary" />
									</div>
								</CardItem>
							</CardBody>
						</CardContainer>

						<CardContainer>
							<CardBody>
								<CardItem>
									<Button
										onClick={() => setIsAddAssetOpen(true)}
										className="w-full h-full flex items-center justify-center"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add New Asset
									</Button>
								</CardItem>
							</CardBody>
						</CardContainer>
					</div>

					{/* Portfolio Charts */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<CardContainer>
							<CardBody>
								<CardItem>
									<h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
									<div className="h-[300px]">
										<PieChart data={allocationData} />
									</div>
								</CardItem>
							</CardBody>
						</CardContainer>

						<CardContainer>
							<CardBody>
								<CardItem>
									<h3 className="text-lg font-semibold mb-4">Asset Performance</h3>
									<div className="h-[300px]">
										<InteractiveChart
											data={performanceData}
											height={300}
											tooltipFormatter={(value) => `$${value.toLocaleString()}`}
										/>
									</div>
								</CardItem>
							</CardBody>
						</CardContainer>
					</div>

					{/* Asset List */}
					<div className="space-y-4">
						<CardContainer>
							<CardBody>
								<CardItem>
									<h3 className="text-lg font-semibold">Your Assets</h3>
								</CardItem>
							</CardBody>
						</CardContainer>

						{assets.length === 0 ? (
							<CardContainer>
								<CardBody>
									<CardItem>
										<p className="text-center text-muted-foreground">
											No assets yet. Click the button above to add your first asset.
										</p>
									</CardItem>
								</CardBody>
							</CardContainer>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{assets.map((asset: any) => (
									<AssetCard
										key={asset.id}
										asset={asset}
										onDelete={async (id) => {
											try {
												const response = await fetch(`/api/assets/${id}`, {
													method: 'DELETE',
												});
												if (!response.ok) throw new Error('Failed to delete asset');
												await refetch();
												toast({
													title: 'Success',
													description: 'Asset deleted successfully',
												});
											} catch (error) {
												console.error('Error deleting asset:', error);
												toast({
													title: 'Error',
													description: 'Failed to delete asset',
													variant: 'destructive',
												});
											}
										}}
										onEdit={setEditingAsset}
										onTransactionComplete={refetch}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			<AssetForm
				isOpen={isAddAssetOpen || !!editingAsset}
				onClose={() => {
					setIsAddAssetOpen(false);
					setEditingAsset(null);
				}}
				onSubmit={async (formData) => {
					try {
						if (editingAsset) {
							const response = await fetch(`/api/assets/${editingAsset.id}`, {
								method: 'PATCH',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(formData),
							});
							if (!response.ok) throw new Error('Failed to update asset');
						} else {
							const response = await fetch('/api/assets/add', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(formData),
							});
							if (!response.ok) throw new Error('Failed to add asset');
						}
						await refetch();
						setIsAddAssetOpen(false);
						setEditingAsset(null);
						toast({
							title: 'Success',
							description: `Asset ${editingAsset ? 'updated' : 'added'} successfully`,
						});
					} catch (error) {
						console.error('Error:', error);
						toast({
							title: 'Error',
							description: error instanceof Error ? error.message : 'Operation failed',
							variant: 'destructive',
						});
					}
				}}
				mode={editingAsset ? 'edit' : 'add'}
				initialData={editingAsset}
			/>
		</PageContainer>
	);
}