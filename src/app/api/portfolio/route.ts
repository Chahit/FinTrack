import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { Portfolio, Asset, DeleteAssetRequest } from './types';
import { UpdateFilter } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("fintrack");
    const portfolio = await db.collection<Portfolio>("portfolios").findOne({ userId });

    return NextResponse.json(portfolio || { assets: [] });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json({ message: "Error fetching portfolio" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { asset } = await req.json();
    if (!asset || !asset.symbol || !asset.type) {
      return NextResponse.json({ message: "Invalid asset data" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("fintrack");
    
    const result = await db.collection<Portfolio>("portfolios").updateOne(
      { userId },
      { 
        $push: { assets: asset },
        $setOnInsert: { userId }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Portfolio update error:', error);
    return NextResponse.json({ message: "Error updating portfolio" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { assets } = await req.json();
    if (!Array.isArray(assets)) {
      return NextResponse.json({ message: "Invalid assets array" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("fintrack");
    
    const result = await db.collection<Portfolio>("portfolios").updateOne(
      { userId },
      { 
        $set: { assets },
        $setOnInsert: { userId }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Portfolio update error:', error);
    return NextResponse.json({ message: "Error updating portfolio" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { symbol } = await req.json() as DeleteAssetRequest;
    if (!symbol) {
      return NextResponse.json({ message: "Symbol is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("fintrack");

    // Get the current portfolio
    const currentPortfolio = await db.collection<Portfolio>("portfolios").findOne({ userId });
    if (!currentPortfolio) {
      return NextResponse.json({ message: "Portfolio not found" }, { status: 404 });
    }

    // Check if the asset exists before attempting to remove it
    const assetExists = currentPortfolio.assets.some(asset => asset.symbol === symbol);
    if (!assetExists) {
      return NextResponse.json({ message: "Asset not found in portfolio" }, { status: 404 });
    }

    // Filter out the asset with the matching symbol
    const updatedAssets = currentPortfolio.assets.filter(asset => asset.symbol !== symbol);
    const removedAsset = currentPortfolio.assets.find(asset => asset.symbol === symbol);

    // Update the portfolio with the filtered assets
    const result = await db.collection<Portfolio>("portfolios").findOneAndUpdate(
      { userId },
      { $set: { assets: updatedAssets } },
      { 
        returnDocument: 'after',
        upsert: false // Ensure we don't create a new document
      }
    );

    // Since we checked for existence above, and upsert is false, 
    // result should never be null unless there's a race condition
    if (!result || !result.value) {
      return NextResponse.json(
        { message: "Failed to update portfolio - please try again" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Asset successfully removed",
      removedAsset: removedAsset!, // We know this exists from the check above
      updatedPortfolio: result.value
    });
  } catch (error) {
    console.error('Portfolio delete error:', error);
    return NextResponse.json({ message: "Error deleting from portfolio" }, { status: 500 });
  }
}