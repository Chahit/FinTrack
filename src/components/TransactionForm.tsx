'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  onComplete: () => void;
}

export function TransactionForm({ isOpen, onClose, assetId, onComplete }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: 'BUY',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/assets/${assetId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add transaction');
      }

      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add transaction',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Transaction Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BUY" id="buy" />
                  <Label htmlFor="buy">Buy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SELL" id="sell" />
                  <Label htmlFor="sell">Sell</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="light:border-black"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price per unit</Label>
              <Input
                id="price"
                type="number"
                step="any"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="light:border-black"
                required
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="light:border-black"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="light:border-black"
            >
              Cancel
            </Button>
            <Button type="submit" className="light:border-black">Add Transaction</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 