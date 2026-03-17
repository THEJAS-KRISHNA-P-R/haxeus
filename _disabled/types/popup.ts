// ─── TRIGGER TYPES ───────────────────────────────────────────────────

export type TriggerType =
  | "exit_intent"          // mouse leaves top of viewport
  | "on_load"              // immediately on page load (with optional delay)
  | "scroll_stop"          // user stops scrolling for N seconds
  | "scroll_depth"         // user scrolls to X% of page
  | "time_on_page"         // user has been on page for N seconds

// ─── AUDIENCE TYPES ──────────────────────────────────────────────────

export type AudienceType =
  | "everyone"             // all visitors
  | "new_visitor"          // no prior localStorage session key
  | "returning_visitor"    // has prior localStorage session key
  | "logged_in"            // authenticated Supabase user
  | "first_time_buyer"     // logged in, orderCount === 0
  | "returning_customer"   // logged in, orderCount > 0

// ─── LAYOUT TYPES ────────────────────────────────────────────────────

export type PopupLayout =
  | "image_canvas"         // full image background with text overlays positioned freely
  | "split"                // image left, content right (or vice versa)
  | "centered"             // no image, centered content card
  | "banner"               // thin full-width banner at bottom of screen

export type ContentBlockType =
  | "headline"
  | "subtext"
  | "coupon_chip"
  | "cta_button"
  | "email_capture"
  | "dismiss_link"
  | "badge"                // small pill label (e.g. "LIMITED OFFER")
  | "fine_print"

// ─── CONTENT BLOCK ───────────────────────────────────────────────────

export interface ContentBlock {
  id: string               // uuid, generated on creation
  type: ContentBlockType
  text: string             // main text content
  placeholder?: string     // for email_capture inputs
  href?: string            // for cta_button and dismiss_link
  color?: string           // text color override
  bg_color?: string        // background color override (coupon_chip, badge, cta_button)
  font_size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
  font_weight?: "normal" | "semibold" | "bold" | "extrabold"
  text_align?: "left" | "center" | "right"

  // Position on image canvas (image_canvas layout only)
  // Values are percentages 0–100 of the image dimensions
  canvas_x?: number        // left edge %
  canvas_y?: number        // top edge %
  canvas_width?: number    // width % of container
}

// ─── TRIGGER CONFIG ──────────────────────────────────────────────────

export interface TriggerConfig {
  type: TriggerType
  delay_ms?: number           // for on_load: ms before showing
  scroll_stop_seconds?: number // for scroll_stop: idle seconds (default 25)
  scroll_depth_percent?: number // for scroll_depth: 0–100
  time_on_page_seconds?: number // for time_on_page
}

// ─── SECURITY CONFIG ─────────────────────────────────────────────────

export interface PopupSecurityConfig {
  max_email_submissions_per_ip_per_hour: number   // default 3
  require_valid_mx: boolean                        // validate MX record on email submit
  block_disposable_emails: boolean                 // block known temp email domains
  rate_limit_coupon_reveal: boolean                // don't show coupon until email submitted
  honeypot_field: boolean                          // add hidden field to catch bots
}

// ─── THE CAMPAIGN ────────────────────────────────────────────────────

export interface PopupCampaign {
  id: string                     // uuid
  name: string                   // admin label only, not shown to users
  enabled: boolean
  sort_order: number             // lower = evaluated first = higher priority

  // Audience
  audience: AudienceType

  // Trigger
  trigger: TriggerConfig

  // Cooldown
  cooldown_hours: number         // hours before showing to same user again (default 24)
  max_shows_per_session: number  // default 1 — max times to show in one browser session
  show_once_ever: boolean        // if true, never show again after first dismiss

  // Layout
  layout: PopupLayout

  // Image (used in image_canvas and split layouts)
  image_url: string
  image_alt: string
  image_position?: "left" | "right"  // for split layout

  // Content blocks (ordered array — render in order)
  // For image_canvas: blocks are absolutely positioned using canvas_x/canvas_y
  // For other layouts: blocks render top-to-bottom in the content zone
  blocks: ContentBlock[]

  // Style
  overlay_opacity: number        // 0.0–1.0
  accent_color: string           // primary brand color for this popup
  border_radius: number          // px, applied to popup panel (default 16)
  max_width: number              // px, max panel width (default 480)
  dark_panel: boolean            // if true, force dark panel regardless of user theme

  // Special behavior
  capture_email: boolean         // if true, email submission triggers coupon reveal
  coupon_code: string            // revealed after email capture (if capture_email)
  coupon_auto_copy: boolean      // auto-copy coupon on reveal

  // Security
  security: PopupSecurityConfig
}

// ─── CAMPAIGN LIST (the full config stored in store_settings) ────────

export type PopupCampaignList = PopupCampaign[]

// ─── USER CONTEXT ────────────────────────────────────────────────────

export interface UserContext {
  isNewVisitor: boolean
  isLoggedIn: boolean
  orderCount: number
  emailCaptured: boolean
  currentPage: string
  sessionDuration: number
  scrollDepth: number
}

// ─── ENGINE STATE ────────────────────────────────────────────────────

export interface PopupEngineState {
  activeCampaign: PopupCampaign | null
  userContext: UserContext
  isVisible: boolean
}
