'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash, Bell } from 'lucide-react';
import { AssetForm } from '@/components/AssetForm';
import { PriceAlerts } from './PriceAlerts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

interface AssetListProps {
  assets: any[];
}

export function AssetList({ assets }: AssetListProps) {
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [selectedAssetForAlert, setSelectedAssetForAlert] = useState<any>(null);

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }

      toast({
        title: 'Asset deleted',
        description: 'The asset has been removed from your portfolio.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete asset. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Change</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.symbol}</TableCell>
              <TableCell>{asset.type}</TableCell>
              <TableCell>{asset.quantity}</TableCell>
              <TableCell>${asset.metrics.currentPrice.toFixed(2)}</TableCell>
              <TableCell>${asset.metrics.currentValue.toFixed(2)}</TableCell>
              <TableCell className={asset.metrics.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                {asset.metrics.priceChange24h >= 0 ? '+' : ''}
                {asset.metrics.priceChange24h.toFixed(2)}%
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingAsset(asset)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteAsset(asset.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedAssetForAlert(asset)}>
                      <Bell className="mr-2 h-4 w-4" />
                      Set Alert
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AssetForm
        isOpen={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        initialData={editingAsset}
        mode="edit"
        onSubmit={async (formData) => {
          try {
            const response = await fetch(`/api/portfolio/assets/${editingAsset.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Failed to update asset');
            }

            await refetch();
            setEditingAsset(null);
            toast({
              title: 'Success',
              description: 'Asset updated successfully',
            });
          } catch (error) {
            console.error('Error:', error);
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to update asset',
              variant: 'destructive',
            });
          }
        }}
      />

      <Dialog open={!!selectedAssetForAlert} onOpenChange={() => setSelectedAssetForAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Price Alerts - {selectedAssetForAlert?.symbol}</DialogTitle>
          </DialogHeader>
          {selectedAssetForAlert && (
            <PriceAlerts
              assetId={selectedAssetForAlert.id}
              symbol={selectedAssetForAlert.symbol}
              currentPrice={selectedAssetForAlert.metrics.currentPrice}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 