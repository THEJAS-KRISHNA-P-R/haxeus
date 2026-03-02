import dynamic from "next/dynamic";
const ProductDetailsSkeleton = dynamic(() => import("./ProductDetailsSkeleton").then(mod => mod.ProductDetailsSkeleton), { ssr: false, loading: () => <div className="animate-pulse space-y-4"><div className="h-64 bg-[#1a1a1a] rounded-xl" /><div className="h-8 w-1/2 bg-[#1a1a1a] rounded-lg" /><div className="h-4 w-1/3 bg-[#1a1a1a] rounded-lg" /><div className="h-4 w-1/4 bg-[#1a1a1a] rounded-lg" /><div className="h-10 w-full bg-[#1a1a1a] rounded-lg" /></div> });
"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  front_image: string;
  available_sizes: string[];
  total_stock: number;
  colors?: string[];
}

export default function ProductDetails({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(product.available_sizes[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      await addItem(product.id, selectedSize, quantity);
      
      toast({
        title: "Added to Cart",
        description: `${product.name} (${selectedSize}) has been added to your cart.`,
        className: "bg-[#111] border-green-500",
      });
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast({
        title: "Error",
        description: error.message || "Could not add to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111] rounded-3xl shadow-md shadow-black/10 p-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-2 md:px-0">
      <div className="flex items-center justify-center">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl bg-black">
          <Image src={product.front_image || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
        </div>
      </div>
      <div>
        <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl font-bold text-[#e93a3a]">₹{product.price.toLocaleString()}</span>
          {product.total_stock > 0 && (
            <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-semibold">In Stock</span>
          )}
        </div>
        <p className="text-white/70 mb-6">{product.description}</p>
        <div className="mb-4">
          <div className="font-semibold mb-2">Size</div>
          <div className="flex gap-2 flex-wrap">
            {product.available_sizes.map((size: string) => (
              <button 
                key={size} 
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-lg border font-medium transition-all ${selectedSize === size ? 'border-[#e93a3a] bg-red-50 text-red-700' : 'border-white/[0.06] bg-[#0a0a0a] hover:border-red-400'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2">Color</div>
          <div className="flex gap-2 flex-wrap">
            {product.colors?.map((color: string) => (
              <button key={color} className="px-4 py-2 rounded-lg border border-white/[0.06] bg-[#0a0a0a] font-medium hover:border-red-400 focus:border-[#e93a3a] transition-all">{color}</button>
            )) || <span>Charcoal</span>}
          </div>
        </div>
        <div className="mb-6">
          <div className="font-semibold mb-2">Quantity</div>
          <select 
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="input-field w-24"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <button onClick={handleAddToCart} className="btn-primary w-full" disabled={loading}>
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
} 