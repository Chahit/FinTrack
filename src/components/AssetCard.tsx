'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionHistory } from '@/components/TransactionHistory';
import { PriceAlerts } from '@/components/PriceAlerts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, History, Bell, Pencil, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RainbowButton } from "@/components/ui/rainbow-button";

interface AssetCardProps {
  asset: any;
  onDelete: (id: string) => Promise<void>;
  onEdit: (asset: any) => void;
  onTransactionComplete: () => void;
}

export function AssetCard({ asset, onDelete, onEdit, onTransactionComplete }: AssetCardProps) {
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDelete = async () => {
    await onDelete(asset.id);
    setIsDeleteConfirmOpen(false);
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">{asset.symbol}</h4>
            <p className="text-sm text-muted-foreground">{asset.type}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="font-semibold">${asset.metrics.currentValue.toFixed(2)}</p>
              <p className={`text-sm ${asset.metrics.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {asset.metrics.gainLoss >= 0 ? '+' : '-'}${Math.abs(asset.metrics.gainLoss).toFixed(2)}
                ({asset.metrics.gainLossPercentage.toFixed(2)}%)
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <RainbowButton gradient className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </RainbowButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsTransactionsOpen(true)}>
                  <History className="mr-2 h-4 w-4" />
                  Transactions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAlertsOpen(true)}>
                  <Bell className="mr-2 h-4 w-4" />
                  Price Alerts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(asset)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-2 text-sm">
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span>{asset.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span>Current Price:</span>
            <span>${asset.metrics.currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Purchase Price:</span>
            <span>${asset.purchasePrice.toFixed(2)}</span>
          </div>
          {asset.metrics.priceChange24h && (
            <div className="flex justify-between">
              <span>24h Change:</span>
              <span className={asset.metrics.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                {asset.metrics.priceChange24h >= 0 ? '+' : ''}
                {asset.metrics.priceChange24h.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={isTransactionsOpen} onOpenChange={setIsTransactionsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transactions - {asset.symbol}</DialogTitle>
          </DialogHeader>
          <TransactionHistory
            assetId={asset.id}
            onTransactionComplete={() => {
              onTransactionComplete();
              setIsTransactionsOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAlertsOpen} onOpenChange={setIsAlertsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Price Alerts - {asset.symbol}</DialogTitle>
          </DialogHeader>
          <PriceAlerts
            assetId={asset.id}
            symbol={asset.symbol}
            currentPrice={asset.metrics.currentPrice}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {asset.symbol}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 