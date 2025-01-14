import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Track Your Finances
                  <span className="text-gradient"> Like Never Before</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Advanced analytics, real-time tracking, and intelligent insights to help you make better financial decisions.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="btn-primary">
                      Get Started
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="btn-primary">
                    Go to Dashboard
                  </Link>
                </SignedIn>
                <Link href="/about" className="btn-secondary">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="mx-auto flex w-full items-center justify-center">
              <div className="w-full">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Feature Cards */}
                  <div className="relative group overflow-hidden rounded-lg border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 glow-effect">
                    <div className="space-y-2">
                      <h3 className="font-bold">Portfolio Tracking</h3>
                      <p className="text-sm text-muted-foreground">
                        Monitor your investments in real-time with advanced portfolio analytics.
                      </p>
                    </div>
                  </div>
                  <div className="relative group overflow-hidden rounded-lg border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 glow-effect">
                    <div className="space-y-2">
                      <h3 className="font-bold">Risk Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Understand and optimize your portfolio risk with AI-powered insights.
                      </p>
                    </div>
                  </div>
                  <div className="relative group overflow-hidden rounded-lg border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 glow-effect">
                    <div className="space-y-2">
                      <h3 className="font-bold">Market Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Access real-time market data and trends from global markets.
                      </p>
                    </div>
                  </div>
                  <div className="relative group overflow-hidden rounded-lg border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 glow-effect">
                    <div className="space-y-2">
                      <h3 className="font-bold">Smart Alerts</h3>
                      <p className="text-sm text-muted-foreground">
                        Get intelligent notifications about market movements and opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Advanced Analytics</h2>
                <p className="text-muted-foreground">
                  Get deep insights into your portfolio performance with our advanced analytics tools.
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Real-time Tracking</h2>
                <p className="text-muted-foreground">
                  Monitor your investments in real-time with live market data and updates.
                </p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Smart Insights</h2>
                <p className="text-muted-foreground">
                  Receive AI-powered recommendations to optimize your investment strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Take Control of Your Finances?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                Join thousands of investors who trust FinTrack for their financial journey.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-primary">
                    Start Now
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="btn-primary">
                  View Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}