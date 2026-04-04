import { cn } from '@/lib/utils'
import { Clock, CheckCircle, XCircle, Truck, Package } from 'lucide-react'

export type OrderStatus = 'pending' | 'confirmed' | 'payment_failed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'preorder'

interface PaymentStatusBadgeProps {
  status: OrderStatus
  className?: string
}

const STATUS_MAP: Record<OrderStatus, { label: string; icon: any; colorCls: string }> = {
  pending: {
    label: 'Awaiting payment',
    icon: Clock,
    colorCls: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  },
  confirmed: {
    label: 'Payment confirmed',
    icon: CheckCircle,
    colorCls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  },
  payment_failed: {
    label: 'Payment failed',
    icon: XCircle,
    colorCls: 'bg-red-500/10 text-red-500 border-red-500/20'
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    colorCls: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    colorCls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    colorCls: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  },
  refunded: {
    label: 'Refunded',
    icon: Clock,
    colorCls: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
  },
  preorder: {
    label: 'Pre-order confirmed',
    icon: Package,
    colorCls: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  }
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const normalizedStatus = (status || 'pending').toLowerCase() as OrderStatus
  const config = STATUS_MAP[normalizedStatus] || STATUS_MAP.pending
  const Icon = config.icon

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase",
      config.colorCls,
      className
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  )
}
