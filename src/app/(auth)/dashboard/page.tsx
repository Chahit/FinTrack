'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AssetForm } from '@/components/AssetForm';
import { AssetCard } from '@/components/AssetCard';
import { PageContainer } from '@/components/ui/page-container';
import { PieChart } from '@/components/charts/PieChart';
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent, RefreshCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { InteractiveChart } from '@/components/ui/interactive-chart';
import StockTicker from '@/components/StockTicker';
import { MarketOverview } from '@/components/MarketOverview';
import { FlatCard, FlatCardHeader, FlatCardContent } from '@/components/ui/flat-card';

interface AllocationItem {
	symbol: string;
	type: 'crypto' | 'stock';
	percentage: number;
}

interface AssetFormData {
	symbol: string;
	type: 'crypto' | 'stock';
	quantity: number;
	purchasePrice: number;
	purchaseDate: string;
	notes?: string;
}

function PortfolioContent() {
	const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
	const [editingAsset, setEditingAsset] = useState<any>(null);
	
	const { data: portfolio, isLoading, error, refetch } = useQuery({
		queryKey: ['portfolio'],
		queryFn: async () => {
			const response = await fetch('/api/portfolio/assets');
			if (!response.ok) {
				throw new Error('Failed to fetch portfolio');
			}
			return response.json();
		},
		refetchInterval: 30000,
		staleTime: 10000,
	});

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[...Array(3)].map((_, i) => (
					<SkeletonCard key={i} />
				))}
			</div>
		);
	}

	if (error) {
		return (
			<FlatCard>
				<FlatCardContent>
					<div className="text-center py-8">
						<p className="text-red-500">Error loading portfolio data. Please try again.</p>
						<Button onClick={() => refetch()} className="mt-4">
							Retry
						</Button>
					</div>
				</FlatCardContent>
			</FlatCard>
		);
	}

	const { 
		assets = [], 
		summary = { 
			totalValue: 0, 
			totalGainLoss: 0, 
			totalAssets: 0, 
			totalGainLossPercentage: 0,
			totalInvested: 0
		}, 
		allocation = [] 
	} = portfolio || {};

	// Prepare data for charts
	const allocationData = allocation.map((item: any) => ({
		name: item.symbol,
		value: item.percentage,
		color: item.type === 'crypto' ? '#8884d8' : '#82ca9d',
	}));

	// Prepare performance data for interactive chart
	const performanceData = assets.map((asset: any) => ({
		name: asset.symbol,
		value: asset.metrics?.currentValue || 0,
	}));

	return (
		<>
			<div className="space-y-8">
				{/* Header */}
				<div className="flex justify-between items-center mb-2">
					<FlatCard>
						<FlatCardHeader>
							<h1 className="text-4xl font-bold tracking-tight">Portfolio Dashboard</h1>
						</FlatCardHeader>
					</FlatCard>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors light:border-black"
					>
						<RefreshCcw className="h-4 w-4" />
						Refresh
					</Button>
				</div>

				{/* Market Overview */}
				<Suspense fallback={<SkeletonCard />}>
					<div className="space-y-6">
						<FlatCard>
							<FlatCardHeader>
								<h2 className="text-2xl font-semibold tracking-tight mb-6">Market Overview</h2>
								<MarketOverview />
							</FlatCardHeader>
						</FlatCard>
					</div>
				</Suspense>

				{/* Portfolio Summary */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<FlatCard>
						<FlatCardContent>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Total Value</p>
									<h3 className="text-3xl font-bold mt-2">${summary.totalValue?.toFixed(2) || '0.00'}</h3>
								</div>
								<div className="p-3 rounded-full bg-primary/10 light:border-black light:border">
									<DollarSign className="h-6 w-6 text-primary" />
								</div>
							</div>
						</FlatCardContent>
					</FlatCard>

					<FlatCard>
						<FlatCardContent>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Total Gain/Loss</p>
									<div className="mt-2">
										<h3 className={`text-3xl font-bold ${summary.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
											${Math.abs(summary.totalGainLoss || 0).toFixed(2)}
										</h3>
										<p className={`text-sm mt-1 ${summary.totalGainLossPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
											{summary.totalGainLossPercentage >= 0 ? '+' : '-'}
											{Math.abs(summary.totalGainLossPercentage || 0).toFixed(2)}%
										</p>
									</div>
								</div>
								<div className={`p-3 rounded-full ${summary.totalGainLoss >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} light:border-black light:border`}>
									{(summary.totalGainLoss || 0) >= 0 ? (
										<TrendingUp className={`h-6 w-6 ${summary.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`} />
									) : (
										<TrendingDown className={`h-6 w-6 ${summary.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`} />
									)}
								</div>
							</div>
						</FlatCardContent>
					</FlatCard>

					<FlatCard>
						<FlatCardContent>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Total Assets</p>
									<h3 className="text-3xl font-bold mt-2">{summary.totalAssets || 0}</h3>
								</div>
								<div className="p-3 rounded-full bg-primary/10 light:border-black light:border">
									<Percent className="h-6 w-6 text-primary" />
								</div>
							</div>
						</FlatCardContent>
					</FlatCard>
				</div>

				{/* Portfolio Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Suspense fallback={<SkeletonCard />}>
						<FlatCard>
							<FlatCardHeader>
								<h3 className="text-xl font-semibold mb-6">Asset Allocation</h3>
							</FlatCardHeader>
							<FlatCardContent>
								<div className="h-[300px]">
									<PieChart data={allocationData} />
								</div>
							</FlatCardContent>
						</FlatCard>
					</Suspense>

					<Suspense fallback={<SkeletonCard />}>
						<FlatCard>
							<FlatCardHeader>
								<h3 className="text-xl font-semibold mb-6">Asset Performance</h3>
							</FlatCardHeader>
							<FlatCardContent>
								<div className="h-[300px]">
									<InteractiveChart
										data={performanceData}
										height={300}
										tooltipFormatter={(value) => `$${value.toLocaleString()}`}
									/>
								</div>
							</FlatCardContent>
						</FlatCard>
					</Suspense>
				</div>

				{/* Asset List */}
				<div className="space-y-6">
					<FlatCard>
						<FlatCardHeader>
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-semibold">Your Assets</h3>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsAddAssetOpen(true)}
									className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors light:border-black"
								>
									<Plus className="h-4 w-4" />
									Add Asset
								</Button>
							</div>
						</FlatCardHeader>
					</FlatCard>

					{assets.length === 0 ? (
						<FlatCard>
							<FlatCardContent>
								<div className="text-center py-8">
									<p className="text-muted-foreground">
										No assets yet. Click the button above to add your first asset.
									</p>
								</div>
							</FlatCardContent>
						</FlatCard>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
												title: 'Asset deleted',
												description: 'The asset has been successfully deleted.',
											});
										} catch (error) {
											toast({
												title: 'Error',
												description: 'Failed to delete asset. Please try again.',
												variant: 'destructive',
											});
										}
									}}
									onEdit={(asset) => {
										setEditingAsset(asset);
										setIsAddAssetOpen(true);
									}}
									onTransactionComplete={refetch}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			<AssetForm
				isOpen={isAddAssetOpen}
				onClose={() => {
					setIsAddAssetOpen(false);
					setEditingAsset(null);
				}}
				onSubmit={async (data) => {
					try {
						const response = await fetch('/api/portfolio/assets', {
							method: editingAsset ? 'PUT' : 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify(data),
						});

						if (!response.ok) throw new Error('Failed to save asset');

						await refetch();
						setIsAddAssetOpen(false);
						setEditingAsset(null);
						toast({
							title: editingAsset ? 'Asset updated' : 'Asset added',
							description: `The asset has been successfully ${editingAsset ? 'updated' : 'added'}.`,
						});
					} catch (error) {
						toast({
							title: 'Error',
							description: 'Failed to save asset. Please try again.',
							variant: 'destructive',
						});
					}
				}}
				mode={editingAsset ? 'edit' : 'add'}
				initialData={editingAsset}
				refetch={refetch}
			/>
		</>
	);
}

export default function DashboardPage() {
	return (
		<PageContainer>
			<Suspense fallback={<SkeletonCard />}>
				<StockTicker />
			</Suspense>
			<Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[...Array(3)].map((_, i) => (
					<SkeletonCard key={i} />
				))}
			</div>}>
				<PortfolioContent />
			</Suspense>
		</PageContainer>
	);
}