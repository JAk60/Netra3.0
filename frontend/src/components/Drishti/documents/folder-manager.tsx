"use client"

import { useState, useMemo, useRef, useCallback } from "react"
import {
  Globe,
  Ship,
  Package,
  ChevronRight,
  Upload,
  Search,
  Trash2,
  Download,
  FileText,
  File,
  FileSpreadsheet,
  FileImage,
  X,
  FolderOpen,
  AlertCircle,
  Clock,
  HardDrive,
} from "lucide-react"
import { toast } from "sonner"
import { useDocumentStore, DocFile, DocLevel } from "@/hooks/use-folder-data"
import { useUserSelectionStore } from "@/store/UserSelectionStore"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

type NavNode =
  | { kind: "global" }
  | { kind: "ship"; shipId: string; shipName: string }
  | { kind: "equipment"; shipId: string; shipName: string; equipmentId: string; equipmentName: string }

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getFileIcon(type: string, size: "sm" | "lg" = "sm") {
  const cls = size === "lg" ? "w-10 h-10" : "w-4 h-4"
  const t = type.toLowerCase()
  if (["pdf"].includes(t)) return <FileText className={cn(cls, "text-red-400")} />
  if (["doc", "docx", "txt", "md"].includes(t)) return <FileText className={cn(cls, "text-blue-400")} />
  if (["xls", "xlsx", "csv"].includes(t)) return <FileSpreadsheet className={cn(cls, "text-emerald-400")} />
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(t)) return <FileImage className={cn(cls, "text-purple-400")} />
  return <File className={cn(cls, "text-slate-400")} />
}

function levelLabel(file: DocFile) {
  if (file.level === "global") return "Netra"
  if (file.level === "ship") return file.shipName ?? "Ship"
  return `${file.shipName} › ${file.equipmentName}`
}

// ── Sidebar tree ──────────────────────────────────────────────────────────────

interface SidebarProps {
  selected: NavNode
  onSelect: (node: NavNode) => void
  fileCounts: { global: number; ships: Record<string, number>; equipment: Record<string, number> }
}

