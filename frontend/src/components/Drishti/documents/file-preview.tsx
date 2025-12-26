"use client"

import type { FileItem } from "@/lib/storage"
import { X, Share2, Download, Trash2, FileText, FileSpreadsheet, File } from "lucide-react"
import { Avatar, AvatarFallback } from "@/registry/new-york-v4/ui/avatar"
import { formatFileSize, getRelativeTime } from "@/lib/storage"
import { Button } from "@/registry/new-york-v4/ui/button"

type FilePreviewProps = {
  file: FileItem
  onClose: () => void
  onDelete: (fileId: string) => void
}

export function FilePreview({ file, onClose, onDelete }: FilePreviewProps) {
  const getFileIcon = () => {
    switch (file.type) {
      case "pdf":
        return <FileText className="h-20 w-20 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-20 w-20 text-blue-500" />
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="h-20 w-20 text-green-600" />
      case "csv":
        return <FileSpreadsheet className="h-20 w-20 text-emerald-500" />
      default:
        return <File className="h-20 w-20 text-gray-500" />
    }
  }

  const handleDelete = () => {
    if (confirm(`Delete "${file.name}"?`)) {
      onDelete(file.id)
    }
  }

  return (
    <aside className="flex w-80 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <span className="text-sm font-semibold text-card-foreground">File Preview</span>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6 flex items-center justify-center rounded-2xl bg-muted p-12">{getFileIcon()}</div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-1 font-semibold text-card-foreground">{file.name}</h3>
            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium text-muted-foreground">File Type</div>
            <p className="text-sm text-card-foreground uppercase">{file.type}</p>
          </div>

          <div>
            <div className="mb-3 text-xs font-medium text-muted-foreground">Uploaded By</div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">{file.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{file.addedBy}</div>
                <div className="text-xs text-muted-foreground">Added {getRelativeTime(file.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border p-4">
        <Button variant="outline" className="flex-col gap-1 h-auto py-3 bg-transparent">
          <Share2 className="h-4 w-4" />
          <span className="text-xs">Share</span>
        </Button>
        <Button variant="outline" className="flex-col gap-1 h-auto py-3 bg-transparent">
          <Download className="h-4 w-4" />
          <span className="text-xs">Download</span>
        </Button>
        <Button
          variant="outline"
          className="flex-col gap-1 h-auto py-3 bg-transparent text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-xs">Delete</span>
        </Button>
      </div>
    </aside>
  )
}
