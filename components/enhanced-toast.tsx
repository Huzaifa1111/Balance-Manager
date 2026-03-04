"use client"

import { CheckCircle, XCircle } from "lucide-react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function EnhancedToaster() {
  const { toasts } = useToast()

  const getToastIcon = (variant?: "default" | "destructive") => {
    switch (variant) {
      case "destructive":
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast key={id} variant={variant} {...props} className="flex items-start gap-3 p-4">
          <div className="flex-shrink-0 mt-0.5">{getToastIcon(variant)}</div>
          <div className="flex-1 min-w-0">
            {title && <ToastTitle className="text-sm font-medium">{title}</ToastTitle>}
            {description && (
              <ToastDescription className="text-sm text-muted-foreground mt-1">{description}</ToastDescription>
            )}
          </div>
          {action}
          <ToastClose className="flex-shrink-0" />
        </Toast>
      ))}
      <ToastViewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}
