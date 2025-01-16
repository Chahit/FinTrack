import { prisma } from './prisma';
import { WebSocket } from 'ws';

interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

export class PriceAlertService {
  private ws: WebSocket;
  private symbolAlerts: Map<string, Set<string>> = new Map();
  private lastPrices: Map<string, number> = new Map();

  constructor() {
    this.initializeWebSocket();
    this.loadAlerts();
  }

  private async loadAlerts() {
    try {
      const alerts = await prisma.priceAlert.findMany({
        where: { active: true },
        include: { asset: true }
      });

      // Group alerts by symbol for efficient checking
      alerts.forEach(alert => {
        const symbol = alert.asset.symbol;
        if (!this.symbolAlerts.has(symbol)) {
          this.symbolAlerts.set(symbol, new Set());
        }
        this.symbolAlerts.get(symbol)?.add(alert.id);
      });

      // Subscribe to price updates for all symbols
      const symbols = [...this.symbolAlerts.keys()];
      if (symbols.length > 0) {
        this.ws.send(JSON.stringify({
          type: 'subscribe',
          symbols
        }));
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }

  private initializeWebSocket() {
    this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

    this.ws.on('open', () => {
      console.log('WebSocket connected for price alerts');
    });

    this.ws.on('message', async (data: string) => {
      try {
        const update: PriceUpdate = JSON.parse(data);
        await this.checkAlerts(update);
        this.lastPrices.set(update.symbol, update.price);
      } catch (error) {
        console.error('Error processing price update:', error);
      }
    });

    this.ws.on('close', () => {
      console.log('WebSocket closed, attempting to reconnect...');
      setTimeout(() => this.initializeWebSocket(), 5000);
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private async checkAlerts(update: PriceUpdate) {
    const alertIds = this.symbolAlerts.get(update.symbol);
    if (!alertIds) return;

    const alerts = await prisma.priceAlert.findMany({
      where: {
        id: { in: [...alertIds] },
        active: true,
      },
      include: {
        asset: {
          include: {
            portfolio: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    for (const alert of alerts) {
      const isTriggered = alert.type === 'ABOVE' 
        ? update.price >= alert.price 
        : update.price <= alert.price;

      if (isTriggered) {
        await this.triggerAlert(alert, update.price);
      }
    }
  }

  private async triggerAlert(alert: any, currentPrice: number) {
    try {
      // Update alert status
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { active: false }
      });

      // Remove from local tracking
      const alertIds = this.symbolAlerts.get(alert.asset.symbol);
      alertIds?.delete(alert.id);

      // Create notification
      await prisma.notification.create({
        data: {
          userId: alert.asset.portfolio.user.id,
          type: 'PRICE_ALERT',
          title: `Price Alert: ${alert.asset.symbol}`,
          message: `${alert.asset.symbol} has reached $${currentPrice.toFixed(2)} (${alert.type.toLowerCase()} $${alert.price.toFixed(2)})`,
          data: {
            assetId: alert.asset.id,
            alertId: alert.id,
            price: currentPrice
          }
        }
      });

      // Trigger push notification if available
      if (process.env.NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true') {
        const subscription = await prisma.pushSubscription.findFirst({
          where: { userId: alert.asset.portfolio.user.id }
        });

        if (subscription) {
          await fetch('/api/notifications/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: subscription.data,
              message: `${alert.asset.symbol} has reached $${currentPrice.toFixed(2)}`
            })
          });
        }
      }
    } catch (error) {
      console.error('Error triggering alert:', error);
    }
  }

  public async addAlert(alertId: string) {
    try {
      const alert = await prisma.priceAlert.findUnique({
        where: { id: alertId },
        include: { asset: true }
      });

      if (alert) {
        if (!this.symbolAlerts.has(alert.asset.symbol)) {
          this.symbolAlerts.set(alert.asset.symbol, new Set());
          // Subscribe to new symbol
          this.ws.send(JSON.stringify({
            type: 'subscribe',
            symbols: [alert.asset.symbol]
          }));
        }
        this.symbolAlerts.get(alert.asset.symbol)?.add(alertId);
      }
    } catch (error) {
      console.error('Error adding alert:', error);
    }
  }

  public async removeAlert(alertId: string) {
    try {
      const alert = await prisma.priceAlert.findUnique({
        where: { id: alertId },
        include: { asset: true }
      });

      if (alert) {
        const alertIds = this.symbolAlerts.get(alert.asset.symbol);
        alertIds?.delete(alertId);

        // If no more alerts for this symbol, unsubscribe
        if (alertIds?.size === 0) {
          this.symbolAlerts.delete(alert.asset.symbol);
          this.ws.send(JSON.stringify({
            type: 'unsubscribe',
            symbols: [alert.asset.symbol]
          }));
        }
      }
    } catch (error) {
      console.error('Error removing alert:', error);
    }
  }
} 