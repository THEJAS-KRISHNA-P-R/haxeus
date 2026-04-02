"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { 
  Folder, 
  File as FileIcon, 
  Check, 
  ChevronRight, 
  Search, 
  HardDrive,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface StorageFile {
  name: string
  id: string | null
  updated_at: string | null
  created_at: string | null
  last_accessed_at: string | null
  metadata: {
    size: number
    mimetype: string
    cacheControl: string
    httpStatusCode: number
  } | null
  path: string
  publicUrl: string
  isFolder: boolean
}

interface Bucket {
  id: string
  name: string
  public: boolean
  created_at: string
}

export default function StorageManagerPage() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = !mounted ? true : theme === 'dark'

  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [activeBucket, setActiveBucket] = useState<string>("")
  const [activeFolder, setActiveFolder] = useState<string>("")
  const [folderHistory, setFolderHistory] = useState<string[]>([])
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch("/api/admin/storage/buckets")
      .then(r => r.json())
      .then(({ buckets }) => {
        const sortedBuckets = buckets ?? []
        setBuckets(sortedBuckets)
        if (sortedBuckets.length > 0) setActiveBucket(sortedBuckets[0].name)
      })
  }, [])

  useEffect(() => {
    if (!activeBucket) return
    setLoading(true)
    setSelected(new Set())

    const folderParam = activeFolder ? `&folder=${encodeURIComponent(activeFolder)}` : ""
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""
    
    fetch(`/api/admin/storage/files?bucket=${activeBucket}${folderParam}${searchParam}`)
      .then(r => r.json())
      .then(({ files }) => setFiles(files ?? []))
      .catch(err => console.error("Error fetching files:", err))
      .finally(() => setLoading(false))
  }, [activeBucket, activeFolder, search])

  const handleFolderClick = (folder: StorageFile) => {
    setFolderHistory(prev => [...prev, folder.name])
    setActiveFolder(folder.path)
  }

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setActiveFolder("")
      setFolderHistory([])
    } else {
      const newHistory = folderHistory.slice(0, index + 1)
      const newPath = newHistory.join("/")
      setActiveFolder(newPath)
      setFolderHistory(newHistory)
    }
  }

  const toggleSelect = (path: string) => {
    const next = new Set(selected)
    if (next.has(path)) {
      next.delete(path)
    } else {
      next.add(path)
    }
    setSelected(next)
  }

  const toggleSelectAll = () => {
    const selectableFiles = files.filter(f => !f.isFolder)
    if (selected.size === selectableFiles.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(selectableFiles.map(f => f.path)))
    }
  }

  async function handleDelete() {
    if (selected.size === 0) return
    setDeleting(true)
    try {
      const res = await fetch("/api/admin/storage/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: activeBucket,
          paths: Array.from(selected)
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Delete failed")

      // Update local state
      setFiles(prev => prev.filter(f => !selected.has(f.path)))
      setSelected(new Set())
      setDeleteConfirmOpen(false)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const totalSize = files
    .filter(f => !f.isFolder)
    .reduce((sum, f) => sum + (f.metadata?.size ?? 0), 0)

  if (!mounted) return null

  return (
    <div className={cn("min-h-screen -mx-8 -mt-24 pt-24 px-8 pb-12", isDark ? 'bg-[var(--bg)] text-white' : 'bg-[var(--bg)] text-black')}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className={cn("text-3xl font-bold", isDark ? "text-white" : "text-black")}>
            Storage Manager
          </h1>
          <p className={cn("text-sm", isDark ? "text-white/40" : "text-black/40")}>
            View and manage files stored in Supabase Storage.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Files", value: files.filter(f => !f.isFolder).length },
            { label: "Folders", value: files.filter(f => f.isFolder).length },
            { label: "Total Size", value: formatBytes(totalSize) },
            { label: "Selected", value: selected.size }
          ].map((stat, i) => (
            <Card key={i} className={isDark ? 'bg-[#111] border-white/[0.07]' : 'bg-white border-black/[0.07]'}>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <span className={isDark ? "text-white/40 text-xs font-bold uppercase tracking-wider" : "text-black/40 text-xs font-bold uppercase tracking-wider"}>
                  {stat.label}
                </span>
                <span className={cn("text-2xl font-bold mt-1", isDark ? "text-white" : "text-black")}>
                  {stat.value}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className={cn(
          "flex flex-wrap items-center gap-3 p-4 rounded-2xl border",
          isDark ? "bg-white/[0.02] border-white/[0.07]" : "bg-black/[0.01] border-black/[0.07]"
        )}>
          {/* Bucket selector */}
          <div className="flex items-center gap-2">
            <HardDrive size={16} className={isDark ? "text-white/30" : "text-black/30"} />
            <select
              value={activeBucket}
              onChange={(e) => { 
                setActiveBucket(e.target.value); 
                setActiveFolder(""); 
                setFolderHistory([]) 
              }}
              className={cn(
                "px-3 py-2 rounded-xl border text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-[#e93a3a]/50 min-w-[140px]",
                isDark ? "border-white/[0.10] text-white" : "border-black/[0.10] text-black"
              )}
            >
              {buckets.map(b => (
                <option key={b.id} value={b.name} className={isDark ? "bg-[#111]" : ""}>
                   {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 relative min-w-[200px]">
            <Search size={14} className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-white/30" : "text-black/30")} />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full pl-9 pr-4 py-2 rounded-xl border text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-[#e93a3a]/50",
                isDark 
                  ? "border-white/[0.10] text-white placeholder:text-white/30" 
                  : "border-black/[0.10] text-black placeholder:text-black/30"
              )}
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Select all */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              disabled={files.filter(f => !f.isFolder).length === 0}
              className={cn(
                "rounded-xl font-medium",
                isDark ? "border-white/[0.10] text-white/70 hover:bg-white/5" : "border-black/[0.10] text-black/70 hover:bg-black/5"
              )}
            >
              {selected.size === files.filter(f => !f.isFolder).length && files.length > 0 && selected.size > 0
                ? "Deselect All"
                : "Select All"}
            </Button>

            {/* Delete selected */}
            {selected.size > 0 && (
              <Button
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20"
              >
                <Trash2 size={14} className="mr-2" />
                Delete {selected.size}
              </Button>
            )}
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="text-[#e93a3a] hover:underline text-sm font-medium flex items-center gap-1"
          >
            <HardDrive size={14} />
            {activeBucket || "Root"}
          </button>
          {folderHistory.map((segment, i) => (
            <div key={i} className="flex items-center gap-2">
              <ChevronRight size={14} className={isDark ? "text-white/20" : "text-black/20"} />
              <button
                onClick={() => handleBreadcrumbClick(i)}
                className={cn(
                  "text-sm font-medium hover:underline",
                  i === folderHistory.length - 1 
                    ? (isDark ? "text-white" : "text-black") 
                    : "text-[#e93a3a]"
                )}
              >
                {segment}
              </button>
            </div>
          ))}
        </div>

        {/* File Grid */}
        <div className="mt-4">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={cn(
                  "aspect-square rounded-2xl animate-pulse",
                  isDark ? "bg-white/[0.05]" : "bg-black/[0.05]"
                )} />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className={cn(
              "text-center py-20 rounded-2xl border-2 border-dashed",
              isDark ? "border-white/[0.05] text-white/20" : "border-black/[0.05] text-black/20"
            )}>
              <FileIcon size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">No files or folders found here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map(file => (
                file.isFolder ? (
                  /* Folder tile */
                  <button
                    key={file.path}
                    onClick={() => handleFolderClick(file)}
                    className={cn(
                      "aspect-square rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all group relative",
                      isDark
                        ? "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.15]"
                        : "bg-black/[0.02] border-black/[0.07] hover:bg-black/[0.05] hover:border-black/[0.15]"
                    )}
                  >
                    <div className="p-4 rounded-2xl bg-[#e7bf04]/10 text-[#e7bf04] group-hover:scale-110 transition-transform">
                      <Folder size={32} />
                    </div>
                    <span className={cn(
                      "text-xs font-semibold text-center px-3 truncate w-full",
                      isDark ? "text-white/70" : "text-black/70"
                    )}>
                      {file.name}
                    </span>
                  </button>
                ) : (
                  /* Image/File tile */
                  <div
                    key={file.path}
                    onClick={() => toggleSelect(file.path)}
                    className={cn(
                      "relative aspect-square rounded-2xl overflow-hidden border cursor-pointer transition-all group",
                      selected.has(file.path)
                        ? "border-[#e93a3a] ring-2 ring-[#e93a3a]/50 scale-[0.98]"
                        : (isDark ? "border-white/[0.07] hover:border-white/[0.20]" : "border-black/[0.07] hover:border-black/[0.20]")
                    )}
                  >
                    {/* Image Preview */}
                    <img
                      src={file.publicUrl}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement
                        t.style.display = "none"
                        t.nextElementSibling?.classList.remove("hidden")
                      }}
                    />

                    {/* Fallback Icon for non-images */}
                    <div className="hidden absolute inset-0 flex flex-col items-center justify-center gap-2 bg-theme-1">
                      <FileIcon size={32} className={isDark ? "text-white/20" : "text-black/20"} />
                      <span className={cn("text-[10px] px-3 text-center truncate w-full font-medium", isDark ? "text-white/40" : "text-black/40")}>
                        {file.name}
                      </span>
                    </div>

                    {/* Selection Indicator */}
                    <div className={cn(
                      "absolute top-3 right-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all z-10",
                      selected.has(file.path)
                        ? "bg-[#e93a3a] border-[#e93a3a] scale-100"
                        : "bg-black/40 border-white/30 opacity-0 group-hover:opacity-100 scale-90"
                    )}>
                      {selected.has(file.path) && <Check size={14} className="text-white" />}
                    </div>

                    {/* Info Overlay on Hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-white text-[11px] font-bold truncate">{file.name}</p>
                      <p className="text-white/60 text-[10px] font-medium mt-0.5">
                        {file.metadata?.size ? formatBytes(file.metadata.size) : ""}
                      </p>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setDeleteConfirmOpen(false)} 
          />
          <Card className={cn(
            "relative w-full max-w-md shadow-2xl border-2",
            isDark ? "bg-[#0f0f0f] border-red-500/20" : "bg-white border-red-500/20"
          )}>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertTriangle size={32} />
              </div>
              <CardTitle className={cn("text-xl font-bold", isDark ? "text-white" : "text-black")}>
                Delete {selected.size} file{selected.size > 1 ? "s" : ""}?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              <p className={cn("text-sm text-center", isDark ? "text-white/40" : "text-black/40")}>
                This action is irreversible. Products referencing these files will lose their images.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                  className={cn(
                    "flex-1 rounded-xl py-6 font-semibold",
                    isDark ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"
                  )}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl py-6 bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

