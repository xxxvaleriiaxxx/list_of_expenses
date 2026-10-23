import { describe, expect, it } from 'vitest'
import { daysInMonth, monthLabel, monthsBack, shiftMonth } from './date'

describe('shiftMonth', () => {
  it('переходит через границу года', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2025-12', 1)).toBe('2026-01')
  })

  it('не меняет месяц при сдвиге на 0', () => {
    expect(shiftMonth('2026-10', 0)).toBe('2026-10')
  })
})

describe('monthsBack', () => {
  it('возвращает месяцы от старых к новым', () => {
    expect(monthsBack(3, '2026-02')).toEqual(['2025-12', '2026-01', '2026-02'])
  })
})

describe('daysInMonth', () => {
  it('знает про високосный год', () => {
    expect(daysInMonth('2024-02')).toBe(29)
    expect(daysInMonth('2026-02')).toBe(28)
    expect(daysInMonth('2026-10')).toBe(31)
  })
})

describe('monthLabel', () => {
  it('пишет месяц по-русски', () => {
    expect(monthLabel('2026-10').toLowerCase()).toContain('октябрь')
  })
})
