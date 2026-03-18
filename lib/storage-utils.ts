// lib/storage-utils.ts
// Shared URL helpers for Supabase Storage

export function isSupabaseStorageUrl(url?: string | null): boolean {
  return typeof url === "string" && url.includes(".supabase.co/storage/v1/")
}