function DocSidebar({ selected, onSelect, fileCounts }: SidebarProps) {
  const { ships, getEquipmentForShip } = useUserSelectionStore()
  const [expandedShips, setExpandedShips] = useState<Set<string>>(new Set())

  const toggleShip = (shipId: string) => {
    setExpandedShips((prev) => {
      const next = new Set(prev)
      next.has(shipId) ? next.delete(shipId) : next.add(shipId)
      return next
    })
  }

  const isGlobalSelected = selected.kind === "global"

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-700/60 bg-slate-900/80 backdrop-blur-sm">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold text-cyan-400 tracking-widest uppercase">
            Document Store
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {/* Global */}
        <button
          onClick={() => onSelect({ kind: "global" })}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all group",
            isGlobalSelected
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          )}
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left font-medium">Netra</span>
          {fileCounts.global > 0 && (
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded",
              isGlobalSelected ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-700 text-slate-400"
            )}>
              {fileCounts.global}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="pt-2 pb-1 px-3">
          <span className="text-[10px] font-mono text-slate-600 tracking-widest uppercase">Ships</span>
        </div>

        {/* Ships */}
        {ships.map((shipGroup) =>
          shipGroup.items.map((ship) => {
            const isShipSelected = selected.kind === "ship" && selected.shipId === ship.value
            const isExpanded = expandedShips.has(ship.value)
            const equipmentGroups = getEquipmentForShip(ship.value)
            const allEquipment = equipmentGroups.flatMap((g) => g.items)
            const shipCount = fileCounts.ships[ship.value] ?? 0

            return (
              <div key={ship.value}>
                {/* Ship row */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleShip(ship.value)}
                    className="p-1 text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
                  >
                    <ChevronRight
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>
                  <button
                    onClick={() => onSelect({ kind: "ship", shipId: ship.value, shipName: ship.label })}
                    className={cn(
                      "flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all",
                      isShipSelected
                        ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    )}
                  >
                    <Ship className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="flex-1 text-left text-xs font-medium truncate">{ship.label}</span>
                    {shipCount > 0 && (
                      <span className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5 rounded",
                        isShipSelected ? "bg-blue-500/20 text-blue-300" : "bg-slate-700 text-slate-400"
                      )}>
                        {shipCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Equipment children */}
                {isExpanded && allEquipment.map((eq) => {
                  const isEqSelected =
                    selected.kind === "equipment" && selected.equipmentId === eq.value
                  const eqCount = fileCounts.equipment[eq.value] ?? 0

                  return (
                    <button
                      key={eq.value}
                      onClick={() =>
                        onSelect({
                          kind: "equipment",
                          shipId: ship.value,
                          shipName: ship.label,
                          equipmentId: eq.value,
                          equipmentName: eq.label,
                        })
                      }
                      className={cn(
                        "w-full flex items-center gap-2 pl-10 pr-3 py-1.5 rounded-md text-xs transition-all",
                        isEqSelected
                          ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                          : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
                      )}
                    >
                      <Package className="w-3 h-3 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{eq.label}</span>
                      {eqCount > 0 && (
                        <span className={cn(
                          "text-[10px] font-mono px-1.5 py-0.5 rounded",
                          isEqSelected ? "bg-violet-500/20 text-violet-300" : "bg-slate-700 text-slate-500"
                        )}>
                          {eqCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })
        )}
      </nav>
    </aside>
  )
}

// ── File card ─────────────────────────────────────────────────────────────────

function FileCard({ file, onDelete, showLevel }: { file: DocFile; onDelete: (id: string) => void; showLevel?: boolean }) {
  const handleDownload = () => {
    const a = document.createElement("a")
    a.href = file.dataUrl
    a.download = file.name
    a.click()
  }

  const handleDelete = () => {
    toast(`Delete "${file.name}"?`, {
      description: "This action cannot be undone.",
      duration: 6000,
      action: {
        label: "Delete",
        onClick: () => {
          onDelete(file.id)
          toast.success("File deleted", { description: file.name })
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    })
  }

  return (
    <div className="group relative flex flex-col gap-3 p-4 rounded-lg border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-600/70 transition-all duration-200">
      {/* Level badge for search results */}
      {showLevel && (
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
            {levelLabel(file)}
          </span>
        </div>
      )}

      {/* Icon + name */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-slate-700/50">
          {getFileIcon(file.type, "sm")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {file.type.toUpperCase()} · {formatSize(file.size)}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <Clock className="w-3 h-3" />
        <span>{formatDate(file.uploadedAt)}</span>
      </div>

      {/* Actions — appear on hover */}
      <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDownload}
          className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded bg-slate-700 hover:bg-red-900/60 text-slate-400 hover:text-red-400 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Drop zone / upload area ───────────────────────────────────────────────────

function UploadZone({ onUpload, disabled }: { onUpload: (files: FileList) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handle = (files: FileList | null) => {
    if (files && files.length > 0) onUpload(files)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files) }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer",
        disabled
          ? "border-slate-700/30 opacity-40 cursor-not-allowed"
          : dragging
          ? "border-cyan-500/70 bg-cyan-500/5"
          : "border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/30"
      )}
    >
      <Upload className={cn("w-8 h-8", dragging ? "text-cyan-400" : "text-slate-600")} />
      <div className="text-center">
        <p className="text-sm text-slate-400">
          {disabled ? "Select a location to upload" : "Drop files here or click to browse"}
        </p>
        <p className="text-xs text-slate-600 mt-1 font-mono">All file types supported</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <FolderOpen className="w-12 h-12 text-slate-700" />
      <p className="text-sm text-slate-500">No files in {label}</p>
      <p className="text-xs text-slate-600 font-mono">Upload files using the zone above</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DocumentManager() {
  const store = useDocumentStore()
  const [selected, setSelected] = useState<NavNode>({ kind: "global" })
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Compute file counts for sidebar badges
  const fileCounts = useMemo(() => {
    const ships: Record<string, number> = {}
    const equipment: Record<string, number> = {}
    let global = 0

    store.files.forEach((f) => {
      if (f.level === "global") global++
      else if (f.level === "ship" && f.shipId) ships[f.shipId] = (ships[f.shipId] ?? 0) + 1
      else if (f.level === "equipment" && f.equipmentId) equipment[f.equipmentId] = (equipment[f.equipmentId] ?? 0) + 1
    })

    return { global, ships, equipment }
  }, [store.files])

  // Current view files
  const currentFiles = useMemo(() => {
    if (selected.kind === "global") return store.getGlobalFiles()
    if (selected.kind === "ship") return store.getShipFiles(selected.shipId)
    return store.getEquipmentFiles(selected.equipmentId)
  }, [selected, store])

  // Search results
  const searchResults = useMemo(
    () => (searchQuery.trim() ? store.search(searchQuery) : []),
    [searchQuery, store]
  )

  const isSearching = searchQuery.trim().length > 0

  // Upload handler
  const handleUpload = useCallback(
    async (fileList: FileList) => {
      setIsUploading(true)
      const files = Array.from(fileList)
      try {
        for (const f of files) {
          const meta =
            selected.kind === "global"
              ? {}
              : selected.kind === "ship"
              ? { shipId: selected.shipId, shipName: selected.shipName }
              : {
                  shipId: selected.shipId,
                  shipName: selected.shipName,
                  equipmentId: selected.equipmentId,
                  equipmentName: selected.equipmentName,
                }
          await store.uploadFile(f, selected.kind, meta)
        }
        toast.success(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`)
      } catch {
        toast.error("Upload failed — storage may be full")
      } finally {
        setIsUploading(false)
      }
    },
    [selected, store]
  )

  // Breadcrumb
  const breadcrumb = useMemo(() => {
    if (selected.kind === "global") return [{ label: "Netra", icon: <Globe className="w-3.5 h-3.5" /> }]
    if (selected.kind === "ship")
      return [
        { label: "Ships", icon: null },
        { label: selected.shipName, icon: <Ship className="w-3.5 h-3.5" /> },
      ]
    return [
      { label: "Ships", icon: null },
      { label: selected.shipName, icon: <Ship className="w-3.5 h-3.5" /> },
      { label: selected.equipmentName, icon: <Package className="w-3.5 h-3.5" /> },
    ]
  }, [selected])

  // Level accent color
  const accentColor =
    selected.kind === "global"
      ? "text-cyan-400"
      : selected.kind === "ship"
      ? "text-blue-400"
      : "text-violet-400"

  return (
    <div className="flex h-full w-full bg-muted/20 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <DocSidebar selected={selected} onSelect={setSelected} fileCounts={fileCounts} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-3 border-b border-slate-700/60 bg-slate-900/50 backdrop-blur-sm flex-shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-mono flex-1">
            {breadcrumb.map((crumb, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-700">/</span>}
                <span className={cn("flex items-center gap-1", i === breadcrumb.length - 1 ? accentColor : "text-slate-500")}>
                  {crumb.icon}
                  {crumb.label}
                </span>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all documents…"
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-md pl-9 pr-8 py-1.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-500 focus:bg-slate-800 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Search mode */}
          {isSearching ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-400">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for{" "}
                  <span className="text-slate-200 font-medium">"{searchQuery}"</span>
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <AlertCircle className="w-10 h-10 text-slate-700" />
                  <p className="text-sm text-slate-500">No documents match your search</p>
                </div>
              ) : (
                // Group by level
                (["global", "ship", "equipment"] as const).map((level) => {
                  const levelResults = searchResults.filter((r) => r.file.level === level)
                  if (levelResults.length === 0) return null

                  const levelTitle =
                    level === "global" ? "Netra" : level === "ship" ? "Ship Level" : "Equipment Level"
                  const levelIcon =
                    level === "global" ? <Globe className="w-3.5 h-3.5 text-cyan-400" /> :
                    level === "ship" ? <Ship className="w-3.5 h-3.5 text-blue-400" /> :
                    <Package className="w-3.5 h-3.5 text-violet-400" />

                  return (
                    <div key={level} className="space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
                        {levelIcon}
                        <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest">
                          {levelTitle}
                        </span>
                        <span className="text-xs text-slate-700 font-mono">{levelResults.length}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {levelResults.map(({ file }) => (
                          <FileCard key={file.id} file={file} onDelete={store.deleteFile} showLevel />
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            /* Normal mode */
            <>
              {/* Upload zone */}
              <UploadZone onUpload={handleUpload} disabled={isUploading} />

              {/* File count header */}
              {currentFiles.length > 0 && (
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-slate-600 uppercase tracking-widest">
                    {currentFiles.length} file{currentFiles.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Files grid */}
              {currentFiles.length === 0 ? (
                <EmptyState
                  label={
                    selected.kind === "global"
                      ? "Netra"
                      : selected.kind === "ship"
                      ? selected.shipName
                      : selected.equipmentName
                  }
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {currentFiles.map((file) => (
                    <FileCard key={file.id} file={file} onDelete={store.deleteFile} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}