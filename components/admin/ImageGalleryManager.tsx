"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, GripVertical, Star, Plus, Image as ImageIcon, Upload, Loader2, Clipboard } from "lucide-react"
import Image from "next/image"
import { supabase, ProductImage } from "@/lib/supabase"

interface ImageGalleryManagerProps {
    images: ProductImage[]
    onChange: (images: ProductImage[]) => void
}

export function ImageGalleryManager({ images, onChange }: ImageGalleryManagerProps) {
    const [newImageUrl, setNewImageUrl] = useState("")
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState("")
    const [isPasteActive, setIsPasteActive] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

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
        setUploadProgress("Preparing upload...")

        try {
            // Generate unique filename
            const fileExt = file.type.split('/')[1] || 'png'
            const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `products/${fileName}`

            setUploadProgress("Uploading to storage...")

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                console.error("Upload error:", error)
                // If bucket doesn't exist, show helpful message
                if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
                    setUploadProgress("Storage bucket not found. Using data URL instead...")
                    // Fall back to data URL
                    const dataUrl = await fileToDataUrl(file)
                    addImageByUrl(dataUrl)
                    return
                }
                throw error
            }

            setUploadProgress("Getting public URL...")

            // Get public URL
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

            // Fallback to data URL if upload fails
            try {
                const dataUrl = await fileToDataUrl(file)
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
        <Card className="bg-white dark:bg-gray-900 dark:border-gray-800" ref={containerRef}>
            <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                    Product Images
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-red-500" />}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add multiple images for your product. <span className="text-red-500 font-medium">Paste images directly (Ctrl+V)</span> or use the upload button.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Upload Progress */}
                {uploading && uploadProgress && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <span className="text-blue-700 dark:text-blue-300 text-sm">{uploadProgress}</span>
                    </div>
                )}

                {/* Paste Zone + File Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Paste/Drop Zone */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${isPasteActive
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-300 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-600'
                            }`}
                        onFocus={() => setIsPasteActive(true)}
                        onBlur={() => setIsPasteActive(false)}
                        tabIndex={0}
                    >
                        <Clipboard className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Paste Image Here
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Press Ctrl+V anywhere to paste
                        </p>
                    </div>

                    {/* File Upload */}
                    <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-red-400 dark:hover:border-red-600 transition-all">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Upload from Device
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Click to select files
                        </p>
                    </label>
                </div>

                {/* URL Input */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Or enter image URL (e.g., /images/product.jpg)"
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            onKeyDown={(e) => e.key === 'Enter' && addImage()}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={addImage}
                        disabled={!newImageUrl.trim()}
                        className="gap-2 bg-red-600 hover:bg-red-700"
                    >
                        <Plus size={16} />
                        Add
                    </Button>
                </div>

                {/* Image Gallery */}
                {images.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No images added yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Paste an image or upload from your device
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                className="relative border dark:border-gray-700 rounded-lg p-3 group"
                            >
                                {/* Image Preview */}
                                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-3">
                                    <Image
                                        src={image.image_url}
                                        alt={`Product image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    {image.is_primary && (
                                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                            <Star size={12} fill="white" />
                                            Primary
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveImage(index, 'up')}
                                            disabled={index === 0}
                                            className="h-8 w-8 p-0 dark:hover:bg-gray-800"
                                        >
                                            <GripVertical size={16} />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveImage(index, 'down')}
                                            disabled={index === images.length - 1}
                                            className="h-8 w-8 p-0 dark:hover:bg-gray-800"
                                        >
                                            <GripVertical size={16} className="rotate-180" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!image.is_primary && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPrimary(index)}
                                                className="text-xs dark:border-gray-700 dark:hover:bg-gray-800"
                                            >
                                                Set Primary
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeImage(index)}
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Image URL */}
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-2">
                                    {image.image_url}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tip: Use high-quality images (at least 1200x1200px) for best results
                </p>
            </CardContent>
        </Card>
    )
}
