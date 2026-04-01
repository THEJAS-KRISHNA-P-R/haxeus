import { formatPrice, CURRENCY_SYMBOL } from '../currency'

describe('currency utility', () => {
  test('CURRENCY_SYMBOL should be the Rupee symbol (Unicode)', () => {
    expect(CURRENCY_SYMBOL).toBe('\u20B9')
  })

  test('formatPrice should format numbers with Indian locale and Rupee symbol', () => {
    // Basic formatting
    expect(formatPrice(1500)).toBe('\u20B91,500')
    
    // Indian large number formatting (1,00,000 instead of 100,000)
    expect(formatPrice(100000)).toBe('\u20B91,00,000')
    
    // Decimal handling (if any, though HAXEUS typically uses integers for INR)
    expect(formatPrice(999.99)).toBe('\u20B9999.99')
  })

  test('formatPrice should handle zero and small numbers', () => {
    expect(formatPrice(0)).toBe('\u20B90')
    expect(formatPrice(5)).toBe('\u20B95')
  })
})
