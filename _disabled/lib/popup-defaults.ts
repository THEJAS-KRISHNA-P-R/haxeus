import type { PopupCampaign } from "@/types/popup"
import { v4 as uuidv4 } from "uuid"

export const DEFAULT_POPUP_CAMPAIGNS: PopupCampaign[] = [

  // ── Campaign 1: New visitor welcome (exit intent) ───────────────────
  {
    id: "default-new-visitor",
    name: "New Visitor — Exit Intent Welcome",
    enabled: true,
    sort_order: 0,
    audience: "new_visitor",
    trigger: { type: "exit_intent", delay_ms: 300 },
    cooldown_hours: 24,
    max_shows_per_session: 1,
    show_once_ever: false,
    layout: "split",
    image_url: "/images/save-flower-front.jpg",
    image_alt: "HAXEUS drop",
    image_position: "left",
    blocks: [
      { id: "b1", type: "badge", text: "WELCOME OFFER", bg_color: "#e7bf04", color: "#000", font_size: "xs", font_weight: "bold", text_align: "center" },
      { id: "b2", type: "headline", text: "Wait — Don't Leave Yet!", font_size: "2xl", font_weight: "bold", text_align: "left" },
      { id: "b3", type: "subtext", text: "Drop your email and get 10% off your first order. No spam, ever.", font_size: "sm", text_align: "left" },
      { id: "b4", type: "email_capture", text: "Claim 10% Off", placeholder: "your@email.com", bg_color: "#e93a3a" },
      { id: "b5", type: "fine_print", text: "Valid 24 hours. First order only.", font_size: "xs", text_align: "left" },
      { id: "b6", type: "dismiss_link", text: "No thanks, I'll pay full price", font_size: "xs", text_align: "center" }
    ],
    overlay_opacity: 0.75,
    accent_color: "#e93a3a",
    border_radius: 16,
    max_width: 720,
    dark_panel: true,
    capture_email: true,
    coupon_code: "WELCOME10",
    coupon_auto_copy: true,
    security: {
      max_email_submissions_per_ip_per_hour: 3,
      require_valid_mx: false,
      block_disposable_emails: true,
      rate_limit_coupon_reveal: true,
      honeypot_field: true
    }
  },

  // ── Campaign 2: Returning customer (scroll stop) ────────────────────
  {
    id: "default-returning-customer",
    name: "Returning Customer — New Drop Tease",
    enabled: true,
    sort_order: 1,
    audience: "returning_customer",
    trigger: { type: "scroll_stop", scroll_stop_seconds: 25 },
    cooldown_hours: 48,
    max_shows_per_session: 1,
    show_once_ever: false,
    layout: "image_canvas",
    image_url: "/images/save-flower-front.jpg",
    image_alt: "New drop",
    image_position: "left",
    blocks: [
      {
        id: "c1", type: "badge", text: "BACK AGAIN?",
        bg_color: "#07e4e1", color: "#000",
        font_size: "xs", font_weight: "bold",
        canvas_x: 5, canvas_y: 5, canvas_width: 30
      },
      {
        id: "c2", type: "headline", text: "New Drop Just Landed.",
        font_size: "3xl", font_weight: "extrabold", color: "#ffffff",
        canvas_x: 5, canvas_y: 50, canvas_width: 60
      },
      {
        id: "c3", type: "cta_button", text: "Shop New Arrivals", href: "/products",
        bg_color: "#e93a3a", color: "#ffffff",
        canvas_x: 5, canvas_y: 78, canvas_width: 45
      },
      {
        id: "c4", type: "dismiss_link", text: "Maybe later",
        color: "rgba(255,255,255,0.5)", font_size: "xs",
        canvas_x: 5, canvas_y: 91, canvas_width: 30
      }
    ],
    overlay_opacity: 0.7,
    accent_color: "#07e4e1",
    border_radius: 16,
    max_width: 520,
    dark_panel: true,
    capture_email: false,
    coupon_code: "",
    coupon_auto_copy: false,
    security: {
      max_email_submissions_per_ip_per_hour: 3,
      require_valid_mx: false,
      block_disposable_emails: false,
      rate_limit_coupon_reveal: false,
      honeypot_field: false
    }
  }
]
