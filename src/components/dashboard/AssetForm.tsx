'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Asset {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}

export function AssetForm() {
  const [showDialog, setShowDialog] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [newAsset, setNewAsset] = useState<Asset>({
    symbol: '',
    quantity: 0,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssets([...assets, newAsset]);
    setShowDialog(false);
    setNewAsset({
      symbol: '',
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <>
      <Card className="hover:border-primary/50 cursor-pointer transition-colors" onClick={() => setShowDialog(true)}>
        <CardHeader>
          <CardTitle>Add New Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Track a new investment by adding it to your portfolio
          </p>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset Symbol</label>
              <input
                type="text"
                value={newAsset.symbol}
                onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value.toUpperCase() })}
                placeholder="e.g., AAPL, BTC"
                className="w-full px-3 py-2 rounded-md border bg-background"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <input
                type="number"
                value={newAsset.quantity}
                onChange={(e) => setNewAsset({ ...newAsset, quantity: parseFloat(e.target.value) })}
                placeholder="Number of units"
                className="w-full px-3 py-2 rounded-md border bg-background"
                required
                min="0"
                step="any"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Price per Unit</label>
              <input
                type="number"
                value={newAsset.purchasePrice}
                onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: parseFloat(e.target.value) })}
                placeholder="Price per unit"
                className="w-full px-3 py-2 rounded-md border bg-background"
                required
                min="0"
                step="any"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Date</label>
              <input
                type="date"
                value={newAsset.purchaseDate}
                onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background"
                required
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Add Asset
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Display Assets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {assets.map((asset, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{asset.symbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantity:</span>
                  <span>{asset.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Purchase Price:</span>
                  <span>${asset.purchasePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Value:</span>
                  <span>${(asset.quantity * asset.purchasePrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Purchase Date:</span>
                  <span>{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
