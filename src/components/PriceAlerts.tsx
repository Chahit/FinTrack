'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Loader2, Bell, BellOff } from 'lucide-react';

const alertSchema = z.object({
  type: z.enum(['ABOVE', 'BELOW']),
  price: z.number().positive(),
});

type AlertFormData = z.infer<typeof alertSchema>;

interface PriceAlertsProps {
  assetId: string;
  symbol: string;
  currentPrice: number;
}

export function PriceAlerts({ assetId, symbol, currentPrice }: PriceAlertsProps) {
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['alerts', assetId],
    queryFn: async () => {
      const response = await fetch('/api/alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      type: 'ABOVE',
      price: currentPrice,
    },
  });

  const onSubmit = async (data: AlertFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          assetId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create alert');
      }

      await refetch();
      reset();
      setIsAddingAlert(false);
    } catch (error) {
      console.error('Alert creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAlert = async (alertId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update alert');
      }

      await refetch();
    } catch (error) {
      console.error('Alert update error:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }

      await refetch();
    } catch (error) {
      console.error('Alert deletion error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const assetAlerts = alerts?.filter((alert: any) => alert.assetId === assetId) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Price Alerts</h3>
        <Button onClick={() => setIsAddingAlert(true)}>Add Alert</Button>
      </div>

      <div className="space-y-4">
        {assetAlerts.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No price alerts set.
          </p>
        ) : (
          assetAlerts.map((alert: any) => (
            <Card key={alert.id} className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {alert.active ? (
                    <Bell className="h-4 w-4 text-primary" />
                  ) : (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>
                    Alert when price goes{' '}
                    <span className="font-semibold">
                      {alert.type.toLowerCase()}
                    </span>{' '}
                    ${alert.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAlert(alert.id, !alert.active)}
                  >
                    {alert.active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isAddingAlert} onOpenChange={setIsAddingAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Price Alert for {symbol}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Alert Type</Label>
              <select
                {...register('type')}
                className="w-full p-2 border rounded-md mt-1"
              >
                <option value="ABOVE">Price goes above</option>
                <option value="BELOW">Price goes below</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Price</Label>
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

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingAlert(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Alert
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 