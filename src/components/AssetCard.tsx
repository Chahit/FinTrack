'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionHistory } from '@/components/TransactionHistory';
import { PriceAlerts } from '@/components/PriceAlerts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, History, Bell, Pencil, Trash, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { RainbowButton } from "@/components/ui/rainbow-button";
import { FlatCard, FlatCardHeader, FlatCardContent } from '@/components/ui/flat-card';
import { TransactionForm } from '@/components/TransactionForm';

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
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  const handleDelete = async () => {
    await onDelete(asset.id);
    setIsDeleteConfirmOpen(false);
  };

  return (
    <FlatCard>
      <FlatCardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="text-left">
              <h3 className="font-semibold">{asset.symbol}</h3>
              <p className="text-sm text-muted-foreground">{asset.type}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 light:border-black">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(asset)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAddTransactionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
      </FlatCardHeader>
      <FlatCardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <div className="text-2xl font-bold">
              ${asset.metrics?.currentValue?.toFixed(2) || '0.00'}
            </div>
            <div className={`flex items-center ${asset.metrics?.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {asset.metrics?.totalGainLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>
                {asset.metrics?.totalGainLoss >= 0 ? '+' : ''}
                {asset.metrics?.totalGainLossPercentage?.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium">{asset.quantity}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg. Price</p>
              <p className="font-medium">${asset.purchasePrice?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </FlatCardContent>

      <Dialog open={isTransactionsOpen} onOpenChange={setIsTransactionsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transactions - {asset.symbol}</DialogTitle>
          </DialogHeader>
          <TransactionHistory
            assets={[asset]}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAlertsOpen} onOpenChange={setIsAlertsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Price Alerts - {asset.symbol}</DialogTitle>
          </DialogHeader>
          <PriceAlerts
            assets={[asset]}
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

      <TransactionForm
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        assetId={asset.id}
        onComplete={onTransactionComplete}
      />
    </FlatCard>
  );
} 