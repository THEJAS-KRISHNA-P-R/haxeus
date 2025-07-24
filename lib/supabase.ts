import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://hexzhuaifunjowwqkxcy.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhleHpodWFpZnVuam93d3FreGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTQ2MDgsImV4cCI6MjA2ODY5MDYwOH0.d91NCn28rURIwFtEfUiJxtVxRf6Bm-X9XeyCGxDiURE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
