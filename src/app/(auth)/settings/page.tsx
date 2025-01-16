'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@clerk/nextjs';
import { PageContainer } from '@/components/ui/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { SettingsService, UserSettings } from '@/lib/services/settings.service';
import { useToast } from '@/components/ui/use-toast';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { SparklesCore } from '@/components/ui/sparkles';
import { SkeletonCard } from '@/components/ui/skeleton-card';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await SettingsService.getUserSettings();
      setSettings(userSettings);
      setTheme(userSettings.theme);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    try {
      setTheme(newTheme);
      await SettingsService.updateSettings({ theme: newTheme });
      toast({
        title: 'Success',
        description: 'Theme updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update theme',
        variant: 'destructive',
      });
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    try {
      await SettingsService.updateSettings({ currency });
      setSettings(prev => prev ? { ...prev, currency } : null);
      toast({
        title: 'Success',
        description: 'Currency updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update currency',
        variant: 'destructive',
      });
    }
  };

  const handleTimeZoneChange = async (timeZone: string) => {
    try {
      await SettingsService.updateSettings({ timeZone });
      setSettings(prev => prev ? { ...prev, timeZone } : null);
      toast({
        title: 'Success',
        description: 'Time zone updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update time zone',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationChange = async (key: keyof UserSettings['notifications'], value: boolean) => {
    try {
      await SettingsService.updateNotifications({ [key]: value });
      setSettings(prev => prev ? {
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: value
        }
      } : null);
      toast({
        title: 'Success',
        description: 'Notification settings updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive',
      });
    }
  };

  const handlePortfolioSettingChange = async (key: keyof UserSettings['portfolio'], value: boolean) => {
    try {
      await SettingsService.updatePortfolioSettings({ [key]: value });
      setSettings(prev => prev ? {
        ...prev,
        portfolio: {
          ...prev.portfolio,
          [key]: value
        }
      } : null);
      toast({
        title: 'Success',
        description: 'Portfolio settings updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update portfolio settings',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <SkeletonCard className="h-[100px]" />
          <div className="space-y-4">
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} className="h-[40px] w-[100px]" />
              ))}
            </div>
            <SkeletonCard className="h-[400px]" />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="relative">
        <SparklesCore
          id="settings-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={70}
          className="absolute top-0 left-0 w-full h-full"
          particleColor="hsl(var(--primary))"
        />
        
        <div className="relative z-10 space-y-8">
          <CardContainer>
            <CardBody>
              <CardItem>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </CardItem>
            </CardBody>
          </CardContainer>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <CardContainer>
                <CardBody>
                  <CardItem>
                    <UserProfile
                      appearance={{
                        elements: {
                          rootBox: "w-full max-w-2xl",
                          card: "bg-background border-0 shadow-none p-0",
                          navbar: "hidden",
                          pageScrollBox: "p-0",
                        },
                      }}
                    />
                  </CardItem>
                </CardBody>
              </CardContainer>
            </TabsContent>

            <TabsContent value="preferences">
              <CardContainer>
                <CardBody>
                  <CardItem>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Display Settings</h3>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Theme</Label>
                            <p className="text-sm text-muted-foreground">
                              Choose your preferred theme
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={theme === 'light' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleThemeChange('light')}
                            >
                              <Sun className="h-4 w-4 mr-1" />
                              Light
                            </Button>
                            <Button
                              variant={theme === 'dark' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleThemeChange('dark')}
                            >
                              <Moon className="h-4 w-4 mr-1" />
                              Dark
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Regional Settings</h3>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label>Default Currency</Label>
                            <Select
                              value={settings?.currency}
                              onValueChange={handleCurrencyChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Time Zone</Label>
                            <Select
                              value={settings?.timeZone}
                              onValueChange={handleTimeZoneChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time zone" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="EST">Eastern Time</SelectItem>
                                <SelectItem value="PST">Pacific Time</SelectItem>
                                <SelectItem value="GMT">GMT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Portfolio Settings</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Auto-refresh Portfolio</Label>
                              <p className="text-sm text-muted-foreground">
                                Automatically update portfolio values
                              </p>
                            </div>
                            <Switch
                              checked={settings?.portfolio.autoRefresh}
                              onCheckedChange={(checked) =>
                                handlePortfolioSettingChange('autoRefresh', checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Show Asset Distribution</Label>
                              <p className="text-sm text-muted-foreground">
                                Display portfolio distribution charts
                              </p>
                            </div>
                            <Switch
                              checked={settings?.portfolio.showDistribution}
                              onCheckedChange={(checked) =>
                                handlePortfolioSettingChange('showDistribution', checked)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </TabsContent>

            <TabsContent value="notifications">
              <CardContainer>
                <CardBody>
                  <CardItem>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Email Notifications</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Price Alerts</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications for price changes
                              </p>
                            </div>
                            <Switch
                              checked={settings?.notifications.priceAlerts}
                              onCheckedChange={(checked) =>
                                handleNotificationChange('priceAlerts', checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>News Digest</Label>
                              <p className="text-sm text-muted-foreground">
                                Daily digest of relevant news
                              </p>
                            </div>
                            <Switch
                              checked={settings?.notifications.newsDigest}
                              onCheckedChange={(checked) =>
                                handleNotificationChange('newsDigest', checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Portfolio Updates</Label>
                              <p className="text-sm text-muted-foreground">
                                Weekly portfolio performance summary
                              </p>
                            </div>
                            <Switch
                              checked={settings?.notifications.portfolioUpdates}
                              onCheckedChange={(checked) =>
                                handleNotificationChange('portfolioUpdates', checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Security Alerts</Label>
                              <p className="text-sm text-muted-foreground">
                                Important security notifications
                              </p>
                            </div>
                            <Switch
                              checked={settings?.notifications.securityAlerts}
                              onCheckedChange={(checked) =>
                                handleNotificationChange('securityAlerts', checked)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
