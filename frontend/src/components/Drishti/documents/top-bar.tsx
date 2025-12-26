"use client"

import { Search, Grid3x3, List, ChevronLeft, Home } from "lucide-react"
import { Input } from "@/registry/new-york-v4/ui/input"
import { cn } from "@/lib/utils"
import type { ViewMode } from "./folder-manager"
import type { FolderItem } from "@/lib/storage"
import { Button } from "@/registry/new-york-v4/ui/button"

type TopBarProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  currentFolder: FolderItem | null
  onNavigateBack: () => void
}

export function TopBar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  currentFolder,
  onNavigateBack,
}: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-4">
        {currentFolder ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onNavigateBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-foreground">{currentFolder.name}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">All Folders</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="bg-secondary pl-9 text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-1">
          <Button
            size="sm"
            variant="ghost"
            className={cn("h-7 w-7 p-0", viewMode === "grid" && "bg-background")}
            onClick={() => onViewModeChange("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn("h-7 w-7 p-0", viewMode === "list" && "bg-background")}
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
