"use client"

import { Home, Folder, Settings, Clock, Star, ChevronRight, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/registry/new-york-v4/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { FolderItem } from "@/lib/storage"
import { Button } from "@/registry/new-york-v4/ui/button"

type SidebarProps = {
  folders: (FolderItem & { fileCount: number })[]
  selectedFolder: string | null
  onSelectFolder: (folder: string | null) => void
  onCreateFolder: (name: string, parentId: string | null) => void
  onUpdateFolder: (folderId: string, updates: Partial<FolderItem>) => void
  onDeleteFolder: (folderId: string) => void
}

export function Sidebar({
  folders,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => (prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]))
  }

  const startEdit = (folder: FolderItem) => {
    setEditingFolder(folder.id)
    setEditName(folder.name)
  }

  const saveEdit = () => {
    if (editingFolder && editName.trim()) {
      onUpdateFolder(editingFolder, { name: editName.trim() })
    }
    setEditingFolder(null)
  }

  const handleCreateSubfolder = (parentId: string) => {
    const name = prompt("Enter folder name:")
    if (name?.trim()) {
      onCreateFolder(name.trim(), parentId)
      setExpandedFolders((prev) => [...prev, parentId])
    }
  }

  const handleCreateRootFolder = () => {
    const name = prompt("Enter folder name:")
    if (name?.trim()) {
      onCreateFolder(name.trim(), null)
    }
  }

  const rootFolders = folders.filter((f) => f.parentId === null)

  const renderFolder = (folder: FolderItem & { fileCount: number }, depth = 0) => {
    const subfolders = folders.filter((f) => f.parentId === folder.id)
    const hasSubfolders = subfolders.length > 0
    const isExpanded = expandedFolders.includes(folder.id)
    const isEditing = editingFolder === folder.id

    return (
      <div key={folder.id}>
        <div className="group flex items-center gap-1">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit()
                if (e.key === "Escape") setEditingFolder(null)
              }}
              className="flex-1 rounded bg-sidebar-accent px-2 py-1 text-sm text-sidebar-accent-foreground outline-none"
              autoFocus
            />
          ) : (
            <>
              <Button
                variant="ghost"
                className={cn(
                  "flex-1 justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  selectedFolder === folder.id && "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
                style={{ paddingLeft: `${depth * 12 + 12}px` }}
                onClick={() => onSelectFolder(folder.id)}
              >
                {hasSubfolders && (
                  <ChevronRight
                    className={cn("h-3 w-3 shrink-0 transition-transform", isExpanded && "rotate-90")}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFolder(folder.id)
                    }}
                  />
                )}
                <Folder className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-left text-sm">{folder.name}</span>
                {folder.fileCount > 0 && <span className="text-xs text-muted-foreground">{folder.fileCount}</span>}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleCreateSubfolder(folder.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Subfolder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => startEdit(folder)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (confirm(`Delete "${folder.name}" and all its contents?`)) {
                        onDeleteFolder(folder.id)
                      }
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
        {hasSubfolders && isExpanded && (
          <div className="mt-0.5 space-y-0.5">{subfolders.map((sub) => renderFolder(sub, depth + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Folder className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-sm font-semibold text-sidebar-foreground">College Storage</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-4 space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              selectedFolder === null && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
            onClick={() => onSelectFolder(null)}
          >
            <Home className="h-4 w-4" />
            <span className="text-sm">All Folders</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Star className="h-4 w-4" />
            <span className="text-sm">Starred</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Clock className="h-4 w-4" />
            <span className="text-sm">Recent</span>
          </Button>
        </div>

        <div className="mb-2 flex items-center justify-between px-2">
          <div className="text-xs font-medium text-muted-foreground">Folders</div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleCreateRootFolder}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-0.5">{rootFolders.map((folder) => renderFolder(folder))}</div>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </aside>
  )
}
