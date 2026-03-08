import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "isomorphic-dompurify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize user-provided text — strips ALL HTML tags and attributes,
 * trims whitespace, and enforces a max length of 2000 characters.
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
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
