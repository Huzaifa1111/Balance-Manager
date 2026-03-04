"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileFABProps {
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function MobileFAB({ onClick, disabled = false, className }: MobileFABProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "focus:ring-4 focus:ring-primary/20",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Add new entry</span>
    </Button>
  )
}
