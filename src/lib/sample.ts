import type { Expense } from '../types'

/**
 * Демонстрационные траты — чтобы пустой экран можно было «оживить» одной кнопкой.
 * Даты считаются от сегодняшнего дня, поэтому примеры всегда попадают в текущий месяц.
 */
export function sampleExpenses(): Expense[] {
  const today = new Date()

  const items: Array<[number, Expense['category'], string, number]> = [
    [890, 'food', 'Продукты', 0],
    [320, 'transport', 'Метро', 0],
    [1450, 'fun', 'Кино с друзьями', 1],
    [4200, 'home', 'Коммунальные услуги', 2],
    [670, 'food', 'Обед на работе', 3],
    [1290, 'health', 'Витамины', 4],
    [260, 'transport', 'Такси', 5],
    [2340, 'food', 'Продукты на неделю', 6],
    [990, 'fun', 'Подписка на музыку', 7],
    [560, 'other', 'Подарок', 9],
  ]

  return items.map(([rubles, category, comment, daysAgo]) => {
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)

    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return {
      id: crypto.randomUUID(),
      amountKopecks: rubles * 100,
      category,
      date: `${date.getFullYear()}-${month}-${day}`,
      comment,
    }
  })
}
