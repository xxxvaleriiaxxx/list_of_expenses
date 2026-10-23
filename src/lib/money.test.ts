import { describe, expect, it } from 'vitest'
import { amountToInput, formatMoney, parseAmount } from './money'

describe('parseAmount', () => {
  it('понимает целые суммы', () => {
    expect(parseAmount('1290')).toBe(129000)
  })

  it('игнорирует пробелы между разрядами', () => {
    expect(parseAmount('1 290')).toBe(129000)
    expect(parseAmount('1 290 000')).toBe(129000000)
  })

  it('понимает копейки через запятую и точку', () => {
    expect(parseAmount('1290,50')).toBe(129050)
    expect(parseAmount('1290.50')).toBe(129050)
  })

  it('не принимает мусор', () => {
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount('-500')).toBeNull()
    expect(parseAmount('0')).toBeNull()
    expect(parseAmount('12,345')).toBeNull()
  })
})

describe('formatMoney', () => {
  it('показывает рубли с разделителями', () => {
    // В ru-RU неразрывный пробел между разрядами, поэтому проверяем без него
    expect(formatMoney(129000).replace(/\s/g, '')).toBe('1290₽')
  })

  it('показывает копейки, если они есть', () => {
    expect(formatMoney(129050).replace(/\s/g, '')).toBe('1290,5₽')
  })
})

describe('amountToInput', () => {
  it('не показывает лишние нули после запятой', () => {
    expect(amountToInput(2000000)).toBe('20000')
    expect(amountToInput(129050)).toBe('1290,50')
  })

  it('переживает обратное превращение', () => {
    expect(parseAmount(amountToInput(129050))).toBe(129050)
  })
})
