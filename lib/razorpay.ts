import Razorpay from 'razorpay';

/**
 * Razorpay singleton instance for server-side payment operations.
 * This is initialized using the Server-Side Key ID and Secret.
 * For client-side key, use NEXT_PUBLIC_RAZORPAY_KEY_ID instead.
 */
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Fatal: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables are missing.');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export { razorpay };
export default razorpay;
