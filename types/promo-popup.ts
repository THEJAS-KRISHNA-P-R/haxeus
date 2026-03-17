export interface PromoTextBlock {
  id: string
  text: string
  position: "top-left" | "top-center" | "top-right" | "center" | "bottom-left" | "bottom-center" | "bottom-right"
  font_size: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
  font_weight: "normal" | "semibold" | "bold" | "extrabold"
  color: string           // hex
  bg_color: string        // hex or "transparent"
  bg_opacity: number      // 0–1, for the text block background
  padding: "none" | "sm" | "md" | "lg"
  border_radius: "none" | "sm" | "md" | "full"
}

export interface PromoButton {
  text: string
  href: string
  color: string           // text color
  bg_color: string        // background
  position: "bottom-left" | "bottom-center" | "bottom-right" | "center"
  open_in_new_tab: boolean
}

export interface PromoPopup {
  id: string
  name: string            // admin label
  enabled: boolean
  image_url: string
  image_alt: string
  overlay_color: string   // hex, applied over image for readability (default "#000000")
  overlay_opacity: number // 0–0.7
  text_blocks: PromoTextBlock[]
  button: PromoButton | null
  show_close_button: boolean
  close_button_color: string
  trigger: "on_load" | "exit_intent" | "manual"
  delay_ms: number        // for on_load trigger
  cooldown_hours: number
  show_once: boolean
  max_width: number       // px
  border_radius: number   // px
  created_at: string
  updated_at: string
}
