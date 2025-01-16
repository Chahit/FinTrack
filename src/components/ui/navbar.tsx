"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Portfolio",
      href: "/portfolio",
    },
    {
      title: "Analytics",
      href: "/analytics",
    },
    {
      title: "Market",
      href: "/market",
    },
    {
      title: "News",
      href: "/news",
    },
    {
      title: "Trade Room",
      href: "/traderoom",
    }
  ]

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block">FinTrack</span>
        </Link>
        <nav className="flex items-center space-x-6 mx-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {route.title}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  )
} 