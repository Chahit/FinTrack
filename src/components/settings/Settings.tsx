'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function Settings() {
  useEffect(() => {
    gsap.from('.settings-card', {
      duration: 0.8,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.settings-section',
        start: 'top center+=100',
      },
    });
  }, []);

  return (
    <section className="settings-section py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Settings & Preferences
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Preferences */}
          <Card className="settings-card p-6">
            <h3 className="text-xl font-semibold mb-6">Portfolio Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-sm">Auto-Hedging</label>
                <Switch />
              </div>

              <div>
                <label className="text-sm block mb-2">Default Risk Tolerance</label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>

              <div>
                <label className="text-sm block mb-2">Portfolio Currency</label>
                <Select defaultValue="usd">
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="gbp">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="settings-card p-6">
            <h3 className="text-xl font-semibold mb-6">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm">Price Alerts</label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Risk Warnings</label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Market News</label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Portfolio Updates</label>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          {/* Theme Settings */}
          <Card className="settings-card p-6">
            <h3 className="text-xl font-semibold mb-6">Appearance</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm block mb-2">Theme</label>
                <Select defaultValue="dark">
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm block mb-2">Chart Style</label>
                <Select defaultValue="modern">
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Data Privacy */}
          <Card className="settings-card p-6">
            <h3 className="text-xl font-semibold mb-6">Data & Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm">Analytics Tracking</label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Share Portfolio Data</label>
                <Switch />
              </div>
              <div className="mt-6">
                <Button variant="destructive" className="w-full">
                  Clear All Data
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
