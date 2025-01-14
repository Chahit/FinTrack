'use client';

import { Card, CardBody, CardHeader, Button, Input, Switch, Badge } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { gsap } from "gsap";

interface PriceAlert {
  id: string;
  symbol: string;
  type: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  active: boolean;
}

interface MarketUpdate {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export function NotificationComponent() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [updates, setUpdates] = useState<MarketUpdate[]>([]);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'above' as const,
    targetPrice: 0
  });

  useEffect(() => {
    // Animate notifications container
    gsap.from(".notifications-container", {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.out"
    });

    // Mock data
    const mockAlerts: PriceAlert[] = [
      {
        id: '1',
        symbol: 'BTC',
        type: 'above',
        targetPrice: 40000,
        currentPrice: 39500,
        active: true
      },
      {
        id: '2',
        symbol: 'AAPL',
        type: 'below',
        targetPrice: 170,
        currentPrice: 175,
        active: true
      }
    ];

    const mockUpdates: MarketUpdate[] = [
      {
        id: '1',
        title: 'Market Rally',
        message: 'Major indices showing strong upward momentum',
        type: 'success',
        timestamp: new Date(),
        read: false
      },
      {
        id: '2',
        title: 'Portfolio Alert',
        message: 'BTC price approaching target',
        type: 'warning',
        timestamp: new Date(),
        read: false
      }
    ];

    setAlerts(mockAlerts);
    setUpdates(mockUpdates);
  }, []);

  const addAlert = () => {
    const alert: PriceAlert = {
      id: Date.now().toString(),
      ...newAlert,
      currentPrice: 0,
      active: true
    };

    gsap.from(".alert-new", {
      opacity: 0,
      x: -20,
      duration: 0.3,
      ease: "power2.out"
    });

    setAlerts([...alerts, alert]);
    setNewAlert({ symbol: '', type: 'above', targetPrice: 0 });
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };

  const markAsRead = (id: string) => {
    gsap.to(`#update-${id}`, {
      opacity: 0.6,
      duration: 0.3,
      ease: "power2.inOut"
    });

    setUpdates(updates.map(update =>
      update.id === id ? { ...update, read: true } : update
    ));
  };

  return (
    <div className="notifications-container space-y-6">
      <Card className="bg-white dark:bg-primary shadow-lg">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-text-primary dark:text-white">Price Alerts</h2>
            <p className="text-sm text-text-secondary">Get notified when assets reach target prices</p>
          </div>
          <Badge content={alerts.filter(a => a.active).length} color="secondary">
            <Button onPress={() => {}} className="bg-secondary text-white">Active Alerts</Button>
          </Badge>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Symbol (e.g., BTC)"
              value={newAlert.symbol}
              onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
              className="bg-gray-light dark:bg-gray-dark"
            />
            <Input
              type="number"
              placeholder="Target Price"
              value={newAlert.targetPrice.toString()}
              onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) }))}
              className="bg-gray-light dark:bg-gray-dark"
            />
            <Button
              color="secondary"
              onPress={addAlert}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              Add Alert
            </Button>
          </div>

          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg bg-gray-light dark:bg-gray-dark flex justify-between items-center ${
                  index === alerts.length - 1 ? 'alert-new' : ''
                }`}
              >
                <div>
                  <p className="text-text-primary dark:text-white">
                    {alert.symbol} {alert.type === 'above' ? '>' : '<'} ${alert.targetPrice}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Current: ${alert.currentPrice}
                  </p>
                </div>
                <Switch
                  checked={alert.active}
                  onChange={() => toggleAlert(alert.id)}
                  className="ml-4"
                />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card className="bg-white dark:bg-primary shadow-lg">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary dark:text-white">Market Updates</h2>
          <Badge content={updates.filter(u => !u.read).length} color="warning">
            <Button onPress={() => {}} className="bg-accent text-white">Unread</Button>
          </Badge>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {updates.map((update) => (
              <div
                key={update.id}
                id={`update-${update.id}`}
                className={`p-4 rounded-lg ${
                  update.read
                    ? 'bg-gray-light dark:bg-gray-dark opacity-60'
                    : 'bg-secondary/10 dark:bg-secondary/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-text-primary dark:text-white">
                      {update.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {update.message}
                    </p>
                    <span className="text-xs text-text-secondary">
                      {update.timestamp.toLocaleString()}
                    </span>
                  </div>
                  {!update.read && (
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => markAsRead(update.id)}
                      className="text-secondary"
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}