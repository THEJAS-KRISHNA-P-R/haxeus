"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { GlassInput } from "@/components/ui/GlassInput";
import { ShimmerButton } from "@/components/ui/ShimmerButton";

export function AdminModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4"
          >
            <div
              data-testid="admin-modal"
              className="relative bg-[#111] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                <h2 className="font-semibold text-white text-lg">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 text-white/30 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-6 py-5">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function EditProductModal({
  product,
  open,
  onClose,
}: {
  product: any;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AdminModal open={open} onClose={onClose} title="Edit Product">
      <form className="space-y-4">
        <GlassInput
          label="Product Name"
          defaultValue={product?.name}
          placeholder="e.g. Acid Wash Tee"
        />
        <GlassInput
          label="Price (₹)"
          defaultValue={product?.price}
          type="number"
          placeholder="999"
        />
        <GlassInput
          label="Stock"
          defaultValue={product?.stock}
          type="number"
          placeholder="50"
        />
        <div>
          <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-2">
            Description
          </label>
          <textarea
            defaultValue={product?.description}
            placeholder="Product description..."
            rows={3}
            className="w-full rounded-xl px-4 py-3.5 text-sm text-white/90 bg-white/[0.03] border border-white/[0.08] outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all placeholder:text-white/20 resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-white/50 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] rounded-xl border border-white/[0.08] transition-all"
          >
            Cancel
          </button>
          <ShimmerButton className="flex-1 py-2.5 text-sm font-semibold" borderRadius="12px">
            Save Changes
          </ShimmerButton>
        </div>
      </form>
    </AdminModal>
  );
}
