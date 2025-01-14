import { NextResponse } from 'next/server';

// In a real app, this would come from a database
const MOCK_PORTFOLIO_DATA = {
  'current-user': {
    totalValue: 36195.739,
    previousValue: 34961.179,
    dailyChange: {
      percentage: 2.45,
      value: 567.89,
    },
    assets: {
      count: 4,
      bestPerformer: {
        symbol: 'BTC',
        change: 2.45,
      },
    },
  },
};

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // In a real app, you would:
    // 1. Authenticate the request
    // 2. Query your database for the user's portfolio
    // 3. Calculate real-time values using market data
    // 4. Return the portfolio data

    const userId = params.userId;
    const portfolioData = MOCK_PORTFOLIO_DATA[userId as keyof typeof MOCK_PORTFOLIO_DATA];

    if (!portfolioData) {
      return new NextResponse(JSON.stringify({ error: 'Portfolio not found' }), {
        status: 404,
      });
    }

    return NextResponse.json(portfolioData);
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}
