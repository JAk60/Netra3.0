export type FileType = "pdf" | "doc" | "docx" | "xls" | "xlsx" | "csv" | "default"

export type FileItem = {
  id: string
  name: string
  type: FileType
  size: number
  folderId: string
  addedBy: string
  avatar: string
  createdAt: number
  file?: File
}

export type FolderItem = {
  id: string
  name: string
  parentId: string | null
  createdAt: number
  icon?: string
}

export type StorageData = {
  folders: FolderItem[]
  files: FileItem[]
}

const STORAGE_KEY = "folder-manager-data"

export function getStorageData(): StorageData {
  if (typeof window === "undefined") {
    return { folders: [], files: [] }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }

  // Initialize with default data
  const defaultData: StorageData = {
    folders: [
      { id: "academics", name: "Academics", parentId: null, createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000 },
      { id: "departments", name: "Departments", parentId: null, createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000 },
      { id: "administration", name: "Administration", parentId: null, createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
      { id: "research", name: "Research", parentId: null, createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000 },
      { id: "students", name: "Student Resources", parentId: null, createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    ],
    files: [
      {
        id: "1",
        name: "Course-Syllabus-2024.pdf",
        type: "pdf",
        size: 2400000,
        folderId: "academics",
        addedBy: "john@college.edu",
        avatar: "J",
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },
      {
        id: "2",
        name: "Budget-Report.xlsx",
        type: "xlsx",
        size: 1800000,
        folderId: "administration",
        addedBy: "admin@college.edu",
        avatar: "A",
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      },
    ],
  }

  saveStorageData(defaultData)
  return defaultData
}

export function saveStorageData(data: StorageData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))

  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 14) return "1 week ago"
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 60) return "1 month ago"
  return `${Math.floor(days / 30)} months ago`
}

export function getFileTypeFromName(fileName: string): FileType {
  const ext = fileName.split(".").pop()?.toLowerCase()

  switch (ext) {
    case "pdf":
      return "pdf"
    case "doc":
    case "docx":
      return "docx"
    case "xls":
    case "xlsx":
      return "xlsx"
    case "csv":
      return "csv"
    default:
      return "default"
  }
}
