"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Plus, Minus, Calculator } from "lucide-react"
import type { BalanceEntry } from "@/lib/indexeddb"

interface BalanceEntryFormProps {
  entry?: BalanceEntry | null
  onSubmit: (data: { title: string; amount: number; date: string }) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export function BalanceEntryForm({ entry, onSubmit, onCancel, isEditing = false }: BalanceEntryFormProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false)
  const [pendingData, setPendingData] = useState<{ title: string; amount: number; date: string } | null>(null)

  const [showAddInput, setShowAddInput] = useState(false)
  const [showSubtractInput, setShowSubtractInput] = useState(false)
  const [addValue, setAddValue] = useState("")
  const [subtractValue, setSubtractValue] = useState("")
  const [originalAmount, setOriginalAmount] = useState(0)

  useEffect(() => {
    if (entry) {
      setTitle(entry.title)
      setAmount(entry.amount.toString())
      setDate(entry.date)
      setOriginalAmount(entry.amount)
    } else {
      // Set default date to today
      const today = new Date().toISOString().split("T")[0]
      setDate(today)
    }
  }, [entry])

  const handleAdd = () => {
    if (addValue && !isNaN(Number(addValue))) {
      const newAmount = originalAmount + Number(addValue)
      setAmount(newAmount.toString())
      setAddValue("")
      setShowAddInput(false)
    }
  }

  const handleSubtract = () => {
    if (subtractValue && !isNaN(Number(subtractValue))) {
      const newAmount = originalAmount - Number(subtractValue)
      setAmount(newAmount.toString())
      setSubtractValue("")
      setShowSubtractInput(false)
    }
  }

  const handleCancel = () => {
    setShowAddInput(false)
    setShowSubtractInput(false)
    setAddValue("")
    setSubtractValue("")
    if (entry) {
      setAmount(originalAmount.toString())
    }
    onCancel()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !amount || !date) {
      return
    }

    const formData = {
      title: title.trim(),
      amount: Number.parseFloat(amount),
      date,
    }

    if (isEditing) {
      setPendingData(formData)
      setShowUpdateConfirm(true)
      return
    }

    // For new entries, submit directly
    await submitForm(formData)
  }

  const submitForm = async (data: { title: string; amount: number; date: string }) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)

      // Reset form if adding new entry
      if (!isEditing) {
        setTitle("")
        setAmount("")
        const today = new Date().toISOString().split("T")[0]
        setDate(today)
      }
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateConfirm = async () => {
    if (pendingData) {
      await submitForm(pendingData)
      setPendingData(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace("₹", "RS ")
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">
            {isEditing ? "Edit Balance Entry" : "Add New Balance Entry"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Salary, Groceries, Rent"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount (RS)
              </Label>
              <div className="space-y-3">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full"
                  required
                />

                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddInput(!showAddInput)
                        setShowSubtractInput(false)
                        setSubtractValue("")
                      }}
                      className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowSubtractInput(!showSubtractInput)
                        setShowAddInput(false)
                        setAddValue("")
                      }}
                      className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Minus className="h-4 w-4" />
                      Subtract
                    </Button>
                  </div>
                )}

                {showAddInput && (
                  <div className="flex gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Calculator className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-sm text-green-700 font-medium">Add Amount</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={addValue}
                          onChange={(e) => setAddValue(e.target.value)}
                          placeholder="Enter amount to add"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAdd}
                          disabled={!addValue || isNaN(Number(addValue))}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Add
                        </Button>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        {addValue && !isNaN(Number(addValue))
                          ? `New amount: ${formatCurrency(originalAmount + Number(addValue))}`
                          : `Current: ${formatCurrency(originalAmount)}`}
                      </p>
                    </div>
                  </div>
                )}

                {showSubtractInput && (
                  <div className="flex gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <Calculator className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-sm text-red-700 font-medium">Subtract Amount</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={subtractValue}
                          onChange={(e) => setSubtractValue(e.target.value)}
                          placeholder="Enter amount to subtract"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSubtract}
                          disabled={!subtractValue || isNaN(Number(subtractValue))}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Subtract
                        </Button>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        {subtractValue && !isNaN(Number(subtractValue))
                          ? `New amount: ${formatCurrency(originalAmount - Number(subtractValue))}`
                          : `Current: ${formatCurrency(originalAmount)}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !amount || !date}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Update Entry" : "Add Entry"}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showUpdateConfirm}
        onOpenChange={setShowUpdateConfirm}
        title="Update Entry"
        description={
          pendingData
            ? `Are you sure you want to update "${entry?.title}" to "${pendingData.title}" with amount ${formatCurrency(pendingData.amount)}? This action will be saved to your history.`
            : "Are you sure you want to update this entry?"
        }
        confirmText="Update"
        cancelText="Cancel"
        onConfirm={handleUpdateConfirm}
      />
    </>
  )
}
