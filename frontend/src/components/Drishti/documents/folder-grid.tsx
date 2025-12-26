"use client"

import type { FolderItem } from "@/lib/storage"
import { FolderOpen, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/registry/new-york-v4/ui/dropdown-menu"
import type { ViewMode } from "./folder-manager"
import { Button } from "@/registry/new-york-v4/ui/button"

type FolderGridProps = {
  folders: (FolderItem & { fileCount: number })[]
  viewMode: ViewMode
  onSelectFolder: (folderId: string) => void
  onDeleteFolder: (folderId: string) => void
  onRenameFolder: (folderId: string, updates: Partial<FolderItem>) => void
}

export function FolderGrid({ folders, viewMode, onSelectFolder, onDeleteFolder, onRenameFolder }: FolderGridProps) {
  const handleRename = (folder: FolderItem & { fileCount: number }) => {
    const newName = prompt("Enter new folder name:", folder.name)
    if (newName?.trim() && newName !== folder.name) {
      onRenameFolder(folder.id, { name: newName.trim() })
    }
  }

  const handleDelete = (folder: FolderItem & { fileCount: number }) => {
    if (confirm(`Delete "${folder.name}" and all its contents?`)) {
      onDeleteFolder(folder.id)
    }
  }

  if (viewMode === "list") {
    return (
      <div className="rounded-xl border border-border bg-card">
        <div className="divide-y divide-border">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-card-foreground">{folder.name}</h3>
                <p className="text-sm text-muted-foreground">{folder.fileCount} Files</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleRename(folder)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(folder)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => onSelectFolder(folder.id)}
          className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <div
                  className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleRename(folder)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(folder)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <h3 className="font-medium text-card-foreground">{folder.name}</h3>
            <p className="text-sm text-muted-foreground">{folder.fileCount} Files</p>
          </div>
        </button>
      ))}
    </div>
  )
}
