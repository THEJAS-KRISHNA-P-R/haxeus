import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/validation";

/**
 * HAXEUS - Email Verification Proxy
 * Uses rapid-email-verifier.fly.dev to confirm deliverability.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 0. Local Junk Domain Firewall (Instant Check)
    if (!isValidEmail(email)) {
      console.log(`[verify-email] Blocked junk/placeholder email: ${email}`);
      return NextResponse.json({ 
        isValid: false, 
        reason: "placeholder",
        message: "This email is common placeholder and is not accepted." 
      });
    }

    // 1. Prepare external API call
    const verifierUrl = `https://rapid-email-verifier.fly.dev/api/validate?email=${encodeURIComponent(email)}`;
    
    // 2. Fetch with a 3-second timeout to protect UX
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(verifierUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If service is down, we log but return true to FALLBACK to local validation
      console.warn("Rapid Verifier service returned non-200. Falling back to local validation.");
      return NextResponse.json({ isValid: true, fallback: true });
    }

    const result = await response.json();

    // 3. Logic: All conditions must be met for 'Premium Valid'
    // The Rapid Verifier API returns status: "VALID" and a validations object
    const isValid = result.status === "VALID" && result.validations?.mx_records;

    return NextResponse.json({ 
      isValid, 
      isDisposable: result.validations?.is_disposable || false,
      suggestion: result.suggestion || null
    });

  } catch (error) {
    // If timeout or other fetch error, FALLBACK to local validation
    console.error("Email verification proxy error:", error);
    return NextResponse.json({ isValid: true, fallback: true });
  }
}
