"use client"

import { useState } from "react"
import { AdminCard, AdminButton, AdminInput, AdminBadge } from "@/components/admin/AdminUI"
import { X, Plus, AlertCircle, Package } from "lucide-react"
import { ProductInventory } from "@/lib/supabase"

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
        if (item.stock_quantity === 0) return { label: "Out of Stock", variant: "danger" as const }
        if (item.stock_quantity <= item.low_stock_threshold) return { label: "Low Stock", variant: "warning" as const }
        return { label: "In Stock", variant: "success" as const }
    }

    const totalStock = inventory.reduce((sum, inv) => sum + inv.stock_quantity, 0)

    return (
        <AdminCard className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 style={{ color: "var(--text)" }} className="text-xl font-bold">
                        Size Inventory
                    </h2>
                    <p style={{ color: "var(--text-3)" }} className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">
                        Manage stock for each size variant
                    </p>
                </div>
                {inventory.length > 0 && (
                    <AdminBadge variant="neutral" className="px-3 py-1.5 text-[10px]">
                        <Package size={12} className="mr-1.5" />
                        Total: {totalStock}
                    </AdminBadge>
                )}
            </div>

            <div className="space-y-6">
                {/* Add New Size */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <AdminInput
                            value={newSize}
                            onChange={(e: any) => setNewSize(e.target.value)}
                            placeholder="Enter size (e.g., S, M, L, XL)"
                            onKeyDown={(e: any) => e.key === 'Enter' && addSize()}
                        />
                    </div>
                    <AdminButton
                        type="button"
                        onClick={addSize}
                        variant="primary"
                        icon={Plus}
                    >
                        Add Size
                    </AdminButton>
                </div>

                {/* Size Inventory List */}
                {inventory.length === 0 ? (
                    <div 
                        className="border border-dashed rounded-2xl p-12 text-center"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <Package size={32} style={{ color: "var(--text-3)" }} className="mx-auto mb-4 opacity-50" />
                        <p style={{ color: "var(--text)" }} className="text-[11px] font-bold uppercase tracking-widest">No sizes added yet</p>
                        <p style={{ color: "var(--text-3)" }} className="text-[9px] uppercase tracking-[0.2em] mt-1 opacity-50">
                            Add size variants to track inventory
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {inventory.map((item, index) => {
                            const status = getStockStatus(item)
                            return (
                                <div
                                    key={item.id}
                                    className="rounded-2xl p-5 space-y-5"
                                    style={{
                                        background: "rgba(var(--bg-rgb), 0.03)",
                                        border: "1px solid var(--border)"
                                    }}
                                >
                                    {/* Size Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg" style={{ background: "var(--bg-card)", color: "var(--text)" }}>
                                                {item.size}
                                            </div>
                                            <div>
                                                <p style={{ color: "var(--text)" }} className="text-[12px] font-bold uppercase tracking-widest opacity-90 mb-1.5">Size {item.size}</p>
                                                <AdminBadge variant={status.variant}>
                                                    {status.label}
                                                </AdminBadge>
                                            </div>
                                        </div>
                                        <AdminButton
                                            type="button"
                                            variant="danger"
                                            onClick={() => removeSize(index)}
                                            className="px-3"
                                        >
                                            <X size={14} />
                                        </AdminButton>
                                    </div>

                                    {/* Stock Controls */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <AdminInput
                                            label="Stock Quantity *"
                                            id={`stock-${index}`}
                                            type="number"
                                            min={0}
                                            value={item.stock_quantity}
                                            onChange={(e: any) => updateStock(index, Number(e.target.value))}
                                        />
                                        <AdminInput
                                            label="Low Stock Alert"
                                            id={`threshold-${index}`}
                                            type="number"
                                            min={0}
                                            value={item.low_stock_threshold}
                                            onChange={(e: any) => updateThreshold(index, Number(e.target.value))}
                                        />
                                    </div>

                                    {/* Warning for Low/Out of Stock */}
                                    {item.stock_quantity <= item.low_stock_threshold && (
                                        <div className="flex items-start gap-3 p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-xl">
                                            <AlertCircle size={16} className="text-yellow-500 mt-0.5" />
                                            <div className="text-[11px] font-bold tracking-wide text-yellow-500/90 leading-normal">
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

                <div className="flex items-start gap-3 p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl">
                    <AlertCircle size={16} className="text-[var(--accent)] mt-0.5 opacity-80" />
                    <p className="text-[11px] font-bold tracking-wide text-[var(--accent)]/90 leading-normal">
                        <strong>Tip:</strong> Set "Low Stock Alert" to receive warnings when inventory gets low. Default is 10 units.
                    </p>
                </div>
            </div>
        </AdminCard>
    )
}
