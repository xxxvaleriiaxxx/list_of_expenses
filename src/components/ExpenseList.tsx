import type { Category, Expense } from '../types'
import { CATEGORIES } from '../types'
import { formatMoney } from '../lib/money'

interface Props {
  expenses: Expense[]
  category: Category | 'all'
  onCategoryChange: (value: Category | 'all') => void
  onEdit: (expense: Expense) => void
  onRemove: (id: string) => void
  monthIsEmpty: boolean
  onLoadSample: () => void
}

const dayFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
})

const categoryLabel = (id: Category): string =>
  CATEGORIES.find((category) => category.id === id)?.label ?? 'Прочее'

const categoryColor = (id: Category): string =>
  CATEGORIES.find((category) => category.id === id)?.color ?? '#64748b'

export function ExpenseList({
  expenses,
  category,
  onCategoryChange,
  onEdit,
  onRemove,
  monthIsEmpty,
  onLoadSample,
}: Props) {
  return (
    <section className="card list-card">
      <div className="list-head">
        <h2>Траты</h2>

        <label className="filter">
          <span className="visually-hidden">Фильтр по категории</span>
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value as Category | 'all')}
          >
            <option value="all">Все категории</option>
            {CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {monthIsEmpty ? (
        <div className="empty">
          <p className="empty-title">В этом месяце пока пусто</p>
          <p className="empty-text">
            Добавьте первую трату через форму слева — или посмотрите, как это выглядит,
            на примерах.
          </p>
          <button className="ghost-button" onClick={onLoadSample}>
            Заполнить примерами
          </button>
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty">
          <p className="empty-title">В этой категории ничего нет</p>
          <p className="empty-text">Выберите другую категорию или «Все категории».</p>
        </div>
      ) : (
        <ul className="expense-list">
          {expenses.map((expense) => (
            <li key={expense.id} className="expense-row">
              <span className="expense-date">
                {dayFormatter.format(new Date(`${expense.date}T00:00:00`))}
              </span>

              <span
                className="category-chip"
                style={{
                  color: categoryColor(expense.category),
                  background: `${categoryColor(expense.category)}1a`,
                }}
              >
                {categoryLabel(expense.category)}
              </span>

              <span className={`expense-comment ${expense.comment ? '' : 'muted'}`}>
                {expense.comment || 'Без комментария'}
              </span>

              <span className="expense-amount">{formatMoney(expense.amountKopecks)}</span>

              <button
                className="row-action"
                onClick={() => onEdit(expense)}
                aria-label={`Изменить трату ${expense.comment || 'без комментария'}`}
                title="Изменить"
              >
                ✎
              </button>

              <button
                className="row-action danger"
                onClick={() => onRemove(expense.id)}
                aria-label={`Удалить трату ${expense.comment || 'без комментария'}`}
                title="Удалить"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
