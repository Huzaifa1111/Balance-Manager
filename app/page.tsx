"use client"

import { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useBalanceData } from "@/hooks/use-balance-data"
import { BalanceEntryForm } from "@/components/balance-entry-form"
import { BalanceEntryList } from "@/components/balance-entry-list"
import { HistoryView } from "@/components/history-view"
import { MobileAppShell } from "@/components/mobile-app-shell"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { MobileFAB } from "@/components/mobile-fab"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import type { BalanceEntry } from "@/lib/indexeddb"
import {
  Wallet,
  History,
  StickyNote,
  Settings,
  KeyRound,
  Save,
  Trash2,
  Plus,
  Search,
  Filter,
  Edit,
  MoreVertical,
  Calendar,
  X,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Note {
  id: string
  title: string
  content: string
  section: string
  updatedAt: string
}

const SECTIONS = ["General", "Reminders", "Budget", "Goals", "Important", "Welfare"]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<BalanceEntry | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; entry: BalanceEntry | null }>({
    show: false,
    entry: null,
  })
  const [clearHistoryConfirm, setClearHistoryConfirm] = useState(false)
  const [noteDeleteConfirm, setNoteDeleteConfirm] = useState<{ show: boolean; note: Note | null }>({
    show: false,
    note: null,
  })

  // Enhanced Notes State
  const [notes, setNotes] = useState<Note[]>([])
  const [noteSearch, setNoteSearch] = useState("")
  const [noteFilter, setNoteFilter] = useState("All")
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [noteSection, setNoteSection] = useState("General")

  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const { toast } = useToast()

  const {
    entries,
    history,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    getTotalBalance,
    refreshData,
    clearHistory,
  } = useBalanceData()

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("app_notes_v2")
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (e) {
        console.error("Failed to parse notes", e)
        // Fallback or migration if needed
        const legacyNote = localStorage.getItem("app_notes")
        if (legacyNote) {
          const migrated: Note = {
            id: Date.now().toString(),
            title: "Imported Note",
            content: legacyNote,
            section: "General",
            updatedAt: new Date().toISOString(),
          }
          setNotes([migrated])
          localStorage.setItem("app_notes_v2", JSON.stringify([migrated]))
        }
      }
    }
  }, [])

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes)
    localStorage.setItem("app_notes_v2", JSON.stringify(updatedNotes))
  }

  const handleAddNote = () => {
    if (!noteTitle.trim() && !noteContent.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      title: noteTitle || "Untitled Note",
      content: noteContent,
      section: noteSection,
      updatedAt: new Date().toISOString(),
    }

    saveNotes([newNote, ...notes])
    resetNoteForm()
    toast({ title: "Note Added", description: "Your new note has been saved." })
  }

  const handleUpdateNote = () => {
    if (!editingNote) return

    const updatedNotes = notes.map((n) =>
      n.id === editingNote.id
        ? {
          ...n,
          title: noteTitle,
          content: noteContent,
          section: noteSection,
          updatedAt: new Date().toISOString(),
        }
        : n,
    )

    saveNotes(updatedNotes)
    resetNoteForm()
    toast({ title: "Note Updated", description: "Your note has been saved." })
  }

  const handleDeleteNoteRequest = (note: Note) => {
    setNoteDeleteConfirm({ show: true, note })
  }

  const handleDeleteNoteConfirm = () => {
    if (!noteDeleteConfirm.note) return
    const updatedNotes = notes.filter((n) => n.id !== noteDeleteConfirm.note!.id)
    saveNotes(updatedNotes)
    setNoteDeleteConfirm({ show: false, note: null })
    toast({ title: "Note Deleted", description: "The note has been removed." })
  }

  const resetNoteForm = () => {
    setNoteTitle("")
    setNoteContent("")
    setNoteSection("General")
    setEditingNote(null)
    setIsNoteDrawerOpen(false)
  }

  const openEditNote = (note: Note) => {
    setEditingNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setNoteSection(note.section)
    setIsNoteDrawerOpen(true)
  }

  // Filter and Search Logic
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesSearch =
          note.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
          note.content.toLowerCase().includes(noteSearch.toLowerCase())
        const matchesFilter = noteFilter === "All" || note.section === noteFilter
        return matchesSearch && matchesFilter
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [notes, noteSearch, noteFilter])

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 4) {
      toast({
        title: "Error",
        description: "Password must be at least 4 characters long.",
        variant: "destructive",
      })
      return
    }
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem("app_password", newPassword)
    setNewPassword("")
    setConfirmNewPassword("")
    toast({
      title: "Success",
      description: "Password changed successfully!",
    })
  }

  // ... (Other handlers like handleRefresh, handleAddEntry, etc. remain the same)
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
      toast({
        title: "Refreshed",
        description: "Data has been updated successfully!",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleAddEntry = async (data: { title: string; amount: number; date: string }) => {
    try {
      await addEntry(data)
      setShowAddForm(false)
      toast({
        title: "Success",
        description: "Balance entry added successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateEntry = async (data: { title: string; amount: number; date: string }) => {
    if (!editingEntry?.id) return

    try {
      await updateEntry(editingEntry.id, data)
      setEditingEntry(null)
      toast({
        title: "Success",
        description: "Balance entry updated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRequest = (entry: BalanceEntry) => {
    setDeleteConfirm({ show: true, entry })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.entry?.id) return

    try {
      await deleteEntry(deleteConfirm.entry.id)
      toast({
        title: "Success",
        description: "Balance entry deleted successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirm({ show: false, entry: null })
    }
  }

  const handleEditEntry = (entry: BalanceEntry) => {
    setEditingEntry(entry)
    setShowAddForm(false)
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
  }

  const handleFABClick = () => {
    setShowAddForm(true)
    setEditingEntry(null)
  }

  const handleClearHistoryRequest = () => {
    setClearHistoryConfirm(true)
  }

  const handleClearHistoryConfirm = async () => {
    try {
      await clearHistory()
      toast({
        title: "Success",
        description: "History cleared successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setClearHistoryConfirm(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `RS ${Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <MobileAppShell title="Loading...">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your balance data...</p>
          </div>
        </div>
      </MobileAppShell>
    )
  }

  if (error) {
    return (
      <MobileAppShell title="Error">
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </MobileAppShell>
    )
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Bank Balance Manager"
      case "history":
        return "Transaction History"
      case "notes":
        return "Financial Notes"
      case "settings":
        return "Settings"
      default:
        return "Bank Balance Manager"
    }
  }

  return (
    <>
      <MobileAppShell
        title={getPageTitle()}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        isLoading={loading}
        activeTab={activeTab}
        onNavigate={setActiveTab}
      >
        <PullToRefresh onRefresh={handleRefresh} disabled={activeTab !== "dashboard"}>
          <div className="px-4 py-6 pb-24">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              <TabsContent value="dashboard" className="space-y-6">
                <Dialog open={showAddForm || !!editingEntry} onOpenChange={(open) => {
                  if (!open) {
                    if (editingEntry) handleCancelEdit()
                    else setShowAddForm(false)
                  }
                }}>
                  <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden outline-none border-none sm:rounded-2xl">
                    <DialogHeader className="p-6 pb-2">
                      <DialogTitle>{editingEntry ? "Edit Entry" : "Add New Entry"}</DialogTitle>
                      <DialogDescription>
                        {editingEntry ? "Update your transaction details." : "Record a new balance change."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="px-6 pb-6">
                      <BalanceEntryForm
                        entry={editingEntry}
                        onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry}
                        onCancel={editingEntry ? handleCancelEdit : () => setShowAddForm(false)}
                        isEditing={!!editingEntry}
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                <BalanceEntryList
                  entries={entries}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteRequest}
                  totalBalance={getTotalBalance()}
                />
              </TabsContent>

              <TabsContent value="history">
                <HistoryView history={history} onClearHistory={handleClearHistoryRequest} />
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                {/* Notes Search & Filter */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search notes..."
                      className="pl-9 h-10 rounded-full"
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <Button
                      variant={noteFilter === "All" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full px-4 h-8 text-xs whitespace-nowrap"
                      onClick={() => setNoteFilter("All")}
                    >
                      All Notes
                    </Button>
                    {SECTIONS.map((section) => (
                      <Button
                        key={section}
                        variant={noteFilter === section ? "default" : "outline"}
                        size="sm"
                        className="rounded-full px-4 h-8 text-xs whitespace-nowrap"
                        onClick={() => setNoteFilter(section)}
                      >
                        {section}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Notes List */}
                <div className="grid gap-4">
                  {filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-muted rounded-full p-4 mb-4">
                        <StickyNote className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-foreground">No notes found</h3>
                      <p className="text-sm text-muted-foreground max-w-[200px] mt-1">
                        Try a different search term or add your first note.
                      </p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsNoteDrawerOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Note
                      </Button>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <Card key={note.id} className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
                        <div className="p-4" onClick={() => openEditNote(note)}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-base line-clamp-1">{note.title}</h4>
                            <Badge variant="outline" className="text-[10px] px-2 py-0 border-primary/20 bg-primary/5 text-primary">
                              {note.section}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
                            {note.content}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/30">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive/70 hover:text-destructive hover:bg-destructive/5"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteNoteRequest(note)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                {/* Add Note Button (FAB for Notes) */}
                <Button
                  className="fixed right-6 bottom-20 rounded-full h-12 w-12 shadow-lg z-50 p-0"
                  onClick={() => setIsNoteDrawerOpen(true)}
                >
                  <Plus className="h-6 w-6" />
                </Button>

                {/* Note Editor Dialog */}
                <Dialog open={isNoteDrawerOpen} onOpenChange={setIsNoteDrawerOpen}>
                  <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden outline-none border-none sm:rounded-2xl">
                    <div className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="p-6 pb-2">
                        <DialogTitle>{editingNote ? "Edit Note" : "New Note"}</DialogTitle>
                        <DialogDescription>
                          Organize your thoughts and reminders in sections.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="note-title">Title</Label>
                          <Input
                            id="note-title"
                            placeholder="Note title..."
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="note-section">Section</Label>
                          <Select value={noteSection} onValueChange={setNoteSection}>
                            <SelectTrigger id="note-section">
                              <SelectValue placeholder="Select a section" />
                            </SelectTrigger>
                            <SelectContent>
                              {SECTIONS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="note-content">Content</Label>
                          <Textarea
                            id="note-content"
                            placeholder="Write your note here..."
                            className="min-h-[200px] resize-none"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                          />
                        </div>
                      </div>

                      <DialogFooter className="p-6 pt-2 bg-muted/30 flex-row gap-2">
                        <Button variant="outline" className="flex-1" onClick={resetNoteForm}>
                          Cancel
                        </Button>
                        <Button className="flex-1" onClick={editingNote ? handleUpdateNote : handleAddNote}>
                          {editingNote ? "Update Note" : "Save Note"}
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-primary" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Update your app access password.</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleChangePassword}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 4 characters"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-new-password">Confirm Password</Label>
                        <Input
                          id="confirm-new-password"
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Repeat your new password"
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full">
                        Update Password
                      </Button>
                    </CardFooter>
                  </form>
                </Card>

                <Card className="border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive flex items-center gap-2">
                      <Trash2 className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>Permanent actions that cannot be undone.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Clearing history will remove all logs of your balance changes but keep your current balances.
                    </p>
                    <Button variant="destructive" className="w-full" onClick={handleClearHistoryRequest}>
                      Clear Transaction History
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </PullToRefresh>

        {activeTab === "dashboard" && !showAddForm && !editingEntry && <MobileFAB onClick={handleFABClick} />}
      </MobileAppShell>

      <ConfirmationDialog
        open={deleteConfirm.show}
        onOpenChange={(open) => setDeleteConfirm({ show: open, entry: deleteConfirm.entry })}
        title="Delete Entry"
        description={
          deleteConfirm.entry
            ? `Are you sure you want to delete "${deleteConfirm.entry.title}" (${formatCurrency(deleteConfirm.entry.amount)})? This action cannot be undone, but will be saved to your history.`
            : "Are you sure you want to delete this entry?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmationDialog
        open={clearHistoryConfirm}
        onOpenChange={setClearHistoryConfirm}
        title="Clear History"
        description="Are you sure you want to clear all history? This action cannot be undone and will permanently delete all change records."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleClearHistoryConfirm}
      />

      <ConfirmationDialog
        open={noteDeleteConfirm.show}
        onOpenChange={(open) => setNoteDeleteConfirm({ show: open, note: noteDeleteConfirm.note })}
        title="Delete Note"
        description={
          noteDeleteConfirm.note
            ? `Are you sure you want to delete "${noteDeleteConfirm.note.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this note?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteNoteConfirm}
      />
    </>
  )
}
