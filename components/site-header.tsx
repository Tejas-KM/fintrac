"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CreditCard, Home, PieChart, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Wallet className="h-5 w-5" />
          <span>Finance Tracker</span>
        </Link>
        <nav className="flex items-center gap-2 ml-6">
          <Link href="/dashboard">
            <Button variant={pathname === "/dashboard" ? "default" : "ghost"} size="sm">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/transactions">
            <Button variant={pathname === "/transactions" ? "default" : "ghost"} size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Transactions
            </Button>
          </Link>
          <Link href="/categories">
            <Button variant={pathname === "/categories" ? "default" : "ghost"} size="sm">
              <PieChart className="h-4 w-4 mr-2" />
              Categories
            </Button>
          </Link>
          <Link href="/budgets">
            <Button variant={pathname === "/budgets" ? "default" : "ghost"} size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Budgets
            </Button>
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

