'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const assetSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  type: z.enum(['CRYPTO', 'STOCK']),
  quantity: z.string().transform((val) => parseFloat(val)),
  purchasePrice: z.string().transform((val) => parseFloat(val)),
  purchaseDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  notes: z.string().optional(),
});

interface AssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  mode?: 'add' | 'edit';
}

export function AssetForm({ isOpen, onClose, initialData, mode = 'add' }: AssetFormProps) {
  const form = useForm<z.infer<typeof assetSchema>>({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData ? {
      ...initialData,
      quantity: String(initialData.quantity),
      purchasePrice: String(initialData.purchasePrice),
      purchaseDate: format(new Date(initialData.purchaseDate), 'yyyy-MM-dd'),
    } : {
      type: 'CRYPTO',
      notes: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof assetSchema>) => {
    try {
      const endpoint = mode === 'add' ? '/api/portfolio/assets' : `/api/portfolio/assets/${initialData.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to save asset');
      }

      toast({
        title: `Asset ${mode === 'add' ? 'added' : 'updated'}`,
        description: `Successfully ${mode === 'add' ? 'added' : 'updated'} ${values.symbol} to your portfolio.`,
      });

      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} asset. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Asset' : 'Edit Asset'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="BTC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                      <SelectItem value="STOCK">Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {form.formState.isSubmitting ? (
                <span>Saving...</span>
              ) : mode === 'add' ? (
                'Add Asset'
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 