import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { EnhancedToaster } from "@/components/enhanced-toast"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ErrorBoundary } from "@/components/error-boundary"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { Suspense } from "react"
import { PasswordGuard } from "@/components/password-guard"
import "./globals.css"

export const metadata: Metadata = {
  title: "Bank Balance Manager",
  description: "Track and manage your personal finances offline with this secure PWA",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bank Balance Manager",
  },
  icons: {
    icon: "/icon-192x192.jpg",
    apple: "/icon-192x192.jpg",
  },
  openGraph: {
    title: "Bank Balance Manager",
    description: "Track and manage your personal finances offline",
    type: "website",
    images: ["/icon-512x512.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Bank Balance Manager",
    description: "Track and manage your personal finances offline",
    images: ["/icon-512x512.jpg"],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#15803d",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <PasswordGuard>
              {children}
            </PasswordGuard>
            <EnhancedToaster />
            <PWAInstallPrompt />
            <PerformanceMonitor />
          </Suspense>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
