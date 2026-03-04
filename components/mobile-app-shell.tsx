"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Menu, X, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useServiceWorker } from "@/hooks/use-service-worker"

interface MobileAppShellProps {
  children: React.ReactNode
  title: string
  onRefresh?: () => void
  isRefreshing?: boolean
  isLoading?: boolean
  onNavigate?: (tab: string) => void
  activeTab?: string
}

export function MobileAppShell({
  children,
  title,
  onRefresh,
  isRefreshing = false,
  isLoading = false,
  onNavigate,
  activeTab,
}: MobileAppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isOnline, isUpdateAvailable, updateServiceWorker } = useServiceWorker()

  const handleNavigate = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab)
    }
    setIsMenuOpen(false)
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  const handleUpdate = () => {
    updateServiceWorker()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card shadow-2xl border border-border/50 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-x-0 -bottom-1 h-1 bg-primary/20 blur-sm rounded-full" />
            </div>
            <div className="space-y-1 text-center">
              <p className="font-semibold text-foreground tracking-tight">Processing</p>
              <p className="text-xs text-muted-foreground animate-pulse">Please wait a moment...</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="h-1 bg-primary" />

      {/* Update Available Banner */}
      {isUpdateAvailable && (
        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 text-sm text-center">
          <span>New version available! </span>
          <button onClick={handleUpdate} className="underline font-medium">
            Update now
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Online/Offline Indicator */}
            <div className="flex items-center gap-1">
              {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            </div>

            {/* Refresh Button */}
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="p-2">
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>

        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 text-sm text-center">
            You're offline. Data is stored locally and will be available when you return.
          </div>
        )}
      </header>

      {/* Side Menu Overlay */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} />}

      {/* Side Menu */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-primary">Bank Balance Manager</h2>
          <p className="text-sm text-muted-foreground">Personal Finance Tracker</p>
        </div>

        <nav className="p-4 space-y-2">
          <Button
            variant={activeTab === "dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleNavigate("dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant={activeTab === "history" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleNavigate("history")}
          >
            History
          </Button>
          <Button
            variant={activeTab === "notes" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleNavigate("notes")}
          >
            Notes
          </Button>
          <Button
            variant={activeTab === "settings" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleNavigate("settings")}
          >
            Settings
          </Button>
        </nav>

        {/* Connection Status in Menu */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span>Online - Data synced</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span>Offline - Local storage</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* Bottom Safe Area for iOS */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </div>
  )
}
