import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize user-provided text — strips HTML tags, dangerous protocols,
 * event handlers, null bytes, and Unicode control chars, then trims
 * and enforces a max length of 2000 characters.
 */
export function sanitizeText(input: string): string {
  if (!input) return ""
  return input
    .replace(/\0/g, "")                     // strip null bytes
    .replace(/<[^>]*>/g, "")                // strip HTML tags
    .replace(/javascript\s*:/gi, "")        // strip javascript: protocol
    .replace(/vbscript\s*:/gi, "")          // strip vbscript: protocol
    .replace(/data\s*:[^,]*;base64/gi, "")  // strip data: base64 URIs
    .replace(/on\w+\s*=/gi, "")             // strip event handlers
    .replace(/expression\s*\(/gi, "")       // strip CSS expressions
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") // strip control chars
    .trim()
    .slice(0, 2000)
}

/**
 * Sanitize and validate an email address.
 * Trims, lowercases, enforces RFC-compliant format, and limits to 254 chars.
 */
export function sanitizeEmail(input: string): string {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  const trimmed = input.trim().toLowerCase().slice(0, 254)
  if (!emailRegex.test(trimmed)) throw new Error("Invalid email format")
  return trimmed
}
