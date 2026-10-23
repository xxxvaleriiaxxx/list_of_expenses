// Чистые вычисления по тратам. Здесь нет ни одного компонента —
// поэтому всё это легко проверить тестами (см. stats.test.ts).

import type { Category, Expense, Limits } from '../types'
import { CATEGORIES } from '../types'
import { daysInMonth, isSameMonth } from './date'

export interface CategoryTotal {
  category: Category
  label: string
  color: string
  total: number
}

export interface LimitStatus {
  category: Category
  label: string
  color: string
  spent: number
  limit: number | null
  /** Доля израсходованного: 0.75 = потрачено 75% лимита */
  percent: number
  /** Сколько осталось. Отрицательное значение — превышение */
  remaining: number
}

const sum = (expenses: Expense[]): number =>
  expenses.reduce((total, expense) => total + expense.amountKopecks, 0)

/** Сколько потрачено по каждой категории */
export function spentByCategory(expenses: Expense[]): Record<Category, number> {
  const result = Object.fromEntries(
    CATEGORIES.map((category) => [category.id, 0]),
  ) as Record<Category, number>

  for (const expense of expenses) {
    result[expense.category] += expense.amountKopecks
  }

  return result
}

/** Категории, в которых были траты, от большей суммы к меньшей */
export function categoryTotals(expenses: Expense[]): CategoryTotal[] {
  const spent = spentByCategory(expenses)

  return CATEGORIES.map((category) => ({
    category: category.id,
    label: category.label,
    color: category.color,
    total: spent[category.id],
  }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
}

/**
 * Сравнение трат с лимитами.
 * Сначала идут категории с заданным лимитом (самые «горячие» сверху),
 * потом остальные.
 */
export function categoryLimitStatuses(expenses: Expense[], limits: Limits): LimitStatus[] {
  const spent = spentByCategory(expenses)

  return CATEGORIES.map((category) => {
    const limit = limits.byCategory[category.id] ?? null
    const amount = spent[category.id]

    return {
      category: category.id,
      label: category.label,
      color: category.color,
      spent: amount,
      limit,
      percent: limit ? amount / limit : 0,
      remaining: limit ? limit - amount : 0,
    }
  }).sort((a, b) => {
    if (a.limit === null && b.limit === null) return b.spent - a.spent
    if (a.limit === null) return 1
    if (b.limit === null) return -1
    return b.percent - a.percent
  })
}

/** Итоги по списку месяцев — для графика «по месяцам» */
export function monthlyTotals(
  expenses: Expense[],
  months: string[],
): Array<{ month: string; total: number }> {
  const byMonth = new Map(months.map((month) => [month, 0]))

  for (const expense of expenses) {
    const month = expense.date.slice(0, 7)
    if (byMonth.has(month)) {
      byMonth.set(month, (byMonth.get(month) ?? 0) + expense.amountKopecks)
    }
  }

  return months.map((month) => ({ month, total: byMonth.get(month) ?? 0 }))
}

/**
 * Прогноз трат до конца месяца по текущему темпу.
 * Считается только для текущего месяца: для прошлых месяцев «прогноз» бессмысленен.
 */
export function forecastForMonth(
  expenses: Expense[],
  month: string,
  today: Date = new Date(),
): number | null {
  if (!isSameMonth(today, month)) return null

  const elapsedDays = today.getDate()
  if (elapsedDays <= 0) return null

  // На вход может прийти полный список трат — берём только нужный месяц
  const total = sum(expenses.filter((expense) => expense.date.startsWith(month)))
  if (total === 0) return null

/** Прогноз округляем до целых рублей: копейки в прогнозе — ложная точность */
  return Math.round(((total / elapsedDays) * daysInMonth(month)) / 100) * 100
}

/** Насколько использован лимит: 0…1 и выше. null — лимит не задан */
export function limitPercent(spent: number, limit: number | null): number | null {
  if (!limit || limit <= 0) return null
  return spent / limit
}
