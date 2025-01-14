import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("fintrack");
    const watchlist = await db.collection("watchlists").findOne({ userId });

    return NextResponse.json(watchlist?.items || []);
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    return NextResponse.json({ message: "Error fetching watchlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { symbol } = await req.json();
    if (!symbol) {
      return NextResponse.json({ message: "Symbol is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("fintrack");
    
    // Mock price data - replace with real API call
    const mockPrice = Math.random() * 1000;
    const mockChange = (Math.random() - 0.5) * 4;

    const result = await db.collection("watchlists").updateOne(
      { userId },
      {
        $addToSet: {
          items: {
            symbol,
            price: mockPrice,
            change: mockChange,
            alerts: []
          }
        },
        $setOnInsert: { userId }
      },
      { upsert: true }
    );

    return NextResponse.json({
      symbol,
      price: mockPrice,
      change: mockChange,
      alerts: []
    });
  } catch (error) {
    console.error('Watchlist update error:', error);
    return NextResponse.json({ message: "Error updating watchlist" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { symbol } = await req.json();
    if (!symbol) {
      return NextResponse.json({ message: "Symbol is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("fintrack");
    
    // First get the current watchlist
    const watchlist = await db.collection("watchlists").findOne({ userId });
    if (!watchlist) {
      return NextResponse.json({ message: "Watchlist not found" }, { status: 404 });
    }

    // Filter out the item to remove
    const updatedItems = watchlist.items.filter((item: { symbol: string }) => item.symbol !== symbol);

    // Update with the filtered array
    const result = await db.collection("watchlists").updateOne(
      { userId },
      { $set: { items: updatedItems } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Watchlist delete error:', error);
    return NextResponse.json({ message: "Error updating watchlist" }, { status: 500 });
  }
}
