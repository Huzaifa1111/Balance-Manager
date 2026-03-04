"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BalanceEntry } from "@/lib/indexeddb"
import { Pencil, Trash2, IndianRupee } from "lucide-react"

interface BalanceEntryListProps {
  entries: BalanceEntry[]
  onEdit: (entry: BalanceEntry) => void
  onDelete: (entry: BalanceEntry) => void
  totalBalance: number
}

export function BalanceEntryList({ entries, onEdit, onDelete, totalBalance }: BalanceEntryListProps) {
  const formatCurrency = (amount: number) => {
    return `RS ${Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-4">
      {/* Total Balance Card */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Balance</p>
              <p className="text-3xl font-bold">
                RS {totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <IndianRupee className="h-8 w-8 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="space-y-3">
        {sortedEntries.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No balance entries yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first entry to get started!</p>
            </CardContent>
          </Card>
        ) : (
          sortedEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">{entry.title}</h3>
                      <Badge variant={entry.amount >= 0 ? "default" : "destructive"} className="text-xs">
                        {entry.amount >= 0 ? "+" : ""}
                        {formatCurrency(entry.amount)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
                  </div>

                  <div className="flex gap-1 ml-4">
                    <Button size="sm" variant="outline" onClick={() => onEdit(entry)} className="h-8 w-8 p-0">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit entry</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(entry)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-50 hover:bg-red-600 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete entry</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
