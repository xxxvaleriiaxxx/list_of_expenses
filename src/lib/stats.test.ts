import { describe, expect, it } from 'vitest'
import type { Expense } from '../types'
import {
  categoryLimitStatuses,
  categoryTotals,
  forecastForMonth,
  monthlyTotals,
  spentByCategory,
} from './stats'

const expense = (
  amountKopecks: number,
  category: Expense['category'],
  date: string,
): Expense => ({
  id: `${category}-${date}-${amountKopecks}`,
  amountKopecks,
  category,
  date,
  comment: '',
})

const expenses: Expense[] = [
  expense(100000, 'food', '2026-10-01'),
  expense(50000, 'food', '2026-10-02'),
  expense(300000, 'home', '2026-10-03'),
  expense(20000, 'fun', '2026-09-15'),
]

describe('spentByCategory', () => {
  it('складывает траты по категориям', () => {
    const result = spentByCategory(expenses)
    expect(result.food).toBe(150000)
    expect(result.home).toBe(300000)
    expect(result.transport).toBe(0)
  })
})

describe('categoryTotals', () => {
  it('сортирует от большей суммы к меньшей и убирает пустые', () => {
    const result = categoryTotals(expenses)
    expect(result.map((item) => item.category)).toEqual(['home', 'food', 'fun'])
    expect(result).toHaveLength(3)
  })
})

describe('categoryLimitStatuses', () => {
  it('считает остаток и процент', () => {
    const statuses = categoryLimitStatuses(expenses, {
      total: null,
      byCategory: { food: 200000 },
    })
    const food = statuses.find((item) => item.category === 'food')

    expect(food?.spent).toBe(150000)
    expect(food?.remaining).toBe(50000)
    expect(food?.percent).toBe(0.75)
  })

  it('показывает превышение отрицательным остатком', () => {
    const statuses = categoryLimitStatuses(expenses, {
      total: null,
      byCategory: { home: 100000 },
    })
    const home = statuses.find((item) => item.category === 'home')

    expect(home?.remaining).toBe(-200000)
    expect(home?.percent).toBe(3)
  })

  it('ставит категории с лимитом выше категорий без лимита', () => {
    const statuses = categoryLimitStatuses(expenses, {
      total: null,
      byCategory: { fun: 500000 },
    })

    expect(statuses[0]?.category).toBe('fun')
    expect(statuses.at(-1)?.limit).toBeNull()
  })
})

describe('monthlyTotals', () => {
  it('возвращает нули для месяцев без трат', () => {
    const result = monthlyTotals(expenses, ['2026-08', '2026-09', '2026-10'])
    expect(result).toEqual([
      { month: '2026-08', total: 0 },
      { month: '2026-09', total: 20000 },
      { month: '2026-10', total: 450000 },
    ])
  })
})

describe('forecastForMonth', () => {
  it('считает прогноз по текущему темпу', () => {
    // 10 октября потрачено 4500 ₽ за 10 дней → 450 ₽/день × 31 день
    const forecast = forecastForMonth(expenses, '2026-10', new Date('2026-10-10T12:00:00'))
    expect(forecast).toBe(1395000)
  })

  it('не даёт прогноз для прошлого месяца', () => {
    expect(forecastForMonth(expenses, '2026-09', new Date('2026-10-10T12:00:00'))).toBeNull()
  })

  it('не даёт прогноз, если трат нет', () => {
    expect(forecastForMonth([], '2026-10', new Date('2026-10-10T12:00:00'))).toBeNull()
  })
})
