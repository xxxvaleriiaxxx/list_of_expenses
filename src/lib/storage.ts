import { useEffect, useState } from 'react'

/**
 * Значение, которое само сохраняется в браузере и переживает перезагрузку страницы.
 *
 * В Vue это был бы composable: const expenses = useLocalStorage('expenses', [])
 * Здесь — то же самое, только через хук.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initialValue
    } catch {
      // Если в сохранении мусор — начинаем с чистого листа, а не падаем
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Например, закончилось место или запрещено настройками браузера
    }
  }, [key, value])

  return [value, setValue] as const
}
