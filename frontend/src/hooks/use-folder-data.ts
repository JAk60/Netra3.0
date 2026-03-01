"use client"

import { useState, useEffect, useCallback } from "react"

// ── Types ─────────────────────────────────────────────────────────────────────

export type DocLevel = "global" | "ship" | "equipment"

export interface DocFile {
  id: string
  name: string
  size: number
  type: string
  level: DocLevel
  shipId?: string
  shipName?: string
  equipmentId?: string
  equipmentName?: string
  uploadedAt: string
  uploadedBy: string
  dataUrl: string // base64 stored in localStorage
}

export interface SearchResult {
  file: DocFile
  matchField: "name" | "type"
}

// ── Storage key helpers ───────────────────────────────────────────────────────

const STORAGE_KEY = "netra_documents"

function load(): DocFile[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(files: DocFile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
  } catch (e) {
    // localStorage quota exceeded — strip dataUrls of older files as fallback
    console.error("Storage quota exceeded", e)
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDocumentStore() {
  const [files, setFiles] = useState<DocFile[]>([])

  useEffect(() => {
    setFiles(load())
  }, [])

  const persist = (updated: DocFile[]) => {
    setFiles(updated)
    save(updated)
  }

  // Upload a file into the store
  const uploadFile = useCallback(
    (
      raw: File,
      level: DocLevel,
      meta: { shipId?: string; shipName?: string; equipmentId?: string; equipmentName?: string }
    ) => {
      return new Promise<DocFile>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const doc: DocFile = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: raw.name,
            size: raw.size,
            type: raw.name.split(".").pop()?.toLowerCase() ?? "file",
            level,
            shipId: meta.shipId,
            shipName: meta.shipName,
            equipmentId: meta.equipmentId,
            equipmentName: meta.equipmentName,
            uploadedAt: new Date().toISOString(),
            uploadedBy: "User",
            dataUrl: reader.result as string,
          }
          const updated = [...load(), doc]
          persist(updated)
          setFiles(updated)
          resolve(doc)
        }
        reader.onerror = reject
        reader.readAsDataURL(raw)
      })
    },
    []
  )

  const deleteFile = useCallback((id: string) => {
    const updated = load().filter((f) => f.id !== id)
    persist(updated)
    setFiles(updated)
  }, [])

  // Level-scoped getters
  const getGlobalFiles = useCallback(
    () => files.filter((f) => f.level === "global"),
    [files]
  )

  const getShipFiles = useCallback(
    (shipId: string) => files.filter((f) => f.level === "ship" && f.shipId === shipId),
    [files]
  )

  const getEquipmentFiles = useCallback(
    (equipmentId: string) =>
      files.filter((f) => f.level === "equipment" && f.equipmentId === equipmentId),
    [files]
  )

  // Search across all levels
  const search = useCallback(
    (query: string): SearchResult[] => {
      if (!query.trim()) return []
      const q = query.toLowerCase()
      return files
        .filter((f) => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q))
        .map((f) => ({
          file: f,
          matchField: f.name.toLowerCase().includes(q) ? "name" : "type",
        }))
    },
    [files]
  )

  return {
    files,
    uploadFile,
    deleteFile,
    getGlobalFiles,
    getShipFiles,
    getEquipmentFiles,
    search,
  }
}