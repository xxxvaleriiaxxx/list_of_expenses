// Всё, что связано с деньгами, живёт в одном месте.
// Это ядро приложения: если тут ошибка — цифры врут везде.

/**
 * Превращает текст из поля ввода в копейки.
 * Понимает "1290", "1 290", "1290,50" и "1290.50".
 * Возвращает null, если ввести нельзя (пусто, буквы, ноль, минус).
 */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null

  const rubles = Number(cleaned)
  if (!Number.isFinite(rubles) || rubles <= 0) return null

  // Округляем, чтобы 1290.50 не превратилось в 129049.99999
  return Math.round(rubles * 100)
}

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** Копейки → "1 234 ₽" */
export function formatMoney(kopecks: number): string {
  return moneyFormatter.format(kopecks / 100)
}

/** Копейки → текст для поля ввода: 129050 → "1290,50", 2000000 → "20000" */
export function amountToInput(kopecks: number): string {
  const rubles = kopecks / 100
  return Number.isInteger(rubles) ? String(rubles) : rubles.toFixed(2).replace('.', ',')
}
