// Справочник категорий. Цвет пригодится для полосок и значков в интерфейсе.
export const CATEGORIES = [
  { id: 'food', label: 'Еда', color: '#f97316' },
  { id: 'transport', label: 'Транспорт', color: '#3b82f6' },
  { id: 'home', label: 'Жильё', color: '#8b5cf6' },
  { id: 'fun', label: 'Развлечения', color: '#ec4899' },
  { id: 'health', label: 'Здоровье', color: '#10b981' },
  { id: 'other', label: 'Прочее', color: '#64748b' },
] as const

export type Category = (typeof CATEGORIES)[number]['id']

export interface Expense {
  id: string
  // Сумма хранится в копейках целым числом.
  // Так 0.1 + 0.2 остаётся ровно 0.3 — деньги нельзя хранить «как есть» в дробях.
  amountKopecks: number
  category: Category
  // Дата в формате 2026-10-23 (так её удобно сравнивать и хранить)
  date: string
  comment: string
}

/** Трата без id — то, что приходит из формы, когда id ещё не присвоен */
export type ExpenseDraft = Omit<Expense, 'id'>

/** Месячные лимиты: общий и по категориям. Значение null — лимит не задан. */
export interface Limits {
  total: number | null
  byCategory: Partial<Record<Category, number>>
}

export const EMPTY_LIMITS: Limits = {
  total: null,
  byCategory: {},
}

export const todayISO = (): string => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
