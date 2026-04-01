/**
 * HAXEUS — Validation Utilities
 * 
 * Centralized logic for input verification to ensure high-quality data
 * and prevent junk/bot submissions.
 */

/**
 * Validates an email address using a strict regex pattern.
 * 
 * Features:
 * - Minimum 2-character Top-Level Domain (TLD) (e.g., .in, .com)
 * - Required domain segment before TLD
 * - Local part allows standard chars but blocks common junk patterns
 * - Domain segments limited to 1-63 chars (per RFC)
 * 
 * @param email - The email string to validate
 * @returns boolean
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const trimmedEmail = email.trim();
  if (trimmedEmail.length < 5) return false; // a@b.c is the minimum

  // Stricter Regex:
  // 1. Local part: [a-zA-Z0-9._%+-]+
  // 2. Domain segment: (?=[a-zA-Z0-9-]{2,63}\.)[a-zA-Z0-9-]+ (at least 2 chars before dot)
  // 3. TLD: (?:\.[a-zA-Z]{2,})+ (at least two characters, e.g., .in)
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
