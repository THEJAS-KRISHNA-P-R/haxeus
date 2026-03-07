import Razorpay from "razorpay"

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env variables")
}

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// NOTE: Do NOT export RAZORPAY_KEY_ID here — client components must use
// process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID directly (#7.2 security fix)
