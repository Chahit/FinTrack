import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      portfolio: {
        create: {
          assets: {
            create: [
              {
                symbol: 'AAPL',
                quantity: 10,
                purchasePrice: 150.00,
                currentPrice: 175.50,
                type: 'STOCK',
                transactions: {
                  create: [
                    {
                      type: 'BUY',
                      quantity: 10,
                      price: 150.00,
                      fees: 9.99,
                      notes: 'Initial purchase'
                    }
                  ]
                }
              },
              {
                symbol: 'BTC',
                quantity: 0.5,
                purchasePrice: 35000.00,
                currentPrice: 42000.00,
                type: 'CRYPTO',
                transactions: {
                  create: [
                    {
                      type: 'BUY',
                      quantity: 0.5,
                      price: 35000.00,
                      fees: 25.00,
                      notes: 'Initial crypto investment'
                    }
                  ]
                }
              }
            ]
          },
          analytics: {
            create: {
              totalValue: 38750.00,  // (10 * 175.50) + (0.5 * 42000.00)
              dailyReturn: 2.5,
              sharpeRatio: 1.2,
              beta: 0.85,
              alpha: 0.15
            }
          }
        }
      },
      watchlist: {
        create: {
          symbols: ['MSFT', 'GOOGL', 'TSLA']
        }
      },
      alerts: {
        create: [
          {
            type: 'PRICE_ABOVE',
            symbol: 'AAPL',
            targetPrice: 180.00,
            message: 'AAPL price target reached',
            isTriggered: false
          },
          {
            type: 'PRICE_BELOW',
            symbol: 'BTC',
            targetPrice: 30000.00,
            message: 'BTC support level breach',
            isTriggered: false
          }
        ]
      }
    }
  });

  // Create some news items
  await prisma.news.createMany({
    data: [
      {
        title: 'Apple Announces New iPhone',
        content: 'Apple Inc. has announced its latest iPhone model with groundbreaking features.',
        url: 'https://example.com/news/1',
        source: 'TechNews',
        symbols: ['AAPL'],
        sentiment: 0.8
      },
      {
        title: 'Bitcoin Reaches New All-Time High',
        content: 'Bitcoin surpasses previous records amid increased institutional adoption.',
        url: 'https://example.com/news/2',
        source: 'CryptoDaily',
        symbols: ['BTC'],
        sentiment: 0.9
      }
    ]
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
