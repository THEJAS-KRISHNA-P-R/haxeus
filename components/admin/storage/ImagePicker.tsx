"use client"

import { useEffect, useState } from "react"
import { 
  Folder, 
  Search, 
  HardDrive,
  ChevronRight,
  File as FileIcon,
  X,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface StorageFile {
  name: string
  path: string
  publicUrl: string
  isFolder: boolean
}

interface Bucket {
  id: string
  name: string
}

interface ImagePickerProps {
  onSelect: (url: string) => void
  onClose: () => void
  isDark: boolean
}

export function ImagePicker({ onSelect, onClose, isDark }: ImagePickerProps) {
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [activeBucket, setActiveBucket] = useState<string>("")
  const [activeFolder, setActiveFolder] = useState<string>("")
  const [folderHistory, setFolderHistory] = useState<string[]>([])
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
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

  const isImage = (file: StorageFile) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext ?? '')
  }

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-4",
      "bg-black/60 backdrop-blur-sm"
    )}>
      <div className={cn(
        "relative w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl border shadow-2xl animate-in fade-in zoom-in duration-200",
        isDark ? "bg-[#0f0f0f] border-white/10" : "bg-white border-black/10"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-inherit">
          <div>
            <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-black")}>
              Select Image
            </h3>
            <p className={cn("text-xs mt-1", isDark ? "text-white/40" : "text-black/40")}>
              Choose an image from your storage to use in the hero section.
            </p>
          </div>
          <button 
            onClick={onClose}
            className={cn(
              "p-2 rounded-full hover:bg-inherit transition-colors",
              isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"
            )}
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 flex flex-wrap gap-4 items-center bg-inherit/50 border-b border-inherit">
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
                "px-3 py-1.5 rounded-lg border text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-[#e93a3a]/50",
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

          <div className="flex-1 relative">
            <Search size={14} className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-white/30" : "text-black/30")} />
            <input
              type="text"
              placeholder="Search images..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full pl-9 pr-4 py-1.5 rounded-lg border text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-[#e93a3a]/50",
                isDark 
                  ? "border-white/[0.10] text-white placeholder:text-white/30" 
                  : "border-black/[0.10] text-black placeholder:text-black/30"
              )}
            />
          </div>
        </div>

        {/* Browser */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className="text-[#e93a3a] hover:underline flex items-center gap-1"
            >
              <HardDrive size={14} />
              {activeBucket}
            </button>
            {folderHistory.map((segment, i) => (
              <div key={i} className="flex items-center gap-2">
                <ChevronRight size={14} className={isDark ? "text-white/20" : "text-black/20"} />
                <button
                  onClick={() => handleBreadcrumbClick(i)}
                  className={cn(
                    "hover:underline",
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

          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={cn(
                  "aspect-square rounded-2xl animate-pulse",
                  isDark ? "bg-white/[0.05]" : "bg-black/[0.05]"
                )} />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 opacity-40">
              <p className="text-sm">No files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {files.map(file => (
                file.isFolder ? (
                  <button
                    key={file.path}
                    onClick={() => handleFolderClick(file)}
                    className={cn(
                      "aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all group hover:scale-[1.02]",
                      isDark
                        ? "bg-white/[0.03] border-white/[0.07] hover:border-white/[0.15]"
                        : "bg-black/[0.02] border-black/[0.07] hover:border-black/[0.15]"
                    )}
                  >
                    <Folder size={28} className="text-[#e7bf04]/60 group-hover:text-[#e7bf04]" />
                    <span className={cn("text-[10px] font-bold truncate px-2 w-full text-center", isDark ? "text-white/50" : "text-black/50")}>
                      {file.name}
                    </span>
                  </button>
                ) : (
                  <button
                    key={file.path}
                    onClick={() => isImage(file) && onSelect(file.publicUrl)}
                    disabled={!isImage(file)}
                    className={cn(
                      "relative aspect-square rounded-2xl overflow-hidden border transition-all group hover:scale-[1.02]",
                      !isImage(file) && "opacity-20 cursor-not-allowed",
                      isDark ? "border-white/[0.07] hover:border-white/[0.20]" : "border-black/[0.07] hover:border-black/[0.20]"
                    )}
                  >
                    <img
                      src={file.publicUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Check className="text-white" size={24} />
                    </div>
                  </button>
                )
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-inherit flex justify-end gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className={isDark ? "text-white/50 hover:text-white" : "text-black/50 hover:text-black"}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
