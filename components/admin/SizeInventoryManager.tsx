"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, AlertCircle, Package } from "lucide-react"
import { ProductInventory } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

interface SizeInventoryManagerProps {
    inventory: ProductInventory[]
    onChange: (inventory: ProductInventory[]) => void
}

export function SizeInventoryManager({ inventory, onChange }: SizeInventoryManagerProps) {
    const [newSize, setNewSize] = useState("")

    const addSize = () => {
        if (!newSize.trim()) return

        // Check if size already exists
        if (inventory.some(inv => inv.size.toUpperCase() === newSize.trim().toUpperCase())) {
            alert(`Size "${newSize}" already exists`)
            return
        }

        const newInventory: ProductInventory = {
            id: `temp-${Date.now()}`,
            product_id: 0, // Will be set when saving
            size: newSize.trim().toUpperCase(),
            color: "default",
            stock_quantity: 0,
            low_stock_threshold: 10,
            reserved_quantity: 0,
            sold_quantity: 0,
        }

        onChange([...inventory, newInventory])
        setNewSize("")
    }

    const removeSize = (index: number) => {
        onChange(inventory.filter((_, i) => i !== index))
    }

    const updateStock = (index: number, stock: number) => {
        const newInventory = [...inventory]
        newInventory[index].stock_quantity = Math.max(0, stock)
        onChange(newInventory)
    }

    const updateThreshold = (index: number, threshold: number) => {
        const newInventory = [...inventory]
        newInventory[index].low_stock_threshold = Math.max(0, threshold)
        onChange(newInventory)
    }

    const getStockStatus = (item: ProductInventory) => {
        if (item.stock_quantity === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" }
        if (item.stock_quantity <= item.low_stock_threshold) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300" }
        return { label: "In Stock", color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" }
    }

    const totalStock = inventory.reduce((sum, inv) => sum + inv.stock_quantity, 0)

    return (
        <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="dark:text-white">Size Inventory</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Manage stock for each size variant
                        </p>
                    </div>
                    {inventory.length > 0 && (
                        <Badge variant="secondary" className="text-lg px-4 py-2 dark:bg-gray-800 dark:text-gray-300">
                            <Package size={16} className="mr-2" />
                            Total: {totalStock}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add New Size */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            placeholder="Enter size (e.g., S, M, L, XL, XXL)"
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            onKeyDown={(e) => e.key === 'Enter' && addSize()}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={addSize}
                        className="gap-2 bg-red-600 hover:bg-red-700"
                    >
                        <Plus size={16} />
                        Add Size
                    </Button>
                </div>

                {/* Size Inventory List */}
                {inventory.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No sizes added yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Add size variants to track inventory
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {inventory.map((item, index) => {
                            const status = getStockStatus(item)
                            return (
                                <div
                                    key={item.id}
                                    className="border dark:border-gray-700 rounded-lg p-4 space-y-3"
                                >
                                    {/* Size Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold text-lg">
                                                {item.size}
                                            </div>
                                            <div>
                                                <p className="font-semibold dark:text-white">Size {item.size}</p>
                                                <Badge className={status.color}>
                                                    {status.label}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeSize(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>

                                    {/* Stock Controls */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`stock-${index}`} className="text-sm dark:text-gray-300">
                                                Stock Quantity *
                                            </Label>
                                            <Input
                                                id={`stock-${index}`}
                                                type="number"
                                                min="0"
                                                value={item.stock_quantity}
                                                onChange={(e) => updateStock(index, Number(e.target.value))}
                                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`threshold-${index}`} className="text-sm dark:text-gray-300">
                                                Low Stock Alert
                                            </Label>
                                            <Input
                                                id={`threshold-${index}`}
                                                type="number"
                                                min="0"
                                                value={item.low_stock_threshold}
                                                onChange={(e) => updateThreshold(index, Number(e.target.value))}
                                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Warning for Low/Out of Stock */}
                                    {item.stock_quantity <= item.low_stock_threshold && (
                                        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                            <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-500 mt-0.5" />
                                            <div className="text-sm text-yellow-800 dark:text-yellow-300">
                                                {item.stock_quantity === 0
                                                    ? `Size ${item.size} is out of stock. Customers won't be able to purchase this size.`
                                                    : `Size ${item.size} has low stock (${item.stock_quantity} remaining). Consider restocking.`
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                        <strong>Tip:</strong> Set "Low Stock Alert" to receive warnings when inventory gets low.
                        The default threshold is 10 units.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
