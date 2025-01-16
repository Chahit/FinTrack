'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { NewsCategory, NEWS_CATEGORIES } from "@/lib/config";

export interface NewsFilters {
  category: NewsCategory;
  sentiment: string;
  search?: string;
}

export interface NewsFiltersProps {
  onFilterChange: (filters: NewsFilters) => void;
  defaultFilters: NewsFilters;
}

export function NewsFilters({ onFilterChange, defaultFilters }: NewsFiltersProps) {
  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...defaultFilters,
      category: value as NewsCategory,
    });
  };

  const handleSentimentChange = (value: string) => {
    onFilterChange({
      ...defaultFilters,
      sentiment: value,
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...defaultFilters,
      search: event.target.value,
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select onValueChange={handleCategoryChange} defaultValue={defaultFilters.category}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {NEWS_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Sentiment</label>
          <Select onValueChange={handleSentimentChange} defaultValue={defaultFilters.sentiment}>
            <SelectTrigger>
              <SelectValue placeholder="Select sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <Input
            type="text"
            placeholder="Search news..."
            onChange={handleSearchChange}
            defaultValue={defaultFilters.search}
          />
        </div>
      </div>
    </Card>
  );
} 