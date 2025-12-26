"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getStorageData,
  saveStorageData,
  getFileTypeFromName,
  type FileItem,
  type FolderItem,
  type StorageData,
} from "@/lib/storage"

export function useFolderData() {
  const [data, setData] = useState<StorageData>({ folders: [], files: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedData = getStorageData()
    setData(storedData)
    setIsLoading(false)
  }, [])

  const updateData = useCallback((newData: StorageData) => {
    setData(newData)
    saveStorageData(newData)
  }, [])

  // Folder operations
  const createFolder = useCallback(
    (name: string, parentId: string | null) => {
      const newFolder: FolderItem = {
        id: `folder-${Date.now()}`,
        name,
        parentId,
        createdAt: Date.now(),
      }
      updateData({
        ...data,
        folders: [...data.folders, newFolder],
      })
      return newFolder
    },
    [data, updateData],
  )

  const updateFolder = useCallback(
    (folderId: string, updates: Partial<FolderItem>) => {
      updateData({
        ...data,
        folders: data.folders.map((f) => (f.id === folderId ? { ...f, ...updates } : f)),
      })
    },
    [data, updateData],
  )

  const deleteFolder = useCallback(
    (folderId: string) => {
      // Delete folder and all its children recursively
      const getFolderAndChildren = (id: string): string[] => {
        const children = data.folders.filter((f) => f.parentId === id).map((f) => f.id)
        return [id, ...children.flatMap(getFolderAndChildren)]
      }

      const folderIdsToDelete = getFolderAndChildren(folderId)

      updateData({
        folders: data.folders.filter((f) => !folderIdsToDelete.includes(f.id)),
        files: data.files.filter((f) => !folderIdsToDelete.includes(f.folderId)),
      })
    },
    [data, updateData],
  )

  // File operations
  const uploadFile = useCallback(
    (file: File, folderId: string, addedBy: string) => {
      const newFile: FileItem = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: getFileTypeFromName(file.name),
        size: file.size,
        folderId,
        addedBy,
        avatar: addedBy.charAt(0).toUpperCase(),
        createdAt: Date.now(),
        file,
      }
      updateData({
        ...data,
        files: [...data.files, newFile],
      })
      return newFile
    },
    [data, updateData],
  )

  const updateFile = useCallback(
    (fileId: string, updates: Partial<FileItem>) => {
      updateData({
        ...data,
        files: data.files.map((f) => (f.id === fileId ? { ...f, ...updates } : f)),
      })
    },
    [data, updateData],
  )

  const deleteFile = useCallback(
    (fileId: string) => {
      updateData({
        ...data,
        files: data.files.filter((f) => f.id !== fileId),
      })
    },
    [data, updateData],
  )

  const getFilesByFolder = useCallback(
    (folderId: string) => {
      return data.files.filter((f) => f.folderId === folderId)
    },
    [data.files],
  )

  const getChildFolders = useCallback(
    (parentId: string | null) => {
      return data.folders.filter((f) => f.parentId === parentId)
    },
    [data.folders],
  )

  return {
    folders: data.folders,
    files: data.files,
    isLoading,
    createFolder,
    updateFolder,
    deleteFolder,
    uploadFile,
    updateFile,
    deleteFile,
    getFilesByFolder,
    getChildFolders,
  }
}
