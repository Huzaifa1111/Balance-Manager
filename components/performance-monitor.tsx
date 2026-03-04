"use client"

import { useEffect } from "react"

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run performance monitoring in production
    if (process.env.NODE_ENV !== "production") return

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metricName = entry.name
        const value = Math.round(entry.startTime + entry.duration)

        // Log to console in development, send to analytics in production
        console.log(`${metricName}: ${value}ms`)

        // In a real app, you'd send this to your analytics service
        // analytics.track('web_vital', { metric: metricName, value })
      }
    })

    // Observe paint and navigation timing
    observer.observe({ entryTypes: ["paint", "navigation", "largest-contentful-paint"] })

    // Monitor memory usage if available
    if ("memory" in performance) {
      const memoryInfo = (performance as any).memory
      console.log("Memory usage:", {
        used: Math.round(memoryInfo.usedJSHeapSize / 1048576) + " MB",
        total: Math.round(memoryInfo.totalJSHeapSize / 1048576) + " MB",
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1048576) + " MB",
      })
    }

    return () => observer.disconnect()
  }, [])

  return null
}
