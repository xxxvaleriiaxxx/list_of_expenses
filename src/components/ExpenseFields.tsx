import type { Category } from '../types'
import { CATEGORIES } from '../types'

export interface ExpenseValues {
  amount: string
  category: Category
  date: string
  comment: string
}

interface Props {
  values: ExpenseValues
  onChange: (patch: Partial<ExpenseValues>) => void
  error?: string
  autoFocus?: boolean
}

/**
 * Поля траты вынесены отдельно: их используют и форма добавления,
 * и окно редактирования. Одна вёрстка — два сценария.
 */
export function ExpenseFields({ values, onChange, error, autoFocus }: Props) {
  return (
    <>
      <label className="field">
        <span>Сумма</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="1 290,50"
          value={values.amount}
          autoFocus={autoFocus}
          onChange={(event) => onChange({ amount: event.target.value })}
          aria-invalid={Boolean(error)}
        />
      </label>

      <label className="field">
        <span>Категория</span>
        <select
          value={values.category}
          onChange={(event) => onChange({ category: event.target.value as Category })}
        >
          {CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Дата</span>
        <input
          type="date"
          value={values.date}
          onChange={(event) => onChange({ date: event.target.value })}
        />
      </label>

      <label className="field">
        <span>Комментарий</span>
        <input
          type="text"
          placeholder="Например, продукты"
          value={values.comment}
          maxLength={60}
          onChange={(event) => onChange({ comment: event.target.value })}
        />
      </label>

      {error && <p className="error">{error}</p>}
    </>
  )
}
