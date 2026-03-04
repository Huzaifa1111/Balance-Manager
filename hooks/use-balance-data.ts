"use client"

import { useState, useEffect } from "react"
import { dbManager, type BalanceEntry, type HistoryEntry } from "@/lib/indexeddb"

export function useBalanceData() {
  const [entries, setEntries] = useState<BalanceEntry[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeDB()
  }, [])

  const initializeDB = async () => {
    try {
      await dbManager.init()
      await loadEntries()
      await loadHistory()
    } catch (err) {
      setError("Failed to initialize database")
      console.error("DB initialization error:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadEntries = async () => {
    try {
      const data = await dbManager.getAllBalanceEntries()
      setEntries(data)
    } catch (err) {
      setError("Failed to load entries")
      console.error("Load entries error:", err)
    }
  }

  const loadHistory = async () => {
    try {
      const data = await dbManager.getAllHistory()
      setHistory(data)
    } catch (err) {
      setError("Failed to load history")
      console.error("Load history error:", err)
    }
  }

  const addEntry = async (entry: Omit<BalanceEntry, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newEntry = await dbManager.addBalanceEntry(entry)
      setEntries((prev) => [...prev, newEntry])
      await loadHistory() // Refresh history
      return newEntry
    } catch (err) {
      setError("Failed to add entry")
      console.error("Add entry error:", err)
      throw err
    }
  }

  const updateEntry = async (id: number, updates: Partial<BalanceEntry>) => {
    try {
      const updatedEntry = await dbManager.updateBalanceEntry(id, updates)
      setEntries((prev) => prev.map((entry) => (entry.id === id ? updatedEntry : entry)))
      await loadHistory() // Refresh history
      return updatedEntry
    } catch (err) {
      setError("Failed to update entry")
      console.error("Update entry error:", err)
      throw err
    }
  }

  const deleteEntry = async (id: number) => {
    try {
      await dbManager.deleteBalanceEntry(id)
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
      await loadHistory() // Refresh history
    } catch (err) {
      setError("Failed to delete entry")
      console.error("Delete entry error:", err)
      throw err
    }
  }

  const getTotalBalance = () => {
    return entries.reduce((total, entry) => total + entry.amount, 0)
  }

  const clearHistory = async () => {
    try {
      await dbManager.clearHistory()
      setHistory([])
    } catch (err) {
      setError("Failed to clear history")
      console.error("Clear history error:", err)
      throw err
    }
  }

  return {
    entries,
    history,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    getTotalBalance,
    clearHistory,
    refreshData: () => {
      loadEntries()
      loadHistory()
    },
  }
}
