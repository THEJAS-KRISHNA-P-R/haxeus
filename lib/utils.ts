import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize user-provided text — strips HTML tags using regex,
 * trims whitespace, and enforces a max length of 2000 characters.
 */
export function sanitizeText(input: string): string {
  if (!input) return ""
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/javascript:/gi, "") // strip javascript: protocol
    .replace(/on\w+\s*=/gi, "") // strip event handlers
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
