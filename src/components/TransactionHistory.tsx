'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const transactionSchema = z.object({
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  price: z.number().positive(),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionHistoryProps {
  assetId: string;
  onTransactionComplete: () => void;
}

export function TransactionHistory({ assetId, onTransactionComplete }: TransactionHistoryProps) {
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['transactions', assetId],
    queryFn: async () => {
      const response = await fetch(`/api/assets/${assetId}/transactions`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return response.json();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'BUY',
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/assets/${assetId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add transaction');
      }

      await refetch();
      onTransactionComplete();
      reset();
      setIsAddingTransaction(false);
    } catch (error) {
      console.error('Transaction submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <Button onClick={() => setIsAddingTransaction(true)}>Add Transaction</Button>
      </div>

      <div className="space-y-4">
        {transactions?.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No transactions yet.
          </p>
        ) : (
          transactions?.map((transaction: any) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`font-semibold ${
                    transaction.type === 'BUY' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {transaction.type}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'PPp')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{transaction.quantity} units</p>
                  <p className="text-sm text-muted-foreground">
                    @ ${transaction.price.toFixed(2)}
                  </p>
                </div>
              </div>
              {transaction.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  {transaction.notes}
                </p>
              )}
            </Card>
          ))
        )}
      </div>

      <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Transaction Type</Label>
              <select
                {...register('type')}
                className="w-full p-2 border rounded-md mt-1"
              >
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Price per Unit</Label>
              <Input
                id="price"
                type="number"
                step="any"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="datetime-local"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                {...register('notes')}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingTransaction(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Transaction
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 