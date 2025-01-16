'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface TransactionHistoryProps {
  assets: any[];
}

export function TransactionHistory({ assets }: TransactionHistoryProps) {
  const [assetFilter, setAssetFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return response.json();
    },
  });

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesAsset = assetFilter === 'all' || transaction.assetId === assetFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesSearch = searchQuery === '' || 
      transaction.asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesAsset && matchesType && matchesSearch;
  });

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-[200px]">
          <Select value={assetFilter} onValueChange={setAssetFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[300px]"
        />
      </div>

      {/* Transactions Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((transaction: any) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {format(new Date(transaction.date), 'MMM d, yyyy HH:mm')}
              </TableCell>
              <TableCell className="font-medium">
                {transaction.asset.symbol}
              </TableCell>
              <TableCell>
                <span className={`capitalize ${
                  transaction.type === 'buy' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.type}
                </span>
              </TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>${transaction.price.toFixed(2)}</TableCell>
              <TableCell>${(transaction.quantity * transaction.price).toFixed(2)}</TableCell>
              <TableCell className="text-muted-foreground">
                {transaction.notes}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 