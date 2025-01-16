'use client';

import { useState } from 'react';
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
  symbol: z.string().min(1, 'Symbol is required'),
  type: z.enum(['crypto', 'stock'], {
    required_error: 'Asset type is required',
  }),
  quantity: z.number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity must be a number',
  }).positive('Quantity must be positive'),
  purchasePrice: z.number({
    required_error: 'Purchase price is required',
    invalid_type_error: 'Purchase price must be a number',
  }).positive('Purchase price must be positive'),
  purchaseDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),
  notes: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface AssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssetFormData) => Promise<void>;
  mode: 'add' | 'edit';
  initialData?: Partial<AssetFormData>;
}

export function AssetForm({ isOpen, onClose, onSubmit, mode, initialData }: AssetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log('AssetForm rendered:', { isOpen, mode, initialData });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      type: 'crypto',
      purchaseDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      ...initialData,
    },
  });

  const onSubmitForm = async (data: AssetFormData) => {
    try {
      console.log('Form submitted with data:', data);
      setIsSubmitting(true);
      // Ensure the date is in ISO format
      const formattedData = {
        ...data,
        purchaseDate: new Date(data.purchaseDate).toISOString(),
      };
      await onSubmit(formattedData);
      reset();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Asset' : 'Edit Asset'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Asset Type</Label>
              <RadioGroup
                defaultValue={watch('type')}
                onValueChange={(value) => setValue('type', value as 'crypto' | 'stock')}
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
                defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
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