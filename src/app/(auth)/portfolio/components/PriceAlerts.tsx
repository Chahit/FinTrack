'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';

interface PriceAlertsProps {
  assetId: string;
  symbol: string;
  currentPrice?: number;
}

const alertSchema = z.object({
  type: z.enum(['ABOVE', 'BELOW']),
  price: z.string(),
});

type AlertFormData = z.infer<typeof alertSchema>;

export function PriceAlerts({ assetId, symbol, currentPrice = 0 }: PriceAlertsProps) {
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      type: 'ABOVE' as const,
      price: '0',
    },
  });

  const { data: alerts = [], refetch } = useQuery({
    queryKey: ['price-alerts', assetId],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/alerts?assetId=${assetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
  });

  const onSubmit = async (data: AlertFormData) => {
    try {
      const response = await fetch('/api/portfolio/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId,
          type: data.type,
          price: parseFloat(data.price),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create alert');
      }

      await refetch();
      setIsAddingAlert(false);
      form.reset();

      toast({
        title: 'Alert created',
        description: `You will be notified when ${symbol} goes ${data.type.toLowerCase()} $${data.price}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleAlert = async (alertId: string, checked: boolean) => {
    try {
      const response = await fetch(`/api/portfolio/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: checked }),
      });

      if (!response.ok) {
        throw new Error('Failed to update alert');
      }

      await refetch();
      toast({
        title: 'Alert updated',
        description: `Alert has been ${checked ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/portfolio/alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }

      await refetch();
      toast({
        title: 'Alert deleted',
        description: 'The price alert has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Current Price</h3>
          <p className="text-2xl font-semibold">${currentPrice.toFixed(2)}</p>
        </div>
        <Dialog open={isAddingAlert} onOpenChange={setIsAddingAlert}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select alert type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ABOVE">Price goes above</SelectItem>
                          <SelectItem value="BELOW">Price goes below</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Create Alert
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {alerts.map((alert: any) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div>
              <p className="font-medium">
                {alert.type === 'ABOVE' ? 'Above' : 'Below'} ${alert.price.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {alert.active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={alert.active}
                onCheckedChange={(checked: boolean) => toggleAlert(alert.id, checked)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => deleteAlert(alert.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No price alerts set
          </p>
        )}
      </div>
    </div>
  );
} 