import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart2, Shield, Zap, BookOpen, Users, LineChart } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    return redirect("/dashboard");
  }

  const features = [
    {
      name: 'Real-time Market Data',
      description: 'Access live market data, price alerts, and comprehensive financial information.',
      icon: LineChart,
    },
    {
      name: 'Advanced Analytics',
      description: 'Powerful tools for technical analysis, pattern recognition, and market insights.',
      icon: BarChart2,
    },
    {
      name: 'Risk Management',
      description: 'Sophisticated risk assessment tools and portfolio optimization strategies.',
      icon: Shield,
    },
    {
      name: 'Trading Automation',
      description: 'Automated trading strategies with customizable parameters and backesting.',
      icon: Zap,
    },
    {
      name: 'Educational Resources',
      description: 'Comprehensive learning materials, tutorials, and market research.',
      icon: BookOpen,
    },
    {
      name: 'Social Trading',
      description: 'Connect with other traders, share insights, and learn from the community.',
      icon: Users,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Your Financial Journey Starts Here
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Track your investments, analyze markets, and make informed decisions with FinTrack
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to succeed in the financial markets
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete suite of tools for market analysis, portfolio management, and trading
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className="rounded-lg border bg-card p-8 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.name}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}