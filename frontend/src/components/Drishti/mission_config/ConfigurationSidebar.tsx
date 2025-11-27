"use client"

import { Search, Ship, Plus, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Input } from "@/registry/new-york-v4/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/new-york-v4/ui/alert-dialog"
import { useState } from "react"
import { Config } from "@/types/mission_config"


interface ConfigurationSidebarProps {
  configs: Config[]
  selectedConfigId: string | null
  searchTerm: string
  onSearchChange: (term: string) => void
  onSelectConfig: (id: string) => void
  onCreateNew: () => void
  onEditConfig: (config: Config) => void
  onDeleteConfig: (id: string) => void
}

export function ConfigurationSidebar({
  configs,
  selectedConfigId,
  searchTerm,
  onSearchChange,
  onSelectConfig,
  onCreateNew,
  onEditConfig,
  onDeleteConfig,
}: ConfigurationSidebarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [configToDelete, setConfigToDelete] = useState<string | null>(null)

  const handleDeleteClick = (e: React.MouseEvent, configId: string) => {
    e.stopPropagation()
    setConfigToDelete(configId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (configToDelete) {
      onDeleteConfig(configToDelete)
      setConfigToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  return (
    <div className="w-[180px] bg-muted/80 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Search className="w-3.5 h-3.5" />
          <Input
            type="text"
            placeholder="Find..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-6 bg-transparent border-0 p-0 text-xs text-gray-300 placeholder-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </div>

      {/* Configs List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-2 px-2">Configurations</div>

          <div className="space-y-0.5">
            {configs.map((config) => (
              <div
                key={config.id + config.config_name}
                onClick={() => onSelectConfig(config.id)}
                className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-800 cursor-pointer transition-colors ${
                  selectedConfigId === config.id ? "bg-gray-800" : ""
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Ship className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate text-white">{config.config_name}</div>
                    <div className="text-[10px] text-gray-500 truncate">{config.ship_name}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditConfig(config)
                    }}
                    className="p-0.5 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Edit className="w-3 h-3 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, config.id)}
                    className="p-0.5 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {configs.length === 0 && (
          <div className="text-center py-8 px-4">
            <Ship className="w-8 h-8 mx-auto mb-2 text-gray-700" />
            <p className="text-xs text-gray-600">No configurations</p>
          </div>
        )}

        {/* Create New Button */}
        <div className="p-2 border-t border-gray-800">
          <Button
            onClick={onCreateNew}
            variant="ghost"
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-transparent px-2 w-full justify-start h-auto py-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Create new config
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#2a2a2a] border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Configuration</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this configuration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}