/**
 * GA4 Event Tracking Utility
 * Provides simplified interface for tracking GA4 events
 * Usage: import { gaEvent, gaCommerceEvents } from '@/lib/ga-events'
 */

type EventParams = Record<string, unknown>

/**
 * Core GA4 event tracking function
 * @param eventName - Name of the event to track
 * @param eventParams - Optional event parameters
 */
export const gaEvent = (eventName: string, eventParams?: EventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, { ...eventParams })
  }
}

/**
 * GA4 E-commerce specific events
 * Follows GA4 recommended event schema
 */
export const gaCommerceEvents = {
  /**
   * Track when a user views a product
   */
  viewItem: (productId: string, productName: string, price: number, category?: string) => {
    gaEvent('view_item', {
      items: [
        {
          item_id: productId,
          item_name: productName,
          price,
          ...(category && { item_category: category }),
        },
      ],
    })
  },

  /**
   * Track when a user views a list of products
   */
  viewItemList: (
    items: Array<{
      id: string
      name: string
      price: number
      category?: string
    }>,
    listName: string
  ) => {
    gaEvent('view_item_list', {
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        ...(item.category && { item_category: item.category }),
      })),
      list_name: listName,
    })
  },

  /**
   * Track when a user adds a product to cart
   */
  addToCart: (
    productId: string,
    productName: string,
    quantity: number,
    price: number,
    category?: string
  ) => {
    gaEvent('add_to_cart', {
      items: [
        {
          item_id: productId,
          item_name: productName,
          quantity,
          price,
          ...(category && { item_category: category }),
        },
      ],
      value: price * quantity,
      currency: 'INR',
    })
  },

  /**
   * Track when a user removes a product from cart
   */
  removeFromCart: (
    productId: string,
    productName: string,
    quantity: number,
    price: number,
    category?: string
  ) => {
    gaEvent('remove_from_cart', {
      items: [
        {
          item_id: productId,
          item_name: productName,
          quantity,
          price,
          ...(category && { item_category: category }),
        },
      ],
      value: price * quantity,
      currency: 'INR',
    })
  },

  /**
   * Track checkout initiation
   */
  beginCheckout: (
    items: Array<{
      id: string
      name: string
      price: number
      quantity: number
      category?: string
    }>,
    value: number
  ) => {
    gaEvent('begin_checkout', {
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        ...(item.category && { item_category: item.category }),
      })),
      value,
      currency: 'INR',
    })
  },

  /**
   * Track shipping information added
   */
  addShippingInfo: (
    items: Array<{
      id: string
      name: string
      price: number
      quantity: number
    }>,
    value: number,
    shippingTier: string
  ) => {
    gaEvent('add_shipping_info', {
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      value,
      currency: 'INR',
      shipping_tier: shippingTier,
    })
  },

  /**
   * Track payment information added
   */
  addPaymentInfo: (
    items: Array<{
      id: string
      name: string
      price: number
      quantity: number
    }>,
    value: number,
    paymentMethod: string
  ) => {
    gaEvent('add_payment_info', {
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      value,
      currency: 'INR',
      payment_type: paymentMethod,
    })
  },

  /**
   * Track purchase completion
   */
  purchase: (
    orderId: string,
    revenue: number,
    items: Array<{
      id: string
      name: string
      price: number
      quantity: number
      category?: string
    }>,
    tax?: number,
    shipping?: number,
    coupon?: string
  ) => {
    gaEvent('purchase', {
      transaction_id: orderId,
      value: revenue,
      currency: 'INR',
      tax: tax || 0,
      shipping: shipping || 0,
      ...(coupon && { coupon }),
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        ...(item.category && { item_category: item.category }),
      })),
    })
  },

  /**
   * Track refund
   */
  refund: (
    orderId: string,
    revenue: number,
    items: Array<{
      id: string
      name: string
      price: number
      quantity: number
    }>
  ) => {
    gaEvent('refund', {
      transaction_id: orderId,
      value: revenue,
      currency: 'INR',
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    })
  },

  /**
   * Track product search
   */
  search: (searchTerm: string, resultsCount?: number) => {
    gaEvent('search', {
      search_term: searchTerm,
      ...(resultsCount !== undefined && { number_of_results: resultsCount }),
    })
  },

  /**
   * Track wishlist add
   */
  addToWishlist: (productId: string, productName: string, price: number) => {
    gaEvent('add_to_wishlist', {
      items: [
        {
          item_id: productId,
          item_name: productName,
          price,
        },
      ],
      value: price,
      currency: 'INR',
    })
  },

  /**
   * Track product review submission
   */
  reviewSubmit: (productId: string, rating: number, _reviewText?: string) => {
    gaEvent('post_purchase', {
      items: [
        {
          item_id: productId,
        },
      ],
      ...(rating && { rating }),
    })
  },

  /**
   * Track view promotion
   */
  viewPromotion: (promotionName: string, promotionId: string, creativeName?: string) => {
    gaEvent('view_promotion', {
      promotion_name: promotionName,
      promotion_id: promotionId,
      ...(creativeName && { creative_name: creativeName }),
    })
  },

  /**
   * Track select promotion
   */
  selectPromotion: (promotionName: string, promotionId: string) => {
    gaEvent('select_promotion', {
      promotion_name: promotionName,
      promotion_id: promotionId,
    })
  },

  /**
   * Track user signup
   */
  sign_up: (signupMethod?: string) => {
    gaEvent('sign_up', {
      ...(signupMethod && { method: signupMethod }),
    })
  },

  /**
   * Track user login
   */
  login: (loginMethod?: string) => {
    gaEvent('login', {
      ...(loginMethod && { method: loginMethod }),
    })
  },
}

/**
 * GA4 Page view tracking
 * Usually handled automatically, but useful for SPA
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  gaEvent('page_view', {
    page_path: pagePath,
    ...(pageTitle && { page_title: pageTitle }),
  })
}

/**
 * Track custom events with any parameters
 */
export const trackCustomEvent = (eventName: string, params?: EventParams) => {
  gaEvent(eventName, params)
}

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'set', properties)
  }
}

/**
 * Track user ID (if available)
   */
export const setUserId = (userId: string) => {
  if (typeof window !== 'undefined' && window.gtag && process.env.NEXT_PUBLIC_GA4_ID) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA4_ID, {
      'user_id': userId,
    })
  }
}

/**
 * Track scroll depth
 */
export const trackScrollDepth = () => {
  if (typeof window !== 'undefined') {
    let maxScroll = 0

    window.addEventListener('scroll', () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      const rounded = Math.round(scrolled / 10) * 10

      if (rounded > maxScroll) {
        maxScroll = rounded
        gaEvent('scroll', {
          scroll_depth: rounded,
        })
      }
    })
  }
}
