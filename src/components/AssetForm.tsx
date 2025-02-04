'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const assetSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').toUpperCase(),
  type: z.enum(['crypto', 'stock'], {
    required_error: 'Asset type is required',
  }),
  quantity: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number({
      required_error: 'Quantity is required',
      invalid_type_error: 'Quantity must be a number',
    })
      .positive('Quantity must be positive')
      .finite('Quantity must be finite')
  ),
  purchasePrice: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number({
      required_error: 'Purchase price is required',
      invalid_type_error: 'Purchase price must be a number',
    })
      .positive('Purchase price must be positive')
      .finite('Purchase price must be finite')
  ),
  purchaseDate: z.string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
    }, {
      message: 'Invalid date or date is in the future',
    }),
  notes: z.string().optional().default(''),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface AssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssetFormData) => Promise<void>;
  mode: 'add' | 'edit';
  initialData?: Partial<AssetFormData>;
  refetch: () => Promise<any>;
}

export function AssetForm({ isOpen, onClose, onSubmit, mode, initialData, refetch }: AssetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues = useMemo(() => ({
    type: 'crypto' as const,
    symbol: '',
    quantity: undefined as number | undefined,
    purchasePrice: undefined as number | undefined,
    purchaseDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    notes: '',
    ...initialData,
  }), [initialData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues,
  });

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, mode, defaultValues, reset]);

  const onSubmitForm = async (data: AssetFormData) => {
    try {
      setIsSubmitting(true);
      // Format the data before submission
      const formattedData = {
        ...data,
        symbol: data.symbol.toUpperCase(),
        quantity: Number(data.quantity),
        purchasePrice: Number(data.purchasePrice),
        purchaseDate: new Date(data.purchaseDate).toISOString(),
        notes: data.notes || '',
      };

      // Validate the date is not in the future
      const purchaseDate = new Date(formattedData.purchaseDate);
      if (purchaseDate > new Date()) {
        throw new Error('Purchase date cannot be in the future');
      }

      await onSubmit(formattedData);
      await refetch(); // Wait for refetch to complete
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Asset' : 'Edit Asset'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Asset Type</Label>
              <RadioGroup
                value={watch('type')}
                onValueChange={(value: 'crypto' | 'stock') => setValue('type', value)}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="crypto" id="crypto" />
                  <Label htmlFor="crypto">Cryptocurrency</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stock" id="stock" />
                  <Label htmlFor="stock">Stock</Label>
                </div>
              </RadioGroup>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g., BTC, AAPL"
                {...register('symbol')}
                className="mt-1"
              />
              {errors.symbol && (
                <p className="text-sm text-red-500 mt-1">{errors.symbol.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                placeholder="0.00"
                {...register('quantity', { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="any"
                placeholder="0.00"
                {...register('purchasePrice', { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.purchasePrice && (
                <p className="text-sm text-red-500 mt-1">{errors.purchasePrice.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="datetime-local"
                {...register('purchaseDate')}
                className="mt-1"
              />
              {errors.purchaseDate && (
                <p className="text-sm text-red-500 mt-1">{errors.purchaseDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add any notes about this purchase"
                {...register('notes')}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'add' ? 'Adding...' : 'Saving...'}
                </>
              ) : (
                mode === 'add' ? 'Add Asset' : 'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}