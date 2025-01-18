'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlatCard, FlatCardHeader, FlatCardContent } from '@/components/ui/flat-card';
import { toast } from '@/components/ui/use-toast';
import { Save, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    refreshInterval: '60',
    currency: 'USD',
    timezone: 'UTC',
  });

  const handleSave = () => {
    // Save settings logic here
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  return (
    <PageContainer>
      <div className="relative">
        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <FlatCard>
              <FlatCardHeader>
                <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
              </FlatCardHeader>
            </FlatCard>
            <Button onClick={handleSave} size="sm" className="light:border-black">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>

          {/* Appearance */}
          <FlatCard>
            <FlatCardHeader>
              <h2 className="text-2xl font-semibold">Appearance</h2>
            </FlatCardHeader>
            <FlatCardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FlatCardContent>
          </FlatCard>

          {/* Notifications */}
          <FlatCard>
            <FlatCardHeader>
              <h2 className="text-2xl font-semibold">Notifications</h2>
            </FlatCardHeader>
            <FlatCardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about price alerts and portfolio updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates and alerts via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, emailAlerts: checked })
                    }
                  />
                </div>
              </div>
            </FlatCardContent>
          </FlatCard>

          {/* Preferences */}
          <FlatCard>
            <FlatCardHeader>
              <h2 className="text-2xl font-semibold">Preferences</h2>
            </FlatCardHeader>
            <FlatCardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Refresh Interval</Label>
                    <p className="text-sm text-muted-foreground">
                      How often to refresh market data (in seconds)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={settings.refreshInterval}
                      onChange={(e) =>
                        setSettings({ ...settings, refreshInterval: e.target.value })
                      }
                      className="w-[100px]"
                    />
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Display Currency</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred currency for displaying values
                    </p>
                  </div>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => setSettings({ ...settings, currency: value })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Timezone</Label>
                    <p className="text-sm text-muted-foreground">
                      Set your preferred timezone for dates and times
                    </p>
                  </div>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">EST</SelectItem>
                      <SelectItem value="PST">PST</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FlatCardContent>
          </FlatCard>
        </div>
      </div>
    </PageContainer>
  );
}
