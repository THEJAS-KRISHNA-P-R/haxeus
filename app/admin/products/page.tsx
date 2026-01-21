"use client"

import { useEffect, useState } from "react"
import { supabase, type Product } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  // Also reload when the page regains focus (after returning from edit page)
  useEffect(() => {
    const handleFocus = () => {
      loadProducts()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  async function loadProducts() {
    try {
      // Load products with their images
      const { data: productsData, error } = await supabase
        .from("products")
        .select(`
          *,
          images:product_images(id, image_url, is_primary, display_order)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Type cast and add computed properties
      const productsWithImages = (productsData || []).map(p => ({
        ...p,
        images: p.images || []
      }))

      setProducts(productsWithImages as any)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteProduct() {
    if (!deleteProductId) return

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", deleteProductId)

      if (error) throw error

      setProducts(products.filter((p) => p.id !== deleteProductId))
      setDeleteProductId(null)
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product")
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your product inventory</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 bg-red-600 hover:bg-red-700">
            <Plus size={20} />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="pt-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-800">
                <TableHead className="dark:text-gray-300">Image</TableHead>
                <TableHead className="dark:text-gray-300">Name</TableHead>
                <TableHead className="dark:text-gray-300">Price</TableHead>
                <TableHead className="dark:text-gray-300">Stock</TableHead>
                <TableHead className="dark:text-gray-300">Sizes</TableHead>
                <TableHead className="dark:text-gray-300">Status</TableHead>
                <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow className="dark:border-gray-800">
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No products found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="dark:border-gray-800">
                    <TableCell>
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <Image
                          src={product.front_image || "/placeholder.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium dark:text-white">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.category || "Apparel"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold dark:text-white">
                        ₹{product.price.toLocaleString("en-IN")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="dark:text-white">{product.total_stock}</span>
                        {product.total_stock < 20 && (
                          <span title="Low stock">
                            <AlertCircle
                              size={16}
                              className="text-orange-500 dark:text-orange-400"
                            />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.available_sizes?.slice(0, 3).map((size) => (
                          <Badge key={size} variant="outline" className="text-xs dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                            {size}
                          </Badge>
                        ))}
                        {product.available_sizes?.length > 3 && (
                          <Badge variant="outline" className="text-xs dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                            +{product.available_sizes.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.total_stock > 0 ? "default" : "destructive"
                        }
                        className={product.total_stock > 0 ? "bg-green-600 dark:bg-green-700" : ""}
                      >
                        {product.total_stock > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon" className="dark:hover:bg-gray-800 dark:text-gray-300">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteProductId(product.id)}
                          className="dark:hover:bg-gray-800"
                        >
                          <Trash2 size={16} className="text-red-500 dark:text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteProductId !== null}
        onOpenChange={(open) => !open && setDeleteProductId(null)}
      >
        <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              This action cannot be undone. This will permanently delete the
              product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
