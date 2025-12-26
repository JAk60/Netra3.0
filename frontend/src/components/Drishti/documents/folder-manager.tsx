"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "./sidebar"
import { FolderGrid } from "./folder-grid"
import { FileList } from "./file-list"
import { FilePreview } from "./file-preview"
import { TopBar } from "./top-bar"
import { useFolderData } from "@/hooks/use-folder-data"
import type { FileItem } from "@/lib/storage"

export type ViewMode = "grid" | "list"

export function DocumentManager() {
  const {
    folders,
    files,
    isLoading,
    createFolder,
    updateFolder,
    deleteFolder,
    uploadFile,
    updateFile,
    deleteFile,
    getFilesByFolder,
    getChildFolders,
  } = useFolderData()

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const currentFolder = useMemo(() => {
    if (!selectedFolder) return null
    return folders.find((f) => f.id === selectedFolder)
  }, [folders, selectedFolder])

  const folderWithCounts = useMemo(() => {
    return folders.map((folder) => {
      const fileCount = files.filter((f) => f.folderId === folder.id).length
      return { ...folder, fileCount }
    })
  }, [folders, files])

  const filteredFolders = useMemo(() => {
    const childFolders = getChildFolders(selectedFolder)
    if (!searchQuery) return childFolders

    return childFolders.filter((folder) => folder.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [getChildFolders, selectedFolder, searchQuery])

  const filteredFiles = useMemo(() => {
    if (!selectedFolder) return []

    const folderFiles = getFilesByFolder(selectedFolder)
    if (!searchQuery) return folderFiles

    return folderFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [getFilesByFolder, selectedFolder, searchQuery])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar
        folders={folderWithCounts}
        selectedFolder={selectedFolder}
        onSelectFolder={setSelectedFolder}
        onCreateFolder={createFolder}
        onUpdateFolder={updateFolder}
        onDeleteFolder={deleteFolder}
      />

      <div className="flex flex-1 flex-col">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          currentFolder={currentFolder}
          onNavigateBack={() => {
            if (currentFolder?.parentId !== undefined) {
              setSelectedFolder(currentFolder.parentId)
            }
          }}
        />

        <main className="flex flex-1 gap-6 overflow-hidden p-6">
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
            {filteredFolders.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Folders</h2>
                </div>
                <FolderGrid
                  folders={filteredFolders}
                  viewMode={viewMode}
                  onSelectFolder={setSelectedFolder}
                  onDeleteFolder={deleteFolder}
                  onRenameFolder={updateFolder}
                />
              </div>
            )}

            {selectedFolder && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Files</h2>
                </div>
                <FileList
                  files={filteredFiles}
                  viewMode={viewMode}
                  onSelectFile={setSelectedFile}
                  selectedFileId={selectedFile?.id}
                  onUploadFile={(file) => {
                    uploadFile(file, selectedFolder, "user@college.edu")
                  }}
                  onDeleteFile={deleteFile}
                  onRenameFile={updateFile}
                />
              </div>
            )}

            {!selectedFolder && filteredFolders.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium">No folders found</p>
                  <p className="text-sm">Create a folder from the sidebar to get started</p>
                </div>
              </div>
            )}
          </div>

          {selectedFile && (
            <FilePreview
              file={selectedFile}
              onClose={() => setSelectedFile(null)}
              onDelete={(fileId) => {
                deleteFile(fileId)
                setSelectedFile(null)
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
