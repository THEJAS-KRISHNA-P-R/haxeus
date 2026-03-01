"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface Props {
    amount: number; // in INR
    orderId: string; // your internal order ID
    customerName: string;
    customerEmail: string;
    customerPhone: string;
}

export function RazorpayButton({ amount, orderId, customerName, customerEmail, customerPhone }: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const loadRazorpay = () =>
        new Promise<boolean>((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handlePayment = async () => {
        setLoading(true);
        try {
            const loaded = await loadRazorpay();
            if (!loaded) throw new Error('Razorpay SDK failed to load');

            const res = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, orderId }),
            });
            const { orderId: razorpayOrderId } = await res.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: amount * 100,
                currency: 'INR',
                name: 'HAXEUS',
                description: 'Premium T-Shirt Order',
                order_id: razorpayOrderId,
                prefill: { name: customerName, email: customerEmail, contact: customerPhone },
                theme: { color: '#000000' },
                handler: async (response: any) => {
                    const verify = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...response, internalOrderId: orderId }),
                    });
                    if (verify.ok) {
                        router.push(`/orders/${orderId}?status=success`);
                    }
                },
            };

            new window.Razorpay(options).open();
        } catch (err) {
            console.error('Payment error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 bg-black text-white font-bold text-lg rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-all"
        >
            {loading ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
        </button>
    );
}
