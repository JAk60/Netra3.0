"use client"

import type React from "react"

import type { FileItem } from "@/lib/storage"
import { FileText, FileSpreadsheet, File, Upload, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/registry/new-york-v4/ui/avatar"
import { Button } from "@/registry/new-york-v4/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/registry/new-york-v4/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatFileSize, getRelativeTime } from "@/lib/storage"
import type { ViewMode } from "./folder-manager"
import { useRef } from "react"

type FileListProps = {
  files: FileItem[]
  viewMode: ViewMode
  onSelectFile: (file: FileItem) => void
  selectedFileId?: string
  onUploadFile: (file: File) => void
  onDeleteFile: (fileId: string) => void
  onRenameFile: (fileId: string, updates: Partial<FileItem>) => void
}

export function FileList({
  files,
  viewMode,
  onSelectFile,
  selectedFileId,
  onUploadFile,
  onDeleteFile,
  onRenameFile,
}: FileListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (type: FileItem["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      case "csv":
        return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUploadFile(file)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRename = (file: FileItem) => {
    const newName = prompt("Enter new file name:", file.name)
    if (newName?.trim() && newName !== file.name) {
      onRenameFile(file.id, { name: newName.trim() })
    }
  }

  const handleDelete = (file: FileItem) => {
    if (confirm(`Delete "${file.name}"?`)) {
      onDeleteFile(file.id)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="grid flex-1 grid-cols-[1fr,auto] gap-4 text-sm font-medium text-muted-foreground">
          <div>Name</div>
          <div>Added By</div>
        </div>
        <Button size="sm" variant="ghost" className="ml-4 h-8 gap-2" onClick={handleUploadClick}>
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
        />
      </div>
      <div className="divide-y divide-border">
        {files.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No files yet. Click "Upload File" to add files.
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "group grid grid-cols-[1fr,auto,auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-accent",
                selectedFileId === file.id && "bg-accent",
              )}
            >
              <button onClick={() => onSelectFile(file)} className="flex items-center gap-3 text-left">
                {getFileIcon(file.type)}
                <div>
                  <div className="text-sm text-card-foreground">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {getRelativeTime(file.createdAt)}
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">{file.avatar}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{file.addedBy}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleRename(file)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(file)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
