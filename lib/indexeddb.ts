export interface BalanceEntry {
  id?: number
  title: string
  amount: number
  date: string
  createdAt: string
  updatedAt: string
}

export interface HistoryEntry {
  id?: number
  entryId: number
  action: "create" | "update" | "delete"
  previousData: BalanceEntry | null
  newData: BalanceEntry | null
  timestamp: string
}

class IndexedDBManager {
  private dbName = "BankBalanceDB"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create balance entries store
        if (!db.objectStoreNames.contains("balanceEntries")) {
          const balanceStore = db.createObjectStore("balanceEntries", {
            keyPath: "id",
            autoIncrement: true,
          })
          balanceStore.createIndex("date", "date", { unique: false })
        }

        // Create history store
        if (!db.objectStoreNames.contains("history")) {
          const historyStore = db.createObjectStore("history", {
            keyPath: "id",
            autoIncrement: true,
          })
          historyStore.createIndex("entryId", "entryId", { unique: false })
          historyStore.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  private getStore(storeName: string, mode: IDBTransactionMode = "readonly") {
    if (!this.db) throw new Error("Database not initialized")
    const transaction = this.db.transaction([storeName], mode)
    return transaction.objectStore(storeName)
  }

  // Balance Entry CRUD operations
  async addBalanceEntry(entry: Omit<BalanceEntry, "id" | "createdAt" | "updatedAt">): Promise<BalanceEntry> {
    const now = new Date().toISOString()
    const newEntry: BalanceEntry = {
      ...entry,
      createdAt: now,
      updatedAt: now,
    }

    return new Promise((resolve, reject) => {
      const store = this.getStore("balanceEntries", "readwrite")
      const request = store.add(newEntry)

      request.onsuccess = async () => {
        const id = request.result as number
        const entryWithId = { ...newEntry, id }

        // Add to history
        await this.addHistoryEntry({
          entryId: id,
          action: "create",
          previousData: null,
          newData: entryWithId,
          timestamp: now,
        })

        resolve(entryWithId)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getAllBalanceEntries(): Promise<BalanceEntry[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("balanceEntries")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateBalanceEntry(id: number, updates: Partial<BalanceEntry>): Promise<BalanceEntry> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get current entry for history
        const currentEntry = await this.getBalanceEntry(id)
        if (!currentEntry) throw new Error("Entry not found")

        const updatedEntry: BalanceEntry = {
          ...currentEntry,
          ...updates,
          id,
          updatedAt: new Date().toISOString(),
        }

        const store = this.getStore("balanceEntries", "readwrite")
        const request = store.put(updatedEntry)

        request.onsuccess = async () => {
          // Add to history
          await this.addHistoryEntry({
            entryId: id,
            action: "update",
            previousData: currentEntry,
            newData: updatedEntry,
            timestamp: new Date().toISOString(),
          })

          resolve(updatedEntry)
        }
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  async deleteBalanceEntry(id: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get current entry for history
        const currentEntry = await this.getBalanceEntry(id)
        if (!currentEntry) throw new Error("Entry not found")

        const store = this.getStore("balanceEntries", "readwrite")
        const request = store.delete(id)

        request.onsuccess = async () => {
          // Add to history
          await this.addHistoryEntry({
            entryId: id,
            action: "delete",
            previousData: currentEntry,
            newData: null,
            timestamp: new Date().toISOString(),
          })

          resolve()
        }
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getBalanceEntry(id: number): Promise<BalanceEntry | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("balanceEntries")
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  // History operations
  async addHistoryEntry(entry: Omit<HistoryEntry, "id">): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("history", "readwrite")
      const request = store.add(entry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAllHistory(): Promise<HistoryEntry[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("history")
      const index = store.index("timestamp")
      const request = index.getAll()

      request.onsuccess = () => {
        // Sort by timestamp descending (newest first)
        const history = request.result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        resolve(history)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearHistory(): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("history", "readwrite")
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const dbManager = new IndexedDBManager()
