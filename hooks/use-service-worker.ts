"use client"

import { useEffect, useState } from "react"

export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Check if service workers are supported
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      registerServiceWorker()
    }

    // Set up online/offline listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial online status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const isPreviewEnvironment =
        window.location.hostname.includes("vusercontent.net") ||
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname === "localhost"

      if (isPreviewEnvironment) {
        console.log("Service Worker: Skipping registration in preview/development environment")
        return
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      })

      setRegistration(registration)

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true)
            }
          })
        }
      })

      console.log("Service Worker registered successfully:", registration)
    } catch (error) {
      console.warn("Service Worker registration failed (this is normal in development):", error)

      // Don't throw the error, just log it as service worker is optional for development
      if (error instanceof Error && error.message.includes("MIME type")) {
        console.log("Service Worker: MIME type error - this typically happens in development environments")
      }
    }
  }

  const updateServiceWorker = async () => {
    if (registration) {
      try {
        await registration.update()
        window.location.reload()
      } catch (error) {
        console.error("Service Worker update failed:", error)
      }
    }
  }

  return {
    isOnline,
    isUpdateAvailable,
    updateServiceWorker,
    registration,
  }
}
