// Работа с месяцами. Месяц в приложении — строка вида "2026-10":
// её легко сравнивать, хранить и передавать в поле type="month".

const pad = (value: number): string => String(value).padStart(2, '0')

export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
}

/** Сдвиг месяца на delta: shiftMonth('2026-01', -1) → '2025-12' */
export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 1 + delta, 1)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

const longFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' })
const shortFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'short' })

const toDate = (month: string): Date => new Date(`${month}-01T00:00:00`)

/** "октябрь 2026 г." */
export const monthLabel = (month: string): string => longFormatter.format(toDate(month))

/** "окт" */
export const monthShortLabel = (month: string): string =>
  shortFormatter.format(toDate(month)).replace('.', '')

export function daysInMonth(month: string): number {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year, monthNumber, 0).getDate()
}

/** Последние count месяцев, включая from. От старых к новым. */
export function monthsBack(count: number, from: string = currentMonth()): string[] {
  return Array.from({ length: count }, (_, index) => shiftMonth(from, index - (count - 1)))
}

export const isSameMonth = (date: Date, month: string): boolean =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}` === month
