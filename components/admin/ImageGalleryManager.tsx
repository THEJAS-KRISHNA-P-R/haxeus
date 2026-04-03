"use client"

import { useState, useEffect } from "react"
import { AdminCard, AdminButton, AdminInput } from "@/components/admin/AdminUI"
import { X, GripVertical, Star, Plus, Image as ImageIcon, Upload, Loader2, Clipboard } from "lucide-react"
import Image from "next/image"
import { supabase, ProductImage } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import imageCompression from "browser-image-compression"

interface ImageGalleryManagerProps {
    images: ProductImage[]
    onChange: (images: ProductImage[]) => void
}

export function ImageGalleryManager({ images, onChange }: ImageGalleryManagerProps) {
    const [newImageUrl, setNewImageUrl] = useState("")
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState("")
    const [isPasteActive, setIsPasteActive] = useState(false)

    // Handle clipboard paste for images
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const items = e.clipboardData?.items
            if (!items) return

            for (let i = 0; i < items.length; i++) {
                const item = items[i]

                // Check if it's an image
                if (item.type.startsWith('image/')) {
                    e.preventDefault()
                    const file = item.getAsFile()
                    if (file) {
                        await uploadImage(file)
                    }
                    break
                }
            }
        }

        // Add paste listener to document
        document.addEventListener('paste', handlePaste)
        return () => document.removeEventListener('paste', handlePaste)
    }, [images, onChange])

    // Upload image to Supabase Storage
    const uploadImage = async (file: File) => {
        setUploading(true)
        setUploadProgress("Compressing image...")

        let processedFile: File = file
        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
                fileType: "image/webp",
            })
            // imageCompression returns a Blob-like, cast to File for proper name
            processedFile = new File([compressed], file.name.replace(/\.[^.]+$/, ".webp"), {
                type: "image/webp",
            })
            setUploadProgress("Uploading to storage...")
        } catch (compressionError) {
            console.warn("Compression skipped, uploading original:", compressionError)
            setUploadProgress("Uploading to storage...")
        }

        try {
            const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`
            const filePath = `products/${fileName}`

            // Upload to Supabase Storage
            const { error } = await supabase.storage
                .from('product-images')
                .upload(filePath, processedFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                console.error("Upload error:", error)
                if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
                    setUploadProgress("Storage bucket not found. Using data URL instead...")
                    const dataUrl = await fileToDataUrl(processedFile)
                    addImageByUrl(dataUrl)
                    return
                }
                throw error
            }

            setUploadProgress("Getting public URL...")

            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            if (urlData?.publicUrl) {
                addImageByUrl(urlData.publicUrl)
                setUploadProgress("Image added successfully!")
            }
        } catch (error: any) {
            console.error("Image upload failed:", error)
            setUploadProgress(`Upload failed: ${error.message}. Using data URL...`)

            try {
                const dataUrl = await fileToDataUrl(processedFile)
                addImageByUrl(dataUrl)
            } catch (fallbackError) {
                console.error("Data URL fallback failed:", fallbackError)
                setUploadProgress("Failed to add image")
            }
        } finally {
            setTimeout(() => {
                setUploading(false)
                setUploadProgress("")
            }, 1500)
        }
    }

    // Convert file to data URL as fallback
    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    // Add image by URL (used by both URL input and paste)
    const addImageByUrl = (url: string) => {
        if (!url.trim()) return

        const newImage: ProductImage = {
            id: `temp-${Date.now()}`,
            product_id: 0,
            image_url: url,
            display_order: images.length,
            is_primary: images.length === 0,
        }

        onChange([...images, newImage])
    }

    const addImage = () => {
        addImageByUrl(newImageUrl)
        setNewImageUrl("")
    }

    // Handle file input change
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        for (let i = 0; i < files.length; i++) {
            await uploadImage(files[i])
        }

        // Reset input
        e.target.value = ''
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        newImages.forEach((img, i) => {
            img.display_order = i
        })
        if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
            newImages[0].is_primary = true
        }
        onChange(newImages)
    }

    const setPrimary = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            is_primary: i === index,
        }))
        onChange(newImages)
    }

    const moveImage = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === images.length - 1)
        ) {
            return
        }

        const newImages = [...images]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
            ;[newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]]

        newImages.forEach((img, i) => {
            img.display_order = i
        })

        onChange(newImages)
    }

    return (
        <AdminCard className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 style={{ color: "var(--text)" }} className="text-xl font-bold flex items-center gap-2">
                        Product Images
                        {uploading && <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />}
                    </h2>
                    <p style={{ color: "var(--text-3)" }} className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">
                        Add multiple images for your product. <span className="text-[var(--accent)]">Paste (Ctrl+V)</span> or upload.
                    </p>
                </div>
            </div>
            
            <div className="space-y-6">
                {/* Upload Progress */}
                {uploading && uploadProgress && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <span className="text-blue-700 dark:text-blue-300 text-sm">{uploadProgress}</span>
                    </div>
                )}

                {/* Paste Zone + File Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Paste/Drop Zone */}
                    <div
                        className={cn(
                            'border border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center',
                            isPasteActive
                                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                                : 'hover:border-[var(--accent)] hover:bg-[var(--accent)]/5'
                        )}
                        style={{ borderColor: !isPasteActive ? 'var(--border)' : undefined }}
                        onFocus={() => setIsPasteActive(true)}
                        onBlur={() => setIsPasteActive(false)}
                        tabIndex={0}
                    >
                        <Clipboard size={24} style={{ color: "var(--text-3)" }} className="mb-3 opacity-50" />
                        <p style={{ color: "var(--text)" }} className="text-[11px] font-bold uppercase tracking-widest">
                            Paste Image Here
                        </p>
                        <p style={{ color: "var(--text-3)" }} className="text-[9px] uppercase tracking-[0.2em] mt-1 opacity-50">
                            Press Ctrl+V anywhere to paste
                        </p>
                    </div>

                    {/* File Upload */}
                    <label 
                        className="border border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all flex flex-col items-center justify-center"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Upload size={24} style={{ color: "var(--text-3)" }} className="mb-3 opacity-50" />
                        <p style={{ color: "var(--text)" }} className="text-[11px] font-bold uppercase tracking-widest">
                            Upload from Device
                        </p>
                        <p style={{ color: "var(--text-3)" }} className="text-[9px] uppercase tracking-[0.2em] mt-1 opacity-50">
                            Click to select files
                        </p>
                    </label>
                </div>

                {/* URL Input */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <AdminInput
                            value={newImageUrl}
                            onChange={(e: any) => setNewImageUrl(e.target.value)}
                            placeholder="Or enter image URL (e.g., /images/product.jpg)"
                            onKeyDown={(e: any) => e.key === 'Enter' && addImage()}
                        />
                    </div>
                    <AdminButton
                        type="button"
                        onClick={addImage}
                        disabled={!newImageUrl.trim()}
                        variant="primary"
                        icon={Plus}
                    >
                        Add
                    </AdminButton>
                </div>

                {/* Image Gallery */}
                {images.length === 0 ? (
                    <div 
                        className="border border-dashed rounded-2xl p-12 text-center"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <ImageIcon size={32} style={{ color: "var(--text-3)" }} className="mx-auto mb-4 opacity-50" />
                        <p style={{ color: "var(--text)" }} className="text-[11px] font-bold uppercase tracking-widest">No images added yet</p>
                        <p style={{ color: "var(--text-3)" }} className="text-[9px] uppercase tracking-[0.2em] mt-1 opacity-50">
                            Paste an image or upload from your device
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                className="relative rounded-2xl p-4 group"
                                style={{
                                    background: "rgba(var(--bg-rgb), 0.03)",
                                    border: "1px solid var(--border)"
                                }}
                            >
                                {/* Image Preview */}
                                <div className="relative h-48 rounded-xl overflow-hidden mb-4" style={{ background: "var(--bg-card)" }}>
                                    <Image
                                        src={image.image_url}
                                        alt={`Product image ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover"
                                    />
                                    {image.is_primary && (
                                        <div className="absolute top-3 left-3 bg-[var(--accent)] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-[var(--accent)]/30">
                                            <Star size={10} fill="white" />
                                            Primary
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1">
                                        <AdminButton
                                            type="button"
                                            variant="ghost"
                                            onClick={() => moveImage(index, 'up')}
                                            disabled={index === 0}
                                            className="px-2 py-2 min-w-0"
                                        >
                                            <GripVertical size={16} />
                                        </AdminButton>
                                        <AdminButton
                                            type="button"
                                            variant="ghost"
                                            onClick={() => moveImage(index, 'down')}
                                            disabled={index === images.length - 1}
                                            className="px-2 py-2 min-w-0"
                                        >
                                            <GripVertical size={16} className="rotate-180" />
                                        </AdminButton>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!image.is_primary && (
                                            <AdminButton
                                                type="button"
                                                variant="outline"
                                                onClick={() => setPrimary(index)}
                                            >
                                                Set Primary
                                            </AdminButton>
                                        )}
                                        <AdminButton
                                            type="button"
                                            variant="danger"
                                            onClick={() => removeImage(index)}
                                            className="px-3"
                                        >
                                            <X size={14} />
                                        </AdminButton>
                                    </div>
                                </div>

                                {/* Image URL */}
                                <p style={{ color: "var(--text-3)" }} className="text-[10px] font-medium truncate mt-4 opacity-50">
                                    {image.image_url}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs text-black/40 dark:text-white/40">
                    Tip: Use high-quality images (at least 1200x1200px) for best results
                </p>
            </div>
        </AdminCard>
    )
}
