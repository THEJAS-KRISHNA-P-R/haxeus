import dynamic from "next/dynamic";
const ProductDetailsSkeleton = dynamic(() => import("./ProductDetailsSkeleton").then(mod => mod.ProductDetailsSkeleton), { ssr: false, loading: () => <div className="animate-pulse space-y-4"><div className="h-64 bg-gray-200 rounded-md" /><div className="h-8 w-1/2 bg-gray-200 rounded" /><div className="h-4 w-1/3 bg-gray-200 rounded" /><div className="h-4 w-1/4 bg-gray-200 rounded" /><div className="h-10 w-full bg-gray-200 rounded" /></div> });
"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
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

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    setLoading(true);
    // Check if user is signed in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      alert("Please sign in to add items to your cart.");
      setLoading(false);
      // Optionally, redirect to sign-in page:
      // router.push("/auth");
      return;
    }
    // Upsert logic for backend_cartitem
    // Check if item already exists for this user/product/size
    const { data: existing, error: fetchError } = await supabase
      .from("backend_cartitem")
      .select("id, quantity")
      .eq("user_id", session.user.id)
      .eq("product_id", product.id)
      .eq("size", selectedSize)
      .maybeSingle();

    let error = null;
    if (fetchError) {
      setLoading(false);
      alert("Could not check cart. Please try again.\n" + fetchError.message);
      return;
    }
    if (existing) {
      // Update quantity
      const { error: updateError } = await supabase
        .from("backend_cartitem")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
      error = updateError;
    } else {
      // Insert new cart item
      const { error: insertError } = await supabase.from("backend_cartitem").insert([
        {
          user_id: session.user.id,
          product_id: product.id,
          size: selectedSize,
          quantity,
          created_at: new Date().toISOString(),
        },
      ]);
      error = insertError;
    }
    setLoading(false);
    if (error) {
      console.error('Supabase cart error:', error);
      alert("Could not add to cart. Please try again.\n" + error.message);
    } else {
      alert("Added to cart!");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-2 md:px-0">
      <div className="flex items-center justify-center">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl bg-black">
          <Image src={product.front_image || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
        </div>
      </div>
      <div>
        <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl font-bold text-red-600">₹{product.price.toLocaleString()}</span>
          {product.total_stock > 0 && (
            <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-semibold">In Stock</span>
          )}
        </div>
        <p className="text-gray-700 mb-6">{product.description}</p>
        <div className="mb-4">
          <div className="font-semibold mb-2">Size</div>
          <div className="flex gap-2 flex-wrap">
            {product.available_sizes.map((size: string) => (
              <button 
                key={size} 
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-lg border font-medium transition-all ${selectedSize === size ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 bg-gray-50 hover:border-red-400'}`}
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
              <button key={color} className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 font-medium hover:border-red-400 focus:border-red-600 transition-all">{color}</button>
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