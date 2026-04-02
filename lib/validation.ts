/**
 * HAXEUS — Validation Utilities
 * 
 * Centralized logic for input verification to ensure high-quality data
 * and prevent junk/bot submissions.
 */

/**
 * Validates an email address using a strict regex pattern, blacklist, and subdomain check.
 * 
 * Features:
 * - Minimum 2-character Top-Level Domain (TLD) (e.g., .in, .com)
 * - Required domain segment before TLD
 * - Local part allows standard chars but blocks common junk patterns
 * - Domain segments limited to 1-63 chars (per RFC)
 * - Blacklist for placeholder prefixes (test, demo, etc.) and domains
 * - Subdomain protection (blocks user@mail.test.com, allows user@edu.in)
 * 
 * @param email - The email string to validate
 * @returns boolean
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const trimmedEmail = email.trim().toLowerCase();
  if (trimmedEmail.length < 5) return false;

  // 1. Blacklisted Keywords (Placeholder/Junk protection)
  const blacklistedPrefixes = ["test", "demo", "dummy", "example", "admin", "guest", "temp", "trash", "user", "placeholder", "email", "xyz"];
  const blacklistedDomains = ["example.com", "test.com", "test.in", "mailinator.com", "yopmail.com", "email.com", "xyz.com", "mail.com", "temp.com", "junk.com"];

  const [localPart, domain] = trimmedEmail.split("@");
  if (!localPart || !domain) return false;
  
  // Block common test precursors or exact placeholder local parts
  if (blacklistedPrefixes.some(p => localPart === p || localPart.startsWith(`${p}.`) || localPart.startsWith(`${p}_`))) {
    return false;
  }

  // Block obvious test domains
  if (blacklistedDomains.some(d => domain === d)) {
    return false;
  }

  // 2. Subdomain Protection
  // Standard domains usually have 1 dot (google.com) or 2 dots for public TLDs (edu.in, co.in)
  const domainParts = domain.split(".");
  if (domainParts.length > 3) return false; // mail.sub.domain.com is rejected

  if (domainParts.length === 3) {
    // Only allow 3 parts if it's a recognized common multi-level TLD (mostly for India .in)
    const tld = domainParts.slice(-2).join(".");
    const approvedMultiTLDs = ["co.in", "edu.in", "org.in", "net.in", "ac.in", "gov.in", "res.in", "co.uk", "org.uk"];
    
    if (!approvedMultiTLDs.includes(tld)) {
      return false; // Blocks user@sub.gmail.com
    }
  }

  // 3. Structural Regex:
  const regex = /^[a-zA-Z0-9._%+-]+@(?=[a-zA-Z0-9-]{2,63}\.)[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+$/;
  
  return regex.test(trimmedEmail);
}

/**
 * Validates a standard Indian phone number (10 digits).
 * 
 * @param phone - The phone string to validate
 * @returns boolean
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10;
}
