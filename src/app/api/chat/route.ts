import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { Asset } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({
        response: "Please sign in to access your portfolio data."
      });
    }

    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({
        response: "I didn't catch that. Could you please rephrase your question?"
      });
    }

    // Fetch user's portfolio data
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        assets: true,
      },
    });

    if (!portfolio || !portfolio.assets || portfolio.assets.length === 0) {
      return NextResponse.json({
        response: "I notice your portfolio is empty. Would you like help adding your first asset? You can:\n\n" +
          "1. Click the 'Add Asset' button in your dashboard\n" +
          "2. Enter the asset symbol (e.g., AAPL for Apple)\n" +
          "3. Specify the quantity and purchase price\n\n" +
          "Once you've added some assets, I can provide personalized insights and recommendations for your portfolio."
      });
    }

    // Calculate total value and allocation using purchasePrice as current value
    const totalValue = portfolio.assets.reduce((sum: number, asset: Asset) => 
      sum + (asset.quantity * asset.purchasePrice), 0);
      
    const stocksValue = portfolio.assets
      .filter((a: Asset) => a.type === 'stock')
      .reduce((sum: number, asset: Asset) => 
        sum + (asset.quantity * asset.purchasePrice), 0);
        
    const bondsValue = portfolio.assets
      .filter((a: Asset) => a.type === 'bond')
      .reduce((sum: number, asset: Asset) => 
        sum + (asset.quantity * asset.purchasePrice), 0);
        
    const cashValue = portfolio.assets
      .filter((a: Asset) => a.type === 'cash')
      .reduce((sum: number, asset: Asset) => 
        sum + (asset.quantity * asset.purchasePrice), 0);

    // For this example, we'll use a simple placeholder for YTD return
    const ytdReturn = 5.0; // Placeholder 5% return

    // Format the response based on the user's question
    let response = '';
    const messageLower = message.toLowerCase();

    if (messageLower.includes('dashboard') || messageLower.includes('look through')) {
      // Get top holdings by value
      const holdings = portfolio.assets
        .map(asset => ({
          symbol: asset.symbol,
          value: asset.quantity * asset.purchasePrice,
          percentage: ((asset.quantity * asset.purchasePrice) / totalValue) * 100
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);

      response = `Here's an overview of your dashboard:\n\n` +
        `**Portfolio Summary:**\n` +
        `* Total Value: $${totalValue.toLocaleString()}\n` +
        `* Number of Assets: ${portfolio.assets.length}\n\n` +
        
        `**Asset Allocation:**\n` +
        `* Stocks: ${((stocksValue / totalValue) * 100).toFixed(1)}%\n` +
        `* Bonds: ${((bondsValue / totalValue) * 100).toFixed(1)}%\n` +
        `* Cash: ${((cashValue / totalValue) * 100).toFixed(1)}%\n\n` +
        
        `**Top Holdings:**\n` +
        holdings.map(h => `* ${h.symbol}: $${h.value.toLocaleString()} (${h.percentage.toFixed(1)}%)`).join('\n') + '\n\n';

      // Add insights based on the portfolio composition
      response += `**Key Insights:**\n`;
      
      if (stocksValue / totalValue < 0.4) {
        response += `* Your stock allocation is relatively low. Consider increasing equity exposure for long-term growth.\n`;
      }
      if (cashValue / totalValue > 0.2) {
        response += `* You have a high cash position. Consider putting some cash to work in the market.\n`;
      }
      if (portfolio.assets.length < 10) {
        response += `* Your portfolio could benefit from more diversification across different assets.\n`;
      }
      if (holdings[0]?.percentage > 20) {
        response += `* Your largest position represents a significant portion of your portfolio. Consider rebalancing to reduce concentration risk.\n`;
      }

      response += `\nWould you like me to analyze any specific aspect of your dashboard in more detail?`;
    } else if (messageLower.includes('how') && messageLower.includes('performing')) {
      response = `Based on your portfolio data, here is an overview:\n\n` +
        `**Total portfolio value:** $${totalValue.toLocaleString()}\n\n` +
        `**Asset allocation:**\n` +
        `* Stocks: ${((stocksValue / totalValue) * 100).toFixed(1)}%\n` +
        `* Bonds: ${((bondsValue / totalValue) * 100).toFixed(1)}%\n` +
        `* Cash: ${((cashValue / totalValue) * 100).toFixed(1)}%\n\n` +
        `**Performance:**\n` +
        `* Year-to-date return: ${ytdReturn.toFixed(1)}%\n` +
        `* Annualized return: ${(ytdReturn * 1.5).toFixed(1)}%`;
    } else if (messageLower.includes('suggest') || messageLower.includes('optimize')) {
      const stocksPercent = (stocksValue / totalValue) * 100;
      const bondsPercent = (bondsValue / totalValue) * 100;
      const cashPercent = (cashValue / totalValue) * 100;

      response = `Based on your current asset allocation and performance, here are a few suggestions to optimize your portfolio:\n\n`;

      if (stocksPercent < 60) {
        response += `* Consider increasing your stock allocation to capture more growth potential\n`;
      }
      if (bondsPercent < 20) {
        response += `* You might want to add more bonds to improve portfolio stability\n`;
      }
      if (cashPercent > 20) {
        response += `* Your cash position is relatively high, consider investing some of it\n`;
      }
      if (portfolio.assets.length < 10) {
        response += `* Your portfolio could benefit from more diversification\n`;
      }

      response += `\nWould you like me to analyze any specific aspect of your portfolio in more detail?`;
    } else {
      response = `I can help you analyze your portfolio and provide personalized insights. Try asking me things like:\n\n` +
        `* "How is my portfolio performing?"\n` +
        `* "Show me my dashboard"\n` +
        `* "Suggest ways to optimize my portfolio"\n\n` +
        `What would you like to know?`;
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({
      response: "I encountered an error while analyzing your portfolio. Please try again in a moment."
    });
  }
} 