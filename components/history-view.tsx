"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { HistoryEntry } from "@/lib/indexeddb"
import { Clock, Plus, Edit, Trash2, Trash, ChevronDown } from "lucide-react"
import { useState } from "react"

interface HistoryViewProps {
  history: HistoryEntry[]
  onClearHistory?: () => void
}

const PAGE_SIZE = 20

export function HistoryView({ history, onClearHistory }: HistoryViewProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="h-4 w-4" />
      case "update":
        return <Edit className="h-4 w-4" />
      case "delete":
        return <Trash2 className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case "create":
        return "Created"
      case "update":
        return "Updated"
      case "delete":
        return "Deleted"
      default:
        return "Unknown"
    }
  }

  const visibleHistory = history.slice(0, visibleCount)
  const hasMore = history.length > visibleCount

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              Change History
            </CardTitle>
            {history.length > 0 && onClearHistory && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearHistory}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent"
              >
                <Trash className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {history.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No history available yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Changes will appear here as you modify entries.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {visibleHistory.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getActionColor(entry.action)}`}>
                      {getActionIcon(entry.action)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getActionText(entry.action)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
                      </div>

                      {entry.action === "create" && entry.newData && (
                        <div className="text-sm">
                          <p className="font-medium">{entry.newData.title}</p>
                          <p className="text-muted-foreground">
                            Amount: {formatCurrency(entry.newData.amount)} • Date:{" "}
                            {new Date(entry.newData.date).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {entry.action === "update" && entry.previousData && entry.newData && (
                        <div className="text-sm space-y-1">
                          <p className="font-medium">{entry.newData.title}</p>
                          {entry.previousData.title !== entry.newData.title && (
                            <p className="text-muted-foreground">
                              Title: "{entry.previousData.title}" → "{entry.newData.title}"
                            </p>
                          )}
                          {entry.previousData.amount !== entry.newData.amount && (
                            <p className="text-muted-foreground">
                              Amount: {formatCurrency(entry.previousData.amount)} → {formatCurrency(entry.newData.amount)}
                            </p>
                          )}
                          {entry.previousData.date !== entry.newData.date && (
                            <p className="text-muted-foreground">
                              Date: {new Date(entry.previousData.date).toLocaleDateString()} →{" "}
                              {new Date(entry.newData.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      {entry.action === "delete" && entry.previousData && (
                        <div className="text-sm">
                          <p className="font-medium">{entry.previousData.title}</p>
                          <p className="text-muted-foreground">
                            Amount: {formatCurrency(entry.previousData.amount)} • Date:{" "}
                            {new Date(entry.previousData.date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {hasMore && (
              <Button
                variant="ghost"
                className="w-full py-6 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                <ChevronDown className="h-4 w-4" />
                Load More History
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
