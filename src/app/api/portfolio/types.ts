// types.ts
import { Document } from 'mongodb';

export interface Asset {
  symbol: string;
  type: string;
  quantity: number;
}

export interface Portfolio extends Document {
  userId: string;
  assets: Asset[];
}

export interface UpdatePortfolioRequest {
  assets: Asset[];
}

export interface DeleteAssetRequest {
  symbol: string;
}